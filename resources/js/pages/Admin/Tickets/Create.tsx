import { Head, useForm, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, ArrowLeft, Ticket, Loader2 } from 'lucide-react';
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
        is_free: false as boolean,
        stock: '',
        sale_start_date: '',
        sale_end_date: '',
        is_active: true as boolean,
        image: null as File | null
    });

    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/tickets');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tambah Tiket" />
            <div className="p-4">
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Ticket className="h-5 w-5 text-blue-600" />
                        <h1 className="text-xl font-semibold">Tambah Tiket Baru</h1>
                    </div>
                    <Button 
                        variant="outline" 
                        onClick={() => router.visit('/admin/tickets')}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Tickets
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Informasi Dasar</CardTitle>
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
                                    className={`min-h-[80px] ${errors.description ? 'border-red-500' : ''}`}
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
                                            setData('image', file);
                                            // Create preview
                                            const reader = new FileReader();
                                            reader.onload = (event) => {
                                                setImagePreview(event.target?.result as string);
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                    className={errors.image ? 'border-red-500' : ''}
                                />
                                {errors.image && (
                                    <p className="text-sm text-red-500">{errors.image}</p>
                                )}
                                {imagePreview && (
                                    <div className="mt-3">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="h-32 w-auto rounded border object-cover"
                                        />
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Harga & Stok</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Checkbox Tiket Gratis */}
                            <div className="space-y-2">
                                <div className="flex items-center space-x-3 rounded-lg border p-3 bg-blue-50">
                                    <Switch
                                        id="is_free"
                                        checked={data.is_free}
                                        onCheckedChange={(checked) => {
                                            setData('is_free', checked);
                                            if (checked) {
                                                setData('price', '0');
                                            }
                                        }}
                                    />
                                    <div>
                                        <Label htmlFor="is_free" className="text-sm font-medium text-blue-900">
                                            {data.is_free ? 'Tiket Gratis' : 'Tiket Berbayar'}
                                        </Label>
                                        <p className="text-xs text-blue-700">
                                            {data.is_free ? 'Tiket dapat diunduh tanpa pembayaran' : 'Tiket memerlukan pembayaran'}
                                        </p>
                                    </div>
                                </div>
                            </div>

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
                                        disabled={data.is_free}
                                        className={`${errors.price ? 'border-red-500' : ''} ${data.is_free ? 'bg-gray-100' : ''}`}
                                    />
                                    {errors.price && (
                                        <p className="text-sm text-red-500">{errors.price}</p>
                                    )}
                                    {data.is_free && (
                                        <p className="text-sm text-blue-600">Harga otomatis 0 untuk tiket gratis</p>
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
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Periode Penjualan</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Tentukan kapan tiket mulai dan berhenti dijual
                            </p>
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

                    <div className="flex items-center justify-end space-x-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.visit('/admin/tickets')}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Create Ticket
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
