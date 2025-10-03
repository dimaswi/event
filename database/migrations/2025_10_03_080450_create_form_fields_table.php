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
        Schema::create('form_fields', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // nama field seperti 'full_name', 'email'
            $table->string('label'); // label yang ditampilkan ke user
            $table->enum('type', ['text', 'email', 'tel', 'textarea', 'select', 'radio', 'checkbox', 'date', 'file']); // tipe input
            $table->json('options')->nullable(); // untuk select, radio, checkbox options
            $table->text('placeholder')->nullable();
            $table->text('help_text')->nullable();
            $table->boolean('is_required')->default(false);
            $table->integer('order')->default(0); // urutan tampil
            $table->boolean('is_active')->default(true);
            $table->json('validation_rules')->nullable(); // rules validasi tambahan
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('form_fields');
    }
};
