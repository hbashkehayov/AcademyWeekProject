'use client';

import { useTheme } from '@/contexts/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function ThemeToggle({ className = '', size = 'md' }: ThemeToggleProps) {
  const { isDarkMode, toggleTheme } = useTheme();
  
  const sizeClasses = {
    sm: 'w-12 h-6',
    md: 'w-16 h-8', 
    lg: 'w-20 h-10'
  };
  
  const buttonSizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-7 h-7',
    lg: 'w-8 h-8'
  };
  
  const translateClasses = {
    sm: isDarkMode ? 'translate-x-6' : 'translate-x-0.5',
    md: isDarkMode ? 'translate-x-8' : 'translate-x-0.5', 
    lg: isDarkMode ? 'translate-x-10' : 'translate-x-1'
  };

  return (
    <div className={`flex justify-center ${className}`}>
      <div className="glass-morphism rounded-full p-2 shadow-lg border border-white/20 bg-white/10 backdrop-blur-lg">
        <button
          onClick={toggleTheme}
          className={`relative flex items-center ${sizeClasses[size]} rounded-full transition-all duration-300 ease-in-out focus:outline-none`}
          style={{
            backgroundColor: isDarkMode ? 'rgba(59, 130, 246, 0.3)' : 'rgba(251, 191, 36, 0.3)',
          }}
          aria-label="Toggle theme"
        >
          {/* Toggle Track */}
          <div
            className={`absolute inset-0 rounded-full transition-all duration-300 ${
              isDarkMode ? 'bg-blue-500/20' : 'bg-yellow-400/20'
            }`}
          />
          
          {/* Sliding Button */}
          <div
            className={`relative z-10 ${buttonSizeClasses[size]} rounded-full transition-all duration-300 transform flex items-center justify-center ${
              isDarkMode 
                ? `${translateClasses[size]} bg-blue-100 shadow-lg` 
                : `${translateClasses[size]} bg-yellow-100 shadow-lg`
            }`}
          >
            {isDarkMode ? (
              // Moon Icon
              <svg 
                className="w-4 h-4 text-blue-700" 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            ) : (
              // Sun Icon
              <svg 
                className="w-4 h-4 text-yellow-600" 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path 
                  fillRule="evenodd" 
                  d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" 
                  clipRule="evenodd" 
                />
              </svg>
            )}
          </div>
        </button>
      </div>
    </div>
  );
}