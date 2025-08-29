"use client";

import Link from "next/link";
import { useState } from "react";
import { useTheme } from '@/contexts/ThemeContext';
import ThemeToggle from './ThemeToggle';

interface HeaderProps {
  user?: any;
}

export default function Header({ user }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isDarkMode } = useTheme();

  return (
    <header className={`shadow-sm border-b transition-all duration-500 ${
      isDarkMode 
        ? 'bg-blue-900/20 border-blue-700/30 backdrop-blur-xl' 
        : 'bg-white/80 border-gray-200 backdrop-blur-xl'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Link href="/" className={`px-4 py-2 text-2xl font-bold rounded-lg transition-all duration-300 backdrop-blur-sm border ${
              isDarkMode
                ? 'text-white hover:text-blue-100 bg-blue-900/30 hover:bg-blue-800/50 border-blue-700/50 hover:border-blue-600/70'
                : 'text-gray-900 hover:text-white bg-gray-100/50 hover:bg-primary-600 border-gray-200 hover:border-primary-600'
            }`}>
              ProjectAIWP
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {/* Theme Toggle */}
            <ThemeToggle size="sm" />
            <Link href="/tools" className={`px-3 py-2 rounded-lg transition-all duration-300 border ${
              isDarkMode
                ? 'text-blue-200 hover:text-white bg-blue-900/30 hover:bg-blue-800/50 border-blue-700/50 hover:border-blue-600/70'
                : 'text-gray-600 hover:text-white bg-gray-100/50 hover:bg-gray-600 border-gray-200 hover:border-gray-600'
            }`}>
              Browse Tools
            </Link>
            <Link href="/categories" className={`px-3 py-2 rounded-lg transition-all duration-300 border ${
              isDarkMode
                ? 'text-blue-200 hover:text-white bg-blue-900/30 hover:bg-blue-800/50 border-blue-700/50 hover:border-blue-600/70'
                : 'text-gray-600 hover:text-white bg-gray-100/50 hover:bg-gray-600 border-gray-200 hover:border-gray-600'
            }`}>
              Categories
            </Link>
            {user ? (
              <>
                <Link href="/dashboard" className="px-3 py-2 text-gray-600 hover:text-white bg-gray-100/50 hover:bg-gray-600 border border-gray-200 hover:border-gray-600 rounded-lg transition-all duration-300">
                  Dashboard
                </Link>
                <Link href="/favorites" className="px-3 py-2 text-gray-600 hover:text-white bg-gray-100/50 hover:bg-gray-600 border border-gray-200 hover:border-gray-600 rounded-lg transition-all duration-300">
                  Favorites
                </Link>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700">Hi, {user.display_name || user.name}</span>
                  <Link href="/auth/logout" className="px-2 py-1 text-sm text-gray-600 hover:text-white bg-red-100 hover:bg-red-600 border border-red-200 hover:border-red-600 rounded-md transition-all duration-300">
                    Logout
                  </Link>
                </div>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="px-3 py-2 text-gray-600 hover:text-white bg-gray-100/50 hover:bg-gray-600 border border-gray-200 hover:border-gray-600 rounded-lg transition-all duration-300">
                  Login
                </Link>
                <Link href="/auth/register" className="px-4 py-2 bg-primary-600 text-white border border-primary-600 hover:bg-primary-700 hover:border-primary-700 rounded-md transition-all duration-300 shadow-md">
                  Sign Up
                </Link>
              </>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="text-gray-600 hover:text-gray-900"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-4">
              <Link href="/tools" className="px-3 py-2 text-gray-600 hover:text-white bg-gray-100/50 hover:bg-gray-600 border border-gray-200 hover:border-gray-600 rounded-lg transition-all duration-300">
                Browse Tools
              </Link>
              <Link href="/categories" className="px-3 py-2 text-gray-600 hover:text-white bg-gray-100/50 hover:bg-gray-600 border border-gray-200 hover:border-gray-600 rounded-lg transition-all duration-300">
                Categories
              </Link>
              {user ? (
                <>
                  <Link href="/dashboard" className="px-3 py-2 text-gray-600 hover:text-white bg-gray-100/50 hover:bg-gray-600 border border-gray-200 hover:border-gray-600 rounded-lg transition-all duration-300">
                    Dashboard
                  </Link>
                  <Link href="/favorites" className="px-3 py-2 text-gray-600 hover:text-white bg-gray-100/50 hover:bg-gray-600 border border-gray-200 hover:border-gray-600 rounded-lg transition-all duration-300">
                    Favorites
                  </Link>
                  <div className="pt-2 border-t">
                    <p className="text-sm text-gray-700 mb-2">Hi, {user.display_name || user.name}</p>
                    <Link href="/auth/logout" className="inline-block px-2 py-1 text-sm text-red-600 hover:text-white bg-red-100 hover:bg-red-600 border border-red-200 hover:border-red-600 rounded-md transition-all duration-300">
                      Logout
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className="px-3 py-2 text-gray-600 hover:text-white bg-gray-100/50 hover:bg-gray-600 border border-gray-200 hover:border-gray-600 rounded-lg transition-all duration-300 text-center">
                    Login
                  </Link>
                  <Link href="/auth/register" className="px-4 py-2 bg-primary-600 text-white border border-primary-600 hover:bg-primary-700 hover:border-primary-700 rounded-md transition-all duration-300 text-center shadow-md">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}