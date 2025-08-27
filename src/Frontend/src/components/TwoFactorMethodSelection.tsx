'use client';

import { useState } from 'react';

interface TwoFactorMethodSelectionProps {
  user: {
    id: number;
    name: string;
    email: string;
  };
  onMethodSelected: (method: 'email' | 'totp') => void;
}

export default function TwoFactorMethodSelection({ user, onMethodSelected }: TwoFactorMethodSelectionProps) {
  const [selectedMethod, setSelectedMethod] = useState<'email' | 'totp' | null>(null);

  const handleMethodSelect = (method: 'email' | 'totp') => {
    setSelectedMethod(method);
  };

  const handleContinue = () => {
    if (selectedMethod) {
      onMethodSelected(selectedMethod);
    }
  };

  return (
    <div className="glass-morphism mx-auto max-w-md px-8 py-12 md:px-12 md:py-16 rounded-3xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 bg-blue-500 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white opacity-80 mb-4 tracking-tight">
          Secure Your Account
        </h1>
        <p className="text-lg md:text-xl text-white opacity-80">
          Choose how you'd like to secure your account
        </p>
      </div>

      {/* Welcome Message */}
      <div className="bg-white/20 border border-white/30 rounded-lg p-6 backdrop-blur-sm mb-6">
        <h3 className="text-lg font-semibold text-white mb-2">Welcome, {user.name}!</h3>
        <p className="text-white opacity-80 text-sm">
          Your account has been created successfully. You must choose a security method to protect your account.
        </p>
      </div>

      {/* Method Selection */}
      <div className="space-y-4 mb-6">
        <h3 className="text-lg font-semibold text-white opacity-80 mb-4">Choose Security Method</h3>
        
        {/* Email Verification Option */}
        <button
          onClick={() => handleMethodSelect('email')}
          className={`w-full p-6 rounded-lg border text-left transition-all duration-200 ${
            selectedMethod === 'email'
              ? 'bg-white/30 border-white/50 text-white shadow-lg scale-105'
              : 'bg-white/10 border-white/30 text-white/80 hover:bg-white/20 hover:scale-102'
          }`}
        >
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-lg mb-1">Email Verification</h4>
              <p className="text-sm opacity-80 mb-2">
                Receive verification codes via email when logging in.
              </p>
              <div className="flex items-center text-xs opacity-70">
                <span className="text-green-400 mr-1">✓</span>
                Simple and convenient
              </div>
              <div className="flex items-center text-xs opacity-70">
                <span className="text-green-400 mr-1">✓</span>
                No additional apps required
              </div>
            </div>
          </div>
        </button>

        {/* Google Authenticator Option */}
        <button
          onClick={() => handleMethodSelect('totp')}
          className={`w-full p-6 rounded-lg border text-left transition-all duration-200 ${
            selectedMethod === 'totp'
              ? 'bg-white/30 border-white/50 text-white shadow-lg scale-105'
              : 'bg-white/10 border-white/30 text-white/80 hover:bg-white/20 hover:scale-102'
          }`}
        >
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-lg mb-1">Authenticator App</h4>
              <p className="text-sm opacity-80 mb-2">
                Use Google Authenticator or similar app for secure codes.
              </p>
              <div className="flex items-center text-xs opacity-70">
                <span className="text-green-400 mr-1">✓</span>
                More secure than email
              </div>
              <div className="flex items-center text-xs opacity-70">
                <span className="text-green-400 mr-1">✓</span>
                Works offline
              </div>
            </div>
          </div>
        </button>
      </div>

      {/* Action Buttons */}
      <div className="space-y-4">
        {/* Continue Button */}
        <button
          onClick={handleContinue}
          disabled={!selectedMethod}
          className="w-full bg-white text-gray-900 font-semibold text-lg py-3 px-6 rounded-full hover:bg-gray-100 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 opacity-80"
        >
          Continue with {selectedMethod === 'email' ? 'Email' : selectedMethod === 'totp' ? 'Authenticator' : 'Selected'} Method
        </button>

        {/* Info Text */}
        <p className="text-center text-white opacity-60 text-sm">
          Two-factor authentication is required for all accounts to ensure maximum security.
        </p>
      </div>
    </div>
  );
}