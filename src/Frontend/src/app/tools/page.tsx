"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ToolCard from "@/components/ToolCard";
import { apiService } from "@/lib/api";
import type { AiTool, Category, Role } from "@/types";

export default function ToolsPage() {
  const [tools, setTools] = useState<AiTool[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedPricing, setSelectedPricing] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadTools();
  }, [searchQuery, selectedCategory, selectedRole, selectedPricing]);

  const loadData = async () => {
    try {
      const [categoriesData, rolesData] = await Promise.all([
        apiService.getCategories(),
        apiService.getRoles(),
      ]);
      setCategories(categoriesData);
      setRoles(rolesData);
      await loadTools();
    } catch (err) {
      setError('Failed to load data');
      console.error('Error loading data:', err);
    }
  };

  const loadTools = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      
      if (searchQuery) filters.search = searchQuery;
      if (selectedCategory) filters.category = selectedCategory;
      if (selectedRole) filters.role = selectedRole;
      if (selectedPricing) filters.pricing_type = selectedPricing;

      const response = await apiService.getTools(filters);
      setTools(response.data);
    } catch (err) {
      setError('Failed to load tools');
      console.error('Error loading tools:', err);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedRole("");
    setSelectedPricing("");
  };

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16 md:pb-20 lg:pb-24">
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <h3 className="text-lg font-medium text-red-800">Error</h3>
              <p className="text-red-600 mt-1">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="bg-gray-50 border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Tools Directory</h1>
            <p className="text-gray-600">Discover AI tools tailored to your development role</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16 md:pb-20 lg:pb-24">
          {/* Filters */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* Search */}
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                  Search
                </label>
                <input
                  id="search"
                  type="text"
                  placeholder="Search tools..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              {/* Category Filter */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  id="category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.slug}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Role Filter */}
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  id="role"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">All Roles</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.name}>
                      {role.display_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Pricing Filter */}
              <div>
                <label htmlFor="pricing" className="block text-sm font-medium text-gray-700 mb-1">
                  Pricing
                </label>
                <select
                  id="pricing"
                  value={selectedPricing}
                  onChange={(e) => setSelectedPricing(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">All Pricing</option>
                  <option value="free">Free</option>
                  <option value="freemium">Freemium</option>
                  <option value="paid">Paid</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={clearFilters}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Clear all filters
              </button>
              <p className="text-sm text-gray-600">
                {loading ? 'Loading...' : `${tools.length} tool${tools.length !== 1 ? 's' : ''} found`}
              </p>
            </div>
          </div>

          {/* Tools Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gray-300 rounded-md"></div>
                    <div>
                      <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
                      <div className="h-3 bg-gray-300 rounded w-16"></div>
                    </div>
                  </div>
                  <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : tools.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No tools found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your filters or search query to find the tools you're looking for.
                </p>
                <button
                  onClick={clearFilters}
                  className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}