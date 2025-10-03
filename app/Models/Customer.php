<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Customer extends Model
{
    protected $fillable = [
        'name',
        'email',
        'phone',
        'nik',
        'ktp_image',
        'id_type',
        'address',
        'full_address',
        'province',
        'city',
        'district',
        'postal_code',
        'birth_date',
        'place_of_birth',
        'gender',
        'blood_type',
        'shirt_size',
        'medical_conditions',
        'allergies',
        'has_insurance',
        'insurance_name',
        'insurance_number',
        'emergency_contact_name',
        'emergency_contact_phone',
        'form_data', // untuk data form dinamis
    ];

    protected $casts = [
        'birth_date' => 'date',
        'has_insurance' => 'boolean',
        'form_data' => 'array', // cast JSON ke array
    ];

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    // Accessor untuk mendapatkan nama lengkap dengan format yang rapi
    public function getFormattedNameAttribute(): string
    {
        return ucwords(strtolower($this->name));
    }

    // Method untuk mendapatkan umur customer
    public function getAgeAttribute(): ?int
    {
        return $this->birth_date ? $this->birth_date->age : null;
    }

    // Method untuk mendapatkan alamat lengkap
    public function getFullAddressFormattedAttribute(): string
    {
        $parts = array_filter([
            $this->full_address,
            $this->district,
            $this->city,
            $this->province,
            $this->postal_code
        ]);
        
        return implode(', ', $parts);
    }

    // Method untuk validasi NIK Indonesia (16 digit)
    public function isValidNik(): bool
    {
        return $this->nik && preg_match('/^\d{16}$/', $this->nik);
    }
}
