<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Ticket;
use App\Models\EventSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class OrderController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Order::with(['ticket']);

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by ticket
        if ($request->filled('ticket_id')) {
            $query->where('ticket_id', $request->ticket_id);
        }

        // Search by order number or form data (name, email, phone, etc)
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                  ->orWhereJsonContains('form_data->name', $search)
                  ->orWhereJsonContains('form_data->email', $search)
                  ->orWhereJsonContains('form_data->phone', $search)
                  ->orWhereJsonContains('form_data->nik', $search);
            });
        }

        $perPage = $request->get('perPage', 15);
        $orders = $query->orderBy('created_at', 'desc')->paginate($perPage);
        $tickets = Ticket::select('id', 'name')->get();
        $formFields = \App\Models\FormField::orderBy('order')->get();

        return Inertia::render('Admin/Orders/Index', [
            'orders' => $orders,
            'tickets' => $tickets,
            'formFields' => $formFields,
            'filters' => array_merge([
                'search' => '',
                'perPage' => 15
            ], $request->only(['status', 'ticket_id', 'search', 'perPage']))
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Order $order)
    {
        $order->load(['customer', 'ticket']);
        
        // Load form fields for dynamic form data
        $formFields = \App\Models\FormField::orderBy('order', 'asc')->get();
        
        return Inertia::render('Admin/Orders/Show', [
            'order' => $order,
            'formFields' => $formFields
        ]);
    }

    /**
     * Update order status.
     */
    public function updateStatus(Request $request, Order $order)
    {
        $validated = $request->validate([
            'status' => 'required|in:awaiting_payment,pending,paid,cancelled,expired,denied,challenge',
            'payment_method' => 'nullable|string',
            'payment_reference' => 'nullable|string',
            'notes' => 'nullable|string'
        ]);

        $oldStatus = $order->status;
        $newStatus = $validated['status'];

        if ($newStatus === 'paid' && $oldStatus !== 'paid') {
            // Marking as paid - generate bib number
            $order->markAsPaid(
                $validated['payment_method'] ?? null,
                $validated['payment_reference'] ?? null
            );
        } elseif ($newStatus === 'cancelled') {
            // Cancel order - clear bib number if exists
            $order->cancel();
        } elseif ($oldStatus === 'paid' && $newStatus !== 'paid') {
            // Changing from paid to other status - clear bib number
            $order->update([
                'status' => $newStatus,
                'bib_number' => null, // Clear nomor punggung
                'payment_method' => $validated['payment_method'] ?? $order->payment_method,
                'payment_reference' => $validated['payment_reference'] ?? $order->payment_reference,
                'notes' => $validated['notes'] ?? $order->notes,
                'paid_at' => null, // Clear payment date
            ]);
            
            // Decrease sold count on ticket since it's no longer paid
            if ($order->ticket) {
                $order->ticket->decrementSold($order->quantity);
            }
        } else {
            // Regular status update without affecting bib number
            $order->update([
                'status' => $newStatus,
                'payment_method' => $validated['payment_method'] ?? $order->payment_method,
                'payment_reference' => $validated['payment_reference'] ?? $order->payment_reference,
                'notes' => $validated['notes'] ?? $order->notes
            ]);
        }

        return redirect()->back()
            ->with('success', 'Status pesanan berhasil diperbarui!');
    }

    /**
     * Resend ticket email.
     */
    public function resendTicketEmail(Order $order)
    {
        if ($order->status !== 'paid') {
            return redirect()->back()
                ->with('error', 'Hanya pesanan yang sudah dibayar yang dapat dikirim ulang tiketnya!');
        }

        // TODO: Implement email sending logic
        // Mail::to($order->customer->email)->send(new TicketPurchasedMail($order));

        return redirect()->back()
            ->with('success', 'Email tiket berhasil dikirim ulang!');
    }

    /**
     * Export orders to CSV.
     */
    public function export(Request $request)
    {
        $query = Order::with(['ticket']);

        // Apply same filters as index
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('ticket_id')) {
            $query->where('ticket_id', $request->ticket_id);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                  ->orWhereJsonContains('form_data->name', $search)
                  ->orWhereJsonContains('form_data->email', $search)
                  ->orWhereJsonContains('form_data->phone', $search)
                  ->orWhereJsonContains('form_data->nik', $search);
            });
        }

        $orders = $query->orderBy('created_at', 'desc')->get();

        $filename = 'orders_' . now()->format('Y-m-d_H-i-s') . '.csv';
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function () use ($orders) {
            $file = fopen('php://output', 'w');
            
            // Header CSV
            fputcsv($file, [
                'Order Number',
                'Bib Number',
                'Customer Name',
                'Customer Email',
                'Ticket Name',
                'Quantity',
                'Unit Price',
                'Total Price',
                'Status',
                'Payment Method',
                'Race Pack Collected',
                'Race Pack Collected At',
                'Race Pack Collected By',
                'Order Date',
                'Paid Date'
            ]);

            // Data rows
            foreach ($orders as $order) {
                fputcsv($file, [
                    $order->order_number,
                    $order->bib_number ?? '',
                    $order->customer->name,
                    $order->customer->email,
                    $order->ticket->name,
                    $order->quantity,
                    $order->unit_price,
                    $order->total_price,
                    $order->status,
                    $order->payment_method,
                    $order->race_pack_collected ? 'Yes' : 'No',
                    $order->race_pack_collected_at?->format('Y-m-d H:i:s') ?? '',
                    $order->race_pack_collected_by ?? '',
                    $order->created_at->format('Y-m-d H:i:s'),
                    $order->paid_at?->format('Y-m-d H:i:s')
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Download ticket PDF for the specified order.
     */
    public function downloadTicket(Order $order)
    {
        // Check if order is paid
        if ($order->status !== 'paid') {
            abort(404, 'Ticket not available for unpaid orders');
        }

        // Load relationships
        $order->load(['customer', 'ticket']);

        // Get event settings
        $eventSettings = (object) [
            'event_name' => \App\Models\EventSetting::getValue('event_name', 'TIKET EVENT'),
            'event_date' => \App\Models\EventSetting::getValue('event_date', '2025-08-29'),
            'event_time' => \App\Models\EventSetting::getValue('event_time', '06:00 WIB'),
            'event_location' => \App\Models\EventSetting::getValue('event_location', 'Jakarta'),
            'organizer_name' => \App\Models\EventSetting::getValue('organizer_name', 'Event Organizer'),
        ];

        // Generate PDF
        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('tickets.pdf', [
            'order' => $order,
            'eventSettings' => $eventSettings
        ])->setPaper('a4', 'portrait');
        
        $filename = "ticket-{$order->order_number}.pdf";
        
        return $pdf->download($filename);
    }

    /**
     * Mark race pack as collected.
     */
    public function markRacePackCollected(Request $request, Order $order)
    {
        if ($order->status !== 'paid') {
            return redirect()->back()
                ->with('error', 'Race pack hanya dapat dikonfirmasi untuk order yang sudah dibayar.');
        }

        $collectedBy = $request->input('collected_by') ?? Auth::user()->name ?? 'Admin';

        if ($order->markRacePackAsCollected($collectedBy)) {
            return redirect()->back()
                ->with('success', 'Race pack berhasil dikonfirmasi sebagai sudah diambil!');
        }

        return redirect()->back()
            ->with('error', 'Gagal mengkonfirmasi pengambilan race pack.');
    }

    /**
     * Mark race pack as uncollected.
     */
    public function markRacePackUncollected(Order $order)
    {
        if ($order->markRacePackAsUncollected()) {
            return redirect()->back()
                ->with('success', 'Status race pack berhasil direset!');
        }

        return redirect()->back()
            ->with('error', 'Gagal mereset status race pack.');
    }

    /**
     * Toggle race pack collection status.
     */
    public function toggleRacePack(Request $request, Order $order)
    {
        if ($order->status !== 'paid') {
            return redirect()->back()
                ->with('error', 'Race pack hanya dapat dikonfirmasi untuk order yang sudah dibayar.');
        }

        if ($order->race_pack_collected) {
            // Mark as uncollected
            if ($order->markRacePackAsUncollected()) {
                return redirect()->back()
                    ->with('success', 'Race pack berhasil direset ke belum diambil!');
            }
        } else {
            // Mark as collected
            $collectedBy = $request->input('collected_by') ?? Auth::user()->name ?? 'Admin';
            if ($order->markRacePackAsCollected($collectedBy)) {
                return redirect()->back()
                    ->with('success', 'Race pack berhasil dikonfirmasi sebagai sudah diambil!');
            }
        }

        return redirect()->back()
            ->with('error', 'Gagal mengubah status race pack.');
    }

    /**
     * Remove the specified order from storage.
     */
    public function destroy(Order $order)
    {
        try {
            $orderNumber = $order->order_number;
            
            // Delete the order (this will also delete related customer data due to cascade)
            $order->delete();
            
            return redirect()->back()
                ->with('success', "Order {$orderNumber} berhasil dihapus");
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Gagal menghapus order: ' . $e->getMessage());
        }
    }
}
