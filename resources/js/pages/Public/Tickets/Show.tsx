import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, DollarSign, Users, Clock } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface Ticket {
    id: number;
    name: string;
    description?: string;
    price: number;
    stock: number;
    sold: number;
    sale_start_date?: string;
    sale_end_date?: string;
    is_active: boolean;
    image?: string;
    created_at: string;
}

interface Props {
    ticket: Ticket;
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

export default function Show({ ticket }: Props) {
    const remainingStock = ticket.stock - ticket.sold;
    const isAvailable = ticket.is_active && remainingStock > 0;
    const isSaleActive = (!ticket.sale_start_date || new Date(ticket.sale_start_date) <= new Date()) &&
                        (!ticket.sale_end_date || new Date(ticket.sale_end_date) >= new Date());

    return (
        <>
            <Head title={`${ticket.name} - Detail Tiket`} />
            
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

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Ticket Information */}
                        <div className="lg:col-span-2">
                            <Card>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-2xl mb-2">{ticket.name}</CardTitle>
                                            <div className="flex gap-2">
                                                <Badge variant={isAvailable && isSaleActive ? 'default' : 'secondary'}>
                                                    {isAvailable && isSaleActive ? 'Tersedia' : 'Tidak Tersedia'}
                                                </Badge>
                                                {!isSaleActive && ticket.sale_start_date && new Date(ticket.sale_start_date) > new Date() && (
                                                    <Badge variant="outline">Belum Mulai</Badge>
                                                )}
                                                {!isSaleActive && ticket.sale_end_date && new Date(ticket.sale_end_date) < new Date() && (
                                                    <Badge variant="destructive">Penjualan Berakhir</Badge>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-3xl font-bold text-primary">{formatCurrency(ticket.price)}</p>
                                            <p className="text-sm text-muted-foreground">per tiket</p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {ticket.image && (
                                        <div>
                                            <img
                                                src={`/storage/${ticket.image}`}
                                                alt={ticket.name}
                                                className="w-full rounded-lg shadow-sm"
                                            />
                                        </div>
                                    )}
                                    
                                    {ticket.description && (
                                        <div>
                                            <h3 className="text-lg font-semibold mb-2">Deskripsi</h3>
                                            <p className="text-gray-600 leading-relaxed">{ticket.description}</p>
                                        </div>
                                    )}

                                    <div>
                                        <h3 className="text-lg font-semibold mb-3">Informasi Tiket</h3>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                                <Users className="h-5 w-5 text-blue-600" />
                                                <div>
                                                    <p className="font-medium">Kapasitas</p>
                                                    <p className="text-sm text-gray-600">{ticket.stock} peserta</p>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                                <Users className="h-5 w-5 text-green-600" />
                                                <div>
                                                    <p className="font-medium">Terdaftar</p>
                                                    <p className="text-sm text-gray-600">{ticket.sold} peserta</p>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                                <Users className="h-5 w-5 text-orange-600" />
                                                <div>
                                                    <p className="font-medium">Sisa Kuota</p>
                                                    <p className="text-sm text-gray-600">{remainingStock} peserta</p>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                                <DollarSign className="h-5 w-5 text-purple-600" />
                                                <div>
                                                    <p className="font-medium">Harga</p>
                                                    <p className="text-sm text-gray-600">{formatCurrency(ticket.price)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {(ticket.sale_start_date || ticket.sale_end_date) && (
                                        <div>
                                            <h3 className="text-lg font-semibold mb-3">Periode Penjualan</h3>
                                            <div className="grid md:grid-cols-2 gap-4">
                                                {ticket.sale_start_date && (
                                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                                        <Calendar className="h-5 w-5 text-green-600" />
                                                        <div>
                                                            <p className="font-medium">Mulai Penjualan</p>
                                                            <p className="text-sm text-gray-600">{formatDate(ticket.sale_start_date)}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                {ticket.sale_end_date && (
                                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                                        <Clock className="h-5 w-5 text-red-600" />
                                                        <div>
                                                            <p className="font-medium">Berakhir Penjualan</p>
                                                            <p className="text-sm text-gray-600">{formatDate(ticket.sale_end_date)}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                                        <h4 className="font-semibold text-blue-900 mb-2">Kebijakan Pembelian</h4>
                                        <p className="text-sm text-blue-700">
                                            Setiap orang hanya dapat membeli maksimal 1 tiket berdasarkan NIK yang terdaftar.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Purchase Sidebar */}
                        <div className="lg:col-span-1">
                            <Card className="sticky top-8">
                                <CardHeader>
                                    <CardTitle>Daftar Sekarang</CardTitle>
                                    <CardDescription>
                                        Bergabunglah dengan Fun Run Event
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="text-center p-4 bg-primary/5 rounded-lg">
                                        <p className="text-3xl font-bold text-primary mb-1">{formatCurrency(ticket.price)}</p>
                                        <p className="text-sm text-gray-600">per peserta</p>
                                    </div>

                                    {isAvailable && isSaleActive ? (
                                        <div className="space-y-3">
                                            <div className="flex justify-between text-sm">
                                                <span>Sisa kuota:</span>
                                                <span className="font-medium">{remainingStock} peserta</span>
                                            </div>
                                            
                                            {remainingStock <= 10 && remainingStock > 0 && (
                                                <div className="text-center p-2 bg-orange-50 border border-orange-200 rounded text-orange-700 text-sm">
                                                    ⚠️ Hanya tersisa {remainingStock} tiket!
                                                </div>
                                            )}

                                            <Button asChild className="w-full" size="lg">
                                                <Link href="/tickets/order">
                                                    Daftar Sekarang
                                                </Link>
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                                <p className="text-gray-600 mb-2">
                                                    {remainingStock <= 0 ? 'Tiket Habis' : 
                                                     !ticket.is_active ? 'Tiket Tidak Aktif' :
                                                     !isSaleActive && ticket.sale_start_date && new Date(ticket.sale_start_date) > new Date() ? 'Penjualan Belum Dimulai' :
                                                     'Penjualan Telah Berakhir'}
                                                </p>
                                                {!isSaleActive && ticket.sale_start_date && new Date(ticket.sale_start_date) > new Date() && (
                                                    <p className="text-sm text-gray-500">
                                                        Mulai: {formatDate(ticket.sale_start_date)}
                                                    </p>
                                                )}
                                            </div>
                                            
                                            <Button disabled className="w-full" size="lg">
                                                Tidak Tersedia
                                            </Button>
                                        </div>
                                    )}

                                    <div className="pt-4 border-t">
                                        <h4 className="font-medium mb-2">Butuh bantuan?</h4>
                                        <p className="text-sm text-gray-600 mb-3">
                                            Hubungi tim customer service kami
                                        </p>
                                        <Button variant="outline" className="w-full" size="sm">
                                            Hubungi CS
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
