<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Code Generation',
                'slug' => 'code-generation',
                'description' => 'AI tools that generate, complete, or suggest code',
                'icon' => 'code'
            ],
            [
                'name' => 'Testing & QA',
                'slug' => 'testing-qa',
                'description' => 'Tools for automated testing, bug detection, and quality assurance',
                'icon' => 'bug'
            ],
            [
                'name' => 'Documentation',
                'slug' => 'documentation',
                'description' => 'AI-powered documentation generators and assistants',
                'icon' => 'book'
            ],
            [
                'name' => 'Design Tools',
                'slug' => 'design-tools',
                'description' => 'AI tools for UI/UX design, prototyping, and graphics',
                'icon' => 'palette'
            ],
            [
                'name' => 'Project Management',
                'slug' => 'project-management',
                'description' => 'AI-enhanced project planning and management tools',
                'icon' => 'tasks'
            ],
            [
                'name' => 'Code Review',
                'slug' => 'code-review',
                'description' => 'Automated code review and analysis tools',
                'icon' => 'search'
            ],
            [
                'name' => 'DevOps & CI/CD',
                'slug' => 'devops-cicd',
                'description' => 'AI tools for deployment, monitoring, and continuous integration',
                'icon' => 'rocket'
            ],
            [
                'name' => 'Database Tools',
                'slug' => 'database-tools',
                'description' => 'AI-powered database optimization and query tools',
                'icon' => 'database'
            ],
            [
                'name' => 'Security',
                'slug' => 'security',
                'description' => 'AI security scanning and vulnerability detection tools',
                'icon' => 'shield'
            ],
            [
                'name' => 'Analytics',
                'slug' => 'analytics',
                'description' => 'AI-powered analytics and insights tools',
                'icon' => 'chart'
            ]
        ];

        foreach ($categories as $category) {
            Category::updateOrCreate(
                ['slug' => $category['slug']],
                $category
            );
        }
    }
}
