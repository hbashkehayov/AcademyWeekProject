'use client';

import { useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  display_name?: string;
  phone_number?: string;
  role?: {
    id: number;
    name: string;
    display_name: string;
  };
  organization?: {
    id: number;
    name: string;
  };
  email_verified_at?: string;
  two_factor_enabled: boolean;
  created_at: string;
  tools_submitted: number;
  tools_rated: number;
}

interface UserManagementProps {
  onBack: () => void;
}

export default function UserManagement({ onBack }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const handleDeleteUser = async (userId: string) => {
    try {
      // Get CSRF token manually
      const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000';
      await fetch(`${baseUrl}/sanctum/csrf-cookie`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      const csrfToken = getCsrfToken();
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-XSRF-TOKEN': csrfToken || '',
        }
      });
      
      if (response.ok) {
        setUsers(prev => prev.filter(u => u.id !== userId));
        setShowDeleteConfirm(false);
        setDeletingUserId(null);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Failed to delete user');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (user.display_name && user.display_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRole = filterRole === 'all' || user.role?.name === filterRole;
    
    return matchesSearch && matchesRole;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="h-full max-h-[600px] flex flex-col">
      {/* Fixed Header */}
      <div className="flex-shrink-0 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <button
              onClick={onBack}
              className="flex items-center text-white/70 hover:text-white transition-colors mb-2"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Admin Operations
            </button>
            <h3 className="text-2xl font-bold text-white">User Management</h3>
            <p className="text-white/60 mt-1">Manage system users and permissions</p>
          </div>
          
          <div 
            className="bg-white/5 backdrop-blur-lg border border-white/10 text-white px-6 py-3 rounded-full transition-all duration-500 ease-out transform hover:scale-105 hover:shadow-lg"
            style={{
              backdropFilter: 'blur(20px) saturate(180%)',
              background: 'rgba(255, 255, 255, 0.05)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            }}
          >
            <span className="font-semibold text-blue-300">{users.length}</span> <span className="opacity-80">Total Users</span>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/30 focus:bg-white/10 focus:shadow-lg transition-all duration-500 ease-out transform hover:scale-105 focus:scale-105"
              style={{
                backdropFilter: 'blur(20px) saturate(180%)',
                background: 'rgba(255, 255, 255, 0.05)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              }}
            />
          </div>
          
          <div className="relative">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/30 focus:bg-white/10 focus:shadow-lg transition-all duration-500 ease-out appearance-none cursor-pointer transform hover:scale-105 focus:scale-105"
              style={{
                backdropFilter: 'blur(20px) saturate(180%)',
                background: 'rgba(255, 255, 255, 0.05)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 0.75rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.25em 1.25em'
              }}
            >
              <option value="all" className="bg-gray-900/95 backdrop-blur-lg text-white py-3 px-4">All Roles</option>
              <option value="frontend" className="bg-gray-900/95 backdrop-blur-lg text-white py-3 px-4">Frontend</option>
              <option value="backend" className="bg-gray-900/95 backdrop-blur-lg text-white py-3 px-4">Backend</option>
              <option value="qa" className="bg-gray-900/95 backdrop-blur-lg text-white py-3 px-4">QA</option>
              <option value="designer" className="bg-gray-900/95 backdrop-blur-lg text-white py-3 px-4">Designer</option>
              <option value="pm" className="bg-gray-900/95 backdrop-blur-lg text-white py-3 px-4">PM</option>
              <option value="owner" className="bg-gray-900/95 backdrop-blur-lg text-white py-3 px-4">Owner</option>
            </select>
            
            {/* Enhanced Custom Dropdown Styling with Fluid Animations */}
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
            `}</style>
          </div>
          
          <div className="flex items-center justify-end">
            <button
              onClick={fetchUsers}
              className="px-4 py-3 bg-white/5 backdrop-blur-lg hover:bg-white/10 text-white rounded-xl transition-all duration-500 ease-out border border-white/10 hover:border-white/20 transform hover:scale-105 hover:shadow-lg"
              title="Refresh Users"
              style={{
                backdropFilter: 'blur(20px) saturate(180%)',
                background: 'rgba(255, 255, 255, 0.05)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              }}
            >
              <svg className="w-5 h-5 transition-transform duration-300 hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable Users List */}
      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
            <p className="text-white/60 text-center">Loading users...</p>
          </div>
        ) : filteredUsers.length > 0 ? (
          <div 
            className="space-y-3 overflow-y-auto pr-2 max-h-[380px] custom-scrollbar"
          >
            <style jsx>{`
              .custom-scrollbar::-webkit-scrollbar {
                width: 6px;
                background: transparent;
              }
              .custom-scrollbar::-webkit-scrollbar-track {
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
              .custom-scrollbar::-webkit-scrollbar-thumb {
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
              .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                background: linear-gradient(
                  180deg,
                  rgba(255, 255, 255, 0.3) 0%,
                  rgba(255, 255, 255, 0.4) 50%,
                  rgba(255, 255, 255, 0.3) 100%
                );
                border: 1px solid rgba(255, 255, 255, 0.2);
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
              }
              .custom-scrollbar {
                scrollbar-width: thin;
                scrollbar-color: rgba(255, 255, 255, 0.3) rgba(255, 255, 255, 0.1);
              }
            `}</style>
            {filteredUsers.map((user) => (
            <div 
              key={user.id}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-semibold text-lg">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  
                  {/* User Info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-white">
                        {user.display_name || user.name}
                      </h4>
                      {user.email_verified_at && (
                        <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                      {user.two_factor_enabled && (
                        <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    
                    <p className="text-sm text-white/60">{user.email}</p>
                    
                    <div className="flex items-center gap-4 mt-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 capitalize">
                        {user.role?.display_name || user.role?.name || 'No Role'}
                      </span>
                      
                      {user.organization && (
                        <span className="text-xs text-white/50">
                          {user.organization.name}
                        </span>
                      )}
                      
                      <span className="text-xs text-white/50">
                        Joined {formatDate(user.created_at)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-2 text-xs text-white/40">
                      <span>{user.tools_submitted} tools submitted</span>
                      <span>{user.tools_rated} ratings</span>
                      {user.phone_number && (
                        <span>📱 {user.phone_number}</span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex items-center space-x-2">
                  {user.role?.name !== 'owner' && (
                    <>
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => {
                          setDeletingUserId(user.id);
                          setShowDeleteConfirm(true);
                        }}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Delete User"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </>
                  )}
                  {user.role?.name === 'owner' && (
                    <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs font-medium">
                      Protected
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          </div>
        ) : (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
            <p className="text-white/60 text-center">No users found</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && deletingUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-purple-900 to-blue-900 p-6 rounded-2xl border border-white/20 max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">Confirm Deletion</h3>
            <p className="text-white/70 mb-6">
              Are you sure you want to delete this user? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeletingUserId(null);
                }}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (deletingUserId) {
                    handleDeleteUser(deletingUserId);
                  }
                }}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-purple-900 to-blue-900 p-6 rounded-2xl border border-white/20 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">User Details</h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-white/60 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-white/50 text-sm">Name</label>
                  <p className="text-white">{selectedUser.display_name || selectedUser.name}</p>
                </div>
                <div>
                  <label className="text-white/50 text-sm">Email</label>
                  <p className="text-white">{selectedUser.email}</p>
                </div>
                <div>
                  <label className="text-white/50 text-sm">Role</label>
                  <p className="text-white capitalize">{selectedUser.role?.display_name || 'No Role'}</p>
                </div>
                <div>
                  <label className="text-white/50 text-sm">Organization</label>
                  <p className="text-white">{selectedUser.organization?.name || 'No Organization'}</p>
                </div>
                <div>
                  <label className="text-white/50 text-sm">Phone</label>
                  <p className="text-white">{selectedUser.phone_number || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-white/50 text-sm">Joined</label>
                  <p className="text-white">{formatDate(selectedUser.created_at)}</p>
                </div>
              </div>
              
              <div className="pt-4 border-t border-white/10">
                <h4 className="text-white/70 mb-2">Account Status</h4>
                <div className="flex gap-4">
                  {selectedUser.email_verified_at && (
                    <span className="flex items-center text-green-400 text-sm">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Email Verified
                    </span>
                  )}
                  {selectedUser.two_factor_enabled && (
                    <span className="flex items-center text-blue-400 text-sm">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      2FA Enabled
                    </span>
                  )}
                </div>
              </div>
              
              <div className="pt-4 border-t border-white/10">
                <h4 className="text-white/70 mb-2">Activity</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-white/50">Tools Submitted:</span>
                    <span className="ml-2 text-white">{selectedUser.tools_submitted}</span>
                  </div>
                  <div>
                    <span className="text-white/50">Tools Rated:</span>
                    <span className="ml-2 text-white">{selectedUser.tools_rated}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}