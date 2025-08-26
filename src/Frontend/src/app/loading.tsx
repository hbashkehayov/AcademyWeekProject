export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center">
      <div className="glass-morphism p-8 rounded-3xl text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/20 border-t-white mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-white mb-2">Loading...</h2>
        <p className="text-white/70">Please wait while we prepare your experience</p>
      </div>
    </div>
  );
}