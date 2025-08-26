<?php

namespace Database\Seeders;

use App\Models\Organization;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get the first organization
        $techCorp = Organization::where('slug', 'techcorp-solutions')->first();
        $startupHub = Organization::where('slug', 'startuphub-inc')->first();
        
        // Get roles
        $ownerRole = Role::where('name', 'owner')->first();
        $frontendRole = Role::where('name', 'frontend')->first();
        $backendRole = Role::where('name', 'backend')->first();
        $qaRole = Role::where('name', 'qa')->first();
        $designerRole = Role::where('name', 'designer')->first();
        $pmRole = Role::where('name', 'pm')->first();
        
        $users = [
            // Your specified users
            [
                'name' => 'Иван Иванов',
                'email' => 'ivan@admin.local',
                'password' => Hash::make('password'),
                'role_id' => $ownerRole->id,
                'organization_id' => $techCorp->id,
            ],
            [
                'name' => 'Елена Петрова',
                'email' => 'elena@frontend.local',
                'password' => Hash::make('password'),
                'role_id' => $frontendRole->id,
                'organization_id' => $techCorp->id,
            ],
            [
                'name' => 'Петър Георгиев',
                'email' => 'petar@backend.local',
                'password' => Hash::make('password'),
                'role_id' => $backendRole->id,
                'organization_id' => $techCorp->id,
            ],
            
            // Additional team members
            [
                'name' => 'Мария Димитрова',
                'email' => 'maria@qa.local',
                'password' => Hash::make('password'),
                'role_id' => $qaRole->id,
                'organization_id' => $techCorp->id,
            ],
            [
                'name' => 'Александър Стоянов',
                'email' => 'alex@designer.local',
                'password' => Hash::make('password'),
                'role_id' => $designerRole->id,
                'organization_id' => $techCorp->id,
            ],
            [
                'name' => 'София Николова',
                'email' => 'sofia@pm.local',
                'password' => Hash::make('password'),
                'role_id' => $pmRole->id,
                'organization_id' => $techCorp->id,
            ],
            [
                'name' => 'Николай Тодоров',
                'email' => 'nikolay@backend.local',
                'password' => Hash::make('password'),
                'role_id' => $backendRole->id,
                'organization_id' => $techCorp->id,
            ],
            [
                'name' => 'Виктория Павлова',
                'email' => 'victoria@frontend.local',
                'password' => Hash::make('password'),
                'role_id' => $frontendRole->id,
                'organization_id' => $techCorp->id,
            ],
            
            // StartupHub team
            [
                'name' => 'Димитър Христов',
                'email' => 'dimitar@startup.local',
                'password' => Hash::make('password'),
                'role_id' => $ownerRole->id,
                'organization_id' => $startupHub->id,
            ],
            [
                'name' => 'Анна Василева',
                'email' => 'anna@startup.local',
                'password' => Hash::make('password'),
                'role_id' => $frontendRole->id,
                'organization_id' => $startupHub->id,
            ],
            [
                'name' => 'Борис Михайлов',
                'email' => 'boris@startup.local',
                'password' => Hash::make('password'),
                'role_id' => $backendRole->id,
                'organization_id' => $startupHub->id,
            ],
            [
                'name' => 'Галина Радева',
                'email' => 'galina@startup.local',
                'password' => Hash::make('password'),
                'role_id' => $designerRole->id,
                'organization_id' => $startupHub->id,
            ],
        ];

        foreach ($users as $userData) {
            User::updateOrCreate(
                ['email' => $userData['email']],
                $userData
            );
        }
    }
}
