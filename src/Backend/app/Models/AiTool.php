<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class AiTool extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'detailed_description',
        'website_url',
        'api_endpoint',
        'logo_url',
        'pricing_model',
        'features',
        'integration_type',
        'status',
        'submitted_by',
        'approved_by',
        'suggested_for_role',
    ];

    protected $casts = [
        'pricing_model' => 'array',
        'features' => 'array',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($tool) {
            if (empty($tool->slug)) {
                $baseSlug = Str::slug($tool->name);
                $slug = $baseSlug;
                $counter = 1;
                
                // Ensure unique slug
                while (static::where('slug', $slug)->exists()) {
                    $slug = $baseSlug . '-' . $counter;
                    $counter++;
                }
                
                $tool->slug = $slug;
            }
        });
    }

    public function categories()
    {
        return $this->belongsToMany(Category::class, 'tool_categories', 'tool_id', 'category_id');
    }

    public function roles()
    {
        return $this->belongsToMany(Role::class, 'tool_roles', 'tool_id', 'role_id')
            ->withPivot('relevance_score', 'use_cases');
    }

    public function ratings()
    {
        return $this->hasMany(ToolRating::class, 'tool_id');
    }

    public function userUsage()
    {
        return $this->hasMany(UserToolUsage::class, 'tool_id');
    }

    public function submittedBy()
    {
        return $this->belongsTo(User::class, 'submitted_by');
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function suggestedForRole()
    {
        return $this->belongsTo(Role::class, 'suggested_for_role');
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function getAverageRatingAttribute()
    {
        return $this->ratings()->avg('rating') ?? 0;
    }
}
