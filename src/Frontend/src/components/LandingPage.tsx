'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Footer from './Footer';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

type ViewState = 'landing' | 'login' | 'register';

export default function LandingPage() {
  const [currentView, setCurrentView] = useState<ViewState>('landing');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [nextView, setNextView] = useState<ViewState | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const router = useRouter();

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleViewChange = (newView: ViewState) => {
    if (isTransitioning || currentView === newView) return;
    
    setIsTransitioning(true);
    setNextView(newView);
    
    // After fade out completes, switch view and fade in
    setTimeout(() => {
      setCurrentView(newView);
      setNextView(null);
      // Let the fade in animation start
      setTimeout(() => {
        setIsTransitioning(false);
      }, 100);
    }, 400); // Match fade-out duration
  };

  const showLogin = () => handleViewChange('login');
  const showRegister = () => handleViewChange('register');
  const showLanding = () => handleViewChange('landing');
  const showDashboard = () => {
    router.push('/dashboard');
  };
  return (
    <div 
      className="relative overflow-hidden"
      style={{
        background: isDarkMode 
          ? 'linear-gradient(135deg, #0c1e3d 0%, #1e3a8a 25%, #312e81 50%, #1e1b4b 75%, #0f0f23 100%)'
          : 'linear-gradient(135deg, #6ee7b7 0%, #34d399 20%, #10b981 40%, #059669 60%, #047857 80%, #065f46 100%)',
        transition: 'background 1.2s cubic-bezier(0.4, 0.0, 0.2, 1)'
      }}
    >
      {/* Animated Background Overlay */}
      <div 
        className="absolute inset-0 transition-opacity duration-1000 ease-out"
        style={{
          background: isDarkMode 
            ? 'radial-gradient(circle at 30% 20%, rgba(30, 58, 138, 0.4) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(49, 46, 129, 0.3) 0%, transparent 50%)'
            : 'radial-gradient(circle at 30% 20%, rgba(110, 231, 183, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(52, 211, 153, 0.2) 0%, transparent 50%)',
          opacity: isDarkMode ? 0.8 : 0.7
        }}
      />

      {/* Main Content Section */}
      <div className="relative flex items-center justify-center min-h-screen py-12 z-10">

        {/* Content Container with Smooth Fade Transitions */}
        <div className={`relative z-10 text-center px-4 ${
          isTransitioning ? 'fade-out-animation' : 
          currentView === 'landing' ? 'fade-in-animation' : 
          'fade-transition-enter'
        }`}>
          {currentView === 'landing' && (
            <>
              <div className="glass-morphism mx-auto max-w-6xl px-12 py-16 md:px-20 md:py-20 rounded-3xl">
                {/* Title */}
                <h1 className="text-7xl md:text-8xl lg:text-9xl xl:text-[10rem] font-bold text-white opacity-80 mb-10 tracking-tight">
                  sanctum
                </h1>
                
                {/* Description */}
                <p className="text-xl md:text-2xl lg:text-3xl text-white opacity-80 font-medium leading-relaxed mb-12">
                  A library of AI tools, selected by experienced SoftArt developers.
                </p>

                {/* Sign In Button */}
                <button
                  onClick={showLogin}
                  disabled={isTransitioning}
                  className="inline-block bg-white text-gray-900 font-semibold text-xl md:text-2xl px-12 py-4 md:px-16 md:py-5 rounded-full hover:bg-gray-100 transition-colors duration-200 mb-6 opacity-80 disabled:opacity-50"
                >
                  Sign In
                </button>

                {/* Sign Up Link */}
                <div className="text-white text-lg md:text-xl opacity-80">
                  <span>Don't have an account? </span>
                  <button
                    onClick={showRegister}
                    disabled={isTransitioning}
                    className="font-semibold underline hover:no-underline transition-all duration-200 disabled:opacity-50"
                  >
                    Sign up!
                  </button>
                </div>
              </div>
              
              {/* Dark Mode Toggle - Below Glass Component */}
              <div className="flex justify-center mt-8">
                <div className="glass-morphism rounded-full p-3 shadow-xl border border-white/30 bg-white/15 backdrop-blur-lg transform transition-all duration-500 hover:scale-105">
                  <button
                    onClick={toggleDarkMode}
                    className="relative flex items-center w-20 h-10 rounded-full focus:outline-none focus:ring-4 focus:ring-white/20 transition-all duration-700 ease-out overflow-hidden"
                    style={{
                      background: isDarkMode 
                        ? 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)'
                        : 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                      boxShadow: isDarkMode 
                        ? '0 8px 32px rgba(59, 130, 246, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.1)'
                        : '0 8px 32px rgba(251, 191, 36, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.2)',
                      transition: 'all 0.8s cubic-bezier(0.4, 0.0, 0.2, 1)'
                    }}
                  >
                    {/* Animated Background Ripple */}
                    <div
                      className="absolute inset-0 rounded-full transition-all duration-1000 ease-out"
                      style={{
                        background: isDarkMode 
                          ? 'radial-gradient(circle at center, rgba(147, 197, 253, 0.4) 0%, transparent 70%)'
                          : 'radial-gradient(circle at center, rgba(254, 240, 138, 0.4) 0%, transparent 70%)',
                        transform: isDarkMode ? 'scale(1.2)' : 'scale(0.8)',
                        opacity: isDarkMode ? 0.8 : 0.6
                      }}
                    />
                    
                    {/* Floating Particles */}
                    <div className="absolute inset-0 overflow-hidden rounded-full">
                      {[...Array(3)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-1 h-1 rounded-full transition-all duration-1000"
                          style={{
                            background: isDarkMode ? '#93c5fd' : '#fed7aa',
                            left: `${20 + i * 25}%`,
                            top: `${30 + i * 10}%`,
                            transform: isDarkMode ? 'translateY(-2px) scale(1)' : 'translateY(2px) scale(0.7)',
                            opacity: isDarkMode ? 0.8 : 0.5,
                            animationDelay: `${i * 200}ms`
                          }}
                        />
                      ))}
                    </div>
                    
                    {/* Sliding Button with Liquid Animation */}
                    <div
                      className="relative z-10 w-8 h-8 rounded-full flex items-center justify-center transform transition-all duration-700 ease-out shadow-2xl"
                      style={{
                        transform: isDarkMode 
                          ? 'translateX(40px) rotate(180deg)' 
                          : 'translateX(4px) rotate(0deg)',
                        background: isDarkMode 
                          ? 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)'
                          : 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                        boxShadow: isDarkMode 
                          ? '0 4px 20px rgba(99, 102, 241, 0.4), inset 0 1px 4px rgba(255, 255, 255, 0.3)'
                          : '0 4px 20px rgba(217, 119, 6, 0.4), inset 0 1px 4px rgba(255, 255, 255, 0.4)'
                      }}
                    >
                      {/* Icon Container with Smooth Transition */}
                      <div className="relative w-5 h-5 flex items-center justify-center">
                        {/* Moon Icon */}
                        <svg 
                          className={`absolute w-4 h-4 text-blue-700 transition-all duration-500 ${
                            isDarkMode ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-75 -rotate-90'
                          }`}
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                        </svg>
                        
                        {/* Sun Icon */}
                        <svg 
                          className={`absolute w-4 h-4 text-orange-600 transition-all duration-500 ${
                            !isDarkMode ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-75 rotate-90'
                          }`}
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          <path 
                            fillRule="evenodd" 
                            d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" 
                            clipRule="evenodd" 
                          />
                        </svg>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </>
          )}

          {currentView === 'login' && (
            <>
              {/* Dark Mode Toggle - Above Login Form */}
              <div className="flex justify-center mb-8">
                <div className="glass-morphism rounded-full p-3 shadow-xl border border-white/30 bg-white/15 backdrop-blur-lg transform transition-all duration-500 hover:scale-105">
                  <button
                    onClick={toggleDarkMode}
                    className="relative flex items-center w-20 h-10 rounded-full focus:outline-none focus:ring-4 focus:ring-white/20 transition-all duration-700 ease-out overflow-hidden"
                    style={{
                      background: isDarkMode 
                        ? 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)'
                        : 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                      boxShadow: isDarkMode 
                        ? '0 8px 32px rgba(59, 130, 246, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.1)'
                        : '0 8px 32px rgba(251, 191, 36, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.2)',
                      transition: 'all 0.8s cubic-bezier(0.4, 0.0, 0.2, 1)'
                    }}
                  >
                    <div
                      className="absolute inset-0 rounded-full transition-all duration-1000 ease-out"
                      style={{
                        background: isDarkMode 
                          ? 'radial-gradient(circle at center, rgba(147, 197, 253, 0.4) 0%, transparent 70%)'
                          : 'radial-gradient(circle at center, rgba(254, 240, 138, 0.4) 0%, transparent 70%)',
                        transform: isDarkMode ? 'scale(1.2)' : 'scale(0.8)',
                        opacity: isDarkMode ? 0.8 : 0.6
                      }}
                    />
                    <div className="absolute inset-0 overflow-hidden rounded-full">
                      {[...Array(3)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-1 h-1 rounded-full transition-all duration-1000"
                          style={{
                            background: isDarkMode ? '#93c5fd' : '#fed7aa',
                            left: `${20 + i * 25}%`,
                            top: `${30 + i * 10}%`,
                            transform: isDarkMode ? 'translateY(-2px) scale(1)' : 'translateY(2px) scale(0.7)',
                            opacity: isDarkMode ? 0.8 : 0.5,
                            animationDelay: `${i * 200}ms`
                          }}
                        />
                      ))}
                    </div>
                    <div
                      className="relative z-10 w-8 h-8 rounded-full flex items-center justify-center transform transition-all duration-700 ease-out shadow-2xl"
                      style={{
                        transform: isDarkMode 
                          ? 'translateX(40px) rotate(180deg)' 
                          : 'translateX(4px) rotate(0deg)',
                        background: isDarkMode 
                          ? 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)'
                          : 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                        boxShadow: isDarkMode 
                          ? '0 4px 20px rgba(99, 102, 241, 0.4), inset 0 1px 4px rgba(255, 255, 255, 0.3)'
                          : '0 4px 20px rgba(217, 119, 6, 0.4), inset 0 1px 4px rgba(255, 255, 255, 0.4)'
                      }}
                    >
                      <div className="relative w-5 h-5 flex items-center justify-center">
                        <svg 
                          className={`absolute w-4 h-4 text-blue-700 transition-all duration-500 ${
                            isDarkMode ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-75 -rotate-90'
                          }`}
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                        </svg>
                        <svg 
                          className={`absolute w-4 h-4 text-orange-600 transition-all duration-500 ${
                            !isDarkMode ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-75 rotate-90'
                          }`}
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          <path 
                            fillRule="evenodd" 
                            d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" 
                            clipRule="evenodd" 
                          />
                        </svg>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
              <LoginForm 
                onBack={showLanding}
                onSwitchToRegister={showRegister}
                onSuccess={showDashboard}
              />
            </>
          )}

          {currentView === 'register' && (
            <>
              {/* Dark Mode Toggle Above Register Form */}
              <div className="flex justify-center mb-8">
                <div className="glass-morphism rounded-full p-3 shadow-xl border border-white/30 bg-white/15 backdrop-blur-lg transform transition-all duration-500 hover:scale-105">
                  <button
                    onClick={toggleDarkMode}
                    className="relative flex items-center w-20 h-10 rounded-full focus:outline-none focus:ring-4 focus:ring-white/20 transition-all duration-700 ease-out overflow-hidden"
                    style={{
                      background: isDarkMode 
                        ? 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)'
                        : 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                      boxShadow: isDarkMode 
                        ? '0 8px 32px rgba(59, 130, 246, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.1)'
                        : '0 8px 32px rgba(251, 191, 36, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.2)',
                      transition: 'all 0.8s cubic-bezier(0.4, 0.0, 0.2, 1)'
                    }}
                  >
                    <div
                      className="absolute inset-0 rounded-full transition-all duration-1000 ease-out"
                      style={{
                        background: isDarkMode 
                          ? 'radial-gradient(circle at center, rgba(147, 197, 253, 0.4) 0%, transparent 70%)'
                          : 'radial-gradient(circle at center, rgba(254, 240, 138, 0.4) 0%, transparent 70%)',
                        transform: isDarkMode ? 'scale(1.2)' : 'scale(0.8)',
                        opacity: isDarkMode ? 0.8 : 0.6
                      }}
                    />
                    <div className="absolute inset-0 overflow-hidden rounded-full">
                      {[...Array(3)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-1 h-1 rounded-full transition-all duration-1000"
                          style={{
                            background: isDarkMode ? '#93c5fd' : '#fed7aa',
                            left: `${20 + i * 25}%`,
                            top: `${30 + i * 10}%`,
                            transform: isDarkMode ? 'translateY(-2px) scale(1)' : 'translateY(2px) scale(0.7)',
                            opacity: isDarkMode ? 0.8 : 0.5,
                            animationDelay: `${i * 200}ms`
                          }}
                        />
                      ))}
                    </div>
                    <div
                      className="relative z-10 w-8 h-8 rounded-full flex items-center justify-center transform transition-all duration-700 ease-out shadow-2xl"
                      style={{
                        transform: isDarkMode 
                          ? 'translateX(40px) rotate(180deg)' 
                          : 'translateX(4px) rotate(0deg)',
                        background: isDarkMode 
                          ? 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)'
                          : 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                        boxShadow: isDarkMode 
                          ? '0 4px 20px rgba(99, 102, 241, 0.4), inset 0 1px 4px rgba(255, 255, 255, 0.3)'
                          : '0 4px 20px rgba(217, 119, 6, 0.4), inset 0 1px 4px rgba(255, 255, 255, 0.4)'
                      }}
                    >
                      <div className="relative w-5 h-5 flex items-center justify-center">
                        <svg 
                          className={`absolute w-4 h-4 text-blue-700 transition-all duration-500 ${
                            isDarkMode ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-75 -rotate-90'
                          }`}
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                        </svg>
                        <svg 
                          className={`absolute w-4 h-4 text-orange-600 transition-all duration-500 ${
                            !isDarkMode ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-75 rotate-90'
                          }`}
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          <path 
                            fillRule="evenodd" 
                            d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" 
                            clipRule="evenodd" 
                          />
                        </svg>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
              <RegisterForm 
                onBack={showLanding}
                onSwitchToLogin={showLogin}
                onSuccess={showDashboard}
              />
            </>
          )}
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}