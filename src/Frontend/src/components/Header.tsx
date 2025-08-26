"use client";

import Link from "next/link";
import { useState } from "react";

interface HeaderProps {
  user?: any;
}

export default function Header({ user }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-gray-900 hover:text-primary-600">
              ProjectAIWP
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/tools" className="text-gray-600 hover:text-gray-900 transition-colors">
              Browse Tools
            </Link>
            <Link href="/categories" className="text-gray-600 hover:text-gray-900 transition-colors">
              Categories
            </Link>
            {user ? (
              <>
                <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Dashboard
                </Link>
                <Link href="/favorites" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Favorites
                </Link>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700">Hi, {user.display_name || user.name}</span>
                  <Link href="/auth/logout" className="text-sm text-gray-600 hover:text-red-600">
                    Logout
                  </Link>
                </div>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Login
                </Link>
                <Link href="/auth/register" className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors">
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
              <Link href="/tools" className="text-gray-600 hover:text-gray-900">
                Browse Tools
              </Link>
              <Link href="/categories" className="text-gray-600 hover:text-gray-900">
                Categories
              </Link>
              {user ? (
                <>
                  <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                    Dashboard
                  </Link>
                  <Link href="/favorites" className="text-gray-600 hover:text-gray-900">
                    Favorites
                  </Link>
                  <div className="pt-2 border-t">
                    <p className="text-sm text-gray-700 mb-2">Hi, {user.display_name || user.name}</p>
                    <Link href="/auth/logout" className="text-sm text-red-600 hover:text-red-700">
                      Logout
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className="text-gray-600 hover:text-gray-900">
                    Login
                  </Link>
                  <Link href="/auth/register" className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 text-center">
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