<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">
            {{ __('Browse AI Tools') }}
        </h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <!-- User Role Info -->
            <div class="bg-gradient-to-r from-indigo-500 to-purple-600 overflow-hidden shadow-sm sm:rounded-lg mb-8">
                <div class="p-6 text-white">
                    <h3 class="text-xl font-bold mb-2">Personalized for {{ ucfirst($userRole->name ?? 'You') }}</h3>
                    <p class="text-indigo-100">
                        Discover AI tools specifically recommended for {{ $userRole->display_name ?? ucfirst($userRole->name ?? 'your role') }}
                    </p>
                </div>
            </div>

            <!-- Recommended Tools Section -->
            @if($recommendedTools->count() > 0)
                <div class="mb-12">
                    <div class="flex items-center mb-6">
                        <h3 class="text-2xl font-bold text-gray-900 mr-3">🎯 Recommended for You</h3>
                        <span class="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                            {{ $recommendedTools->count() }} tools
                        </span>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        @foreach($recommendedTools as $tool)
                            @php
                                $roleData = $tool->roles->where('id', $userRole->id)->first();
                                $relevance = $roleData ? $roleData->pivot->relevance_score : 0;
                            @endphp
                            <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg hover:shadow-lg transition-shadow border border-indigo-200">
                                <div class="p-6">
                                    <!-- Tool Logo -->
                                    <div class="flex justify-center mb-4">
                                        @if($tool->logo_url)
                                            <img src="{{ $tool->logo_url }}" alt="{{ $tool->name }}" class="w-16 h-16 rounded-lg object-cover border border-gray-200">
                                        @else
                                            <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center border border-blue-300 shadow-sm relative">
                                                <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M12 2L13.09 8.26L18 7L16.91 13.26L22 12L20.91 18.26L24 19L22.91 5.74L21 6L12 2Z" />
                                                    <path d="M12 22L10.91 15.74L6 17L7.09 10.74L2 12L3.09 5.74L0 5L1.09 18.26L3 18L12 22Z" />
                                                    <circle cx="12" cy="12" r="3" />
                                                </svg>
                                                <div class="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full"></div>
                                                <div class="absolute -bottom-1 -left-1 w-2 h-2 bg-yellow-300 rounded-full"></div>
                                            </div>
                                        @endif
                                    </div>
                                    
                                    <!-- Tool Header -->
                                    <div class="text-center mb-4">
                                        <h4 class="text-lg font-semibold text-gray-900 mb-2">{{ $tool->name }}</h4>
                                        <div class="flex justify-center items-center">
                                            <div class="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
                                            <span class="text-sm text-gray-600">{{ number_format($relevance * 100) }}% match</span>
                                        </div>
                                    </div>
                                    
                                    <!-- Description -->
                                    <p class="text-gray-600 text-sm mb-4 line-clamp-3">{{ $tool->description }}</p>
                                    
                                    <!-- Categories -->
                                    <div class="flex flex-wrap gap-2 mb-4">
                                        @foreach($tool->categories->take(3) as $category)
                                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                {{ $category->display_name ?? ucfirst(str_replace('-', ' ', $category->name)) }}
                                            </span>
                                        @endforeach
                                        @if($tool->categories->count() > 3)
                                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                +{{ $tool->categories->count() - 3 }} more
                                            </span>
                                        @endif
                                    </div>
                                    
                                    <!-- Actions -->
                                    <div class="flex space-x-3">
                                        <a href="{{ route('ai-tools.show', $tool->slug) }}" 
                                           class="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-center py-2 px-4 rounded-md text-sm font-medium transition-colors">
                                            View Details
                                        </a>
                                        <a href="{{ $tool->website_url }}" target="_blank" 
                                           class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 text-center py-2 px-4 rounded-md text-sm font-medium transition-colors">
                                            Visit Site
                                        </a>
                                    </div>
                                </div>
                            </div>
                        @endforeach
                    </div>
                </div>
            @endif

            <!-- All Tools Section -->
            <div>
                <div class="flex items-center mb-6">
                    <h3 class="text-2xl font-bold text-gray-900 mr-3">🔧 All AI Tools</h3>
                    <span class="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        {{ $allTools->count() }} tools
                    </span>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    @foreach($allTools as $tool)
                        <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg hover:shadow-lg transition-shadow">
                            <div class="p-6">
                                <!-- Tool Logo -->
                                <div class="flex justify-center mb-4">
                                    @if($tool->logo_url)
                                        <img src="{{ $tool->logo_url }}" alt="{{ $tool->name }}" class="w-16 h-16 rounded-lg object-cover border border-gray-200">
                                    @else
                                        <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center border border-blue-300 shadow-sm relative">
                                            <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 2L13.09 8.26L18 7L16.91 13.26L22 12L20.91 18.26L24 19L22.91 5.74L21 6L12 2Z" />
                                                <path d="M12 22L10.91 15.74L6 17L7.09 10.74L2 12L3.09 5.74L0 5L1.09 18.26L3 18L12 22Z" />
                                                <circle cx="12" cy="12" r="3" />
                                            </svg>
                                            <div class="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full"></div>
                                            <div class="absolute -bottom-1 -left-1 w-2 h-2 bg-yellow-300 rounded-full"></div>
                                        </div>
                                    @endif
                                </div>
                                
                                <!-- Tool Header -->
                                <div class="text-center mb-4">
                                    <h4 class="text-lg font-semibold text-gray-900 mb-2">{{ $tool->name }}</h4>
                                    <span class="text-sm text-gray-500">
                                        Best for: {{ $tool->suggestedForRole->display_name ?? ucfirst($tool->suggestedForRole->name ?? 'All roles') }}
                                    </span>
                                </div>
                                
                                <!-- Description -->
                                <p class="text-gray-600 text-sm mb-4 line-clamp-3">{{ $tool->description }}</p>
                                
                                <!-- Categories -->
                                <div class="flex flex-wrap gap-2 mb-4">
                                    @foreach($tool->categories->take(3) as $category)
                                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                            {{ $category->display_name ?? ucfirst(str_replace('-', ' ', $category->name)) }}
                                        </span>
                                    @endforeach
                                    @if($tool->categories->count() > 3)
                                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                            +{{ $tool->categories->count() - 3 }} more
                                        </span>
                                    @endif
                                </div>
                                
                                <!-- Actions -->
                                <div class="flex space-x-3">
                                    <a href="{{ route('ai-tools.show', $tool->slug) }}" 
                                       class="flex-1 bg-gray-800 hover:bg-gray-900 text-white text-center py-2 px-4 rounded-md text-sm font-medium transition-colors">
                                        View Details
                                    </a>
                                    <a href="{{ $tool->website_url }}" target="_blank" 
                                       class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 text-center py-2 px-4 rounded-md text-sm font-medium transition-colors">
                                        Visit Site
                                    </a>
                                </div>
                            </div>
                        </div>
                    @endforeach
                </div>

                @if($allTools->count() === 0)
                    <div class="text-center py-12">
                        <div class="max-w-md mx-auto">
                            <div class="mb-4">
                                <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                            <h3 class="text-lg font-medium text-gray-900 mb-2">No AI Tools Yet</h3>
                            <p class="text-gray-500 mb-4">Be the first to contribute! Submit an AI tool to help your team discover new productivity solutions.</p>
                            <a href="{{ route('ai-tools.index') }}" class="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150">
                                Submit AI Tool
                            </a>
                        </div>
                    </div>
                @endif
            </div>
        </div>
    </div>
</x-app-layout>