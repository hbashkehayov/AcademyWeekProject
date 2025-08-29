<?php

namespace App\Services;

use App\Models\AiTool;
use App\Models\Role;
use App\Models\Category;
use App\Models\User;
use App\Models\UserAiInteraction;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class RecommendationEngine
{
    /**
     * Role-specific keywords for matching tools
     */
    private const ROLE_KEYWORDS = [
        'frontend' => [
            'ui', 'ux', 'design', 'css', 'javascript', 'react', 'vue', 'angular', 
            'component', 'responsive', 'accessibility', 'browser', 'dom', 'styling',
            'animation', 'interface', 'visual', 'layout', 'webpack', 'typescript'
        ],
        'backend' => [
            'api', 'database', 'server', 'authentication', 'security', 'performance',
            'optimization', 'sql', 'nosql', 'cache', 'queue', 'microservice', 'rest',
            'graphql', 'docker', 'kubernetes', 'monitoring', 'logging', 'debugging'
        ],
        'qa' => [
            'test', 'testing', 'quality', 'bug', 'automation', 'selenium', 'cypress',
            'jest', 'unit', 'integration', 'e2e', 'regression', 'coverage', 'assertion',
            'mock', 'stub', 'fixture', 'validation', 'verification', 'audit'
        ],
        'designer' => [
            'design', 'figma', 'sketch', 'adobe', 'prototype', 'wireframe', 'mockup',
            'color', 'typography', 'illustration', 'vector', 'pixel', 'creative',
            'brand', 'logo', 'icon', 'asset', 'visual', 'aesthetic', 'user experience'
        ],
        'pm' => [
            'project', 'management', 'agile', 'scrum', 'kanban', 'timeline', 'roadmap',
            'planning', 'sprint', 'backlog', 'story', 'task', 'collaboration', 'team',
            'deadline', 'milestone', 'delivery', 'stakeholder', 'reporting', 'tracking'
        ],
        'owner' => [
            'analytics', 'metrics', 'revenue', 'cost', 'budget', 'roi', 'kpi', 'strategy',
            'business', 'growth', 'scale', 'overview', 'dashboard', 'reporting', 'insight',
            'decision', 'monitoring', 'compliance', 'security', 'enterprise'
        ]
    ];

    /**
     * Category weights for each role
     */
    private const ROLE_CATEGORY_WEIGHTS = [
        'frontend' => [
            'Code Generation' => 0.9,
            'Testing & QA' => 0.7,
            'Documentation' => 0.6,
            'Design Tools' => 0.95,
            'Project Management' => 0.4,
            'Code Review' => 0.8,
            'DevOps & CI/CD' => 0.5,
            'Database Tools' => 0.3,
            'Security' => 0.6,
            'Analytics' => 0.4
        ],
        'backend' => [
            'Code Generation' => 0.9,
            'Testing & QA' => 0.8,
            'Documentation' => 0.7,
            'Design Tools' => 0.2,
            'Project Management' => 0.4,
            'Code Review' => 0.9,
            'DevOps & CI/CD' => 0.95,
            'Database Tools' => 0.95,
            'Security' => 0.9,
            'Analytics' => 0.7
        ],
        'qa' => [
            'Code Generation' => 0.5,
            'Testing & QA' => 1.0,
            'Documentation' => 0.8,
            'Design Tools' => 0.3,
            'Project Management' => 0.5,
            'Code Review' => 0.7,
            'DevOps & CI/CD' => 0.8,
            'Database Tools' => 0.4,
            'Security' => 0.85,
            'Analytics' => 0.6
        ],
        'designer' => [
            'Code Generation' => 0.3,
            'Testing & QA' => 0.2,
            'Documentation' => 0.5,
            'Design Tools' => 1.0,
            'Project Management' => 0.6,
            'Code Review' => 0.2,
            'DevOps & CI/CD' => 0.1,
            'Database Tools' => 0.1,
            'Security' => 0.3,
            'Analytics' => 0.5
        ],
        'pm' => [
            'Code Generation' => 0.2,
            'Testing & QA' => 0.6,
            'Documentation' => 0.9,
            'Design Tools' => 0.5,
            'Project Management' => 1.0,
            'Code Review' => 0.4,
            'DevOps & CI/CD' => 0.4,
            'Database Tools' => 0.2,
            'Security' => 0.5,
            'Analytics' => 0.8
        ],
        'owner' => [
            'Code Generation' => 0.3,
            'Testing & QA' => 0.7,
            'Documentation' => 0.7,
            'Design Tools' => 0.4,
            'Project Management' => 0.9,
            'Code Review' => 0.6,
            'DevOps & CI/CD' => 0.7,
            'Database Tools' => 0.5,
            'Security' => 0.9,
            'Analytics' => 1.0
        ]
    ];

    /**
     * Get recommendations for a specific role with pagination, caching, and personalization
     */
    public function getRecommendationsForRole(string $roleName, int $limit = 10, int $offset = 0, ?string $userId = null): Collection
    {
        $cacheKey = $userId ? "recommendations:{$roleName}:{$limit}:{$offset}:{$userId}" : "recommendations:{$roleName}:{$limit}:{$offset}";
        
        return Cache::remember($cacheKey, 300, function () use ($roleName, $limit, $offset, $userId) { // Cache for 5 minutes
            // Include active tools and recently added pending tools by the user
            $query = AiTool::with(['categories', 'submittedBy']);
            
            if ($userId) {
                // For logged-in users: include active tools AND their recently added pending tools (last 7 days)
                $query->where(function ($q) use ($userId) {
                    $q->where('status', 'active')
                      ->orWhere(function ($subQ) use ($userId) {
                          $subQ->where('status', 'pending')
                               ->where('submitted_by', $userId)
                               ->where('created_at', '>=', now()->subDays(7));
                      });
                });
            } else {
                // For anonymous users: only active tools
                $query->where('status', 'active');
            }
            
            $tools = $query->get();
            
            $scoredTools = $tools->map(function ($tool) use ($roleName, $userId) {
                $score = $this->calculateToolScore($tool, $roleName, $userId);
                $tool->recommendation_score = $score;
                $tool->match_reasons = $this->getMatchReasons($tool, $roleName, $score, $userId);
                $tool->personalization_boost = $this->getPersonalizationBoost($tool, $userId);
                return $tool;
            });

            return $scoredTools
                ->sortByDesc('recommendation_score')
                ->skip($offset)
                ->take($limit)
                ->values();
        });
    }

    /**
     * Get total count of recommendations for a role with caching
     */
    public function getTotalRecommendationsCount(string $roleName): int
    {
        $cacheKey = "total_recommendations:{$roleName}";
        
        return Cache::remember($cacheKey, 600, function () { // Cache for 10 minutes
            // Only count active tools for recommendations
            return AiTool::where('status', 'active')->count();
        });
    }

    /**
     * Calculate a tool's score for a specific role with improved consistency and personalization
     */
    private function calculateToolScore(AiTool $tool, string $roleName, ?string $userId = null): float
    {
        $cacheKey = $userId ? "tool_score:{$tool->id}:{$roleName}:{$userId}" : "tool_score:{$tool->id}:{$roleName}";
        
        return Cache::remember($cacheKey, 1800, function () use ($tool, $roleName, $userId) { // Cache for 30 minutes
            $baseScore = 25; // Moderate base score for realistic differentiation
            
            // 1. Keyword matching in name and description (30 points max)
            $keywordScore = $this->calculateKeywordScore($tool, $roleName);
            $baseScore += $keywordScore * 30; // Balanced scoring
            
            // 2. Category matching (30 points max)
            $categoryScore = $this->calculateCategoryScore($tool, $roleName);
            $baseScore += $categoryScore * 30; // Balanced scoring
            
            // 3. Explicit role suggestion (18 points max)
            $suggestedRole = Role::find($tool->suggested_for_role);
            if ($suggestedRole && $suggestedRole->name === $roleName) {
                $baseScore += 18; // Strong but not excessive boost
            } elseif ($suggestedRole) {
                // Give partial credit for tools assigned to other roles that might be cross-functional
                $crossRoleScore = $this->getCrossRoleCompatibility($roleName, $suggestedRole->name);
                $baseScore += $crossRoleScore * 12; // Moderate cross-role boost
            }
            
            // 4. Tool popularity/quality bonus (12 points max)
            $qualityScore = $this->calculateQualityScore($tool);
            $baseScore += $qualityScore * 12; // Moderate quality boost
            
            // 5. Personalization boost (15 points max)
            if ($userId) {
                $personalizationScore = $this->getPersonalizationBoost($tool, $userId);
                $baseScore += $personalizationScore * 15; // Reasonable personalization boost
                
                // Extra boost for recently added pending tools by the user (12 points)
                if ($tool->status === 'pending' && $tool->submitted_by == $userId) {
                    $daysSinceAdded = now()->diffInDays($tool->created_at);
                    if ($daysSinceAdded <= 7) {
                        $baseScore += 12; // Moderate boost to show user's recent additions
                    }
                }
            }
            
            // Apply multiplier bonuses for good matches
            if ($keywordScore > 0.4 && $categoryScore > 0.5) {
                $baseScore *= 1.05; // 5% bonus for decent matches
            }
            if ($keywordScore > 0.6 || $categoryScore > 0.7) {
                $baseScore += 6; // Extra 6 points for strong matches
            }
            
            // Ensure score is between 0 and 100
            $finalScore = max(0, min(100, round($baseScore, 2)));
            
            // Apply minimum score threshold to filter out very poor matches
            return $finalScore < 40 ? 0 : $finalScore; // Higher threshold for better filtering
        });
    }

    /**
     * Calculate keyword matching score with weighted importance
     */
    private function calculateKeywordScore(AiTool $tool, string $roleName): float
    {
        if (!isset(self::ROLE_KEYWORDS[$roleName])) {
            return 0;
        }
        
        $keywords = self::ROLE_KEYWORDS[$roleName];
        $text = strtolower($tool->name . ' ' . $tool->description . ' ' . $tool->detailed_description);
        
        $weightedScore = 0;
        $totalWeight = 0;
        
        foreach ($keywords as $index => $keyword) {
            // Give higher weight to earlier keywords (more important)
            $weight = max(1, count($keywords) - $index);
            $totalWeight += $weight;
            
            if (str_contains($text, strtolower($keyword))) {
                // Extra weight for name matches
                if (str_contains(strtolower($tool->name), strtolower($keyword))) {
                    $weightedScore += $weight * 1.5;
                } else {
                    $weightedScore += $weight;
                }
            }
        }
        
        return $totalWeight > 0 ? min(1.0, $weightedScore / $totalWeight) : 0;
    }

    /**
     * Calculate category matching score
     */
    private function calculateCategoryScore(AiTool $tool, string $roleName): float
    {
        if (!isset(self::ROLE_CATEGORY_WEIGHTS[$roleName])) {
            return 0;
        }
        
        $weights = self::ROLE_CATEGORY_WEIGHTS[$roleName];
        $categories = $tool->categories->pluck('name')->toArray();
        
        if (empty($categories)) {
            return 0;
        }
        
        $totalScore = 0;
        $categoryCount = 0;
        
        foreach ($categories as $category) {
            if (isset($weights[$category])) {
                $totalScore += $weights[$category];
                $categoryCount++;
            }
        }
        
        return $categoryCount > 0 ? $totalScore / $categoryCount : 0;
    }

    /**
     * Calculate quality score based on tool characteristics
     */
    private function calculateQualityScore(AiTool $tool): float
    {
        $qualityScore = 0.5; // Base quality score
        
        // Boost for well-known/established tools
        $establishedTools = [
            'github copilot', 'chatgpt', 'claude', 'figma', 'linear', 'notion',
            'slack', 'discord', 'postman', 'datadog', 'cypress', 'jest'
        ];
        
        $toolName = strtolower($tool->name);
        foreach ($establishedTools as $established) {
            if (str_contains($toolName, $established)) {
                $qualityScore = 0.9;
                break;
            }
        }
        
        // Boost for tools with detailed descriptions
        if (!empty($tool->detailed_description) && strlen($tool->detailed_description) > 100) {
            $qualityScore += 0.1;
        }
        
        // Boost for tools with valid website URLs
        if (!empty($tool->website_url) && filter_var($tool->website_url, FILTER_VALIDATE_URL)) {
            $qualityScore += 0.1;
        }
        
        // Boost for tools with API endpoints (indicates integration capability)
        if (!empty($tool->api_endpoint)) {
            $qualityScore += 0.1;
        }
        
        return min(1.0, $qualityScore);
    }

    /**
     * Get human-readable match reasons with personalization
     */
    private function getMatchReasons(AiTool $tool, string $roleName, float $score, ?string $userId = null): array
    {
        $reasons = [];
        
        // Check if this tool was recently added by the user or AI assistant
        if ($userId) {
            // Check if user submitted this tool recently and it's still pending
            if ($tool->status === 'pending' && $tool->submitted_by == $userId) {
                $daysSinceAdded = now()->diffInDays($tool->created_at);
                if ($daysSinceAdded <= 7) {
                    $reasons[] = "You recently added this tool (pending approval)";
                }
            }
            
            $recentInteractions = $this->getUserRecentInteractions($userId, $tool->id);
            
            if ($recentInteractions->where('interaction_type', UserAiInteraction::TYPE_ADDED)->isNotEmpty()) {
                $reasons[] = "You recently added this tool";
            }
            
            if ($recentInteractions->where('interaction_type', UserAiInteraction::TYPE_SUGGESTED_BY_AI)->isNotEmpty()) {
                $reasons[] = "Suggested by AI assistant based on your needs";
            }
            
            if ($recentInteractions->where('interaction_type', UserAiInteraction::TYPE_FAVORITED)->isNotEmpty()) {
                $reasons[] = "One of your favorite tools";
            }
        }
        
        // Check if tool was recently popular among similar users
        if ($this->isRecentlyPopular($tool->id, $roleName)) {
            $reasons[] = "Trending among $roleName developers";
        }
        
        // Check for cross-role tools and explain why they're relevant
        $suggestedRole = Role::find($tool->suggested_for_role);
        if ($suggestedRole && $suggestedRole->name !== $roleName) {
            $compatibility = $this->getCrossRoleCompatibility($roleName, $suggestedRole->name);
            if ($compatibility > 0.6) {
                $reasons[] = "Essential for collaboration with {$suggestedRole->name} team";
            } elseif ($compatibility > 0.3) {
                $reasons[] = "Useful for cross-team coordination";
            }
        }
        
        // Standard scoring reasons - updated thresholds to reflect more positive scoring
        if ($score >= 85) {
            $reasons[] = "Perfect match for $roleName developers";
        } elseif ($score >= 70) {
            $reasons[] = "Highly recommended for $roleName role";
        } elseif ($score >= 50) {
            $reasons[] = "Great fit for $roleName tasks";
        } elseif ($score >= 30) {
            $reasons[] = "Good tool for $roleName workflow";
        }
        
        // Add category-based reasons
        $categories = $tool->categories->pluck('name')->toArray();
        $weights = self::ROLE_CATEGORY_WEIGHTS[$roleName] ?? [];
        
        foreach ($categories as $category) {
            if (isset($weights[$category]) && $weights[$category] >= 0.8) {
                $reasons[] = "Essential for $category";
            }
        }
        
        // Add keyword-based reasons
        $keywords = self::ROLE_KEYWORDS[$roleName] ?? [];
        $text = strtolower($tool->description);
        
        $matchedKeywords = [];
        foreach ($keywords as $keyword) {
            if (str_contains($text, strtolower($keyword))) {
                $matchedKeywords[] = $keyword;
            }
        }
        
        if (count($matchedKeywords) > 2) {
            $reasons[] = "Supports " . implode(', ', array_slice($matchedKeywords, 0, 3));
        }
        
        // Prioritize personalization reasons first, then role-specific reasons
        $personalizedReasons = [];
        $standardReasons = [];
        
        foreach ($reasons as $reason) {
            if (str_contains($reason, 'You recently') || 
                str_contains($reason, 'AI assistant') || 
                str_contains($reason, 'favorite') || 
                str_contains($reason, 'Trending')) {
                $personalizedReasons[] = $reason;
            } else {
                $standardReasons[] = $reason;
            }
        }
        
        // Combine with personalized reasons first
        $finalReasons = array_merge($personalizedReasons, $standardReasons);
        
        return array_unique(array_slice($finalReasons, 0, 3)); // Limit to 3 reasons for UI clarity
    }

    /**
     * Get all roles with their recommendations
     */
    public function getAllRoleRecommendations(): array
    {
        $cacheKey = 'all_role_recommendations';
        
        return Cache::remember($cacheKey, 600, function () {
            $roles = Role::all();
            $recommendations = [];
            
            foreach ($roles as $role) {
                $recommendations[$role->name] = [
                    'role' => $role,
                    'tools' => $this->getRecommendationsForRole($role->name, 5)
                ];
            }
            
            return $recommendations;
        });
    }

    /**
     * Get personalization boost for a tool based on user interactions
     */
    private function getPersonalizationBoost(AiTool $tool, ?string $userId = null): float
    {
        if (!$userId) {
            return 0;
        }
        
        $cacheKey = "personalization_boost:{$tool->id}:{$userId}";
        
        return Cache::remember($cacheKey, 900, function () use ($tool, $userId) { // Cache for 15 minutes
            $boost = 0;
            
            // Get user's recent interactions with this tool
            $interactions = $this->getUserRecentInteractions($userId, $tool->id);
            
            // Boost for recently added tools (high boost)
            if ($interactions->where('interaction_type', UserAiInteraction::TYPE_ADDED)->isNotEmpty()) {
                $boost += 0.8;
            }
            
            // Boost for AI suggested tools (medium boost)
            if ($interactions->where('interaction_type', UserAiInteraction::TYPE_SUGGESTED_BY_AI)->isNotEmpty()) {
                $boost += 0.6;
            }
            
            // Boost for favorited tools (highest boost)
            if ($interactions->where('interaction_type', UserAiInteraction::TYPE_FAVORITED)->isNotEmpty()) {
                $boost += 1.0;
            }
            
            // Boost for viewed/clicked tools (small boost)
            $engagementInteractions = $interactions->whereIn('interaction_type', [
                UserAiInteraction::TYPE_VIEWED,
                UserAiInteraction::TYPE_CLICKED
            ]);
            
            if ($engagementInteractions->count() > 0) {
                $boost += min(0.3, $engagementInteractions->count() * 0.1);
            }
            
            // Boost for similar tools recently added by the user
            $similarToolsBoost = $this->getSimilarToolsBoost($tool, $userId);
            $boost += $similarToolsBoost;
            
            return min(1.0, $boost); // Cap at 1.0
        });
    }
    
    /**
     * Get user's recent interactions with a specific tool
     */
    private function getUserRecentInteractions(string $userId, string $toolId, int $days = 30): Collection
    {
        return UserAiInteraction::where('user_id', $userId)
            ->where('tool_id', $toolId)
            ->where('created_at', '>=', now()->subDays($days))
            ->get();
    }
    
    /**
     * Check if a tool is recently popular among users with the same role
     */
    private function isRecentlyPopular(string $toolId, string $roleName, int $days = 7): bool
    {
        $cacheKey = "recently_popular:{$toolId}:{$roleName}:{$days}";
        
        return Cache::remember($cacheKey, 3600, function () use ($toolId, $roleName, $days) { // Cache for 1 hour
            $popularityThreshold = 3; // At least 3 users must have added it
            
            $additionCount = UserAiInteraction::where('tool_id', $toolId)
                ->where('interaction_type', UserAiInteraction::TYPE_ADDED)
                ->where('created_at', '>=', now()->subDays($days))
                ->whereHas('user', function ($query) use ($roleName) {
                    $query->whereHas('role', function ($roleQuery) use ($roleName) {
                        $roleQuery->where('name', $roleName);
                    });
                })
                ->count();
            
            return $additionCount >= $popularityThreshold;
        });
    }
    
    /**
     * Get boost based on similar tools the user has interacted with
     */
    private function getSimilarToolsBoost(AiTool $tool, string $userId): float
    {
        $cacheKey = "similar_tools_boost:{$tool->id}:{$userId}";
        
        return Cache::remember($cacheKey, 1800, function () use ($tool, $userId) { // Cache for 30 minutes
            // Get categories of tools the user recently interacted with
            $userInteractedCategories = UserAiInteraction::where('user_id', $userId)
                ->whereIn('interaction_type', [
                    UserAiInteraction::TYPE_ADDED,
                    UserAiInteraction::TYPE_FAVORITED,
                    UserAiInteraction::TYPE_SUGGESTED_BY_AI
                ])
                ->where('created_at', '>=', now()->subDays(30))
                ->with('tool.categories')
                ->get()
                ->flatMap(function ($interaction) {
                    return $interaction->tool ? $interaction->tool->categories->pluck('name') : collect();
                })
                ->countBy()
                ->sortDesc();
            
            if ($userInteractedCategories->isEmpty()) {
                return 0;
            }
            
            // Calculate similarity boost based on category overlap
            $toolCategories = $tool->categories->pluck('name');
            $boost = 0;
            
            foreach ($toolCategories as $category) {
                if ($userInteractedCategories->has($category)) {
                    $categoryFrequency = $userInteractedCategories->get($category);
                    $boost += min(0.2, $categoryFrequency * 0.05); // Max 0.2 per category
                }
            }
            
            return min(0.4, $boost); // Cap total boost at 0.4
        });
    }
    
    /**
     * Calculate cross-role compatibility score
     */
    private function getCrossRoleCompatibility(string $userRole, string $toolRole): float
    {
        // Define role compatibility matrix (0.0 to 1.0)
        $compatibilityMatrix = [
            'frontend' => [
                'designer' => 0.8,  // Frontend devs often work with designers
                'backend' => 0.6,    // Full-stack collaboration
                'pm' => 0.4,         // Project coordination
                'qa' => 0.5,         // Testing integration
                'owner' => 0.3       // Less direct interaction
            ],
            'backend' => [
                'frontend' => 0.6,   // Full-stack collaboration
                'designer' => 0.2,   // Less overlap
                'pm' => 0.4,         // Project coordination
                'qa' => 0.7,         // Testing and debugging
                'owner' => 0.5       // Performance and scaling
            ],
            'qa' => [
                'frontend' => 0.5,   // UI/UX testing
                'backend' => 0.7,    // API and system testing
                'designer' => 0.4,   // Design validation
                'pm' => 0.6,         // Test planning
                'owner' => 0.3       // Quality reporting
            ],
            'designer' => [
                'frontend' => 0.8,   // Close collaboration
                'backend' => 0.2,    // Less direct interaction
                'pm' => 0.7,         // Project alignment
                'qa' => 0.4,         // Design testing
                'owner' => 0.5       // Product direction
            ],
            'pm' => [
                'frontend' => 0.4,   // Team coordination
                'backend' => 0.4,    // Team coordination
                'designer' => 0.7,   // Design coordination
                'qa' => 0.6,         // Quality planning
                'owner' => 0.8       // Strategic alignment
            ],
            'owner' => [
                'frontend' => 0.3,   // High-level oversight
                'backend' => 0.5,    // Performance focus
                'designer' => 0.5,   // Product vision
                'pm' => 0.8,         // Strategic coordination
                'qa' => 0.3          // Quality oversight
            ]
        ];
        
        return $compatibilityMatrix[$userRole][$toolRole] ?? 0.0;
    }
    
    /**
     * Get recently added tools by users for trending analysis
     */
    public function getRecentlyAddedTools(string $roleName, int $days = 7, int $limit = 5): Collection
    {
        $cacheKey = "recently_added_tools:{$roleName}:{$days}:{$limit}";
        
        return Cache::remember($cacheKey, 600, function () use ($roleName, $days, $limit) { // Cache for 10 minutes
            return UserAiInteraction::where('interaction_type', UserAiInteraction::TYPE_ADDED)
                ->where('created_at', '>=', now()->subDays($days))
                ->whereHas('user', function ($query) use ($roleName) {
                    $query->whereHas('role', function ($roleQuery) use ($roleName) {
                        $roleQuery->where('name', $roleName);
                    });
                })
                ->with(['tool', 'user'])
                ->select(['tool_id', 'user_id', 'created_at'])
                ->selectRaw('COUNT(*) as addition_count')
                ->groupBy(['tool_id', 'user_id', 'created_at'])
                ->orderByDesc('created_at')
                ->limit($limit)
                ->get();
        });
    }

    /**
     * Clear all recommendation caches
     */
    public function clearCaches(): void
    {
        // Clear all recommendation-related cache keys
        $patterns = [
            'recommendations:*',
            'total_recommendations:*',
            'tool_score:*',
            'personalization_boost:*',
            'recently_popular:*',
            'similar_tools_boost:*',
            'recently_added_tools:*',
            'all_role_recommendations'
        ];
        
        foreach ($patterns as $pattern) {
            if (method_exists(Cache::getStore(), 'flush')) {
                // If using array/file cache, we need to flush all
                Cache::flush();
                break;
            } else {
                // For Redis/Memcached, we would need to implement pattern deletion
                // For now, just forget the main cache key
                Cache::forget($pattern);
            }
        }
    }
}