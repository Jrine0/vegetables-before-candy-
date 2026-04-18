import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import {
  SparklesIcon,
  BriefcaseIcon,
  ChartBarIcon,
  LightBulbIcon,
  ArrowTrendingUpIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  ClockIcon,
  StarIcon,
  UserGroupIcon,
  AcademicCapIcon,
  ComputerDesktopIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface CareerMatch {
  id: string;
  title: string;
  company: string;
  industry: string;
  location: string;
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  matchScore: number;
  description: string;
  requirements: string[];
  benefits: string[];
  type: 'full-time' | 'part-time' | 'internship' | 'contract';
  experience: 'entry' | 'mid' | 'senior';
  skills: string[];
  education: string;
  aiAnalysis: {
    strengthMatch: string[];
    skillGaps: string[];
    careerGrowth: string;
    recommendation: string;
  };
}

interface SkillAnalysis {
  technical: {
    name: string;
    level: number;
    inDemand: boolean;
  }[];
  soft: {
    name: string;
    level: number;
    importance: number;
  }[];
  gaps: {
    skill: string;
    priority: 'high' | 'medium' | 'low';
    timeToLearn: string;
    resources: string[];
  }[];
}

const CareerMatchmaking: React.FC = () => {
  const { user } = useAuth();
  const [matches, setMatches] = useState<CareerMatch[]>([]);
  const [skillAnalysis, setSkillAnalysis] = useState<SkillAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<CareerMatch | null>(null);
  const [preferences, setPreferences] = useState({
    industries: [] as string[],
    locations: [] as string[],
    salaryRange: { min: 0, max: 200000 },
    jobTypes: [] as string[],
    experience: 'entry' as 'entry' | 'mid' | 'senior'
  });

  useEffect(() => {
    if (user) {
      runAIAnalysis();
    }
  }, [user]);

  const runAIAnalysis = async () => {
    setAnalyzing(true);
    
    try {
      // Simulate AI analysis with realistic delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock skill analysis based on user achievements
      const mockSkillAnalysis: SkillAnalysis = {
        technical: [
          { name: 'Python Programming', level: 85, inDemand: true },
          { name: 'Data Analysis', level: 78, inDemand: true },
          { name: 'Machine Learning', level: 65, inDemand: true },
          { name: 'JavaScript', level: 70, inDemand: true },
          { name: 'SQL', level: 82, inDemand: true },
          { name: 'React', level: 75, inDemand: true }
        ],
        soft: [
          { name: 'Leadership', level: 88, importance: 9 },
          { name: 'Communication', level: 85, importance: 9 },
          { name: 'Problem Solving', level: 90, importance: 8 },
          { name: 'Team Collaboration', level: 82, importance: 8 },
          { name: 'Project Management', level: 75, importance: 7 }
        ],
        gaps: [
          {
            skill: 'Cloud Computing (AWS/Azure)',
            priority: 'high',
            timeToLearn: '3-6 months',
            resources: ['AWS Training', 'Coursera Cloud Architecture', 'Practice Labs']
          },
          {
            skill: 'Advanced Statistics',
            priority: 'medium',
            timeToLearn: '2-4 months',
            resources: ['Khan Academy Statistics', 'StatQuest YouTube', 'R Programming Course']
          },
          {
            skill: 'Mobile Development',
            priority: 'low',
            timeToLearn: '4-8 months',
            resources: ['React Native Tutorial', 'Flutter Documentation', 'Mobile Dev Bootcamp']
          }
        ]
      };

      // Mock career matches with AI-powered recommendations
      const mockMatches: CareerMatch[] = [
        {
          id: '1',
          title: 'Data Scientist - AI Research',
          company: 'Google',
          industry: 'Technology',
          location: 'Mountain View, CA',
          salary: { min: 120000, max: 180000, currency: 'USD' },
          matchScore: 94,
          description: 'Join our AI research team to develop cutting-edge machine learning models that impact billions of users.',
          requirements: ['PhD in Computer Science or related field', '3+ years ML experience', 'Python expertise'],
          benefits: ['Comprehensive health coverage', 'Stock options', 'Learning stipend', 'Flexible work'],
          type: 'full-time',
          experience: 'mid',
          skills: ['Python', 'TensorFlow', 'Statistics', 'Research'],
          education: 'PhD preferred',
          aiAnalysis: {
            strengthMatch: ['Strong academic background', 'Research experience', 'Python proficiency'],
            skillGaps: ['Need more TensorFlow experience', 'PhD requirement'],
            careerGrowth: 'Excellent growth potential in AI research with path to Staff/Principal roles',
            recommendation: 'Perfect match for your academic background. Consider getting TensorFlow certification.'
          }
        },
        {
          id: '2',
          title: 'Software Engineer - Frontend',
          company: 'Meta',
          industry: 'Social Media',
          location: 'Menlo Park, CA',
          salary: { min: 130000, max: 200000, currency: 'USD' },
          matchScore: 87,
          description: 'Build the future of social connection with React and modern web technologies.',
          requirements: ['BS in CS', '2+ years React experience', 'Strong JavaScript skills'],
          benefits: ['Top-tier compensation', 'Meta stock', 'Gym membership', 'Free meals'],
          type: 'full-time',
          experience: 'mid',
          skills: ['React', 'JavaScript', 'CSS', 'Node.js'],
          education: 'BS/MS in Computer Science',
          aiAnalysis: {
            strengthMatch: ['React experience', 'Leadership skills', 'Problem-solving ability'],
            skillGaps: ['Could improve CSS skills', 'More React ecosystem knowledge'],
            careerGrowth: 'Strong career progression from E4 to E7+ levels with significant compensation growth',
            recommendation: 'Great fit for your technical skills. Focus on system design interview prep.'
          }
        },
        {
          id: '3',
          title: 'Research Scientist Intern',
          company: 'Microsoft Research',
          industry: 'Technology Research',
          location: 'Redmond, WA',
          salary: { min: 7000, max: 10000, currency: 'USD' },
          matchScore: 91,
          description: 'Summer internship opportunity to work on groundbreaking AI and ML research projects.',
          requirements: ['Currently pursuing PhD', 'Strong publication record', 'ML expertise'],
          benefits: ['Mentorship from top researchers', 'Publication opportunities', 'Full-time conversion'],
          type: 'internship',
          experience: 'entry',
          skills: ['Machine Learning', 'Python', 'Research Methodology'],
          education: 'PhD in progress',
          aiAnalysis: {
            strengthMatch: ['Academic excellence', 'Research background', 'Strong GPA'],
            skillGaps: ['Need more publications', 'Industry research experience'],
            careerGrowth: 'Excellent stepping stone to full-time research roles or academia',
            recommendation: 'Highly recommended internship that aligns perfectly with your academic trajectory.'
          }
        },
        {
          id: '4',
          title: 'Product Manager - AI/ML',
          company: 'OpenAI',
          industry: 'Artificial Intelligence',
          location: 'San Francisco, CA',
          salary: { min: 150000, max: 250000, currency: 'USD' },
          matchScore: 82,
          description: 'Lead product strategy for next-generation AI products that shape the future of technology.',
          requirements: ['5+ years product management', 'Technical background', 'AI/ML knowledge'],
          benefits: ['Equity in cutting-edge AI company', 'Work with world-class team', 'Shape AI future'],
          type: 'full-time',
          experience: 'senior',
          skills: ['Product Strategy', 'AI/ML', 'Leadership', 'Communication'],
          education: 'BS/MS in technical field',
          aiAnalysis: {
            strengthMatch: ['Leadership experience', 'Technical background', 'Communication skills'],
            skillGaps: ['Need product management experience', 'Industry experience'],
            careerGrowth: 'High growth potential in rapidly expanding AI industry',
            recommendation: 'Consider transitioning through APM programs or smaller PM roles first.'
          }
        }
      ];

      setSkillAnalysis(mockSkillAnalysis);
      setMatches(mockMatches);
      
      toast.success('🤖 AI career analysis complete!');
      
    } catch (error) {
      console.error('AI analysis failed:', error);
      toast.error('Failed to run AI career analysis');
    } finally {
      setAnalyzing(false);
    }
  };

  const getMatchColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 80) return 'text-blue-600 bg-blue-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (analyzing) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 mx-auto mb-6"
          >
            <SparklesIcon className="w-full h-full text-primary-600" />
          </motion.div>
          
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            🤖 AI Career Analysis in Progress
          </h3>
          
          <div className="space-y-3 max-w-md mx-auto">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 3 }}
              className="h-2 bg-primary-600 rounded"
            ></motion.div>
            
            <div className="space-y-2 text-sm text-gray-600">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                📊 Analyzing your achievements and skills...
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
              >
                🔍 Matching you with relevant opportunities...
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.5 }}
              >
                💡 Generating personalized recommendations...
              </motion.p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          🤖 AI-Powered Career Matchmaking
        </h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Our advanced AI analyzes your achievements, skills, and preferences to find your perfect career opportunities
        </p>
        
        <button
          onClick={runAIAnalysis}
          disabled={analyzing}
          className="mt-4 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
        >
          <SparklesIcon className="h-5 w-5 mr-2" />
          {analyzing ? 'Analyzing...' : 'Refresh Analysis'}
        </button>
      </div>

      {skillAnalysis && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Skill Analysis */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <ChartBarIcon className="h-6 w-6 mr-2 text-primary-600" />
              Skill Analysis
            </h3>
            
            <div className="space-y-6">
              {/* Technical Skills */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Technical Skills</h4>
                <div className="space-y-2">
                  {skillAnalysis.technical.map((skill, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{skill.name}</span>
                        {skill.inDemand && (
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                            In Demand
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-primary-600 h-2 rounded-full" 
                            style={{width: `${skill.level}%`}}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{skill.level}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Soft Skills */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Soft Skills</h4>
                <div className="grid grid-cols-2 gap-2">
                  {skillAnalysis.soft.map((skill, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{skill.name}</span>
                        <span className="text-xs text-gray-600">{skill.level}%</span>
                      </div>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon
                            key={i}
                            className={`h-3 w-3 ${
                              i < Math.floor(skill.importance / 2) 
                                ? 'text-yellow-400 fill-current' 
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Skill Gaps */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <LightBulbIcon className="h-6 w-6 mr-2 text-yellow-600" />
              Recommended Skills to Learn
            </h3>
            
            <div className="space-y-4">
              {skillAnalysis.gaps.map((gap, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{gap.skill}</h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(gap.priority)}`}>
                      {gap.priority} priority
                    </span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    <span>{gap.timeToLearn}</span>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">Learning Resources:</p>
                    {gap.resources.map((resource, i) => (
                      <span key={i} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-2">
                        {resource}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Career Matches */}
      {matches.length > 0 && (
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <BriefcaseIcon className="h-7 w-7 mr-2 text-primary-600" />
            Recommended Opportunities
          </h3>
          
          <div className="grid gap-6 lg:grid-cols-2">
            {matches.map((match, index) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow overflow-hidden"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-gray-900 mb-1">
                        {match.title}
                      </h4>
                      <p className="text-gray-600 mb-2">{match.company} • {match.industry}</p>
                      <div className="flex items-center text-sm text-gray-500 space-x-4">
                        <div className="flex items-center">
                          <MapPinIcon className="h-4 w-4 mr-1" />
                          {match.location}
                        </div>
                        <div className="flex items-center">
                          <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                          ${match.salary.min.toLocaleString()} - ${match.salary.max.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getMatchColor(match.matchScore)}`}>
                      {match.matchScore}% match
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4">{match.description}</p>

                  {/* Skills */}
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-900 mb-2">Required Skills:</p>
                    <div className="flex flex-wrap gap-1">
                      {match.skills.map((skill, i) => (
                        <span key={i} className="bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* AI Analysis Preview */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-4">
                    <div className="flex items-start space-x-2">
                      <SparklesIcon className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 mb-1">AI Recommendation:</p>
                        <p className="text-sm text-gray-600">{match.aiAnalysis.recommendation}</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setSelectedMatch(match)}
                      className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors text-center text-sm"
                    >
                      View Details
                    </button>
                    <button className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors text-sm">
                      Save
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Match Modal */}
      <AnimatePresence>
        {selectedMatch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 overflow-y-auto"
          >
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full"
              >
                <div className="bg-white px-6 py-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-gray-900">
                      {selectedMatch.title}
                    </h3>
                    <button
                      onClick={() => setSelectedMatch(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="grid gap-6 lg:grid-cols-2">
                    {/* Job Details */}
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Company & Role</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Company:</span>
                            <span className="font-medium">{selectedMatch.company}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Industry:</span>
                            <span className="font-medium">{selectedMatch.industry}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Type:</span>
                            <span className="font-medium capitalize">{selectedMatch.type}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Experience:</span>
                            <span className="font-medium capitalize">{selectedMatch.experience}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Requirements</h4>
                        <ul className="text-sm space-y-1">
                          {selectedMatch.requirements.map((req, i) => (
                            <li key={i} className="flex items-start">
                              <span className="text-green-600 mr-2">•</span>
                              {req}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Benefits</h4>
                        <ul className="text-sm space-y-1">
                          {selectedMatch.benefits.map((benefit, i) => (
                            <li key={i} className="flex items-start">
                              <span className="text-blue-600 mr-2">•</span>
                              {benefit}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* AI Analysis */}
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6">
                      <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                        <SparklesIcon className="h-5 w-5 mr-2 text-blue-600" />
                        AI Career Analysis
                      </h4>

                      <div className="space-y-4">
                        <div>
                          <h5 className="text-sm font-medium text-gray-900 mb-2">Strength Matches:</h5>
                          {selectedMatch.aiAnalysis.strengthMatch.map((strength, i) => (
                            <span key={i} className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded mr-2 mb-1">
                              ✓ {strength}
                            </span>
                          ))}
                        </div>

                        <div>
                          <h5 className="text-sm font-medium text-gray-900 mb-2">Skill Gaps:</h5>
                          {selectedMatch.aiAnalysis.skillGaps.map((gap, i) => (
                            <span key={i} className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded mr-2 mb-1">
                              ⚠ {gap}
                            </span>
                          ))}
                        </div>

                        <div>
                          <h5 className="text-sm font-medium text-gray-900 mb-2">Career Growth:</h5>
                          <p className="text-sm text-gray-600">{selectedMatch.aiAnalysis.careerGrowth}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      onClick={() => setSelectedMatch(null)}
                      className="px-4 py-2 border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Close
                    </button>
                    <button className="px-4 py-2 bg-primary-600 text-white rounded-md font-medium hover:bg-primary-700">
                      Apply Now
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CareerMatchmaking;