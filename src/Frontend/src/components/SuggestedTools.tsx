'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface Tool {
  id: string;
  name: string;
  description: string;
  recommendation_score?: number;
  match_reasons?: string[];
  categories?: { name: string }[];
  website_url?: string;
}

interface ApiResponse {
  success?: boolean;
  role: { name: string };
  recommendations: Tool[];
  total: number;
  total_available?: number;
  has_more?: boolean;
  next_offset?: number;
  recently_added?: any[];
  personalized?: boolean;
  error?: string;
  error_type?: string;
  message?: string;
  available_roles?: string[];
  suggestions?: string[];
  retry_after?: number;
}

interface SuggestedToolsProps {
  userRole: string | { name: string };
  userId?: string;
  onViewRecommendations?: () => void;
}

// Request cache for deduplication and performance
const requestCache = new Map<string, { data: ApiResponse; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Active requests map for deduplication
const activeRequests = new Map<string, Promise<ApiResponse>>();

export default function SuggestedTools({ userRole, userId, onViewRecommendations }: SuggestedToolsProps) {
  const [suggestions, setSuggestions] = useState<Tool[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<{
    message: string;
    type: string;
    suggestions?: string[];
    retryAfter?: number;
  } | null>(null);
  const [roleName, setRoleName] = useState<string | null>(null);
  const limit = 50; // Fetch all available tools
  const [recentlyAdded, setRecentlyAdded] = useState<any[]>([]);
  const [isPersonalized, setIsPersonalized] = useState(false);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Get API base URL with fallback
  const getApiBaseUrl = (): string => {
    const envUrl = process.env.NEXT_PUBLIC_API_URL;
    console.log('SuggestedTools: NEXT_PUBLIC_API_URL =', envUrl);
    console.log('SuggestedTools: window.location =', typeof window !== 'undefined' ? window.location.href : 'undefined');
    
    if (envUrl) {
      console.log('SuggestedTools: Using environment API URL:', envUrl);
      return envUrl;
    }
    
    if (typeof window !== 'undefined' && window.location) {
      // For development, try localhost:80 first, then current domain
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      
      if (isLocalhost) {
        // Use port 8000 (Docker Nginx) as the default for Laravel backend
        let fallbackUrl = 'http://localhost:8000/api'; // Default Laravel in Docker via Nginx port 8000
        
        console.log('SuggestedTools: Using localhost fallback:', fallbackUrl);
        return fallbackUrl;
      }
      
      // For other domains, construct from current location
      const fallbackUrl = `${window.location.protocol}//${window.location.hostname}/api`;
      console.log('SuggestedTools: Using constructed fallback (no port):', fallbackUrl);
      return fallbackUrl;
    }
    
    console.log('SuggestedTools: Using default fallback: http://localhost:8000/api');
    return 'http://localhost:8000/api';
  };
  
  // Calculate role name whenever userRole changes
  useEffect(() => {
    console.log('SuggestedTools: userRole prop changed to:', userRole);
    
    if (userRole && userRole !== 'User') { // Ignore default placeholder values
      let calculatedRoleName = '';
      
      if (typeof userRole === 'string') {
        calculatedRoleName = userRole.toLowerCase().trim();
      } else if (typeof userRole === 'object' && 'name' in userRole) {
        calculatedRoleName = userRole.name.toLowerCase().trim();
      }
      
      // Only update if we have a valid role
      if (calculatedRoleName && calculatedRoleName !== 'user') {
        console.log('SuggestedTools: Setting roleName to:', calculatedRoleName);
        setRoleName(calculatedRoleName);
      }
    }
  }, [userRole]);

  // Clear cache entries that are older than CACHE_DURATION
  const clearExpiredCache = useCallback(() => {
    const now = Date.now();
    const entries = Array.from(requestCache.entries());
    for (const [key, value] of entries) {
      if (now - value.timestamp > CACHE_DURATION) {
        requestCache.delete(key);
      }
    }
  }, []);

  // Fetch recommendations with caching and deduplication
  const fetchRecommendations = useCallback(async (
    role: string, 
    requestLimit: number, 
    offset: number = 0,
    signal?: AbortSignal
  ): Promise<ApiResponse> => {
    const cacheKey = `${role}-${requestLimit}-${offset}`;
    
    // Clear expired cache entries
    clearExpiredCache();
    
    // Check cache first
    const cached = requestCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      console.log('SuggestedTools: Using cached data for', cacheKey);
      return cached.data;
    }
    
    // Check if request is already in flight
    if (activeRequests.has(cacheKey)) {
      console.log('SuggestedTools: Request already in flight for', cacheKey);
      return activeRequests.get(cacheKey)!;
    }
    
    const apiBaseUrl = getApiBaseUrl();
    const params = new URLSearchParams({
      role: role,
      limit: requestLimit.toString(),
      offset: offset.toString()
    });
    
    if (userId) {
      params.append('user_id', userId);
    }
    
    const url = `${apiBaseUrl}/recommendations/role-based?${params}`;
    
    console.log('SuggestedTools: Making API request to:', url);
    console.log('SuggestedTools: Request params:', Object.fromEntries(params));
    
    const requestPromise = fetch(url, { 
        signal,
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      })
      .then(async response => {
        console.log('SuggestedTools: Fetch response status:', response.status);
        console.log('SuggestedTools: Fetch response headers:', Object.fromEntries(response.headers));
        
        let data;
        try {
          data = await response.json();
          console.log('SuggestedTools: Response data:', data);
        } catch (parseError) {
          console.error('SuggestedTools: Failed to parse JSON response:', parseError);
          throw new Error(JSON.stringify({
            status: response.status,
            statusText: response.statusText,
            error: 'Failed to parse JSON response',
            error_type: 'JSON_PARSE_ERROR'
          }));
        }
        
        if (!response.ok) {
          console.error('SuggestedTools: HTTP error response:', response.status, data);
          throw new Error(JSON.stringify({
            status: response.status,
            statusText: response.statusText,
            ...data
          }));
        }
        
        // Cache successful response
        requestCache.set(cacheKey, { data, timestamp: Date.now() });
        
        return data;
      })
      .catch(error => {
        console.error('SuggestedTools: Fetch error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack,
          url: url
        });
        throw error;
      })
      .finally(() => {
        // Remove from active requests when done
        activeRequests.delete(cacheKey);
      });
    
    // Track active request
    activeRequests.set(cacheKey, requestPromise);
    
    return requestPromise;
  }, [clearExpiredCache]);

  // Main fetch function with error handling
  const fetchRecommendationsWithRetry = useCallback(async (
    role: string, 
    requestLimit: number, 
    offset: number = 0
  ) => {
    if (!role) {
      console.log('SuggestedTools: No role provided, skipping fetch');
      return;
    }
    
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await fetchRecommendations(role, requestLimit, offset, signal);
      
      if (signal.aborted) return;
      
      console.log('SuggestedTools: Full API response:', data);
      console.log('SuggestedTools: Received recommendations for', role, ':', data.recommendations?.map((t: Tool) => t.name));
      console.log('SuggestedTools: Recommendations count:', data.recommendations?.length);
      
      if (data.error) {
        // Handle API errors with specific error types
        setError({
          message: data.message || data.error,
          type: data.error_type || 'UNKNOWN_ERROR',
          suggestions: data.suggestions,
          retryAfter: data.retry_after
        });
        
        if (offset === 0) {
          setSuggestions([]);
        }
      } else {
        const newRecommendations = data.recommendations || [];
        
        if (offset === 0) {
          setSuggestions(newRecommendations);
        } else {
          setSuggestions(prev => [...prev, ...newRecommendations]);
        }
        
        setRecentlyAdded(data.recently_added || []);
        setIsPersonalized(data.personalized || false);
      }
      
    } catch (err: any) {
      if (signal.aborted) return;
      
      console.error('Error fetching recommendations:', err);
      
      let errorInfo = { message: 'Network error occurred', type: 'NETWORK_ERROR' };
      
      try {
        const parsedError = JSON.parse(err.message);
        switch (parsedError.status) {
          case 422:
            errorInfo = {
              message: 'Invalid role specified. Please check your role settings.',
              type: 'INVALID_ROLE'
            };
            break;
          case 500:
            errorInfo = {
              message: 'Server error. Please try again in a few moments.',
              type: 'SERVER_ERROR'
            };
            break;
          case 404:
            errorInfo = {
              message: 'API endpoint not found. Please check your configuration.',
              type: 'API_NOT_FOUND'
            };
            break;
          default:
            errorInfo = {
              message: parsedError.message || 'An unexpected error occurred',
              type: parsedError.error_type || 'API_ERROR'
            };
        }
      } catch {
        // If error parsing fails, use network error
        if (err.name === 'TypeError' && err.message.includes('fetch')) {
          errorInfo = {
            message: 'Unable to connect to server. Please check your internet connection.',
            type: 'CONNECTION_ERROR'
          };
        }
      }
      
      setError(errorInfo);
      
      if (offset === 0) {
        setSuggestions([]);
      }
      
    } finally {
      setIsLoading(false);
    }
  }, [fetchRecommendations]);

  // Track user interaction
  const trackInteraction = useCallback(async (
    toolId: string | null,
    interactionType: string,
    metadata: any = {}
  ) => {
    if (!userId) return;
    
    try {
      const apiBaseUrl = getApiBaseUrl();
      await fetch(`${apiBaseUrl}/recommendations/track-interaction`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          user_id: userId,
          tool_id: toolId,
          interaction_type: interactionType,
          source: 'dashboard',
          metadata
        })
      });
    } catch (error) {
      console.error('Failed to track interaction:', error);
    }
  }, [userId]);

  // Fetch recommendations when roleName or userId changes
  useEffect(() => {
    console.log('SuggestedTools: useEffect triggered with roleName:', roleName, 'userId:', userId);
    if (roleName) {
      console.log('SuggestedTools: Starting fetch for role:', roleName);
      fetchRecommendationsWithRetry(roleName, limit, 0);
    } else {
      console.log('SuggestedTools: No roleName provided, skipping fetch');
    }
  }, [roleName, userId, fetchRecommendationsWithRetry, limit]);
  
  // Track when suggestions are viewed
  useEffect(() => {
    if (suggestions.length > 0 && userId) {
      suggestions.forEach(tool => {
        trackInteraction(tool.id, 'viewed', {
          recommendation_score: tool.recommendation_score,
          match_reasons: tool.match_reasons
        });
      });
    }
  }, [suggestions, trackInteraction, userId]);


  // Retry function for error states
  const retry = useCallback(() => {
    if (roleName) {
      fetchRecommendationsWithRetry(roleName, limit, 0);
    }
  }, [roleName, fetchRecommendationsWithRetry, limit]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-300';
    if (score >= 60) return 'text-blue-300';
    if (score >= 40) return 'text-yellow-300';
    return 'text-gray-300';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Perfect Match';
    if (score >= 60) return 'Highly Relevant';
    if (score >= 40) return 'Good Fit';
    return 'Suggested';
  };

  const getRoleDisplayName = (role: string | null) => {
    if (!role) return '';
    const displayNames: { [key: string]: string } = {
      'frontend': 'Frontend Developer',
      'backend': 'Backend Developer',
      'qa': 'QA Engineer',
      'designer': 'UI/UX Designer',
      'pm': 'Project Manager',
      'owner': 'Product Owner'
    };
    return displayNames[role] || role.charAt(0).toUpperCase() + role.slice(1);
  };

  return (
    <div 
      className="glass-morphism p-4 sm:p-6 rounded-2xl sm:rounded-3xl h-fit w-full"
      role="region"
      aria-labelledby="suggested-tools-heading"
      aria-live="polite"
      aria-busy={isLoading}
    >
      <div className="mb-4 sm:mb-6">
        <h3 
          id="suggested-tools-heading"
          className="text-lg sm:text-xl font-bold text-white opacity-80 mb-1 sm:mb-2"
        >
          Suggested AI Tools
        </h3>
        {roleName && (
          <div className="space-y-1">
            <p className="text-xs sm:text-sm text-white opacity-60 leading-relaxed">
              Intelligently matched to your {getRoleDisplayName(roleName)} role
            </p>
            {isPersonalized && (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-blue-300 font-medium">Personalized for you</span>
              </div>
            )}
            {recentlyAdded.length > 0 && (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-xs text-green-300 font-medium">
                  {recentlyAdded.length} recently added by community
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-8 sm:py-10" role="status" aria-label="Loading recommendations">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/60"></div>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 sm:p-6" role="alert">
          <div className="flex items-start space-x-3">
            <div className="text-red-400 flex-shrink-0 mt-0.5">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-red-300 font-medium mb-1">
                {error.type === 'INVALID_ROLE' && 'Invalid Role'}
                {error.type === 'SERVER_ERROR' && 'Server Error'}
                {error.type === 'CONNECTION_ERROR' && 'Connection Error'}
                {error.type === 'NO_RECOMMENDATIONS' && 'No Recommendations'}
                {!['INVALID_ROLE', 'SERVER_ERROR', 'CONNECTION_ERROR', 'NO_RECOMMENDATIONS'].includes(error.type) && 'Error'}
              </h4>
              <p className="text-red-200 text-sm mb-3">{error.message}</p>
              
              {error.suggestions && error.suggestions.length > 0 && (
                <div className="mb-3">
                  <p className="text-red-200 text-xs mb-1">Suggestions:</p>
                  <div className="flex flex-wrap gap-1">
                    {error.suggestions.map((suggestion, idx) => (
                      <span key={idx} className="bg-red-500/20 text-red-200 text-xs px-2 py-1 rounded-md">
                        {suggestion}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <button 
                onClick={retry}
                className="bg-red-500/30 hover:bg-red-500/40 text-red-200 text-sm px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-400/50"
                aria-label="Retry loading recommendations"
              >
                {error.retryAfter ? `Retry in ${error.retryAfter}s` : 'Try Again'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations */}
      {!isLoading && !error && (
        <div className="h-[32rem] overflow-y-auto pr-2 custom-scrollbar space-y-3 sm:space-y-4">
          {suggestions.map((tool, index) => (
            <div 
              key={tool.id || index}
              className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-white/20 hover:border-white/30 transition-all duration-300 hover:shadow-lg hover:shadow-white/10 overflow-hidden w-full focus-within:ring-2 focus-within:ring-white/50"
            >
              <div className="p-4 sm:p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start space-x-3 flex-1 min-w-0">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-white/20 to-white/10 rounded-xl flex items-center justify-center text-white text-lg sm:text-xl font-bold shadow-inner flex-shrink-0">
                      {tool.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-white text-base sm:text-lg leading-tight mb-2 break-words">
                        {tool.name}
                      </h4>
                      {tool.categories && tool.categories.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                          {tool.categories.slice(0, 3).map((cat, idx) => (
                            <span 
                              key={idx}
                              className="text-xs bg-white/15 rounded-md px-2 py-0.5 text-white/80"
                            >
                              {cat.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="ml-4 flex-shrink-0">
                    <div className={`bg-white/20 backdrop-blur-xl rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 border border-white/30 shadow-lg`}>
                      <div className="flex items-center space-x-1 sm:space-x-2">
                        <span className={`text-lg sm:text-2xl font-bold ${getScoreColor(tool.recommendation_score || 0)} drop-shadow-lg`}>
                          {Math.round(tool.recommendation_score || 0)}%
                        </span>
                        <div className="hidden sm:flex flex-col">
                          <span className="text-[10px] leading-tight text-white/90 font-medium drop-shadow">match</span>
                          <span className="text-[10px] leading-tight font-semibold text-white/95 drop-shadow">
                            {getScoreLabel(tool.recommendation_score || 0).split(' ')[0]}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <p className="text-sm sm:text-base text-white/75 leading-relaxed mb-4 sm:pl-16 break-words">
                  {tool.description}
                </p>

                {tool.match_reasons && tool.match_reasons.length > 0 && (
                  <div className="mb-4 sm:pl-16">
                    <p className="text-[11px] text-white/50 mb-1 uppercase tracking-wider font-medium">
                      Why it's recommended:
                    </p>
                    <p className="text-sm text-white/80 italic leading-relaxed">
                      {tool.match_reasons[0]}
                    </p>
                  </div>
                )}
                
                <div className="flex items-center justify-between sm:pl-16">
                  <div className="flex-1 mr-4 sm:mr-6">
                    <div className="flex items-center space-x-3">
                      <div className="flex-1">
                        <div className="h-2 sm:h-2.5 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-500 ${
                              (tool.recommendation_score || 0) >= 80 ? 'bg-green-400' :
                              (tool.recommendation_score || 0) >= 60 ? 'bg-blue-400' :
                              (tool.recommendation_score || 0) >= 40 ? 'bg-yellow-400' :
                              'bg-gray-400'
                            }`}
                            style={{ width: `${tool.recommendation_score || 0}%` }}
                            role="progressbar"
                            aria-valuenow={tool.recommendation_score || 0}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-label={`Recommendation score: ${tool.recommendation_score || 0}%`}
                          />
                        </div>
                      </div>
                      <span className="text-xs text-white/60 whitespace-nowrap font-medium">
                        {getScoreLabel(tool.recommendation_score || 0)}
                      </span>
                    </div>
                  </div>
                  
                  <a 
                    href={tool.website_url || '#'}
                    target={tool.website_url ? "_blank" : undefined}
                    rel={tool.website_url ? "noopener noreferrer" : undefined}
                    onClick={() => {
                      if (tool.website_url) {
                        trackInteraction(tool.id, 'clicked', {
                          url: tool.website_url,
                          recommendation_score: tool.recommendation_score
                        });
                      }
                    }}
                    className="text-sm bg-white/25 hover:bg-white/40 backdrop-blur-xl border border-white/30 hover:border-white/50 rounded-full px-4 sm:px-5 py-2 sm:py-2.5 text-white font-semibold transition-all duration-300 hover:scale-105 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label={`Explore ${tool.name} tool${!tool.website_url ? ' (link not available)' : ''}`}
                    {...(!tool.website_url && { 'aria-disabled': 'true', onClick: (e: React.MouseEvent) => e.preventDefault() })}>
                    Explore →
                  </a>
                </div>
              </div>
            </div>
          ))}

          {/* Empty State */}
          {suggestions.length === 0 && (
            <div className="text-center py-8">
              <div className="text-4xl mb-3 opacity-60">🤖</div>
              <p className="text-white/60 text-sm">No recommendations available</p>
              <p className="text-white/40 text-xs mt-1">Try adjusting your role or check back later</p>
            </div>
          )}
        </div>
      )}


      {/* View All Link */}
      {onViewRecommendations && suggestions.length > 0 && (
        <div className="mt-4 sm:mt-6 pt-4 border-t border-white/20 text-center">
          <button 
            onClick={onViewRecommendations}
            className="px-4 py-2 text-xs text-white/80 hover:text-white bg-white/15 hover:bg-white/25 backdrop-blur-sm border border-white/20 hover:border-white/40 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50 font-medium"
            aria-label="View all recommendations"
          >
            View All →
          </button>
        </div>
      )}
    </div>
  );
}