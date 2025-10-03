<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Models\Order;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('api')->group(function () {
    // Mark order as paid (dari frontend callback)
    Route::post('/orders/{orderNumber}/mark-paid', function (Request $request, $orderNumber) {
        try {
            $order = Order::where('order_number', $orderNumber)->first();
            
            if (!$order) {
                return response()->json(['error' => 'Order not found'], 404);
            }

            if ($order->status === 'paid') {
                return response()->json(['message' => 'Order already paid'], 200);
            }

            // Mark as paid
            $paymentType = $request->input('payment_type', 'snap');
            $transactionId = $request->input('transaction_id', 'snap-' . time());
            
            $order->markAsPaid($paymentType, $transactionId);

            return response()->json([
                'success' => true,
                'message' => 'Order marked as paid',
                'order' => $order->fresh()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to update order status: ' . $e->getMessage()
            ], 500);
        }
    });
});
