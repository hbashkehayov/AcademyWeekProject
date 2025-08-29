'use client';

import { useState, useEffect } from 'react';
import { apiService } from '@/lib/api';

interface AITool {
  id: string;
  name: string;
  slug?: string;
  description: string;
  detailed_description?: string;
  website_url: string;
  api_endpoint?: string;
  logo_url?: string;
  features?: string[];
  pricing_model?: any;
  suggested_for_role?: any;
  categories?: any[];
  integration_type?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface AllAIToolsProps {
  onBack: () => void;
}

export default function AllAITools({ onBack }: AllAIToolsProps) {
  const [tools, setTools] = useState<AITool[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTool, setEditingTool] = useState<AITool | null>(null);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    detailed_description: '',
    website_url: '',
    api_endpoint: '',
    logo_url: '',
    features: '',
    pricing_type: 'freemium',
    pricing_details: '',
    integration_type: 'redirect',
    status: 'active',
    suggested_role_id: '',
    category_ids: [] as string[],
  });
  const [availableRoles, setAvailableRoles] = useState<any[]>([]);
  const [availableCategories, setAvailableCategories] = useState<any[]>([]);
  
  // Computed filtered tools
  const filteredTools = tools.filter(tool => {
    // Search filter
    const matchesSearch = searchQuery === '' || 
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tool.detailed_description && tool.detailed_description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Category filter
    const matchesCategory = selectedCategory === 'all' || 
      (tool.categories && tool.categories.some((cat: any) => 
        cat.id.toString() === selectedCategory
      ));
    
    // Status filter
    const matchesStatus = selectedStatus === 'all' || tool.status === selectedStatus;
    
    // Role filter
    const matchesRole = selectedRole === 'all' || 
      (tool.suggested_for_role && tool.suggested_for_role.id.toString() === selectedRole);
    
    return matchesSearch && matchesCategory && matchesStatus && matchesRole;
  });

  useEffect(() => {
    fetchActiveTools();
    fetchRolesAndCategories();
  }, []);

  const fetchActiveTools = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/active-tools`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTools(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch active tools:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRolesAndCategories = async () => {
    try {
      // Fetch roles
      const rolesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/roles`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      if (rolesResponse.ok) {
        const rolesData = await rolesResponse.json();
        setAvailableRoles(rolesData.data || []);
      }

      // Fetch categories
      const categoriesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        setAvailableCategories(categoriesData.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch roles and categories:', error);
    }
  };

  const handleEdit = (tool: AITool) => {
    setEditingTool(tool);
    setFormData({
      name: tool.name,
      slug: tool.slug || '',
      description: tool.description,
      detailed_description: tool.detailed_description || '',
      website_url: tool.website_url,
      api_endpoint: tool.api_endpoint || '',
      logo_url: tool.logo_url || '',
      features: tool.features?.join(', ') || '',
      pricing_type: tool.pricing_model?.type || 'freemium',
      pricing_details: tool.pricing_model?.details || '',
      integration_type: tool.integration_type || 'redirect',
      status: tool.status || 'active',
      suggested_role_id: tool.suggested_for_role?.id || '',
      category_ids: tool.categories?.map((cat: any) => cat.id.toString()) || [],
    });
  };

  const handleSaveEdit = async () => {
    if (!editingTool) return;

    try {
      // First, get CSRF cookie
      const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000';
      await fetch(`${baseUrl}/sanctum/csrf-cookie`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        }
      });

      // Get CSRF token from cookies
      const getCsrfToken = () => {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
          const [name, value] = cookie.trim().split('=');
          if (name === 'XSRF-TOKEN') {
            return decodeURIComponent(value);
          }
        }
        return null;
      };

      const csrfToken = getCsrfToken();

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/tools/${editingTool.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-XSRF-TOKEN': csrfToken || '',
        },
        body: JSON.stringify({
          name: formData.name,
          slug: formData.slug,
          description: formData.description,
          detailed_description: formData.detailed_description,
          website_url: formData.website_url,
          api_endpoint: formData.api_endpoint || null,
          logo_url: formData.logo_url || null,
          features: formData.features.split(',').map(f => f.trim()).filter(f => f),
          pricing_model: { 
            type: formData.pricing_type,
            details: formData.pricing_details || null
          },
          integration_type: formData.integration_type,
          status: formData.status,
          suggested_for_role: formData.suggested_role_id || null,
          category_ids: formData.category_ids,
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Refresh the tools list
        fetchActiveTools();
        setEditingTool(null);
        alert('Tool updated successfully!');
      } else {
        const errorData = await response.json();
        alert('Failed to update tool: ' + (errorData.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error updating tool:', error);
      alert('Error updating tool');
    }
  };

  const handleRemove = async (toolId: string, toolName: string) => {
    if (!confirm(`Are you sure you want to remove "${toolName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      // First, get CSRF cookie
      const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000';
      await fetch(`${baseUrl}/sanctum/csrf-cookie`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        }
      });

      // Get CSRF token from cookies
      const getCsrfToken = () => {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
          const [name, value] = cookie.trim().split('=');
          if (name === 'XSRF-TOKEN') {
            return decodeURIComponent(value);
          }
        }
        return null;
      };

      const csrfToken = getCsrfToken();

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/tools/${toolId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'X-XSRF-TOKEN': csrfToken || '',
        }
      });

      if (response.ok) {
        setTools(prev => prev.filter(t => t.id !== toolId));
        alert('Tool removed successfully!');
      } else {
        alert('Failed to remove tool');
      }
    } catch (error) {
      console.error('Error removing tool:', error);
      alert('Error removing tool');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">All Active AI Tools</h2>
        <span className="text-sm text-white opacity-60">{filteredTools.length} of {tools.length} tools</span>
      </div>
      
      {/* Search and Filter Bar */}
      <div className="mb-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search tools by name, description, or features..."
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-white opacity-80 mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
                >
                  <option value="all" className="bg-gray-800 text-white">All Categories</option>
                  {availableCategories.map((category) => (
                    <option key={category.id} value={category.id} className="bg-gray-800 text-white">
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-white opacity-80 mb-2">
                  Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
                >
                  <option value="all" className="bg-gray-800 text-white">All Status</option>
                  <option value="active" className="bg-gray-800 text-white">Active</option>
                  <option value="pending" className="bg-gray-800 text-white">Pending</option>
                  <option value="archived" className="bg-gray-800 text-white">Archived</option>
                </select>
              </div>
              
              {/* Role Filter */}
              <div>
                <label className="block text-sm font-medium text-white opacity-80 mb-2">
                  Suggested Role
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
                >
                  <option value="all" className="bg-gray-800 text-white">All Roles</option>
                  {availableRoles.map((role) => (
                    <option key={role.id} value={role.id} className="bg-gray-800 text-white">
                      {role.display_name || role.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Clear Filters */}
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setSelectedStatus('all');
                    setSelectedRole('all');
                  }}
                  className="w-full px-4 py-2 bg-red-500/20 text-red-300 border border-red-500/30 rounded-xl hover:bg-red-500/30 transition-colors text-sm font-medium"
                >
                  Clear All
                </button>
              </div>
            </div>
            
            {/* Active Filters Display */}
            {(selectedCategory !== 'all' || selectedStatus !== 'all' || selectedRole !== 'all' || searchQuery !== '') && (
              <div className="flex flex-wrap gap-2 pt-2 border-t border-white/20">
                <span className="text-xs text-white opacity-60">Active filters:</span>
                {searchQuery && (
                  <span className="inline-flex items-center gap-1 bg-purple-500/20 text-purple-200 text-xs px-2 py-1 rounded-full">
                    Search: "{searchQuery}"
                    <button
                      onClick={() => setSearchQuery('')}
                      className="hover:bg-purple-500/30 rounded-full p-0.5 transition-colors"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}
                {selectedCategory !== 'all' && (
                  <span className="inline-flex items-center gap-1 bg-blue-500/20 text-blue-200 text-xs px-2 py-1 rounded-full">
                    {availableCategories.find(cat => cat.id.toString() === selectedCategory)?.name}
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
                {selectedStatus !== 'all' && (
                  <span className="inline-flex items-center gap-1 bg-green-500/20 text-green-200 text-xs px-2 py-1 rounded-full">
                    Status: {selectedStatus}
                    <button
                      onClick={() => setSelectedStatus('all')}
                      className="hover:bg-green-500/30 rounded-full p-0.5 transition-colors"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}
                {selectedRole !== 'all' && (
                  <span className="inline-flex items-center gap-1 bg-yellow-500/20 text-yellow-200 text-xs px-2 py-1 rounded-full">
                    {availableRoles.find(role => role.id.toString() === selectedRole)?.display_name || 'Role'}
                    <button
                      onClick={() => setSelectedRole('all')}
                      className="hover:bg-yellow-500/30 rounded-full p-0.5 transition-colors"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      
      {loading ? (
        <p className="text-white opacity-60">Loading...</p>
      ) : filteredTools.length > 0 ? (
        <div className={`space-y-4 ${filteredTools.length > 4 ? 'overflow-y-auto pr-2 all-tools-scrollbar' : ''}`}
             style={{ maxHeight: filteredTools.length > 4 ? '520px' : 'auto' }}>
          <style jsx>{`
            .all-tools-scrollbar::-webkit-scrollbar {
              width: 6px;
              background: transparent;
            }
            .all-tools-scrollbar::-webkit-scrollbar-track {
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
            .all-tools-scrollbar::-webkit-scrollbar-thumb {
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
            .all-tools-scrollbar::-webkit-scrollbar-thumb:hover {
              background: linear-gradient(
                180deg,
                rgba(255, 255, 255, 0.3) 0%,
                rgba(255, 255, 255, 0.4) 50%,
                rgba(255, 255, 255, 0.3) 100%
              );
              border: 1px solid rgba(255, 255, 255, 0.2);
              box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
            }
            .all-tools-scrollbar {
              scrollbar-width: thin;
              scrollbar-color: rgba(255, 255, 255, 0.3) rgba(255, 255, 255, 0.1);
            }
          `}</style>
          {filteredTools.map((tool) => (
            <div 
              key={tool.id}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-white">
                      {tool.name}
                    </h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      tool.status === 'active' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                      tool.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                      'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                    }`}>
                      {tool.status}
                    </span>
                  </div>
                  <p className="text-white opacity-70 mb-3">
                    {tool.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {tool.categories && tool.categories.slice(0, 3).map((category: any, index: number) => (
                      <span
                        key={index}
                        className="bg-blue-500/20 text-blue-200 text-xs px-2 py-1 rounded-full"
                      >
                        {category.name}
                      </span>
                    ))}
                    {tool.suggested_for_role && (
                      <span className="bg-purple-500/20 text-purple-200 text-xs px-2 py-1 rounded-full">
                        👤 {tool.suggested_for_role.display_name || tool.suggested_for_role.name}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-white opacity-50">
                    <span>🌐 {tool.website_url}</span>
                    <span>•</span>
                    <span>📅 {formatDate(tool.created_at)}</span>
                  </div>
                </div>
                
                <div className="ml-4 flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(tool)}
                    className="px-3 py-1.5 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleRemove(tool.id, tool.name)}
                    className="px-3 py-1.5 bg-red-500/20 text-red-300 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : tools.length === 0 ? (
        <p className="text-white opacity-60">No tools found</p>
      ) : (
        <div className="text-center py-8">
          <p className="text-white opacity-60 mb-4">No tools match your current filters</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setSelectedStatus('all');
              setSelectedRole('all');
            }}
            className="px-4 py-2 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* Edit Modal - Wider with all fields */}
      {editingTool && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-purple-800 to-purple-900 rounded-2xl p-8 max-w-6xl w-full max-h-[90vh] overflow-y-auto border border-white/20">
            <h3 className="text-3xl font-bold text-white mb-6">Edit Tool: {editingTool.name}</h3>
            
            <div className="grid grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-white opacity-80 mb-1 text-sm font-semibold">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-white/40"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white opacity-80 mb-1 text-sm font-semibold">Slug (URL-friendly name)</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({...formData, slug: e.target.value})}
                    placeholder="auto-generated-from-name"
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-white/40"
                  />
                </div>

                <div>
                  <label className="block text-white opacity-80 mb-1 text-sm font-semibold">Short Description *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-white/40"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white opacity-80 mb-1 text-sm font-semibold">Detailed Description</label>
                  <textarea
                    value={formData.detailed_description}
                    onChange={(e) => setFormData({...formData, detailed_description: e.target.value})}
                    rows={5}
                    placeholder="Comprehensive description of the tool's capabilities..."
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-white/40"
                  />
                </div>

                <div>
                  <label className="block text-white opacity-80 mb-1 text-sm font-semibold">Website URL *</label>
                  <input
                    type="url"
                    value={formData.website_url}
                    onChange={(e) => setFormData({...formData, website_url: e.target.value})}
                    placeholder="https://example.com"
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-white/40"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white opacity-80 mb-1 text-sm font-semibold">API Endpoint</label>
                  <input
                    type="url"
                    value={formData.api_endpoint}
                    onChange={(e) => setFormData({...formData, api_endpoint: e.target.value})}
                    placeholder="https://api.example.com/v1"
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-white/40"
                  />
                </div>

                <div>
                  <label className="block text-white opacity-80 mb-1 text-sm font-semibold">Logo URL</label>
                  <input
                    type="url"
                    value={formData.logo_url}
                    onChange={(e) => setFormData({...formData, logo_url: e.target.value})}
                    placeholder="https://example.com/logo.png"
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-white/40"
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-white opacity-80 mb-1 text-sm font-semibold">Features (comma separated)</label>
                  <textarea
                    value={formData.features}
                    onChange={(e) => setFormData({...formData, features: e.target.value})}
                    placeholder="Feature 1, Feature 2, Feature 3"
                    rows={3}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-white/40"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white opacity-80 mb-1 text-sm font-semibold">Pricing Type</label>
                    <select
                      value={formData.pricing_type}
                      onChange={(e) => setFormData({...formData, pricing_type: e.target.value})}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                      style={{ colorScheme: 'dark' }}
                    >
                      <option value="free" className="bg-gray-900 text-white">Free</option>
                      <option value="freemium" className="bg-gray-900 text-white">Freemium</option>
                      <option value="paid" className="bg-gray-900 text-white">Paid</option>
                      <option value="subscription" className="bg-gray-900 text-white">Subscription</option>
                      <option value="enterprise" className="bg-gray-900 text-white">Enterprise</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-white opacity-80 mb-1 text-sm font-semibold">Integration Type</label>
                    <select
                      value={formData.integration_type}
                      onChange={(e) => setFormData({...formData, integration_type: e.target.value})}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                      style={{ colorScheme: 'dark' }}
                    >
                      <option value="redirect" className="bg-gray-900 text-white">Redirect</option>
                      <option value="api" className="bg-gray-900 text-white">API</option>
                      <option value="iframe" className="bg-gray-900 text-white">iFrame</option>
                      <option value="extension" className="bg-gray-900 text-white">Extension</option>
                      <option value="plugin" className="bg-gray-900 text-white">Plugin</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-white opacity-80 mb-1 text-sm font-semibold">Pricing Details</label>
                  <input
                    type="text"
                    value={formData.pricing_details}
                    onChange={(e) => setFormData({...formData, pricing_details: e.target.value})}
                    placeholder="$10/month, $100/year, etc."
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-white/40"
                  />
                </div>

                <div>
                  <label className="block text-white opacity-80 mb-1 text-sm font-semibold">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                    style={{ colorScheme: 'dark' }}
                  >
                    <option value="active" className="bg-gray-900 text-white">Active</option>
                    <option value="pending" className="bg-gray-900 text-white">Pending</option>
                    <option value="archived" className="bg-gray-900 text-white">Archived</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white opacity-80 mb-1 text-sm font-semibold">Suggested for Role</label>
                  <select
                    value={formData.suggested_role_id}
                    onChange={(e) => setFormData({...formData, suggested_role_id: e.target.value})}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                    style={{ colorScheme: 'dark' }}
                  >
                    <option value="" className="bg-gray-900 text-white">No specific role</option>
                    {availableRoles.map(role => (
                      <option key={role.id} value={role.id} className="bg-gray-900 text-white">{role.display_name || role.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-white opacity-80 mb-1 text-sm font-semibold">Categories</label>
                  <div className="bg-white/5 rounded-lg p-3 max-h-40 overflow-y-auto">
                    {availableCategories.map(category => (
                      <label key={category.id} className="flex items-center space-x-2 py-1 hover:bg-white/5 px-2 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          value={category.id}
                          checked={formData.category_ids.includes(category.id.toString())}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({...formData, category_ids: [...formData.category_ids, category.id.toString()]});
                            } else {
                              setFormData({...formData, category_ids: formData.category_ids.filter(id => id !== category.id.toString())});
                            }
                          }}
                          className="rounded border-white/30 bg-white/10 text-purple-500 focus:ring-purple-400"
                        />
                        <span className="text-white/80 text-sm">{category.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-white opacity-80 mb-1 text-sm font-semibold">Tool ID</label>
                  <input
                    type="text"
                    value={editingTool.id}
                    disabled
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white/50"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center mt-8 pt-6 border-t border-white/20">
              <div className="text-white/60 text-sm">
                Last updated: {new Date(editingTool.updated_at).toLocaleString()}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setEditingTool(null)}
                  className="px-6 py-2.5 bg-gray-500/20 text-gray-300 border border-gray-500/30 rounded-lg hover:bg-gray-500/30 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-8 py-2.5 bg-gradient-to-r from-green-500/30 to-emerald-500/30 text-green-300 border border-green-500/30 rounded-lg hover:from-green-500/40 hover:to-emerald-500/40 transition-all font-medium shadow-lg"
                >
                  Save All Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}