<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class UserAiInteraction extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'user_id',
        'tool_id',
        'interaction_type',
        'source',
        'metadata',
        'session_duration',
        'rating',
    ];

    protected $casts = [
        'metadata' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Interaction types
    const TYPE_VIEWED = 'viewed';
    const TYPE_CLICKED = 'clicked';
    const TYPE_ADDED = 'added';
    const TYPE_SUGGESTED_BY_AI = 'suggested_by_ai';
    const TYPE_FAVORITED = 'favorited';
    const TYPE_RATED = 'rated';

    // Sources
    const SOURCE_DASHBOARD = 'dashboard';
    const SOURCE_AI_ASSISTANT = 'ai_assistant';
    const SOURCE_SEARCH = 'search';
    const SOURCE_BROWSE = 'browse';

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function tool()
    {
        return $this->belongsTo(AiTool::class, 'tool_id');
    }

    // Scopes for common queries
    public function scopeRecentlyAdded(Builder $query, int $days = 7)
    {
        return $query->where('interaction_type', self::TYPE_ADDED)
                    ->where('created_at', '>=', now()->subDays($days));
    }

    public function scopeSuggestedByAI(Builder $query, int $days = 30)
    {
        return $query->where('interaction_type', self::TYPE_SUGGESTED_BY_AI)
                    ->where('created_at', '>=', now()->subDays($days));
    }

    public function scopeForUser(Builder $query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopePopularRecentlyAdded(Builder $query, int $days = 7)
    {
        return $query->where('interaction_type', self::TYPE_ADDED)
                    ->where('created_at', '>=', now()->subDays($days))
                    ->selectRaw('tool_id, COUNT(*) as addition_count')
                    ->groupBy('tool_id')
                    ->orderByDesc('addition_count');
    }

    public function scopeUserEngagement(Builder $query, $userId, int $days = 30)
    {
        return $query->where('user_id', $userId)
                    ->where('created_at', '>=', now()->subDays($days))
                    ->whereIn('interaction_type', [
                        self::TYPE_VIEWED,
                        self::TYPE_CLICKED,
                        self::TYPE_FAVORITED,
                        self::TYPE_RATED
                    ]);
    }

    /**
     * Create an interaction record
     */
    public static function createInteraction(
        string $userId,
        ?string $toolId,
        string $type,
        string $source,
        array $metadata = [],
        ?int $sessionDuration = null,
        ?float $rating = null
    ): self {
        return self::create([
            'user_id' => $userId,
            'tool_id' => $toolId,
            'interaction_type' => $type,
            'source' => $source,
            'metadata' => $metadata,
            'session_duration' => $sessionDuration,
            'rating' => $rating,
        ]);
    }
}