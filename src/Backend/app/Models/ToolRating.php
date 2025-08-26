<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ToolRating extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'tool_id',
        'user_id',
        'rating',
        'review',
    ];

    protected $casts = [
        'rating' => 'integer',
    ];

    public function tool()
    {
        return $this->belongsTo(AiTool::class, 'tool_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
