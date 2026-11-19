<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('settings')) {
            return;
        }

        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->string('setting_group', 50)->default('general');
            $table->string('setting_key', 100);
            $table->json('value')->nullable();
            $table->timestamps();

            $table->unique(['tenant_id', 'setting_group', 'setting_key']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
