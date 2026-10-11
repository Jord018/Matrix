<?php

namespace Tests\Feature;

use App\Models\Account;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class AuthTest extends TestCase
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

        Account::create([
            'Username' => 'jerry',
            'Email' => 'jerry@example.com',
            'PasswordHash' => Hash::make('secret123'),
            'Role' => 'admin',
        ]);
    }

    private function spa()
    {
        return $this->withHeaders(['Referer' => 'http://localhost:5173']);
    }

    public function test_login_succeeds_and_hides_password_hash(): void
    {
        $this->spa()->postJson('/api/login', ['username' => 'jerry', 'password' => 'secret123'])
            ->assertOk()
            ->assertJsonPath('Username', 'jerry')
            ->assertJsonPath('Role', 'admin')
            ->assertJsonMissingPath('PasswordHash');

        $this->spa()->getJson('/api/user')->assertOk()->assertJsonPath('Username', 'jerry');
    }

    public function test_login_rejects_wrong_password(): void
    {
        $this->spa()->postJson('/api/login', ['username' => 'jerry', 'password' => 'nope'])
            ->assertStatus(401);
    }

    public function test_login_rejects_unknown_user(): void
    {
        $this->spa()->postJson('/api/login', ['username' => 'ghost', 'password' => 'secret123'])
            ->assertStatus(401);
    }

    public function test_login_requires_both_fields(): void
    {
        $this->spa()->postJson('/api/login', [])->assertStatus(422)
            ->assertJsonValidationErrors(['username', 'password']);
    }

    public function test_logout_ends_session(): void
    {
        $this->spa()->postJson('/api/login', ['username' => 'jerry', 'password' => 'secret123'])->assertOk();
        $this->spa()->postJson('/api/logout')->assertOk();

        $this->app['auth']->forgetGuards();
        $this->spa()->getJson('/api/user')->assertStatus(401);
    }

    public function test_logout_requires_login(): void
    {
        $this->spa()->postJson('/api/logout')->assertStatus(401);
    }

    public function test_register_creates_customer_who_can_log_in(): void
    {
        $this->spa()->postJson('/api/register', [
            'username' => 'tom', 'email' => 'tom@example.com', 'password' => 'pw12345', 'confirmPassword' => 'pw12345',
        ])->assertCreated()->assertJsonPath('Role', 'customer')->assertJsonMissingPath('PasswordHash');

        $this->spa()->postJson('/api/login', ['username' => 'tom', 'password' => 'pw12345'])->assertOk();
    }

    public function test_register_rejects_taken_username_or_email(): void
    {
        $base = ['password' => 'pw12345', 'confirmPassword' => 'pw12345'];
        $this->spa()->postJson('/api/register', $base + ['username' => 'jerry', 'email' => 'new@example.com'])->assertStatus(409);
        $this->spa()->postJson('/api/register', $base + ['username' => 'new', 'email' => 'jerry@example.com'])->assertStatus(409);
    }

    public function test_register_rejects_mismatched_passwords(): void
    {
        $this->spa()->postJson('/api/register', [
            'username' => 'tom', 'email' => 'tom@example.com', 'password' => 'a', 'confirmPassword' => 'b',
        ])->assertStatus(422)->assertJsonValidationErrors(['confirmPassword']);
    }
}
