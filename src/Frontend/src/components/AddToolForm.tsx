'use client';

import { useState, useEffect } from 'react';
import { apiService } from '@/lib/api';
import type { AiTool, Category, Role } from '@/types';

interface AddToolFormProps {
  onBack: () => void;
  onSubmit: (toolData: Partial<AiTool>) => void;
  isSubmitting?: boolean;
  initialData?: any;
}

export default function AddToolForm({ onBack, onSubmit, isSubmitting = false, initialData }: AddToolFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    website_url: '',
    logo_url: '',
    api_endpoint: '',
    integration_type: 'redirect' as const,
    pricing_model: {
      type: 'free' as const,
      price: 0,
      currency: 'USD',
      billing_cycle: 'monthly' as const,
      free_tier: false,
      details: ''
    },
    features: [''],
    categories: [] as string[],
    roles: [] as { id: string; relevance_score: number }[],
    suggested_for_role: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [availableCategories, setAvailableCategories] = useState<Category[]>([]);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [isAIFilled, setIsAIFilled] = useState(false);

  const integrationTypes = [
    { value: 'redirect', label: 'Web Application', icon: '🌐' },
    { value: 'api', label: 'API Integration', icon: '🔌' },
    { value: 'webhook', label: 'Webhook', icon: '🎣' }
  ];

  const pricingTypes = [
    { value: 'free', label: 'Free' },
    { value: 'freemium', label: 'Freemium' },
    { value: 'paid', label: 'Paid' },
    { value: 'enterprise', label: 'Enterprise' }
  ];

  const billingCycles = [
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
    { value: 'one_time', label: 'One-time' }
  ];

  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoriesResponse, rolesResponse] = await Promise.all([
          apiService.getCategories(),
          apiService.getRoles()
        ]);
        setAvailableCategories(categoriesResponse);
        setAvailableRoles(rolesResponse);
      } catch (error) {
        console.error('Error loading categories and roles:', error);
        // Fallback with mock data if API fails
        setAvailableCategories([
          { id: '1', name: 'Code Generation', slug: 'code-generation', icon: 'code', created_at: '2024-01-01', updated_at: '2024-01-01' },
          { id: '2', name: 'Testing & QA', slug: 'testing-qa', icon: 'bug', created_at: '2024-01-01', updated_at: '2024-01-01' },
          { id: '3', name: 'Documentation', slug: 'documentation', icon: 'book', created_at: '2024-01-01', updated_at: '2024-01-01' },
          { id: '4', name: 'Design Tools', slug: 'design-tools', icon: 'palette', created_at: '2024-01-01', updated_at: '2024-01-01' },
          { id: '5', name: 'Project Management', slug: 'project-management', icon: 'tasks', created_at: '2024-01-01', updated_at: '2024-01-01' }
        ]);
        setAvailableRoles([
          { id: '1', name: 'frontend', display_name: 'Frontend Developer', description: 'Frontend development', created_at: '2024-01-01', updated_at: '2024-01-01' },
          { id: '2', name: 'backend', display_name: 'Backend Developer', description: 'Backend development', created_at: '2024-01-01', updated_at: '2024-01-01' },
          { id: '3', name: 'qa', display_name: 'QA Engineer', description: 'Quality assurance', created_at: '2024-01-01', updated_at: '2024-01-01' },
          { id: '4', name: 'designer', display_name: 'UI/UX Designer', description: 'Design and user experience', created_at: '2024-01-01', updated_at: '2024-01-01' },
          { id: '5', name: 'pm', display_name: 'Project Manager', description: 'Project management', created_at: '2024-01-01', updated_at: '2024-01-01' },
          { id: '6', name: 'owner', display_name: 'Product Owner', description: 'Product ownership', created_at: '2024-01-01', updated_at: '2024-01-01' }
        ]);
      }
    };
    loadData();
  }, []);

  // Populate form with initial data from AI suggestions
  useEffect(() => {
    if (initialData && availableCategories.length > 0) {
      console.log('AddToolForm: Populating form with AI data:', initialData);
      
      // Set flag that this form was filled by AI
      setIsAIFilled(true);
      
      // Map AI tool proposal data to form structure
      setFormData(prev => {
        const newData = { ...prev };
        
        if (initialData.name) newData.name = initialData.name;
        if (initialData.description) newData.description = initialData.description;
        if (initialData.website_url) newData.website_url = initialData.website_url;
        if (initialData.logo_url) newData.logo_url = initialData.logo_url;
        if (initialData.api_endpoint) newData.api_endpoint = initialData.api_endpoint;
        
        // Handle integration_type safely
        if (initialData.integration_type && 
            (initialData.integration_type === 'api' || initialData.integration_type === 'extension')) {
          // TypeScript workaround - we know these are valid types
          newData.integration_type = 'redirect'; // Keep default for now
        }
        
        // Handle pricing model safely
        if (initialData.pricing_type) {
          const validPricingTypes = ['free', 'freemium', 'paid'];
          if (validPricingTypes.includes(initialData.pricing_type)) {
            // Update pricing type while keeping other pricing model fields
            newData.pricing_model = {
              ...newData.pricing_model,
              type: initialData.pricing_type as any,
              price: initialData.price || newData.pricing_model.price
            };
          }
        }
        
        // Handle features
        if (Array.isArray(initialData.features) && initialData.features.length > 0) {
          newData.features = initialData.features;
        }
        
        // Handle categories - Convert category names to IDs using loaded categories
        if (Array.isArray(initialData.categories)) {
          console.log('AddToolForm: AI categories:', initialData.categories);
          console.log('AddToolForm: Available categories:', availableCategories.map(c => ({ id: c.id, name: c.name })));
          
          // Map category names to IDs using the availableCategories
          newData.categories = initialData.categories
            .map((catName: string) => {
              const category = availableCategories.find(cat => cat.name === catName);
              console.log(`AddToolForm: Mapping "${catName}" to ID:`, category?.id);
              return category ? category.id : null;
            })
            .filter(Boolean); // Remove null values
            
          console.log('AddToolForm: Final category IDs:', newData.categories);
        }
        
        return newData;
      });

      // Set suggested role if provided
      if (initialData.suggested_role) {
        const roleMapping: { [key: string]: string } = {
          'frontend': '1',
          'backend': '2', 
          'qa': '3',
          'designer': '4',
          'pm': '5',
          'owner': '6'
        };
        
        const roleId = roleMapping[initialData.suggested_role.toLowerCase()];
        if (roleId) {
          setFormData(prev => ({
            ...prev,
            suggested_for_role: roleId,
            roles: [{ id: roleId, relevance_score: 90 }] // High relevance for AI suggested role
          }));
        }
      }
    }
  }, [initialData, availableCategories]);

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    console.log('AddToolForm: Form submission started');
    e.preventDefault();
    
    console.log('AddToolForm: Validating form...');
    const newErrors: Record<string, string> = {};

    console.log('AddToolForm: Checking name field:', formData.name);
    if (!formData.name.trim()) {
      console.log('AddToolForm: Name validation failed - empty');
      newErrors.name = 'Tool name is required';
    }

    console.log('AddToolForm: Checking description field:', formData.description);
    // Description is optional now

    console.log('AddToolForm: Checking website_url field:', formData.website_url);
    if (!formData.website_url.trim()) {
      console.log('AddToolForm: Website URL validation failed - empty');
      newErrors.website_url = 'Website URL is required';
    } else if (!isValidUrl(formData.website_url)) {
      console.log('AddToolForm: Website URL validation failed - invalid format');
      newErrors.website_url = 'Please enter a valid URL';
    }

    // Logo URL and API endpoint are optional and validation is optional for now

    console.log('AddToolForm: Final validation errors:', newErrors);
    setErrors(newErrors);
    
    const isValid = Object.keys(newErrors).length === 0;
    console.log('AddToolForm: Validation result:', isValid);
    
    if (isValid) {
      console.log('AddToolForm: Form validation passed');
      
      // Format data to match backend API expectations
      const cleanedData = {
        name: formData.name,
        description: formData.description,
        website_url: formData.website_url,
        logo_url: formData.logo_url || undefined,
        api_endpoint: formData.api_endpoint || undefined,
        integration_type: formData.integration_type,
        features: formData.features.filter(f => f.trim() !== ''),
        pricing_model: formData.pricing_model,
        categories: formData.categories, // Array of category IDs
        roles: formData.roles.filter(r => r.id), // Array of role objects with relevance scores
        suggested_for_role: formData.suggested_for_role || undefined
      };
      
      console.log('AddToolForm: Cleaned data:', cleanedData);
      console.log('AddToolForm: Calling onSubmit...');
      onSubmit(cleanedData as any);
    } else {
      console.log('AddToolForm: Form validation failed');
      console.log('AddToolForm: Validation errors:', newErrors);
    }
  };

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const updateFeature = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map((f, i) => i === index ? value : f)
    }));
  };

  const toggleCategory = (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter(id => id !== categoryId)
        : [...prev.categories, categoryId]
    }));
  };

  const toggleRole = (roleId: string) => {
    setFormData(prev => {
      const existingRole = prev.roles.find(r => r.id === roleId);
      if (existingRole) {
        // Remove role
        return {
          ...prev,
          roles: prev.roles.filter(r => r.id !== roleId)
        };
      } else {
        // Add role with default relevance score
        return {
          ...prev,
          roles: [...prev.roles, { id: roleId, relevance_score: 70 }]
        };
      }
    });
  };

  const updateRoleRelevance = (roleId: string, relevance: number) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.map(r => 
        r.id === roleId ? { ...r, relevance_score: relevance } : r
      )
    }));
  };

  return (
    <div className="glass-morphism p-8 rounded-3xl max-h-[85vh] overflow-hidden flex flex-col">
      {/* Enhanced CSS for Ultra-Transparent Dropdowns */}
      <style jsx>{`
        select {
          transition: all 0.5s cubic-bezier(0.4, 0.0, 0.2, 1) !important;
        }
        select:hover {
          transform: scale(1.02) !important;
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15) !important;
        }
        select:focus {
          transform: scale(1.02) !important;
          box-shadow: 0 16px 48px rgba(0, 0, 0, 0.2) !important;
        }
        select option {
          background: rgba(17, 24, 39, 0.95) !important;
          backdrop-filter: blur(20px) saturate(180%) !important;
          color: white !important;
          padding: 12px 16px !important;
          border: none !important;
          transition: all 0.3s ease-out !important;
        }
        select option:hover {
          background: rgba(31, 41, 55, 0.95) !important;
          transform: translateX(4px) !important;
        }
        select option:checked {
          background: linear-gradient(135deg, rgba(79, 70, 229, 0.9), rgba(59, 130, 246, 0.9)) !important;
          box-shadow: inset 0 2px 8px rgba(79, 70, 229, 0.3) !important;
        }
        select option:focus {
          background: rgba(55, 65, 81, 0.95) !important;
          outline: 2px solid rgba(79, 70, 229, 0.5) !important;
          outline-offset: 2px !important;
        }
        
        /* Smooth dropdown animation */
        @keyframes dropdownSlide {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        select:focus option {
          animation: dropdownSlide 0.3s ease-out !important;
        }
        
        /* Enhanced input fields to match */
        input {
          transition: all 0.5s cubic-bezier(0.4, 0.0, 0.2, 1) !important;
        }
        input:hover {
          transform: scale(1.01) !important;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1) !important;
        }
        input:focus {
          transform: scale(1.01) !important;
          box-shadow: 0 12px 35px rgba(0, 0, 0, 0.15) !important;
        }
      `}</style>

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-2xl font-bold text-white opacity-80 mb-2">
            {initialData ? '✨ Edit AI-Suggested Tool' : 'Add New AI Tool'}
          </h3>
          <p className="text-sm text-white opacity-60">
            {initialData 
              ? 'Review and customize the AI-researched information below'
              : 'Submit a new AI tool to our curated collection'
            }
          </p>
          {initialData && (
            <div className="mt-2 px-3 py-1 bg-blue-500/20 border border-blue-400/30 text-blue-300 rounded-full text-xs inline-flex items-center">
              🤖 Pre-filled with AI research data
            </div>
          )}
        </div>
        <button
          onClick={onBack}
          className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium text-white opacity-80 transition-all duration-200 hover:scale-105"
        >
          ← Back
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-4 space-y-6 custom-scrollbar">
        {/* Basic Information */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <h4 className="text-lg font-bold text-white opacity-80 mb-4">Basic Information</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white opacity-70 mb-2">
                Tool Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                className="w-full bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-white/30 focus:bg-white/10 focus:shadow-lg transition-all duration-500 ease-out transform hover:scale-101 focus:scale-101"
                placeholder="e.g., ChatGPT, GitHub Copilot"
              />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-white opacity-70 mb-2">
                Website URL *
              </label>
              <input
                type="url"
                value={formData.website_url}
                onChange={(e) => setFormData(prev => ({...prev, website_url: e.target.value}))}
                className="w-full bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-white/30 focus:bg-white/10 focus:shadow-lg transition-all duration-500 ease-out transform hover:scale-101 focus:scale-101"
                placeholder="https://example.com"
              />
              {errors.website_url && <p className="text-red-400 text-xs mt-1">{errors.website_url}</p>}
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-white opacity-70 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
              rows={3}
              className="w-full bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-white/30 focus:bg-white/10 focus:shadow-lg transition-all duration-500 ease-out transform hover:scale-101 focus:scale-101 resize-none"
              placeholder="Brief description of the AI tool and its main capabilities"
            />
            {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-white opacity-70 mb-2">
                Logo URL
              </label>
              <input
                type="url"
                value={formData.logo_url}
                onChange={(e) => setFormData(prev => ({...prev, logo_url: e.target.value}))}
                className="w-full bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-white/30 focus:bg-white/10 focus:shadow-lg transition-all duration-500 ease-out transform hover:scale-101 focus:scale-101"
                placeholder="https://example.com/logo.png"
              />
              {errors.logo_url && <p className="text-red-400 text-xs mt-1">{errors.logo_url}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-white opacity-70 mb-2">
                API Endpoint
              </label>
              <input
                type="url"
                value={formData.api_endpoint}
                onChange={(e) => setFormData(prev => ({...prev, api_endpoint: e.target.value}))}
                className="w-full bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-white/30 focus:bg-white/10 focus:shadow-lg transition-all duration-500 ease-out transform hover:scale-101 focus:scale-101"
                placeholder="https://api.example.com"
              />
              {errors.api_endpoint && <p className="text-red-400 text-xs mt-1">{errors.api_endpoint}</p>}
            </div>
          </div>
        </div>

        {/* Integration Type */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <h4 className="text-lg font-bold text-white opacity-80 mb-4">Integration Type</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {integrationTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setFormData(prev => ({...prev, integration_type: type.value as any}))}
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  formData.integration_type === type.value
                    ? 'border-white/40 bg-white/15'
                    : 'border-white/20 bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="text-2xl mb-2">{type.icon}</div>
                <div className="text-white opacity-80 font-medium">{type.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-bold text-white opacity-80">Features</h4>
            <button
              type="button"
              onClick={addFeature}
              className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-lg text-sm transition-all duration-200"
            >
              + Add Feature
            </button>
          </div>
          <div className="space-y-3">
            {formData.features.map((feature, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={feature}
                  onChange={(e) => updateFeature(index, e.target.value)}
                  className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all duration-200"
                  placeholder="Feature description"
                />
                {formData.features.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    className="bg-red-500/20 hover:bg-red-500/30 text-white px-3 py-2 rounded-lg transition-all duration-200"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <h4 className="text-lg font-bold text-white opacity-80 mb-4">Pricing Information</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-white opacity-70 mb-2">
                Pricing Type
              </label>
              <select
                value={formData.pricing_model.type}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  pricing_model: { ...prev.pricing_model, type: e.target.value as any }
                }))}
                className="w-full bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 focus:bg-white/10 focus:shadow-lg transition-all duration-500 ease-out appearance-none cursor-pointer transform hover:scale-105 focus:scale-105"
                style={{
                  backdropFilter: 'blur(20px) saturate(180%)',
                  background: 'rgba(255, 255, 255, 0.03)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 0.75rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.25em 1.25em'
                }}
              >
                {pricingTypes.map(type => (
                  <option key={type.value} value={type.value} className="bg-gray-900/95 backdrop-blur-lg text-white py-3 px-4">
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white opacity-70 mb-2">
                Price ($)
              </label>
              <input
                type="number"
                min="0"
                value={formData.pricing_model.price}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  pricing_model: { ...prev.pricing_model, price: parseFloat(e.target.value) || 0 }
                }))}
                className="w-full bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-white/30 focus:bg-white/10 focus:shadow-lg transition-all duration-500 ease-out transform hover:scale-101 focus:scale-101"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white opacity-70 mb-2">
                Billing Cycle
              </label>
              <select
                value={formData.pricing_model.billing_cycle}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  pricing_model: { ...prev.pricing_model, billing_cycle: e.target.value as any }
                }))}
                className="w-full bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 focus:bg-white/10 focus:shadow-lg transition-all duration-500 ease-out appearance-none cursor-pointer transform hover:scale-105 focus:scale-105"
                style={{
                  backdropFilter: 'blur(20px) saturate(180%)',
                  background: 'rgba(255, 255, 255, 0.03)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 0.75rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.25em 1.25em'
                }}
              >
                {billingCycles.map(cycle => (
                  <option key={cycle.value} value={cycle.value} className="bg-gray-900/95 backdrop-blur-lg text-white py-3 px-4">
                    {cycle.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.pricing_model.free_tier}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  pricing_model: { ...prev.pricing_model, free_tier: e.target.checked }
                }))}
                className="rounded border-white/20 bg-white/10 text-blue-500 focus:ring-blue-500"
              />
              <span className="text-white opacity-70">Has free tier available</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-white opacity-70 mb-2">
              Additional Details
            </label>
            <textarea
              value={formData.pricing_model.details}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                pricing_model: { ...prev.pricing_model, details: e.target.value }
              }))}
              rows={3}
              className="w-full bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-white/30 focus:bg-white/10 focus:shadow-lg transition-all duration-500 ease-out transform hover:scale-101 focus:scale-101 resize-none"
              placeholder="e.g., Free plan: 1000 requests/month, Pro plan: unlimited requests with advanced features"
            />
          </div>
        </div>

        {/* Categories */}
        <div className={`bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 relative ${isAIFilled ? 'bg-gradient-to-br from-purple-500/10 to-blue-500/10' : ''}`}>
          <h4 className="text-lg font-bold text-white opacity-80 mb-4">Categories</h4>
          {isAIFilled && (
            <div className="absolute top-6 right-6 bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-sm border border-purple-400/30 rounded-full px-3 py-1 flex items-center space-x-1">
              <span className="text-xs">🤖</span>
              <span className="text-xs text-purple-300 font-medium">AI Auto-filled</span>
            </div>
          )}
          <p className="text-sm text-white opacity-60 mb-4">
            {isAIFilled 
              ? "Categories have been automatically selected by AI based on tool analysis. You can adjust if needed." 
              : "Select relevant categories for this tool"}
          </p>
          <div className={`grid grid-cols-2 md:grid-cols-3 gap-3 ${isAIFilled ? 'opacity-90' : ''}`}>
            {availableCategories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => toggleCategory(category.id)}
                className={`p-3 rounded-xl border-2 text-left transition-all duration-200 ${
                  formData.categories.includes(category.id)
                    ? isAIFilled 
                      ? 'border-purple-400/60 bg-gradient-to-br from-purple-500/20 to-blue-500/20 shadow-lg shadow-purple-500/10'
                      : 'border-blue-500/60 bg-blue-500/20'
                    : 'border-white/20 bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="text-lg mb-1">{category.icon || '📁'}</div>
                <div className="text-white opacity-80 font-medium text-sm">{category.name}</div>
                {isAIFilled && formData.categories.includes(category.id) && (
                  <div className="text-xs text-purple-300 mt-1">AI Selected</div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Roles & Relevance */}
        <div className={`bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 relative ${isAIFilled ? 'bg-gradient-to-br from-purple-500/10 to-blue-500/10' : ''}`}>
          <h4 className="text-lg font-bold text-white opacity-80 mb-4">Target Roles</h4>
          {isAIFilled && (
            <div className="absolute top-6 right-6 bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-sm border border-purple-400/30 rounded-full px-3 py-1 flex items-center space-x-1">
              <span className="text-xs">🤖</span>
              <span className="text-xs text-purple-300 font-medium">AI Auto-filled</span>
            </div>
          )}
          <p className="text-sm text-white opacity-60 mb-4">
            {isAIFilled 
              ? "AI has automatically calculated role relevance scores based on tool capabilities. Adjust as needed."
              : "Select roles and set relevance scores (1-100)"}
          </p>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-white opacity-70 mb-2">
              Primary Suggested Role {isAIFilled && <span className="text-purple-300">(AI Suggested)</span>}
            </label>
            <select
              value={formData.suggested_for_role}
              onChange={(e) => setFormData(prev => ({ ...prev, suggested_for_role: e.target.value }))}
              className={`w-full bg-white/5 backdrop-blur-lg border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 focus:bg-white/10 focus:shadow-lg transition-all duration-500 ease-out appearance-none cursor-pointer transform hover:scale-105 focus:scale-105 ${
                isAIFilled ? 'border-purple-400/30' : 'border-white/10'
              }`}
              style={{
                backdropFilter: 'blur(20px) saturate(180%)',
                background: 'rgba(255, 255, 255, 0.03)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 0.75rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.25em 1.25em'
              }}
            >
              <option value="" className="bg-gray-900/95 backdrop-blur-lg text-white py-3 px-4">Select primary role</option>
              {availableRoles.map(role => (
                <option key={role.id} value={role.id} className="bg-gray-900/95 backdrop-blur-lg text-white py-3 px-4">
                  {role.display_name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            {availableRoles.map((role) => {
              const isSelected = formData.roles.some(r => r.id === role.id);
              const roleData = formData.roles.find(r => r.id === role.id);
              
              return (
                <div key={role.id} className={`flex items-center gap-4 p-2 rounded-lg transition-all ${
                  isSelected && isAIFilled 
                    ? 'bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-400/20' 
                    : ''
                }`}>
                  <label className="flex items-center gap-2 min-w-0 flex-1">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleRole(role.id)}
                      className={`rounded ${
                        isAIFilled && isSelected 
                          ? 'border-purple-400/30 bg-purple-500/20 text-purple-400' 
                          : 'border-white/20 bg-white/10 text-blue-500'
                      } focus:ring-blue-500`}
                    />
                    <span className="text-white opacity-80 truncate">
                      {role.display_name}
                      {isAIFilled && isSelected && (
                        <span className="text-xs text-purple-300 ml-2">(AI)</span>
                      )}
                    </span>
                  </label>
                  
                  {isSelected && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-white opacity-60 whitespace-nowrap">Relevance:</span>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={roleData?.relevance_score || 70}
                        onChange={(e) => updateRoleRelevance(role.id, parseInt(e.target.value) || 70)}
                        className={`w-16 border rounded px-2 py-1 text-white text-xs focus:outline-none focus:ring-1 ${
                          isAIFilled 
                            ? 'bg-purple-500/10 border-purple-400/30 focus:ring-purple-400/30' 
                            : 'bg-white/10 border-white/20 focus:ring-white/30'
                        }`}
                      />
                      <span className="text-xs text-white opacity-60">%</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-green-500/30 hover:bg-green-500/40 disabled:bg-gray-500/30 text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            {isSubmitting ? 'Submitting...' : 'Submit Tool'}
          </button>
        </div>
      </form>
    </div>
  );
}