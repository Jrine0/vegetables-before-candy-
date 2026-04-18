import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../src/contexts/AuthContext';
import Layout from '../src/components/Layout/Layout';
import { opportunityAPI } from '../src/lib/api';
import toast from 'react-hot-toast';
import {
  LockClosedIcon,
  LockOpenIcon,
  MapPinIcon,
  CalendarIcon,
  UserGroupIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';

interface Opportunity {
  id: string;
  title: string;
  description: string;
  type: string;
  category: 'digital' | 'physical';
  requiredNFTs: string[];
  hasAccess: boolean;
  company?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  maxParticipants?: number;
  url?: string;
}

const OpportunitiesPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestingAccess, setRequestingAccess] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user && user.emailVerified) {
      fetchOpportunities();
    }
  }, [user, authLoading, router]);

  const fetchOpportunities = async () => {
    try {
      const response = await opportunityAPI.getAll();
      setOpportunities(response.data);
    } catch (error) {
      console.error('Failed to fetch opportunities:', error);
      toast.error('Failed to load opportunities');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAccess = async (opportunityId: string) => {
    setRequestingAccess(opportunityId);
    try {
      await opportunityAPI.requestAccess(opportunityId);
      toast.success('Access granted! You can now use this opportunity.');
      fetchOpportunities(); // Refresh to update access status
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to request access');
    } finally {
      setRequestingAccess(null);
    }
  };

  const getNFTTypeName = (nftType: string) => {
    const names = {
      'gpa_guardian': 'GPA Guardian',
      'research_rockstar': 'Research Rockstar',
      'leadership_legend': 'Leadership Legend',
    };
    return names[nftType as keyof typeof names] || nftType;
  };

  const getNFTIcon = (nftType: string) => {
    const icons = {
      'gpa_guardian': '🎓',
      'research_rockstar': '🔬',
      'leadership_legend': '👑',
    };
    return icons[nftType as keyof typeof icons] || '🏆';
  };

  const getCategoryIcon = (category: string) => {
    return category === 'digital' ? <GlobeAltIcon className="w-4 h-4" /> : <MapPinIcon className="w-4 h-4" />;
  };

  if (authLoading || loading) {
    return (
      <Layout title="Opportunities - future me">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  if (!user?.emailVerified) {
    return (
      <Layout title="Opportunities - future me">
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Email Verification Required</h1>
            <p className="text-gray-600">Please verify your university email to access opportunities.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Opportunities - future me">
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Exclusive Opportunities</h1>
            <p className="mt-2 text-gray-600">
              Unlock premium resources and experiences with your achievement NFTs
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {opportunities.map((opportunity) => (
              <div key={opportunity.id} className="card">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    {getCategoryIcon(opportunity.category)}
                    <span className="text-sm text-gray-500 capitalize">
                      {opportunity.category}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {opportunity.hasAccess ? (
                      <>
                        <LockOpenIcon className="w-5 h-5 text-green-500" />
                        <span className="text-sm text-green-600 font-medium">Access Granted</span>
                      </>
                    ) : (
                      <>
                        <LockClosedIcon className="w-5 h-5 text-gray-400" />
                        <span className="text-sm text-gray-500">Access Required</span>
                      </>
                    )}
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {opportunity.title}
                </h3>
                
                <p className="text-gray-600 mb-4">
                  {opportunity.description}
                </p>

                {opportunity.company && (
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <UserGroupIcon className="w-4 h-4 mr-2" />
                    {opportunity.company}
                  </div>
                )}

                {opportunity.location && (
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <MapPinIcon className="w-4 h-4 mr-2" />
                    {opportunity.location}
                  </div>
                )}

                {opportunity.startDate && (
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    {new Date(opportunity.startDate).toLocaleDateString()} 
                    {opportunity.endDate && (
                      <span> - {new Date(opportunity.endDate).toLocaleDateString()}</span>
                    )}
                  </div>
                )}

                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Required NFTs:</h4>
                  <div className="flex flex-wrap gap-2">
                    {opportunity.requiredNFTs.map((nftType) => (
                      <span
                        key={nftType}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                      >
                        <span className="mr-1">{getNFTIcon(nftType)}</span>
                        {getNFTTypeName(nftType)}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  {opportunity.hasAccess ? (
                    <div className="flex space-x-2">
                      {opportunity.url && (
                        <a
                          href={opportunity.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-primary text-sm"
                        >
                          Access Now
                        </a>
                      )}
                      <span className="text-sm text-green-600 font-medium">
                        ✅ You have access
                      </span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleRequestAccess(opportunity.id)}
                      disabled={requestingAccess === opportunity.id}
                      className="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {requestingAccess === opportunity.id ? 'Requesting...' : 'Request Access'}
                    </button>
                  )}
                  
                  {opportunity.maxParticipants && (
                    <span className="text-sm text-gray-500">
                      Limited to {opportunity.maxParticipants} participants
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {opportunities.length === 0 && (
            <div className="text-center py-12">
              <LockClosedIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No opportunities available</h3>
              <p className="mt-1 text-sm text-gray-500">
                Check back soon for new exclusive opportunities, or upload achievements to unlock access.
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default OpportunitiesPage;