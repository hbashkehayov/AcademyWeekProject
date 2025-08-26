'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center px-4">
          <div className="glass-morphism p-8 rounded-3xl text-center max-w-md">
            <div className="text-6xl mb-4">🚨</div>
            <h2 className="text-2xl font-bold text-white mb-4">Application Error</h2>
            <p className="text-white/70 mb-6">
              A critical error occurred. Please refresh the page or contact support if the issue persists.
            </p>
            <button
              onClick={() => reset()}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
            >
              Reset Application
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}