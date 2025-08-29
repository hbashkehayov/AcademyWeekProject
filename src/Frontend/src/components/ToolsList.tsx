'use client';

import { useState, useEffect, useRef } from 'react';
import { apiService } from '@/lib/api';
import type { AiTool } from '@/types';

interface ToolsListProps {
  onBack: () => void;
  onToolClick: (tool: AiTool) => void;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  tools_count?: number;
}

interface Role {
  id: number;
  name: string;
  display_name: string;
  description?: string;
}

interface HeartAnimation {
  id: string;
  x: number;
  y: number;
}

export default function ToolsList({ onBack, onToolClick }: ToolsListProps) {
  const [tools, setTools] = useState<AiTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [favoriteTools, setFavoriteTools] = useState<Set<string>>(new Set());
  const [heartAnimations, setHeartAnimations] = useState<HeartAnimation[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Filter states
  const [categories, setCategories] = useState<Category[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Load favorites from localStorage on mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem('user_favourites');
    if (savedFavorites) {
      try {
        const favoriteIds = JSON.parse(savedFavorites);
        setFavoriteTools(new Set(favoriteIds.map((id: string | number) => String(id))));
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
          setFavoriteTools(new Set(favoriteIds.map((id: string | number) => String(id))));
        } catch (error) {
          console.error('Error updating favorites:', error);
        }
      }
    };

    window.addEventListener('favouritesChanged', handleFavoritesChanged);
    return () => window.removeEventListener('favouritesChanged', handleFavoritesChanged);
  }, []);

  // Load categories and roles
  useEffect(() => {
    const loadFiltersData = async () => {
      try {
        // Fetch categories
        const categoriesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/categories`);
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          setCategories(categoriesData || []);
        }
        
        // Fetch roles 
        const rolesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/roles`);
        if (rolesResponse.ok) {
          const rolesData = await rolesResponse.json();
          setRoles(rolesData || []);
        }
      } catch (error) {
        console.error('Error loading filter data:', error);
      }
    };
    
    loadFiltersData();
  }, []);

  useEffect(() => {
    const fetchTools = async () => {
      try {
        const response = await apiService.getTools();
        // Fix: response is already the data, and tools are in response.data array
        setTools(response.data || []);
      } catch (error) {
        console.error('Error fetching tools:', error);
        // Fallback with mock data if API fails
        setTools([
          {
            id: '1',
            name: 'GitHub Copilot',
            slug: 'github-copilot',
            description: 'AI-powered code completion and suggestions directly in your IDE',
            website_url: 'https://github.com/features/copilot',
            integration_type: 'api' as const,
            status: 'active' as const,
            pricing_model: { type: 'paid' as const, price: 10, currency: 'USD', billing_cycle: 'monthly' as const },
            features: ['Code completion', 'Function suggestions', 'Comment-based code generation'],
            average_rating: 4.5,
            created_at: '2024-01-01T00:00:00.000Z',
            updated_at: '2024-01-01T00:00:00.000Z'
          },
          {
            id: '2',
            name: 'ChatGPT',
            slug: 'chatgpt',
            description: 'Advanced AI assistant for coding, documentation, and problem-solving',
            website_url: 'https://chat.openai.com',
            integration_type: 'redirect' as const,
            status: 'active' as const,
            pricing_model: { type: 'freemium' as const, price: 20, currency: 'USD', billing_cycle: 'monthly' as const, free_tier: true },
            features: ['Code generation', 'Documentation', 'Debugging help', 'Architecture advice'],
            average_rating: 4.8,
            created_at: '2024-01-01T00:00:00.000Z',
            updated_at: '2024-01-01T00:00:00.000Z'
          },
          {
            id: '3',
            name: 'Figma AI',
            slug: 'figma-ai',
            description: 'AI-powered design tool for creating UI/UX designs and prototypes',
            website_url: 'https://figma.com',
            integration_type: 'redirect' as const,
            status: 'active' as const,
            pricing_model: { type: 'freemium' as const, price: 15, currency: 'USD', billing_cycle: 'monthly' as const, free_tier: true },
            features: ['Design generation', 'Auto-layout', 'Component suggestions'],
            average_rating: 4.3,
            created_at: '2024-01-01T00:00:00.000Z',
            updated_at: '2024-01-01T00:00:00.000Z'
          },
          {
            id: '4',
            name: 'Cypress',
            slug: 'cypress',
            description: 'End-to-end testing framework with AI-powered test generation',
            website_url: 'https://cypress.io',
            integration_type: 'api' as const,
            status: 'active' as const,
            pricing_model: { type: 'freemium' as const, price: 75, currency: 'USD', billing_cycle: 'monthly' as const, free_tier: true },
            features: ['E2E testing', 'Test recording', 'Visual testing'],
            average_rating: 4.2,
            created_at: '2024-01-01T00:00:00.000Z',
            updated_at: '2024-01-01T00:00:00.000Z'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchTools();
  }, []);

  const toggleFavorite = (tool: AiTool, event: React.MouseEvent) => {
    event.stopPropagation();
    
    const toolId = String(tool.id);
    const isFavorite = favoriteTools.has(toolId);
    
    // Update favorites
    const newFavorites = new Set(favoriteTools);
    if (isFavorite) {
      newFavorites.delete(toolId);
    } else {
      newFavorites.add(toolId);
      
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
    
    setFavoriteTools(newFavorites);
    
    // Save to localStorage
    const favoriteIds = Array.from(newFavorites);
    localStorage.setItem('user_favourites', JSON.stringify(favoriteIds));
    
    // Dispatch event to notify other components
    window.dispatchEvent(new CustomEvent('favouritesChanged'));
    
    // Optional: Call API to persist favorites on backend
    // apiService.toggleFavoriteTool(toolId).catch(console.error);
  };

  const filteredTools = tools.filter(tool => {
    // Search filter
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Category filter
    const matchesCategory = selectedCategory === 'all' || 
      (tool.categories && Array.isArray(tool.categories) && 
       tool.categories.some((cat: any) => 
         cat.slug === selectedCategory || cat.name === selectedCategory
       ));
    
    // Role filter
    const matchesRole = selectedRole === 'all' ||
      (tool.roles && Array.isArray(tool.roles) && 
       tool.roles.some((role: any) => 
         role.name === selectedRole || role.slug === selectedRole
       )) ||
      (tool.suggested_for_role && tool.suggested_for_role === selectedRole);
    
    return matchesSearch && matchesCategory && matchesRole;
  });

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
            AI Tools Library
          </h3>
          <p className="text-sm text-white opacity-60">
            Discover and explore curated AI tools for your workflow
          </p>
        </div>
        <button
          onClick={onBack}
          className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium text-white opacity-80 transition-all duration-200 hover:scale-105"
        >
          ← Back
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/10 backdrop-blur-sm border border-white/30 rounded-2xl px-4 py-3 pl-10 pr-12 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent text-sm"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white opacity-60">
            🔍
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-lg transition-all duration-200 ${
              showFilters ? 'bg-white/20 text-white' : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
            title="Toggle Filters"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.121A1 1 0 013 6.414V4z" />
            </svg>
          </button>
        </div>
        
        {/* Filter Controls */}
        {showFilters && (
          <div className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-2xl p-4 space-y-4 animate-fade-in">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Category Filter */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-white opacity-80 mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
                >
                  <option value="all" className="bg-gray-800 text-white">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.slug} className="bg-gray-800 text-white">
                      {category.name} {category.tools_count ? `(${category.tools_count})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Role Filter */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-white opacity-80 mb-2">
                  Suitable for Role
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
                >
                  <option value="all" className="bg-gray-800 text-white">All Roles</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.name} className="bg-gray-800 text-white">
                      {role.display_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Active Filters Display */}
            {(selectedCategory !== 'all' || selectedRole !== 'all') && (
              <div className="flex flex-wrap gap-2 pt-2 border-t border-white/20">
                <span className="text-xs text-white opacity-60">Active filters:</span>
                {selectedCategory !== 'all' && (
                  <span className="inline-flex items-center gap-1 bg-blue-500/20 text-blue-200 text-xs px-2 py-1 rounded-full">
                    {categories.find(cat => cat.slug === selectedCategory)?.name || selectedCategory}
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className="hover:bg-blue-500/30 rounded-full p-0.5 transition-colors"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}
                {selectedRole !== 'all' && (
                  <span className="inline-flex items-center gap-1 bg-green-500/20 text-green-200 text-xs px-2 py-1 rounded-full">
                    {roles.find(role => role.name === selectedRole)?.display_name || selectedRole}
                    <button
                      onClick={() => setSelectedRole('all')}
                      className="hover:bg-green-500/30 rounded-full p-0.5 transition-colors"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedRole('all');
                  }}
                  className="text-xs text-white/60 hover:text-white underline transition-colors"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tools Count */}
      <div className="mb-4">
        <p className="text-xs text-white opacity-60">
          {filteredTools.length} tool{filteredTools.length !== 1 ? 's' : ''} found
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
            <div className="text-white opacity-60">Loading tools...</div>
          </div>
        ) : filteredTools.length === 0 ? (
          <div className="flex justify-center items-center h-32">
            <div className="text-white opacity-60">
              {searchQuery ? 'No tools found matching your search.' : 'No tools available.'}
            </div>
          </div>
        ) : (
          filteredTools.map((tool) => (
            <div
              key={tool.id}
              onClick={() => onToolClick(tool)}
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
                  
                  {/* Categories and Roles Tags */}
                  <div className="flex flex-wrap gap-2 mb-2">
                    {tool.categories && Array.isArray(tool.categories) && tool.categories.length > 0 && (
                      tool.categories.slice(0, 2).map((category: any, index: number) => (
                        <span
                          key={index}
                          className="bg-blue-500/20 text-blue-200 text-xs px-2 py-1 rounded-full"
                        >
                          {category.name || category}
                        </span>
                      ))
                    )}
                    {tool.roles && Array.isArray(tool.roles) && tool.roles.length > 0 && (
                      tool.roles.slice(0, 2).map((role: any, index: number) => (
                        <span
                          key={index}
                          className="bg-green-500/20 text-green-200 text-xs px-2 py-1 rounded-full"
                        >
                          {role.display_name || role.name || role}
                        </span>
                      ))
                    )}
                  </div>
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
                  {/* Favorite Button */}
                  <button
                    onClick={(e) => toggleFavorite(tool, e)}
                    className={`relative p-2 rounded-full transition-all duration-300 hover:scale-110 ${
                      favoriteTools.has(String(tool.id))
                        ? 'text-red-500 bg-red-500/20 hover:bg-red-500/30'
                        : 'text-white/60 hover:text-red-400 hover:bg-red-500/20'
                    }`}
                    title={favoriteTools.has(String(tool.id)) ? "Remove from favorites" : "Add to favorites"}
                  >
                    <svg 
                      className={`w-5 h-5 transition-all duration-300 ${
                        favoriteTools.has(String(tool.id)) ? 'heart-animation' : ''
                      }`}
                      fill={favoriteTools.has(String(tool.id)) ? "currentColor" : "none"}
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
                      onToolClick(tool);
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