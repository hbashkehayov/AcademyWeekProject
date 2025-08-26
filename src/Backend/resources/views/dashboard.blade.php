<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">
            {{ __('Dashboard') }}
        </h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <!-- Enhanced Welcome Section -->
            <div class="bg-gradient-to-r from-emerald-400 to-teal-400 overflow-hidden shadow-xl sm:rounded-lg mb-8">
                <div class="p-8 text-white">
                    <h1 class="text-4xl font-bold mb-3">
                        Welcome, {{ Auth::user()->display_name ?? Auth::user()->name }}!
                    </h1>
                    <p class="text-xl text-white/90">
                        You have logged in as a <span class="font-bold text-white">{{ Auth::user()->role->display_name ?? Auth::user()->role->name ?? 'User' }}</span>
                    </p>
                    <div class="mt-6 flex items-center space-x-4">
                        <div class="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                            <p class="text-sm text-white/80">Member since</p>
                            <p class="text-lg font-semibold text-white">{{ Auth::user()->created_at->format('M d, Y') }}</p>
                        </div>
                        <div class="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                            <p class="text-sm text-white/80">Last login</p>
                            <p class="text-lg font-semibold text-white">{{ now()->format('H:i') }} Today</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- User Information Card -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                    <div class="p-6">
                        <h4 class="text-lg font-semibold mb-4 text-gray-900">Your Profile</h4>
                        <dl class="space-y-3">
                            <div>
                                <dt class="text-sm font-medium text-gray-500">Name</dt>
                                <dd class="mt-1 text-sm text-gray-900">{{ Auth::user()->name }}</dd>
                            </div>
                            <div>
                                <dt class="text-sm font-medium text-gray-500">Display Name</dt>
                                <dd class="mt-1 text-sm text-gray-900">{{ Auth::user()->display_name ?? 'Not set' }}</dd>
                            </div>
                            <div>
                                <dt class="text-sm font-medium text-gray-500">Email</dt>
                                <dd class="mt-1 text-sm text-gray-900">{{ Auth::user()->email }}</dd>
                            </div>
                            <div>
                                <dt class="text-sm font-medium text-gray-500">Phone</dt>
                                <dd class="mt-1 text-sm text-gray-900">{{ Auth::user()->phone_number ?? 'Not set' }}</dd>
                            </div>
                            <div>
                                <dt class="text-sm font-medium text-gray-500">Role</dt>
                                <dd class="mt-1 text-sm text-gray-900">
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                        {{ Auth::user()->role->display_name ?? Auth::user()->role->name ?? 'No role assigned' }}
                                    </span>
                                </dd>
                            </div>
                        </dl>
                    </div>
                </div>

                <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                    <div class="p-6">
                        <h4 class="text-lg font-semibold mb-4 text-gray-900">Quick Actions</h4>
                        <div class="space-y-3">
                            <a href="{{ route('ai-tools.browse') }}" class="block px-4 py-2 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors">
                                <div class="font-medium text-indigo-900">Browse AI Tools</div>
                                <div class="text-sm text-indigo-700">Explore recommended tools for your role</div>
                            </a>
                            <a href="{{ route('ai-tools.index') }}" class="block px-4 py-2 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                                <div class="font-medium text-green-900">Add New AI Tool</div>
                                <div class="text-sm text-green-700">Submit a new AI tool for the community</div>
                            </a>
                            <a href="{{ route('profile.edit') }}" class="block px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                                <div class="font-medium text-gray-900">Edit Profile</div>
                                <div class="text-sm text-gray-700">Update your account information</div>
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Coming Soon Section -->
            <div class="bg-gradient-to-r from-indigo-500 to-purple-600 overflow-hidden shadow-sm sm:rounded-lg">
                <div class="p-6 text-white">
                    <h4 class="text-xl font-bold mb-2">AI Tools Recommendations Coming Soon!</h4>
                    <p class="text-indigo-100">
                        We're working on bringing you the best AI tools tailored specifically for your role as a {{ Auth::user()->role->display_name ?? Auth::user()->role->name ?? 'team member' }}. 
                        Stay tuned for personalized recommendations that will boost your productivity!
                    </p>
                </div>
            </div>
        </div>
    </div>
</x-app-layout>
