import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../src/contexts/AuthContext';
import { useWebSocket } from '../../src/contexts/WebSocketContext';
import Layout from '../../src/components/Layout/Layout';
import { achievementAPI } from '../../src/lib/api';
import { motion } from 'framer-motion';
import {
  AcademicCapIcon,
  BeakerIcon,
  UserGroupIcon,
  TrophyIcon,
  DocumentPlusIcon,
  CloudArrowUpIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const achievementTypes = [
  {
    id: 'gpa',
    name: 'GPA Achievement',
    description: 'Academic excellence and grade point average',
    icon: AcademicCapIcon,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    fields: ['gpaValue']
  },
  {
    id: 'research',
    name: 'Research Achievement',
    description: 'Publications, papers, and research projects',
    icon: BeakerIcon,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    fields: []
  },
  {
    id: 'leadership',
    name: 'Leadership Achievement',
    description: 'Leadership roles and community involvement',
    icon: UserGroupIcon,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    fields: []
  }
];

const NewAchievementPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { emitAchievementSubmitted } = useWebSocket();
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<string>('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    gpaValue: '',
  });
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  React.useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user && !user.emailVerified) {
      toast.error('Please verify your email before uploading achievements');
      router.push('/dashboard');
      return;
    }
  }, [user, authLoading, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/pdf" || file.type.startsWith("image/")) {
        setProofFile(file);
      } else {
        toast.error('Please upload a PDF or image file');
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === "application/pdf" || file.type.startsWith("image/")) {
        setProofFile(file);
      } else {
        toast.error('Please upload a PDF or image file');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedType) {
      toast.error('Please select an achievement type');
      return;
    }

    if (!formData.title.trim()) {
      toast.error('Please enter an achievement title');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('Please enter an achievement description');
      return;
    }

    if (selectedType === 'gpa' && (!formData.gpaValue || parseFloat(formData.gpaValue) < 0 || parseFloat(formData.gpaValue) > 4)) {
      toast.error('Please enter a valid GPA between 0 and 4');
      return;
    }

    if (!proofFile) {
      toast.error('Please upload proof documentation');
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      data.append('type', selectedType);
      data.append('title', formData.title);
      data.append('description', formData.description);
      
      if (selectedType === 'gpa') {
        data.append('gpaValue', formData.gpaValue);
      }
      
      data.append('proof', proofFile);

      const response = await achievementAPI.create(data);
      
      // Emit real-time event
      emitAchievementSubmitted({
        title: formData.title,
        type: selectedType,
        description: formData.description
      });

      toast.success('Achievement uploaded successfully! It will be reviewed for verification.');
      router.push('/achievements');
    } catch (error: any) {
      console.error('Failed to upload achievement:', error);
      toast.error(error.response?.data?.error || 'Failed to upload achievement');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <Layout title="Upload Achievement - future me">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  if (!user || !user.emailVerified) return null;

  return (
    <Layout title="Upload Achievement - future me">
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              🏆 Upload New Achievement
            </h1>
            <p className="mt-3 text-lg text-gray-500">
              Share your academic accomplishments and earn NFT rewards
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Achievement Type Selection */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Select Achievement Type
              </h2>
              <div className="grid gap-4 sm:grid-cols-3">
                {achievementTypes.map((type) => (
                  <div
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`relative cursor-pointer rounded-lg border p-4 hover:bg-gray-50 ${
                      selectedType === type.id
                        ? 'border-primary-500 ring-2 ring-primary-500'
                        : 'border-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`flex-shrink-0 ${type.bgColor} rounded-md p-2`}>
                        <type.icon className={`h-6 w-6 ${type.color}`} />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-gray-900">
                          {type.name}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {type.description}
                        </p>
                      </div>
                    </div>
                    {selectedType === type.id && (
                      <div className="absolute -inset-px rounded-lg border-2 border-primary-500 pointer-events-none" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Achievement Details */}
            {selectedType && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white shadow rounded-lg p-6"
              >
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Achievement Details
                </h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                      Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      id="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="e.g., Dean's List Spring 2024"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Description *
                    </label>
                    <textarea
                      name="description"
                      id="description"
                      rows={3}
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Describe your achievement and its significance..."
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  {selectedType === 'gpa' && (
                    <div>
                      <label htmlFor="gpaValue" className="block text-sm font-medium text-gray-700">
                        GPA Value *
                      </label>
                      <input
                        type="number"
                        name="gpaValue"
                        id="gpaValue"
                        step="0.01"
                        min="0"
                        max="4"
                        value={formData.gpaValue}
                        onChange={handleInputChange}
                        placeholder="e.g., 3.75"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        Enter your GPA on a 4.0 scale
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* File Upload */}
            {selectedType && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white shadow rounded-lg p-6"
              >
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Upload Proof Documentation *
                </h2>
                <div
                  className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md transition-colors ${
                    dragActive
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <div className="space-y-1 text-center">
                    {proofFile ? (
                      <div>
                        <CheckCircleIcon className="mx-auto h-12 w-12 text-green-400" />
                        <div className="flex text-sm text-gray-600">
                          <p className="font-medium">File uploaded: {proofFile.name}</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          Click to change file
                        </p>
                      </div>
                    ) : (
                      <div>
                        <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                          >
                            <span>Upload a file</span>
                            <input
                              id="file-upload"
                              name="file-upload"
                              type="file"
                              className="sr-only"
                              accept=".pdf,image/*"
                              onChange={handleFileSelect}
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          PDF or image files up to 10MB
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Upload official documents like transcripts, certificates, award letters, or other proof
                </p>
              </motion.div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !selectedType}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin -ml-1 mr-3 h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <DocumentPlusIcon className="-ml-1 mr-2 h-5 w-5" />
                    Upload Achievement
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default NewAchievementPage;