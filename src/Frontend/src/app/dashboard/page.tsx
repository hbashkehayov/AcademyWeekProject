'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '@/lib/api';
import GreetingCard from '../../components/GreetingCard';
import SuggestedTools from '../../components/SuggestedTools';
import NotesCard from '../../components/NotesCard';
import ActionButtons from '../../components/ActionButtons';
import NotesPreview from '../../components/NotesPreview';
import ToolsList from '../../components/ToolsList';
import ToolDetails from '../../components/ToolDetails';
import AddToolForm from '../../components/AddToolForm';
import Footer from '../../components/Footer';
import type { AiTool } from '../../types';

type ViewState = 'dashboard' | 'tools' | 'tool-details' | 'addTool';

export default function DashboardPage() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [selectedTool, setSelectedTool] = useState<AiTool | null>(null);
  const [isSubmittingTool, setIsSubmittingTool] = useState(false);
  const [existingTools, setExistingTools] = useState<AiTool[]>([]);
  const [toolsRefreshKey, setToolsRefreshKey] = useState(0);
  const [user, setUser] = useState({
    name: 'User',
    display_name: 'User',
    role: 'frontend'
  });
  const router = useRouter();

  useEffect(() => {
    // Load user data from localStorage
    const storedUser = localStorage.getItem('sanctum_user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing user data:', error);
        // If no valid user data, redirect to home
        router.push('/');
      }
    } else {
      // If no user data, redirect to home
      router.push('/');
    }

    // Load existing tools for duplicate checking
    const loadExistingTools = async () => {
      try {
        const response = await apiService.getTools();
        setExistingTools(response.data || []);
      } catch (error) {
        console.error('Error loading existing tools:', error);
        // Use empty array if API fails
        setExistingTools([]);
      }
    };

    loadExistingTools();

    // Trigger fade-in animation after component mounts
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, [router]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleBack = () => {
    // Clear user data on logout
    localStorage.removeItem('sanctum_user');
    router.push('/');
  };

  const handleViewChange = (newView: ViewState) => {
    if (isTransitioning || currentView === newView) return;
    
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
  const showAddTool = () => handleViewChange('addTool');

  // Function to check for duplicate tools
  const isDuplicateTool = (newToolData: any): boolean => {
    const normalizeUrl = (url: string) => url.toLowerCase().replace(/\/$/, '').replace(/^https?:\/\//, '');
    const normalizeName = (name: string) => name.toLowerCase().trim();

    return existingTools.some(existingTool => {
      // Check by name (case-insensitive)
      if (normalizeName(existingTool.name) === normalizeName(newToolData.name)) {
        return true;
      }
      
      // Check by website URL (normalized)
      if (existingTool.website_url && newToolData.website_url) {
        if (normalizeUrl(existingTool.website_url) === normalizeUrl(newToolData.website_url)) {
          return true;
        }
      }

      // Check by API endpoint if both exist
      if (existingTool.api_endpoint && newToolData.api_endpoint) {
        if (normalizeUrl(existingTool.api_endpoint) === normalizeUrl(newToolData.api_endpoint)) {
          return true;
        }
      }

      return false;
    });
  };

  // Handle tool submission with duplicate prevention
  const handleToolSubmit = async (toolData: any) => {
    console.log('Dashboard: handleToolSubmit called with data:', toolData);
    
    // Debug authentication status
    console.log('Dashboard: Checking authentication before submission...');
    console.log('Dashboard: Is authenticated:', apiService.isAuthenticated());
    console.log('Dashboard: Current user:', apiService.getUser());
    console.log('Dashboard: Local storage sanctum_user:', localStorage.getItem('sanctum_user'));
    
    setIsSubmittingTool(true);
    
    try {
      console.log('Dashboard: Checking for duplicates...');
      // Check for duplicates
      if (isDuplicateTool(toolData)) {
        console.log('Dashboard: Duplicate tool detected');
        alert('⚠️ This AI tool already exists in our database!\n\nPlease check if a tool with the same name, website, or API endpoint has already been submitted.');
        return;
      }

      console.log('Dashboard: No duplicates found, submitting to API...');
      // Submit tool via API
      console.log('Dashboard: Submitting tool:', toolData);
      const submittedTool = await apiService.createTool(toolData);
      console.log('Dashboard: Tool submitted successfully:', submittedTool);
      
      // Add the new tool to existing tools list to prevent immediate re-submission
      setExistingTools(prev => [...prev, submittedTool]);
      
      // Force refresh of ToolsList component
      setToolsRefreshKey(prev => prev + 1);
      
      // Show success message and go back to dashboard
      alert('✅ Tool submitted successfully!\n\nYour AI tool has been added to the library and will be reviewed by our team. You can now see it in the "Review AI Tools" section.');
      
      // Go back to dashboard
      showDashboard();
      
    } catch (error) {
      console.error('Dashboard: Error submitting tool:', error);
      console.error('Dashboard: Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace',
        error: error
      });
      
      // Show specific error messages based on the error type
      if (error instanceof Error) {
        if (error.message.includes('409') || error.message.includes('duplicate')) {
          alert('⚠️ This AI tool already exists in our database!\n\nA tool with similar information has already been submitted.');
        } else if (error.message.includes('400')) {
          alert('❌ Invalid tool data!\n\nPlease check that all required fields are filled correctly.');
        } else if (error.message.includes('401') || error.message.includes('403')) {
          alert('🔒 Authentication required!\n\nPlease log in again to submit tools.');
        } else {
          alert(`❌ Error submitting tool: ${error.message}\n\nPlease try again or contact support if the issue persists.`);
        }
      } else {
        alert('❌ Network error!\n\nPlease check your internet connection and try again.');
      }
    } finally {
      console.log('Dashboard: Finally block - setting isSubmittingTool to false');
      setIsSubmittingTool(false);
    }
  };
  
  const showToolDetails = (tool: AiTool) => {
    setSelectedTool(tool);
    handleViewChange('tool-details');
  };

  const showToolsListFromDetails = () => {
    setSelectedTool(null);
    handleViewChange('tools');
  };

  return (
    <div 
      className="min-h-screen flex flex-col relative overflow-hidden"
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
      
      {/* Content with smooth backdrop transitions */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Dashboard Content */}
        <div className="flex-1 py-8">
          {/* Header - Centered */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`mb-12 text-center transition-all duration-1000 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
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
                          onClick={handleBack}
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

              {/* Enhanced Dark Mode Toggle */}
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
            </div>
          </div>

          {/* Dashboard Content - Conditional with Animations */}
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className={`transition-all duration-500 ease-out ${
              isTransitioning ? 'opacity-0 transform translate-y-4' : 
              'opacity-100 transform translate-y-0'
            } ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} transition-all duration-1000 delay-300`}>
              {currentView === 'dashboard' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Greeting Card */}
                    <GreetingCard user={user} />
                    
                    {/* Notes Card */}
                    <NotesCard />
                    
                    {/* Action Buttons */}
                    <ActionButtons onReviewTools={showToolsList} onAddTool={showAddTool} />
                  </div>

                  {/* Right Column */}
                  <div className="lg:col-span-1 space-y-6">
                    <SuggestedTools userRole={user.role} />
                    <NotesPreview />
                  </div>
                </div>
              )}

              {currentView === 'tools' && (
                <div className="max-w-4xl mx-auto">
                  <ToolsList 
                    key={toolsRefreshKey}
                    onBack={showDashboard} 
                    onToolClick={showToolDetails} 
                  />
                </div>
              )}

              {currentView === 'tool-details' && selectedTool && (
                <div className="max-w-4xl mx-auto">
                  <ToolDetails tool={selectedTool} onBack={showToolsListFromDetails} isDarkMode={isDarkMode} />
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
            </div>
          </div>
        </div>
        
        {/* Footer - Full Width */}
        <div className={`w-full transition-all duration-1000 delay-500 ${
          isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <Footer />
        </div>
      </div>
    </div>
  );
}