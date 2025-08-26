<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = [
            [
                'name' => 'frontend',
                'display_name' => 'Frontend Developer',
                'description' => 'Specializes in client-side development, UI/UX implementation, and user interactions'
            ],
            [
                'name' => 'backend',
                'display_name' => 'Backend Developer',
                'description' => 'Focuses on server-side logic, databases, APIs, and system architecture'
            ],
            [
                'name' => 'qa',
                'display_name' => 'QA Engineer',
                'description' => 'Ensures software quality through testing, automation, and bug tracking'
            ],
            [
                'name' => 'designer',
                'display_name' => 'UI/UX Designer',
                'description' => 'Creates user interfaces, experiences, and visual designs'
            ],
            [
                'name' => 'pm',
                'display_name' => 'Project Manager',
                'description' => 'Manages project timelines, resources, and team coordination'
            ],
            [
                'name' => 'owner',
                'display_name' => 'Product Owner',
                'description' => 'Defines product vision, priorities, and stakeholder communication'
            ]
        ];

        foreach ($roles as $role) {
            Role::updateOrCreate(
                ['name' => $role['name']],
                $role
            );
        }
    }
}
