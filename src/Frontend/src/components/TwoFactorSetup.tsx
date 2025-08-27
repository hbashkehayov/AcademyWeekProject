'use client';

import { useState } from 'react';
import Image from 'next/image';
import ErrorPopup from './ErrorPopup';

interface TwoFactorSetupProps {
  user: {
    id: number;
    name: string;
    email: string;
  };
  twoFactorData: {
    secret: string;
    qr_code_url: string;
    qr_code_image: string;
  };
  onComplete: (recoveryCodes: string[]) => void;
  onBack: () => void;
}

export default function TwoFactorSetup({ user, twoFactorData, onComplete, onBack }: TwoFactorSetupProps) {
  const [step, setStep] = useState<'setup' | 'verify'>('setup');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSecret, setShowSecret] = useState(false);

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setShowErrorPopup(false);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000';
      
      // Get CSRF token first
      const csrfResponse = await fetch(`${baseUrl}/sanctum/csrf-cookie`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        }
      });

      if (!csrfResponse.ok) {
        throw new Error('Unable to get CSRF token');
      }

      const getCookie = (name: string) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift();
        return null;
      };

      const csrfToken = getCookie('XSRF-TOKEN');

      // Complete 2FA setup
      const response = await fetch(`${baseUrl}/api/2fa/complete-setup`, {
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
          verification_code: verificationCode
        })
      });

      if (response.ok) {
        const result = await response.json();
        onComplete(result.recovery_codes);
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message || 'Invalid verification code. Please try again.');
        setShowErrorPopup(true);
      }
    } catch (error) {
      console.error('2FA setup verification error:', error);
      setErrorMessage('Unable to verify code. Please check your connection and try again.');
      setShowErrorPopup(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendQR = async () => {
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

      const response = await fetch(`${baseUrl}/api/2fa/resend-qr`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          ...(csrfToken ? { 'X-XSRF-TOKEN': decodeURIComponent(csrfToken) } : {}),
        },
        credentials: 'include',
        body: JSON.stringify({
          user_id: user.id
        })
      });

      if (response.ok) {
        // QR code refreshed - you could update the display if needed
        console.log('QR code refreshed');
      }
    } catch (error) {
      console.error('Error refreshing QR code:', error);
    }
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
            Secure Your Account
          </h1>
          <p className="text-lg md:text-xl text-white opacity-80">
            Set up two-factor authentication
          </p>
        </div>

        {step === 'setup' && (
          <div className="space-y-6">
            {/* Instructions */}
            <div className="bg-white/20 border border-white/30 rounded-lg p-6 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-white mb-4">Step 1: Install an Authenticator App</h3>
              <p className="text-white opacity-80 mb-4 text-sm">
                Download and install an authenticator app like:
              </p>
              <ul className="text-white opacity-80 text-sm space-y-1 list-disc list-inside">
                <li>Google Authenticator</li>
                <li>Microsoft Authenticator</li>
                <li>Authy</li>
              </ul>
            </div>

            {/* QR Code */}
            <div className="bg-white/20 border border-white/30 rounded-lg p-6 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-white mb-4">Step 2: Scan QR Code</h3>
              <div className="flex flex-col items-center space-y-4">
                <div className="bg-white p-4 rounded-lg">
                  <img 
                    src={twoFactorData.qr_code_image} 
                    alt="2FA QR Code"
                    className="w-48 h-48"
                  />
                </div>
                <p className="text-white opacity-80 text-sm text-center">
                  Scan this QR code with your authenticator app
                </p>
              </div>
            </div>

            {/* Manual Entry Option */}
            <div className="bg-white/20 border border-white/30 rounded-lg p-6 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-white mb-4">Can't scan? Enter manually</h3>
              <button
                onClick={() => setShowSecret(!showSecret)}
                className="text-white underline text-sm mb-2"
              >
                {showSecret ? 'Hide' : 'Show'} secret key
              </button>
              {showSecret && (
                <div className="bg-gray-800 p-3 rounded font-mono text-sm text-white break-all">
                  {twoFactorData.secret}
                </div>
              )}
            </div>

            {/* Continue Button */}
            <button
              onClick={() => setStep('verify')}
              className="w-full bg-white text-gray-900 font-semibold text-lg py-3 px-6 rounded-full hover:bg-gray-100 transition-colors duration-200 opacity-80"
            >
              Continue to Verification
            </button>

            <div className="text-center">
              <button
                onClick={onBack}
                className="text-sm text-white opacity-60 hover:opacity-80 transition-opacity duration-200"
              >
                ← Back to registration
              </button>
            </div>
          </div>
        )}

        {step === 'verify' && (
          <div className="space-y-6">
            <div className="bg-white/20 border border-white/30 rounded-lg p-6 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-white mb-4">Step 3: Enter Verification Code</h3>
              <p className="text-white opacity-80 text-sm mb-4">
                Enter the 6-digit code from your authenticator app to complete setup.
              </p>
            </div>

            <form onSubmit={handleVerifyCode} className="space-y-6">
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
                {isLoading ? 'Verifying...' : 'Complete Setup'}
              </button>
            </form>

            <div className="space-y-2 text-center">
              <button
                onClick={() => setStep('setup')}
                className="block w-full text-sm text-white opacity-60 hover:opacity-80 transition-opacity duration-200"
              >
                ← Back to QR Code
              </button>
              <button
                onClick={handleResendQR}
                className="block w-full text-sm text-white opacity-60 hover:opacity-80 transition-opacity duration-200"
              >
                Refresh QR Code
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}