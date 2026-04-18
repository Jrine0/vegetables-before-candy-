import OpenAI from 'openai';
import sharp from 'sharp';
import pdfParse from 'pdf-parse';
import { createWorker } from 'tesseract.js';
import fs from 'fs';
import path from 'path';
import NodeCache from 'node-cache';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'demo-key',
});

const cache = new NodeCache({ stdTTL: 3600 }); // 1 hour cache

interface DocumentAnalysisResult {
  isValid: boolean;
  confidence: number;
  extractedData: {
    studentName?: string;
    university?: string;
    gpa?: number;
    graduationDate?: string;
    degree?: string;
    achievements?: string[];
  };
  fraudIndicators: string[];
  recommendedAction: 'auto_approve' | 'manual_review' | 'reject';
  aiAnalysis: string;
}

interface TranscriptAnalysis {
  gpa: number | null;
  coursework: string[];
  honors: string[];
  degreeType: string | null;
  graduationDate: string | null;
}

export class AIVerificationService {
  private async convertToImage(filePath: string): Promise<string> {
    const ext = path.extname(filePath).toLowerCase();

    if (['.jpg', '.jpeg', '.png'].includes(ext)) {
      // Optimize image for AI analysis
      const buffer = await sharp(filePath)
        .resize(1920, 1920, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 90 })
        .toBuffer();

      const optimizedPath = filePath.replace(ext, '_optimized.jpg');
      await fs.promises.writeFile(optimizedPath, buffer);
      return optimizedPath;
    }

    if (ext === '.pdf') {
      // Convert first page of PDF to image
      const pdfBuffer = await fs.promises.readFile(filePath);
      const data = await pdfParse(pdfBuffer);

      // For demo purposes, create a text-based image representation
      // In production, use pdf2pic or similar library
      const canvas = sharp({
        create: {
          width: 1200,
          height: 1600,
          channels: 3,
          background: { r: 255, g: 255, b: 255 }
        }
      });

      const imagePath = filePath.replace('.pdf', '_converted.jpg');
      await canvas.jpeg().toFile(imagePath);
      return imagePath;
    }

