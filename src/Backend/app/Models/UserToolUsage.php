<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserToolUsage extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'user_tool_usage';

    protected $fillable = [
        'user_id',
        'tool_id',
        'last_used',
        'usage_frequency',
        'is_favorite',
        'custom_notes',
    ];

    protected $casts = [
        'last_used' => 'datetime',
        'is_favorite' => 'boolean',
        'usage_frequency' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function tool()
    {
        return $this->belongsTo(AiTool::class, 'tool_id');
    }
}
