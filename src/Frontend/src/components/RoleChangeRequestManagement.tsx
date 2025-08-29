'use client';

import { useState, useEffect } from 'react';
import { apiService } from '@/lib/api';

interface RoleChangeRequest {
  id: string;
  user: {
    id: string;
    name: string;
    display_name: string;
    email: string;
  };
  current_role: {
    id: string;
    name: string;
    display_name: string;
  };
  requested_role: {
    id: string;
    name: string;
    display_name: string;
  };
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

interface RoleChangeRequestManagementProps {
  onBack: () => void;
}

export default function RoleChangeRequestManagement({ onBack }: RoleChangeRequestManagementProps) {
  const [requests, setRequests] = useState<RoleChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const data = await apiService.getAllPendingRoleChangeRequests();
      setRequests(data);
    } catch (error) {
      console.error('Error loading role change requests:', error);
      setMessage({ type: 'error', text: 'Failed to load role change requests' });
    } finally {
      setLoading(false);
    }
  };

  const handleProcess = async (requestId: string, action: 'approve' | 'reject', adminComment?: string) => {
    setProcessing(requestId);
    try {
      await apiService.processRoleChangeRequest(requestId, action, adminComment);
      setMessage({ 
        type: 'success', 
        text: `Role change request ${action === 'approve' ? 'approved' : 'rejected'} successfully!` 
      });
      // Remove the processed request from the list
      setRequests(requests.filter(req => req.id !== requestId));
    } catch (error) {
      console.error(`Error ${action}ing role change request:`, error);
      setMessage({ type: 'error', text: `Failed to ${action} role change request` });
    } finally {
      setProcessing(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="glass-morphism rounded-3xl p-8 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-white/70">Loading role change requests...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <button
            onClick={onBack}
            className="flex items-center text-white/60 hover:text-white transition-colors duration-300 mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Admin Panel
          </button>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Role Change Requests</h1>
          <p className="text-white/70">Review and process user role change requests</p>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl px-6 py-4 border border-white/20">
          <div className="text-center">
            <div className="text-3xl font-bold text-white">{requests.length}</div>
            <div className="text-white/70 text-sm">Pending Requests</div>
          </div>
        </div>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`glass-morphism rounded-2xl p-4 mb-6 ${
          message.type === 'success' 
            ? 'bg-green-500/20 border-green-500/30' 
            : 'bg-red-500/20 border-red-500/30'
        }`}>
          <p className="text-white font-medium">{message.text}</p>
        </div>
      )}

      {/* Requests List */}
      {requests.length === 0 ? (
        <div className="glass-morphism rounded-3xl p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-6 bg-white/10 rounded-full flex items-center justify-center">
            <span className="text-3xl">✅</span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">No Pending Requests</h3>
          <p className="text-white/70">All role change requests have been processed!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request.id} className="glass-morphism rounded-3xl p-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
                {/* Request Details */}
                <div className="flex-1">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-4">
                      <span className="text-xl font-bold text-white">
                        {request.user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg">
                        {request.user.display_name || request.user.name}
                      </h3>
                      <p className="text-white/60 text-sm">{request.user.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="text-white/80 font-medium mb-2">Role Change</h4>
                      <div className="flex items-center space-x-3">
                        <span className="px-3 py-1 bg-red-500/20 text-red-200 rounded-lg text-sm font-medium">
                          {request.current_role.display_name}
                        </span>
                        <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        <span className="px-3 py-1 bg-green-500/20 text-green-200 rounded-lg text-sm font-medium">
                          {request.requested_role.display_name}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-white/80 font-medium mb-2">Request Date</h4>
                      <p className="text-white/70 text-sm">{formatDate(request.created_at)}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-white/80 font-medium mb-2">Reason</h4>
                    <p className="text-white/70 bg-white/5 rounded-lg p-3 text-sm leading-relaxed">
                      {request.reason}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row lg:flex-col space-y-3 sm:space-y-0 sm:space-x-3 lg:space-x-0 lg:space-y-3 lg:ml-6">
                  <button
                    onClick={() => handleProcess(request.id, 'approve')}
                    disabled={processing === request.id}
                    className="px-6 py-3 bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-green-500/20 whitespace-nowrap"
                  >
                    {processing === request.id ? 'Processing...' : 'Approve'}
                  </button>
                  
                  <button
                    onClick={() => handleProcess(request.id, 'reject')}
                    disabled={processing === request.id}
                    className="px-6 py-3 bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-red-500/20 whitespace-nowrap"
                  >
                    {processing === request.id ? 'Processing...' : 'Reject'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}