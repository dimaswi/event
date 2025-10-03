<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "Status breakdown:\n";
$orders = App\Models\Order::selectRaw('status, count(*) as count')
    ->groupBy('status')
    ->get();

foreach ($orders as $order) {
    echo $order->status . ': ' . $order->count . "\n";
}

echo "\nDetail calculations:\n";
echo "Awaiting payment: " . App\Models\Order::where('status', 'awaiting_payment')->count() . "\n";
echo "Pending: " . App\Models\Order::where('status', 'pending')->count() . "\n";
echo "Paid: " . App\Models\Order::where('status', 'paid')->count() . "\n";
echo "Cancelled: " . App\Models\Order::where('status', 'cancelled')->count() . "\n";
echo "Expired: " . App\Models\Order::where('status', 'expired')->count() . "\n";
echo "Denied: " . App\Models\Order::where('status', 'denied')->count() . "\n";
echo "Challenge: " . App\Models\Order::where('status', 'challenge')->count() . "\n";
