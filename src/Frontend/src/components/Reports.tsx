'use client';

import { useState, useEffect } from 'react';
import ModernPieChart from './ModernPieChart';

interface ReportsProps {
  onBack: () => void;
}

interface DashboardStats {
  pending_tools: number;
  active_tools: number;
  inactive_tools: number;
  total_tools: number;
  total_users: number;
  online_users: number;
  recent_signups: number;
  tools_this_week: number;
  tools_this_month: number;
  users_by_role: Array<{
    role: string;
    count: number;
    percentage: number;
  }>;
  tools_by_category: Array<{
    category: string;
    count: number;
  }>;
  recent_activity: Array<{
    type: string;
    description: string;
    user: string;
    timestamp: string;
    status?: string;
    role?: string;
  }>;
}

export default function Reports({ onBack }: ReportsProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

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

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'tool_submission':
        return '🔧';
      case 'user_registration':
        return '👤';
      default:
        return '📊';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-400';
      case 'pending':
        return 'text-yellow-400';
      case 'inactive':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        <span className="ml-3 text-white opacity-70">Loading reports...</span>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Reports Dashboard</h2>
        <div className="glass-morphism rounded-xl p-8">
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
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Reports Dashboard</h2>
          <p className="text-white opacity-70">Real-time platform analytics and metrics</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                autoRefresh 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-gray-600 hover:bg-gray-700 text-white'
              }`}
            >
              {autoRefresh ? '🟢 Auto-refresh ON' : '🔴 Auto-refresh OFF'}
            </button>
            
            <button
              onClick={fetchStats}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
            >
              🔄 Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
        <div className="glass-morphism p-4 rounded-xl text-center">
          <div className="text-3xl font-bold text-green-400 mb-1">{stats.online_users}</div>
          <div className="text-sm text-white opacity-70">Online Users</div>
          <div className="text-xs text-green-400 mt-1">🟢 Live</div>
        </div>
        
        <div className="glass-morphism p-4 rounded-xl text-center">
          <div className="text-3xl font-bold text-blue-400 mb-1">{stats.active_tools}</div>
          <div className="text-sm text-white opacity-70">Active Tools</div>
        </div>
        
        <div className="glass-morphism p-4 rounded-xl text-center">
          <div className="text-3xl font-bold text-yellow-400 mb-1">{stats.pending_tools}</div>
          <div className="text-sm text-white opacity-70">Pending Tools</div>
        </div>
        
        <div className="glass-morphism p-4 rounded-xl text-center">
          <div className="text-3xl font-bold text-white mb-1">{stats.total_users}</div>
          <div className="text-sm text-white opacity-70">Total Users</div>
        </div>
        
        <div className="glass-morphism p-4 rounded-xl text-center">
          <div className="text-3xl font-bold text-purple-400 mb-1">{stats.tools_this_week}</div>
          <div className="text-sm text-white opacity-70">Tools This Week</div>
        </div>
        
        <div className="glass-morphism p-4 rounded-xl text-center">
          <div className="text-3xl font-bold text-pink-400 mb-1">{stats.recent_signups}</div>
          <div className="text-sm text-white opacity-70">New Users (7d)</div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
        {/* Users by Role - Large Pie Chart */}
        <div className="glass-morphism p-8 rounded-xl flex justify-center items-center min-h-[500px]">
          {stats.users_by_role && stats.users_by_role.length > 0 ? (
            <ModernPieChart
              title="Users by Role"
              data={stats.users_by_role.map((roleData, index) => {
                // Generate beautiful role-specific colors with gradients
                const roleColors: { [key: string]: string } = {
                  'frontend': '#3b82f6', // Blue - Frontend developers
                  'backend': '#10b981', // Green - Backend developers
                  'qa': '#f59e0b', // Amber - QA engineers
                  'designer': '#ec4899', // Pink - Designers
                  'pm': '#8b5cf6', // Violet - Product managers
                  'owner': '#ef4444', // Red - Owners
                  'No Role': '#6b7280' // Gray - Unassigned
                };
                
                return {
                  label: roleData.role.charAt(0).toUpperCase() + roleData.role.slice(1),
                  value: roleData.count,
                  percentage: roleData.percentage,
                  color: roleColors[roleData.role] || `hsl(${(index * 60) % 360}, 70%, 55%)`
                };
              })}
              size={360}
              strokeWidth={24}
            />
          ) : (
            <div className="text-center text-white opacity-60">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4 mx-auto"></div>
              Loading users data...
            </div>
          )}
        </div>

        {/* Tools by Category - Large Pie Chart */}
        <div className="glass-morphism p-8 rounded-xl flex justify-center items-center min-h-[500px]">
          {stats.tools_by_category && stats.tools_by_category.length > 0 ? (
            <ModernPieChart
              title="Tools by Category"
              data={stats.tools_by_category.slice(0, 8).map((categoryData, index) => {
                // Generate vibrant category colors inspired by tech themes
                const categoryColors = [
                  '#ff6b6b', // Red-Pink - Creative tools
                  '#4ecdc4', // Teal - Development tools
                  '#45b7d1', // Sky Blue - Communication tools
                  '#f9ca24', // Golden Yellow - Productivity tools
                  '#6c5ce7', // Purple - Design tools
                  '#a55eea', // Lavender - Analytics tools
                  '#26de81', // Green - DevOps tools
                  '#fd79a8', // Rose - Testing tools
                  '#fdcb6e', // Orange - Documentation tools
                  '#74b9ff'  // Light Blue - Security tools
                ];
                
                const totalTools = stats.tools_by_category.reduce((sum, cat) => sum + cat.count, 0);
                const percentage = totalTools > 0 ? (categoryData.count / totalTools) * 100 : 0;
                
                return {
                  label: categoryData.category,
                  value: categoryData.count,
                  percentage: percentage,
                  color: categoryColors[index % categoryColors.length]
                };
              })}
              size={360}
              strokeWidth={24}
            />
          ) : (
            <div className="text-center text-white opacity-60">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4 mx-auto"></div>
              Loading tools data...
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass-morphism p-6 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">Recent Activity</h3>
          <div className="text-sm text-white opacity-50">Last 10 activities</div>
        </div>
        
        <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
          {stats.recent_activity.length > 0 ? (
            stats.recent_activity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-4 p-3 bg-white/5 rounded-lg">
                <div className="text-2xl">{getActivityIcon(activity.type)}</div>
                <div className="flex-1">
                  <div className="text-white font-medium">{activity.description}</div>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-sm text-white opacity-70">
                      by {activity.user}
                    </span>
                    <span className="text-xs text-white opacity-50">
                      {formatDate(activity.timestamp)}
                    </span>
                    {activity.status && (
                      <span className={`text-xs font-medium ${getStatusColor(activity.status)}`}>
                        {activity.status}
                      </span>
                    )}
                    {activity.role && (
                      <span className="text-xs text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded">
                        {activity.role}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-white opacity-60 py-8">
              No recent activity to display
            </div>
          )}
        </div>
      </div>

      {/* System Overview */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-morphism p-6 rounded-xl text-center">
          <div className="text-4xl mb-2">🔧</div>
          <div className="text-2xl font-bold text-white mb-1">{stats.total_tools}</div>
          <div className="text-sm text-white opacity-70">Total Tools in Platform</div>
          <div className="mt-2 text-xs text-white opacity-50">
            {stats.active_tools} active, {stats.pending_tools} pending
          </div>
        </div>
        
        <div className="glass-morphism p-6 rounded-xl text-center">
          <div className="text-4xl mb-2">📈</div>
          <div className="text-2xl font-bold text-white mb-1">{stats.tools_this_month}</div>
          <div className="text-sm text-white opacity-70">Tools This Month</div>
          <div className="mt-2 text-xs text-green-400">
            +{stats.tools_this_week} this week
          </div>
        </div>
        
        <div className="glass-morphism p-6 rounded-xl text-center">
          <div className="text-4xl mb-2">👥</div>
          <div className="text-2xl font-bold text-white mb-1">{stats.total_users}</div>
          <div className="text-sm text-white opacity-70">Platform Users</div>
          <div className="mt-2 text-xs text-blue-400">
            +{stats.recent_signups} new this week
          </div>
        </div>
      </div>
    </div>
  );
}