<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;
use PragmaRX\Google2FALaravel\Support\Authenticator;

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
        'two_factor_secret',
        'two_factor_recovery_codes',
        'two_factor_confirmed_at',
        'two_factor_enabled',
        'two_factor_email_token',
        'two_factor_email_token_expires_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'two_factor_email_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'two_factor_confirmed_at' => 'datetime',
        'two_factor_enabled' => 'boolean',
        'two_factor_email_token_expires_at' => 'datetime',
        'two_factor_recovery_codes' => 'encrypted:array',
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

    public function hasTwoFactorEnabled()
    {
        return $this->two_factor_enabled && !empty($this->two_factor_secret);
    }

    public function generateTwoFactorRecoveryCodes()
    {
        $codes = [];
        for ($i = 0; $i < 8; $i++) {
            $codes[] = strtolower(str_replace('-', '', \Illuminate\Support\Str::uuid()));
        }
        
        $this->two_factor_recovery_codes = $codes;
        $this->save();
        
        return $codes;
    }

    public function generateEmailToken()
    {
        $token = sprintf('%06d', random_int(100000, 999999));
        
        $this->two_factor_email_token = $token;
        $this->two_factor_email_token_expires_at = now()->addMinutes(10);
        $this->save();
        
        return $token;
    }

    public function isEmailTokenValid($token)
    {
        return $this->two_factor_email_token === $token && 
               $this->two_factor_email_token_expires_at && 
               $this->two_factor_email_token_expires_at->isFuture();
    }

    public function clearEmailToken()
    {
        $this->two_factor_email_token = null;
        $this->two_factor_email_token_expires_at = null;
        $this->save();
    }

    public function enableTwoFactor($secret)
    {
        $this->two_factor_secret = encrypt($secret);
        $this->two_factor_enabled = true;
        $this->two_factor_confirmed_at = now();
        $this->save();
        
        return $this->generateTwoFactorRecoveryCodes();
    }

    public function disableTwoFactor()
    {
        $this->two_factor_secret = null;
        $this->two_factor_enabled = false;
        $this->two_factor_confirmed_at = null;
        $this->two_factor_recovery_codes = null;
        $this->save();
    }

    public function getTwoFactorSecret()
    {
        return $this->two_factor_secret ? decrypt($this->two_factor_secret) : null;
    }
}
