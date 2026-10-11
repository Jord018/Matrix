<?php

namespace Tests\Feature;

use App\Models\Account;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class EnsureAdminTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // "Account" is an existing Supabase table, so it has no migration.
        Schema::create('Account', function ($t) {
            $t->uuid('id')->primary();
            $t->string('Username');
            $t->string('Email');
            $t->string('PasswordHash');
            $t->string('Role')->default('customer');
            $t->timestamp('createdAt')->nullable();
        });

        Route::middleware(['auth:sanctum', 'admin'])->get('/api/_admin-probe', fn () => ['ok' => true]);
    }

    private function account(string $role): Account
    {
        return Account::create([
            'Username' => $role,
            'Email' => "$role@example.com",
            'PasswordHash' => 'x',
            'Role' => $role,
        ]);
    }

    public function test_guest_gets_401(): void
    {
        $this->getJson('/api/_admin-probe')->assertStatus(401);
    }

    public function test_customer_gets_403(): void
    {
        $this->actingAs($this->account('customer'), 'sanctum')
            ->getJson('/api/_admin-probe')->assertStatus(403);
    }

    public function test_admin_passes(): void
    {
        $this->actingAs($this->account('admin'), 'sanctum')
            ->getJson('/api/_admin-probe')->assertOk()->assertJson(['ok' => true]);
    }
}
