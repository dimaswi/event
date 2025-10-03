<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class Order extends Model
{
    protected $fillable = [
        'order_number',
        'bib_number',
        'customer_id',
        'ticket_id',
        'quantity',
        'unit_price',
        'total_price',
        'status',
        'payment_method',
        'payment_reference',
        'paid_at',
        'notes',
        'race_pack_collected',
        'race_pack_collected_at',
        'race_pack_collected_by',
        'form_data',
    ];

    protected $casts = [
        'unit_price' => 'decimal:2',
        'total_price' => 'decimal:2',
        'paid_at' => 'datetime',
        'race_pack_collected' => 'boolean',
        'race_pack_collected_at' => 'datetime',
        'form_data' => 'array',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function ticket(): BelongsTo
    {
        return $this->belongsTo(Ticket::class);
    }

    // Virtual customer attribute dari form_data
    public function getCustomerAttribute()
    {
        $formData = $this->form_data ?? [];
        return (object) [
            'id' => null,
            'name' => $formData['name'] ?? 'Unknown',
            'email' => $formData['email'] ?? 'N/A',
            'phone' => $formData['phone'] ?? 'N/A',
            'nik' => $formData['nik'] ?? null,
        ];
    }

    // Boot method untuk auto generate order number
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($order) {
            if (empty($order->order_number)) {
                $order->order_number = static::generateOrderNumber();
            }
        });
    }

    // Method untuk generate order number unik
    public static function generateOrderNumber(): string
    {
        do {
            $orderNumber = 'FR-' . now()->format('Ymd') . '-' . strtoupper(Str::random(6));
        } while (static::where('order_number', $orderNumber)->exists());

        return $orderNumber;
    }

    // Method untuk mark order sebagai paid
    public function markAsPaid(string $paymentMethod = null, string $paymentReference = null): bool
    {
        // Generate nomor punggung jika belum ada
        if (empty($this->bib_number)) {
            $this->bib_number = $this->generateBibNumber();
        }

        $this->update([
            'status' => 'paid',
            'payment_method' => $paymentMethod,
            'payment_reference' => $paymentReference,
            'paid_at' => now(),
            'bib_number' => $this->bib_number,
        ]);

        // Update stok ticket
        return $this->ticket->incrementSold($this->quantity);
    }

    // Generate nomor punggung sequential
    private function generateBibNumber(): string
    {
        // Lock untuk mencegah race condition
        return DB::transaction(function () {
            // Cari nomor punggung terakhir yang sudah digunakan
            $lastBibNumber = static::whereNotNull('bib_number')
                ->where('status', 'paid')
                ->orderBy('bib_number', 'desc')
                ->value('bib_number');

            if ($lastBibNumber) {
                // Extract nomor dari format 00001, 00002, dst
                $lastNumber = (int) $lastBibNumber;
                $nextNumber = $lastNumber + 1;
            } else {
                // Mulai dari nomor 1
                $nextNumber = 1;
            }

            // Format dengan leading zeros (5 digit)
            $bibNumber = str_pad($nextNumber, 5, '0', STR_PAD_LEFT);

            // Pastikan nomor belum digunakan (double check)
            while (static::where('bib_number', $bibNumber)->exists()) {
                $nextNumber++;
                $bibNumber = str_pad($nextNumber, 5, '0', STR_PAD_LEFT);
            }

            return $bibNumber;
        });
    }

    // Method untuk cancel order
    public function cancel(): bool
    {
        if ($this->status === 'paid') {
            // Jika sudah dibayar, kembalikan stok
            $this->ticket->decrementSold($this->quantity);
        }

        return $this->update([
            'status' => 'cancelled',
            'bib_number' => null, // Clear nomor punggung
            'paid_at' => null, // Clear payment date
        ]);
    }

    // Method untuk konfirmasi pengambilan race pack
    public function markRacePackAsCollected(string $collectedBy = null): bool
    {
        if ($this->status !== 'paid') {
            return false; // Hanya order yang sudah dibayar yang bisa ambil race pack
        }

        return $this->update([
            'race_pack_collected' => true,
            'race_pack_collected_at' => now(),
            'race_pack_collected_by' => $collectedBy ?? Auth::user()?->name ?? 'Admin',
        ]);
    }

    // Method untuk membatalkan pengambilan race pack
    public function markRacePackAsUncollected(): bool
    {
        return $this->update([
            'race_pack_collected' => false,
            'race_pack_collected_at' => null,
            'race_pack_collected_by' => null,
        ]);
    }

    // Accessor untuk status badge color
    public function getStatusColorAttribute(): string
    {
        return match($this->status) {
            'awaiting_payment' => 'warning',
            'pending' => 'warning',
            'paid' => 'success',
            'cancelled' => 'destructive',
            'expired' => 'secondary',
            'denied' => 'destructive',
            'challenge' => 'warning',
            default => 'default'
        };
    }

    // Accessor untuk payment status (berdasarkan status order)
    public function getPaymentStatusAttribute(): string
    {
        return match($this->status) {
            'awaiting_payment' => 'pending',
            'pending' => 'pending',
            'paid' => 'paid',
            'cancelled' => 'failed',
            'expired' => 'expired',
            'denied' => 'failed',
            'challenge' => 'pending',
            default => 'pending'
        };
    }
}
