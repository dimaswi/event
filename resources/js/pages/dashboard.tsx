import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Settings, TicketIcon, ShoppingCart, Calendar, Clock, TrendingUp, DollarSign, AlertCircle, CheckCircle, Users, LayoutGrid, Home, BookOpen, Search } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard({ stats = {} }: { stats?: any }) {
    // Debug: tampilkan props yang diterima
    console.log('Dashboard props:', { stats });
    
    // Default values jika stats undefined
    const defaultStats = {
        total_tickets: 0,
        tickets_growth: 0,
        total_orders: 0,
        orders_growth: 0,
        total_sales: 0,
        sales_growth: 0,
        pending_payments: 0,
        total_customers: 0,
        target_achievement: 0,
        awaiting_payments: 0,
        paid_orders: 0,
        cancelled_orders: 0,
        expired_orders: 0,
    };

    // Merge dengan default values
    const safeStats = { ...defaultStats, ...stats };
    
    console.log('Safe stats:', safeStats);

    // Format mata uang Indonesia
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount || 0);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="p-4">
                {/* Welcome Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-semibold text-gray-900">Dashboard Admin</h1>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <TicketIcon className="h-6 w-6 text-blue-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Total Tiket</p>
                                    <p className="text-2xl font-bold text-gray-900">{safeStats.total_tickets}</p>
                                    <p className="text-xs text-green-600">+{safeStats.tickets_growth} dari bulan lalu</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <ShoppingCart className="h-6 w-6 text-green-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Total Pesanan</p>
                                    <p className="text-2xl font-bold text-gray-900">{safeStats.total_orders}</p>
                                    <p className="text-xs text-green-600">
                                        {safeStats.orders_growth >= 0 ? '+' : ''}{safeStats.orders_growth}% dari minggu lalu
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <DollarSign className="h-6 w-6 text-purple-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Total Penjualan</p>
                                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(safeStats.total_sales)}</p>
                                    <p className="text-xs text-green-600">
                                        {safeStats.sales_growth >= 0 ? '+' : ''}{safeStats.sales_growth}% dari bulan lalu
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <div className="p-2 bg-orange-100 rounded-lg">
                                    <Clock className="h-6 w-6 text-orange-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Pending Payment</p>
                                    <p className="text-2xl font-bold text-gray-900">{safeStats.pending_payments}</p>
                                    <p className="text-xs text-orange-600">Perlu follow up</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <Settings className="h-5 w-5 text-blue-600" />
                                <CardTitle className="text-lg">Event Settings</CardTitle>
                            </div>
                            <CardDescription>
                                Kelola informasi event dan konten website
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button asChild className="w-full">
                                <Link href={route('admin.event-settings.index')}>
                                    Kelola Settings
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                    
                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <TicketIcon className="h-5 w-5 text-green-600" />
                                <CardTitle className="text-lg">Manajemen Tiket</CardTitle>
                            </div>
                            <CardDescription>
                                Kelola kategori tiket, harga, dan stok
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button asChild className="w-full">
                                <Link href="/admin/tickets">
                                    Kelola Tiket
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                    
                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <ShoppingCart className="h-5 w-5 text-orange-600" />
                                <CardTitle className="text-lg">Manajemen Pesanan</CardTitle>
                            </div>
                            <CardDescription>
                                Kelola pesanan, status, dan pembayaran
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button asChild className="w-full">
                                <Link href="/admin/orders">
                                    Kelola Pesanan
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Information Panels */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                Panduan Cepat
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-xs font-semibold text-green-600">1</div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Konfigurasi Event Settings</p>
                                        <p className="text-xs text-gray-500">Atur informasi dasar event seperti nama, tanggal, dan lokasi</p>
                                        <Button size="sm" variant="outline" className="mt-2" asChild>
                                            <Link href={route('admin.event-settings.index')}>Mulai Setup</Link>
                                        </Button>
                                    </div>
                                </div>
                                
                                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-semibold text-blue-600">2</div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Buat Kategori Tiket</p>
                                        <p className="text-xs text-gray-500">Tentukan jenis tiket, harga, dan kuota untuk event</p>
                                        <Button size="sm" variant="outline" className="mt-2" asChild>
                                            <Link href="/admin/tickets">Kelola Tiket</Link>
                                        </Button>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-xs font-semibold text-purple-600">3</div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Monitor Pesanan</p>
                                        <p className="text-xs text-gray-500">Pantau pesanan masuk dan status pembayaran</p>
                                        <Button size="sm" variant="outline" className="mt-2" asChild>
                                            <Link href="/admin/orders">Lihat Pesanan</Link>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-orange-600" />
                                Status & Notifikasi
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Sistem Aktif</p>
                                            <p className="text-xs text-gray-500">Event management berjalan normal</p>
                                        </div>
                                    </div>
                                    <Badge variant="default" className="bg-green-100 text-green-700">Online</Badge>
                                </div>
                                
                                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-yellow-600" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{safeStats.pending_payments} Pembayaran Pending</p>
                                            <p className="text-xs text-gray-500">
                                                {safeStats.awaiting_payments} menunggu, {safeStats.pending_payments - safeStats.awaiting_payments} pending
                                            </p>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="border-yellow-300 text-yellow-700">Pending</Badge>
                                </div>
                                
                                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{safeStats.paid_orders} Pembayaran Berhasil</p>
                                            <p className="text-xs text-gray-500">Transaksi yang sudah dikonfirmasi</p>
                                        </div>
                                    </div>
                                    <Badge className="bg-green-100 text-green-700">Paid</Badge>
                                </div>
                                
                                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-blue-600" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{safeStats.total_customers} Peserta Terdaftar</p>
                                            <p className="text-xs text-gray-500">Total registrasi hingga hari ini</p>
                                        </div>
                                    </div>
                                    <Badge variant="secondary">Active</Badge>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4 text-purple-600" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Target {safeStats.target_achievement}% Tercapai</p>
                                            <p className="text-xs text-gray-500">Penjualan tiket berjalan baik</p>
                                        </div>
                                    </div>
                                    <Badge className="bg-purple-100 text-purple-700">
                                        {safeStats.target_achievement >= 70 ? 'On Track' : 'Need Push'}
                                    </Badge>
                                </div>

                                {(safeStats.cancelled_orders > 0 || safeStats.expired_orders > 0) && (
                                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                                        <div className="flex items-center gap-2">
                                            <AlertCircle className="h-4 w-4 text-red-600" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {safeStats.cancelled_orders + safeStats.expired_orders} Pesanan Dibatalkan
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {safeStats.cancelled_orders} dibatalkan, {safeStats.expired_orders} kadaluarsa
                                                </p>
                                            </div>
                                        </div>
                                        <Badge variant="destructive">Cancelled</Badge>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Public Pages Section */}
                <div className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <LayoutGrid className="h-5 w-5 text-indigo-600" />
                                Public Pages
                            </CardTitle>
                            <CardDescription>
                                Akses cepat ke halaman publik untuk melihat tampilan pengunjung
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 transition-colors">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2 bg-indigo-100 rounded-lg">
                                            <Home className="h-5 w-5 text-indigo-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-gray-900">Landing Page</h3>
                                            <p className="text-sm text-gray-500">Halaman utama website</p>
                                        </div>
                                    </div>
                                    <Button variant="outline" size="sm" className="w-full" asChild>
                                        <Link href="/" target="_blank">
                                            Buka Halaman
                                        </Link>
                                    </Button>
                                </div>

                                <div className="p-4 border border-gray-200 rounded-lg hover:border-green-300 transition-colors">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2 bg-green-100 rounded-lg">
                                            <BookOpen className="h-5 w-5 text-green-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-gray-900">Daftar Event</h3>
                                            <p className="text-sm text-gray-500">Formulir pendaftaran tiket</p>
                                        </div>
                                    </div>
                                    <Button variant="outline" size="sm" className="w-full" asChild>
                                        <Link href="/order" target="_blank">
                                            Buka Halaman
                                        </Link>
                                    </Button>
                                </div>

                                <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <Search className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-gray-900">Cek Status Pesanan</h3>
                                            <p className="text-sm text-gray-500">Lacak status pembayaran</p>
                                        </div>
                                    </div>
                                    <Button variant="outline" size="sm" className="w-full" asChild>
                                        <Link href="/check" target="_blank">
                                            Buka Halaman
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
