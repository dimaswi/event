<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>E-Ticket {{ $order->order_number }}</title>
    <style>
        @page {
            size: A4;
            margin: 0;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Arial', 'Helvetica', sans-serif;
            color: #2d3748;
            background: #f7fafc;
            line-height: 1.3;
            margin: 0;
            padding: 8px;
        }
        
        .ticket-wrapper {
            padding: 0;
            min-height: auto;
        }
        
        .ticket-container {
            max-width: 100%;
            width: 100%;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            border: 2px solid #e2e8f0;
        }
        
        .ticket-container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: #3182ce;
        }
        
        .ticket-header {
            background: #3182ce;
            color: white;
            text-align: center;
            padding: 12px 10px;
            position: relative;
        }
        
        .event-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 3px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .ticket-type {
            font-size: 12px;
            opacity: 0.9;
            font-weight: normal;
        }
        
        .ticket-body {
            padding: 10px;
            background: white;
        }
        
        .order-number-section {
            text-align: center;
            margin-bottom: 10px;
            padding: 10px;
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 5px;
        }
        
        .order-label {
            font-size: 10px;
            color: #6c757d;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 3px;
            font-weight: 600;
        }
        
        .order-number {
            font-size: 16px;
            font-weight: bold;
            color: #2d3748;
            font-family: 'Courier New', monospace;
            letter-spacing: 1px;
        }
        
        .ticket-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-bottom: 10px;
        }
        
        .details-section {
            background: #f8f9fa;
            padding: 10px;
            border-radius: 5px;
            border: 1px solid #dee2e6;
        }
        
        .section-title {
            font-size: 12px;
            font-weight: bold;
            color: #3182ce;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-bottom: 2px solid #3182ce;
            padding-bottom: 3px;
        }
        
        .detail-row {
            margin-bottom: 5px;
            padding: 3px 0;
            border-bottom: 1px solid #e9ecef;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .detail-row:last-child {
            border-bottom: none;
            margin-bottom: 0;
        }
        
        .detail-label {
            font-size: 9px;
            color: #6c757d;
            text-transform: uppercase;
            font-weight: 600;
            flex: 1;
        }
        
        .detail-value {
            font-size: 10px;
            color: #2d3748;
            font-weight: 600;
            text-align: right;
            flex: 1;
            max-width: 60%;
            word-wrap: break-word;
        }
        
        .bib-number {
            background: #3182ce;
            color: white;
            padding: 12px;
            text-align: center;
            margin: 10px 0;
            border-radius: 5px;
        }
        
        .bib-label {
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-weight: 600;
        }
        
        .bib-value {
            font-size: 24px;
            font-weight: bold;
            margin-top: 3px;
            font-family: 'Courier New', monospace;
        }
        
        .payment-info {
            background: #f8f9fa;
            border-radius: 5px;
            padding: 10px;
            margin-top: 10px;
            border: 1px solid #dee2e6;
        }
        
        .payment-free {
            background: #d4edda;
            border-color: #28a745;
        }
        
        .payment-paid {
            background: #e7f3ff;
            border-color: #3182ce;
        }
        
        .payment-title {
            font-size: 12px;
            font-weight: bold;
            color: #3182ce;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-bottom: 2px solid #3182ce;
            padding-bottom: 3px;
        }
        
        .payment-details {
            width: 100%;
        }
        
        .payment-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
            margin-bottom: 5px;
            padding: 3px 0;
            border-bottom: 1px solid rgba(222, 226, 230, 0.5);
        }
        
        .payment-item:last-child {
            margin-bottom: 0;
            font-weight: bold;
            font-size: 12px;
            padding: 5px 0 0 0;
            border-bottom: none;
            border-top: 2px solid #3182ce;
        }
        
        .payment-item span:first-child {
            font-size: 9px;
            color: #6c757d;
            font-weight: 600;
            text-transform: uppercase;
        }
        
        .payment-item span:last-child {
            font-size: 10px;
            color: #2d3748;
            font-weight: 600;
        }
        
        .footer {
            text-align: center;
            padding: 8px;
            background: #495057;
            color: #ffffff;
            border-top: 3px solid #3182ce;
        }
        
        .footer div {
            margin-bottom: 2px;
            font-size: 9px;
            font-weight: normal;
        }
        
        .footer div:last-child {
            margin-bottom: 0;
            opacity: 0.8;
            font-size: 8px;
        }
        
        .status-badge {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 8px;
            font-size: 8px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .status-confirmed {
            background: #28a745;
            color: white;
        }
        
        .status-pending {
            background: #dc3545;
            color: white;
        }
        
        @media print {
            body {
                background: white !important;
                padding: 3px;
            }
            .ticket-wrapper {
                padding: 0;
            }
            .ticket-container {
                box-shadow: none;
                border: 1px solid #000;
            }
        }
        

    </style>
</head>
<body>
    <div class="ticket-wrapper">
        <div class="ticket-container">
            <!-- Header -->
            <div class="ticket-header">
                <div class="event-title">{{ $eventSettings->event_name ?? 'TIKET EVENT' }}</div>
                <div class="ticket-type">E-Ticket Digital</div>
            </div>
        
        <!-- Body -->
        <div class="ticket-body">
            <!-- Order Number Section -->
            <div class="order-number-section">
                <div class="order-label">Nomor Pesanan</div>
                <div class="order-number">{{ $order->order_number }}</div>
            </div>
            
            <!-- Ticket Details Two Column -->
            <div class="ticket-details">
                <!-- Left Column - Event Info -->
                <div class="details-section">
                    <div class="section-title">Informasi Event</div>
                    
                    <div class="detail-row">
                        <span class="detail-label">Kategori</span>
                        <span class="detail-value">{{ $order->ticket->name }}</span>
                    </div>
                    
                    <div class="detail-row">
                        <span class="detail-label">Tanggal Event</span>
                        <span class="detail-value">{{ $eventSettings->event_date ? \Carbon\Carbon::parse($eventSettings->event_date)->format('d M Y') : '29 Agustus 2025' }}</span>
                    </div>
                    
                    <div class="detail-row">
                        <span class="detail-label">Waktu</span>
                        <span class="detail-value">{{ $eventSettings->event_time ?? '06:00' }}</span>
                    </div>
                    
                    <div class="detail-row">
                        <span class="detail-label">Lokasi</span>
                        <span class="detail-value">{{ $eventSettings->event_location ?? 'Jakarta' }}</span>
                    </div>
                    
                    <div class="detail-row">
                        <span class="detail-label">Status</span>
                        <span class="detail-value">
                            <span class="status-badge {{ $order->status === 'paid' ? 'status-confirmed' : 'status-pending' }}">
                                {{ $order->status === 'paid' ? 'TERKONFIRMASI' : 'MENUNGGU PEMBAYARAN' }}
                            </span>
                        </span>
                    </div>
                </div>
                
                <!-- Right Column - Participant Info -->
                <div class="details-section">
                    <div class="section-title">Data Peserta</div>
                    
                    @if($order->form_data)
                        {{-- Dynamic form fields from database --}}
                        @foreach($formFields as $field)
                            @php
                                $value = $order->form_data[$field->name] ?? null;
                            @endphp
                            @if($value)
                                <div class="detail-row">
                                    <span class="detail-label">{{ $field->label }}</span>
                                    <span class="detail-value">
                                        @if($field->type === 'checkbox')
                                            {{ $value ? 'Ya' : 'Tidak' }}
                                        @elseif($field->type === 'date')
                                            {{ \Carbon\Carbon::parse($value)->format('d/m/Y') }}
                                        @else
                                            {{ $value }}
                                        @endif
                                    </span>
                                </div>
                            @endif
                        @endforeach
                    @else
                        {{-- Fallback to old customer data structure for backward compatibility --}}
                        <div class="detail-row">
                            <span class="detail-label">Nama Lengkap</span>
                            <span class="detail-value">{{ $order->customer->name }}</span>
                        </div>
                        
                        @if($order->customer->email)
                        <div class="detail-row">
                            <span class="detail-label">Email</span>
                            <span class="detail-value">{{ $order->customer->email }}</span>
                        </div>
                        @endif
                        
                        @if($order->customer->phone)
                        <div class="detail-row">
                            <span class="detail-label">Telepon</span>
                            <span class="detail-value">{{ $order->customer->phone }}</span>
                        </div>
                        @endif
                        
                        @if($order->customer->nik)
                        <div class="info-row">
                            <div class="info-label">NIK</div>
                            <div class="info-value">{{ $order->customer->nik }}</div>
                        </div>
                        @endif
                        
                        @if($order->customer->shirt_size)
                        <div class="info-row">
                            <div class="info-label">Ukuran Baju</div>
                            <div class="info-value">{{ $order->customer->shirt_size }}</div>
                        </div>
                        @endif
                    @endif
                </div>
            </div>
            
            <!-- Bib Number -->
            @if($order->bib_number)
            <div class="bib-number">
                <div class="bib-label">Nomor Punggung</div>
                <div class="bib-value">{{ $order->bib_number }}</div>
            </div>
            @endif
            
            <!-- Payment Info -->
            <div class="payment-info {{ $order->total_price == 0 ? 'payment-free' : 'payment-paid' }}">
                <div class="payment-title">Informasi Pembayaran</div>
                
                <div class="payment-details">
                    <div style="width: 100%;">
                        <div class="payment-item">
                            <span>Total Pembayaran:</span>
                            <span style="font-weight: bold;">
                                @if($order->total_price == 0)
                                    GRATIS
                                @else
                                    Rp {{ number_format($order->total_price, 0, ',', '.') }}
                                @endif
                            </span>
                        </div>
                        
                        <div class="payment-item">
                            <span>Metode Pembayaran:</span>
                            <span>{{ $order->payment_method ?? ($order->total_price == 0 ? 'Free' : 'Digital Payment') }}</span>
                        </div>
                        
                        <div class="payment-item">
                            <span>Tanggal Pembayaran:</span>
                            <span>{{ $order->paid_at ? $order->paid_at->format('d/m/Y H:i') : 'Belum dibayar' }}</span>
                        </div>
                        
                        <div class="payment-item">
                            <span>Referensi:</span>
                            <span>{{ $order->payment_reference ?? $order->order_number }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <div><strong>{{ $eventSettings->event_name ?? 'TIKET EVENT' }}</strong></div>
            <div>Diterbitkan pada {{ now()->format('d/m/Y H:i:s') }}</div>
            <div>&copy; {{ date('Y') }} Event Organizer. All rights reserved.</div>
        </div>
        </div>
    </div>
</body>
</html>
