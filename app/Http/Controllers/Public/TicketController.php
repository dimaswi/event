<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use App\Models\Customer;
use App\Models\Order;
use App\Models\EventSetting;
use App\Services\MidtransService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Barryvdh\DomPDF\Facade\Pdf;

class TicketController extends Controller
{
    /**
     * Display the landing page.
     */
    public function index()
    {
        $availableTickets = Ticket::where('is_active', true)
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

        $eventSettings = [
            'event' => EventSetting::getByGroup('event'),
            'contact' => EventSetting::getByGroup('contact'),
            'footer' => EventSetting::getByGroup('footer'),
            'sponsor' => EventSetting::getByGroup('sponsor'),
            'sponsors' => EventSetting::getByGroup('sponsors'),
        ];

        return Inertia::render('Public/Landing', [
            'tickets' => $availableTickets,
            'eventSettings' => $eventSettings
        ]);
    }

    /**
     * Display the order page with all available tickets.
     */
    public function order()
    {
        $availableTickets = Ticket::where('is_active', true)
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

        // Get active form fields in order
        $formFields = \App\Models\FormField::active()->ordered()->get();

        return Inertia::render('Public/Order', [
            'tickets' => $availableTickets,
            'formFields' => $formFields,
            'size_chart' => EventSetting::getValue('size_chart', null)
        ]);
    }

    /**
     * Show ticket details and purchase form.
     */
    public function show(Ticket $ticket)
    {
        return Inertia::render('Public/Tickets/Show', [
            'ticket' => $ticket
        ]);
    }

