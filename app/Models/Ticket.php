<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Casts\Attribute;

class Ticket extends Model
{
    protected $fillable = [
        'name',
        'description',
        'price',
        'is_free',
        'stock',
        'sold',
        'is_active',
        'sale_start_date',
        'sale_end_date',
        'image',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'is_free' => 'boolean',
        'is_active' => 'boolean',
        'sale_start_date' => 'datetime',
        'sale_end_date' => 'datetime',
    ];

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    // Accessor untuk menghitung sisa stok
    protected function availableStock(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->stock - $this->sold,
        );
    }

    // Accessor untuk mengecek apakah tiket sedang dalam periode penjualan
    protected function isOnSale(): Attribute
    {
        return Attribute::make(
            get: function () {
                $now = now();
                $startOk = !$this->sale_start_date || $now->gte($this->sale_start_date);
                $endOk = !$this->sale_end_date || $now->lte($this->sale_end_date);
                
                return $this->is_active && $startOk && $endOk && $this->available_stock > 0;
            }
        );
    }

        // Accessor untuk cek apakah tiket sedang dijual
    public function getIsOnSaleAttribute(): bool
    {
        $now = now();
        
        // Cek apakah tiket aktif
        if (!$this->is_active) {
            return false;
        }
        
        // Cek apakah masih ada stok
        if ($this->available_stock <= 0) {
            return false;
        }
        
        // Cek tanggal mulai penjualan
        if ($this->sale_start_date && $this->sale_start_date > $now) {
            return false;
        }
        
        // Cek tanggal berakhir penjualan
        if ($this->sale_end_date && $this->sale_end_date < $now) {
            return false;
        }
        
        return true;
    }

    // Method untuk increase stok terjual
    public function incrementSold(int $quantity = 1): bool
    {
        if ($this->available_stock >= $quantity) {
            $this->increment('sold', $quantity);
            return true;
        }
        return false;
    }

    // Method untuk decrease stok terjual (jika ada pembatalan)
    public function decrementSold(int $quantity = 1): bool
    {
        if ($this->sold >= $quantity) {
            $this->decrement('sold', $quantity);
            return true;
        }
        return false;
    }
}
