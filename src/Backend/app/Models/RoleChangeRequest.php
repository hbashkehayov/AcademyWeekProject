<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class RoleChangeRequest extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'user_id',
        'current_role_id',
        'requested_role_id',
        'reason',
        'status',
        'admin_comment',
        'processed_by',
        'processed_at',
    ];

    protected $casts = [
        'processed_at' => 'datetime',
    ];

    /**
     * The user who requested the role change
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * The current role of the user when request was made
     */
    public function currentRole()
    {
        return $this->belongsTo(Role::class, 'current_role_id');
    }

    /**
     * The requested role
     */
    public function requestedRole()
    {
        return $this->belongsTo(Role::class, 'requested_role_id');
    }

    /**
     * The admin who processed the request
     */
    public function processedBy()
    {
        return $this->belongsTo(User::class, 'processed_by');
    }

    /**
     * Scope for pending requests
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope for approved requests
     */
    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    /**
     * Scope for rejected requests
     */
    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }
}