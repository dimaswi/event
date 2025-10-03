import { Head, useForm, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ArrowLeft, Save, Trash2, User, Mail, Phone, MapPin, Calendar, Package, Loader2, Download, ShoppingBag, Clock, CheckCircle, CreditCard } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Link } from '@inertiajs/react';
import { toast } from 'sonner';
import { route } from 'ziggy-js';

interface Customer {
    id?: number | null;
    name?: string;
    email?: string;
    phone?: string;
    nik?: string;
    full_address?: string;
    province?: string;
    city?: string;
    district?: string;
    postal_code?: string;
    birth_date?: string;
    place_of_birth?: string;
    gender?: string;
    shirt_size?: string;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    // Legacy fields for backward compatibility
    date_of_birth?: string;
    address?: string;
    t_shirt_size?: string;
    medical_conditions?: string;
}

interface FormField {
    id: number;
    name: string;
    label: string;
    type: string;
    required: boolean;
    options?: string;
}

interface Ticket {
    id: number;
    name: string;
    price: number;
    description?: string;
}

interface Order {
    id: number;
    order_number: string;
    bib_number?: string;
    customer?: Customer;
    form_data?: Record<string, any>;
    ticket: Ticket;
    quantity: number;
    unit_price: number;
    total_price: number;
    status: 'awaiting_payment' | 'pending' | 'paid' | 'cancelled' | 'expired' | 'denied' | 'challenge';
    payment_method?: string;
    payment_reference?: string;
    paid_at?: string;
    notes?: string;
    race_pack_collected: boolean;
    race_pack_collected_at?: string;
    race_pack_collected_by?: string;
    created_at: string;
    updated_at: string;
}

interface Props {
    order: Order;
    formFields?: FormField[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: <Package className="h-4 w-4 mr-2" />,
        href: '/admin/orders',
    },
    {
        title: 'Detail Pesanan',
        href: '#',
    },
];

