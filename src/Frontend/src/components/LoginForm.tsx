'use client';

import { useState } from 'react';
import Link from 'next/link';
import ErrorPopup from './ErrorPopup';

interface LoginFormProps {
  onBack: () => void;
  onSwitchToRegister: () => void;
  onSuccess: (user: { name: string; display_name: string; role: string }) => void;
}

export default function LoginForm({ onBack, onSwitchToRegister, onSuccess }: LoginFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState('Incorrect credentials');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setShowErrorPopup(false); // Hide any existing error popup

    try {
      let baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000';
      console.log('LoginForm: NEXT_PUBLIC_API_URL =', process.env.NEXT_PUBLIC_API_URL);
      console.log('LoginForm: Constructed baseUrl =', baseUrl);
      
      // Temporary fix: ensure we use port 8000 until server restart
      if (baseUrl === 'http://localhost') {
        baseUrl = 'http://localhost:8000';
        console.log('LoginForm: Fixed baseUrl to use port 8000:', baseUrl);
      }
      
      console.log('LoginForm: Final CSRF URL =', `${baseUrl}/sanctum/csrf-cookie`);
      
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

      // Debug: Log the credentials being sent
      console.log('Login attempt:', {
        email: formData.email,
        password: formData.password ? '[HIDDEN]' : 'EMPTY',
        baseUrl,
        csrfToken: csrfToken ? 'Present' : 'Missing'
      });

      // Then attempt login
      const response = await fetch(`${baseUrl}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          ...(csrfToken ? { 'X-XSRF-TOKEN': decodeURIComponent(csrfToken) } : {}),
        },
        credentials: 'include',
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          remember: formData.remember
        })
      });

      console.log('Login response status:', response.status);

      if (response.ok) {
        const responseData = await response.json();
        
        // In the new flow, users login directly to dashboard after registration
        
        // Regular login successful, get user data from response
        console.log('Login successful:', responseData);
        
        const userData = responseData.user;
        const user = {
          name: userData.name,
          display_name: userData.display_name || userData.name,
          role: userData.role?.name || 'user'
        };
        
        // Store user data
        localStorage.setItem('sanctum_user', JSON.stringify(user));
        
        // Success! Navigate to dashboard
        onSuccess(user);
        return; // Important: return early to avoid showing error popup
      } else if (response.status === 422) {
        // Validation errors (invalid email format, missing fields, etc.)
        const data = await response.json();
        console.log('Validation errors:', data);
        if (data.errors) {
          const firstError = Object.values(data.errors)[0];
          setErrorMessage(Array.isArray(firstError) ? firstError[0] : firstError);
        } else {
          setErrorMessage(data.message || 'Please check your input and try again.');
        }
        setShowErrorPopup(true);
      } else if (response.status === 401) {
        // Unauthorized - wrong credentials
        const data = await response.json();
        console.log('Authentication failed:', data);
        console.log('Failed login attempt with email:', formData.email);
        setErrorMessage('Incorrect email or password. Please try again.');
        setShowErrorPopup(true);
      } else {
        // Other server errors
        const errorData = await response.text();
        console.error('Server error:', response.status, errorData);
        console.error('Full response details:', {
          status: response.status,
          statusText: response.statusText,
          url: response.url,
          body: errorData
        });
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
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleForgotPassword = () => {
    setShowErrorPopup(false);
    // Navigate to forgot password page or show forgot password form
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

      <div className="glass-morphism mx-auto max-w-md px-8 py-12 md:px-12 md:py-16 rounded-3xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white opacity-80 mb-4 tracking-tight">
            Welcome Back
          </h1>
          <p className="text-lg md:text-xl text-white opacity-80">
            Sign in to access your AI tools
          </p>
        </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Field */}
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
            placeholder="Enter your email"
          />
        </div>

        {/* Password Field */}
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
            placeholder="Enter your password"
          />
        </div>

        {/* Remember Me */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="remember"
            name="remember"
            checked={formData.remember}
            onChange={handleChange}
            className="h-4 w-4 text-white bg-white/20 border-white/30 rounded focus:ring-white/50"
          />
          <label htmlFor="remember" className="ml-2 text-sm text-white opacity-80">
            Remember me
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-white text-gray-900 font-semibold text-lg py-3 px-6 rounded-full hover:bg-gray-100 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 opacity-80"
        >
          {isLoading ? 'Signing In...' : 'Sign In'}
        </button>

        {/* Forgot Password */}
        <div className="text-center">
          <Link 
            href="/forgot-password"
            className="text-sm text-white opacity-80 underline hover:no-underline transition-all duration-200"
          >
            Forgot your password?
          </Link>
        </div>
      </form>

      {/* Actions */}
      <div className="mt-8 space-y-4">
        {/* Sign Up Link */}
        <div className="text-center pt-6 border-t border-white/20">
          <span className="text-white opacity-80 text-sm">Don&apos;t have an account? </span>
          <button
            onClick={onSwitchToRegister}
            className="text-white font-semibold underline hover:no-underline transition-all duration-200 opacity-80"
          >
            Sign up!
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