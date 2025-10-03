<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\FormField;

class FormFieldSeeder extends Seeder
{
    public function run()
    {
        $defaultFields = [
            [
                'name' => 'name',
                'label' => 'Nama Lengkap',
                'type' => 'text',
                'is_required' => true,
                'is_active' => true,
                'placeholder' => 'Masukkan nama lengkap Anda',
                'description' => 'Nama sesuai KTP',
                'validation_rules_text' => 'min:3|max:100',
                'order' => 1,
            ],
            [
                'name' => 'nik',
                'label' => 'NIK (Nomor Induk Kependudukan)',
                'type' => 'text',
                'is_required' => true,
                'is_active' => true,
                'placeholder' => '16 digit NIK KTP',
                'description' => 'NIK harus unik, satu orang hanya bisa daftar sekali',
                'validation_rules_text' => 'digits:16|unique:customers,nik',
                'order' => 2,
            ],
            [
                'name' => 'email',
                'label' => 'Email',
                'type' => 'email',
                'is_required' => true,
                'is_active' => true,
                'placeholder' => 'contoh@email.com',
                'description' => 'Email akan digunakan untuk konfirmasi',
                'validation_rules_text' => 'email',
                'order' => 3,
            ],
            [
                'name' => 'phone',
                'label' => 'Nomor Telepon',
                'type' => 'tel',
                'is_required' => true,
                'is_active' => true,
                'placeholder' => '08xxxxxxxxxx',
                'description' => 'Nomor yang bisa dihubungi',
                'validation_rules_text' => 'min:10|max:15',
                'order' => 4,
            ],
            [
                'name' => 'gender',
                'label' => 'Jenis Kelamin',
                'type' => 'select',
                'is_required' => true,
                'is_active' => true,
                'placeholder' => 'Pilih jenis kelamin',
                'options' => ['Laki-laki', 'Perempuan'],
                'order' => 5,
            ],
            [
                'name' => 'birthdate',
                'label' => 'Tanggal Lahir',
                'type' => 'date',
                'is_required' => true,
                'is_active' => true,
                'description' => 'Untuk penentuan kategori umur',
                'order' => 6,
            ],
            [
                'name' => 'address',
                'label' => 'Alamat Lengkap',
                'type' => 'textarea',
                'is_required' => true,
                'is_active' => true,
                'placeholder' => 'Masukkan alamat lengkap',
                'description' => 'Alamat sesuai KTP',
                'validation_rules_text' => 'min:10|max:500',
                'order' => 7,
            ],
            [
                'name' => 'emergency_contact_name',
                'label' => 'Nama Kontak Darurat',
                'type' => 'text',
                'is_required' => true,
                'is_active' => true,
                'placeholder' => 'Nama kontak darurat',
                'description' => 'Kontak yang bisa dihubungi dalam keadaan darurat',
                'validation_rules_text' => 'min:3|max:100',
                'order' => 8,
            ],
            [
                'name' => 'emergency_contact_phone',
                'label' => 'Nomor Kontak Darurat',
                'type' => 'tel',
                'is_required' => true,
                'is_active' => true,
                'placeholder' => '08xxxxxxxxxx',
                'description' => 'Nomor telepon kontak darurat',
                'validation_rules_text' => 'min:10|max:15',
                'order' => 9,
            ],
            [
                'name' => 'medical_conditions',
                'label' => 'Kondisi Medis',
                'type' => 'textarea',
                'is_required' => false,
                'is_active' => true,
                'placeholder' => 'Sebutkan jika ada kondisi medis khusus (opsional)',
                'description' => 'Kondisi medis yang perlu diketahui panitia',
                'validation_rules_text' => 'max:500',
                'order' => 10,
            ],
            [
                'name' => 'shirt_size',
                'label' => 'Ukuran Kaos',
                'type' => 'select',
                'is_required' => true,
                'is_active' => true,
                'placeholder' => 'Pilih ukuran kaos',
                'options' => ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
                'order' => 11,
            ],
            [
                'name' => 'terms_accepted',
                'label' => 'Saya menyetujui syarat dan ketentuan yang berlaku',
                'type' => 'checkbox',
                'is_required' => true,
                'is_active' => true,
                'description' => 'Wajib disetujui untuk melanjutkan pendaftaran',
                'order' => 12,
            ],
        ];

        foreach ($defaultFields as $field) {
            FormField::updateOrCreate(
                ['name' => $field['name']],
                $field
            );
        }
    }
}