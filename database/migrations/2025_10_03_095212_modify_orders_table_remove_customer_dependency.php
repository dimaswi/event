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
            // Tambahkan kolom form_data untuk menyimpan data dinamis
            $table->json('form_data')->nullable()->after('bib_number');
            
            // Ubah customer_id menjadi nullable karena tidak akan digunakan
            $table->unsignedBigInteger('customer_id')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn('form_data');
            $table->unsignedBigInteger('customer_id')->nullable(false)->change();
        });
    }
};
