'use client';

import { useState, useEffect, useRef } from 'react';
import { apiService } from '@/lib/api';
import type { AiTool } from '@/types';

interface FavouritesProps {
  onBack: () => void;
  onToolClick?: (tool: AiTool) => void;
  refreshTrigger?: number;
}

interface HeartAnimation {
  id: string;
  x: number;
  y: number;
}

export default function Favourites({ onBack, onToolClick }: FavouritesProps) {
  const [favouriteTools, setFavouriteTools] = useState<AiTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [heartAnimations, setHeartAnimations] = useState<HeartAnimation[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load favorites from API on mount
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        setLoading(true);
        
        // Check if user is authenticated
        if (!apiService.isAuthenticated()) {
          setFavouriteTools([]);
          return;
        }
        
        // Get user's favorite tools from API
        const favorites = await apiService.getFavoriteTools();
        setFavouriteTools(favorites || []);
      } catch (error) {
        console.error('Error loading favorite tools:', error);
        setFavouriteTools([]);
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();

    // Listen for changes to favorites from other components
    const handleFavoritesChanged = () => {
      loadFavorites();
    };

    window.addEventListener('favouritesChanged', handleFavoritesChanged);
    return () => window.removeEventListener('favouritesChanged', handleFavoritesChanged);
  }, []);

  const toggleFavorite = async (tool: AiTool, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (!apiService.isAuthenticated()) {
      alert('Please login to manage favorites');
      return;
    }
    
    try {
      // Toggle favorite via API
      const result = await apiService.toggleFavoriteTool(String(tool.id));
      
      if (!result.is_favorite) {
        // Remove from displayed list if unfavorited
        setFavouriteTools(prev => prev.filter(t => String(t.id) !== String(tool.id)));
      } else {
        // Create heart animation at click position
        const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
        const containerRect = containerRef.current?.getBoundingClientRect();
        
        if (containerRect) {
          const animationId = `heart-${Date.now()}`;
          const x = rect.left + rect.width / 2 - containerRect.left;
          const y = rect.top + rect.height / 2 - containerRect.top;
          
          setHeartAnimations(prev => [...prev, { id: animationId, x, y }]);
          
          // Remove animation after it completes
          setTimeout(() => {
            setHeartAnimations(prev => prev.filter(anim => anim.id !== animationId));
          }, 1000);
        }
      }
      
      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent('favouritesChanged'));
    } catch (error) {
      console.error('Error toggling favorite:', error);
      // Silently handle the error - the favorite operation likely succeeded
    }
  };

  const filteredTools = favouriteTools.filter(tool =>
    tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tool.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPricingDisplay = (pricing: any) => {
    if (!pricing) return 'Contact for pricing';
    
    try {
      switch (pricing.type) {
        case 'free':
          return 'Free';
        case 'freemium':
          return pricing.free_tier ? `Free tier available • $${pricing.price}/${pricing.billing_cycle}` : `$${pricing.price}/${pricing.billing_cycle}`;
        case 'paid':
          return `$${pricing.price}/${pricing.billing_cycle}`;
        case 'enterprise':
          return 'Enterprise pricing';
        default:
          return 'Contact for pricing';
      }
    } catch (error) {
      console.error('Error displaying pricing:', error, pricing);
      return 'Contact for pricing';
    }
  };

  const getRatingStars = (rating: number | undefined) => {
    if (!rating) return null;
    const stars = Math.round(rating);
    return '⭐'.repeat(stars) + '☆'.repeat(5 - stars);
  };

  return (
    <div ref={containerRef} className="glass-morphism p-8 rounded-3xl max-h-[80vh] overflow-hidden flex flex-col relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-2xl font-bold text-white opacity-80 mb-2">
            My Favourites ❤️
          </h3>
          <p className="text-sm text-white opacity-60">
            Your saved AI tools collection
          </p>
        </div>
        <button
          onClick={onBack}
          className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium text-white opacity-80 transition-all duration-200 hover:scale-105"
        >
          ← Back
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search favorites..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/10 backdrop-blur-sm border border-white/30 rounded-2xl px-4 py-3 pl-10 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent text-sm"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white opacity-60">
            🔍
          </div>
        </div>
      </div>

      {/* Tools Count */}
      <div className="mb-4">
        <p className="text-xs text-white opacity-60">
          {filteredTools.length} favorite{filteredTools.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Tools List - Scrollable */}
      <div 
        className="flex-1 overflow-y-auto pr-4 pl-2 space-y-4 custom-scrollbar" 
        style={{
          scrollbarGutter: 'stable',
          scrollbarWidth: 'thin'
        }}
      >
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="text-white opacity-60">Loading favorites...</div>
          </div>
        ) : filteredTools.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-64 text-center">
            {favouriteTools.length === 0 ? (
              <>
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4">
                  <span className="text-3xl">💔</span>
                </div>
                <h3 className="text-lg font-bold text-white opacity-80 mb-2">No favourites yet</h3>
                <p className="text-white opacity-60 text-sm max-w-xs">
                  Start exploring AI tools and click the ❤️ button to save them here.
                </p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4">
                  <span className="text-3xl">🔍</span>
                </div>
                <h3 className="text-lg font-bold text-white opacity-80 mb-2">No matches found</h3>
                <p className="text-white opacity-60 text-sm">
                  Try adjusting your search terms.
                </p>
              </>
            )}
          </div>
        ) : (
          filteredTools.map((tool) => (
            <div
              key={tool.id}
              onClick={(e) => {
                if (onToolClick && typeof onToolClick === 'function') {
                  onToolClick(tool);
                } else {
                  console.log('onToolClick not available');
                }
              }}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg group cursor-pointer"
            >
              {/* Tool Header */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-lg font-bold text-white opacity-80 group-hover:opacity-100 transition-opacity duration-200">
                      {tool.name || 'Unknown Tool'}
                    </h4>
                    {tool.average_rating && (
                      <div className="flex items-center text-xs text-white opacity-60">
                        <span className="mr-1">{getRatingStars(tool.average_rating)}</span>
                        <span>({typeof tool.average_rating === 'number' ? tool.average_rating.toFixed(1) : '0.0'})</span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-white opacity-70 leading-relaxed mb-3">
                    {tool.description || 'No description available'}
                  </p>
                </div>
              </div>

              {/* Features */}
              {tool.features && Array.isArray(tool.features) && tool.features.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {tool.features.slice(0, 3).map((feature, index) => (
                      <span
                        key={index}
                        className="bg-white/20 text-xs px-2 py-1 rounded-full text-white opacity-70"
                      >
                        {typeof feature === 'string' ? feature : String(feature)}
                      </span>
                    ))}
                    {tool.features.length > 3 && (
                      <span className="text-xs text-white opacity-50">
                        +{tool.features.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="flex justify-between items-center">
                <div className="text-xs text-white opacity-60">
                  {getPricingDisplay(tool.pricing_model)}
                </div>
                <div className="flex gap-2 items-center">
                  {/* Heart Favorite Button - Always red/filled since these are favorites */}
                  <button
                    onClick={(e) => toggleFavorite(tool, e)}
                    className="relative p-2 rounded-full transition-all duration-300 hover:scale-110 text-red-500 bg-red-500/20 hover:bg-red-500/30"
                    title="Remove from favorites"
                  >
                    <svg 
                      className="w-5 h-5 transition-all duration-300 heart-animation"
                      fill="currentColor"
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                      />
                    </svg>
                  </button>
                  
                  {tool.website_url && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(tool.website_url, '_blank');
                      }}
                      className="bg-white/20 hover:bg-white/30 text-xs px-3 py-1 rounded-full text-white opacity-70 hover:opacity-90 transition-all duration-200"
                    >
                      Visit Site
                    </button>
                  )}
                  {tool.integration_type === 'api' && (
                    <button 
                      onClick={(e) => e.stopPropagation()}
                      className="bg-blue-500/20 hover:bg-blue-500/30 text-xs px-3 py-1 rounded-full text-white opacity-70 hover:opacity-90 transition-all duration-200"
                    >
                      Integrate
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onToolClick && typeof onToolClick === 'function') {
                        onToolClick(tool);
                      }
                    }}
                    className="bg-purple-500/20 hover:bg-purple-500/30 text-xs px-3 py-1 rounded-full text-white opacity-70 hover:opacity-90 transition-all duration-200"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Floating Heart Animations */}
      {heartAnimations.map((heart) => (
        <div
          key={heart.id}
          className="heart-float"
          style={{
            left: heart.x - 12, // Center the heart (24px width / 2)
            top: heart.y - 12,  // Center the heart (24px height / 2)
          }}
        >
          <svg 
            className="w-6 h-6 text-red-500"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
      ))}
    </div>
  );
}