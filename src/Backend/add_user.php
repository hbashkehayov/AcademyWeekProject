<?php

require_once __DIR__ . '/vendor/autoload.php';

use App\Models\User;
use App\Models\Role;
use App\Models\Organization;
use Illuminate\Support\Facades\Hash;

// Bootstrap Laravel
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

try {
    // Get the owner role and an organization
    $ownerRole = Role::where('name', 'owner')->first();
    $organization = Organization::first();
    
    if (!$ownerRole) {
        echo "Error: Owner role not found. Please run seeders first.\n";
        exit(1);
    }
    
    if (!$organization) {
        echo "Error: No organization found. Please run seeders first.\n";
        exit(1);
    }
    
    // Create or update the user
    $user = User::updateOrCreate(
        ['email' => 'h.bashkehayov@softart.bg'],
        [
            'name' => 'Hristiyan Bashkehayov',
            'email' => 'h.bashkehayov@softart.bg',
            'password' => Hash::make('password'),
            'role_id' => $ownerRole->id,
            'organization_id' => $organization->id,
            'email_verified_at' => now(),
        ]
    );
    
    echo "✅ User created successfully!\n";
    echo "Email: " . $user->email . "\n";
    echo "Name: " . $user->name . "\n";
    echo "Role: " . $ownerRole->name . "\n";
    echo "Organization: " . $organization->name . "\n";
    echo "Password: password\n";
    echo "\nYou can now login with:\n";
    echo "Email: h.bashkehayov@softart.bg\n";
    echo "Password: password\n";
    
} catch (Exception $e) {
    echo "❌ Error creating user: " . $e->getMessage() . "\n";
    exit(1);
}