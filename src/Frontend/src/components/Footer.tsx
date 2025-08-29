import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-800 text-gray-300 w-full mt-16 md:mt-20 lg:mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-12 md:pt-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Company Info */}
          <div className="md:col-span-2">
            <h3 className="text-xl font-bold text-white mb-2">sanctum</h3>
            <p className="text-gray-400 text-sm mb-3">
              A library of AI tools, selected by experienced SoftArt developers.
            </p>
            <div className="flex flex-wrap gap-2 text-sm">
              <Link href="/about" className="px-3 py-2 text-gray-400 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 hover:border-white/30 rounded-lg transition-all duration-300">
                About
              </Link>
              <Link href="/contact" className="px-3 py-2 text-gray-400 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 hover:border-white/30 rounded-lg transition-all duration-300">
                Contact
              </Link>
              <Link href="/privacy" className="px-3 py-2 text-gray-400 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 hover:border-white/30 rounded-lg transition-all duration-300">
                Privacy
              </Link>
              <Link href="/terms" className="px-3 py-2 text-gray-400 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 hover:border-white/30 rounded-lg transition-all duration-300">
                Terms
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/tools" className="inline-block px-3 py-2 text-gray-400 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 hover:border-white/30 rounded-lg transition-all duration-300 w-full">
                  Browse Tools
                </Link>
              </li>
              <li>
                <Link href="/categories" className="inline-block px-3 py-2 text-gray-400 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 hover:border-white/30 rounded-lg transition-all duration-300 w-full">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/recommendations" className="inline-block px-3 py-2 text-gray-400 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 hover:border-white/30 rounded-lg transition-all duration-300 w-full">
                  Recommendations
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/help" className="inline-block px-3 py-2 text-gray-400 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 hover:border-white/30 rounded-lg transition-all duration-300 w-full">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/faq" className="inline-block px-3 py-2 text-gray-400 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 hover:border-white/30 rounded-lg transition-all duration-300 w-full">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/api-docs" className="inline-block px-3 py-2 text-gray-400 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 hover:border-white/30 rounded-lg transition-all duration-300 w-full">
                  API Docs
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-xs">
              © {currentYear} sanctum. All rights reserved.
            </p>
            <div className="flex items-center space-x-1 text-gray-400 text-xs mt-2 md:mt-0">
              <span>Developed by</span>
              <a 
                href="https://softart.bg/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="px-2 py-1 text-white hover:text-green-400 bg-white/10 hover:bg-green-400/20 backdrop-blur-sm border border-white/20 hover:border-green-400/30 rounded-md transition-all duration-300 font-semibold"
              >
                SoftArt
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}