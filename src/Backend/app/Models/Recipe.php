<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Recipe extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'tool_recipes';

    protected $fillable = [
        'name',
        'description',
        'goal',
        'steps',
        'estimated_time',
        'difficulty',
        'created_by',
        'uses_count',
        'success_rate',
        'tags',
        'status',
        'is_featured',
        'categories',
    ];

    protected $casts = [
        'steps' => 'array',
        'tags' => 'array',
        'categories' => 'array',
        'success_rate' => 'float',
        'is_featured' => 'boolean',
    ];

    protected $attributes = [
        'uses_count' => 0,
        'success_rate' => 0.0,
        'status' => 'draft',
        'is_featured' => false,
        'difficulty' => 'beginner',
    ];

    // Relationships
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    public function scopeByDifficulty($query, string $difficulty)
    {
        return $query->where('difficulty', $difficulty);
    }

    public function scopePopular($query)
    {
        return $query->orderBy('uses_count', 'desc');
    }

    public function scopeHighSuccess($query)
    {
        return $query->orderBy('success_rate', 'desc');
    }

    // Methods
    public function incrementUses(): void
    {
        $this->increment('uses_count');
    }

    public function updateSuccessRate(float $newRate): void
    {
        $this->update(['success_rate' => $newRate]);
    }

    public function getFormattedEstimatedTimeAttribute(): string
    {
        if (!$this->estimated_time) {
            return 'Unknown';
        }

        if ($this->estimated_time < 60) {
            return $this->estimated_time . ' mins';
        }

        $hours = floor($this->estimated_time / 60);
        $minutes = $this->estimated_time % 60;

        if ($minutes === 0) {
            return $hours . 'h';
        }

        return $hours . 'h ' . $minutes . 'm';
    }

    public function getDifficultyColorAttribute(): string
    {
        return match($this->difficulty) {
            'beginner' => 'green',
            'intermediate' => 'yellow',
            'advanced' => 'red',
            default => 'gray'
        };
    }

    public function getSuccessRatePercentageAttribute(): string
    {
        return number_format($this->success_rate, 0) . '%';
    }
}