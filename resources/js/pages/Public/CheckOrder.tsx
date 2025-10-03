import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Search, Download, ArrowLeft, CheckCircle, Clock, XCircle } from 'lucide-react';

interface Order {
  order_number: string;
  bib_number: string;
  status: string;
  ticket_name: string;
  customer_name: string;
  total_price: number;
  paid_at: string | null;
  can_download: boolean;
  download_url: string | null;
}

interface Props {
  eventSettings?: {
    event: Record<string, string>;
    contact: Record<string, string>;
  };
}

export default function CheckOrder({ eventSettings }: Props) {
  const [orderNumber, setOrderNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!orderNumber.trim()) {
      toast.error('Masukkan nomor pesanan');
      return;
    }

    setIsLoading(true);
    setOrder(null);

    try {
      const response = await fetch(route('new.tickets.check.submit'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({
          order_number: orderNumber.trim(),
        }),
      });

      const result = await response.json();

      if (result.success) {
        setOrder(result.order);
        toast.success('Order ditemukan');
      } else {
        toast.error(result.message || 'Order tidak ditemukan');
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Terjadi kesalahan saat mencari order');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (order?.download_url) {
      window.open(order.download_url, '_blank');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <Badge className="bg-green-500 hover:bg-green-600 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            LUNAS
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            MENUNGGU PEMBAYARAN
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            DIBATALKAN
          </Badge>
        );
      default:
        return <Badge variant="outline">{status.toUpperCase()}</Badge>;
    }
  };

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <>
      <Head title="Cek Status Pesanan" />
      
      <style>{`
        .bg-gradient-main {
          background: linear-gradient(135deg, #dbeafe 0%, #ffffff 50%, #dcfce7 100%);
        }
      `}</style>
      
      <div className="min-h-screen bg-gradient-main">
        {/* Header */}
        <header className="bg-white shadow-md">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img 
                  src={eventSettings?.event?.event_logo || "/logo.svg"} 
                  alt="Fun Run Logo" 
                  className="h-10 w-10 object-contain" 
                  onError={(e) => {
                    e.currentTarget.src = "/logo.svg";
                  }}
                />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    {eventSettings?.event?.event_name || 'Fun Run Event'}
                  </h1>
                  <p className="text-sm text-gray-600">Cek Status Pesanan</p>
                </div>
              </div>
              
              <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium">
                <ArrowLeft className="w-4 h-4 inline mr-1" />
                Kembali ke Beranda
              </Link>
            </div>
          </div>
        </header>

        <div className="container mx-auto max-w-4xl px-4 py-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Cek Status Pesanan
            </h2>
            <p className="text-gray-600">
              Masukkan nomor pesanan untuk melihat status dan download tiket
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Cari Pesanan</CardTitle>
              <CardDescription>
                Masukkan nomor pesanan Anda (contoh: TR-20250101-ABC123)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="order_number">Nomor Pesanan</Label>
                  <Input
                    id="order_number"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    placeholder="TR-20250101-ABC123"
                    required
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    'Mencari...'
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Cari Pesanan
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {order && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Detail Pesanan
                  {getStatusBadge(order.status)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-sm text-gray-600 uppercase tracking-wide">
                      Informasi Pesanan
                    </h3>
                    <div className="mt-2 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Nomor Pesanan:</span>
                        <span className="font-medium">{order.order_number}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Nomor BIB:</span>
                        <span className="font-bold text-lg text-blue-600">{order.bib_number}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Kategori Tiket:</span>
                        <span className="font-medium">{order.ticket_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total:</span>
                        <span className="font-medium text-green-600">
                          {order.total_price === 0 ? 'GRATIS' : formatRupiah(order.total_price)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-sm text-gray-600 uppercase tracking-wide">
                      Informasi Peserta
                    </h3>
                    <div className="mt-2 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Nama:</span>
                        <span className="font-medium">{order.customer_name}</span>
                      </div>
                      {order.paid_at && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Tanggal Bayar:</span>
                          <span className="font-medium">
                            {new Date(order.paid_at).toLocaleDateString('id-ID')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {order.status === 'paid' && (
                  <div className="pt-4 border-t">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-green-800">
                            ✅ Pesanan Berhasil!
                          </h4>
                          <p className="text-sm text-green-600 mt-1">
                            Tiket Anda sudah siap untuk didownload
                          </p>
                        </div>
                        <Button onClick={handleDownload} className="bg-green-600 hover:bg-green-700">
                          <Download className="w-4 h-4 mr-2" />
                          Download Tiket
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {order.status === 'pending' && (
                  <div className="pt-4 border-t">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="font-semibold text-yellow-800">
                        ⏳ Menunggu Pembayaran
                      </h4>
                      <p className="text-sm text-yellow-600 mt-1">
                        Silakan lakukan pembayaran untuk menyelesaikan pesanan Anda
                      </p>
                    </div>
                  </div>
                )}

                {order.status === 'cancelled' && (
                  <div className="pt-4 border-t">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h4 className="font-semibold text-red-800">
                        ❌ Pesanan Dibatalkan
                      </h4>
                      <p className="text-sm text-red-600 mt-1">
                        Pesanan ini telah dibatalkan
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}