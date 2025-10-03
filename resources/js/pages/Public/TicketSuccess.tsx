import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Download, ArrowLeft, User, Ticket, Calendar } from 'lucide-react';

interface OrderData {
  id: number;
  order_number: string;
  bib_number: string;
  ticket: {
    name: string;
    price: number;
  };
  total_price: number;
  status: string;
  form_data: Record<string, any>;
  created_at: string;
}

interface Props {
  order: OrderData;
  eventSettings?: {
    event: Record<string, string>;
    contact: Record<string, string>;
    footer: Record<string, string>;
  };
}

export default function TicketSuccess({ order, eventSettings }: Props) {
  const formatPrice = (price: number) => {
    if (price === 0) {
      return 'GRATIS';
    }
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      <Head title="Pendaftaran Berhasil - Fun Run Event" />
      
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img 
                  src={eventSettings?.event?.event_logo || "/logo.svg"} 
                  alt="Event Logo" 
                  className="h-10 w-10 object-contain" 
                />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    {eventSettings?.event?.event_name || 'TIKET EVENT'}
                  </h1>
                  <p className="text-sm text-gray-600">Pendaftaran Berhasil</p>
                </div>
              </div>
              
              <Link href="/" className="flex items-center text-blue-600 hover:text-blue-700 font-medium">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Beranda
              </Link>
            </div>
          </div>
        </header>

        <div className="container mx-auto max-w-4xl px-4 py-8">
          {/* Success Message */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Pendaftaran Berhasil!
            </h2>
            <p className="text-gray-600 text-lg">
              Terima kasih telah mendaftar. Berikut adalah detail pendaftaran Anda.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Order Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ticket className="w-5 h-5" />
                  Detail Tiket
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Nomor Order:</span>
                  <span className="font-mono font-medium">{order.order_number}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Nomor BIB:</span>
                  <Badge variant="outline" className="font-mono">
                    #{order.bib_number}
                  </Badge>
                </div>

                <Separator />

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Kategori:</span>
                  <span className="font-medium">{order.ticket.name}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Status:</span>
                  <Badge variant={order.status === 'paid' ? 'default' : 'secondary'}>
                    {order.status === 'paid' ? 'Lunas' : 'Menunggu Pembayaran'}
                  </Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Biaya:</span>
                  <span className="font-bold text-lg text-primary">
                    {formatPrice(order.total_price)}
                  </span>
                </div>

                <div className="flex justify-between items-start">
                  <span className="text-sm text-gray-600">Tanggal Daftar:</span>
                  <span className="text-sm text-right">{formatDate(order.created_at)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Participant Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Data Peserta
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(order.form_data).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-start">
                    <span className="text-sm text-gray-600 capitalize">
                      {key.replace('_', ' ')}:
                    </span>
                    <span className="text-sm font-medium text-right max-w-xs">
                      {typeof value === 'boolean' 
                        ? (value ? 'Ya' : 'Tidak')
                        : (value || 'N/A')
                      }
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              asChild
              size="lg"
              className="min-w-48"
            >
              <a 
                href={`/tickets/download/${order.order_number}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download Tiket PDF
              </a>
            </Button>

            <Button 
              variant="outline" 
              size="lg"
              asChild
              className="min-w-48"
            >
              <Link href="/">
                Kembali ke Beranda
              </Link>
            </Button>
          </div>

          {/* Info Box */}
          <Card className="mt-8 bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-2">Informasi Penting</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Simpan nomor order dan tiket PDF Anda dengan baik</li>
                    <li>• Tunjukkan tiket PDF saat pengambilan race pack</li>
                    <li>• Hubungi panitia jika ada pertanyaan</li>
                    {order.status !== 'paid' && (
                      <li className="text-orange-700 font-medium">
                        • Selesaikan pembayaran untuk mengaktifkan tiket
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}