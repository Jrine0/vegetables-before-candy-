import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ExclamationTriangleIcon,
  CheckCircleIcon,
  LightBulbIcon,
  ArrowRightIcon,
  BookOpenIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';

interface SkillGap {
  skill: string;
  currentLevel: number;
  requiredLevel: number;
  gap: number;
  priority: 'high' | 'medium' | 'low';
  recommendations: string[];
}

interface SkillGapAnalysisProps {
  skillGaps: SkillGap[];
}

export const SkillGapAnalysis: React.FC<SkillGapAnalysisProps> = ({ skillGaps }) => {
  const [selectedSkill, setSelectedSkill] = useState<SkillGap | null>(skillGaps[0] || null);
  const [filterPriority, setFilterPriority] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  const filteredGaps = skillGaps.filter(gap => 
    filterPriority === 'all' || gap.priority === filterPriority
  );

  const priorityColors = {
    high: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800',
      text: 'text-red-800 dark:text-red-200',
      icon: 'text-red-500'
    },
    medium: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      border: 'border-yellow-200 dark:border-yellow-800',
      text: 'text-yellow-800 dark:text-yellow-200',
      icon: 'text-yellow-500'
    },
    low: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      text: 'text-blue-800 dark:text-blue-200',
      icon: 'text-blue-500'
    }
  };

  if (skillGaps.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg text-center">
        <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          No Skill Gaps Identified
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Congratulations! You have all the skills needed for your top career prediction, 
          or you need to add more achievements to get personalized skill analysis.
        </p>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
          Add More Achievements
        </button>
      </div>
    );
  }

  const highPriorityCount = skillGaps.filter(gap => gap.priority === 'high').length;
  const mediumPriorityCount = skillGaps.filter(gap => gap.priority === 'medium').length;
  const lowPriorityCount = skillGaps.filter(gap => gap.priority === 'low').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Skill Gap Analysis
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Identify and bridge skill gaps to accelerate your career growth. 
          Focus on high-priority skills for maximum impact.
        </p>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{skillGaps.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Gaps</div>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-red-800 dark:text-red-200">{highPriorityCount}</div>
            <div className="text-sm text-red-600 dark:text-red-400">High Priority</div>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-yellow-800 dark:text-yellow-200">{mediumPriorityCount}</div>
            <div className="text-sm text-yellow-600 dark:text-yellow-400">Medium Priority</div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">{lowPriorityCount}</div>
            <div className="text-sm text-blue-600 dark:text-blue-400">Low Priority</div>
          </div>
        </div>

        {/* Priority Filter */}
        <div className="flex flex-wrap gap-2 mt-6">
          {['all', 'high', 'medium', 'low'].map((priority) => (
            <button
              key={priority}
              onClick={() => setFilterPriority(priority as any)}
              className={`
                px-4 py-2 rounded-lg font-medium text-sm transition-colors capitalize
                ${filterPriority === priority
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }
              `}
            >
              {priority} Priority
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Skills List */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Skills to Develop ({filteredGaps.length})
          </h3>
          
          <div className="space-y-3">
            {filteredGaps.map((gap, index) => {
              const colors = priorityColors[gap.priority];
              const isSelected = selectedSkill?.skill === gap.skill;
              
              return (
                <motion.button
                  key={gap.skill}
                  onClick={() => setSelectedSkill(gap)}
                  className={`
                    w-full p-4 rounded-lg border-2 text-left transition-all
                    ${isSelected 
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
                      : `${colors.border} ${colors.bg} hover:shadow-md`
                    }
                  `}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white capitalize">
                      {gap.skill.replace('_', ' ')}
                    </h4>
                    <div className="flex items-center space-x-2">
                      <span className={`
                        px-2 py-1 rounded-full text-xs font-medium uppercase
                        ${gap.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                          gap.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                          'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        }
                      `}>
                        {gap.priority}
                      </span>
                      {gap.priority === 'high' && (
                        <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  </div>
                  
                  {/* Skill Level Progress */}
                  <div className="mb-3">
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                      <span>Current: {gap.currentLevel}/5</span>
                      <span>Required: {gap.requiredLevel}/5</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gray-400 dark:bg-gray-500 h-2 rounded-full relative"
                        style={{ width: `${(gap.currentLevel / 5) * 100}%` }}
                      >
                        <div 
                          className="absolute top-0 left-full h-2 bg-indigo-500 rounded-full"
                          style={{ width: `${(gap.gap / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Gap: {gap.gap} level{gap.gap !== 1 ? 's' : ''}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Skill Detail */}
        <div className="lg:sticky lg:top-6">
          {selectedSkill ? (
            <motion.div
              key={selectedSkill.skill}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
            >
              {/* Header */}
              <div className={`p-6 ${priorityColors[selectedSkill.priority].bg} ${priorityColors[selectedSkill.priority].border} border-b`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white capitalize">
                    {selectedSkill.skill.replace('_', ' ')}
                  </h3>
                  <span className={`
                    px-3 py-1 rounded-full text-sm font-medium uppercase
                    ${selectedSkill.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                      selectedSkill.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    }
                  `}>
                    {selectedSkill.priority} Priority
                  </span>
                </div>
                
                {/* Progress Indicator */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <span>Current Level: {selectedSkill.currentLevel}/5</span>
                    <span>Target Level: {selectedSkill.requiredLevel}/5</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div className="flex h-3 rounded-full overflow-hidden">
                      <div 
                        className="bg-green-500 h-3"
                        style={{ width: `${(selectedSkill.currentLevel / 5) * 100}%` }}
                      />
                      <div 
                        className="bg-yellow-500 h-3"
                        style={{ width: `${(selectedSkill.gap / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>✓ Current</span>
                    <span>⚡ Gap: {selectedSkill.gap} levels</span>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <LightBulbIcon className="w-5 h-5 text-yellow-500" />
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    Recommended Actions
                  </h4>
                </div>
                
                <div className="space-y-3">
                  {selectedSkill.recommendations.map((recommendation, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="flex-shrink-0 w-6 h-6 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mt-0.5">
                        <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                          {index + 1}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-900 dark:text-white text-sm">
                          {recommendation}
                        </p>
                      </div>
                      <ArrowRightIcon className="w-4 h-4 text-gray-400 mt-0.5" />
                    </motion.div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                  <motion.button
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <BookOpenIcon className="w-4 h-4" />
                    <span>Find Courses</span>
                  </motion.button>
                  <motion.button
                    className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <AcademicCapIcon className="w-4 h-4" />
                    <span>Get Mentorship</span>
                  </motion.button>
                </div>

                {/* Impact Indicator */}
                <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                  <h5 className="font-medium text-indigo-900 dark:text-indigo-100 mb-2">
                    Expected Impact
                  </h5>
                  <p className="text-sm text-indigo-800 dark:text-indigo-200">
                    Developing this skill could increase your career prediction confidence by 
                    <span className="font-semibold"> {selectedSkill.gap * 5}-{selectedSkill.gap * 8}%</span> and 
                    open <span className="font-semibold">{selectedSkill.gap * 3}-{selectedSkill.gap * 7}</span> new 
                    opportunity matches.
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg text-center">
              <LightBulbIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                Select a skill to see detailed recommendations
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};