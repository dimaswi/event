<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\EventSetting;

class EventSettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            // Event Information
            [
                'key' => 'event_name',
                'value' => 'Fun Run Event 2025',
                'type' => 'text',
                'group' => 'event',
                'label' => 'Nama Event',
                'description' => 'Nama lengkap event yang akan ditampilkan',
                'sort_order' => 1
            ],
            [
                'key' => 'event_subtitle',
                'value' => 'Jakarta Marathon Series',
                'type' => 'text',
                'group' => 'event',
                'label' => 'Subtitle Event',
                'description' => 'Subtitle atau deskripsi singkat event',
                'sort_order' => 2
            ],
            [
                'key' => 'event_description',
                'value' => 'Bergabunglah dalam acara lari yang menyenangkan! Nikmati pengalaman lari bersama ribuan peserta lainnya di lingkungan yang indah dan energik.',
                'type' => 'textarea',
                'group' => 'event',
                'label' => 'Deskripsi Event',
                'description' => 'Deskripsi lengkap tentang event',
                'sort_order' => 3
            ],
            [
                'key' => 'event_location',
                'value' => 'Monas, Jakarta Pusat',
                'type' => 'text',
                'group' => 'event',
                'label' => 'Lokasi Event',
                'description' => 'Lokasi lengkap penyelenggaraan event',
                'sort_order' => 4
            ],
            [
                'key' => 'event_date',
                'value' => '2025-09-15',
                'type' => 'date',
                'group' => 'event',
                'label' => 'Tanggal Event',
                'description' => 'Tanggal penyelenggaraan event',
                'sort_order' => 5
            ],
            [
                'key' => 'event_time',
                'value' => '06:00 - 10:00 WIB',
                'type' => 'text',
                'group' => 'event',
                'label' => 'Waktu Event',
                'description' => 'Waktu penyelenggaraan event',
                'sort_order' => 6
            ],
            [
                'key' => 'event_hero_image',
                'value' => '/images/hero-bg.jpg',
                'type' => 'image',
                'group' => 'event',
                'label' => 'Gambar Hero Event',
                'description' => 'Gambar background untuk hero section',
                'sort_order' => 7
            ],
            [
                'key' => 'event_logo',
                'value' => '/logo.svg',
                'type' => 'image',
                'group' => 'event',
                'label' => 'Logo Event',
                'description' => 'Logo utama event',
                'sort_order' => 8
            ],
            [
                'key' => 'size_chart',
                'value' => '',
                'type' => 'image',
                'group' => 'event',
                'label' => 'Panduan Ukuran Kaos',
                'description' => 'Gambar panduan ukuran kaos untuk peserta',
                'sort_order' => 9
            ],
            
            // Contact Information
            [
                'key' => 'contact_email',
                'value' => 'info@funrunevent.com',
                'type' => 'email',
                'group' => 'contact',
                'label' => 'Email Kontak',
                'description' => 'Email untuk kontak dan informasi',
                'sort_order' => 1
            ],
            [
                'key' => 'contact_phone',
                'value' => '0812-3456-7890',
                'type' => 'text',
                'group' => 'contact',
                'label' => 'Nomor Telepon',
                'description' => 'Nomor telepon untuk kontak',
                'sort_order' => 2
            ],
            [
                'key' => 'organizer_name',
                'value' => 'PT. Sport Event Indonesia',
                'type' => 'text',
                'group' => 'contact',
                'label' => 'Nama Penyelenggara',
                'description' => 'Nama lengkap penyelenggara event',
                'sort_order' => 3
            ],

            // Footer Information
            [
                'key' => 'footer_description',
                'value' => 'Acara lari terbesar di Jakarta yang menghadirkan pengalaman lari yang menyenangkan, sehat, dan berkesan untuk seluruh keluarga.',
                'type' => 'textarea',
                'group' => 'footer',
                'label' => 'Deskripsi Footer',
                'description' => 'Deskripsi yang ditampilkan di footer',
                'sort_order' => 1
            ],

            // Sponsors
            [
                'key' => 'sponsor_title',
                'value' => 'Didukung Oleh',
                'type' => 'text',
                'group' => 'sponsor',
                'label' => 'Judul Sponsor',
                'description' => 'Judul section sponsor',
                'sort_order' => 1
            ],
            [
                'key' => 'sponsor_subtitle',
                'value' => 'Partner dan sponsor yang mendukung acara Fun Run Event 2025',
                'type' => 'text',
                'group' => 'sponsor',
                'label' => 'Subtitle Sponsor',
                'description' => 'Subtitle section sponsor',
                'sort_order' => 2
            ],
            
            // Individual Sponsors with images
            [
                'key' => 'sponsor_1_name',
                'value' => 'Bank Mandiri',
                'type' => 'text',
                'group' => 'sponsors',
                'label' => 'Sponsor 1 - Nama',
                'description' => 'Nama sponsor utama 1',
                'sort_order' => 1
            ],
            [
                'key' => 'sponsor_1_type',
                'value' => 'SPONSOR UTAMA',
                'type' => 'text',
                'group' => 'sponsors',
                'label' => 'Sponsor 1 - Tipe',
                'description' => 'Tipe sponsor (SPONSOR UTAMA, OFFICIAL PARTNER, dll)',
                'sort_order' => 2
            ],
            [
                'key' => 'sponsor_1_logo',
                'value' => '/images/sponsors/mandiri.png',
                'type' => 'image',
                'group' => 'sponsors',
                'label' => 'Sponsor 1 - Logo',
                'description' => 'Logo sponsor 1',
                'sort_order' => 3
            ],
            [
                'key' => 'sponsor_2_name',
                'value' => 'Adidas Indonesia',
                'type' => 'text',
                'group' => 'sponsors',
                'label' => 'Sponsor 2 - Nama',
                'description' => 'Nama sponsor 2',
                'sort_order' => 4
            ],
            [
                'key' => 'sponsor_2_type',
                'value' => 'OFFICIAL PARTNER',
                'type' => 'text',
                'group' => 'sponsors',
                'label' => 'Sponsor 2 - Tipe',
                'description' => 'Tipe sponsor 2',
                'sort_order' => 5
            ],
            [
                'key' => 'sponsor_2_logo',
                'value' => '/images/sponsors/adidas.png',
                'type' => 'image',
                'group' => 'sponsors',
                'label' => 'Sponsor 2 - Logo',
                'description' => 'Logo sponsor 2',
                'sort_order' => 6
            ],
            [
                'key' => 'sponsor_3_name',
                'value' => 'Kompas TV',
                'type' => 'text',
                'group' => 'sponsors',
                'label' => 'Sponsor 3 - Nama',
                'description' => 'Nama sponsor 3',
                'sort_order' => 7
            ],
            [
                'key' => 'sponsor_3_type',
                'value' => 'MEDIA PARTNER',
                'type' => 'text',
                'group' => 'sponsors',
                'label' => 'Sponsor 3 - Tipe',
                'description' => 'Tipe sponsor 3',
                'sort_order' => 8
            ],
            [
                'key' => 'sponsor_3_logo',
                'value' => '/images/sponsors/kompas.png',
                'type' => 'image',
                'group' => 'sponsors',
                'label' => 'Sponsor 3 - Logo',
                'description' => 'Logo sponsor 3',
                'sort_order' => 9
            ]
        ];

        foreach ($settings as $setting) {
            EventSetting::updateOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }
    }
}
