<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DemoDatabaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (app()->isProduction()) {
            throw new \RuntimeException('Demo data may only be seeded outside production.');
        }

        $this->call([
            RolePermissionSeeder::class,
            RoleLoginSeeder::class,
            DemoOperationalDataSeeder::class,
        ]);
    }
}
