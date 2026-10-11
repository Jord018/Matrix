<?php

namespace Tests\Unit;

use App\Models\CategorySetting;
use Tests\Concerns\BackOfficeSchema;
use Tests\TestCase;

class CategorySettingTest extends TestCase
{
    use BackOfficeSchema;

    protected function setUp(): void
    {
        parent::setUp();
    }

    public function test_model_configuration(): void
    {
        $setting = new CategorySetting;

        $this->assertSame('category_settings', $setting->getTable());
        $this->assertSame('id', $setting->getKeyName());
        $this->assertSame('string', $setting->getKeyType());
        $this->assertFalse($setting->getIncrementing());
        $this->assertFalse($setting->timestamps);

        $expectedFillable = ['id', 'name', 'isVisible'];
        $this->assertSame($expectedFillable, $setting->getFillable());
    }

    public function test_create_and_boolean_cast(): void
    {
        $visible = CategorySetting::create([
            'name' => 'Strategy',
            'isVisible' => true,
        ]);

        $this->assertNotEmpty($visible->id);
        $this->assertSame('Strategy', $visible->name);
        $this->assertTrue($visible->isVisible);

        $hidden = CategorySetting::create([
            'name' => 'Unpublished',
            'isVisible' => false,
        ]);

        $this->assertFalse($hidden->isVisible);

        // Test cast with integer 1 and 0
        $fromInt = CategorySetting::create([
            'name' => 'Puzzle',
            'isVisible' => 1,
        ]);
        $this->assertTrue($fromInt->isVisible);

        $fromZero = CategorySetting::create([
            'name' => 'Beta',
            'isVisible' => 0,
        ]);
        $this->assertFalse($fromZero->isVisible);
    }

    public function test_custom_legacy_string_id(): void
    {
        $legacyId = '69b7fba7cbfe780b4c63c7d1';
        $category = CategorySetting::create([
            'id' => $legacyId,
            'name' => 'Simulation',
            'isVisible' => true,
        ]);

        $this->assertSame($legacyId, $category->id);
        $found = CategorySetting::find($legacyId);
        $this->assertNotNull($found);
        $this->assertSame($legacyId, $found->id);
    }

    public function test_category_setting_crud_operations(): void
    {
        $created = CategorySetting::create([
            'name' => 'Action RPG',
            'isVisible' => true,
        ]);

        $this->assertInstanceOf(CategorySetting::class, $created);
        $this->assertSame('Action RPG', $created->name);
        $this->assertTrue($created->isVisible);

        $found = CategorySetting::where('name', 'Action RPG')->first();
        $this->assertNotNull($found);
        $this->assertSame($created->id, $found->id);

        $found->update(['isVisible' => false]);
        $this->assertFalse($found->fresh()->isVisible);
    }
}
