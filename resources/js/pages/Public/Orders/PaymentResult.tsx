import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle, Clock, AlertTriangle, ArrowLeft, Download, Share } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface Customer {
    id: number;
    name: string;
    email: string;
    phone: string;
    nik: string;
    full_address: string;
    city: string;
    postal_code: string;
    shirt_size: string;
    emergency_contact_name: string;
    emergency_contact_phone: string;
}

interface Ticket {
    id: number;
    name: string;
    description?: string;
    price: number;
}

interface Order {
    id: number;
    order_number: string;
    quantity: number;
    total_price: number;
    status: string;
    payment_method?: string;
    created_at: string;
    paid_at?: string;
    customer: Customer;
    ticket: Ticket;
}

interface Props {
    order: Order;
    status: 'success' | 'pending' | 'failed' | 'cancelled';
    message?: string;
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

export default function PaymentResult({ order, status, message }: Props) {
    const getStatusConfig = () => {
        switch (status) {
            case 'success':
                return {
                    icon: <CheckCircle className="h-16 w-16 text-green-600" />,
                    title: 'Pembayaran Berhasil!',
                    description: 'Tiket Anda telah berhasil dibeli dan dikonfirmasi.',
                    bgColor: 'bg-green-50',
                    borderColor: 'border-green-200',
                    textColor: 'text-green-800',
                    badgeVariant: 'default' as const
                };
            case 'pending':
                return {
                    icon: <Clock className="h-16 w-16 text-yellow-600" />,
                    title: 'Pembayaran Sedang Diproses',
                    description: 'Pembayaran Anda sedang diverifikasi. Mohon tunggu konfirmasi.',
                    bgColor: 'bg-yellow-50',
                    borderColor: 'border-yellow-200',
                    textColor: 'text-yellow-800',
                    badgeVariant: 'secondary' as const
                };
            case 'failed':
                return {
                    icon: <XCircle className="h-16 w-16 text-red-600" />,
                    title: 'Pembayaran Gagal',
                    description: 'Terjadi kesalahan dalam proses pembayaran. Silakan coba lagi.',
                    bgColor: 'bg-red-50',
                    borderColor: 'border-red-200',
                    textColor: 'text-red-800',
                    badgeVariant: 'destructive' as const
                };
            case 'cancelled':
                return {
                    icon: <AlertTriangle className="h-16 w-16 text-gray-600" />,
                    title: 'Pembayaran Dibatalkan',
                    description: 'Pembayaran telah dibatalkan oleh pengguna.',
                    bgColor: 'bg-gray-50',
                    borderColor: 'border-gray-200',
                    textColor: 'text-gray-800',
                    badgeVariant: 'secondary' as const
                };
            default:
                return {
                    icon: <AlertTriangle className="h-16 w-16 text-gray-600" />,
                    title: 'Status Tidak Dikenal',
                    description: 'Status pembayaran tidak dapat diidentifikasi.',
                    bgColor: 'bg-gray-50',
                    borderColor: 'border-gray-200',
                    textColor: 'text-gray-800',
                    badgeVariant: 'secondary' as const
                };
        }
    };

    const statusConfig = getStatusConfig();

    return (
        <>
            <Head title={`${statusConfig.title} - Nomor Pesanan: ${order.order_number}`} />
            
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

                    <div className="max-w-2xl mx-auto">
                        {/* Status Card */}
                        <Card className={`mb-8 ${statusConfig.bgColor} ${statusConfig.borderColor}`}>
                            <CardContent className="pt-8">
                                <div className="text-center">
                                    <div className="flex justify-center mb-4">
                                        {statusConfig.icon}
                                    </div>
                                    <h1 className={`text-2xl font-bold mb-2 ${statusConfig.textColor}`}>
                                        {statusConfig.title}
                                    </h1>
                                    <p className={`text-base mb-4 ${statusConfig.textColor}`}>
                                        {statusConfig.description}
                                    </p>
                                    {message && (
                                        <p className={`text-sm ${statusConfig.textColor}`}>
                                            {message}
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Order Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Detail Pesanan</CardTitle>
                                <CardDescription>
                                    Informasi lengkap tentang pesanan Anda
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Order Summary */}
                                <div>
                                    <h3 className="font-semibold mb-4">Ringkasan Pesanan</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span>Nomor Pesanan:</span>
                                            <span className="font-mono">{order.order_number}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Status:</span>
                                            <Badge variant={statusConfig.badgeVariant}>
                                                {statusConfig.title}
                                            </Badge>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Tanggal Pesanan:</span>
                                            <span>{formatDate(order.created_at)}</span>
                                        </div>
                                        {order.paid_at && (
                                            <div className="flex justify-between">
                                                <span>Tanggal Pembayaran:</span>
                                                <span>{formatDate(order.paid_at)}</span>
                                            </div>
                                        )}
                                        {order.payment_method && (
                                            <div className="flex justify-between">
                                                <span>Metode Pembayaran:</span>
                                                <span className="capitalize">{order.payment_method.replace('_', ' ')}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <Separator />

                                {/* Ticket Details */}
                                <div>
                                    <h3 className="font-semibold mb-4">Detail Tiket</h3>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h4 className="font-medium">{order.ticket.name}</h4>
                                                {order.ticket.description && (
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        {order.ticket.description}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold">{formatCurrency(order.ticket.price)}</p>
                                                <p className="text-sm text-gray-600">× {order.quantity}</p>
                                            </div>
                                        </div>
                                        <Separator className="my-3" />
                                        <div className="flex justify-between font-bold">
                                            <span>Total:</span>
                                            <span className="text-primary">{formatCurrency(order.total_price)}</span>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                {/* Customer Details */}
                                <div>
                                    <h3 className="font-semibold mb-4">Informasi Peserta</h3>
                                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p><strong>Nama:</strong> {order.customer.name}</p>
                                            <p><strong>Email:</strong> {order.customer.email}</p>
                                            <p><strong>Telepon:</strong> {order.customer.phone}</p>
                                            <p><strong>NIK:</strong> {order.customer.nik}</p>
                                        </div>
                                        <div>
                                            <p><strong>Ukuran Baju:</strong> {order.customer.shirt_size}</p>
                                            <p><strong>Alamat:</strong> {order.customer.full_address}</p>
                                            <p><strong>Kontak Darurat:</strong> {order.customer.emergency_contact_name}</p>
                                            <p><strong>No. Darurat:</strong> {order.customer.emergency_contact_phone}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                                    {status === 'success' && (
                                        <>
                                            <Button className="flex-1" asChild>
                                                <Link href={`/tickets/orders/download/${order.order_number}`}>
                                                    <Download className="h-4 w-4 mr-2" />
                                                    Download E-Ticket
                                                </Link>
                                            </Button>
                                            <Button variant="outline" className="flex-1">
                                                <Share className="h-4 w-4 mr-2" />
                                                Bagikan
                                            </Button>
                                        </>
                                    )}
                                    
                                    {status === 'failed' && (
                                        <Button className="flex-1" asChild>
                                            <Link href="/tickets/order">
                                                Coba Lagi
                                            </Link>
                                        </Button>
                                    )}
                                    
                                    <Button variant="outline" className="flex-1" asChild>
                                        <Link href="/tickets/orders/check">
                                            Cek Status Pesanan
                                        </Link>
                                    </Button>
                                </div>

                                {/* Important Notes */}
                                {status === 'success' && (
                                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mt-6">
                                        <h4 className="font-semibold text-blue-800 mb-2">Informasi Penting:</h4>
                                        <ul className="text-sm text-blue-700 space-y-1">
                                            <li>• E-ticket telah dikirim ke email Anda</li>
                                            <li>• Simpan e-ticket untuk ditunjukkan saat check-in</li>
                                            <li>• Datang minimal 30 menit sebelum acara dimulai</li>
                                            <li>• Bawa identitas yang valid (KTP/SIM/Passport)</li>
                                        </ul>
                                    </div>
                                )}

                                {status === 'pending' && (
                                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mt-6">
                                        <h4 className="font-semibold text-yellow-800 mb-2">Menunggu Konfirmasi:</h4>
                                        <ul className="text-sm text-yellow-700 space-y-1">
                                            <li>• Pembayaran sedang diverifikasi</li>
                                            <li>• Proses ini biasanya memakan waktu 5-15 menit</li>
                                            <li>• Anda akan menerima email konfirmasi setelah pembayaran berhasil</li>
                                            <li>• Jika ada masalah, silakan hubungi customer service</li>
                                        </ul>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}
