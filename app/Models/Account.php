<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Foundation\Auth\User as Authenticatable;

/**
 * Existing Supabase table "Account" (shared with the old Node app).
 */
class Account extends Authenticatable
{
    use HasUuids;

    protected $table = 'Account';

    public $timestamps = false;

    protected $fillable = ['Username', 'Email', 'PasswordHash', 'Role', 'createdAt'];

    protected $hidden = ['PasswordHash'];

    protected $casts = ['createdAt' => 'datetime'];

    // No remember_token column on this table.
    protected $rememberTokenName = '';

    public function getAuthPasswordName(): string
    {
        return 'PasswordHash';
    }

    public function isAdmin(): bool
    {
        return $this->Role === 'admin';
    }

    public function orders()
    {
        return $this->hasMany(Order::class, 'userId');
    }
}
