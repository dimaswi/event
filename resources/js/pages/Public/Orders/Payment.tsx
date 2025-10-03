import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, CreditCard } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { useEffect } from 'react';

// Declare snap for TypeScript
declare global {
    interface Window {
        snap: any;
    }
}

interface Order {
    id: number;
    order_number: string;
    total_price: number;
    status: string;
    customer: {
        name: string;
        email: string;
        phone: string;
    };
    ticket: {
        name: string;
        price: number;
    };
    quantity: number;
}

interface Props {
    order: Order;
    snap_token: string;
    client_key: string;
}

export default function Payment({ order, snap_token, client_key }: Props) {
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const handlePayment = () => {
        if (window.snap) {
            window.snap.pay(snap_token, {
                onSuccess: function(result: any) {
                    console.log('Payment success:', result);
                    window.location.href = `/tickets/payment/finish?order_id=${order.order_number}`;
                },
                onPending: function(result: any) {
                    console.log('Payment pending:', result);
                    alert('Pembayaran Anda sedang diproses. Silakan tunggu konfirmasi.');
                },
                onError: function(result: any) {
                    console.log('Payment error:', result);
                    window.location.href = `/tickets/payment/error?order_id=${order.order_number}`;
                },
                onClose: function() {
                    console.log('Payment popup closed');
                }
            });
        }
    };

    return (
        <>
            <Head title={`Pembayaran - ${order.order_number}`}>
                <script 
                    type="text/javascript"
                    src="https://app.sandbox.midtrans.com/snap/snap.js"
                    data-client-key={client_key}
                />
            </Head>
            
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="container mx-auto px-4 max-w-2xl">
                    <div className="mb-6">
                        <Button variant="ghost" asChild>
                            <Link href="/tickets/order">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Kembali
                            </Link>
                        </Button>
                    </div>

                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold mb-2">Proses Pembayaran</h1>
                        <p className="text-gray-600">Lengkapi pembayaran untuk menyelesaikan pesanan Anda</p>
                    </div>

                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                Detail Pesanan
                                <Badge variant="outline">{order.order_number}</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Nama Pemesan:</span>
                                <span className="font-medium">{order.customer.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Email:</span>
                                <span className="font-medium">{order.customer.email}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Telepon:</span>
                                <span className="font-medium">{order.customer.phone}</span>
                            </div>
                            
                            <Separator />
                            
                            <div className="flex justify-between">
                                <span className="text-gray-600">Tiket:</span>
                                <span className="font-medium">{order.ticket.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Jumlah:</span>
                                <span className="font-medium">{order.quantity} tiket</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Harga per tiket:</span>
                                <span className="font-medium">{formatPrice(order.ticket.price)}</span>
                            </div>
                            
                            <Separator />
                            
                            <div className="flex justify-between text-lg font-bold">
                                <span>Total Pembayaran:</span>
                                <span className="text-green-600">{formatPrice(order.total_price)}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5" />
                                Pembayaran
                            </CardTitle>
                            <CardDescription>
                                Klik tombol di bawah untuk melanjutkan ke halaman pembayaran Midtrans
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button 
                                onClick={handlePayment}
                                className="w-full"
                                size="lg"
                            >
                                Bayar Sekarang
                            </Button>
                            
                            <div className="mt-4 text-center text-sm text-gray-500">
                                <p>Powered by Midtrans - Payment Gateway Terpercaya</p>
                                <p>Metode pembayaran: Bank Transfer, E-Wallet, Kartu Kredit/Debit</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
