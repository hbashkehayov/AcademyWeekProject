<x-app-layout>
    <x-slot name="header">
        <div class="flex items-center justify-between">
            <div class="flex items-center">
                <a href="{{ route('ai-tools.browse') }}" class="mr-4 text-gray-500 hover:text-gray-700">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                    </svg>
                </a>
                <h2 class="font-semibold text-xl text-gray-800 leading-tight">
                    {{ $aiTool->name }}
                </h2>
            </div>
        </div>
    </x-slot>

    <div class="py-12">
        <div class="max-w-4xl mx-auto sm:px-6 lg:px-8">
            <!-- Tool Header -->
            <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-8">
                <div class="p-8">
                    <div class="flex items-start justify-between mb-6">
                        <div class="flex items-center">
                            @if($aiTool->logo_url)
                                <img src="{{ $aiTool->logo_url }}" alt="{{ $aiTool->name }}" class="w-20 h-20 rounded-xl mr-6 object-cover border border-gray-200">
                            @else
                                <div class="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl mr-6 flex items-center justify-center border border-blue-300 shadow-lg relative">
                                    <svg class="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2L13.09 8.26L18 7L16.91 13.26L22 12L20.91 18.26L24 19L22.91 5.74L21 6L12 2Z" />
                                        <path d="M12 22L10.91 15.74L6 17L7.09 10.74L2 12L3.09 5.74L0 5L1.09 18.26L3 18L12 22Z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                    <div class="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full"></div>
                                    <div class="absolute -bottom-1 -left-1 w-2 h-2 bg-yellow-300 rounded-full"></div>
                                </div>
                            @endif
                            <div>
                                <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ $aiTool->name }}</h1>
                                <div class="flex items-center space-x-4">
                                    <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                                        Best for: {{ $aiTool->suggestedForRole->display_name ?? ucfirst($aiTool->suggestedForRole->name ?? 'All roles') }}
                                    </span>
                                    @if($relevanceForUser)
                                        <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                            {{ number_format($relevanceForUser->relevance_score * 100) }}% match for you
                                        </span>
                                    @endif
                                </div>
                            </div>
                        </div>
                        <div class="flex space-x-3">
                            <a href="{{ $aiTool->website_url }}" target="_blank" 
                               class="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg text-sm font-medium transition-colors inline-flex items-center">
                                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                                Visit Website
                            </a>
                            @if($aiTool->api_endpoint)
                                <a href="{{ $aiTool->api_endpoint }}" target="_blank" 
                                   class="bg-gray-100 hover:bg-gray-200 text-gray-900 px-6 py-3 rounded-lg text-sm font-medium transition-colors inline-flex items-center">
                                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                    Documentation
                                </a>
                            @endif
                        </div>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <!-- Main Content -->
                <div class="lg:col-span-2">
                    <!-- Description -->
                    <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-8">
                        <div class="p-6">
                            <h3 class="text-xl font-semibold text-gray-900 mb-4">About</h3>
                            <p class="text-gray-700 leading-relaxed">{{ $aiTool->description }}</p>
                        </div>
                    </div>

                    <!-- Use Cases for Your Role -->
                    @if($relevanceForUser && $relevanceForUser->use_cases)
                        @php
                            $useCases = json_decode($relevanceForUser->use_cases, true) ?? [];
                        @endphp
                        @if(count($useCases) > 0)
                            <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-8">
                                <div class="p-6">
                                    <h3 class="text-xl font-semibold text-gray-900 mb-4">
                                        Use Cases for {{ ucfirst($userRole->name) }}s
                                    </h3>
                                    <ul class="space-y-3">
                                        @foreach($useCases as $useCase)
                                            <li class="flex items-start">
                                                <div class="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                                                    <svg class="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                                                    </svg>
                                                </div>
                                                <span class="ml-3 text-gray-700">{{ $useCase }}</span>
                                            </li>
                                        @endforeach
                                    </ul>
                                </div>
                            </div>
                        @endif
                    @endif

                    <!-- Pricing Information -->
                    @if($aiTool->pricing_model)
                        @php
                            $pricing = is_string($aiTool->pricing_model) ? json_decode($aiTool->pricing_model, true) : $aiTool->pricing_model;
                        @endphp
                        <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-8">
                            <div class="p-6">
                                <h3 class="text-xl font-semibold text-gray-900 mb-4">Pricing</h3>
                                <div class="space-y-3">
                                    @if(isset($pricing['freeTier']) && $pricing['freeTier'])
                                        <div class="flex items-center">
                                            <div class="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
                                            <span class="text-gray-700 font-medium">Free tier available</span>
                                        </div>
                                    @endif
                                    @if(isset($pricing['monthlyPrice']) && $pricing['monthlyPrice'])
                                        <div class="flex items-center">
                                            <div class="w-3 h-3 bg-blue-400 rounded-full mr-3"></div>
                                            <span class="text-gray-700">Starting from <strong>${{ $pricing['monthlyPrice'] }}/month</strong></span>
                                        </div>
                                    @endif
                                    @if(isset($pricing['details']) && is_array($pricing['details']))
                                        @foreach($pricing['details'] as $detail)
                                            <div class="flex items-start">
                                                <div class="w-3 h-3 bg-gray-300 rounded-full mr-3 mt-2"></div>
                                                <span class="text-gray-600">{{ $detail }}</span>
                                            </div>
                                        @endforeach
                                    @endif
                                </div>
                            </div>
                        </div>
                    @endif
                </div>

                <!-- Sidebar -->
                <div>
                    <!-- Categories -->
                    <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                        <div class="p-6">
                            <h4 class="text-lg font-semibold text-gray-900 mb-4">Categories</h4>
                            <div class="flex flex-wrap gap-2">
                                @foreach($aiTool->categories as $category)
                                    <span class="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                                        {{ $category->display_name ?? ucfirst(str_replace('-', ' ', $category->name)) }}
                                    </span>
                                @endforeach
                            </div>
                        </div>
                    </div>

                    <!-- Compatible Roles -->
                    <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                        <div class="p-6">
                            <h4 class="text-lg font-semibold text-gray-900 mb-4">Compatible Roles</h4>
                            <div class="space-y-3">
                                @foreach($aiTool->roles->sortByDesc('pivot.relevance_score') as $role)
                                    <div class="flex items-center justify-between">
                                        <span class="text-gray-700">{{ $role->display_name ?? ucfirst($role->name) }}</span>
                                        <div class="flex items-center">
                                            <div class="w-16 bg-gray-200 rounded-full h-2 mr-3">
                                                <div class="bg-indigo-500 h-2 rounded-full" style="width: {{ $role->pivot->relevance_score * 100 }}%"></div>
                                            </div>
                                            <span class="text-sm text-gray-500">{{ number_format($role->pivot->relevance_score * 100) }}%</span>
                                        </div>
                                    </div>
                                @endforeach
                            </div>
                        </div>
                    </div>

                    <!-- Tool Info -->
                    <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div class="p-6">
                            <h4 class="text-lg font-semibold text-gray-900 mb-4">Tool Information</h4>
                            <dl class="space-y-3 text-sm">
                                <div>
                                    <dt class="text-gray-500">Integration Type</dt>
                                    <dd class="text-gray-900 font-medium">{{ ucfirst($aiTool->integration_type) }}</dd>
                                </div>
                                <div>
                                    <dt class="text-gray-500">Status</dt>
                                    <dd class="text-gray-900">
                                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {{ $aiTool->status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800' }}">
                                            {{ ucfirst($aiTool->status) }}
                                        </span>
                                    </dd>
                                </div>
                                @if($aiTool->submittedBy)
                                    <div>
                                        <dt class="text-gray-500">Submitted by</dt>
                                        <dd class="text-gray-900 font-medium">{{ $aiTool->submittedBy->name }}</dd>
                                    </div>
                                @endif
                                <div>
                                    <dt class="text-gray-500">Average Rating</dt>
                                    <dd class="text-gray-900 font-medium">
                                        @if($aiTool->average_rating > 0)
                                            {{ number_format($aiTool->average_rating, 1) }}/5.0
                                        @else
                                            Not rated yet
                                        @endif
                                    </dd>
                                </div>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</x-app-layout>