<?php

namespace Database\Seeders;

use App\Models\Ticket;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TicketSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tickets = [
            [
                'name' => 'Fun Run 5K',
                'description' => 'Kategori lari jarak 5 kilometer untuk pemula dan keluarga. Cocok untuk yang baru mulai mencoba olahraga lari. Dapatkan medal finisher dan goodie bag menarik!',
                'price' => 150000,
                'stock' => 500,
                'sold' => 0,
                'is_active' => true,
                'sale_start_date' => now()->subDays(7),
                'sale_end_date' => now()->addDays(30),
            ],
            [
                'name' => 'Fun Run 10K',
                'description' => 'Kategori lari jarak 10 kilometer untuk pelari menengah. Tantangan yang menyenangkan dengan rute yang indah. Termasuk running jersey, medal, dan sertifikat.',
                'price' => 200000,
                'stock' => 300,
                'sold' => 0,
                'is_active' => true,
                'sale_start_date' => now()->subDays(7),
                'sale_end_date' => now()->addDays(30),
            ],
            [
                'name' => 'Half Marathon 21K',
                'description' => 'Kategori half marathon untuk pelari serius. Jarak 21 kilometer dengan rute menantang. Bonus finisher medal eksklusif, running gear berkualitas, dan sertifikat resmi.',
                'price' => 350000,
                'stock' => 200,
                'sold' => 0,
                'is_active' => true,
                'sale_start_date' => now()->subDays(7),
                'sale_end_date' => now()->addDays(30),
            ],
            [
                'name' => 'Kids Run 1K',
                'description' => 'Kategori khusus untuk anak-anak usia 5-12 tahun. Jarak 1 kilometer dengan rute aman dan menyenangkan. Termasuk medal anak, goodie bag, dan snack sehat.',
                'price' => 75000,
                'stock' => 100,
                'sold' => 0,
                'is_active' => true,
                'sale_start_date' => now()->subDays(7),
                'sale_end_date' => now()->addDays(30),
            ],
            [
                'name' => 'Virtual Run',
                'description' => 'Untuk yang tidak bisa hadir di lokasi, ikuti virtual run dari mana saja! Lari sesuai jarak yang dipilih dan upload bukti di aplikasi. Medal akan dikirim ke alamat Anda.',
                'price' => 100000,
                'stock' => 1000,
                'sold' => 0,
                'is_active' => true,
                'sale_start_date' => now()->subDays(7),
                'sale_end_date' => now()->addDays(60),
            ],
        ];

        foreach ($tickets as $ticket) {
            Ticket::create($ticket);
        }
    }
}