export default function Show({ order, formFields = [] }: Props) {
    const { data: statusData, setData: setStatusData, put: updateStatus, processing: statusProcessing } = useForm({
        status: order.status,
    });

    // Helper function untuk mendapatkan data customer dari form dinamis
    const getCustomerInfo = () => {
        // Prioritas: customer object (backward compatibility) -> form_data
        return {
            name: order.customer?.name || order.form_data?.name || 'Unknown',
            email: order.customer?.email || order.form_data?.email || 'N/A',
            phone: order.customer?.phone || order.form_data?.phone || 'N/A',
            nik: order.customer?.nik || order.form_data?.nik || null,
            birth_date: order.customer?.birth_date || order.customer?.date_of_birth || order.form_data?.birth_date || order.form_data?.date_of_birth || null,
            place_of_birth: order.customer?.place_of_birth || order.form_data?.place_of_birth || null,
            gender: order.customer?.gender || order.form_data?.gender || null,
            full_address: order.customer?.full_address || order.customer?.address || order.form_data?.full_address || order.form_data?.address || null,
            district: order.customer?.district || order.form_data?.district || null,
            city: order.customer?.city || order.form_data?.city || null,
            province: order.customer?.province || order.form_data?.province || null,
            postal_code: order.customer?.postal_code || order.form_data?.postal_code || null,
            shirt_size: order.customer?.shirt_size || order.customer?.t_shirt_size || order.form_data?.shirt_size || order.form_data?.t_shirt_size || null,
            emergency_contact_name: order.customer?.emergency_contact_name || order.form_data?.emergency_contact_name || null,
            emergency_contact_phone: order.customer?.emergency_contact_phone || order.form_data?.emergency_contact_phone || null,
            medical_conditions: order.customer?.medical_conditions || order.form_data?.medical_conditions || null,
        };
    };

    // Helper function untuk mendapatkan data form dinamis
    const getDynamicFormData = () => {
        if (!order.form_data || !formFields.length) return [];
        
        return formFields
            .filter(field => order.form_data && order.form_data[field.name])
            .map(field => ({
                label: field.label,
                value: order.form_data![field.name],
                type: field.type,
                name: field.name
            }));
    };

    const customerInfo = getCustomerInfo();
    const dynamicFormData = getDynamicFormData();

    const handleStatusUpdate = () => {
        updateStatus(`/admin/orders/${order.id}/status`, {
            onSuccess: () => {
                toast.success('Status pesanan berhasil diperbarui');
            },
            onError: () => {
                toast.error('Gagal memperbarui status pesanan');
            }
        });
    };

    const formatRupiah = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatBirthDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            awaiting_payment: { label: 'Menunggu Pembayaran', variant: 'secondary' as const },
            pending: { label: 'Menunggu Konfirmasi', variant: 'secondary' as const },
            paid: { label: 'Lunas', variant: 'default' as const },
            cancelled: { label: 'Dibatalkan', variant: 'destructive' as const },
            expired: { label: 'Kedaluwarsa', variant: 'destructive' as const },
            denied: { label: 'Ditolak', variant: 'destructive' as const },
            challenge: { label: 'Perlu Verifikasi', variant: 'secondary' as const },
        };
        return statusConfig[status as keyof typeof statusConfig] || { label: status, variant: 'secondary' as const };
    };

    const statusBadge = getStatusBadge(order.status);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Order ${order.order_number}`} />
            <div className="p-4">
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Package className="h-5 w-5 text-blue-600" />
                        <h1 className="text-xl font-semibold">Detail Pesanan: {order.order_number}</h1>
                    </div>
                    <Button 
                        variant="outline" 
                        onClick={() => router.visit('/admin/orders')}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Kembali ke Pesanan
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Order Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Order Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Informasi Pesanan</CardTitle>
                                <p className="text-sm text-muted-foreground">
                                    {formatDate(order.created_at)}
                                </p>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-muted-foreground">Nomor Pesanan</p>
                                        <p className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{order.order_number}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-muted-foreground">Total Harga</p>
                                        <p className="text-lg font-bold text-green-600">{formatRupiah(order.total_price)}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-muted-foreground">Status</p>
                                        <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-muted-foreground">Jumlah</p>
                                        <p className="font-medium">{order.quantity} item</p>
                                    </div>
                                </div>
                                
                                {order.payment_method && (
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-muted-foreground">Metode Pembayaran</p>
                                        <p className="font-medium">{order.payment_method}</p>
                                    </div>
                                )}

                                {order.payment_reference && (
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-muted-foreground">Referensi Pembayaran</p>
                                        <p className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{order.payment_reference}</p>
                                    </div>
                                )}

                                {order.paid_at && (
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-muted-foreground">Tanggal Pembayaran</p>
                                        <p className="font-medium">{formatDate(order.paid_at)}</p>
                                    </div>
                                )}

                                {order.bib_number && (
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-muted-foreground">Nomor Punggung</p>
                                        <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200 font-mono text-lg px-3 py-1">
                                            {order.bib_number}
                                        </Badge>
                                    </div>
                                )}

                                {order.status === 'paid' && (
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-muted-foreground">Status Perbekalan</p>
                                        {order.race_pack_collected ? (
                                            <div className="space-y-1">
                                                <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                                                    ✓ Sudah Diambil
                                                </Badge>
                                                {order.race_pack_collected_at && (
                                                    <p className="text-xs text-muted-foreground">
                                                        {new Date(order.race_pack_collected_at).toLocaleString('id-ID')}
                                                        {order.race_pack_collected_by && ` oleh ${order.race_pack_collected_by}`}
                                                    </p>
                                                )}
                                            </div>
                                        ) : (
                                            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                                                Belum Diambil
                                            </Badge>
                                        )}
                                    </div>
                                )}

                                {order.notes && (
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-muted-foreground">Catatan</p>
                                        <p className="text-sm bg-gray-50 p-3 rounded">{order.notes}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Ticket Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Informasi Tiket</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                                    <div className="flex-1">
                                        <h4 className="font-medium text-lg">{order.ticket.name}</h4>
                                        {order.ticket.description && (
                                            <p className="text-sm text-muted-foreground mt-1">{order.ticket.description}</p>
                                        )}
                                        <div className="flex items-center gap-4 mt-3 text-sm">
                                            <span className="font-medium">Harga Satuan: {formatRupiah(order.unit_price)}</span>
                                            <span className="text-muted-foreground">×</span>
                                            <span className="font-medium">Jumlah: {order.quantity}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-muted-foreground">Total</p>
                                        <p className="text-xl font-bold text-blue-600">{formatRupiah(order.total_price)}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Customer Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Informasi Peserta</CardTitle>
                                <CardDescription>
                                    Data peserta yang mengikuti event
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Dynamic Form Data */}
                                {dynamicFormData.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {dynamicFormData.map((field, index) => (
                                            <div key={index} className="space-y-1">
                                                <p className="text-sm font-medium text-muted-foreground">
                                                    {field.label}
                                                </p>
                                                <p className="font-medium">
                                                    {field.type === 'checkbox' ? 
                                                        (field.value ? 'Ya' : 'Tidak') :
                                                        field.type === 'date' ?
                                                        formatBirthDate(field.value) :
                                                        field.value
                                                    }
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <User className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                        <p>Tidak ada data form untuk ditampilkan</p>
                                        <p className="text-sm">Data peserta tidak tersedia atau menggunakan sistem lama</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Status Management */}
                    <div className="space-y-6">
                        {/* Update Order Status */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Perbarui Status</CardTitle>
                                <CardDescription>
                                    Ubah status pemrosesan pesanan
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Status Saat Ini</label>
                                    <div>
                                        <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                                    </div>
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Status Baru</label>
                                    <Select 
                                        value={statusData.status} 
                                        onValueChange={(value) => setStatusData('status', value as any)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="awaiting_payment">Menunggu Pembayaran</SelectItem>
                                            <SelectItem value="pending">Menunggu Konfirmasi</SelectItem>
                                            <SelectItem value="paid">Lunas</SelectItem>
                                            <SelectItem value="cancelled">Dibatalkan</SelectItem>
                                            <SelectItem value="expired">Kedaluwarsa</SelectItem>
                                            <SelectItem value="denied">Ditolak</SelectItem>
                                            <SelectItem value="challenge">Perlu Verifikasi</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                
                                <Button 
                                    onClick={handleStatusUpdate} 
                                    disabled={statusProcessing || statusData.status === order.status}
                                    className="w-full"
                                >
                                    {statusProcessing ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Memperbarui...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            Perbarui Status
                                        </>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Download Ticket */}
                        {order.status === 'paid' && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Download className="h-4 w-4" />
                                        Download Tiket
                                    </CardTitle>
                                    <CardDescription>
                                        Download tiket PDF untuk peserta
                                        {order.bib_number && (
                                            <div className="mt-2">
                                                <span className="text-sm font-medium text-muted-foreground">Nomor Punggung: </span>
                                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                                    {order.bib_number}
                                                </Badge>
                                            </div>
                                        )}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button 
                                        onClick={() => window.open(`/admin/orders/${order.id}/ticket/download`, '_blank')}
                                        className="w-full"
                                        variant="outline"
                                    >
                                        <Download className="mr-2 h-4 w-4" />
                                        Download Tiket PDF
                                    </Button>
                                </CardContent>
                            </Card>
                        )}

                        {/* Perbekalan Collection */}
                        {order.status === 'paid' && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <ShoppingBag className="h-4 w-4" />
                                        Konfirmasi Perbekalan
                                    </CardTitle>
                                    <CardDescription>
                                        Konfirmasi pengambilan perbekalan oleh peserta
                                        {order.bib_number && (
                                            <div className="mt-2">
                                                <span className="text-sm font-medium text-muted-foreground">Nomor Punggung: </span>
                                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                                    {order.bib_number}
                                                </Badge>
                                            </div>
                                        )}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {order.race_pack_collected ? (
                                        <div className="space-y-3">
                                            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                                <div className="flex items-center gap-2 text-green-800">
                                                    <CheckCircle className="h-4 w-4" />
                                                    <span className="font-medium">Perbekalan sudah diambil</span>
                                                </div>
                                                {order.race_pack_collected_at && (
                                                    <p className="text-sm text-green-700 mt-1">
                                                        <Clock className="h-3 w-3 inline mr-1" />
                                                        {new Date(order.race_pack_collected_at).toLocaleString('id-ID')}
                                                    </p>
                                                )}
                                                {order.race_pack_collected_by && (
                                                    <p className="text-sm text-green-700">
                                                        <User className="h-3 w-3 inline mr-1" />
                                                        Konfirmasi oleh: {order.race_pack_collected_by}
                                                    </p>
                                                )}
                                            </div>
                                            <Link
                                                href={route('admin.orders.race-pack-uncollected', order.id)}
                                                method="post"
                                                as="button"
                                                className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
                                                onSuccess={() => toast.success('Status perbekalan berhasil direset!')}
                                            >
                                                Reset Status
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                                                <div className="flex items-center gap-2 text-orange-800">
                                                    <Clock className="h-4 w-4" />
                                                    <span className="font-medium">Perbekalan belum diambil</span>
                                                </div>
                                                <p className="text-sm text-orange-700 mt-1">
                                                    Peserta belum mengambil perbekalan mereka
                                                </p>
                                            </div>
                                            <Link
                                                href={route('admin.orders.race-pack-collected', order.id)}
                                                method="post"
                                                as="button"
                                                className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                                                onSuccess={() => toast.success('Perbekalan berhasil dikonfirmasi!')}
                                            >
                                                <CheckCircle className="mr-2 h-4 w-4" />
                                                Konfirmasi Sudah Diambil
                                            </Link>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Danger Zone */}
                        {(order.status === 'cancelled' || order.status === 'expired') && (
                            <Card className="border-red-200 bg-red-50">
                                <CardHeader>
                                    <CardTitle className="text-red-600 flex items-center gap-2">
                                        <Trash2 className="h-4 w-4" />
                                        Zona Berbahaya
                                    </CardTitle>
                                    <CardDescription>
                                        Tindakan permanen yang tidak dapat dibatalkan
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive" className="w-full">
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Hapus Pesanan
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Hapus Pesanan</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Apakah Anda yakin ingin menghapus pesanan ini? 
                                                    Tindakan ini tidak dapat dibatalkan dan semua data akan hilang.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                                <AlertDialogAction asChild>
                                                    <Link 
                                                        href={`/admin/orders/${order.id}`}
                                                        method="delete"
                                                        as="button"
                                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                    >
                                                        Hapus Pesanan
                                                    </Link>
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
