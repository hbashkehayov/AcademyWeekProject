'use client';

import { useState } from 'react';

interface RecoveryCodesProps {
  recoveryCodes: string[];
  onComplete: () => void;
}

export default function RecoveryCodes({ recoveryCodes, onComplete }: RecoveryCodesProps) {
  const [hasDownloaded, setHasDownloaded] = useState(false);

  const downloadCodes = () => {
    const codesText = recoveryCodes.join('\n');
    const blob = new Blob([codesText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ai-tools-platform-recovery-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setHasDownloaded(true);
  };

  const copyCodes = async () => {
    try {
      await navigator.clipboard.writeText(recoveryCodes.join('\n'));
      // You could show a toast notification here
    } catch (error) {
      console.error('Failed to copy codes:', error);
    }
  };

  return (
    <div className="glass-morphism mx-auto max-w-2xl px-8 py-12 md:px-12 md:py-16 rounded-3xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 bg-green-500 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white opacity-80 mb-4 tracking-tight">
          Setup Complete!
        </h1>
        <p className="text-lg md:text-xl text-white opacity-80">
          Save your recovery codes
        </p>
      </div>

      {/* Important Notice */}
      <div className="bg-amber-500/20 border border-amber-500/30 rounded-lg p-6 backdrop-blur-sm mb-6">
        <div className="flex items-start space-x-3">
          <svg className="w-6 h-6 text-amber-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 19c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <div>
            <h3 className="text-lg font-semibold text-amber-400 mb-2">Important!</h3>
            <p className="text-white opacity-80 text-sm">
              These recovery codes can be used to access your account if you lose your authenticator app. 
              Store them in a safe place and don&apos;t share them with anyone.
            </p>
          </div>
        </div>
      </div>

      {/* Recovery Codes */}
      <div className="bg-white/20 border border-white/30 rounded-lg p-6 backdrop-blur-sm mb-6">
        <h3 className="text-lg font-semibold text-white mb-4 text-center">Your Recovery Codes</h3>
        <div className="bg-gray-800 p-6 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recoveryCodes.map((code, index) => (
              <div 
                key={index}
                className="bg-gray-700 px-4 py-3 rounded text-center font-mono text-base text-white break-all"
              >
                {code}
              </div>
            ))}
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex space-x-3 mt-4">
          <button
            onClick={downloadCodes}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm"
          >
            Download
          </button>
          <button
            onClick={copyCodes}
            className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors duration-200 text-sm"
          >
            Copy
          </button>
        </div>
      </div>

      {/* Security Tips */}
      <div className="bg-white/20 border border-white/30 rounded-lg p-6 backdrop-blur-sm mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">Security Tips</h3>
        <ul className="text-white opacity-80 text-sm space-y-2">
          <li className="flex items-start">
            <span className="text-green-400 mr-2">•</span>
            Store these codes offline (print them or write them down)
          </li>
          <li className="flex items-start">
            <span className="text-green-400 mr-2">•</span>
            Keep them separate from your authenticator app
          </li>
          <li className="flex items-start">
            <span className="text-green-400 mr-2">•</span>
            Each code can only be used once
          </li>
          <li className="flex items-start">
            <span className="text-green-400 mr-2">•</span>
            Never share these codes with anyone
          </li>
        </ul>
      </div>

      {/* Confirmation */}
      <div className="space-y-4">
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={hasDownloaded}
            onChange={(e) => setHasDownloaded(e.target.checked)}
            className="h-4 w-4 text-white bg-white/20 border-white/30 rounded focus:ring-white/50"
          />
          <span className="text-white opacity-80 text-sm">
            I have saved my recovery codes in a safe place
          </span>
        </label>

        <button
          onClick={onComplete}
          disabled={!hasDownloaded}
          className="w-full bg-white text-gray-900 font-semibold text-lg py-3 px-6 rounded-full hover:bg-gray-100 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 opacity-80"
        >
          Continue to Login
        </button>
      </div>
    </div>
  );
}