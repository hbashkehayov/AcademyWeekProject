'use client';

import { useState, useEffect } from 'react';
import { apiService } from '@/lib/api';
import type { AiTool } from '@/types';

interface ToolsListProps {
  onBack: () => void;
  onToolClick: (tool: AiTool) => void;
}

export default function ToolsList({ onBack, onToolClick }: ToolsListProps) {
  const [tools, setTools] = useState<AiTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchTools = async () => {
      try {
        const response = await apiService.getTools();
        setTools(response.data);
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

  const filteredTools = tools.filter(tool =>
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
    <div className="glass-morphism p-8 rounded-3xl max-h-[80vh] overflow-hidden flex flex-col">
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

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search tools..."
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
                <div className="flex gap-2">
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
    </div>
  );
}