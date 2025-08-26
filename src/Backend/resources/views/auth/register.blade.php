<x-guest-layout>
    <div class="mb-4 text-center">
        <h2 class="text-2xl font-bold text-gray-900">Welcome to AI Tools Platform</h2>
        <p class="mt-2 text-sm text-gray-600">Let's set up your account to get personalized AI tool recommendations</p>
    </div>

    <form method="POST" action="{{ route('register') }}" class="space-y-6">
        @csrf

        <!-- Basic Information Section -->
        <div class="bg-gray-50 p-4 rounded-lg">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
            
            <!-- Name -->
            <div>
                <x-input-label for="name" :value="__('Name')" />
                <x-text-input id="name" class="block mt-1 w-full" type="text" name="name" :value="old('name')" required autofocus autocomplete="name" />
                <x-input-error :messages="$errors->get('name')" class="mt-2" />
            </div>

            <!-- Display Name -->
            <div class="mt-4">
                <x-input-label for="display_name" :value="__('Display Name')" />
                <x-text-input id="display_name" class="block mt-1 w-full" type="text" name="display_name" :value="old('display_name')" required />
                <p class="mt-1 text-xs text-gray-500">This is how your name will appear to others</p>
                <x-input-error :messages="$errors->get('display_name')" class="mt-2" />
            </div>

            <!-- Email Address -->
            <div class="mt-4">
                <x-input-label for="email" :value="__('Email')" />
                <x-text-input id="email" class="block mt-1 w-full" type="email" name="email" :value="old('email')" required autocomplete="username" />
                <x-input-error :messages="$errors->get('email')" class="mt-2" />
            </div>

            <!-- Phone Number -->
            <div class="mt-4">
                <x-input-label for="phone_number" :value="__('Phone Number')" />
                <x-text-input id="phone_number" class="block mt-1 w-full" type="tel" name="phone_number" :value="old('phone_number')" required />
                <x-input-error :messages="$errors->get('phone_number')" class="mt-2" />
            </div>
        </div>

        <!-- Role Selection Section -->
        <div class="bg-gray-50 p-4 rounded-lg">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Select Your Role</h3>
            <p class="text-sm text-gray-600 mb-4">Choose the role that best describes your position in the team</p>
            
            <div class="space-y-2">
                @foreach($roles as $role)
                    <label class="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                        <input type="radio" name="role_id" value="{{ $role->id }}" class="mt-1 mr-3" {{ old('role_id') == $role->id ? 'checked' : '' }} required>
                        <div>
                            <div class="font-medium text-gray-900">{{ $role->display_name ?? $role->name }}</div>
                            @if($role->description)
                                <div class="text-sm text-gray-500">{{ $role->description }}</div>
                            @endif
                        </div>
                    </label>
                @endforeach
            </div>
            <x-input-error :messages="$errors->get('role_id')" class="mt-2" />
        </div>

        <!-- Security Section -->
        <div class="bg-gray-50 p-4 rounded-lg">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Security</h3>
            
            <!-- Password -->
            <div>
                <x-input-label for="password" :value="__('Password')" />
                <x-text-input id="password" class="block mt-1 w-full"
                                type="password"
                                name="password"
                                required autocomplete="new-password" />
                <x-input-error :messages="$errors->get('password')" class="mt-2" />
            </div>

            <!-- Confirm Password -->
            <div class="mt-4">
                <x-input-label for="password_confirmation" :value="__('Confirm Password')" />
                <x-text-input id="password_confirmation" class="block mt-1 w-full"
                                type="password"
                                name="password_confirmation" required autocomplete="new-password" />
                <x-input-error :messages="$errors->get('password_confirmation')" class="mt-2" />
            </div>
        </div>

        <div class="flex items-center justify-end mt-4">
            <a class="underline text-sm text-gray-600 hover:text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" href="{{ route('login') }}">
                {{ __('Already registered?') }}
            </a>

            <x-primary-button class="ms-4">
                {{ __('Register') }}
            </x-primary-button>
        </div>
    </form>
</x-guest-layout>
