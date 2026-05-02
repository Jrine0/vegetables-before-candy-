import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  UserIcon,
  LinkIcon,
  CodeBracketIcon,
  DocumentCheckIcon,
  SparklesIcon,
  DevicePhoneMobileIcon,
  CameraIcon,
  CubeIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface LinkedInProfile {
  name: string;
  headline: string;
  experience: {
    title: string;
    company: string;
    duration: string;
    skills: string[];
  }[];
  education: {
    school: string;
    degree: string;
    gpa?: number;
  }[];
  certifications: string[];
}

interface GitHubStats {
  username: string;
  repositories: number;
  stars: number;
  commits: number;
  languages: { name: string; percentage: number }[];
  contributions: {
    total: number;
    streak: number;
    topProjects: string[];
  };
}

const SocialIntegrations: React.FC = () => {
  const [linkedInConnected, setLinkedInConnected] = useState(false);
  const [githubConnected, setGithubConnected] = useState(false);
  const [arEnabled, setArEnabled] = useState(false);
  const [linkedInData, setLinkedInData] = useState<LinkedInProfile | null>(null);
  const [githubData, setGithubData] = useState<GitHubStats | null>(null);
  const [loading, setLoading] = useState({ linkedin: false, github: false, ar: false });

  const connectLinkedIn = async () => {
    setLoading(prev => ({ ...prev, linkedin: true }));
    
    try {
      // Mock LinkedIn OAuth flow
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock LinkedIn data import
      const mockLinkedInData: LinkedInProfile = {
        name: 'Sarah Chen',
        headline: 'Computer Science PhD Student | AI Researcher | Academic Excellence',
        experience: [
          {
            title: 'Research Assistant',
            company: 'MIT AI Lab',
            duration: '2023 - Present',
            skills: ['Machine Learning', 'Python', 'TensorFlow', 'Research']
          },
          {
            title: 'Software Engineering Intern',
            company: 'Google',
            duration: 'Summer 2022',
            skills: ['JavaScript', 'React', 'Node.js', 'Cloud Computing']
          }
        ],
        education: [
          {
            school: 'MIT',
            degree: 'PhD Computer Science',
            gpa: 3.95
          },
          {
            school: 'Stanford University',
            degree: 'BS Computer Science',
            gpa: 3.89
          }
        ],
        certifications: [
          'AWS Certified Solutions Architect',
          'Google Cloud Professional ML Engineer',
          'Microsoft Azure AI Engineer'
        ]
      };

      setLinkedInData(mockLinkedInData);
      setLinkedInConnected(true);
      
      // Auto-generate achievements from LinkedIn data
      const generatedAchievements = [
        {
          title: 'Academic Excellence - MIT PhD',
          type: 'gpa',
          gpa: mockLinkedInData.education[0].gpa,
          description: 'Maintaining exceptional GPA in PhD program at MIT'
        },
        {
          title: 'Professional Certifications',
          type: 'research',
          description: 'Earned multiple industry certifications in AI and Cloud Computing'
        },
        {
          title: 'Research Leadership at MIT AI Lab',
          type: 'leadership',
          description: 'Leading research projects and mentoring junior students'
        }
      ];

      toast.success(`✨ LinkedIn connected! Generated ${generatedAchievements.length} potential achievements`);
      
    } catch (error) {
      toast.error('Failed to connect LinkedIn');
    } finally {
      setLoading(prev => ({ ...prev, linkedin: false }));
    }
  };

  const connectGitHub = async () => {
    setLoading(prev => ({ ...prev, github: true }));
    
    try {
      // Mock GitHub API integration
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockGitHubData: GitHubStats = {
        username: 'sarah-chen-dev',
        repositories: 47,
        stars: 1234,
        commits: 2847,
        languages: [
          { name: 'Python', percentage: 45 },
          { name: 'JavaScript', percentage: 25 },
          { name: 'TypeScript', percentage: 15 },
          { name: 'C++', percentage: 10 },
          { name: 'Other', percentage: 5 }
        ],
        contributions: {
          total: 2847,
          streak: 127,
          topProjects: ['ml-research-toolkit', 'vegetables-before-candy-platform', 'ai-paper-generator']
        }
      };

      setGithubData(mockGitHubData);
      setGithubConnected(true);
      
      // Auto-generate achievements from GitHub data
      const codingAchievements = [
        {
          title: 'Prolific Open Source Contributor',
          type: 'research',
          description: `${mockGitHubData.commits} commits across ${mockGitHubData.repositories} repositories`
        },
        {
          title: 'Multi-Language Programming Expert',
          type: 'research',
          description: 'Proficient in Python, JavaScript, TypeScript, and C++'
        },
        {
          title: 'Community Impact Leader',
          type: 'leadership',
          description: `${mockGitHubData.stars} stars earned across projects, demonstrating community value`
        }
      ];

      toast.success(`🚀 GitHub connected! Generated ${codingAchievements.length} coding achievements`);
      
    } catch (error) {
      toast.error('Failed to connect GitHub');
    } finally {
      setLoading(prev => ({ ...prev, github: false }));
    }
  };

  const enableARViewer = async () => {
    setLoading(prev => ({ ...prev, ar: true }));
    
    try {
      // Check for AR support
      const isARSupported = 'xr' in navigator || 'mediaDevices' in navigator;
      
      if (!isARSupported) {
        toast.error('AR not supported on this device');
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setArEnabled(true);
      toast.success('📱 AR Portfolio Viewer enabled! Point your camera to view NFTs in 3D space');
      
    } catch (error) {
      toast.error('Failed to enable AR viewer');
    } finally {
      setLoading(prev => ({ ...prev, ar: false }));
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          🔗 Social & Professional Integrations
        </h2>
        <p className="text-lg text-gray-600">
          Connect your professional profiles to automatically generate achievements
        </p>
      </div>

      {/* Integration Cards */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* LinkedIn Integration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <UserIcon className="h-8 w-8 text-blue-600" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">LinkedIn</h3>
                <p className="text-sm text-gray-600">Import professional achievements</p>
              </div>
            </div>
            <div className={`w-3 h-3 rounded-full ${linkedInConnected ? 'bg-green-500' : 'bg-gray-300'}`}></div>
          </div>

          {!linkedInConnected ? (
            <button
              onClick={connectLinkedIn}
              disabled={loading.linkedin}
              className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
            >
              {loading.linkedin ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <LinkIcon className="h-5 w-5 mr-2" />
                  Connect LinkedIn
                </>
              )}
            </button>
          ) : linkedInData && (
            <div className="space-y-3">
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="font-medium text-gray-900">{linkedInData.name}</div>
                <div className="text-sm text-gray-600">{linkedInData.headline}</div>
              </div>
              
              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span>Experience:</span>
                  <span className="font-medium">{linkedInData.experience.length} roles</span>
                </div>
                <div className="flex justify-between">
                  <span>Education:</span>
                  <span className="font-medium">{linkedInData.education.length} degrees</span>
                </div>
                <div className="flex justify-between">
                  <span>Certifications:</span>
                  <span className="font-medium">{linkedInData.certifications.length} certs</span>
                </div>
              </div>

              <div className="pt-2 border-t">
                <div className="flex items-center text-xs text-green-600">
                  <DocumentCheckIcon className="h-4 w-4 mr-1" />
                  <span>3 achievements generated</span>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* GitHub Integration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <CodeBracketIcon className="h-8 w-8 text-gray-900" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">GitHub</h3>
                <p className="text-sm text-gray-600">Analyze coding contributions</p>
              </div>
            </div>
            <div className={`w-3 h-3 rounded-full ${githubConnected ? 'bg-green-500' : 'bg-gray-300'}`}></div>
          </div>

          {!githubConnected ? (
            <button
              onClick={connectGitHub}
              disabled={loading.github}
              className="w-full bg-gray-900 text-white px-4 py-3 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center"
            >
              {loading.github ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <CodeBracketIcon className="h-5 w-5 mr-2" />
                  Connect GitHub
                </>
              )}
            </button>
          ) : githubData && (
            <div className="space-y-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="font-medium text-gray-900">@{githubData.username}</div>
                <div className="text-sm text-gray-600">{githubData.contributions.total} total contributions</div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-purple-50 rounded p-2">
                  <div className="font-medium text-purple-900">{githubData.repositories}</div>
                  <div className="text-purple-600">Repositories</div>
                </div>
                <div className="bg-yellow-50 rounded p-2">
                  <div className="font-medium text-yellow-900">{githubData.stars}</div>
                  <div className="text-yellow-600">Stars</div>
                </div>
              </div>

              <div className="pt-2 border-t">
                <div className="flex items-center text-xs text-green-600">
                  <DocumentCheckIcon className="h-4 w-4 mr-1" />
                  <span>3 coding achievements generated</span>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* AR Portfolio Viewer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <DevicePhoneMobileIcon className="h-8 w-8 text-purple-600" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">AR Portfolio</h3>
                <p className="text-sm text-gray-600">View NFTs in augmented reality</p>
              </div>
            </div>
            <div className={`w-3 h-3 rounded-full ${arEnabled ? 'bg-green-500' : 'bg-gray-300'}`}></div>
          </div>

          {!arEnabled ? (
            <div className="space-y-3">
              <button
                onClick={enableARViewer}
                disabled={loading.ar}
                className="w-full bg-purple-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center"
              >
                {loading.ar ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <CameraIcon className="h-5 w-5 mr-2" />
                    Enable AR Viewer
                  </>
                )}
              </button>
              
              <div className="text-xs text-gray-500 text-center">
                📱 Compatible with iOS Safari & Android Chrome
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="bg-purple-50 rounded-lg p-3">
                <div className="font-medium text-gray-900">AR Viewer Active</div>
                <div className="text-sm text-gray-600">Point camera at flat surface</div>
              </div>
              
              <div className="space-y-2">
                <button className="w-full bg-purple-100 text-purple-700 px-3 py-2 rounded font-medium hover:bg-purple-200 text-sm flex items-center justify-center">
                  <CubeIcon className="h-4 w-4 mr-2" />
                  View NFTs in AR
                </button>
                
                <button className="w-full bg-gray-100 text-gray-700 px-3 py-2 rounded font-medium hover:bg-gray-200 text-sm flex items-center justify-center">
                  <SparklesIcon className="h-4 w-4 mr-2" />
                  AR Achievement Showcase
                </button>
              </div>

              <div className="pt-2 border-t">
                <div className="flex items-center text-xs text-purple-600">
                  <DevicePhoneMobileIcon className="h-4 w-4 mr-1" />
                  <span>Mobile AR experience ready</span>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Integration Benefits */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Integration Benefits</h3>
        
        <div className="grid gap-4 md:grid-cols-3">
          <div className="flex items-start space-x-3">
            <DocumentCheckIcon className="h-6 w-6 text-green-600 mt-1" />
            <div>
              <div className="font-medium text-gray-900">Auto-Generate Achievements</div>
              <div className="text-sm text-gray-600">Automatically create achievements from your professional profiles</div>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <SparklesIcon className="h-6 w-6 text-blue-600 mt-1" />
            <div>
              <div className="font-medium text-gray-900">AI-Powered Analysis</div>
              <div className="text-sm text-gray-600">Get insights on your skills and career trajectory</div>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <CubeIcon className="h-6 w-6 text-purple-600 mt-1" />
            <div>
              <div className="font-medium text-gray-900">Immersive AR Experience</div>
              <div className="text-sm text-gray-600">Showcase your NFT achievements in augmented reality</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialIntegrations;