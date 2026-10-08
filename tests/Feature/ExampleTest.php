<?php

namespace Tests\Feature;

use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_home_renders_inertia_page(): void
    {
        $this->get('/')->assertOk()->assertInertia(fn (Assert $page) => $page->component('Home'));
    }
}
