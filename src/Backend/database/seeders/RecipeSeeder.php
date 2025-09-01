<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Recipe;
use App\Models\User;

class RecipeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get the first user (Owner) to be recipe creator
        $owner = User::where('email', 'ivan@admin.local')->first();
        if (!$owner) {
            $owner = User::first();
        }

        if (!$owner) {
            $this->command->warn('No users found. Please run UserSeeder first.');
            return;
        }

        $recipes = [
            [
                'name' => 'Blog Post to Social Media Blitz',
                'description' => 'Transform one blog post into a complete multi-platform social media campaign with graphics and scheduling',
                'goal' => 'Create a comprehensive social media campaign from a single blog post to maximize reach and engagement across all platforms',
                'steps' => [
                    [
                        'step' => 1,
                        'tool_name' => 'Claude',
                        'instruction' => 'Write a comprehensive blog post on your topic with SEO optimization',
                        'tool_id' => null
                    ],
                    [
                        'step' => 2,
                        'tool_name' => 'ChatGPT',
                        'instruction' => 'Create 5 social media variants: Twitter thread, LinkedIn post, Instagram caption, Facebook update, and TikTok script',
                        'tool_id' => null
                    ],
                    [
                        'step' => 3,
                        'tool_name' => 'Canva',
                        'instruction' => 'Design quote graphics, infographics, and visual assets for each platform',
                        'tool_id' => null
                    ],
                    [
                        'step' => 4,
                        'tool_name' => 'Buffer',
                        'instruction' => 'Schedule optimized posting times across all social media platforms',
                        'tool_id' => null
                    ]
                ],
                'estimated_time' => 45,
                'difficulty' => 'beginner',
                'tags' => ['content', 'social-media', 'marketing', 'blogging'],
                'categories' => ['Marketing', 'Content Creation'],
                'uses_count' => 234,
                'success_rate' => 94.0,
                'status' => 'active',
                'is_featured' => true,
                'created_by' => $owner->id,
            ],
            [
                'name' => 'AI-Powered Market Research Sprint',
                'description' => 'Conduct comprehensive market research using AI tools to analyze competitors, trends, and opportunities',
                'goal' => 'Complete market analysis and competitor research in under 2 hours using AI automation',
                'steps' => [
                    [
                        'step' => 1,
                        'tool_name' => 'Perplexity',
                        'instruction' => 'Research market trends, size, and growth projections in your industry',
                        'tool_id' => null
                    ],
                    [
                        'step' => 2,
                        'tool_name' => 'ChatGPT',
                        'instruction' => 'Analyze competitor strategies, pricing, and positioning from research data',
                        'tool_id' => null
                    ],
                    [
                        'step' => 3,
                        'tool_name' => 'Gamma',
                        'instruction' => 'Create professional market research presentation with key findings',
                        'tool_id' => null
                    ],
                    [
                        'step' => 4,
                        'tool_name' => 'Claude',
                        'instruction' => 'Generate actionable market entry strategy and recommendations',
                        'tool_id' => null
                    ]
                ],
                'estimated_time' => 120,
                'difficulty' => 'intermediate',
                'tags' => ['research', 'business', 'analysis', 'strategy'],
                'categories' => ['Research', 'Business Intelligence'],
                'uses_count' => 156,
                'success_rate' => 88.0,
                'status' => 'active',
                'is_featured' => true,
                'created_by' => $owner->id,
            ],
            [
                'name' => 'Code to Documentation Pipeline',
                'description' => 'Automatically generate comprehensive technical documentation from your codebase',
                'goal' => 'Transform code repositories into professional documentation with minimal manual effort',
                'steps' => [
                    [
                        'step' => 1,
                        'tool_name' => 'GitHub Copilot',
                        'instruction' => 'Generate inline code comments and function descriptions',
                        'tool_id' => null
                    ],
                    [
                        'step' => 2,
                        'tool_name' => 'Claude',
                        'instruction' => 'Create README files, API documentation, and setup guides',
                        'tool_id' => null
                    ],
                    [
                        'step' => 3,
                        'tool_name' => 'GitBook',
                        'instruction' => 'Structure documentation with proper navigation and search',
                        'tool_id' => null
                    ],
                    [
                        'step' => 4,
                        'tool_name' => 'Loom',
                        'instruction' => 'Record video walkthroughs for complex features',
                        'tool_id' => null
                    ]
                ],
                'estimated_time' => 90,
                'difficulty' => 'intermediate',
                'tags' => ['development', 'documentation', 'automation'],
                'categories' => ['Development', 'Documentation'],
                'uses_count' => 78,
                'success_rate' => 92.0,
                'status' => 'active',
                'is_featured' => false,
                'created_by' => $owner->id,
            ],
            [
                'name' => 'Product Launch Campaign Generator',
                'description' => 'Create a complete product launch campaign with landing pages, email sequences, and promotional materials',
                'goal' => 'Launch a product with professional marketing materials and automated follow-up sequences',
                'steps' => [
                    [
                        'step' => 1,
                        'tool_name' => 'Copy.ai',
                        'instruction' => 'Generate product descriptions, headlines, and marketing copy',
                        'tool_id' => null
                    ],
                    [
                        'step' => 2,
                        'tool_name' => 'Webflow',
                        'instruction' => 'Build responsive landing page with generated copy',
                        'tool_id' => null
                    ],
                    [
                        'step' => 3,
                        'tool_name' => 'Mailchimp',
                        'instruction' => 'Set up automated email sequences for leads and customers',
                        'tool_id' => null
                    ],
                    [
                        'step' => 4,
                        'tool_name' => 'Canva',
                        'instruction' => 'Create product mockups, social media assets, and promotional graphics',
                        'tool_id' => null
                    ],
                    [
                        'step' => 5,
                        'tool_name' => 'Hootsuite',
                        'instruction' => 'Schedule coordinated social media launch campaign',
                        'tool_id' => null
                    ]
                ],
                'estimated_time' => 180,
                'difficulty' => 'advanced',
                'tags' => ['marketing', 'launch', 'automation', 'campaign'],
                'categories' => ['Marketing', 'Product Management'],
                'uses_count' => 67,
                'success_rate' => 86.0,
                'status' => 'active',
                'is_featured' => true,
                'created_by' => $owner->id,
            ],
            [
                'name' => 'UX Research to Design System',
                'description' => 'Conduct user research, analyze findings, and create a complete design system',
                'goal' => 'Build data-driven design system based on comprehensive user research',
                'steps' => [
                    [
                        'step' => 1,
                        'tool_name' => 'Typeform',
                        'instruction' => 'Create user surveys and collect feedback data',
                        'tool_id' => null
                    ],
                    [
                        'step' => 2,
                        'tool_name' => 'Claude',
                        'instruction' => 'Analyze survey responses and identify key user insights',
                        'tool_id' => null
                    ],
                    [
                        'step' => 3,
                        'tool_name' => 'Figma',
                        'instruction' => 'Design wireframes and prototypes based on research findings',
                        'tool_id' => null
                    ],
                    [
                        'step' => 4,
                        'tool_name' => 'Storybook',
                        'instruction' => 'Build component library and design system documentation',
                        'tool_id' => null
                    ]
                ],
                'estimated_time' => 240,
                'difficulty' => 'advanced',
                'tags' => ['ux', 'research', 'design', 'system'],
                'categories' => ['Design', 'Research'],
                'uses_count' => 45,
                'success_rate' => 91.0,
                'status' => 'active',
                'is_featured' => false,
                'created_by' => $owner->id,
            ],
            [
                'name' => 'Content Repurposing Machine',
                'description' => 'Turn one piece of long-form content into 20+ pieces across different formats and platforms',
                'goal' => 'Maximize content ROI by creating multiple formats from a single source',
                'steps' => [
                    [
                        'step' => 1,
                        'tool_name' => 'Claude',
                        'instruction' => 'Break down long-form content into key points and summaries',
                        'tool_id' => null
                    ],
                    [
                        'step' => 2,
                        'tool_name' => 'Jasper',
                        'instruction' => 'Create blog posts, newsletters, and article variations',
                        'tool_id' => null
                    ],
                    [
                        'step' => 3,
                        'tool_name' => 'Descript',
                        'instruction' => 'Generate podcast episodes, video scripts, and audio content',
                        'tool_id' => null
                    ],
                    [
                        'step' => 4,
                        'tool_name' => 'Later',
                        'instruction' => 'Schedule content distribution across all platforms',
                        'tool_id' => null
                    ]
                ],
                'estimated_time' => 75,
                'difficulty' => 'beginner',
                'tags' => ['content', 'repurposing', 'efficiency'],
                'categories' => ['Content Creation', 'Marketing'],
                'uses_count' => 189,
                'success_rate' => 89.0,
                'status' => 'active',
                'is_featured' => false,
                'created_by' => $owner->id,
            ]
        ];

        foreach ($recipes as $recipeData) {
            Recipe::create($recipeData);
        }

        $this->command->info('Created ' . count($recipes) . ' sample recipes.');
    }
}