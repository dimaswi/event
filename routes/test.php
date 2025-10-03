<?php

use Illuminate\Support\Facades\Route;
use App\Services\MidtransService;

Route::get('/test-midtrans', function () {
    try {
        // Test configuration
        $serverKey = config('midtrans.server_key');
        $clientKey = config('midtrans.client_key');
        $isProduction = config('midtrans.is_production');
        
        return response()->json([
            'server_key_exists' => !empty($serverKey),
            'server_key_preview' => $serverKey ? substr($serverKey, 0, 10) . '...' : 'Not set',
            'client_key_exists' => !empty($clientKey),
            'client_key_preview' => $clientKey ? substr($clientKey, 0, 10) . '...' : 'Not set',
            'is_production' => $isProduction,
            'config_path' => config_path('midtrans.php'),
            'env_values' => [
                'MIDTRANS_SERVER_KEY' => env('MIDTRANS_SERVER_KEY') ? 'Set' : 'Not set',
                'MIDTRANS_CLIENT_KEY' => env('MIDTRANS_CLIENT_KEY') ? 'Set' : 'Not set',
                'VITE_MIDTRANS_CLIENT_KEY' => env('VITE_MIDTRANS_CLIENT_KEY') ? 'Set' : 'Not set',
            ]
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'error' => $e->getMessage()
        ], 500);
    }
})->name('test.midtrans');

// Route untuk simulasi pembayaran berhasil
Route::get('/simulate-payment-success/{orderNumber}', function ($orderNumber) {
    $order = \App\Models\Order::where('order_number', $orderNumber)->first();
    
    if (!$order) {
        return response()->json(['error' => 'Order not found'], 404);
    }
    
    // Simulasi pembayaran berhasil
    $order->markAsPaid('simulation', 'SIM-' . time());
    
    return response()->json([
        'success' => true,
        'message' => 'Payment simulation successful',
        'order' => $order->fresh()
    ]);
})->name('test.simulate-payment-success');
