<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\EventSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EventSettingController extends Controller
{
    public function index()
    {
        $settings = EventSetting::all()->groupBy('group');
        
        return Inertia::render('Admin/EventSettings/Index', [
            'settings' => $settings
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'key' => 'required|string|max:255',
            'value' => 'required|string',
            'group' => 'required|string|max:100',
            'description' => 'nullable|string|max:500'
        ]);

        // Generate label berdasarkan key jika tidak disediakan
        $label = $request->label ?? ucwords(str_replace('_', ' ', $request->key));

        EventSetting::updateOrCreate(
            ['key' => $request->key],
            [
                'value' => $request->value,
                'group' => $request->group,
                'label' => $label,
                'description' => $request->description
            ]
        );

        return redirect()->back()->with('success', 'Setting berhasil disimpan!');
    }

    public function update(Request $request, EventSetting $eventSetting)
    {
        $request->validate([
            'value' => 'required|string',
            'description' => 'nullable|string|max:500'
        ]);

        $eventSetting->update([
            'value' => $request->value,
            'description' => $request->description
        ]);

        return redirect()->back()->with('success', 'Setting berhasil diperbarui!');
    }

    public function destroy(EventSetting $eventSetting)
    {
        $eventSetting->delete();

        return redirect()->back()->with('success', 'Setting berhasil dihapus!');
    }

    public function bulkUpdate(Request $request)
    {
        $settings = $request->validate([
            'settings' => 'required|array',
            'settings.*.key' => 'required|string',
            'settings.*.value' => 'required|string',
            'settings.*.group' => 'required|string',
        ]);

        // Mapping untuk label berdasarkan key
        $keyLabels = [
            'event_name' => 'Nama Event',
            'event_subtitle' => 'Subtitle Event',
            'event_description' => 'Deskripsi Event',
            'event_location' => 'Lokasi Event',
            'event_date' => 'Tanggal Event',
            'event_time' => 'Waktu Event',
            'event_logo' => 'Logo Event',
            'event_hero_gradient' => 'Hero Background Gradient',
            'contact_email' => 'Email Kontak',
            'contact_phone' => 'Nomor Telepon',
            'organizer_name' => 'Nama Penyelenggara',
            'footer_description' => 'Deskripsi Footer',
            'sponsor_title' => 'Judul Sponsor',
            'sponsor_subtitle' => 'Subtitle Sponsor',
        ];

        foreach ($settings['settings'] as $setting) {
            // Generate label untuk sponsor dinamis
            $label = $keyLabels[$setting['key']] ?? $setting['key'];
            
            if (preg_match('/sponsor_(\d+)_name/', $setting['key'], $matches)) {
                $label = "Nama Sponsor {$matches[1]}";
            } elseif (preg_match('/sponsor_(\d+)_type/', $setting['key'], $matches)) {
                $label = "Tipe Sponsor {$matches[1]}";
            } elseif (preg_match('/sponsor_(\d+)_logo/', $setting['key'], $matches)) {
                $label = "Logo Sponsor {$matches[1]}";
            }

            EventSetting::updateOrCreate(
                ['key' => $setting['key']],
                [
                    'value' => $setting['value'],
                    'group' => $setting['group'],
                    'label' => $label,
                    'type' => ($setting['key'] === 'event_hero_gradient') ? 'text' : 'text',
                ]
            );
        }

        return redirect()->back()->with('success', 'Semua setting berhasil disimpan!');
    }
}
