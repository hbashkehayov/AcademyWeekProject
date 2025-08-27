'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '@/lib/api';
import Footer from '@/components/Footer';
import PendingToolDetails from '@/components/PendingToolDetails';
import UserManagement from '@/components/UserManagement';
import Reports from '@/components/Reports';

interface PendingTool {
  id: string;
  name: string;
  description: string;
  detailed_description?: string;
  website_url: string;
  features?: string[];
  pricing_model?: any;
  suggested_for_role?: string;
  categories?: any[];
  integration_type?: string;
  status: string;
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

type AdminView = 'list' | 'tool-details';

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [pendingTools, setPendingTools] = useState<PendingTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'tools' | 'users' | 'reports'>('tools');
  const [currentView, setCurrentView] = useState<AdminView>('list');
  const [selectedTool, setSelectedTool] = useState<PendingTool | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [dashboardStats, setDashboardStats] = useState<any>(null);

  useEffect(() => {
    checkAuth();
    fetchPendingTools();
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/stats`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDashboardStats(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    }
  };

  const checkAuth = async () => {
    const currentUser = apiService.getUser();
    // Handle both string role and object role
    const roleName = typeof currentUser?.role === 'string' 
      ? currentUser.role 
      : currentUser?.role?.name;
    const isOwner = roleName === 'owner' || currentUser?.role_id === 6;
    
    if (!currentUser || !isOwner) {
      router.push('/dashboard');
      return;
    }
    setUser(currentUser);
  };

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
    console.log('Opening tool details for:', tool.name);
    handleViewChange('tool-details', tool);
  };

  const handleToolApprove = (toolId: string) => {
    setPendingTools(prev => prev.filter(t => t.id !== toolId));
    setCurrentView('list');
  };

  const handleToolReject = (toolId: string) => {
    setPendingTools(prev => prev.filter(t => t.id !== toolId));
    setCurrentView('list');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle both string role and object role for display check
  const userRoleName = typeof user?.role === 'string' 
    ? user.role 
    : user?.role?.name;
  const userIsOwner = userRoleName === 'owner' || user?.role_id === 6;
  
  if (!user || !userIsOwner) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col" 
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}
    >
      <div className="flex-1">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-lg border-b border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="text-white opacity-80 hover:opacity-100 transition-opacity"
                >
                  ← Back to Dashboard
                </button>
                <div className="h-6 w-px bg-white/30"></div>
                <h1 className="text-xl font-bold text-white">Admin Operations</h1>
              </div>
              
              <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-purple-300/30 rounded-full px-4 py-2">
                <span className="text-sm font-semibold text-white opacity-80">
                  Admin Panel
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16 md:pb-20 lg:pb-24">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="glass-morphism p-6 rounded-xl">
              <h3 className="text-3xl font-bold text-yellow-400 mb-2">{dashboardStats?.pending_tools || pendingTools.length}</h3>
              <p className="text-white opacity-70">Pending Tools</p>
            </div>
            <div className="glass-morphism p-6 rounded-xl">
              <h3 className="text-3xl font-bold text-green-400 mb-2">{dashboardStats?.online_users || 0}</h3>
              <p className="text-white opacity-70">Online Users</p>
              <p className="text-xs text-green-400 mt-1">🟢 Live</p>
            </div>
            <div className="glass-morphism p-6 rounded-xl">
              <h3 className="text-3xl font-bold text-blue-400 mb-2">{dashboardStats?.active_tools || 0}</h3>
              <p className="text-white opacity-70">Active Tools</p>
            </div>
            <div className="glass-morphism p-6 rounded-xl">
              <h3 className="text-3xl font-bold text-white mb-2">{dashboardStats?.total_users || 0}</h3>
              <p className="text-white opacity-70">Total Users</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setActiveTab('tools')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'tools'
                  ? 'bg-white text-purple-700 shadow-lg'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              Pending Tools
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'users'
                  ? 'bg-white text-purple-700 shadow-lg'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              User Management
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'reports'
                  ? 'bg-white text-purple-700 shadow-lg'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              Reports
            </button>
          </div>

          {/* Tab Content */}
          <div className="glass-morphism rounded-2xl p-6">
            <div className={`transition-all duration-500 ease-out ${
              isTransitioning ? 'opacity-0 transform translate-y-4' : 
              'opacity-100 transform translate-y-0'
            }`}>
              {activeTab === 'tools' && currentView === 'list' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-white">Pending Tool Submissions</h2>
                    {pendingTools.length > 0 && (
                      <p className="text-sm text-white opacity-50">Click any tool to review details</p>
                    )}
                  </div>
                  
                  {loading ? (
                    <p className="text-white opacity-60">Loading...</p>
                  ) : pendingTools.length > 0 ? (
                    <div className={`space-y-4 ${pendingTools.length > 3 ? 'overflow-y-auto pr-2 admin-page-scrollbar' : ''}`}
                         style={{ maxHeight: pendingTools.length > 3 ? '480px' : 'auto' }}>
                      <style jsx>{`
                        .admin-page-scrollbar::-webkit-scrollbar {
                          width: 6px;
                          background: transparent;
                        }
                        .admin-page-scrollbar::-webkit-scrollbar-track {
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
                        .admin-page-scrollbar::-webkit-scrollbar-thumb {
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
                        .admin-page-scrollbar::-webkit-scrollbar-thumb:hover {
                          background: linear-gradient(
                            180deg,
                            rgba(255, 255, 255, 0.3) 0%,
                            rgba(255, 255, 255, 0.4) 50%,
                            rgba(255, 255, 255, 0.3) 100%
                          );
                          border: 1px solid rgba(255, 255, 255, 0.2);
                          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
                        }
                        .admin-page-scrollbar {
                          scrollbar-width: thin;
                          scrollbar-color: rgba(255, 255, 255, 0.3) rgba(255, 255, 255, 0.1);
                        }
                      `}</style>
                      {pendingTools.map((tool) => (
                        <div 
                          key={tool.id}
                          className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-200 cursor-pointer group"
                          onClick={() => handleToolClick(tool)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
                                {tool.name}
                              </h3>
                              <p className="text-white opacity-70 mb-3">
                                {tool.description}
                              </p>
                              <div className="flex items-center gap-4 text-sm text-white opacity-50 mb-4">
                                <span>URL: {tool.website_url}</span>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-white opacity-50">
                                <span>Submitted {formatDate(tool.submitted_at)}</span>
                                {(tool.submitted_by || tool.submitted_by_user) && (
                                  <span>by {tool.submitted_by?.name || tool.submitted_by_user?.name || tool.submitted_by?.email || tool.submitted_by_user?.email}</span>
                                )}
                              </div>
                            </div>
                            
                            <div className="ml-4 flex items-center gap-2">
                              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                                Pending Review
                              </span>
                              <svg className="w-6 h-6 text-white/40 group-hover:text-white/60 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-white opacity-60">No pending tools at the moment</p>
                  )}
                </div>
              )}

              {activeTab === 'tools' && currentView === 'tool-details' && selectedTool && (
                <PendingToolDetails
                  tool={selectedTool}
                  onBack={() => handleViewChange('list')}
                  onApprove={handleToolApprove}
                  onReject={handleToolReject}
                />
              )}
            </div>
            
            {activeTab === 'users' && currentView === 'list' && (
              <UserManagement onBack={() => setActiveTab('tools')} />
            )}
            
            {activeTab === 'reports' && currentView === 'list' && (
              <Reports onBack={() => setActiveTab('tools')} />
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}