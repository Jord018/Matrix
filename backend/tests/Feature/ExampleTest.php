<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_health_endpoint(): void
    {
        $this->getJson('/api/health')->assertOk()->assertExactJson(['status' => 'ok']);
    }

    public function test_user_endpoint_requires_auth(): void
    {
        $this->getJson('/api/user')->assertUnauthorized();
    }
}
