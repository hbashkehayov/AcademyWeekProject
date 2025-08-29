'use client';

import { useState, useEffect } from 'react';
import { apiService } from '@/lib/api';

interface Tool {
  id: number;
  name: string;
  description: string;
  detailed_description?: string;
  icon_url?: string;
  website_url?: string;
  pricing_model?: string;
  recommendation_score?: number;
  match_reasons?: string[];
  recommendation_explanation?: string;
  categories?: { name: string }[];
}

interface Role {
  id: number;
  name: string;
  display_name: string;
  description: string;
}

interface RecommendationsProps {
  userRole: string;
  onBack: () => void;
}

export default function Recommendations({ userRole, onBack }: RecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Tool[]>([]);
  const [currentRole, setCurrentRole] = useState<Role | null>(null);
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>(userRole);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchRoles();
  }, []);

  useEffect(() => {
    if (selectedRole) {
      fetchRecommendations(selectedRole);
    }
  }, [selectedRole]);

  const fetchRoles = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/roles`);
      if (response.ok) {
        const data = await response.json();
        setAllRoles(data);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const fetchRecommendations = async (role: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/recommendations/role-based?role=${role}&limit=12`
      );
      
      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.recommendations);
        setCurrentRole(data.role);
      } else {
        setError('Failed to fetch recommendations');
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setError('An error occurred while fetching recommendations');
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-blue-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Perfect Match';
    if (score >= 60) return 'Highly Recommended';
    if (score >= 40) return 'Good Fit';
    return 'Suggested';
  };

  const renderToolCard = (tool: Tool) => (
    <div
      key={tool.id}
      className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
    >
      {/* Score Badge */}
      <div className="relative">
        <div className={`${getScoreColor(tool.recommendation_score || 0)} text-white px-4 py-2`}>
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold">
              {getScoreLabel(tool.recommendation_score || 0)}
            </span>
            <span className="text-lg font-bold">
              {tool.recommendation_score?.toFixed(0)}%
            </span>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Tool Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {tool.icon_url ? (
              <img
                src={tool.icon_url}
                alt={tool.name}
                className="w-12 h-12 rounded-lg object-cover"
              />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                {tool.name.charAt(0)}
              </div>
            )}
            <div>
              <h3 className="text-xl font-bold text-gray-800">{tool.name}</h3>
              {tool.pricing_model && (
                <span className="text-sm text-gray-500">{tool.pricing_model}</span>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 mb-4 line-clamp-2">{tool.description}</p>

        {/* Match Reasons */}
        {tool.match_reasons && tool.match_reasons.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {tool.match_reasons.slice(0, 2).map((reason, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  ✓ {reason}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Recommendation Explanation */}
        {tool.recommendation_explanation && (
          <p className="text-sm text-gray-700 italic mb-4 p-3 bg-gray-50 rounded-lg">
            {tool.recommendation_explanation}
          </p>
        )}

        {/* Categories */}
        {tool.categories && tool.categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {tool.categories.map((category, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs"
              >
                {category.name}
              </span>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <a
            href={tool.website_url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-center font-medium"
          >
            Visit Website
          </a>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <button
              onClick={onBack}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </button>
            
            <div className="flex items-center space-x-4">
              {/* View Mode Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-600'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-600'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title and Role Selector */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI Tool Recommendations
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Personalized AI tools selected based on your role and workflow needs
          </p>

          {/* Role Selector */}
          <div className="flex items-center space-x-4 mb-6">
            <span className="text-gray-700 font-medium">Viewing recommendations for:</span>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {allRoles.map((role) => (
                <option key={role.name} value={role.name}>
                  {role.display_name || role.name}
                </option>
              ))}
            </select>
          </div>

          {/* Current Role Info */}
          {currentRole && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">
                {currentRole.display_name || currentRole.name} Role
              </h3>
              <p className="text-blue-700">{currentRole.description}</p>
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Recommendations Grid/List */}
        {!isLoading && !error && recommendations.length > 0 && (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            : "space-y-4"
          }>
            {recommendations.map((tool) => renderToolCard(tool))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && recommendations.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No recommendations available for this role yet.
            </p>
          </div>
        )}

        {/* Stats Section */}
        {!isLoading && recommendations.length > 0 && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-3xl font-bold text-blue-500">{recommendations.length}</div>
              <div className="text-gray-600 mt-2">Total Recommendations</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-3xl font-bold text-green-500">
                {recommendations.filter(t => (t.recommendation_score || 0) >= 80).length}
              </div>
              <div className="text-gray-600 mt-2">Perfect Matches</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-3xl font-bold text-purple-500">
                {recommendations.filter(t => (t.recommendation_score || 0) >= 60).length}
              </div>
              <div className="text-gray-600 mt-2">Highly Recommended</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}