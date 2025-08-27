'use client';

import { useState } from 'react';
import ErrorPopup from './ErrorPopup';

interface RegisterFormProps {
  onBack: () => void;
  onSwitchToLogin: () => void;
  onRegistrationSuccess: (user: any) => void;
}

const roles = [
  { id: '1', name: 'Frontend Developer', description: 'UI/UX development, React, Vue, Angular' },
  { id: '2', name: 'Backend Developer', description: 'Server-side logic, APIs, databases' },
  { id: '3', name: 'QA Engineer', description: 'Testing, quality assurance, automation' },
  { id: '4', name: 'UI/UX Designer', description: 'Design, prototyping, user experience' },
  { id: '5', name: 'Project Manager', description: 'Project coordination, team management' }
];

export default function RegisterForm({ onBack, onSwitchToLogin, onRegistrationSuccess }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    display_name: '',
    email: '',
    phone_number: '',
    role_id: '',
    password: '',
    password_confirmation: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState('Registration failed');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setShowErrorPopup(false); // Hide any existing error popup

    // Validate passwords match
    if (formData.password !== formData.password_confirmation) {
      setErrorMessage('Passwords do not match');
      setShowErrorPopup(true);
      setIsLoading(false);
      return;
    }

    // Validate password length
    if (formData.password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long');
      setShowErrorPopup(true);
      setIsLoading(false);
      return;
    }

    // Validate required fields
    if (!formData.name || !formData.email || !formData.role_id) {
      setErrorMessage('Please fill in all required fields');
      setShowErrorPopup(true);
      setIsLoading(false);
      return;
    }

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000';
      
      // First, get CSRF token
      const csrfResponse = await fetch(`${baseUrl}/sanctum/csrf-cookie`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        }
      });

      if (!csrfResponse.ok) {
        throw new Error('Unable to get CSRF token');
      }

      // Get CSRF token from cookie for the header
      const getCookie = (name: string) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift();
        return null;
      };

      const csrfToken = getCookie('XSRF-TOKEN');

      // Debug: Log the registration attempt details
      const registrationUrl = `${baseUrl}/api/register`;
      console.log('Registration attempt:', {
        url: registrationUrl,
        baseUrl,
        email: formData.email,
        csrfToken: csrfToken ? 'Present' : 'Missing'
      });

      // Then attempt registration
      const response = await fetch(registrationUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          ...(csrfToken ? { 'X-XSRF-TOKEN': decodeURIComponent(csrfToken) } : {}),
        },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.name,
          display_name: formData.display_name || formData.name,
          email: formData.email,
          phone: formData.phone_number,
          role_id: parseInt(formData.role_id),
          password: formData.password,
          password_confirmation: formData.password_confirmation
        })
      });

      console.log('Registration response status:', response.status);
      console.log('Registration response URL:', response.url);
      console.log('Registration response headers:', Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        // Registration successful
        const responseData = await response.json();
        console.log('Registration successful:', responseData);
        
        if (responseData.requires_security_setup) {
          // Redirect to method selection
          onRegistrationSuccess(responseData.user);
        } else {
          // Show success message for legacy flow
          setShowSuccessMessage(true);
          
          // Clear form
          setFormData({
            name: '',
            display_name: '',
            email: '',
            phone_number: '',
            role_id: '',
            password: '',
            password_confirmation: ''
          });
          
          // After 2 seconds, redirect to login
          setTimeout(() => {
            onSwitchToLogin();
          }, 2000);
        }
        
        return; // Important: return early to avoid showing error popup
      } else if (response.status === 422) {
        // Validation errors
        const data = await response.json();
        console.log('Validation errors:', data);
        if (data.errors) {
          const firstError = Object.values(data.errors)[0];
          setErrorMessage(Array.isArray(firstError) ? firstError[0] : firstError);
        } else {
          setErrorMessage(data.message || 'Please check your information and try again.');
        }
        setShowErrorPopup(true);
      } else {
        // Other server errors
        const errorData = await response.text();
        console.error('Server error:', response.status, errorData);
        setErrorMessage('Server error. Please try again later.');
        setShowErrorPopup(true);
      }
    } catch (err) {
      console.error('Network/Connection error:', err);
      setErrorMessage('Unable to connect to the server. Please check your connection and try again.');
      setShowErrorPopup(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleForgotPassword = () => {
    setShowErrorPopup(false);
    window.location.href = '/forgot-password';
  };

  return (
    <>
      {/* Error Popup */}
      <ErrorPopup
        isOpen={showErrorPopup}
        onClose={() => setShowErrorPopup(false)}
        onForgotPassword={handleForgotPassword}
        message={errorMessage}
      />

      {/* Success Message Toast */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
          <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-xl flex items-center space-x-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-semibold">Registration Successful!</p>
              <p className="text-sm">Redirecting to login...</p>
            </div>
          </div>
        </div>
      )}

      <div className="glass-morphism mx-auto max-w-2xl px-8 py-8 md:px-12 md:py-12 rounded-3xl my-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-white opacity-80 mb-4 tracking-tight">
          Join sanctum
        </h1>
        <p className="text-lg md:text-xl text-white opacity-80">
          Get personalized AI tool recommendations
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white opacity-80 mb-3">Basic Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label 
                htmlFor="name" 
                className="block text-sm font-medium text-white opacity-80 mb-2"
              >
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent backdrop-blur-sm"
                placeholder="John Doe"
              />
            </div>

            {/* Display Name */}
            <div>
              <label 
                htmlFor="display_name" 
                className="block text-sm font-medium text-white opacity-80 mb-2"
              >
                Display Name
              </label>
              <input
                type="text"
                id="display_name"
                name="display_name"
                value={formData.display_name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent backdrop-blur-sm"
                placeholder="How others see you"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Email */}
            <div>
              <label 
                htmlFor="email" 
                className="block text-sm font-medium text-white opacity-80 mb-2"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent backdrop-blur-sm"
                placeholder="john@example.com"
              />
            </div>

            {/* Phone */}
            <div>
              <label 
                htmlFor="phone_number" 
                className="block text-sm font-medium text-white opacity-80 mb-2"
              >
                Phone Number
              </label>
              <input
                type="tel"
                id="phone_number"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent backdrop-blur-sm"
                placeholder="+1234567890"
              />
            </div>
          </div>
        </div>

        {/* Role Selection */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white opacity-80 mb-3">Select Your Role</h3>
          <p className="text-sm text-white opacity-70 mb-4">Choose the role that best describes your position</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {roles.map((role) => (
              <label 
                key={role.id} 
                className="flex items-start p-4 bg-white/10 border border-white/20 rounded-lg cursor-pointer hover:bg-white/20 transition-colors backdrop-blur-sm"
              >
                <input
                  type="radio"
                  name="role_id"
                  value={role.id}
                  checked={formData.role_id === role.id}
                  onChange={handleChange}
                  required
                  className="mt-1 mr-3 text-white bg-white/20 border-white/30 focus:ring-white/50"
                />
                <div>
                  <div className="font-medium text-white opacity-80">{role.name}</div>
                  <div className="text-sm text-white opacity-60">{role.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Security Section */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white opacity-80 mb-3">Security</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Password */}
            <div>
              <label 
                htmlFor="password" 
                className="block text-sm font-medium text-white opacity-80 mb-2"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent backdrop-blur-sm"
                placeholder="Enter password"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label 
                htmlFor="password_confirmation" 
                className="block text-sm font-medium text-white opacity-80 mb-2"
              >
                Confirm Password
              </label>
              <input
                type="password"
                id="password_confirmation"
                name="password_confirmation"
                value={formData.password_confirmation}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent backdrop-blur-sm"
                placeholder="Confirm password"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-white text-gray-900 font-semibold text-lg py-3 px-6 rounded-full hover:bg-gray-100 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 opacity-80"
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>

      {/* Actions */}
      <div className="mt-6 space-y-3">
        {/* Sign In Link */}
        <div className="text-center pt-6 border-t border-white/20">
          <span className="text-white opacity-80 text-sm">Already have an account? </span>
          <button
            onClick={onSwitchToLogin}
            className="text-white font-semibold underline hover:no-underline transition-all duration-200 opacity-80"
          >
            Sign in!
          </button>
        </div>

        {/* Back Button */}
        <div className="text-center">
          <button
            onClick={onBack}
            className="text-sm text-white opacity-60 hover:opacity-80 transition-opacity duration-200"
          >
            ← Back to home
          </button>
        </div>
        </div>
      </div>
    </>
  );
}