    /**
     * Store order (purchase ticket).
     */
    public function purchase(Request $request, Ticket $ticket)
    {
        // Validate ticket availability
        if (!$ticket->is_on_sale) {
            return response()->json([
                'success' => false,
                'message' => 'Tiket tidak tersedia untuk dibeli saat ini.'
            ], 400);
        }

        // Debug: log incoming data
        Log::info('Purchase request data:', $request->all());

        try {
            $validated = $request->validate([
                'customer.name' => 'required|string|max:255',
                'customer.email' => 'required|email|max:255',
                'customer.phone' => 'required|string|max:20',
                'customer.nik' => 'required|string|min:16|max:16|regex:/^[0-9]{16}$/',
                'customer.id_type' => 'required|in:ktp,sim,passport',
                'customer.address' => 'nullable|string|max:255',
                'customer.full_address' => 'required|string',
                'customer.province' => 'required|string|max:100',
                'customer.city' => 'required|string|max:100',
                'customer.district' => 'required|string|max:100',
                'customer.postal_code' => 'required|string|min:5|max:5|regex:/^[0-9]{5}$/',
                'customer.birth_date' => 'required|date|before:today',
                'customer.place_of_birth' => 'required|string|max:100',
                'customer.gender' => 'required|in:male,female',
                'customer.blood_type' => 'nullable|in:A,B,AB,O',
                'customer.shirt_size' => 'required|in:XS,S,M,L,XL,XXL,XXXL',
                'customer.medical_conditions' => 'nullable|string',
                'customer.allergies' => 'nullable|string',
                'customer.has_insurance' => 'boolean',
                'customer.insurance_name' => 'nullable|required_if:customer.has_insurance,true|string|max:100',
                'customer.insurance_number' => 'nullable|required_if:customer.has_insurance,true|string|max:50',
                'customer.emergency_contact_name' => 'required|string|max:255',
                'customer.emergency_contact_phone' => 'required|string|max:20',
                'terms_health' => 'required|accepted',
                'terms_liability' => 'required|accepted',
                'terms_media' => 'required|accepted',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Data yang dikirim tidak valid.',
                'errors' => $e->errors()
            ], 422);
        }

        Log::info('Validation passed:', $validated);

        // Cek apakah customer dengan NIK ini sudah pernah membeli tiket
        $existingCustomer = Customer::where('nik', $validated['customer']['nik'])->first();
        if ($existingCustomer) {
            $existingOrder = Order::where('customer_id', $existingCustomer->id)
                ->whereIn('status', ['pending', 'paid'])
                ->first();
            
            if ($existingOrder) {
                return response()->json([
                    'success' => false,
                    'message' => 'NIK ini sudah pernah digunakan untuk membeli tiket. Setiap orang hanya diperbolehkan membeli 1 tiket.'
                ], 400);
            }
        }

        $quantity = 1; // Fixed quantity = 1 tiket per customer

        // Check stock availability
        if ($ticket->available_stock < $quantity) {
            return response()->json([
                'success' => false,
                'message' => 'Stok tiket tidak mencukupi. Tersisa: ' . $ticket->available_stock
            ], 400);
        }

        try {
            DB::beginTransaction();

            // Create or find customer by NIK (lebih unik dari email untuk Indonesia)
            $customerData = $validated['customer'];
            $customer = Customer::firstOrCreate(
                ['nik' => $customerData['nik']],
                $customerData
            );

            // Calculate total price
            $unitPrice = $ticket->price;
            $totalPrice = $unitPrice * $quantity;

            // Create order with 'awaiting_payment' status
            $order = Order::create([
                'customer_id' => $customer->id,
                'ticket_id' => $ticket->id,
                'quantity' => $quantity,
                'unit_price' => $unitPrice,
                'total_price' => $totalPrice,
                'status' => 'awaiting_payment', // Status khusus untuk order yang belum dibayar
            ]);

            // Generate Midtrans Snap Token
            $midtransService = new MidtransService();
            $snapToken = $midtransService->createSnapToken($order);

            DB::commit();

            // Return response with snap token for frontend
            return response()->json([
                'success' => true,
                'message' => 'Order berhasil dibuat. Silakan lanjutkan pembayaran.',
                'order_number' => $order->order_number,
                'snap_token' => $snapToken,
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Order creation failed: ' . $e->getMessage(), [
                'ticket_id' => $ticket->id,
                'customer_nik' => $validated['customer']['nik'] ?? null,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat memproses pesanan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Show the check order page.
     */
    public function showCheckOrder(Request $request)
    {
        $orderNumber = $request->get('order');
        $order = null;
        
        if ($orderNumber) {
            $order = Order::where('order_number', $orderNumber)
                ->with(['customer', 'ticket'])
                ->first();
        }
        
        return Inertia::render('Public/Orders/Check', [
            'initialOrder' => $order,
            'searchedOrderNumber' => $orderNumber
        ]);
    }

    /**
     * Check order status by order number.
     */
    public function checkOrder(Request $request)
    {
        $validated = $request->validate([
            'order_number' => 'required|string'
        ]);

        $order = Order::where('order_number', $validated['order_number'])
            ->with(['customer', 'ticket'])
            ->first();

        if (!$order) {
            return Inertia::render('Public/Orders/Check', [
                'error' => 'Nomor pesanan tidak ditemukan. Pastikan nomor pesanan yang Anda masukkan benar.',
                'searchedOrderNumber' => $validated['order_number']
            ]);
        }

        return Inertia::render('Public/Orders/Check', [
            'initialOrder' => $order,
            'searchedOrderNumber' => $validated['order_number']
        ]);
    }

    /**
     * Check payment status via API
     */
    public function checkPaymentStatus(string $orderNumber)
    {
        try {
            $midtransService = new \App\Services\MidtransService();
            $result = $midtransService->updateOrderFromTransactionStatus($orderNumber);
            
            if ($result['status'] === 'success') {
                return response()->json([
                    'success' => true,
                    'order' => $result['order'],
                    'message' => 'Status berhasil diperbarui'
                ]);
            }
            
            return response()->json([
                'success' => false,
                'message' => $result['message'] ?? 'Gagal mengecek status pembayaran'
            ], 400);
        } catch (\Exception $e) {
            Log::error('Payment status check error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengecek status pembayaran'
            ], 500);
        }
    }

    /**
     * Mark order as paid via API call
     */
    public function markOrderPaid(Request $request, string $orderNumber)
    {
        $order = Order::where('order_number', $orderNumber)->first();
        
        if (!$order) {
            return response()->json(['success' => false, 'message' => 'Order not found'], 404);
        }
        
        try {
            $validated = $request->validate([
                'payment_type' => 'nullable|string',
                'transaction_id' => 'nullable|string'
            ]);
            
            $order->markAsPaid(
                $validated['payment_type'] ?? null, 
                $validated['transaction_id'] ?? null
            );
            
            Log::info("Order {$orderNumber} marked as paid via API call");
            
            return response()->json([
                'success' => true, 
                'message' => 'Order marked as paid successfully',
                'order' => $order->fresh()
            ]);
            
        } catch (\Exception $e) {
            Log::error("Failed to mark order {$orderNumber} as paid: " . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Failed to update order'], 500);
        }
    }

    /**
     * Generate new snap token for payment retry
     */
    public function generatePaymentToken(string $orderNumber)
    {
        try {
            $order = Order::where('order_number', $orderNumber)
                ->with(['customer', 'ticket'])
                ->first();

            if (!$order) {
                return response()->json([
                    'success' => false,
                    'message' => 'Pesanan tidak ditemukan.'
                ], 404);
            }

            // Only allow payment retry for awaiting_payment and pending orders
            if (!in_array($order->status, ['awaiting_payment', 'pending'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Pesanan ini tidak dapat dibayar ulang.'
                ], 400);
            }

            // Generate fresh snap token
            $midtransService = new MidtransService();
            $snapToken = $midtransService->createSnapToken($order);

            return response()->json([
                'success' => true,
                'snapToken' => $snapToken,
                'order' => $order
            ]);

        } catch (\Exception $e) {
            Log::error('Error generating payment token for order ' . $orderNumber, [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan. Silakan coba lagi.'
            ], 500);
        }
    }

    /**
     * Download ticket PDF
     */
    public function downloadTicket(string $orderNumber)
    {
        $order = Order::where('order_number', $orderNumber)
            ->with(['customer', 'ticket'])
            ->first();

        if (!$order) {
            return redirect()->route('public.orders.check.form')
                ->with('error', 'Pesanan tidak ditemukan.');
        }

        if ($order->status !== 'paid') {
            return redirect()->route('public.orders.check.form')
                ->with('error', 'Tiket hanya dapat didownload setelah pembayaran berhasil.');
        }

        // Get event settings
        $eventSettings = (object) [
            'event_name' => EventSetting::getValue('event_name', 'Kerungadem Run 2025'),
            'event_date' => EventSetting::getValue('event_date', '2025-08-29'),
            'event_time' => EventSetting::getValue('event_time', '06:00 WIB'),
            'event_location' => EventSetting::getValue('event_location', 'Alun-Alun Bojonegoro'),
            'organizer_name' => EventSetting::getValue('organizer_name', 'Kerungadem Run'),
        ];

        // Generate PDF
        $pdf = Pdf::loadView('tickets.pdf', [
            'order' => $order,
            'eventSettings' => $eventSettings
        ])->setPaper('a4', 'portrait');

        return $pdf->download("ticket-{$orderNumber}.pdf");
    }

    /**
     * Show payment process page
     */
    public function showPayment(string $orderNumber)
    {
        $order = Order::where('order_number', $orderNumber)
            ->with(['customer', 'ticket'])
            ->first();

        if (!$order) {
            return redirect()->route('public.tickets.order')
                ->with('error', 'Pesanan tidak ditemukan.');
        }

        // Generate fresh snap token for the order
        try {
            $midtransService = new MidtransService();
            $snapToken = $midtransService->createSnapToken($order);

            return Inertia::render('Public/Orders/Payment', [
                'order' => $order,
                'snap_token' => $snapToken,
                'client_key' => config('midtrans.client_key')
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to generate snap token: ' . $e->getMessage());
            return redirect()->route('public.tickets.order')
                ->with('error', 'Terjadi kesalahan saat memproses pembayaran.');
        }
    }

    /**
     * Handle Midtrans notification callback
     */
    public function handleNotification(Request $request)
    {
        try {
            $midtransService = new MidtransService();
            $result = $midtransService->handleNotification();

            return response()->json($result);
        } catch (\Exception $e) {
            Log::error('Midtrans notification error: ' . $e->getMessage());
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Handle payment finish callback
     */
    public function paymentFinish(Request $request)
    {
        $orderNumber = $request->get('order_id');

        // Log semua parameter yang dikirim Midtrans
        Log::info('Payment finish callback received:', [
            'all_params' => $request->all(),
            'order_id' => $orderNumber
        ]);
        
        if ($orderNumber) {
            $order = Order::where('order_number', $orderNumber)
                ->with(['customer', 'ticket'])
                ->first();
            
            if ($order) {
                // LANGSUNG CEK STATUS DARI MIDTRANS DAN UPDATE
                try {
                    $transactionStatus = \Midtrans\Transaction::status($orderNumber);
                    
                    Log::info('Midtrans status response:', [
                        'order_number' => $orderNumber,
                        'status' => $transactionStatus
                    ]);
                    
                    if ($transactionStatus->transaction_status == 'settlement') {
                        $order->markAsPaid($transactionStatus->payment_type ?? null, $transactionStatus->transaction_id ?? null);
                        $order = $order->fresh();
                        Log::info("Order {$orderNumber} marked as paid");
                    }
                } catch (\Exception $e) {
                    Log::error("Failed to check transaction status: " . $e->getMessage());
                }
                
                return Inertia::render('Public/Orders/PaymentResult', [
                    'order' => $order,
                    'status' => $order->status === 'paid' ? 'success' : ($order->status === 'pending' ? 'pending' : 'failed'),
                    'message' => $order->status === 'paid' 
                        ? 'Pembayaran telah berhasil dikonfirmasi.' 
                        : ($order->status === 'pending' 
                            ? 'Pembayaran sedang diproses, mohon tunggu konfirmasi.'
                            : 'Pembayaran gagal atau dibatalkan.')
                ]);
            }
        }

        return redirect()->route('public.tickets.order')
            ->with('success', 'Pembayaran telah diproses.');
    }

    /**
     * Handle payment unfinish callback
     */
    public function paymentUnfinish(Request $request)
    {
        $orderNumber = $request->get('order_id');
        
        if ($orderNumber) {
            $order = Order::where('order_number', $orderNumber)
                ->with(['customer', 'ticket'])
                ->first();
            
            if ($order) {
                return Inertia::render('Public/Orders/PaymentResult', [
                    'order' => $order,
                    'status' => 'cancelled',
                    'message' => 'Pembayaran belum selesai. Anda dapat melanjutkan pembayaran nanti.'
                ]);
            }
        }
        
        return redirect()->route('public.tickets.order')
            ->with('warning', 'Pembayaran belum selesai. Silakan coba lagi jika diperlukan.');
    }

    /**
     * Handle payment error callback
     */
    public function paymentError(Request $request)
    {
        $orderNumber = $request->get('order_id');
        
        if ($orderNumber) {
            $order = Order::where('order_number', $orderNumber)
                ->with(['customer', 'ticket'])
                ->first();
            
            if ($order) {
                return Inertia::render('Public/Orders/PaymentResult', [
                    'order' => $order,
                    'status' => 'failed',
                    'message' => 'Terjadi kesalahan dalam proses pembayaran. Silakan coba lagi atau hubungi customer service.'
                ]);
            }
        }
        
        return redirect()->route('public.tickets.order')
            ->with('error', 'Terjadi kesalahan dalam pembayaran. Silakan coba lagi.');
    }
}
