<?php
require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$tickets = \App\Models\Ticket::all();

echo "Total tickets: " . $tickets->count() . "\n";
foreach ($tickets as $ticket) {
    echo "ID: {$ticket->id}\n";
    echo "Name: {$ticket->name}\n";
    echo "Active: " . ($ticket->is_active ? 'Yes' : 'No') . "\n";
    echo "Stock: {$ticket->stock}\n";
    echo "Sold: {$ticket->sold}\n";
    echo "Available: " . ($ticket->stock - $ticket->sold) . "\n";
    echo "Sale Start: " . ($ticket->sale_start_date ?? 'No limit') . "\n";
    echo "Sale End: " . ($ticket->sale_end_date ?? 'No limit') . "\n";
    echo "Is Free: " . ($ticket->is_free ?? 'NULL') . "\n";
    echo "---\n";
}

// Check query used in controller
$availableTickets = \App\Models\Ticket::where('is_active', true)
    ->where(function ($query) {
        $query->whereNull('sale_start_date')
              ->orWhere('sale_start_date', '<=', now());
    })
    ->where(function ($query) {
        $query->whereNull('sale_end_date')
              ->orWhere('sale_end_date', '>=', now());
    })
    ->whereRaw('stock > sold')
    ->orderBy('created_at', 'desc')
    ->get();

echo "\nAvailable tickets from controller query: " . $availableTickets->count() . "\n";
foreach ($availableTickets as $ticket) {
    echo "- {$ticket->name} (Stock: {$ticket->stock}, Sold: {$ticket->sold})\n";
}