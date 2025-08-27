'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PendingToolDetails from './PendingToolDetails';
import UserManagement from './UserManagement';

interface ReportsViewProps {
  onBack: () => void;
}

interface DashboardStats {
  total_tools: number;
  tools_this_month: number;
  total_users: number;
  tools_this_week: number;
  recent_signups: number;
}

function ReportsView({ onBack }: ReportsViewProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/stats`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
        setError(null);
      } else {
        setError('Failed to fetch statistics');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="text-white">
        <button
          onClick={onBack}
          className="flex items-center text-white/70 hover:text-white transition-colors mb-4"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Admin Operations
        </button>
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          <span className="ml-3 text-white opacity-70">Loading reports...</span>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="text-white">
        <button
          onClick={onBack}
          className="flex items-center text-white/70 hover:text-white transition-colors mb-4"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Admin Operations
        </button>
        <div className="text-center">
          <div className="text-red-400 mb-4">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            {error}
          </div>
          <button
            onClick={fetchStats}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="text-white">
      <button
        onClick={onBack}
        className="flex items-center text-white/70 hover:text-white transition-colors mb-6"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Admin Operations
      </button>
      
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-white mb-2">Reports & Analytics</h3>
        <p className="text-white opacity-70">Platform metrics and insights</p>
      </div>

      {/* Key Metrics - Only the 3 requested */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
          <div className="text-4xl mb-2">🔧</div>
          <div className="text-2xl font-bold text-white mb-1">{stats.total_tools}</div>
          <div className="text-sm text-white opacity-70">Total Tools in Platform</div>
          <div className="mt-2 text-xs text-white opacity-50">
            Active and pending tools
          </div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
          <div className="text-4xl mb-2">📈</div>
          <div className="text-2xl font-bold text-white mb-1">{stats.tools_this_month}</div>
          <div className="text-sm text-white opacity-70">Tools This Month</div>
          <div className="mt-2 text-xs text-green-400">
            +{stats.tools_this_week} this week
          </div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
          <div className="text-4xl mb-2">👥</div>
          <div className="text-2xl font-bold text-white mb-1">{stats.total_users}</div>
          <div className="text-sm text-white opacity-70">Platform Users</div>
          <div className="mt-2 text-xs text-blue-400">
            +{stats.recent_signups} new this week
          </div>
        </div>
      </div>

      {/* Refresh Button */}
      <div className="mt-6 text-center">
        <button
          onClick={fetchStats}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          🔄 Refresh Data
        </button>
      </div>
    </div>
  );
}

interface PendingTool {
  id: string;
  name: string;
  description: string;
  detailed_description?: string;
  website_url?: string;
  features?: string[];
  pricing_model?: any;
  suggested_for_role?: string;
  categories?: any[];
  integration_type?: string;
  submitted_at: string;
  submitted_by?: {
    name: string;
    email: string;
  };
  submitted_by_user?: {
    name: string;
    email: string;
  };
}

interface AdminOperationsProps {
  user: {
    role: string | { name: string };
    role_id?: number;
  };
}

type AdminView = 'overview' | 'tool-details' | 'users' | 'reports';

export default function AdminOperations({ user }: AdminOperationsProps) {
  const router = useRouter();
  const [pendingTools, setPendingTools] = useState<PendingTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<AdminView>('overview');
  const [selectedTool, setSelectedTool] = useState<PendingTool | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Check if user is owner - handle both string and object role
  const roleName = typeof user.role === 'string' ? user.role : user.role?.name;
  const isOwner = roleName === 'owner' || user.role_id === 6;

  const fetchPendingTools = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/pending-tools`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPendingTools(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch pending tools:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch if user is owner
    if (isOwner) {
      fetchPendingTools();
    } else {
      setLoading(false);
    }
  }, [isOwner]);

  const handleViewChange = (newView: AdminView, tool?: PendingTool) => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    
    setTimeout(() => {
      setCurrentView(newView);
      if (tool) {
        setSelectedTool(tool);
      }
      setTimeout(() => {
        setIsTransitioning(false);
      }, 100);
    }, 400);
  };

  const handleToolClick = (tool: PendingTool) => {
    // Directly use the tool data we have, as it should contain all necessary information
    // for pending tools from the admin endpoint
    console.log('Opening tool details for:', tool.name);
    handleViewChange('tool-details', tool);
  };

  const handleToolApprove = (toolId: string) => {
    setPendingTools(prev => prev.filter(t => t.id !== toolId));
  };

  const handleToolReject = (toolId: string) => {
    setPendingTools(prev => prev.filter(t => t.id !== toolId));
  };

  const handleAllOperations = () => {
    router.push('/admin');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric' 
    });
  };

  // Only render for owners
  if (!isOwner) {
    return null;
  }

  return (
    <div className="glass-morphism p-6 md:p-8 rounded-3xl">
      <div className={`transition-all duration-500 ease-out ${
        isTransitioning ? 'opacity-0 transform translate-y-4' : 
        'opacity-100 transform translate-y-0'
      }`}>
        {currentView === 'overview' && (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-white opacity-80 mb-2">
                  Admin Operations
                </h3>
                <p className="text-sm text-white opacity-60">
                  Manage platform tools and user submissions
                </p>
              </div>
              
              {/* Admin Badge */}
              <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-purple-300/30 rounded-full px-4 py-2">
                <span className="text-sm font-semibold text-white opacity-80">
                  Admin
                </span>
              </div>
            </div>

            {/* Pending Tools Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-semibold text-white opacity-80">
                  Pending Tool Submissions ({pendingTools.length})
                </h4>
                {pendingTools.length > 0 && (
                  <p className="text-xs text-white opacity-50">Click to review</p>
                )}
              </div>
              
              {loading ? (
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <p className="text-white opacity-60 text-sm">Loading pending tools...</p>
                </div>
              ) : pendingTools.length > 0 ? (
                <div className={`space-y-3 ${pendingTools.length > 3 ? 'overflow-y-auto pr-2 admin-ops-scrollbar' : ''}`}
                     style={{ maxHeight: pendingTools.length > 3 ? '340px' : 'auto' }}>
                  <style jsx>{`
                    .admin-ops-scrollbar::-webkit-scrollbar {
                      width: 6px;
                      background: transparent;
                    }
                    .admin-ops-scrollbar::-webkit-scrollbar-track {
                      background: linear-gradient(
                        180deg,
                        rgba(255, 255, 255, 0.05) 0%,
                        rgba(255, 255, 255, 0.1) 50%,
                        rgba(255, 255, 255, 0.05) 100%
                      );
                      border-radius: 10px;
                      backdrop-filter: blur(10px);
                      margin: 4px 0;
                    }
                    .admin-ops-scrollbar::-webkit-scrollbar-thumb {
                      background: linear-gradient(
                        180deg,
                        rgba(255, 255, 255, 0.2) 0%,
                        rgba(255, 255, 255, 0.3) 50%,
                        rgba(255, 255, 255, 0.2) 100%
                      );
                      border-radius: 10px;
                      border: 1px solid rgba(255, 255, 255, 0.1);
                      backdrop-filter: blur(10px);
                      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                    }
                    .admin-ops-scrollbar::-webkit-scrollbar-thumb:hover {
                      background: linear-gradient(
                        180deg,
                        rgba(255, 255, 255, 0.3) 0%,
                        rgba(255, 255, 255, 0.4) 50%,
                        rgba(255, 255, 255, 0.3) 100%
                      );
                      border: 1px solid rgba(255, 255, 255, 0.2);
                      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
                    }
                    .admin-ops-scrollbar {
                      scrollbar-width: thin;
                      scrollbar-color: rgba(255, 255, 255, 0.3) rgba(255, 255, 255, 0.1);
                    }
                  `}</style>
                  {pendingTools.map((tool) => (
                    <div 
                      key={tool.id}
                      className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-200 cursor-pointer group"
                      onClick={() => handleToolClick(tool)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h5 className="font-semibold text-white opacity-90 mb-1 group-hover:text-blue-300 transition-colors">
                            {tool.name}
                          </h5>
                          <p className="text-sm text-white opacity-60 line-clamp-2 mb-2">
                            {tool.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-white opacity-50">
                            <span>Submitted {formatDate(tool.submitted_at)}</span>
                            {(tool.submitted_by || tool.submitted_by_user) && (
                              <span>by {tool.submitted_by?.name || tool.submitted_by_user?.name || tool.submitted_by?.email || tool.submitted_by_user?.email}</span>
                            )}
                          </div>
                        </div>
                        <div className="ml-3 flex-shrink-0 flex items-center gap-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                            Pending
                          </span>
                          <svg className="w-5 h-5 text-white/40 group-hover:text-white/60 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <p className="text-white opacity-60 text-sm">No pending tools at the moment</p>
                </div>
              )}
            </div>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                onClick={() => handleViewChange('users')}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold text-white opacity-80">User Management</p>
                    <p className="text-xs text-white opacity-60">Manage users</p>
                  </div>
                  <svg className="w-6 h-6 text-white opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </button>

              <button
                onClick={() => handleViewChange('reports')}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold text-white opacity-80">Reports</p>
                    <p className="text-xs text-white opacity-60">View analytics</p>
                  </div>
                  <svg className="w-6 h-6 text-white opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </button>
            </div>

            {/* All Operations Button */}
            <button
              onClick={handleAllOperations}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 px-6 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              All Operations →
            </button>
          </>
        )}

        {currentView === 'tool-details' && selectedTool && (
          <PendingToolDetails
            tool={selectedTool}
            onBack={() => handleViewChange('overview')}
            onApprove={handleToolApprove}
            onReject={handleToolReject}
          />
        )}

        {currentView === 'users' && (
          <UserManagement onBack={() => handleViewChange('overview')} />
        )}

        {currentView === 'reports' && (
          <ReportsView onBack={() => handleViewChange('overview')} />
        )}
      </div>
    </div>
  );
}