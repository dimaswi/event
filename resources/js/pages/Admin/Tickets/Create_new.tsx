import { Head, useForm, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Save, ArrowLeft, Ticket, DollarSign, Calendar, Settings } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Manajemen Tiket',
        href: '/admin/tickets',
    },
    {
        title: 'Tambah Tiket',
        href: '/admin/tickets/create',
    },
];

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        price: '',
        stock: '',
        sale_start_date: '',
        sale_end_date: '',
        is_active: true as boolean,
        image: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/tickets');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tambah Tiket" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Ticket className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                        <h1 className="text-2xl font-semibold">Tambah Tiket</h1>
                        <p className="text-sm text-muted-foreground">
                            Buat tiket baru untuk acara Fun Run Event
                        </p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href="/admin/tickets">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Kembali
                        </Link>
                    </Button>
                </div>

                <Separator />

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-6">
                        {/* Basic Information Section */}
                        <Card>
                            <CardHeader className="flex flex-row items-center gap-2">
                                <Ticket className="h-5 w-5" />
                                <div>
                                    <CardTitle>Informasi Dasar</CardTitle>
                                    <CardDescription>
                                        Detail utama tentang tiket acara
                                    </CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Nama Tiket *</Label>
                                        <Input
                                            id="name"
                                            type="text"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder="Contoh: Early Bird 5K"
                                            className={errors.name ? 'border-red-500' : ''}
                                        />
                                        {errors.name && (
                                            <p className="text-sm text-red-500">{errors.name}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Status Tiket</Label>
                                        <div className="flex items-center space-x-3 rounded-lg border p-3">
                                            <Switch
                                                id="is_active"
                                                checked={data.is_active}
                                                onCheckedChange={(checked) => setData('is_active', checked)}
                                            />
                                            <div>
                                                <Label htmlFor="is_active" className="text-sm font-medium">
                                                    {data.is_active ? 'Aktif' : 'Tidak Aktif'}
                                                </Label>
                                                <p className="text-xs text-muted-foreground">
                                                    {data.is_active ? 'Tiket dapat dibeli' : 'Tiket tidak dapat dibeli'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Deskripsi</Label>
                                    <Textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder="Deskripsi detail tentang tiket ini..."
                                        className={`min-h-[100px] ${errors.description ? 'border-red-500' : ''}`}
                                    />
                                    {errors.description && (
                                        <p className="text-sm text-red-500">{errors.description}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="image">Gambar Tiket</Label>
                                    <Input
                                        id="image"
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onload = (event) => {
                                                    setData('image', event.target?.result as string);
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                        className={errors.image ? 'border-red-500' : ''}
                                    />
                                    {errors.image && (
                                        <p className="text-sm text-red-500">{errors.image}</p>
                                    )}
                                    {data.image && (
                                        <div className="mt-3">
                                            <img
                                                src={data.image}
                                                alt="Preview"
                                                className="h-32 w-auto rounded-lg border object-cover shadow-sm"
                                            />
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Pricing & Stock Section */}
                        <Card>
                            <CardHeader className="flex flex-row items-center gap-2">
                                <DollarSign className="h-5 w-5" />
                                <div>
                                    <CardTitle>Harga & Stok</CardTitle>
                                    <CardDescription>
                                        Pengaturan harga dan ketersediaan tiket
                                    </CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="price">Harga (IDR) *</Label>
                                        <Input
                                            id="price"
                                            type="number"
                                            value={data.price}
                                            onChange={(e) => setData('price', e.target.value)}
                                            placeholder="150000"
                                            min="0"
                                            step="1000"
                                            className={errors.price ? 'border-red-500' : ''}
                                        />
                                        {errors.price && (
                                            <p className="text-sm text-red-500">{errors.price}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="stock">Jumlah Stok *</Label>
                                        <Input
                                            id="stock"
                                            type="number"
                                            value={data.stock}
                                            onChange={(e) => setData('stock', e.target.value)}
                                            placeholder="1000"
                                            min="1"
                                            className={errors.stock ? 'border-red-500' : ''}
                                        />
                                        {errors.stock && (
                                            <p className="text-sm text-red-500">{errors.stock}</p>
                                        )}
                                        <p className="text-sm text-muted-foreground">
                                            Setiap customer hanya dapat membeli 1 tiket
                                        </p>
                                    </div>
                                </div>

                                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                                    <div className="flex items-start gap-3">
                                        <Settings className="h-5 w-5 text-blue-600 mt-0.5" />
                                        <div>
                                            <h4 className="text-sm font-medium text-blue-900">Kebijakan Pembelian</h4>
                                            <p className="text-sm text-blue-700 mt-1">
                                                Setiap orang hanya dapat membeli maksimal 1 tiket berdasarkan NIK yang terdaftar.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Sale Period Section */}
                        <Card>
                            <CardHeader className="flex flex-row items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                <div>
                                    <CardTitle>Periode Penjualan</CardTitle>
                                    <CardDescription>
                                        Tentukan kapan tiket mulai dan berhenti dijual
                                    </CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="sale_start_date">Tanggal Mulai Penjualan</Label>
                                        <Input
                                            id="sale_start_date"
                                            type="datetime-local"
                                            value={data.sale_start_date}
                                            onChange={(e) => setData('sale_start_date', e.target.value)}
                                            className={errors.sale_start_date ? 'border-red-500' : ''}
                                        />
                                        {errors.sale_start_date && (
                                            <p className="text-sm text-red-500">{errors.sale_start_date}</p>
                                        )}
                                        <p className="text-sm text-muted-foreground">
                                            Kosongkan untuk mulai menjual sekarang
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="sale_end_date">Tanggal Berakhir Penjualan</Label>
                                        <Input
                                            id="sale_end_date"
                                            type="datetime-local"
                                            value={data.sale_end_date}
                                            onChange={(e) => setData('sale_end_date', e.target.value)}
                                            className={errors.sale_end_date ? 'border-red-500' : ''}
                                        />
                                        {errors.sale_end_date && (
                                            <p className="text-sm text-red-500">{errors.sale_end_date}</p>
                                        )}
                                        <p className="text-sm text-muted-foreground">
                                            Kosongkan untuk tidak ada batas waktu
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-3 pt-6">
                        <Button variant="outline" asChild>
                            <Link href="/admin/tickets">Batal</Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            <Save className="mr-2 h-4 w-4" />
                            {processing ? 'Membuat...' : 'Buat Tiket'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
