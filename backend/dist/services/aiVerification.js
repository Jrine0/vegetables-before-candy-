"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiVerificationService = exports.AIVerificationService = void 0;
const openai_1 = __importDefault(require("openai"));
const sharp_1 = __importDefault(require("sharp"));
const pdf_parse_1 = __importDefault(require("pdf-parse"));
const tesseract_js_1 = require("tesseract.js");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const node_cache_1 = __importDefault(require("node-cache"));
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY || 'demo-key',
});
const cache = new node_cache_1.default({ stdTTL: 3600 });
class AIVerificationService {
    async convertToImage(filePath) {
        const ext = path_1.default.extname(filePath).toLowerCase();
        if (['.jpg', '.jpeg', '.png'].includes(ext)) {
            const buffer = await (0, sharp_1.default)(filePath)
                .resize(1920, 1920, { fit: 'inside', withoutEnlargement: true })
                .jpeg({ quality: 90 })
                .toBuffer();
            const optimizedPath = filePath.replace(ext, '_optimized.jpg');
            await fs_1.default.promises.writeFile(optimizedPath, buffer);
            return optimizedPath;
        }
        if (ext === '.pdf') {
            const pdfBuffer = await fs_1.default.promises.readFile(filePath);
            const data = await (0, pdf_parse_1.default)(pdfBuffer);
            const canvas = (0, sharp_1.default)({
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
    async extractTextWithOCR(imagePath) {
        const cacheKey = `ocr_${path_1.default.basename(imagePath)}`;
        const cached = cache.get(cacheKey);
        if (cached)
            return cached;
        const worker = await (0, tesseract_js_1.createWorker)('eng');
        const { data: { text } } = await worker.recognize(imagePath);
        await worker.terminate();
        cache.set(cacheKey, text);
        return text;
    }
    async analyzeWithGPT4Vision(imagePath, documentType) {
        try {
            const imageBuffer = await fs_1.default.promises.readFile(imagePath);
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
        }
        catch (error) {
            console.error('GPT-4 Vision analysis failed:', error);
            return this.analyzeWithTextFallback(imagePath, documentType);
        }
    }
    async analyzeWithTextFallback(imagePath, documentType) {
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
        }
        catch {
            return { error: 'Failed to parse AI response' };
        }
    }
    getAnalysisPrompt(documentType) {
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
    async detectFraud(analysis, filePath) {
        const fraudIndicators = [];
        try {
            const stats = await fs_1.default.promises.stat(filePath);
            const now = new Date();
            const fileAge = now.getTime() - stats.mtime.getTime();
            if (fileAge < 60000) {
                fraudIndicators.push('Document created very recently');
            }
        }
        catch (error) {
            fraudIndicators.push('Unable to verify file metadata');
        }
        if (analysis.fraudIndicators) {
            fraudIndicators.push(...analysis.fraudIndicators);
        }
        if (analysis.extractedData?.gpa > 4.0) {
            fraudIndicators.push('GPA exceeds typical 4.0 scale');
        }
        return fraudIndicators;
    }
    async analyzeDocument(filePath, documentType, expectedStudent) {
        try {
            const imagePath = await this.convertToImage(filePath);
            const aiAnalysis = await this.analyzeWithGPT4Vision(imagePath, documentType);
            const fraudIndicators = await this.detectFraud(aiAnalysis, filePath);
            let confidence = aiAnalysis.confidence || 0;
            confidence -= fraudIndicators.length * 15;
            confidence = Math.max(0, Math.min(100, confidence));
            let recommendedAction;
            if (fraudIndicators.length > 3 || confidence < 30) {
                recommendedAction = 'reject';
            }
            else if (fraudIndicators.length > 1 || confidence < 70) {
                recommendedAction = 'manual_review';
            }
            else {
                recommendedAction = 'auto_approve';
            }
            if (imagePath !== filePath) {
                await fs_1.default.promises.unlink(imagePath).catch(() => { });
            }
            return {
                isValid: aiAnalysis.isValid && fraudIndicators.length < 3,
                confidence,
                extractedData: aiAnalysis.extractedData || {},
                fraudIndicators,
                recommendedAction,
                aiAnalysis: aiAnalysis.aiAnalysis || 'AI analysis completed'
            };
        }
        catch (error) {
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
    async batchAnalyze(documents) {
        const results = await Promise.all(documents.map(doc => this.analyzeDocument(doc.path, doc.type)));
        return results;
    }
    async generateVerificationReport(analysis, studentInfo) {
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
exports.AIVerificationService = AIVerificationService;
exports.aiVerificationService = new AIVerificationService();
