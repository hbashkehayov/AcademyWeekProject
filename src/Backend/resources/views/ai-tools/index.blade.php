<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">
            {{ __('AI Tools') }}
        </h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-4xl mx-auto sm:px-6 lg:px-8">
            <!-- Success Message -->
            @if (session('success'))
                <div class="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                    <strong class="font-bold">Success!</strong>
                    <span class="block sm:inline">{{ session('success') }}</span>
                </div>
            @endif

            <!-- AI Tool Submission Form -->
            <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                <div class="p-6">
                    <div class="mb-6">
                        <h3 class="text-2xl font-bold text-gray-900 mb-2">Submit New AI Tool</h3>
                        <p class="text-gray-600">Share an AI tool that helps with your development workflow. All submissions will be reviewed before publication.</p>
                    </div>

                    <form method="POST" action="{{ route('ai-tools.store') }}" class="space-y-6">
                        @csrf

                        <!-- Tool Name -->
                        <div>
                            <x-input-label for="name" :value="__('Tool Name')" />
                            <x-text-input id="name" class="block mt-1 w-full" type="text" name="name" :value="old('name')" required autofocus placeholder="e.g., GitHub Copilot" />
                            <x-input-error :messages="$errors->get('name')" class="mt-2" />
                        </div>

                        <!-- Website Link -->
                        <div>
                            <x-input-label for="website_url" :value="__('Website Link')" />
                            <x-text-input id="website_url" class="block mt-1 w-full" type="url" name="website_url" :value="old('website_url')" required placeholder="https://example.com" />
                            <x-input-error :messages="$errors->get('website_url')" class="mt-2" />
                            <p class="text-sm text-gray-500 mt-1">The main website or landing page for this tool</p>
                        </div>

                        <!-- Description -->
                        <div>
                            <x-input-label for="description" :value="__('Description')" />
                            <textarea id="description" name="description" rows="4" class="block mt-1 w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm" required placeholder="Describe what this tool does and how it helps developers...">{{ old('description') }}</textarea>
                            <x-input-error :messages="$errors->get('description')" class="mt-2" />
                        </div>

                        <!-- Suggested Role -->
                        <div>
                            <x-input-label for="suggested_for_role" :value="__('Suggested for Role')" />
                            <select id="suggested_for_role" name="suggested_for_role" class="block mt-1 w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm" required>
                                <option value="">Select the best role for this tool</option>
                                @foreach($roles as $role)
                                    <option value="{{ $role->id }}" {{ old('suggested_for_role') == $role->id ? 'selected' : '' }}>
                                        {{ $role->display_name ?? ucfirst($role->name) }}
                                    </option>
                                @endforeach
                            </select>
                            <x-input-error :messages="$errors->get('suggested_for_role')" class="mt-2" />
                            <p class="text-sm text-gray-500 mt-1">Which role would benefit most from this tool?</p>
                        </div>

                        <!-- Categories -->
                        <div>
                            <x-input-label for="categories" :value="__('Categories')" />
                            <div class="mt-2 grid grid-cols-2 gap-3">
                                @foreach($categories as $category)
                                    <div class="flex items-center">
                                        <input id="category_{{ $category->id }}" name="categories[]" type="checkbox" value="{{ $category->id }}" 
                                               class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                               {{ in_array($category->id, old('categories', [])) ? 'checked' : '' }}>
                                        <label for="category_{{ $category->id }}" class="ml-2 block text-sm text-gray-900">
                                            {{ $category->display_name ?? ucfirst(str_replace('-', ' ', $category->name)) }}
                                        </label>
                                    </div>
                                @endforeach
                            </div>
                            <x-input-error :messages="$errors->get('categories')" class="mt-2" />
                            <p class="text-sm text-gray-500 mt-1">Select all categories that apply to this tool</p>
                        </div>

                        <!-- Documentation Link -->
                        <div>
                            <x-input-label for="documentation_url" :value="__('Documentation Link (Optional)')" />
                            <x-text-input id="documentation_url" class="block mt-1 w-full" type="url" name="documentation_url" :value="old('documentation_url')" placeholder="https://docs.example.com" />
                            <x-input-error :messages="$errors->get('documentation_url')" class="mt-2" />
                            <p class="text-sm text-gray-500 mt-1">Link to API documentation or developer guides</p>
                        </div>

                        <!-- Logo/Picture URL -->
                        <div>
                            <x-input-label for="logo_url" :value="__('Logo/Picture URL (Optional)')" />
                            <x-text-input id="logo_url" class="block mt-1 w-full" type="url" name="logo_url" :value="old('logo_url')" placeholder="https://example.com/logo.png" />
                            <x-input-error :messages="$errors->get('logo_url')" class="mt-2" />
                            <p class="text-sm text-gray-500 mt-1">Link to the tool's logo or representative image</p>
                        </div>

                        <!-- Submit Button -->
                        <div class="flex items-center justify-end pt-4">
                            <x-primary-button class="ml-4">
                                {{ __('Submit AI Tool') }}
                            </x-primary-button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Information Card -->
            <div class="mt-8 bg-blue-50 overflow-hidden shadow-sm sm:rounded-lg">
                <div class="p-6">
                    <h4 class="text-lg font-semibold text-blue-900 mb-2">Submission Guidelines</h4>
                    <ul class="text-blue-800 space-y-1 text-sm">
                        <li>• Tools should be AI-powered and useful for software development</li>
                        <li>• All submissions are reviewed by administrators before publication</li>
                        <li>• Provide accurate information and working links</li>
                        <li>• Choose the most relevant role and categories</li>
                        <li>• Submissions with complete information are processed faster</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</x-app-layout>