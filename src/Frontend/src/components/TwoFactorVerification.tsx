'use client';

import { useState, useEffect } from 'react';
import ErrorPopup from './ErrorPopup';

interface TwoFactorVerificationProps {
  email: string;
  availableMethods: string[];
  onVerificationSuccess: (user: any) => void;
  onBack: () => void;
}

export default function TwoFactorVerification({ 
  email, 
  availableMethods, 
  onVerificationSuccess,
  onBack 
}: TwoFactorVerificationProps) {
  const [selectedMethod, setSelectedMethod] = useState<'totp' | 'email' | 'recovery'>('totp');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Set default method based on available methods
  useEffect(() => {
    if (availableMethods.includes('totp')) {
      setSelectedMethod('totp');
    } else if (availableMethods.includes('email')) {
      setSelectedMethod('email');
    } else if (availableMethods.includes('recovery')) {
      setSelectedMethod('recovery');
    }
  }, [availableMethods]);

  // Countdown for email resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const sendEmailCode = async () => {
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
        body: JSON.stringify({ email })
      });

      if (response.ok) {
        setEmailSent(true);
        setCountdown(60); // 1 minute cooldown
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message || 'Failed to send email verification code.');
        setShowErrorPopup(true);
      }
    } catch (error) {
      console.error('Error sending email code:', error);
      setErrorMessage('Unable to send email. Please check your connection and try again.');
      setShowErrorPopup(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
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

      const response = await fetch(`${baseUrl}/api/2fa/verify-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          ...(csrfToken ? { 'X-XSRF-TOKEN': decodeURIComponent(csrfToken) } : {}),
        },
        credentials: 'include',
        body: JSON.stringify({
          email,
          code: verificationCode,
          method: selectedMethod
        })
      });

      if (response.ok) {
        const result = await response.json();
        onVerificationSuccess(result.user);
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message || 'Invalid verification code. Please try again.');
        setShowErrorPopup(true);
        setVerificationCode(''); // Clear the code on error
      }
    } catch (error) {
      console.error('2FA verification error:', error);
      setErrorMessage('Unable to verify code. Please check your connection and try again.');
      setShowErrorPopup(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-send email code when email method is selected for the first time
  useEffect(() => {
    if (selectedMethod === 'email' && !emailSent && availableMethods.includes('email')) {
      sendEmailCode();
    }
  }, [selectedMethod]);

  const getMethodTitle = () => {
    switch (selectedMethod) {
      case 'totp':
        return 'Authenticator App';
      case 'email':
        return 'Email Verification';
      case 'recovery':
        return 'Recovery Code';
      default:
        return '2FA Verification';
    }
  };

  const getMethodDescription = () => {
    switch (selectedMethod) {
      case 'totp':
        return 'Enter the 6-digit code from your authenticator app.';
      case 'email':
        return `We've sent a verification code to ${email}. Enter the code below.`;
      case 'recovery':
        return 'Enter one of your recovery codes to access your account.';
      default:
        return '';
    }
  };

  const getInputPattern = () => {
    return selectedMethod === 'recovery' ? undefined : '[0-9]{6}';
  };

  const getInputMaxLength = () => {
    return selectedMethod === 'recovery' ? 32 : 6;
  };

  const getInputPlaceholder = () => {
    return selectedMethod === 'recovery' ? 'Recovery code' : '000000';
  };

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
          <h1 className="text-4xl md:text-5xl font-bold text-white opacity-80 mb-4 tracking-tight">
            Two-Factor Authentication
          </h1>
          <p className="text-lg md:text-xl text-white opacity-80">
            Enter your verification code
          </p>
        </div>

        {/* Method Selection */}
        {availableMethods.length > 1 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-white opacity-80 mb-3">
              Verification Method
            </label>
            <div className="grid gap-2">
              {availableMethods.includes('totp') && (
                <button
                  onClick={() => setSelectedMethod('totp')}
                  className={`w-full p-3 rounded-lg border text-left transition-colors duration-200 ${
                    selectedMethod === 'totp'
                      ? 'bg-white/30 border-white/50 text-white'
                      : 'bg-white/10 border-white/30 text-white/70 hover:bg-white/20'
                  }`}
                >
                  <div className="font-medium">Authenticator App</div>
                  <div className="text-xs opacity-80">Use your authenticator app</div>
                </button>
              )}
              {availableMethods.includes('email') && (
                <button
                  onClick={() => setSelectedMethod('email')}
                  className={`w-full p-3 rounded-lg border text-left transition-colors duration-200 ${
                    selectedMethod === 'email'
                      ? 'bg-white/30 border-white/50 text-white'
                      : 'bg-white/10 border-white/30 text-white/70 hover:bg-white/20'
                  }`}
                >
                  <div className="font-medium">Email Verification</div>
                  <div className="text-xs opacity-80">Send code to your email</div>
                </button>
              )}
              {availableMethods.includes('recovery') && (
                <button
                  onClick={() => setSelectedMethod('recovery')}
                  className={`w-full p-3 rounded-lg border text-left transition-colors duration-200 ${
                    selectedMethod === 'recovery'
                      ? 'bg-white/30 border-white/50 text-white'
                      : 'bg-white/10 border-white/30 text-white/70 hover:bg-white/20'
                  }`}
                >
                  <div className="font-medium">Recovery Code</div>
                  <div className="text-xs opacity-80">Use a backup recovery code</div>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Verification Form */}
        <form onSubmit={handleVerifyCode} className="space-y-6">
          <div className="bg-white/20 border border-white/30 rounded-lg p-6 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-white mb-2">{getMethodTitle()}</h3>
            <p className="text-white opacity-80 text-sm mb-4">
              {getMethodDescription()}
            </p>

            <div>
              <label 
                htmlFor="verificationCode" 
                className="block text-sm font-medium text-white opacity-80 mb-2"
              >
                {selectedMethod === 'recovery' ? 'Recovery Code' : 'Verification Code'}
              </label>
              <input
                type="text"
                id="verificationCode"
                name="verificationCode"
                value={verificationCode}
                onChange={(e) => {
                  if (selectedMethod === 'recovery') {
                    setVerificationCode(e.target.value.replace(/[^a-zA-Z0-9]/g, '').toLowerCase());
                  } else {
                    setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                  }
                }}
                required
                maxLength={getInputMaxLength()}
                pattern={getInputPattern()}
                className={`w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent backdrop-blur-sm ${
                  selectedMethod === 'recovery' 
                    ? 'text-left font-mono' 
                    : 'text-center text-2xl font-mono'
                }`}
                placeholder={getInputPlaceholder()}
              />
            </div>
          </div>

          {/* Email Resend Button */}
          {selectedMethod === 'email' && (
            <div className="text-center">
              <button
                type="button"
                onClick={sendEmailCode}
                disabled={countdown > 0 || isLoading}
                className="text-sm text-white opacity-60 hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity duration-200"
              >
                {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={
              isLoading || 
              verificationCode.length === 0 ||
              (selectedMethod !== 'recovery' && verificationCode.length !== 6)
            }
            className="w-full bg-white text-gray-900 font-semibold text-lg py-3 px-6 rounded-full hover:bg-gray-100 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 opacity-80"
          >
            {isLoading ? 'Verifying...' : 'Verify & Continue'}
          </button>
        </form>

        {/* Back Button */}
        <div className="mt-6 text-center">
          <button
            onClick={onBack}
            className="text-sm text-white opacity-60 hover:opacity-80 transition-opacity duration-200"
          >
            ← Back to login
          </button>
        </div>
      </div>
    </>
  );
}