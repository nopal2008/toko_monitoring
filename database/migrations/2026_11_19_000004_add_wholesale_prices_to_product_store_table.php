<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('product_store', function (Blueprint $table) {
            if (! Schema::hasColumn('product_store', 'wholesale_price')) {
                $table->decimal('wholesale_price', 15, 2)->nullable()->after('price');
            }

            if (! Schema::hasColumn('product_store', 'wholesale_min_qty')) {
                $table->unsignedInteger('wholesale_min_qty')->nullable()->after('wholesale_price');
            }
        });
    }

    public function down(): void
    {
        Schema::table('product_store', function (Blueprint $table) {
            if (Schema::hasColumn('product_store', 'wholesale_price')) {
                $table->dropColumn('wholesale_price');
            }

            if (Schema::hasColumn('product_store', 'wholesale_min_qty')) {
                $table->dropColumn('wholesale_min_qty');
            }
        });
    }
};
