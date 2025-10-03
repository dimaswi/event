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
        Schema::table('orders', function (Blueprint $table) {
            $table->boolean('race_pack_collected')->default(false)->after('bib_number');
            $table->timestamp('race_pack_collected_at')->nullable()->after('race_pack_collected');
            $table->string('race_pack_collected_by')->nullable()->after('race_pack_collected_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['race_pack_collected', 'race_pack_collected_at', 'race_pack_collected_by']);
        });
    }
};
