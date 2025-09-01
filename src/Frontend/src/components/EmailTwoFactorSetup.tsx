'use client';

import { useState, useEffect } from 'react';
import ErrorPopup from './ErrorPopup';

interface EmailTwoFactorSetupProps {
  user: {
    id: number;
    name: string;
    email: string;
  };
  onComplete: () => void;
  onBack: () => void;
}

export default function EmailTwoFactorSetup({ user, onComplete, onBack }: EmailTwoFactorSetupProps) {
  const [step, setStep] = useState<'send' | 'verify'>('send');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Countdown for email resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const sendVerificationEmail = async () => {
    setIsLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000';
      
      const csrfResponse = await fetch(`${baseUrl}/sanctum/csrf-cookie`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        }
      });

      const getCookie = (name: string) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift();
        return null;
      };

      const csrfToken = getCookie('XSRF-TOKEN');

      const response = await fetch(`${baseUrl}/api/2fa/send-email-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          ...(csrfToken ? { 'X-XSRF-TOKEN': decodeURIComponent(csrfToken) } : {}),
        },
        credentials: 'include',
        body: JSON.stringify({ email: user.email })
      });

      if (response.ok) {
        setEmailSent(true);
        setStep('verify');
        setCountdown(60); // 1 minute cooldown
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message || 'Failed to send verification email.');
        setShowErrorPopup(true);
      }
    } catch (error) {
      console.error('Error sending email:', error);
      setErrorMessage('Unable to send email. Please check your connection and try again.');
      setShowErrorPopup(true);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyEmailCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setShowErrorPopup(false);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000';
      
      const csrfResponse = await fetch(`${baseUrl}/sanctum/csrf-cookie`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        }
      });

      const getCookie = (name: string) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift();
        return null;
      };

      const csrfToken = getCookie('XSRF-TOKEN');

      const response = await fetch(`${baseUrl}/api/2fa/verify-email-setup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          ...(csrfToken ? { 'X-XSRF-TOKEN': decodeURIComponent(csrfToken) } : {}),
        },
        credentials: 'include',
        body: JSON.stringify({
          user_id: user.id,
          code: verificationCode,
          method: 'email'
        })
      });

      if (response.ok) {
        onComplete();
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message || 'Invalid verification code. Please try again.');
        setShowErrorPopup(true);
        setVerificationCode('');
      }
    } catch (error) {
      console.error('Email verification error:', error);
      setErrorMessage('Unable to verify code. Please check your connection and try again.');
      setShowErrorPopup(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = () => {
    if (countdown === 0) {
      sendVerificationEmail();
    }
  };

  // Auto-send email when component loads
  useEffect(() => {
    if (!emailSent) {
      sendVerificationEmail();
    }
  }, []);

  return (
    <>
      <ErrorPopup
        isOpen={showErrorPopup}
        onClose={() => setShowErrorPopup(false)}
        message={errorMessage}
      />

      <div className="glass-morphism mx-auto max-w-md px-8 py-12 md:px-12 md:py-16 rounded-3xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-500 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white opacity-80 mb-4 tracking-tight">
            Email Verification
          </h1>
          <p className="text-lg md:text-xl text-white opacity-80">
            Secure your account with email codes
          </p>
        </div>

        {step === 'send' && (
          <div className="space-y-6">
            <div className="bg-white/20 border border-white/30 rounded-lg p-6 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-white mb-4">Setting up Email Verification</h3>
              <p className="text-white opacity-80 text-sm mb-4">
                We&apos;re sending a verification code to <strong>{user.email}</strong> to confirm your email address.
              </p>
              
              {isLoading && (
                <div className="flex items-center justify-center space-x-2 text-white opacity-80">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Sending verification email...</span>
                </div>
              )}
            </div>

            <div className="text-center">
              <button
                onClick={onBack}
                className="text-sm text-white opacity-60 hover:opacity-80 transition-opacity duration-200"
              >
                ← Back to method selection
              </button>
            </div>
          </div>
        )}

        {step === 'verify' && (
          <div className="space-y-6">
            <div className="bg-white/20 border border-white/30 rounded-lg p-6 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-white mb-4">Check Your Email</h3>
              <p className="text-white opacity-80 text-sm mb-4">
                We&apos;ve sent a 6-digit verification code to <strong>{user.email}</strong>. 
                Please check your email and enter the code below.
              </p>
            </div>

            <form onSubmit={verifyEmailCode} className="space-y-6">
              <div>
                <label 
                  htmlFor="verificationCode" 
                  className="block text-sm font-medium text-white opacity-80 mb-2"
                >
                  Verification Code
                </label>
                <input
                  type="text"
                  id="verificationCode"
                  name="verificationCode"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  maxLength={6}
                  pattern="[0-9]{6}"
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white text-center text-2xl font-mono placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent backdrop-blur-sm"
                  placeholder="000000"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || verificationCode.length !== 6}
                className="w-full bg-white text-gray-900 font-semibold text-lg py-3 px-6 rounded-full hover:bg-gray-100 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 opacity-80"
              >
                {isLoading ? 'Verifying...' : 'Verify Email'}
              </button>
            </form>

            <div className="space-y-2 text-center">
              <button
                onClick={handleResendEmail}
                disabled={countdown > 0 || isLoading}
                className="block w-full text-sm text-white opacity-60 hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity duration-200"
              >
                {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
              </button>
              <button
                onClick={onBack}
                className="block w-full text-sm text-white opacity-60 hover:opacity-80 transition-opacity duration-200"
              >
                ← Back to method selection
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}