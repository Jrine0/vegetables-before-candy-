import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  TrophyIcon,
  UsersIcon,
  AcademicCapIcon,
  SparklesIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface UniversityData {
  name: string;
  rank: number;
  students: number;
  averageGPA: number;
  achievements: number;
  nftsMinted: number;
  researchPapers: number;
  leadershipRoles: number;
  competitiveScore: number;
  trend: 'up' | 'down' | 'stable';
  categories: {
    academic: number;
    research: number;
    leadership: number;
    innovation: number;
    collaboration: number;
  };
}

const UniversityComparison: React.FC = () => {
  const [universities, setUniversities] = useState<UniversityData[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<'achievements' | 'gpa' | 'nfts' | 'research'>('achievements');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUniversityData();
  }, []);

  const loadUniversityData = async () => {
    // Mock university data - in real app, fetch from API
    const mockData: UniversityData[] = [
      {
        name: 'MIT',
        rank: 1,
        students: 247,
        averageGPA: 3.87,
        achievements: 1456,
        nftsMinted: 892,
        researchPapers: 234,
        leadershipRoles: 145,
        competitiveScore: 96.8,
        trend: 'up',
        categories: { academic: 95, research: 98, leadership: 88, innovation: 97, collaboration: 91 }
      },
      {
        name: 'Stanford',
        rank: 2,
        students: 312,
        averageGPA: 3.84,
        achievements: 1389,
        nftsMinted: 856,
        researchPapers: 198,
        leadershipRoles: 167,
        competitiveScore: 94.2,
        trend: 'up',
        categories: { academic: 93, research: 89, leadership: 95, innovation: 94, collaboration: 96 }
      },
      {
        name: 'Harvard',
        rank: 3,
        students: 298,
        averageGPA: 3.82,
        achievements: 1278,
        nftsMinted: 743,
        researchPapers: 187,
        leadershipRoles: 189,
        competitiveScore: 91.5,
        trend: 'stable',
        categories: { academic: 94, research: 85, leadership: 97, innovation: 87, collaboration: 89 }
      },
      {
        name: 'Caltech',
        rank: 4,
        students: 156,
        averageGPA: 3.89,
        achievements: 876,
        nftsMinted: 523,
        researchPapers: 156,
        leadershipRoles: 78,
        competitiveScore: 89.3,
        trend: 'up',
        categories: { academic: 96, research: 94, leadership: 72, innovation: 93, collaboration: 81 }
      },
      {
        name: 'Princeton',
        rank: 5,
        students: 203,
        averageGPA: 3.79,
        achievements: 945,
        nftsMinted: 567,
        researchPapers: 134,
        leadershipRoles: 112,
        competitiveScore: 87.1,
        trend: 'down',
        categories: { academic: 91, research: 82, leadership: 89, innovation: 85, collaboration: 88 }
      },
      {
        name: 'Yale',
        rank: 6,
        students: 267,
        averageGPA: 3.76,
        achievements: 1023,
        nftsMinted: 612,
        researchPapers: 145,
        leadershipRoles: 156,
        competitiveScore: 85.7,
        trend: 'stable',
        categories: { academic: 88, research: 80, leadership: 92, innovation: 83, collaboration: 91 }
      }
    ];

    setUniversities(mockData);
    setLoading(false);
  };

  const getMetricData = () => {
    return universities.map(uni => ({
      name: uni.name,
      value: selectedMetric === 'achievements' ? uni.achievements :
             selectedMetric === 'gpa' ? uni.averageGPA * 100 :
             selectedMetric === 'nfts' ? uni.nftsMinted :
             uni.researchPapers
    }));
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ArrowUpIcon className="h-4 w-4 text-green-500" />;
      case 'down': return <ArrowDownIcon className="h-4 w-4 text-red-500" />;
      default: return <div className="h-4 w-4 bg-gray-400 rounded-full"></div>;
    }
  };

  const getRankColor = (rank: number) => {
    if (rank <= 2) return 'text-yellow-600 bg-yellow-100';
    if (rank <= 4) return 'text-blue-600 bg-blue-100';
    return 'text-gray-600 bg-gray-100';
  };

  if (loading) {
    return <div className="animate-pulse bg-gray-200 rounded-lg h-96"></div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          🏛️ University Comparison Dashboard
        </h2>
        <p className="text-lg text-gray-600">
          Compare academic performance and achievements across top universities
        </p>
      </div>

      {/* Metric Selector */}
      <div className="flex justify-center">
        <div className="bg-white rounded-lg shadow p-1 flex space-x-1">
          {[
            { key: 'achievements', label: 'Total Achievements', icon: TrophyIcon },
            { key: 'gpa', label: 'Average GPA', icon: AcademicCapIcon },
            { key: 'nfts', label: 'NFTs Minted', icon: SparklesIcon },
            { key: 'research', label: 'Research Papers', icon: ChartBarIcon },
          ].map((metric) => (
            <button
              key={metric.key}
              onClick={() => setSelectedMetric(metric.key as any)}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedMetric === metric.key
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <metric.icon className="h-4 w-4 mr-2" />
              {metric.label}
            </button>
          ))}
        </div>
      </div>

      {/* University Rankings Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">University Rankings</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  University
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Students
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg GPA
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Achievements
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  NFTs
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trend
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {universities.map((uni, index) => (
                <motion.tr
                  key={uni.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRankColor(uni.rank)}`}>
                      #{uni.rank}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{uni.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {uni.students}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {uni.averageGPA}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {uni.achievements.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {uni.nftsMinted.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {uni.competitiveScore}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getTrendIcon(uni.trend)}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Charts */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Bar Chart */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Metric Comparison
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getMetricData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#6366F1" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Radar Chart for Top 3 */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Category Analysis (Top 3)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={[
              { category: 'Academic', MIT: 95, Stanford: 93, Harvard: 94 },
              { category: 'Research', MIT: 98, Stanford: 89, Harvard: 85 },
              { category: 'Leadership', MIT: 88, Stanford: 95, Harvard: 97 },
              { category: 'Innovation', MIT: 97, Stanford: 94, Harvard: 87 },
              { category: 'Collaboration', MIT: 91, Stanford: 96, Harvard: 89 },
            ]}>
              <PolarGrid />
              <PolarAngleAxis dataKey="category" />
              <PolarRadiusAxis domain={[0, 100]} />
              <Radar dataKey="MIT" stroke="#EF4444" fill="#EF4444" fillOpacity={0.1} />
              <Radar dataKey="Stanford" stroke="#10B981" fill="#10B981" fillOpacity={0.1} />
              <Radar dataKey="Harvard" stroke="#6366F1" fill="#6366F1" fillOpacity={0.1} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Performers */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Top Performers by Category</h3>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <TrophyIcon className="h-6 w-6 text-yellow-600" />
              <span className="text-xs text-yellow-600 font-medium">ACADEMIC</span>
            </div>
            <div className="text-lg font-bold text-gray-900">Caltech</div>
            <div className="text-sm text-gray-600">3.89 Avg GPA</div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <ChartBarIcon className="h-6 w-6 text-purple-600" />
              <span className="text-xs text-purple-600 font-medium">RESEARCH</span>
            </div>
            <div className="text-lg font-bold text-gray-900">MIT</div>
            <div className="text-sm text-gray-600">234 Papers</div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <UsersIcon className="h-6 w-6 text-green-600" />
              <span className="text-xs text-green-600 font-medium">LEADERSHIP</span>
            </div>
            <div className="text-lg font-bold text-gray-900">Harvard</div>
            <div className="text-sm text-gray-600">189 Roles</div>
          </div>

          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <SparklesIcon className="h-6 w-6 text-indigo-600" />
              <span className="text-xs text-indigo-600 font-medium">NFTs</span>
            </div>
            <div className="text-lg font-bold text-gray-900">MIT</div>
            <div className="text-sm text-gray-600">892 Minted</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UniversityComparison;