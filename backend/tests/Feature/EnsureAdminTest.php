<?php

namespace Tests\Feature;

use App\Models\Account;
use Illuminate\Support\Facades\Route;
use Tests\Concerns\BackOfficeSchema;
use Tests\TestCase;

class EnsureAdminTest extends TestCase
{
    use BackOfficeSchema;

    protected function setUp(): void
    {
        parent::setUp();

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
