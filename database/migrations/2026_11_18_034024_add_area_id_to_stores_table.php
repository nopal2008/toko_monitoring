<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('stores', function (Blueprint $table) {
            $table->foreignId('area_id')->nullable()->after('tenant_id')->constrained()->nullOnDelete();
            $table->index(['area_id', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::table('stores', function (Blueprint $table) {
            $table->dropForeign(['area_id']);
            $table->dropIndex(['area_id', 'is_active']);
            $table->dropColumn('area_id');
        });
    }
};
