<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FormField extends Model
{
    protected $fillable = [
        'name',
        'label',
        'type',
        'options',
        'placeholder',
        'help_text',
        'description',
        'is_required',
        'order',
        'is_active',
        'validation_rules',
        'validation_rules_text',
    ];

    protected $casts = [
        'options' => 'array',
        'validation_rules' => 'array',
        'is_required' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('order');
    }

    // Helper method untuk mendapatkan validation rules
    public function getValidationRule()
    {
        $rules = [];
        
        if ($this->is_required) {
            $rules[] = 'required';
        }
        
        if ($this->type === 'email') {
            $rules[] = 'email';
        }
        
        // Use validation_rules_text field
        if ($this->validation_rules_text) {
            $rules[] = $this->validation_rules_text;
        }
        
        return implode('|', $rules);
    }
}
