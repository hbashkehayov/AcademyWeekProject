<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'display_name',
        'phone_number',
        'role_id',
        'organization_id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function submittedTools()
    {
        return $this->hasMany(AiTool::class, 'submitted_by');
    }

    public function approvedTools()
    {
        return $this->hasMany(AiTool::class, 'approved_by');
    }

    public function ratings()
    {
        return $this->hasMany(ToolRating::class);
    }

    public function toolUsage()
    {
        return $this->hasMany(UserToolUsage::class);
    }

    public function favoriteTools()
    {
        return $this->toolUsage()->where('is_favorite', true);
    }
}
