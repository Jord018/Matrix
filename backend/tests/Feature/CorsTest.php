<?php

namespace Tests\Feature;

use Tests\TestCase;

class CorsTest extends TestCase
{
    public function test_cors_headers_on_allowed_origin(): void
    {
        $response = $this->withHeaders([
            'Origin' => 'http://localhost:5173',
        ])->getJson('/api/health');

        $response->assertOk();
        $response->assertHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
        $response->assertHeader('Access-Control-Allow-Credentials', 'true');
    }

    public function test_cors_preflight_on_allowed_origin(): void
    {
        $response = $this->withHeaders([
            'Origin' => 'http://localhost:5174',
            'Access-Control-Request-Method' => 'GET',
            'Access-Control-Request-Headers' => 'X-Requested-With, Content-Type',
        ])->optionsJson('/api/health');

        $response->assertNoContent();
        $response->assertHeader('Access-Control-Allow-Origin', 'http://localhost:5174');
        $response->assertHeader('Access-Control-Allow-Credentials', 'true');
    }
}
