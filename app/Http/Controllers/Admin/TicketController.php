<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class TicketController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Ticket::withCount('orders');

        // Search by name
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where('name', 'like', "%{$search}%");
        }

        $perPage = $request->get('perPage', 10);
        $tickets = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return Inertia::render('Admin/Tickets/Index', [
            'tickets' => $tickets,
            'filters' => array_merge([
                'search' => '',
                'perPage' => 10
            ], $request->only(['search', 'perPage']))
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Admin/Tickets/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'is_free' => 'boolean',
            'stock' => 'required|integer|min:0',
            'is_active' => 'boolean',
            'sale_start_date' => 'nullable|date',
            'sale_end_date' => 'nullable|date|after_or_equal:sale_start_date',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048'
        ]);

        // Jika tiket gratis, set price ke 0
        if ($validated['is_free']) {
            $validated['price'] = 0;
        }

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('tickets', 'public');
        }

        Ticket::create($validated);

        return redirect()->route('admin.tickets.index')
            ->with('success', 'Tiket berhasil ditambahkan!');
    }

    /**
     * Display the specified resource.
     */
    public function show(Ticket $ticket)
    {
        $ticket->load(['orders.customer']);
        
        return Inertia::render('Admin/Tickets/Show', [
            'ticket' => $ticket
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Ticket $ticket)
    {
        return Inertia::render('Admin/Tickets/Edit', [
            'ticket' => $ticket
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Ticket $ticket)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'is_free' => 'boolean',
            'stock' => 'required|integer|min:0',
            'is_active' => 'boolean',
            'sale_start_date' => 'nullable|date',
            'sale_end_date' => 'nullable|date|after_or_equal:sale_start_date',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048'
        ]);

        // Jika tiket gratis, set price ke 0
        if ($validated['is_free']) {
            $validated['price'] = 0;
        }

        // Handle image upload
        if ($request->hasFile('image')) {
            // Delete old image
            if ($ticket->image) {
                Storage::disk('public')->delete($ticket->image);
            }
            $validated['image'] = $request->file('image')->store('tickets', 'public');
        }

        $ticket->update($validated);

        return redirect()->route('admin.tickets.index')
            ->with('success', 'Tiket berhasil diperbarui!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Ticket $ticket)
    {
        // Check if ticket has orders
        if ($ticket->orders()->count() > 0) {
            return redirect()->route('admin.tickets.index')
                ->with('error', 'Tidak dapat menghapus tiket yang sudah memiliki pesanan!');
        }

        // Delete image if exists
        if ($ticket->image) {
            Storage::disk('public')->delete($ticket->image);
        }

        $ticket->delete();

        return redirect()->route('admin.tickets.index')
            ->with('success', 'Tiket berhasil dihapus!');
    }
}
