import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Upload, AlertCircle } from 'lucide-react';
import { Ticket } from '@/types';
import { Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';

interface Props {
    ticket: Ticket;
}

export default function TicketDetail({ ticket }: Props) {
    const [quantity, setQuantity] = useState(1);
    const [isFormValid, setIsFormValid] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        quantity: 1,
        'customer.name': '',
        'customer.email': '',
        'customer.phone': '',
        'customer.nik': '',
        'customer.ktp_image': null as File | null,
        'customer.id_type': 'ktp',
        'customer.address': '',
        'customer.full_address': '',
        'customer.province': '',
        'customer.city': '',
        'customer.district': '',
        'customer.postal_code': '',
        'customer.birth_date': '',
        'customer.place_of_birth': '',
        'customer.gender': '',
        'customer.blood_type': '',
        'customer.shirt_size': '',
        'customer.medical_conditions': '',
        'customer.allergies': '',
        'customer.has_insurance': false as boolean,
        'customer.insurance_name': '',
        'customer.insurance_number': '',
        'customer.emergency_contact_name': '',
        'customer.emergency_contact_phone': '',
    });

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const totalPrice = ticket.price * quantity;

    // Check if all required fields are filled
    useEffect(() => {
        const requiredFields = [
            'customer.name', 'customer.email', 'customer.phone', 'customer.nik', 
            'customer.full_address', 'customer.province', 'customer.city', 
            'customer.district', 'customer.postal_code', 'customer.birth_date', 
            'customer.place_of_birth', 'customer.gender', 'customer.shirt_size', 
            'customer.emergency_contact_name', 'customer.emergency_contact_phone'
        ];

        const isValid = requiredFields.every(field => {
            const value = data[field as keyof typeof data];
            return value !== '' && value !== null && value !== undefined;
        }) && (!data['customer.has_insurance'] || 
            (data['customer.insurance_name'] && data['customer.insurance_number']));

        setIsFormValid(!!isValid);
    }, [data]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/tickets/${ticket.id}/purchase`);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setData('customer.ktp_image', file);
    };

    if (!ticket.is_on_sale) {
        return (
            <>
                <Head title={`${ticket.name} - Tidak Tersedia`} />
                <div className="min-h-screen bg-gray-50 py-8">
                    <div className="container mx-auto px-4">
                        <div className="text-center">
                            <h1 className="text-2xl font-bold mb-4">Tiket Tidak Tersedia</h1>
                            <p className="text-gray-600 mb-6">Maaf, tiket ini sedang tidak tersedia untuk dibeli.</p>
                            <Button asChild>
                                <Link href="/">Kembali ke Beranda</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Head title={`Beli ${ticket.name}`} />
            
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="container mx-auto px-4">
                    <div className="mb-6">
                        <Button variant="ghost" asChild>
                            <Link href="/">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Kembali
                            </Link>
                        </Button>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Ticket Info */}
                        <div className="lg:col-span-1">
                            <Card className="sticky top-8">
                                <CardHeader>
                                    <CardTitle>{ticket.name}</CardTitle>
                                    <CardDescription className="text-2xl font-bold text-primary">
                                        {formatPrice(ticket.price)}
                                    </CardDescription>
                                </CardHeader>
                                
                                <CardContent>
                                    {ticket.description && (
                                        <p className="text-gray-600 mb-4">{ticket.description}</p>
                                    )}
                                    
                                    <div className="space-y-2 text-sm mb-6">
                                        <div className="flex justify-between">
                                            <span>Stok tersisa:</span>
                                            <Badge variant="outline">{ticket.available_stock}</Badge>
                                        </div>
                                    </div>

                                    <Separator className="my-4" />

                                    <div className="space-y-2">
                                        <Label htmlFor="quantity">Jumlah Tiket</Label>
                                        <Select 
                                            value={quantity.toString()} 
                                            onValueChange={(value) => {
                                                const qty = parseInt(value);
                                                setQuantity(qty);
                                                setData('quantity', qty);
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Array.from({ length: Math.min(5, ticket.available_stock) }, (_, i) => (
                                                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                                                        {i + 1} tiket
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <Separator className="my-4" />

                                    <div className="text-lg font-semibold">
                                        Total: {formatPrice(totalPrice)}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Registration Form */}
                        <div className="lg:col-span-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Data Peserta</CardTitle>
                                    <CardDescription>
                                        Lengkapi data diri Anda dengan benar sesuai identitas resmi
                                    </CardDescription>
                                </CardHeader>
                                
                                <CardContent>
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        {/* Personal Information */}
                                        <div>
                                            <h3 className="text-lg font-semibold mb-4">Informasi Pribadi</h3>
                                            <div className="grid md:grid-cols-2 gap-4">
                                                <div>
                                                    <Label htmlFor="name">Nama Lengkap *</Label>
                                                    <Input
                                                        id="name"
                                                        value={data['customer.name']}
                                                        onChange={e => setData('customer.name', e.target.value)}
                                                        placeholder="Sesuai KTP/Identitas"
                                                        className={errors['customer.name'] ? 'border-red-500' : ''}
                                                    />
                                                    {errors['customer.name'] && (
                                                        <p className="text-red-500 text-sm mt-1">{errors['customer.name']}</p>
                                                    )}
                                                </div>

                                                <div>
                                                    <Label htmlFor="email">Email *</Label>
                                                    <Input
                                                        id="email"
                                                        type="email"
                                                        value={data['customer.email']}
                                                        onChange={e => setData('customer.email', e.target.value)}
                                                        placeholder="email@example.com"
                                                        className={errors['customer.email'] ? 'border-red-500' : ''}
                                                    />
                                                    {errors['customer.email'] && (
                                                        <p className="text-red-500 text-sm mt-1">{errors['customer.email']}</p>
                                                    )}
                                                </div>

                                                <div>
                                                    <Label htmlFor="phone">Nomor Telepon *</Label>
                                                    <Input
                                                        id="phone"
                                                        value={data['customer.phone']}
                                                        onChange={e => setData('customer.phone', e.target.value)}
                                                        placeholder="081234567890"
                                                        className={errors['customer.phone'] ? 'border-red-500' : ''}
                                                    />
                                                    {errors['customer.phone'] && (
                                                        <p className="text-red-500 text-sm mt-1">{errors['customer.phone']}</p>
                                                    )}
                                                </div>

                                                <div>
                                                    <Label htmlFor="nik">NIK (16 digit) *</Label>
                                                    <Input
                                                        id="nik"
                                                        value={data['customer.nik']}
                                                        onChange={e => setData('customer.nik', e.target.value)}
                                                        placeholder="1234567890123456"
                                                        maxLength={16}
                                                        className={errors['customer.nik'] ? 'border-red-500' : ''}
                                                    />
                                                    {errors['customer.nik'] && (
                                                        <p className="text-red-500 text-sm mt-1">{errors['customer.nik']}</p>
                                                    )}
                                                </div>

                                                <div>
                                                    <Label htmlFor="id_type">Jenis Identitas *</Label>
                                                    <Select 
                                                        value={data['customer.id_type']} 
                                                        onValueChange={value => setData('customer.id_type', value)}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="ktp">KTP</SelectItem>
                                                            <SelectItem value="sim">SIM</SelectItem>
                                                            <SelectItem value="passport">Passport</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div>
                                                    <Label htmlFor="ktp_image">Upload Foto KTP</Label>
                                                    <div className="mt-1">
                                                        <input
                                                            id="ktp_image"
                                                            type="file"
                                                            accept="image/jpeg,image/png,image/jpg"
                                                            onChange={handleFileChange}
                                                            className="hidden"
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            onClick={() => document.getElementById('ktp_image')?.click()}
                                                            className="w-full"
                                                        >
                                                            <Upload className="h-4 w-4 mr-2" />
                                                            {data['customer.ktp_image'] ? 'File dipilih' : 'Pilih File'}
                                                        </Button>
                                                    </div>
                                                </div>

                                                <div>
                                                    <Label htmlFor="birth_date">Tanggal Lahir *</Label>
                                                    <Input
                                                        id="birth_date"
                                                        type="date"
                                                        value={data['customer.birth_date']}
                                                        onChange={e => setData('customer.birth_date', e.target.value)}
                                                        className={errors['customer.birth_date'] ? 'border-red-500' : ''}
                                                    />
                                                </div>

                                                <div>
                                                    <Label htmlFor="place_of_birth">Tempat Lahir *</Label>
                                                    <Input
                                                        id="place_of_birth"
                                                        value={data['customer.place_of_birth']}
                                                        onChange={e => setData('customer.place_of_birth', e.target.value)}
                                                        placeholder="Jakarta"
                                                        className={errors['customer.place_of_birth'] ? 'border-red-500' : ''}
                                                    />
                                                </div>

                                                <div>
                                                    <Label htmlFor="gender">Jenis Kelamin *</Label>
                                                    <Select 
                                                        value={data['customer.gender']} 
                                                        onValueChange={value => setData('customer.gender', value)}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Pilih jenis kelamin" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="male">Laki-laki</SelectItem>
                                                            <SelectItem value="female">Perempuan</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div>
                                                    <Label htmlFor="blood_type">Golongan Darah</Label>
                                                    <Select 
                                                        value={data['customer.blood_type']} 
                                                        onValueChange={value => setData('customer.blood_type', value)}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Pilih golongan darah" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="A">A</SelectItem>
                                                            <SelectItem value="B">B</SelectItem>
                                                            <SelectItem value="AB">AB</SelectItem>
                                                            <SelectItem value="O">O</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div>
                                                    <Label htmlFor="shirt_size">Ukuran Baju *</Label>
                                                    <Select 
                                                        value={data['customer.shirt_size']} 
                                                        onValueChange={value => setData('customer.shirt_size', value)}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Pilih ukuran baju" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="XS">XS</SelectItem>
                                                            <SelectItem value="S">S</SelectItem>
                                                            <SelectItem value="M">M</SelectItem>
                                                            <SelectItem value="L">L</SelectItem>
                                                            <SelectItem value="XL">XL</SelectItem>
                                                            <SelectItem value="XXL">XXL</SelectItem>
                                                            <SelectItem value="XXXL">XXXL</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Address Information */}
                                        <div>
                                            <h3 className="text-lg font-semibold mb-4">Alamat</h3>
                                            <div className="space-y-4">
                                                <div>
                                                    <Label htmlFor="full_address">Alamat Lengkap *</Label>
                                                    <Textarea
                                                        id="full_address"
                                                        value={data['customer.full_address']}
                                                        onChange={e => setData('customer.full_address', e.target.value)}
                                                        placeholder="Jl. Contoh No. 123, RT/RW 01/02"
                                                        className={errors['customer.full_address'] ? 'border-red-500' : ''}
                                                    />
                                                </div>

                                                <div className="grid md:grid-cols-2 gap-4">
                                                    <div>
                                                        <Label htmlFor="province">Provinsi *</Label>
                                                        <Input
                                                            id="province"
                                                            value={data['customer.province']}
                                                            onChange={e => setData('customer.province', e.target.value)}
                                                            placeholder="DKI Jakarta"
                                                            className={errors['customer.province'] ? 'border-red-500' : ''}
                                                        />
                                                    </div>

                                                    <div>
                                                        <Label htmlFor="city">Kota/Kabupaten *</Label>
                                                        <Input
                                                            id="city"
                                                            value={data['customer.city']}
                                                            onChange={e => setData('customer.city', e.target.value)}
                                                            placeholder="Jakarta Selatan"
                                                            className={errors['customer.city'] ? 'border-red-500' : ''}
                                                        />
                                                    </div>

                                                    <div>
                                                        <Label htmlFor="district">Kecamatan *</Label>
                                                        <Input
                                                            id="district"
                                                            value={data['customer.district']}
                                                            onChange={e => setData('customer.district', e.target.value)}
                                                            placeholder="Kebayoran Baru"
                                                            className={errors['customer.district'] ? 'border-red-500' : ''}
                                                        />
                                                    </div>

                                                    <div>
                                                        <Label htmlFor="postal_code">Kode Pos *</Label>
                                                        <Input
                                                            id="postal_code"
                                                            value={data['customer.postal_code']}
                                                            onChange={e => setData('customer.postal_code', e.target.value)}
                                                            placeholder="12345"
                                                            maxLength={5}
                                                            className={errors['customer.postal_code'] ? 'border-red-500' : ''}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Medical Information */}
                                        <div>
                                            <h3 className="text-lg font-semibold mb-4">Informasi Kesehatan</h3>
                                            <div className="space-y-4">
                                                <div>
                                                    <Label htmlFor="medical_conditions">Kondisi Medis</Label>
                                                    <Textarea
                                                        id="medical_conditions"
                                                        value={data['customer.medical_conditions']}
                                                        onChange={e => setData('customer.medical_conditions', e.target.value)}
                                                        placeholder="Riwayat penyakit, operasi, dll (opsional)"
                                                    />
                                                </div>

                                                <div>
                                                    <Label htmlFor="allergies">Alergi</Label>
                                                    <Textarea
                                                        id="allergies"
                                                        value={data['customer.allergies']}
                                                        onChange={e => setData('customer.allergies', e.target.value)}
                                                        placeholder="Alergi makanan, obat, dll (opsional)"
                                                    />
                                                </div>

                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id="has_insurance"
                                                        checked={data['customer.has_insurance']}
                                                        onCheckedChange={checked => setData('customer.has_insurance', !!checked)}
                                                    />
                                                    <Label htmlFor="has_insurance">Memiliki Asuransi Kesehatan</Label>
                                                </div>

                                                {data['customer.has_insurance'] && (
                                                    <div className="grid md:grid-cols-2 gap-4">
                                                        <div>
                                                            <Label htmlFor="insurance_name">Nama Asuransi *</Label>
                                                            <Input
                                                                id="insurance_name"
                                                                value={data['customer.insurance_name']}
                                                                onChange={e => setData('customer.insurance_name', e.target.value)}
                                                                placeholder="BPJS, Prudential, dll"
                                                            />
                                                        </div>

                                                        <div>
                                                            <Label htmlFor="insurance_number">Nomor Asuransi *</Label>
                                                            <Input
                                                                id="insurance_number"
                                                                value={data['customer.insurance_number']}
                                                                onChange={e => setData('customer.insurance_number', e.target.value)}
                                                                placeholder="Nomor kartu asuransi"
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Emergency Contact */}
                                        <div>
                                            <h3 className="text-lg font-semibold mb-4">Kontak Darurat</h3>
                                            <div className="grid md:grid-cols-2 gap-4">
                                                <div>
                                                    <Label htmlFor="emergency_contact_name">Nama Kontak Darurat *</Label>
                                                    <Input
                                                        id="emergency_contact_name"
                                                        value={data['customer.emergency_contact_name']}
                                                        onChange={e => setData('customer.emergency_contact_name', e.target.value)}
                                                        placeholder="Nama lengkap"
                                                        className={errors['customer.emergency_contact_name'] ? 'border-red-500' : ''}
                                                    />
                                                </div>

                                                <div>
                                                    <Label htmlFor="emergency_contact_phone">Nomor Telepon Darurat *</Label>
                                                    <Input
                                                        id="emergency_contact_phone"
                                                        value={data['customer.emergency_contact_phone']}
                                                        onChange={e => setData('customer.emergency_contact_phone', e.target.value)}
                                                        placeholder="081234567890"
                                                        className={errors['customer.emergency_contact_phone'] ? 'border-red-500' : ''}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <Separator />

                                        {/* Submit Button */}
                                        <div className="flex justify-end">
                                            <Button 
                                                type="submit" 
                                                size="lg" 
                                                disabled={!isFormValid || processing}
                                                className="min-w-[200px]"
                                            >
                                                {processing ? 'Memproses...' : `Bayar ${formatPrice(totalPrice)}`}
                                            </Button>
                                        </div>

                                        {!isFormValid && (
                                            <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg">
                                                <AlertCircle className="h-4 w-4" />
                                                <span className="text-sm">
                                                    Lengkapi semua field yang wajib diisi untuk melanjutkan pembayaran
                                                </span>
                                            </div>
                                        )}
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
