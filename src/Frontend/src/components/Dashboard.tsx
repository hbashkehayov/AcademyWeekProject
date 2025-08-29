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
import Recommendations from './Recommendations';
import Favourites from './Favourites';
import ToolDetails from './ToolDetails';
// import Settings from './Settings';
import Footer from './Footer';
import { apiService } from '@/lib/api';
import { useTheme } from '@/contexts/ThemeContext';
import type { AiTool } from '@/types';

interface DashboardProps {
  user?: {
    name: string;
    display_name: string;
    role: string;
  };
  onBack: () => void;
}

type ViewState = 'dashboard' | 'tools' | 'addTool' | 'aiAssistant' | 'recommendations' | 'favourites' | 'toolDetails';

export default function Dashboard({ user, onBack }: DashboardProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isSubmittingTool, setIsSubmittingTool] = useState(false);
  const [aiSuggestedToolData, setAiSuggestedToolData] = useState<any>(null);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [selectedTool, setSelectedTool] = useState<AiTool | null>(null);

  const { isDarkMode, toggleTheme } = useTheme();

  const handleViewChange = (newView: ViewState) => {
    if (isTransitioning || currentView === newView) {
      return;
    }
    
    setIsTransitioning(true);
    
    // After fade out completes, switch view and fade in
    setTimeout(() => {
      setCurrentView(newView);
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
    setAiSuggestedToolData(null); // Clear any AI suggested data
    handleViewChange('addTool');
  };
  const showAIAssistant = () => {
    console.log('Dashboard: showAIAssistant called');
    handleViewChange('aiAssistant');
  };
  const showRecommendations = () => {
    console.log('Dashboard: showRecommendations called');
    handleViewChange('recommendations');
  };
  const showFavourites = () => {
    handleViewChange('favourites');
  };

  const handleEditAITool = (toolData: any) => {
    console.log('Dashboard: handleEditAITool called with:', toolData);
    setAiSuggestedToolData(toolData);
    handleViewChange('addTool');
  };

  const handleToolClick = (tool: AiTool) => {
    console.log('Dashboard: handleToolClick called with:', tool.name);
    setSelectedTool(tool);
    handleViewChange('toolDetails');
  };

  const handleBackFromToolDetails = () => {
    console.log('Dashboard: handleBackFromToolDetails called');
    setSelectedTool(null);
    showDashboard();
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

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const handleLogoutConfirm = async () => {
    try {
      await apiService.logout();
      // The apiService.logout() already redirects to home page
    } catch (error) {
      console.error('Error logging out:', error);
      // Even if logout fails, redirect to home
      onBack();
    }
  };

  const handleLogoutCancel = () => {
    setShowLogoutDialog(false);
  };

  return (
    <div className={`min-h-screen flex flex-col transition-all duration-500 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900' 
        : 'bg-gradient-to-br from-blue-50 via-white to-blue-100'
    }`}>
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

            {/* Full-Width Dropdown - Ultra Transparent with Fluid Animations */}
            <div
              onMouseEnter={() => setIsDropdownOpen(true)}
              onMouseLeave={() => setIsDropdownOpen(false)}
              className={`fixed left-0 right-0 top-20 transition-all duration-700 ease-out z-50 ${
                isDropdownOpen 
                  ? 'opacity-100 translate-y-0 pointer-events-auto' 
                  : 'opacity-0 -translate-y-8 pointer-events-none'
              }`}
            >
              {/* Ultra-light Backdrop Blur */}
              <div className="absolute inset-0 backdrop-blur-2xl bg-black/20"></div>
              
              <div 
                className="relative mx-4 sm:mx-6 lg:mx-8 rounded-3xl p-8 shadow-2xl border border-white/10 transition-all duration-700 ease-out transform"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.03)', 
                  backdropFilter: 'blur(30px) saturate(200%)',
                  boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                  transform: isDropdownOpen ? 'scale(1)' : 'scale(0.95)',
                }}
              >
                <div className="max-w-7xl mx-auto">
                  {/* Navigation Grid with Enhanced Animations */}
                  <nav>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                      {/* Log-out with Confirmation Dialog */}
                      <button
                        onClick={handleLogoutClick}
                        className="flex flex-col items-center text-center px-6 py-4 text-white opacity-75 hover:opacity-100 rounded-2xl transition-all duration-500 ease-out group transform hover:scale-110 hover:bg-red-500/10 backdrop-blur-sm"
                        style={{
                          background: 'rgba(239, 68, 68, 0.08)',
                          backdropFilter: 'blur(10px)',
                          boxShadow: 'inset 0 1px 0 rgba(239, 68, 68, 0.1)',
                        }}
                      >
                        <span className="text-3xl mb-2 group-hover:scale-125 transition-transform duration-500 ease-out">🚪</span>
                        <span className="font-medium">Log-out</span>
                        <span className="text-xs text-white/60 mt-1">Exit dashboard</span>
                      </button>
                      
                      <a
                        href="#"
                        className="flex flex-col items-center text-center px-6 py-4 text-white opacity-75 hover:opacity-100 rounded-2xl transition-all duration-500 ease-out group transform hover:scale-110 hover:bg-white/10 backdrop-blur-lg border border-white/20 hover:border-white/40"
                        style={{
                          background: 'rgba(255, 255, 255, 0.08)',
                          backdropFilter: 'blur(20px)',
                          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 4px 12px rgba(0, 0, 0, 0.15)',
                        }}
                      >
                        <span className="text-3xl mb-2 group-hover:scale-125 transition-transform duration-500 ease-out">📊</span>
                        <span className="font-medium">Analytics</span>
                        <span className="text-xs text-white/60 mt-1">View insights</span>
                      </a>
                      
                      <button
                        onClick={showFavourites}
                        className="flex flex-col items-center text-center px-6 py-4 text-white opacity-75 hover:opacity-100 rounded-2xl transition-all duration-500 ease-out group transform hover:scale-110 hover:bg-white/10 backdrop-blur-lg border border-white/20 hover:border-white/40"
                        style={{
                          background: 'rgba(255, 255, 255, 0.08)',
                          backdropFilter: 'blur(20px)',
                          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 4px 12px rgba(0, 0, 0, 0.15)',
                        }}
                      >
                        <span className="text-3xl mb-2 group-hover:scale-125 transition-transform duration-500 ease-out">❤️</span>
                        <span className="font-medium">My Favourites</span>
                        <span className="text-xs text-white/60 mt-1">Saved tools</span>
                      </button>
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
                  onClick={toggleTheme}
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
        <div className="w-full px-4 sm:px-6 lg:px-8 pb-16 md:pb-20 lg:pb-24">
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
                  <ActionButtons onReviewTools={showToolsList} onAddTool={showAddTool} onAIAssistant={showAIAssistant} onViewRecommendations={showRecommendations} />
                  
                  {/* Admin Operations - Only visible for owners */}
                  <AdminOperations user={user} />
                </div>

                {/* Right Column */}
                <div className="lg:col-span-1 space-y-6">
                  {console.log('Dashboard: Passing user role to SuggestedTools:', user?.role, 'Full user object:', user)}
                  <SuggestedTools userRole={user?.role || 'user'} onViewRecommendations={showRecommendations} />
                  <NotesPreview />
                </div>
              </div>
            )}

            {currentView === 'tools' && (
              <div className="max-w-7xl mx-auto px-6">
                <ToolsList onBack={showDashboard} onToolClick={handleToolClick} />
              </div>
            )}

            {currentView === 'addTool' && (
              <div className="max-w-6xl mx-auto px-6">
                <AddToolForm 
                  onBack={showDashboard} 
                  onSubmit={handleToolSubmit}
                  isSubmitting={isSubmittingTool}
                  initialData={aiSuggestedToolData}
                />
              </div>
            )}

            {currentView === 'aiAssistant' && (
              <div className="max-w-6xl mx-auto px-6">
                <AIAssistant onBack={showDashboard} onEditTool={handleEditAITool} />
              </div>
            )}

            {currentView === 'recommendations' && (
              <div className="w-full">
                <Recommendations userRole={user?.role || 'user'} onBack={showDashboard} />
              </div>
            )}
            {currentView === 'favourites' && (
              <div className="max-w-7xl mx-auto px-6">
                <Favourites 
                  onBack={showDashboard} 
                  onToolClick={(tool: AiTool) => {
                    console.log('Dashboard: Tool clicked from Favourites:', tool.name);
                    setSelectedTool(tool);
                    handleViewChange('toolDetails');
                  }} 
                />
              </div>
            )}

            {currentView === 'toolDetails' && selectedTool && (
              <div className="max-w-6xl mx-auto px-6">
                <ToolDetails tool={selectedTool} onBack={handleBackFromToolDetails} />
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Footer - Full Width */}
      <div className="w-full">
        <Footer />
      </div>

      {/* Logout Confirmation Dialog */}
      {showLogoutDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-xl border border-white/30 rounded-2xl p-6 sm:p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
                <span className="text-3xl">🚪</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Confirm Logout
              </h3>
              <p className="text-white/70 mb-6">
                Are you sure you want to leave the dashboard? You will be logged out and redirected to the main page.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleLogoutCancel}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 text-white rounded-lg transition-all duration-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogoutConfirm}
                  className="px-6 py-3 bg-red-500 hover:bg-red-600 border border-red-500 hover:border-red-600 text-white rounded-lg transition-all duration-300 font-medium shadow-lg"
                >
                  Yes, Log-out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}