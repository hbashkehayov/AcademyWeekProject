
'use client';

import { useState } from 'react';
import GreetingCard from './GreetingCard';
import SuggestedTools from './SuggestedTools';
import NotesCard from './NotesCard';
import ActionButtons from './ActionButtons';
import AdminOperations from './AdminOperations';
import NotesPreview from './NotesPreview';
import ToolsList from './ToolsList';
import AddToolForm from './AddToolForm';
import AIAssistant from './AIAssistant';
import Footer from './Footer';
import { apiService } from '@/lib/api';

interface DashboardProps {
  user: {
    name: string;
    display_name: string;
    role: string;
  };
  onBack: () => void;
}

type ViewState = 'dashboard' | 'tools' | 'addTool' | 'aiAssistant';

export default function Dashboard({ user, onBack }: DashboardProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isSubmittingTool, setIsSubmittingTool] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleViewChange = (newView: ViewState) => {
    console.log(`Dashboard: handleViewChange called with ${newView}`);
    if (isTransitioning || currentView === newView) return;
    
    setIsTransitioning(true);
    console.log(`Dashboard: Transitioning to ${newView}`);
    
    // After fade out completes, switch view and fade in
    setTimeout(() => {
      setCurrentView(newView);
      console.log(`Dashboard: Current view set to ${newView}`);
      // Let the fade in animation start
      setTimeout(() => {
        setIsTransitioning(false);
      }, 100);
    }, 400); // Match fade-out duration
  };

  const showToolsList = () => handleViewChange('tools');
  const showDashboard = () => handleViewChange('dashboard');
  const showAddTool = () => {
    console.log('Dashboard: showAddTool called');
    handleViewChange('addTool');
  };
  const showAIAssistant = () => {
    console.log('Dashboard: showAIAssistant called');
    handleViewChange('aiAssistant');
  };

  const handleToolSubmit = async (toolData: any) => {
    setIsSubmittingTool(true);
    try {
      // Submit tool via API
      const submittedTool = await apiService.createTool(toolData);
      console.log('Tool submitted successfully:', submittedTool);
      
      // Show success message and go back to dashboard
      alert('Tool submitted successfully! It will be reviewed before being added to the library.');
      showDashboard();
    } catch (error) {
      console.error('Error submitting tool:', error);
      
      // Show specific error messages based on the error type
      if (error instanceof Error) {
        alert(`Error submitting tool: ${error.message}`);
      } else {
        alert('Error submitting tool. Please check your connection and try again.');
      }
    } finally {
      setIsSubmittingTool(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col transition-all duration-500 ${isDarkMode ? 'bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900' : ''}`}>
      {/* Dashboard Content */}
      <div className="flex-1 py-8">
        {/* Header - Centered */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            {/* Standalone Arrow with Full-Width Dropdown */}
            <div className="relative mb-8">
              {/* Standalone Arrow */}
              <button
                onMouseEnter={() => setIsDropdownOpen(true)}
                className="text-white opacity-60 hover:opacity-80 transition-all duration-300 transform hover:scale-110 cursor-pointer mx-auto block"
              >
                <svg 
                  className={`w-6 h-6 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {/* Full-Width Dropdown */}
            <div
              onMouseEnter={() => setIsDropdownOpen(true)}
              onMouseLeave={() => setIsDropdownOpen(false)}
              className={`fixed left-0 right-0 top-20 transition-all duration-300 z-50 ${
                isDropdownOpen 
                  ? 'opacity-100 translate-y-0 pointer-events-auto' 
                  : 'opacity-0 -translate-y-4 pointer-events-none'
              }`}
            >
              {/* Heavy Backdrop Blur */}
              <div className="absolute inset-0 backdrop-blur-3xl bg-black/70"></div>
              
              <div className="relative mx-4 sm:mx-6 lg:mx-8 rounded-2xl p-8 shadow-2xl border border-white/30 bg-white/30 backdrop-blur-3xl" style={{backgroundColor: 'rgba(255, 255, 255, 0.25)', backdropFilter: 'blur(40px) saturate(180%)'}}>
                <div className="max-w-7xl mx-auto">
                  {/* Navigation Grid with Back to Home */}
                  <nav>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                      {/* Back to Home as first card */}
                      <button
                        onClick={onBack}
                        className="flex flex-col items-center text-center px-6 py-4 text-white opacity-80 hover:opacity-100 hover:bg-white/10 rounded-xl transition-all duration-200 group"
                      >
                        <span className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-200">🏠</span>
                        <span className="font-medium">Back Home</span>
                        <span className="text-xs text-white/60 mt-1">Return to main</span>
                      </button>
                      <a
                        href="#"
                        className="flex flex-col items-center text-center px-6 py-4 text-white opacity-80 hover:opacity-100 hover:bg-white/10 rounded-xl transition-all duration-200 group"
                      >
                        <span className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-200">📊</span>
                        <span className="font-medium">Analytics</span>
                        <span className="text-xs text-white/60 mt-1">View insights</span>
                      </a>
                      <a
                        href="#"
                        className="flex flex-col items-center text-center px-6 py-4 text-white opacity-80 hover:opacity-100 hover:bg-white/10 rounded-xl transition-all duration-200 group"
                      >
                        <span className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-200">❤️</span>
                        <span className="font-medium">My Favourites</span>
                        <span className="text-xs text-white/60 mt-1">Saved tools</span>
                      </a>
                      <a
                        href="#"
                        className="flex flex-col items-center text-center px-6 py-4 text-white opacity-80 hover:opacity-100 hover:bg-white/10 rounded-xl transition-all duration-200 group"
                      >
                        <span className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-200">📝</span>
                        <span className="font-medium">My Submissions</span>
                        <span className="text-xs text-white/60 mt-1">Your contributions</span>
                      </a>
                      <a
                        href="#"
                        className="flex flex-col items-center text-center px-6 py-4 text-white opacity-80 hover:opacity-100 hover:bg-white/10 rounded-xl transition-all duration-200 group"
                      >
                        <span className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-200">⚙️</span>
                        <span className="font-medium">Settings</span>
                        <span className="text-xs text-white/60 mt-1">Preferences</span>
                      </a>
                    </div>
                  </nav>
                </div>
              </div>
            </div>
            <h1 className="text-7xl md:text-8xl lg:text-9xl xl:text-[10rem] font-bold text-white opacity-80 mb-6 tracking-tight">
              sanctum
            </h1>
            <p className="text-xl md:text-2xl text-white opacity-70 mb-6">
              Your personalized AI tools workspace
            </p>

            {/* Dark Mode Toggle */}
            <div className="flex justify-center mb-8">
              <div className="glass-morphism rounded-full p-2 shadow-lg border border-white/20 bg-white/10 backdrop-blur-lg">
                <button
                  onClick={toggleDarkMode}
                  className="relative flex items-center w-16 h-8 rounded-full transition-all duration-300 ease-in-out focus:outline-none"
                  style={{
                    backgroundColor: isDarkMode ? 'rgba(59, 130, 246, 0.3)' : 'rgba(251, 191, 36, 0.3)',
                  }}
                >
                  {/* Toggle Track */}
                  <div
                    className={`absolute inset-0 rounded-full transition-all duration-300 ${
                      isDarkMode ? 'bg-blue-500/20' : 'bg-yellow-400/20'
                    }`}
                  />
                  
                  {/* Sliding Button */}
                  <div
                    className={`relative z-10 w-7 h-7 rounded-full transition-all duration-300 transform flex items-center justify-center ${
                      isDarkMode 
                        ? 'translate-x-8 bg-blue-100 shadow-lg' 
                        : 'translate-x-0.5 bg-yellow-100 shadow-lg'
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
          </div>
        </div>

        {/* Dashboard Content - Conditional with Animations */}
        <div className="w-full px-4 sm:px-6 lg:px-8">
          {/* Content Container with Smooth Fade Transitions */}
          <div className={`transition-all duration-500 ease-out ${
            isTransitioning ? 'opacity-0 transform translate-y-4' : 
            'opacity-100 transform translate-y-0'
          }`}>
            {currentView === 'dashboard' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Greeting Card */}
                  <GreetingCard user={user} />
                  
                  {/* Notes Card */}
                  <NotesCard />
                  
                  {/* Action Buttons */}
                  <ActionButtons onReviewTools={showToolsList} onAddTool={showAddTool} onAIAssistant={showAIAssistant} />
                  
                  {/* Admin Operations - Only visible for owners */}
                  <AdminOperations user={user} />
                </div>

                {/* Right Column */}
                <div className="lg:col-span-1 space-y-6">
                  <SuggestedTools userRole={user.role} />
                  <NotesPreview />
                </div>
              </div>
            )}

            {currentView === 'tools' && (
              <div className="max-w-7xl mx-auto px-6">
                <ToolsList onBack={showDashboard} onToolClick={() => {}} />
              </div>
            )}

            {currentView === 'addTool' && (
              <div className="max-w-6xl mx-auto px-6">
                <AddToolForm 
                  onBack={showDashboard} 
                  onSubmit={handleToolSubmit}
                  isSubmitting={isSubmittingTool}
                />
              </div>
            )}

            {currentView === 'aiAssistant' && (
              <div className="max-w-6xl mx-auto px-6">
                <AIAssistant onBack={showDashboard} />
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Footer - Full Width */}
      <div className="w-full">
        <Footer />
      </div>
    </div>
  );
}