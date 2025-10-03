<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use App\Models\Order;
use App\Models\FormField;
use App\Models\EventSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Str;

class NewTicketController extends Controller
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
     * Show order form with dynamic fields.
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
        $formFields = FormField::active()->ordered()->get();

        $eventSettings = [
            'event' => EventSetting::getByGroup('event'),
            'contact' => EventSetting::getByGroup('contact'),
            'footer' => EventSetting::getByGroup('footer'),
        ];

        return Inertia::render('Public/NewOrder', [
            'tickets' => $availableTickets,
            'formFields' => $formFields,
            'eventSettings' => $eventSettings,
        ]);
    }

    /**
     * Store order with dynamic form data.
     */
    public function purchase(Request $request, Ticket $ticket)
    {
        // Validate ticket availability
        if (!$ticket->is_on_sale) {
            return redirect()->back()
                ->withErrors(['ticket' => 'Tiket tidak tersedia untuk dibeli saat ini.'])
                ->withInput();
        }

        try {
            DB::beginTransaction();

            // Get active form fields untuk validasi
            $formFields = FormField::active()->get();
            
            // Build validation rules berdasarkan form fields
            $validationRules = [
                'ticket_id' => 'required|exists:tickets,id',
                'quantity' => 'integer|min:1|max:1', // satu tiket per order sesuai requirement
            ];

            $formData = [];
            foreach ($formFields as $field) {
                $fieldRule = $field->getValidationRule();
                if ($fieldRule) {
                    $validationRules["form_data.{$field->name}"] = $fieldRule;
                }
            }

            $validated = $request->validate($validationRules);

            // Check NIK uniqueness jika ada field NIK
            if (isset($validated['form_data']['nik'])) {
                $existingOrder = Order::whereJsonContains('form_data->nik', $validated['form_data']['nik'])->first();
                if ($existingOrder) {
                    return redirect()->back()
                        ->withErrors(['nik' => 'NIK sudah terdaftar dalam sistem.'])
                        ->withInput();
                }
            }

            // Generate unique order number dan bib number
            $orderNumber = 'TR-' . date('Ymd') . '-' . strtoupper(Str::random(6));
            $bibNumber = $this->generateBibNumber();

            // Create order langsung dengan form_data
            $order = Order::create([
                'order_number' => $orderNumber,
                'bib_number' => $bibNumber,
                'customer_id' => null, // tidak menggunakan customer
                'ticket_id' => $ticket->id,
                'quantity' => 1,
                'unit_price' => $ticket->price,
                'total_price' => $ticket->price,
                'status' => $ticket->price > 0 ? 'pending' : 'paid', // jika gratis langsung paid
                'payment_method' => $ticket->price > 0 ? null : 'free',
                'paid_at' => $ticket->price > 0 ? null : now(),
                'form_data' => $validated['form_data'], // simpan semua data form di sini
            ]);

            // Update ticket sold count
            $ticket->increment('sold');

            DB::commit();

            // Redirect ke halaman success untuk semua jenis tiket
            return redirect()->route('tickets.success', $orderNumber)
                ->with('success', 'Pendaftaran berhasil! Silakan download tiket Anda.');

        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            return redirect()->back()
                ->withErrors($e->errors())
                ->withInput();
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Purchase error: ' . $e->getMessage(), [
                'request' => $request->all(),
                'ticket_id' => $ticket->id
            ]);

            return redirect()->back()
                ->with('error', 'Terjadi kesalahan saat memproses pesanan.')
                ->withInput();
        }
    }

    /**
     * Show success page after successful order.
     */
    public function showSuccess($orderNumber)
    {
        $order = Order::where('order_number', $orderNumber)->with('ticket')->firstOrFail();
        
        $eventSettings = [
            'event' => EventSetting::getByGroup('event'),
            'contact' => EventSetting::getByGroup('contact'),
            'footer' => EventSetting::getByGroup('footer'),
        ];

        return Inertia::render('Public/TicketSuccess', [
            'order' => $order,
            'eventSettings' => $eventSettings,
        ]);
    }

    /**
     * Show payment page for order.
     */
    public function showPayment($orderNumber)
    {
        $order = Order::where('order_number', $orderNumber)->with('ticket')->firstOrFail();
        
        // Redirect jika order sudah paid
        if ($order->status === 'paid') {
            return redirect()->route('tickets.success', $orderNumber)
                ->with('success', 'Order sudah dibayar. Silakan download tiket Anda.');
        }
        
        // Untuk sementara redirect ke halaman success
        return redirect()->route('tickets.success', $orderNumber)
            ->with('info', 'Fitur pembayaran belum tersedia. Silakan hubungi admin.');
    }

    /**
     * Generate unique bib number.
     */
    private function generateBibNumber()
    {
        do {
            $bibNumber = 'BIB' . rand(1000, 9999);
        } while (Order::where('bib_number', $bibNumber)->exists());

        return $bibNumber;
    }

    /**
     * Download ticket as PDF.
     */
    public function downloadTicket(string $orderNumber)
    {
        $order = Order::with(['customer', 'ticket'])
            ->where('order_number', $orderNumber)
            ->first();

        if (!$order) {
            abort(404, 'Order tidak ditemukan');
        }

        if ($order->status !== 'paid') {
            abort(403, 'Tiket belum bisa didownload. Status: ' . $order->status);
        }

        $eventSettings = (object) [
            'event_name' => EventSetting::getValue('event.event_name', 'TIKET EVENT'),
            'event_date' => EventSetting::getValue('event.event_date'),
            'event_time' => EventSetting::getValue('event.event_time', '06:00'),
            'event_location' => EventSetting::getValue('event.event_location', 'Jakarta'),
            'organizer_name' => EventSetting::getValue('event.organizer_name', 'Event Organizer'),
        ];

        // Get form fields untuk dynamic PDF rendering
        $formFields = FormField::active()->ordered()->get();

        $pdf = Pdf::loadView('tickets.pdf', compact('order', 'eventSettings', 'formFields'));
        
        return $pdf->download("tiket-{$order->order_number}.pdf");
    }

    /**
     * Show order check form.
     */
    public function showCheckOrder()
    {
        $eventSettings = [
            'event' => EventSetting::getByGroup('event'),
            'contact' => EventSetting::getByGroup('contact'),
        ];

        return Inertia::render('Public/CheckOrder', [
            'eventSettings' => $eventSettings,
        ]);
    }

    /**
     * Check order status.
     */
    public function checkOrder(Request $request)
    {
        $request->validate([
            'order_number' => 'required|string',
        ]);

        $order = Order::with(['customer', 'ticket'])
            ->where('order_number', $request->order_number)
            ->first();

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order tidak ditemukan.'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'order' => [
                'order_number' => $order->order_number,
                'bib_number' => $order->bib_number,
                'status' => $order->status,
                'ticket_name' => $order->ticket->name,
                'customer_name' => $order->customer->name,
                'total_price' => $order->total_price,
                'paid_at' => $order->paid_at,
                'can_download' => $order->status === 'paid',
                'download_url' => $order->status === 'paid' ? route('tickets.download', $order->order_number) : null,
            ]
        ]);
    }
}