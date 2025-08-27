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
            <div className="flex space-x-4 text-sm">
              <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
                About
              </Link>
              <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
                Contact
              </Link>
              <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                Terms
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/tools" className="text-gray-400 hover:text-white transition-colors">
                  Browse Tools
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-gray-400 hover:text-white transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/recommendations" className="text-gray-400 hover:text-white transition-colors">
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
                <Link href="/help" className="text-gray-400 hover:text-white transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-400 hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/api-docs" className="text-gray-400 hover:text-white transition-colors">
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
                className="text-white hover:text-green-400 transition-colors font-semibold"
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