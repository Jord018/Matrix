<?php

namespace Tests\Feature;

use App\Models\Account;
use Illuminate\Support\Facades\Hash;
use Tests\Concerns\BackOfficeSchema;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use BackOfficeSchema;

    protected function setUp(): void
    {
        parent::setUp();

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
}
