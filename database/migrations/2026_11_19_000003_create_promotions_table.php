<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('promotions')) {
            return;
        }

        Schema::create('promotions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('store_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('type', 20);
            $table->decimal('value', 15, 2)->default(0);
            $table->unsignedInteger('buy_quantity')->nullable();
            $table->unsignedInteger('free_quantity')->nullable();
            $table->decimal('min_purchase', 15, 2)->default(0);
            $table->dateTime('starts_at')->nullable();
            $table->dateTime('ends_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['tenant_id', 'is_active', 'starts_at', 'ends_at']);
            $table->index(['tenant_id', 'store_id', 'product_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('promotions');
    }
};
