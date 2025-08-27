'use client';

import { useState } from 'react';

interface PendingToolDetailsProps {
  tool: any;
  onBack: () => void;
  onApprove: (toolId: string) => void;
  onReject: (toolId: string) => void;
}

export default function PendingToolDetails({ tool, onBack, onApprove, onReject }: PendingToolDetailsProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRejectReason, setShowRejectReason] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

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

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      // Get CSRF cookie first
      const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000';
      await fetch(`${baseUrl}/sanctum/csrf-cookie`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        }
      });

      const csrfToken = getCsrfToken();

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/tools/${tool.id}/approve`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-XSRF-TOKEN': csrfToken || '',
        }
      });

      if (response.ok) {
        onApprove(tool.id);
        onBack();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to approve tool');
      }
    } catch (error) {
      console.error('Error approving tool:', error);
      alert('Failed to approve tool');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!showRejectReason) {
      setShowRejectReason(true);
      return;
    }

    if (!rejectReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    setIsProcessing(true);
    try {
      // Get CSRF cookie first
      const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000';
      await fetch(`${baseUrl}/sanctum/csrf-cookie`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        }
      });

      const csrfToken = getCsrfToken();

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/tools/${tool.id}/reject`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-XSRF-TOKEN': csrfToken || '',
        },
        body: JSON.stringify({ reason: rejectReason })
      });

      if (response.ok) {
        onReject(tool.id);
        onBack();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to reject tool');
      }
    } catch (error) {
      console.error('Error rejecting tool:', error);
      alert('Failed to reject tool');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="glass-morphism rounded-2xl p-8 shadow-2xl">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center text-white/70 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Pending Tools
        </button>
        
        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-sm font-medium">
            Pending Review
          </span>
        </div>
      </div>

      {/* Tool Details */}
      <div className="space-y-6">
        {/* Title and Basic Info */}
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">{tool.name}</h2>
          <div className="flex flex-wrap gap-4 text-sm text-white/60 mb-4">
            {tool.slug && <span>Slug: {tool.slug}</span>}
            <span>Status: <span className="text-yellow-400 capitalize">{tool.status}</span></span>
            <span>Integration: <span className="text-blue-400 capitalize">{tool.integration_type?.replace('_', ' ')}</span></span>
          </div>
          
          {/* URLs */}
          <div className="space-y-2">
            {tool.website_url && (
              <div>
                <span className="text-white/70 text-sm">Website: </span>
                <a 
                  href={tool.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  {tool.website_url}
                </a>
              </div>
            )}
            {tool.api_endpoint && (
              <div>
                <span className="text-white/70 text-sm">API Endpoint: </span>
                <a 
                  href={tool.api_endpoint}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-400 hover:text-green-300 transition-colors"
                >
                  {tool.api_endpoint}
                </a>
              </div>
            )}
            {tool.logo_url && (
              <div>
                <span className="text-white/70 text-sm">Logo: </span>
                <a 
                  href={tool.logo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 transition-colors"
                >
                  {tool.logo_url}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <h3 className="text-lg font-semibold text-white/90 mb-2">Description</h3>
          <p className="text-white/70 leading-relaxed">{tool.description}</p>
        </div>

        {/* Detailed Description */}
        {tool.detailed_description && (
          <div>
            <h3 className="text-lg font-semibold text-white/90 mb-2">Detailed Description</h3>
            <p className="text-white/70 leading-relaxed whitespace-pre-wrap">{tool.detailed_description}</p>
          </div>
        )}

        {/* Features */}
        {tool.features && tool.features.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-white/90 mb-2">Features</h3>
            <ul className="space-y-2">
              {tool.features.map((feature: string, index: number) => (
                <li key={index} className="flex items-start">
                  <svg className="w-5 h-5 text-green-400 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-white/70">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Pricing */}
        {tool.pricing_model && (
          <div>
            <h3 className="text-lg font-semibold text-white/90 mb-2">Pricing</h3>
            <div className="bg-white/5 rounded-lg p-4">
              {tool.pricing_model.free_tier && (
                <p className="text-green-400 mb-2">✓ Free tier available</p>
              )}
              {tool.pricing_model.plans && (
                <div className="space-y-2">
                  {Object.entries(tool.pricing_model.plans).map(([plan, price]: [string, any]) => (
                    <div key={plan} className="flex justify-between">
                      <span className="text-white/70 capitalize">{plan}:</span>
                      <span className="text-white font-medium">{price}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Suggested Role */}
        {tool.suggested_for_role && (
          <div>
            <h3 className="text-lg font-semibold text-white/90 mb-2">Suggested For</h3>
            <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm font-medium capitalize">
              {typeof tool.suggested_for_role === 'string' 
                ? tool.suggested_for_role 
                : tool.suggested_for_role.display_name || tool.suggested_for_role.name
              }
            </span>
          </div>
        )}

        {/* Categories */}
        {tool.categories && tool.categories.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-white/90 mb-2">Categories</h3>
            <div className="flex flex-wrap gap-2">
              {tool.categories.map((category: any, index: number) => (
                <span 
                  key={category.id || index}
                  className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm"
                  title={category.description || undefined}
                >
                  {typeof category === 'string' ? category : category.name}
                  {category.icon && <span className="ml-1">{category.icon}</span>}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Integration Type */}
        {tool.integration_type && (
          <div>
            <h3 className="text-lg font-semibold text-white/90 mb-2">Integration Type</h3>
            <span className="text-white/70 capitalize">{tool.integration_type.replace('_', ' ')}</span>
          </div>
        )}

        {/* Submission Information */}
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <h3 className="text-lg font-semibold text-white/90 mb-3">Submission Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-white/60">Submitted At</p>
              <p className="text-white">{new Date(tool.submitted_at).toLocaleString()}</p>
            </div>
            {tool.updated_at && tool.updated_at !== tool.submitted_at && (
              <div>
                <p className="text-sm text-white/60">Last Modified</p>
                <p className="text-white">{new Date(tool.updated_at).toLocaleString()}</p>
              </div>
            )}
            {tool.submitted_by_user && (
              <div className="md:col-span-2">
                <p className="text-sm text-white/60 mb-2">Submitted By</p>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {tool.submitted_by_user.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-medium">{tool.submitted_by_user.name}</p>
                    <p className="text-white/50 text-sm">{tool.submitted_by_user.email}</p>
                    {tool.submitted_by_user.role && (
                      <p className="text-blue-400 text-xs">{tool.submitted_by_user.role}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Additional Details */}
        {tool.detailed_description && (
          <div>
            <h3 className="text-lg font-semibold text-white/90 mb-2">Additional Details</h3>
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <p className="text-white/70 leading-relaxed whitespace-pre-wrap">{tool.detailed_description}</p>
            </div>
          </div>
        )}

        {/* Rejection Reason Input */}
        {showRejectReason && (
          <div className="mt-6 p-4 bg-red-500/10 rounded-lg border border-red-500/30">
            <label className="block text-white/90 mb-2">Reason for Rejection</label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-red-400"
              rows={3}
              placeholder="Please provide a reason for rejecting this tool..."
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-white/10">
          <button
            onClick={onBack}
            className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            disabled={isProcessing}
          >
            Cancel
          </button>
          
          <button
            onClick={handleReject}
            className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50"
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : showRejectReason ? 'Confirm Rejection' : 'Reject'}
          </button>
          
          {!showRejectReason && (
            <button
              onClick={handleApprove}
              className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors disabled:opacity-50"
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Approve'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}