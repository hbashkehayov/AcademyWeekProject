<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'display_name',
        'description',
    ];

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function tools()
    {
        return $this->belongsToMany(AiTool::class, 'tool_roles')
            ->withPivot('relevance_score', 'use_cases');
    }
}
