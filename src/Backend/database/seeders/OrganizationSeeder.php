<?php

namespace Database\Seeders;

use App\Models\Organization;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class OrganizationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $organizations = [
            [
                'id' => Str::uuid(),
                'name' => 'TechCorp Solutions',
                'slug' => 'techcorp-solutions',
                'description' => 'A leading software development company specializing in AI-powered solutions',
                'website' => 'https://techcorp.example.com',
                'size' => 50,
            ],
            [
                'id' => Str::uuid(),
                'name' => 'StartupHub Inc',
                'slug' => 'startuphub-inc',
                'description' => 'Innovation-driven startup focused on cutting-edge technologies',
                'website' => 'https://startuphub.example.com',
                'size' => 15,
            ],
        ];

        foreach ($organizations as $org) {
            Organization::updateOrCreate(
                ['slug' => $org['slug']],
                $org
            );
        }
    }
}
