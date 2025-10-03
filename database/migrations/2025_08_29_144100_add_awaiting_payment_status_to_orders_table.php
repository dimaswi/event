<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Drop the existing check constraint
        DB::statement("ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check");
        
        // Change column to varchar without enum constraint
        DB::statement("ALTER TABLE orders ALTER COLUMN status TYPE VARCHAR(255)");
        
        // Add new check constraint with all status values
        DB::statement("ALTER TABLE orders ADD CONSTRAINT orders_status_check CHECK (status IN ('awaiting_payment', 'pending', 'paid', 'cancelled', 'expired', 'denied', 'challenge'))");
        
        // Set default value
        DB::statement("ALTER TABLE orders ALTER COLUMN status SET DEFAULT 'awaiting_payment'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop the current check constraint
        DB::statement("ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check");
        
        // Add back original check constraint
        DB::statement("ALTER TABLE orders ADD CONSTRAINT orders_status_check CHECK (status IN ('pending', 'paid', 'cancelled', 'expired'))");
        
        // Set default value back
        DB::statement("ALTER TABLE orders ALTER COLUMN status SET DEFAULT 'pending'");
    }
};
