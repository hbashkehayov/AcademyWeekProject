import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center px-4">
      <div className="glass-morphism p-8 rounded-3xl text-center max-w-md">
        <div className="text-6xl mb-4">🔍</div>
        <h2 className="text-2xl font-bold text-white mb-4">Page Not Found</h2>
        <p className="text-white/70 mb-6">
          Sorry, we couldn&apos;t find the page you&apos;re looking for.
        </p>
        <Link 
          href="/"
          className="inline-block bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}