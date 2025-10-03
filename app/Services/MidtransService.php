<?php

namespace App\Services;

use Midtrans\Config;
use Midtrans\Snap;
use App\Models\Order;
use App\Models\Customer;
use App\Models\Ticket;
use Illuminate\Support\Facades\Log;

class MidtransService
{
    public function __construct()
    {
        // Set Midtrans configuration
        Config::$serverKey = config('midtrans.server_key');
        Config::$isProduction = config('midtrans.is_production');
        Config::$isSanitized = config('midtrans.is_sanitized');
        Config::$is3ds = config('midtrans.is_3ds');

        // Debug configuration
        Log::info('Midtrans Config:', [
            'server_key' => substr(config('midtrans.server_key'), 0, 10) . '...',
            'is_production' => config('midtrans.is_production'),
            'is_sanitized' => config('midtrans.is_sanitized'),
            'is_3ds' => config('midtrans.is_3ds')
        ]);
    }

    public function createSnapToken(Order $order)
    {
        // Validate configuration
        if (empty(config('midtrans.server_key'))) {
            throw new \Exception('Midtrans server key not configured');
        }

        $params = [
            'transaction_details' => [
                'order_id' => $order->order_number,
                'gross_amount' => (int) $order->total_price,
            ],
            'customer_details' => [
                'first_name' => $order->customer->name,
                'email' => $order->customer->email,
                'phone' => $order->customer->phone,
                'billing_address' => [
                    'first_name' => $order->customer->name,
                    'email' => $order->customer->email,
                    'phone' => $order->customer->phone,
                    'address' => $order->customer->full_address,
                    'city' => $order->customer->city,
                    'postal_code' => $order->customer->postal_code,
                    'country_code' => 'IDN'
                ]
            ],
            'item_details' => [
                [
                    'id' => $order->ticket->id,
                    'price' => (int) $order->unit_price,
                    'quantity' => $order->quantity,
                    'name' => $order->ticket->name,
                    'category' => 'Fun Run Ticket'
                ]
            ],
            'callbacks' => [
                'finish' => route('public.payment.finish'),
                'unfinish' => route('public.payment.unfinish'),
                'error' => route('public.payment.error'),
            ]
        ];

        Log::info('Creating Midtrans snap token with params:', $params);

        try {
            $snapToken = Snap::getSnapToken($params);
            Log::info('Snap token created successfully');
            return $snapToken;
        } catch (\Exception $e) {
            Log::error('Midtrans snap token creation failed:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw new \Exception('Error creating Snap token: ' . $e->getMessage());
        }
    }

    public function createSnapTokenWithData(array $orderData)
    {
        // Validate configuration
        if (empty(config('midtrans.server_key'))) {
            throw new \Exception('Midtrans server key not configured');
        }

        $params = [
            'transaction_details' => [
                'order_id' => $orderData['order_number'],
                'gross_amount' => (int) $orderData['total_price'],
            ],
            'customer_details' => [
                'first_name' => $orderData['customer']->name,
                'email' => $orderData['customer']->email,
                'phone' => $orderData['customer']->phone,
                'billing_address' => [
                    'first_name' => $orderData['customer']->name,
                    'email' => $orderData['customer']->email,
                    'phone' => $orderData['customer']->phone,
                    'address' => $orderData['customer']->full_address,
                    'city' => $orderData['customer']->city,
                    'postal_code' => $orderData['customer']->postal_code,
                    'country_code' => 'IDN'
                ]
            ],
            'item_details' => [
                [
                    'id' => $orderData['ticket']->id,
                    'price' => (int) $orderData['unit_price'],
                    'quantity' => $orderData['quantity'],
                    'name' => $orderData['ticket']->name,
                    'category' => 'Fun Run Ticket'
                ]
            ],
            'callbacks' => [
                'finish' => route('public.payment.finish'),
                'unfinish' => route('public.payment.unfinish'),
                'error' => route('public.payment.error'),
            ]
        ];

        Log::info('Creating Midtrans snap token with temporary data:', $params);

        try {
            $snapToken = Snap::getSnapToken($params);
            Log::info('Snap token created successfully for temporary order');
            return $snapToken;
        } catch (\Exception $e) {
            Log::error('Midtrans snap token creation failed:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw new \Exception('Error creating Snap token: ' . $e->getMessage());
        }
    }

    public function checkTransactionStatus($orderNumber)
    {
        try {
            $status = \Midtrans\Transaction::status($orderNumber);
            Log::info('Transaction status check:', [
                'order_number' => $orderNumber,
                'status' => $status
            ]);
            
            return $status;
        } catch (\Exception $e) {
            Log::error('Failed to check transaction status:', [
                'order_number' => $orderNumber,
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }

    public function updateOrderFromTransactionStatus($orderNumber)
    {
        $order = Order::where('order_number', $orderNumber)->first();
        
        if (!$order) {
            return ['status' => 'error', 'message' => 'Order not found'];
        }

        $transactionStatus = $this->checkTransactionStatus($orderNumber);
        
        if (!$transactionStatus) {
            return ['status' => 'error', 'message' => 'Unable to check transaction status'];
        }

        // Log the full response for debugging
        Log::info('Transaction status response:', [
            'order_number' => $orderNumber,
            'response' => $transactionStatus
        ]);

        // Access properties directly from the object
        $status = $transactionStatus->transaction_status ?? null;
        $fraudStatus = $transactionStatus->fraud_status ?? null;
        $paymentType = $transactionStatus->payment_type ?? null;
        $transactionId = $transactionStatus->transaction_id ?? null;

        Log::info('Extracted status data:', [
            'status' => $status,
            'fraud_status' => $fraudStatus,
            'payment_type' => $paymentType,
            'transaction_id' => $transactionId
        ]);

        if ($status == 'capture') {
            if ($fraudStatus == 'challenge') {
                $order->update(['status' => 'challenge']);
                Log::info('Order updated to challenge status');
            } else if ($fraudStatus == 'accept') {
                $order->markAsPaid($paymentType, $transactionId);
                Log::info('Order marked as paid via capture/accept');
            }
        } else if ($status == 'settlement') {
            $order->markAsPaid($paymentType, $transactionId);
            Log::info('Order marked as paid via settlement');
        } else if ($status == 'pending') {
            $order->update(['status' => 'pending']);
            Log::info('Order updated to pending status');
        } else if ($status == 'deny') {
            $order->update(['status' => 'denied']);
            Log::info('Order updated to denied status');
        } else if ($status == 'expire') {
            $order->update(['status' => 'expired']);
            Log::info('Order updated to expired status');
        } else if ($status == 'cancel') {
            $order->update(['status' => 'cancelled']);
            Log::info('Order updated to cancelled status');
        }

        return ['status' => 'success', 'order' => $order->fresh(['customer', 'ticket'])];
    }

    public function handleNotification()
    {
        $notif = new \Midtrans\Notification();

        $transactionStatus = $notif->transaction_status;
        $orderNumber = $notif->order_id;
        $fraudStatus = $notif->fraud_status ?? null;

        $order = Order::where('order_number', $orderNumber)->first();

        if (!$order) {
            return ['status' => 'error', 'message' => 'Order not found'];
        }

        if ($transactionStatus == 'capture') {
            if ($fraudStatus == 'challenge') {
                $order->update(['status' => 'challenge']);
            } else if ($fraudStatus == 'accept') {
                $order->markAsPaid($notif->payment_type, $notif->transaction_id);
            }
        } else if ($transactionStatus == 'settlement') {
            $order->markAsPaid($notif->payment_type, $notif->transaction_id);
        } else if ($transactionStatus == 'pending') {
            $order->update(['status' => 'pending']);
        } else if ($transactionStatus == 'deny') {
            $order->update(['status' => 'denied']);
        } else if ($transactionStatus == 'expire') {
            $order->update(['status' => 'expired']);
        } else if ($transactionStatus == 'cancel') {
            $order->update(['status' => 'cancelled']);
        }

        return ['status' => 'success', 'order' => $order];
    }
}
