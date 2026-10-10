<?php

namespace Tests\Concerns;

use App\Models\Account;
use Illuminate\Support\Facades\Schema;

/**
 * Creates the existing Supabase tables (which have no migrations) in the sqlite test DB.
 */
trait BackOfficeSchema
{
    protected function createSchema(): void
    {
        Schema::create('Account', function ($t) {
            $t->uuid('id')->primary();
            $t->string('Username');
            $t->string('Email');
            $t->string('PasswordHash');
            $t->string('Role')->default('customer');
            $t->timestamp('createdAt')->nullable();
        });
        Schema::create('games', function ($t) {
            $t->uuid('id')->primary();
            $t->string('name');
            $t->text('description')->nullable();
            $t->text('coverImage')->nullable();
            $t->text('screenshots')->nullable();
            $t->text('categories')->nullable();
            $t->decimal('price')->nullable();
            $t->integer('stock')->default(0);
            $t->decimal('rating')->nullable();
            $t->bigInteger('igdbId')->nullable();
            $t->json('systemRequirements')->nullable();
        });
        Schema::create('category_settings', function ($t) {
            $t->uuid('id')->primary();
            $t->string('name');
            $t->boolean('isVisible')->default(true);
        });
        Schema::create('highlights', function ($t) {
            $t->uuid('id')->primary();
            $t->string('gameId')->nullable();
            $t->string('name')->nullable();
            $t->text('customImage')->nullable();
            $t->string('buttonColor')->nullable();
        });
        Schema::create('orders', function ($t) {
            $t->uuid('id')->primary();
            $t->string('userId')->nullable();
            $t->string('username')->nullable();
            $t->json('items')->nullable();
            $t->timestamp('purchaseDate')->nullable();
            $t->string('status')->nullable();
        });
    }

    protected function actAs(string $role = 'admin'): Account
    {
        $account = Account::create([
            'Username' => $role, 'Email' => "$role@x.com", 'PasswordHash' => 'x', 'Role' => $role,
        ]);
        $this->actingAs($account, 'sanctum');

        return $account;
    }
}