    throw new Error('Unsupported file format');
  }

  private async extractTextWithOCR(imagePath: string): Promise<string> {
    const cacheKey = `ocr_${path.basename(imagePath)}`;
    const cached = cache.get<string>(cacheKey);
    if (cached) return cached;

    const worker = await createWorker('eng');

    const { data: { text } } = await worker.recognize(imagePath);
    await worker.terminate();

    cache.set(cacheKey, text);
    return text;
  }

  private async analyzeWithGPT4Vision(imagePath: string, documentType: string): Promise<any> {
    try {
      // Convert image to base64
      const imageBuffer = await fs.promises.readFile(imagePath);
      const base64Image = imageBuffer.toString('base64');

      const prompt = this.getAnalysisPrompt(documentType);

      const response = await openai.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                  detail: "high"
                }
              }
            ]
          }
        ],
        max_tokens: 1000
      });

      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error) {
      console.error('GPT-4 Vision analysis failed:', error);
      // Fallback to text analysis
      return this.analyzeWithTextFallback(imagePath, documentType);
    }
  }

  private async analyzeWithTextFallback(imagePath: string, documentType: string): Promise<any> {
    const extractedText = await this.extractTextWithOCR(imagePath);

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert academic document analyzer. Analyze the following text extracted from a document and return a JSON response."
        },
        {
          role: "user",
          content: `${this.getAnalysisPrompt(documentType)}\n\nExtracted text:\n${extractedText}`
        }
      ],
      max_tokens: 1000
    });

    try {
      return JSON.parse(response.choices[0].message.content || '{}');
    } catch {
      return { error: 'Failed to parse AI response' };
    }
  }

  private getAnalysisPrompt(documentType: string): string {
    const basePrompt = `Analyze this ${documentType} document and return a JSON response with the following structure:
{
  "isValid": boolean,
  "confidence": number (0-100),
  "extractedData": {
    "studentName": string,
    "university": string,
    "gpa": number,
    "graduationDate": string,
    "degree": string,
    "achievements": [string]
  },
  "fraudIndicators": [string],
  "recommendedAction": "auto_approve" | "manual_review" | "reject",
  "aiAnalysis": string
}`;

    switch (documentType) {
      case 'transcript':
        return `${basePrompt}

Focus on:
- Official university letterhead and seals
- Consistent formatting and fonts
- Valid GPA calculation
- Course grades and credit hours
- Graduation status
- Signs of digital manipulation

Fraud indicators to check:
- Inconsistent fonts or formatting
- Pixelation around grades
- Missing official seals
- Unrealistic GPAs (>4.0 without explanation)
- Misaligned text`;

      case 'research':
        return `${basePrompt}

Focus on:
- Publication details (journal, conference)
- Author information and affiliations
- DOI or publication identifiers
- Peer review status
- Citation format

Fraud indicators:
- Fake journal names
- Missing DOIs
- Suspicious publication dates
- Non-existent venues`;

      case 'leadership':
        return `${basePrompt}

Focus on:
- Official organization letterhead
- Specific role titles and dates
- Verification signatures
- Contact information
- Detailed responsibilities

Fraud indicators:
- Generic templates
- Missing signatures
- Vague descriptions
- Non-verifiable organizations`;

      default:
        return basePrompt;
    }
  }

  private async detectFraud(analysis: any, filePath: string): Promise<string[]> {
    const fraudIndicators: string[] = [];

    // Check file metadata for manipulation signs
    try {
      const stats = await fs.promises.stat(filePath);
      const now = new Date();
      const fileAge = now.getTime() - stats.mtime.getTime();

      // File created very recently might be suspicious
      if (fileAge < 60000) { // Less than 1 minute old
        fraudIndicators.push('Document created very recently');
      }
    } catch (error) {
      fraudIndicators.push('Unable to verify file metadata');
    }

    // Add AI-detected fraud indicators
    if (analysis.fraudIndicators) {
      fraudIndicators.push(...analysis.fraudIndicators);
    }

    // Check for unrealistic data
    if (analysis.extractedData?.gpa > 4.0) {
      fraudIndicators.push('GPA exceeds typical 4.0 scale');
    }

    return fraudIndicators;
  }

  public async analyzeDocument(
    filePath: string,
    documentType: 'transcript' | 'research' | 'leadership',
    expectedStudent?: string
  ): Promise<DocumentAnalysisResult> {
    try {
      // Convert document to analyzable format
      const imagePath = await this.convertToImage(filePath);

      // Analyze with AI
      const aiAnalysis = await this.analyzeWithGPT4Vision(imagePath, documentType);

      // Detect fraud indicators
      const fraudIndicators = await this.detectFraud(aiAnalysis, filePath);

      // Calculate overall confidence
      let confidence = aiAnalysis.confidence || 0;

      // Reduce confidence based on fraud indicators
      confidence -= fraudIndicators.length * 15;
      confidence = Math.max(0, Math.min(100, confidence));

      // Determine recommended action
      let recommendedAction: 'auto_approve' | 'manual_review' | 'reject';

      if (fraudIndicators.length > 3 || confidence < 30) {
        recommendedAction = 'reject';
      } else if (fraudIndicators.length > 1 || confidence < 70) {
        recommendedAction = 'manual_review';
      } else {
        recommendedAction = 'auto_approve';
      }

      // Clean up temporary files
      if (imagePath !== filePath) {
        await fs.promises.unlink(imagePath).catch(() => { });
      }

      return {
        isValid: aiAnalysis.isValid && fraudIndicators.length < 3,
        confidence,
        extractedData: aiAnalysis.extractedData || {},
        fraudIndicators,
        recommendedAction,
        aiAnalysis: aiAnalysis.aiAnalysis || 'AI analysis completed'
      };

    } catch (error) {
      console.error('Document analysis failed:', error);

      return {
        isValid: false,
        confidence: 0,
        extractedData: {},
        fraudIndicators: ['Analysis failed - manual review required'],
        recommendedAction: 'manual_review',
        aiAnalysis: 'Automated analysis failed, manual review needed'
      };
    }
  }

  public async batchAnalyze(
    documents: Array<{ path: string; type: 'transcript' | 'research' | 'leadership' }>
  ): Promise<DocumentAnalysisResult[]> {
    const results = await Promise.all(
      documents.map(doc => this.analyzeDocument(doc.path, doc.type))
    );

    return results;
  }

  public async generateVerificationReport(
    analysis: DocumentAnalysisResult,
    studentInfo: any
  ): Promise<string> {
    const prompt = `Generate a detailed verification report for an academic document analysis.

Analysis Results:
- Validity: ${analysis.isValid}
- Confidence: ${analysis.confidence}%
- Extracted Data: ${JSON.stringify(analysis.extractedData)}
- Fraud Indicators: ${analysis.fraudIndicators.join(', ')}
- Recommended Action: ${analysis.recommendedAction}

Student Information:
${JSON.stringify(studentInfo)}

Please provide a comprehensive report explaining the analysis results, potential concerns, and recommended next steps.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are an expert academic verification specialist." },
        { role: "user", content: prompt }
      ],
      max_tokens: 800
    });

    return response.choices[0].message.content || 'Report generation failed';
  }
}

export const aiVerificationService = new AIVerificationService();