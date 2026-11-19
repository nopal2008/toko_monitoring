<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * The production schema was provisioned from a SQL dump, so these tables
     * are guarded to keep fresh test databases and existing installs aligned.
     */
    public function up(): void
    {
        if (! Schema::hasTable('cashier_shifts')) {
            Schema::create('cashier_shifts', function (Blueprint $table) {
                $table->id();
                $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
                $table->foreignId('store_id')->constrained()->cascadeOnDelete();
                $table->foreignId('user_id')->constrained()->cascadeOnDelete();
                $table->dateTime('opened_at');
                $table->dateTime('closed_at')->nullable();
                $table->decimal('opening_cash', 15, 2)->default(0);
                $table->decimal('closing_cash', 15, 2)->nullable();
                $table->decimal('expected_cash', 15, 2)->nullable();
                $table->decimal('cash_difference', 15, 2)->nullable();
                $table->string('status', 20)->default('open');
                $table->text('notes')->nullable();
                $table->timestamps();

                $table->index(['tenant_id', 'store_id', 'user_id', 'status']);
            });
        }

        if (! Schema::hasTable('transactions')) {
            Schema::create('transactions', function (Blueprint $table) {
                $table->id();
                $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
                $table->foreignId('store_id')->constrained()->cascadeOnDelete();
                $table->foreignId('cashier_shift_id')->nullable()->constrained('cashier_shifts')->nullOnDelete();
                $table->string('invoice_number', 50);
                $table->foreignId('user_id')->constrained()->cascadeOnDelete();
                $table->decimal('subtotal_amount', 15, 2)->default(0);
                $table->decimal('discount_amount', 15, 2)->default(0);
                $table->decimal('tax_amount', 15, 2)->default(0);
                $table->decimal('total_amount', 15, 2)->default(0);
                $table->decimal('paid_amount', 15, 2)->default(0);
                $table->decimal('change_amount', 15, 2)->default(0);
                $table->string('payment_method', 30)->default('cash');
                $table->string('status', 20)->default('completed');
                $table->text('notes')->nullable();
                $table->dateTime('completed_at')->nullable();
                $table->dateTime('cancelled_at')->nullable();
                $table->foreignId('cancelled_by')->nullable()->constrained('users')->nullOnDelete();
                $table->text('cancel_reason')->nullable();
                $table->timestamps();

                $table->unique(['tenant_id', 'invoice_number']);
                $table->index(['tenant_id', 'store_id', 'created_at']);
                $table->index(['tenant_id', 'user_id', 'created_at']);
            });
        }

        if (! Schema::hasTable('transaction_items')) {
            Schema::create('transaction_items', function (Blueprint $table) {
                $table->id();
                $table->foreignId('transaction_id')->constrained()->cascadeOnDelete();
                $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete();
                $table->string('product_name');
                $table->string('product_sku', 100)->nullable();
                $table->integer('quantity');
                $table->decimal('price', 15, 2);
                $table->decimal('cost_price', 15, 2)->default(0);
                $table->decimal('discount_amount', 15, 2)->default(0);
                $table->decimal('subtotal', 15, 2);
            });
        }

        if (! Schema::hasTable('transaction_payments')) {
            Schema::create('transaction_payments', function (Blueprint $table) {
                $table->id();
                $table->foreignId('transaction_id')->constrained()->cascadeOnDelete();
                $table->string('method', 30);
                $table->decimal('amount', 15, 2);
                $table->string('reference_number', 100)->nullable();
                $table->dateTime('paid_at')->nullable();
            });
        }

        if (! Schema::hasTable('stock_movements')) {
            Schema::create('stock_movements', function (Blueprint $table) {
                $table->id();
                $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
                $table->foreignId('store_id')->constrained()->cascadeOnDelete();
                $table->foreignId('product_id')->constrained()->cascadeOnDelete();
                $table->string('type', 20);
                $table->integer('quantity');
                $table->integer('quantity_before')->default(0);
                $table->integer('quantity_after')->default(0);
                $table->decimal('unit_cost', 15, 2)->nullable();
                $table->string('reference_type', 50)->nullable();
                $table->unsignedBigInteger('reference_id')->nullable();
                $table->text('notes')->nullable();
                $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
                $table->dateTime('created_at')->nullable();

                $table->index(['tenant_id', 'store_id', 'product_id', 'created_at']);
                $table->index(['reference_type', 'reference_id']);
            });
        }

        if (! Schema::hasTable('notifications')) {
            Schema::create('notifications', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
                $table->string('type');
                $table->morphs('notifiable');
                $table->text('data');
                $table->dateTime('read_at')->nullable();
                $table->timestamps();

                $table->index(['tenant_id', 'notifiable_id', 'read_at']);
            });
        }

        if (! Schema::hasTable('notification_preferences')) {
            Schema::create('notification_preferences', function (Blueprint $table) {
                $table->id();
                $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
                $table->foreignId('user_id')->constrained()->cascadeOnDelete();
                $table->string('event_key', 60);
                $table->boolean('in_app')->default(true);
                $table->boolean('email')->default(false);
                $table->boolean('whatsapp')->default(false);
                $table->timestamps();

                $table->unique(['user_id', 'event_key']);
            });
        }
    }

    public function down(): void
    {
        // These tables may pre-date the migration in existing installations.
    }
};
