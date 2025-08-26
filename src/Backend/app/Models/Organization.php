<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Organization extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'website',
        'size',
    ];

    public function users()
    {
        return $this->hasMany(User::class);
    }
}
