'use client';

import { useEffect, useState } from 'react';

interface ErrorPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onForgotPassword?: () => void;
  message?: string;
}

export default function ErrorPopup({ isOpen, onClose, onForgotPassword, message = "Incorrect credentials" }: ErrorPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setTimeout(() => setIsAnimating(true), 50);
    } else {
      setIsAnimating(false);
      setTimeout(() => setIsVisible(false), 600);
    }
  }, [isOpen]);

  if (!isVisible) return null;

  return (
    <>
      {/* Heavy Blur Backdrop - No darkening */}
      <div 
        className={`fixed inset-0 z-40 transition-all ${isAnimating ? 'duration-700' : 'duration-500'}`}
        onClick={onClose}
        style={{ 
          backdropFilter: isAnimating ? 'blur(20px)' : 'blur(0px)',
          WebkitBackdropFilter: isAnimating ? 'blur(20px)' : 'blur(0px)',
          backgroundColor: 'transparent'
        }}
      />

      {/* Error Popup with Darker Glass Effect */}
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4 pointer-events-none">
        <div 
          className={`
            relative max-w-md w-full p-8 rounded-3xl pointer-events-auto
            transform transition-all
            ${isAnimating 
              ? 'opacity-100 scale-100 translate-y-0' 
              : 'opacity-0 scale-90 translate-y-12'
            }
          `}
          style={{
            background: 'linear-gradient(135deg, rgba(30, 30, 30, 0.7) 0%, rgba(20, 20, 20, 0.6) 100%)',
            backdropFilter: 'blur(40px) saturate(180%)',
            WebkitBackdropFilter: 'blur(40px) saturate(180%)',
            border: '2px solid rgba(255, 255, 255, 0.2)',
            boxShadow: `
              0 30px 60px rgba(0, 0, 0, 0.5),
              0 15px 35px rgba(0, 0, 0, 0.3),
              inset 0 2px 4px rgba(255, 255, 255, 0.1),
              inset 0 -2px 4px rgba(0, 0, 0, 0.2)
            `,
            transitionDuration: '700ms',
            transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Animated Error Icon with Fade-in */}
          <div className="flex justify-center mb-6">
            <div 
              className={`
                w-20 h-20 rounded-full flex items-center justify-center
                transform transition-all
                ${isAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}
              `}
              style={{
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.8) 0%, rgba(220, 38, 38, 0.6) 100%)',
                border: '2px solid rgba(248, 113, 113, 0.8)',
                boxShadow: '0 10px 30px rgba(239, 68, 68, 0.4)',
                animation: isAnimating ? 'fadeInScale 0.8s ease-out forwards, pulse 2s infinite 0.8s' : 'none',
                transitionDelay: '200ms',
                transitionDuration: '800ms'
              }}
            >
              <style jsx>{`
                @keyframes fadeInScale {
                  0% {
                    opacity: 0;
                    transform: scale(0.5);
                  }
                  100% {
                    opacity: 1;
                    transform: scale(1);
                  }
                }
                @keyframes pulse {
                  0%, 100% {
                    transform: scale(1);
                    box-shadow: 0 10px 30px rgba(239, 68, 68, 0.4);
                  }
                  50% {
                    transform: scale(1.08);
                    box-shadow: 0 12px 40px rgba(239, 68, 68, 0.6);
                  }
                }
              `}</style>
              <svg 
                className={`
                  w-10 h-10 text-red-100
                  transition-opacity
                  ${isAnimating ? 'opacity-100' : 'opacity-0'}
                `}
                style={{
                  transitionDelay: '400ms',
                  transitionDuration: '600ms'
                }}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
            </div>
          </div>

          {/* Error Message with Enhanced Fade-in */}
          <h2 
            className={`
              text-2xl font-bold text-white text-center mb-3
              transition-all
              ${isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}
            `}
            style={{
              transitionDelay: '400ms',
              transitionDuration: '800ms',
              transitionTimingFunction: 'ease-out',
              textShadow: '0 2px 8px rgba(0, 0, 0, 0.5)'
            }}
          >
            Authentication Failed
          </h2>
          <p 
            className={`
              text-white text-center mb-8 text-lg
              transition-all
              ${isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}
            `}
            style={{
              transitionDelay: '500ms',
              transitionDuration: '800ms',
              transitionTimingFunction: 'ease-out',
              textShadow: '0 2px 6px rgba(0, 0, 0, 0.4)'
            }}
          >
            {message}
          </p>

          {/* Action Buttons with Staggered Animation */}
          <div className="space-y-3">
            {/* Forgot Password Button with Smooth Fade-in */}
            <button
              onClick={onForgotPassword || (() => {})}
              className={`
                w-full py-3 px-6 rounded-full text-white font-semibold 
                transition-all hover:scale-105
                ${isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}
              `}
              style={{
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.8) 0%, rgba(37, 99, 235, 0.7) 100%)',
                border: '1px solid rgba(96, 165, 250, 0.8)',
                backdropFilter: 'blur(10px)',
                transitionDelay: '600ms',
                transitionDuration: '800ms',
                transitionTimingFunction: 'ease-out',
                boxShadow: '0 6px 20px rgba(59, 130, 246, 0.4)',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.9) 0%, rgba(37, 99, 235, 0.8) 100%)';
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.8) 0%, rgba(37, 99, 235, 0.7) 100%)';
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4)';
              }}
            >
              Forgotten Password?
            </button>

            {/* Back Button with Smooth Fade-in */}
            <button
              onClick={onClose}
              className={`
                w-full py-3 px-6 rounded-full text-white font-semibold 
                transition-all hover:scale-105
                ${isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}
              `}
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                backdropFilter: 'blur(10px)',
                transitionDelay: '700ms',
                transitionDuration: '800ms',
                transitionTimingFunction: 'ease-out',
                boxShadow: '0 6px 20px rgba(255, 255, 255, 0.2)',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(255, 255, 255, 0.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 255, 255, 0.2)';
              }}
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </>
  );
}