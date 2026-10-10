<?php

namespace Tests\Concerns;

use App\Models\Account;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use RuntimeException;

/**
 * Database setup for back-office tests, picked by the connection driver:
 *
 * - sqlite (default, CI): the Supabase tables have no migrations, so create them in the in-memory DB.
 * - pgsql (real Supabase, opt-in with SUPABASE_TESTS=1): never migrate. Open a transaction, empty the
 *   tables inside it so each test sees a clean slate, and roll everything back when the test ends.
 */
trait BackOfficeSchema
{
    private const TABLES = ['orders', 'highlights', 'games', 'category_settings', 'Account'];

    protected function setUpBackOfficeSchema(): void
    {
        if (DB::connection()->getDriverName() !== 'pgsql') {
            $this->createSchema();

            return;
        }

        if (! env('SUPABASE_TESTS')) {
            throw new RuntimeException('Refusing to touch a Postgres database without SUPABASE_TESTS=1.');
        }

        DB::beginTransaction();
        $this->beforeApplicationDestroyed(function () {
            while (DB::transactionLevel() > 0) {
                DB::rollBack();
            }
            DB::disconnect(); // the Supabase session pooler allows only a few clients
        });

        foreach (self::TABLES as $table) {
            DB::table($table)->delete(); // rolled back with the transaction
        }
    }

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
