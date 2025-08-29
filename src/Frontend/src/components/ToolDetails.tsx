'use client';

import { useState, useEffect } from 'react';
import type { AiTool } from '@/types';

interface ToolDetailsProps {
  tool: AiTool;
  onBack: () => void;
  isDarkMode?: boolean;
}

export default function ToolDetails({ tool, onBack, isDarkMode = false }: ToolDetailsProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'features' | 'pricing'>('overview');
  const [isFavourite, setIsFavourite] = useState(false);
  const [heartAnimations, setHeartAnimations] = useState<{id: string, x: number, y: number}[]>([]);

  // Load favorite status from localStorage on component mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem('user_favourites');
    if (savedFavorites) {
      try {
        const favoriteIds = JSON.parse(savedFavorites);
        const toolId = String(tool.id);
        setIsFavourite(favoriteIds.some((id: string | number) => String(id) === toolId));
      } catch (error) {
        console.error('Error loading favorites:', error);
      }
    }

    // Listen for changes to favorites from other components
    const handleFavoritesChanged = () => {
      const savedFavorites = localStorage.getItem('user_favourites');
      if (savedFavorites) {
        try {
          const favoriteIds = JSON.parse(savedFavorites);
          const toolId = String(tool.id);
          setIsFavourite(favoriteIds.some((id: string | number) => String(id) === toolId));
        } catch (error) {
          console.error('Error updating favorites:', error);
        }
      }
    };

    window.addEventListener('favouritesChanged', handleFavoritesChanged);
    return () => window.removeEventListener('favouritesChanged', handleFavoritesChanged);
  }, [tool.id]);

  const toggleFavorite = (event: React.MouseEvent) => {
    event.stopPropagation();
    
    const toolId = String(tool.id);
    const currentlyFavorite = isFavourite;
    
    // Update favorites
    const savedFavourites = localStorage.getItem('user_favourites');
    let favouriteIds = savedFavourites ? JSON.parse(savedFavourites) : [];
    
    if (currentlyFavorite) {
      // Remove from favourites
      favouriteIds = favouriteIds.filter((id: string) => String(id) !== toolId);
      setIsFavourite(false);
    } else {
      // Add to favourites
      favouriteIds.push(toolId);
      setIsFavourite(true);
      
      // Create Instagram-like heart animation at click position
      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
      const animationId = `heart-${Date.now()}`;
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      
      setHeartAnimations(prev => [...prev, { id: animationId, x, y }]);
      
      // Remove animation after it completes
      setTimeout(() => {
        setHeartAnimations(prev => prev.filter(anim => anim.id !== animationId));
      }, 1000);
    }
    
    localStorage.setItem('user_favourites', JSON.stringify(favouriteIds));
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('favouritesChanged'));
  };

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
      return 'Contact for pricing';
    }
  };

  const getRatingStars = (rating: number | undefined) => {
    if (!rating) return null;
    const stars = Math.round(rating);
    return '⭐'.repeat(stars) + '☆'.repeat(5 - stars);
  };

  const getIntegrationTypeDisplay = (type: string) => {
    switch (type) {
      case 'api':
        return { text: 'API Integration', icon: '🔌', color: 'bg-gray-200 text-gray-800' };
      case 'redirect':
        return { text: 'Web Application', icon: '🌐', color: 'bg-gray-200 text-gray-800' };
      case 'webhook':
        return { text: 'Webhook', icon: '🎣', color: 'bg-gray-200 text-gray-800' };
      default:
        return { text: 'Unknown', icon: '❓', color: 'bg-gray-200 text-gray-800' };
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-300 text-green-900 border-green-200';
      case 'pending':
        return 'bg-gray-300/80 text-gray-900 border-gray-400';
      case 'inactive':
        return 'bg-gray-400/80 text-white border-gray-500';
      default:
        return 'bg-gray-500/80 text-white border-gray-600';
    }
  };

  const integrationInfo = getIntegrationTypeDisplay(tool.integration_type);

  return (
    <div className="p-8 rounded-3xl max-h-[85vh] overflow-hidden flex flex-col" 
         style={{
           background: 'linear-gradient(135deg, rgba(128, 128, 128, 0.15), rgba(160, 160, 160, 0.08))',
           backdropFilter: 'blur(20px) saturate(120%)',
           borderColor: 'rgba(200, 200, 200, 0.25)',
           border: '1px solid rgba(200, 200, 200, 0.25)',
           boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.08)'
         }}>
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-3">
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-bold text-white opacity-90">
                {tool.name || 'Unknown Tool'}
              </h2>
              <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(tool.status)}`}>
                {tool.status.charAt(0).toUpperCase() + tool.status.slice(1)}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4 mb-4">
            {tool.average_rating && (
              <div className="flex items-center text-sm text-white opacity-70">
                <span className="mr-2">{getRatingStars(tool.average_rating)}</span>
                <span>({typeof tool.average_rating === 'number' ? tool.average_rating.toFixed(1) : '0.0'} rating)</span>
              </div>
            )}
            
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${integrationInfo.color}`}>
              {integrationInfo.icon} {integrationInfo.text}
            </div>
          </div>
          
          <p className="text-lg leading-relaxed text-white opacity-80">
            {tool.description || 'No description available'}
          </p>
        </div>
        
        <button
          onClick={onBack}
          className="ml-6 bg-white/20 hover:bg-white/30 text-white font-medium py-3 px-6 rounded-2xl transition-all duration-200 hover:scale-105"
        >
          Back to Tools
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-white/10 rounded-2xl p-1">
        {['overview', 'details', 'features', 'pricing'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 ${
              activeTab === tab
                ? 'bg-white/20 text-white opacity-100 shadow-lg'
                : 'text-white opacity-60 hover:opacity-80 hover:bg-white/5'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content - Scrollable */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white opacity-80 mb-4">Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-white opacity-60 block mb-1">Website</label>
                  <div className="flex items-center gap-2">
                    {tool.website_url ? (
                      <button
                        onClick={() => window.open(tool.website_url, '_blank')}
                        className="text-blue-300 hover:text-blue-200 transition-colors duration-200 text-sm underline"
                      >
                        {tool.website_url}
                      </button>
                    ) : (
                      <span className="text-white opacity-50 text-sm">Not available</span>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="text-sm text-white opacity-60 block mb-1">Integration Type</label>
                  <div className="text-white opacity-80 text-sm">
                    {integrationInfo.icon} {integrationInfo.text}
                  </div>
                </div>
                
                {tool.api_endpoint && (
                  <div>
                    <label className="text-sm text-white opacity-60 block mb-1">API Endpoint</label>
                    <code className="bg-black/20 px-2 py-1 rounded text-xs text-white opacity-80 font-mono">
                      {tool.api_endpoint}
                    </code>
                  </div>
                )}
                
                <div>
                  <label className="text-sm text-white opacity-60 block mb-1">Status</label>
                  <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(tool.status)}`}>
                    {tool.status.charAt(0).toUpperCase() + tool.status.slice(1)}
                  </div>
                </div>
              </div>
            </div>

            {/* Categories */}
            {tool.categories && tool.categories.length > 0 && (
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white opacity-80 mb-4">Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {tool.categories.map((category, index) => (
                    <span
                      key={index}
                      className="bg-blue-300 text-blue-900 text-sm px-3 py-1 rounded-full border border-blue-200"
                    >
                      {typeof category === 'object' ? category.name : String(category)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Roles */}
            {tool.roles && tool.roles.length > 0 && (
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white opacity-80 mb-4">Suitable for Roles</h3>
                <div className="flex flex-wrap gap-2">
                  {tool.roles.map((role, index) => (
                    <span
                      key={index}
                      className="bg-purple-300 text-purple-900 text-sm px-3 py-1 rounded-full border border-purple-200"
                    >
                      {typeof role === 'object' ? role.display_name || role.name : String(role)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'details' && (
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white opacity-80 mb-4">Detailed Description</h3>
              {tool.detailed_description ? (
                <div className="prose prose-invert max-w-none">
                  <div className="text-white opacity-80 leading-relaxed whitespace-pre-line">
                    {tool.detailed_description}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-white opacity-60 mb-4">
                    📚 No detailed description available yet
                  </div>
                  <p className="text-sm text-white opacity-50">
                    This tool's detailed description is being prepared. Check back soon!
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'features' && (
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white opacity-80 mb-4">Features</h3>
              {tool.features && Array.isArray(tool.features) && tool.features.length > 0 ? (
                <div className="grid grid-cols-1 gap-3">
                  {tool.features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10"
                    >
                      <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"></div>
                      <span className="text-white opacity-80">
                        {typeof feature === 'string' ? feature : String(feature)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white opacity-60">No features listed for this tool.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'pricing' && (
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white opacity-80 mb-4">Pricing Information</h3>
              {tool.pricing_model ? (
                <div className="space-y-4">
                  <div className="text-2xl font-bold text-white opacity-90">
                    {getPricingDisplay(tool.pricing_model)}
                  </div>
                  
                  {tool.pricing_model.details && (
                    <div>
                      <label className="text-sm text-white opacity-60 block mb-2">Details</label>
                      <p className="text-white opacity-80 leading-relaxed">
                        {tool.pricing_model.details}
                      </p>
                    </div>
                  )}
                  
                  {tool.pricing_model.trial_days && (
                    <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-blue-200">
                        <span className="text-lg">🎯</span>
                        <span className="font-medium">Free Trial Available</span>
                      </div>
                      <p className="text-blue-200 opacity-80 mt-1">
                        Try free for {tool.pricing_model.trial_days} days
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-white opacity-60">No pricing information available.</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-6 pt-6 border-t border-white/20">
        {tool.website_url && (
          <button
            onClick={() => window.open(tool.website_url, '_blank')}
            className="flex-1 bg-white/20 hover:bg-white/30 text-white font-medium py-3 px-6 rounded-2xl transition-all duration-200 hover:scale-105"
          >
            Visit Website
          </button>
        )}
        
        {tool.integration_type === 'api' && (
          <button className="flex-1 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-200 font-medium py-3 px-6 rounded-2xl transition-all duration-200 hover:scale-105">
            Get API Access
          </button>
        )}
        
        {/* Heart-only Favorite Button */}
        <button
          onClick={toggleFavorite}
          className={`relative p-3 rounded-full transition-all duration-300 hover:scale-110 ${
            isFavourite
              ? 'text-red-500 bg-red-500/20 hover:bg-red-500/30'
              : 'text-white/60 hover:text-red-400 hover:bg-red-500/20'
          }`}
          title={isFavourite ? "Remove from favorites" : "Add to favorites"}
        >
          <svg 
            className={`w-6 h-6 transition-all duration-300 ${
              isFavourite ? 'heart-animation' : ''
            }`}
            fill={isFavourite ? "currentColor" : "none"}
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
      </div>

      {/* Floating Heart Animations */}
      {heartAnimations.map((heart) => (
        <div
          key={heart.id}
          className="heart-float fixed pointer-events-none z-50"
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