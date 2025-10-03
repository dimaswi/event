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
        Schema::table('customers', function (Blueprint $table) {
            $table->string('nik', 16)->nullable()->after('email'); // NIK (16 digit)
            $table->string('ktp_image')->nullable()->after('nik'); // Upload foto KTP
            $table->enum('id_type', ['ktp', 'sim', 'passport'])->default('ktp')->after('ktp_image'); // Jenis identitas
            $table->string('place_of_birth')->nullable()->after('birth_date'); // Tempat lahir
            $table->text('full_address')->nullable()->after('address'); // Alamat lengkap
            $table->string('province')->nullable()->after('full_address'); // Provinsi
            $table->string('city')->nullable()->after('province'); // Kota/Kabupaten
            $table->string('district')->nullable()->after('city'); // Kecamatan
            $table->string('postal_code', 5)->nullable()->after('district'); // Kode pos
            $table->enum('blood_type', ['A', 'B', 'AB', 'O'])->nullable()->after('gender'); // Golongan darah
            $table->enum('shirt_size', ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'])->nullable()->after('blood_type'); // Ukuran baju
            $table->text('medical_conditions')->nullable()->after('shirt_size'); // Kondisi medis
            $table->text('allergies')->nullable()->after('medical_conditions'); // Alergi
            $table->boolean('has_insurance')->default(false)->after('allergies'); // Punya asuransi
            $table->string('insurance_name')->nullable()->after('has_insurance'); // Nama asuransi
            $table->string('insurance_number')->nullable()->after('insurance_name'); // Nomor asuransi
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->dropColumn([
                'nik',
                'ktp_image',
                'id_type',
                'place_of_birth',
                'full_address',
                'province',
                'city',
                'district',
                'postal_code',
                'blood_type',
                'shirt_size',
                'medical_conditions',
                'allergies',
                'has_insurance',
                'insurance_name',
                'insurance_number'
            ]);
        });
    }
};
