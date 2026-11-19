<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('pos_holds')) {
            return;
        }

        Schema::create('pos_holds', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('store_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('label');
            $table->json('payload');
            $table->timestamps();

            $table->index(['tenant_id', 'store_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pos_holds');
    }
};
