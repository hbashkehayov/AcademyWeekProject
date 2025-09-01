'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { apiService } from '@/lib/api';

interface SettingsProps {
  user?: {
    name: string;
    display_name: string;
    email: string;
    role: string;
    phone_number?: string;
  };
  onBack: () => void;
}

interface Role {
  id: string;
  name: string;
  display_name: string;
}

interface UserProfile {
  id: string;
  name: string;
  display_name?: string;
  email: string;
  phone_number?: string;
  role?: {
    id: string;
    name: string;
    display_name: string;
  };
  organization?: {
    id: string;
    name: string;
  };
  two_factor_enabled?: boolean;
}

interface RoleChangeRequest {
  id: string;
  requested_role: Role;
  current_role: Role;
  status: 'pending' | 'approved' | 'rejected';
  reason?: string;
  created_at: string;
}

export default function Settings({ user, onBack }: SettingsProps) {
  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'roleRequest'>('profile');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [roleChangeRequests, setRoleChangeRequests] = useState<RoleChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    display_name: '',
    email: '',
    phone_number: ''
  });
  
  // Role change request state
  const [roleChangeForm, setRoleChangeForm] = useState({
    requested_role_id: '',
    reason: ''
  });

  useEffect(() => {
    loadUserProfile();
    loadAvailableRoles();
    loadRoleChangeRequests();
  }, []);

  const loadUserProfile = async () => {
    try {
      const profile = await apiService.getUserProfile();
      setUserProfile(profile);
      setFormData({
        name: profile.name || '',
        display_name: profile.display_name || '',
        email: profile.email || '',
        phone_number: profile.phone_number || ''
      });
    } catch (error) {
      console.error('Error loading user profile:', error);
      setMessage({ type: 'error', text: 'Failed to load user profile' });
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableRoles = async () => {
    try {
      const roles = await apiService.getAllRoles();
      setAvailableRoles(roles);
    } catch (error) {
      console.error('Error loading roles:', error);
    }
  };

  const loadRoleChangeRequests = async () => {
    try {
      const requests = await apiService.getUserRoleChangeRequests();
      setRoleChangeRequests(requests);
    } catch (error) {
      console.error('Error loading role change requests:', error);
    }
  };

  const handleProfileUpdate = async () => {
    setSaving(true);
    try {
      const updatedProfile = await apiService.updateUserProfile(formData);
      setUserProfile(updatedProfile);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  const handleRoleChangeRequest = async () => {
    if (!roleChangeForm.requested_role_id || !roleChangeForm.reason.trim()) {
      setMessage({ type: 'error', text: 'Please select a role and provide a reason' });
      return;
    }

    setSaving(true);
    try {
      await apiService.requestRoleChange(roleChangeForm);
      setMessage({ type: 'success', text: 'Role change request submitted! Awaiting owner approval.' });
      setRoleChangeForm({ requested_role_id: '', reason: '' });
      loadRoleChangeRequests(); // Reload requests
    } catch (error) {
      console.error('Error submitting role change request:', error);
      setMessage({ type: 'error', text: 'Failed to submit role change request' });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    // TODO: Implement password change functionality
    setMessage({ type: 'success', text: 'Password change functionality coming soon!' });
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
        <p className="text-white/70">Loading your settings...</p>
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
            Back to Dashboard
          </button>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Settings</h1>
          <p className="text-white/70">Manage your profile and preferences</p>
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

      {/* Tab Navigation */}
      <div className="glass-morphism rounded-3xl p-2 mb-8">
        <div className="flex space-x-2">
          {[
            { key: 'profile', label: 'Profile', icon: '👤' },
            { key: 'security', label: 'Security', icon: '🔒' },
            { key: 'roleRequest', label: 'Role Request', icon: '👥' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`flex-1 flex items-center justify-center px-6 py-3 rounded-2xl transition-all duration-300 ${
                activeTab === tab.key
                  ? 'bg-white/20 text-white shadow-lg'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="glass-morphism rounded-3xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Profile Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-white/80 font-medium mb-2">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your full name"
              />
            </div>
            
            <div>
              <label className="block text-white/80 font-medium mb-2">Display Name</label>
              <input
                type="text"
                value={formData.display_name}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your display name"
              />
            </div>
            
            <div>
              <label className="block text-white/80 font-medium mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your email"
              />
            </div>
            
            <div>
              <label className="block text-white/80 font-medium mb-2">Phone Number</label>
              <input
                type="tel"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your phone number"
              />
            </div>
          </div>

          {/* Current Role Display */}
          <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
            <h3 className="text-white font-medium mb-2">Current Role</h3>
            <div className="flex items-center">
              <span className="px-3 py-1 bg-blue-500/20 text-blue-200 rounded-lg text-sm font-medium">
                {userProfile?.role?.display_name || userProfile?.role?.name}
              </span>
              {userProfile?.organization && (
                <span className="ml-4 text-white/60">
                  at {userProfile.organization.name}
                </span>
              )}
            </div>
          </div>

          <div className="flex justify-end mt-8">
            <button
              onClick={handleProfileUpdate}
              disabled={saving}
              className="px-8 py-3 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-blue-500/20"
            >
              {saving ? 'Saving...' : 'Update Profile'}
            </button>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="glass-morphism rounded-3xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Security Settings</h2>
          
          <div className="space-y-6">
            {/* Two-Factor Authentication */}
            <div className="p-6 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium mb-1">Two-Factor Authentication</h3>
                  <p className="text-white/60 text-sm">
                    {userProfile?.two_factor_enabled 
                      ? 'Your account is protected with 2FA' 
                      : 'Add an extra layer of security to your account'}
                  </p>
                </div>
                <div className={`px-3 py-1 rounded-lg text-sm font-medium ${
                  userProfile?.two_factor_enabled 
                    ? 'bg-green-500/20 text-green-200' 
                    : 'bg-red-500/20 text-red-200'
                }`}>
                  {userProfile?.two_factor_enabled ? 'Enabled' : 'Disabled'}
                </div>
              </div>
            </div>

            {/* Password Change */}
            <div className="p-6 bg-white/5 rounded-xl border border-white/10">
              <h3 className="text-white font-medium mb-4">Change Password</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="password"
                  placeholder="Current password"
                  className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="password"
                  placeholder="New password"
                  className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={handlePasswordChange}
                className="mt-4 px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-all duration-300"
              >
                Update Password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Role Request Tab */}
      {activeTab === 'roleRequest' && (
        <div className="space-y-6">
          {/* New Role Request */}
          <div className="glass-morphism rounded-3xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Request Role Change</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-white/80 font-medium mb-2">Requested Role</label>
                <select
                  value={roleChangeForm.requested_role_id}
                  onChange={(e) => setRoleChangeForm({ ...roleChangeForm, requested_role_id: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a role</option>
                  {availableRoles
                    .filter(role => role.name !== userProfile?.role?.name)
                    .map((role) => (
                      <option key={role.id} value={role.id} className="bg-gray-800">
                        {role.display_name || role.name}
                      </option>
                    ))}
                </select>
              </div>
              
              <div>
                <label className="block text-white/80 font-medium mb-2">Reason for Role Change</label>
                <textarea
                  value={roleChangeForm.reason}
                  onChange={(e) => setRoleChangeForm({ ...roleChangeForm, reason: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Please explain why you need this role change..."
                />
              </div>
              
              <button
                onClick={handleRoleChangeRequest}
                disabled={saving || !roleChangeForm.requested_role_id || !roleChangeForm.reason.trim()}
                className="px-8 py-3 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-blue-500/20"
              >
                {saving ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </div>

          {/* Previous Requests */}
          {roleChangeRequests.length > 0 && (
            <div className="glass-morphism rounded-3xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Previous Requests</h2>
              
              <div className="space-y-4">
                {roleChangeRequests.map((request) => (
                  <div key={request.id} className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <span className="text-white font-medium">
                            {request.current_role.display_name} → {request.requested_role.display_name}
                          </span>
                          <span className={`ml-3 px-2 py-1 rounded text-xs font-medium ${
                            request.status === 'pending' ? 'bg-yellow-500/20 text-yellow-200' :
                            request.status === 'approved' ? 'bg-green-500/20 text-green-200' :
                            'bg-red-500/20 text-red-200'
                          }`}>
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </span>
                        </div>
                        <p className="text-white/70 text-sm mb-2">{request.reason}</p>
                        <p className="text-white/50 text-xs">
                          Submitted on {formatDate(request.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}