import { Head, useForm, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Search, Package, User, MapPin, Phone, Mail, CreditCard, Calendar, Download, Send, RefreshCw } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';

interface Customer {
    id: number;
    name: string;
    email: string;
    phone: string;
    nik: string;
    full_address: string;
    province: string;
    city: string;
    district: string;
    postal_code: string;
    birth_date: string;
    place_of_birth: string;
    gender: string;
    shirt_size: string;
    emergency_contact_name: string;
    emergency_contact_phone: string;
}

interface Ticket {
    id: number;
    name: string;
    description?: string;
    price: number;
    image?: string;
}

interface Order {
    id: number;
    order_number: string;
    bib_number?: string;
    quantity: number;
    total_price: number;
    status: string;
    created_at: string;
    customer: Customer;
    ticket: Ticket;
}

interface Props {
    initialOrder?: Order;
    searchedOrderNumber?: string;
    error?: string;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount);
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const formatBirthDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

const getStatusBadge = (status: string) => {
    const statusConfig = {
        awaiting_payment: { label: 'Menunggu Pembayaran', variant: 'secondary' as const, color: 'bg-yellow-100 text-yellow-800' },
        pending: { label: 'Menunggu Konfirmasi', variant: 'secondary' as const, color: 'bg-yellow-100 text-yellow-800' },
        paid: { label: 'Lunas', variant: 'default' as const, color: 'bg-green-100 text-green-800' },
        cancelled: { label: 'Dibatalkan', variant: 'destructive' as const, color: 'bg-red-100 text-red-800' },
        expired: { label: 'Kedaluwarsa', variant: 'destructive' as const, color: 'bg-gray-100 text-gray-800' },
        denied: { label: 'Ditolak', variant: 'destructive' as const, color: 'bg-red-100 text-red-800' },
        challenge: { label: 'Perlu Verifikasi', variant: 'secondary' as const, color: 'bg-orange-100 text-orange-800' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { 
        label: status, 
        variant: 'secondary' as const, 
        color: 'bg-gray-100 text-gray-800' 
    };
    
    return <Badge variant={config.variant}>{config.label}</Badge>;
};

const getPaymentStatusBadge = (status: string) => {
    const statusConfig = {
        awaiting_payment: { label: 'Belum Dibayar', variant: 'secondary' as const },
        pending: { label: 'Pembayaran Pending', variant: 'secondary' as const },
        paid: { label: 'Sudah Dibayar', variant: 'default' as const },
        cancelled: { label: 'Pembayaran Dibatalkan', variant: 'destructive' as const },
        expired: { label: 'Pembayaran Kedaluwarsa', variant: 'destructive' as const },
        denied: { label: 'Pembayaran Ditolak', variant: 'destructive' as const },
        challenge: { label: 'Pembayaran Perlu Verifikasi', variant: 'secondary' as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { 
        label: 'Status Tidak Dikenal', 
        variant: 'secondary' as const 
    };
    
    return <Badge variant={config.variant}>{config.label}</Badge>;
};

export default function CheckOrder({ initialOrder, searchedOrderNumber, error }: Props) {
    const { data, setData, post, processing } = useForm({
        order_number: searchedOrderNumber || ''
    });

    const [order, setOrder] = useState<Order | null>(initialOrder || null);
    const [refreshing, setRefreshing] = useState(false);
    const [processingPayment, setProcessingPayment] = useState(false);

    // Auto-load order if we have a searched order number
    useEffect(() => {
        if (initialOrder) {
            setOrder(initialOrder);
        }
    }, [initialOrder]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (data.order_number.trim()) {
            // Gunakan post form yang sudah ada di route
            post('/tickets/orders/check', {
                onSuccess: () => {
                    // Reset form akan dilakukan otomatis oleh Inertia
                },
                onError: () => {
                    // Error handling sudah ditangani di backend
                }
            });
        }
    };

    const handleRefreshStatus = async () => {
        if (!order) return;
        
        setRefreshing(true);
        
        try {
            const response = await fetch(`/tickets/payment/check-status/${order.order_number}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });
            
            const result = await response.json();
            
            if (result.success && result.order) {
                // Update state dengan data order yang fresh termasuk relasi
                setOrder(result.order);
                
                // Juga reload Inertia untuk memastikan data sinkron
                router.reload({ 
                    only: ['initialOrder'],
                    onSuccess: (page) => {
                        // Ambil data terbaru dari response Inertia
                        const freshOrder = (page.props as any).initialOrder;
                        if (freshOrder) {
                            setOrder(freshOrder);
                        }
                    }
                });
            } else {
                console.error('Failed to refresh order status:', result);
                // Fallback: reload seluruh halaman untuk memastikan data fresh
                router.reload();
            }
        } catch (error) {
            console.error('Error refreshing status:', error);
            // Fallback: reload seluruh halaman jika ada error
            router.reload();
        } finally {
            setRefreshing(false);
        }
    };

    // const handlePayNow = async () => {
    //     if (!order) {
    //         console.error('No order found');
    //         return;
    //     }
        
    //     console.log('Starting payment process for order:', order.order_number);
    //     setProcessingPayment(true);
        
    //     try {
    //         console.log('Calling API to generate snap token...');
    //         // Generate snap token baru untuk pembayaran ulang
    //         const response = await fetch(`/api/tickets/payment/${order.order_number}`, {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //                 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
    //             },
    //         });
            
    //         console.log('API Response status:', response.status);
            
    //         if (!response.ok) {
    //             const errorText = await response.text();
    //             console.error('API response not ok:', response.status, errorText);
    //             throw new Error(`HTTP error! status: ${response.status}`);
    //         }
            
    //         const result = await response.json();
    //         console.log('API result:', result);
            
    //         if (result.success && result.snapToken) {
    //             console.log('Got snap token, loading Midtrans script...');
                
    //             // Load Midtrans Snap if not already loaded
    //             if (!(window as any).snap) {
    //                 try {
    //                     console.log('Loading Midtrans Snap script...');
    //                     await new Promise((resolve, reject) => {
    //                         const script = document.createElement('script');
    //                         script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
    //                         script.setAttribute('data-client-key', 'Mid-client-71FrsK80eaLdEzWO');
    //                         script.onload = () => {
    //                             console.log('Midtrans script loaded successfully');
    //                             resolve(undefined);
    //                         };
    //                         script.onerror = (error) => {
    //                             console.error('Failed to load Midtrans script:', error);
    //                             reject(error);
    //                         };
    //                         document.head.appendChild(script);
    //                     });
    //                 } catch (scriptError) {
    //                     console.error('Error loading Midtrans script:', scriptError);
    //                     alert('Gagal memuat script pembayaran. Silakan refresh halaman dan coba lagi.');
    //                     setProcessingPayment(false);
    //                     return;
    //                 }
    //             }
                
    //             console.log('Opening Midtrans popup...');
    //             // Reset processing state sebelum buka popup
    //             setProcessingPayment(false);
                
    //             // Open payment popup
    //             (window as any).snap.pay(result.snapToken, {
    //                 onSuccess: function(result: any) {
    //                     console.log('Payment success:', result);
    //                     // Mark order as paid
    //                     fetch(`/api/orders/${order.order_number}/mark-paid`, {
    //                         method: 'POST',
    //                         headers: {
    //                             'Content-Type': 'application/json',
    //                             'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
    //                         },
    //                     }).then(() => {
    //                         console.log('Order marked as paid successfully');
    //                         // Refresh untuk melihat status terbaru
    //                         window.location.reload();
    //                     }).catch((error) => {
    //                         console.error('Error marking order as paid:', error);
    //                         // Still refresh to check status
    //                         window.location.reload();
    //                     });
    //                 },
    //                 onPending: function(result: any) {
    //                     console.log('Payment pending:', result);
    //                     // Refresh status after a short delay
    //                     setTimeout(() => {
    //                         handleRefreshStatus();
    //                     }, 2000);
    //                 },
    //                 onError: function(result: any) {
    //                     console.log('Payment error:', result);
    //                     alert('Pembayaran gagal. Silakan coba lagi.');
    //                 },
    //                 onClose: function() {
    //                     console.log('Payment popup closed');
    //                     // Check status in case payment was completed but popup closed early
    //                     setTimeout(() => {
    //                         handleRefreshStatus();
    //                     }, 1000);
    //                 }
    //             });
    //         } else {
    //             console.error('Invalid API response:', result);
    //             alert(result.message || 'Gagal memuat pembayaran. Silakan coba lagi.');
    //             setProcessingPayment(false);
    //         }
    //     } catch (error) {
    //         console.error('Error in handlePayNow:', error);
    //         alert('Terjadi kesalahan. Silakan coba lagi.');
    //         setProcessingPayment(false);
    //     }
    // };

    return (
        <>
            <Head title="Cek Status Pesanan" />
            
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="container mx-auto px-4">
                    <div className="mb-6">
                        <Button variant="ghost" asChild>
                            <Link href="/">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Kembali ke Beranda
                            </Link>
                        </Button>
                    </div>

                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold mb-2">Cek Status Pesanan</h1>
                            <p className="text-gray-600">Masukkan nomor pesanan untuk melihat detail dan status pembayaran</p>
                        </div>

                        {/* Search Form */}
                        <Card className="mb-8">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Search className="h-5 w-5" />
                                    Cari Pesanan
                                </CardTitle>
                                <CardDescription>
                                    Masukkan nomor pesanan yang Anda terima via email
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSearch} className="flex gap-4">
                                    <div className="flex-1">
                                        <Label htmlFor="order_number">Nomor Pesanan</Label>
                                        <Input
                                            id="order_number"
                                            value={data.order_number}
                                            onChange={(e) => setData('order_number', e.target.value)}
                                            placeholder="Contoh: FR-20240829-001"
                                            className="mt-1"
                                        />
                                    </div>
                                    <div className="pt-6">
                                        <Button type="submit" disabled={processing || !data.order_number.trim()}>
                                            {processing ? 'Mencari...' : 'Cari Pesanan'}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Error Message */}
                        {error && (
                            <Card className="mb-8 border-red-200 bg-red-50">
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-2 text-red-700">
                                        <Package className="h-5 w-5" />
                                        <p>{error}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Order Details */}
                        {order && (
                            <div className="space-y-6">
                                {/* Order Status */}
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="flex items-center gap-2">
                                                <Package className="h-5 w-5" />
                                                Informasi Pesanan
                                            </CardTitle>
                                            {(order.status === 'awaiting_payment' || order.status === 'pending') && (
                                                <Button 
                                                    variant="outline" 
                                                    size="sm"
                                                    onClick={handleRefreshStatus}
                                                    disabled={refreshing}
                                                >
                                                    <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                                                    {refreshing ? 'Memperbarui...' : 'Periksa Status'}
                                                </Button>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <div>
                                                    <Label className="text-sm font-medium text-gray-500">Nomor Pesanan</Label>
                                                    <p className="text-lg font-semibold">{order.order_number}</p>
                                                </div>
                                                <div>
                                                    <Label className="text-sm font-medium text-gray-500">Status Pesanan</Label>
                                                    <div className="mt-1">{getStatusBadge(order.status)}</div>
                                                </div>
                                                <div>
                                                    <Label className="text-sm font-medium text-gray-500">Status Pembayaran</Label>
                                                    <div className="mt-1">{getPaymentStatusBadge(order.status)}</div>
                                                </div>
                                                {order.bib_number && (
                                                    <div>
                                                        <Label className="text-sm font-medium text-gray-500">Nomor Punggung</Label>
                                                        <div className="mt-1">
                                                            <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200 font-mono text-lg px-3 py-1">
                                                                {order.bib_number}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="space-y-4">
                                                <div>
                                                    <Label className="text-sm font-medium text-gray-500">Tanggal Pesanan</Label>
                                                    <p className="text-sm">{formatDate(order.created_at)}</p>
                                                </div>
                                                <div>
                                                    <Label className="text-sm font-medium text-gray-500">Total Pembayaran</Label>
                                                    <p className="text-lg font-semibold text-primary">{formatCurrency(order.total_price)}</p>
                                                </div>
                                                <div>
                                                    <Label className="text-sm font-medium text-gray-500">Jumlah Tiket</Label>
                                                    <p className="text-sm">{order.quantity} tiket</p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Ticket Details */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Package className="h-5 w-5" />
                                            Detail Tiket
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex gap-4">
                                            {order.ticket?.image && (
                                                <img
                                                    src={`/storage/${order.ticket.image}`}
                                                    alt={order.ticket.name || 'Ticket'}
                                                    className="w-24 h-24 object-cover rounded-lg"
                                                />
                                            )}
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold">{order.ticket?.name || 'Tiket'}</h3>
                                                {order.ticket?.description && (
                                                    <p className="text-gray-600 text-sm mt-1">{order.ticket.description}</p>
                                                )}
                                                <div className="mt-2 flex items-center gap-4">
                                                    <span className="text-lg font-semibold text-primary">
                                                        {order.ticket?.price ? formatCurrency(order.ticket.price) : 'Rp 0'}
                                                    </span>
                                                    <span className="text-sm text-gray-500">per tiket</span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Customer Information */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <User className="h-5 w-5" />
                                            Data Peserta
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <User className="h-4 w-4 text-gray-500" />
                                                    <div>
                                                        <Label className="text-sm font-medium text-gray-500">Nama Lengkap</Label>
                                                        <p className="text-sm">{order.customer?.name || '-'}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Mail className="h-4 w-4 text-gray-500" />
                                                    <div>
                                                        <Label className="text-sm font-medium text-gray-500">Email</Label>
                                                        <p className="text-sm">{order.customer?.email || '-'}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Phone className="h-4 w-4 text-gray-500" />
                                                    <div>
                                                        <Label className="text-sm font-medium text-gray-500">Telepon</Label>
                                                        <p className="text-sm">{order.customer?.phone || '-'}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <CreditCard className="h-4 w-4 text-gray-500" />
                                                    <div>
                                                        <Label className="text-sm font-medium text-gray-500">NIK</Label>
                                                        <p className="text-sm">{order.customer?.nik || '-'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="flex items-start gap-3">
                                                    <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                                                    <div>
                                                        <Label className="text-sm font-medium text-gray-500">Alamat</Label>
                                                        <p className="text-sm">{order.customer?.full_address || '-'}</p>
                                                        {order.customer?.district && (
                                                            <p className="text-sm text-gray-500">
                                                                {order.customer.district}, {order.customer.city}, {order.customer.province} {order.customer.postal_code}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Calendar className="h-4 w-4 text-gray-500" />
                                                    <div>
                                                        <Label className="text-sm font-medium text-gray-500">Tanggal Lahir</Label>
                                                        <p className="text-sm">
                                                            {order.customer?.birth_date ? formatBirthDate(order.customer.birth_date) : '-'} 
                                                            {order.customer?.place_of_birth && ` (${order.customer.place_of_birth})`}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Package className="h-4 w-4 text-gray-500" />
                                                    <div>
                                                        <Label className="text-sm font-medium text-gray-500">Ukuran Baju</Label>
                                                        <p className="text-sm">{order.customer?.shirt_size || '-'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <Separator className="my-6" />

                                        <div>
                                            <Label className="text-sm font-medium text-gray-500">Kontak Darurat</Label>
                                            <div className="mt-2 flex gap-6">
                                                <div>
                                                    <p className="text-sm font-medium">{order.customer?.emergency_contact_name || '-'}</p>
                                                    <p className="text-sm text-gray-600">{order.customer?.emergency_contact_phone || '-'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Payment Actions */}
                                {(order.status === 'awaiting_payment' || order.status === 'pending') && (
                                    <Card className="border-orange-200 bg-orange-50">
                                        <CardContent className="pt-6">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="font-semibold text-orange-900">Menunggu Pembayaran</h3>
                                                    <p className="text-sm text-orange-700">
                                                        Silakan lakukan pembayaran untuk mengkonfirmasi pesanan Anda
                                                    </p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm"
                                                        onClick={handleRefreshStatus}
                                                        disabled={refreshing}
                                                    >
                                                        <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                                                        {refreshing ? 'Memperbarui...' : 'Periksa Status'}
                                                    </Button>
                                                    {/* <Button 
                                                        onClick={handlePayNow}
                                                        disabled={processingPayment}
                                                        className="bg-primary hover:bg-primary/90"
                                                    >
                                                        {processingPayment ? 'Memuat...' : 'Bayar Sekarang'}
                                                    </Button> */}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {order.status === 'paid' && (
                                    <Card className="border-green-200 bg-green-50">
                                        <CardContent className="pt-6">
                                            <div className="text-center">
                                                <h3 className="font-semibold text-green-900 mb-2">Pembayaran Berhasil!</h3>
                                                <p className="text-sm text-green-700 mb-4">
                                                    Tiket Anda telah terkonfirmasi. Terima kasih telah mendaftar!
                                                </p>
                                                <div className="flex justify-center gap-3">
                                                    <Button variant="outline" size="sm" asChild>
                                                        <Button 
                                                            className='text-black'
                                                            onClick={() => { window.location.href = `/tickets/orders/download/${order.order_number}` }}
                                                        >
                                                            <Download className="h-4 w-4 mr-2" />
                                                            Download Tiket
                                                        </Button>
                                                    </Button>
                                                    <Button variant="outline" size="sm">
                                                        <Send className="h-4 w-4 mr-2" />
                                                        Kirim Ulang Email
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
