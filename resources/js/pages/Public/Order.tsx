import { Head, useForm, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { Ticket } from '@/types';
import { Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';

// Declare snap for TypeScript
declare global {
    interface Window {
        snap: any;
    }
}


interface Props {
    tickets: Ticket[];
    size_chart?: string;
    flash?: {
        success?: string;
        error?: string;
    };
    order_number?: string;
}

export default function Order({ tickets, size_chart, flash, order_number }: Props) {
    const { eventSettings } = usePage().props as any;
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [isFormValid, setIsFormValid] = useState(false);
    const [orderNumber, setOrderNumber] = useState<string>('');
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [snapLoaded, setSnapLoaded] = useState(false);
    
    // Simple Captcha state
    const [captchaNum1, setCaptchaNum1] = useState<number>(0);
    const [captchaNum2, setCaptchaNum2] = useState<number>(0);
    const [captchaAnswer, setCaptchaAnswer] = useState<string>('');
    const [captchaError, setCaptchaError] = useState<string>('');

    // Generate new captcha numbers
    const generateCaptcha = () => {
        const num1 = Math.floor(Math.random() * 10) + 1;
        const num2 = Math.floor(Math.random() * 10) + 1;
        setCaptchaNum1(num1);
        setCaptchaNum2(num2);
        setCaptchaAnswer('');
        setCaptchaError('');
    };

    // Initialize captcha on component mount
    useEffect(() => {
        generateCaptcha();
    }, []);

    // Load Midtrans Snap script dynamically
    useEffect(() => {
        const loadSnapScript = () => {
            // Check if snap is already loaded
            if (window.snap) {
                setSnapLoaded(true);
                return;
            }

            // Get client key from environment
            const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY || 'Mid-client-71FrsK80eaLdEzWO';
            console.log('Midtrans client key:', clientKey ? 'Found' : 'Not found');
            
            if (!clientKey) {
                console.error('VITE_MIDTRANS_CLIENT_KEY not found in environment');
                alert('Konfigurasi pembayaran tidak valid. Silakan hubungi admin.');
                return;
            }

            // Create script element
            const script = document.createElement('script');
            script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
            script.setAttribute('data-client-key', clientKey);
            script.async = true;
            
            script.onload = () => {
                console.log('Midtrans Snap script loaded successfully');
                setSnapLoaded(true);
            };
            
            script.onerror = () => {
                console.error('Failed to load Midtrans Snap script');
                alert('Gagal memuat sistem pembayaran. Silakan refresh halaman.');
            };
            
            document.head.appendChild(script);
        };

        loadSnapScript();
    }, []);

    const { data, setData, post, processing, errors } = useForm({
        ticket_id: '',
        quantity: 1,
        'customer.name': '',
        'customer.email': '',
        'customer.phone': '',
        'customer.nik': '',
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
        'terms_health': false as boolean,
        'terms_liability': false as boolean,
        'terms_media': false as boolean,
    });

    const formatPrice = (price: number) => {
        if (price === 0) {
            return 'GRATIS';
        }
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const totalPrice = selectedTicket ? selectedTicket.price * 1 : 0;

    // Check if there's a success message with order number from redirect
    useEffect(() => {
        if (flash?.success && order_number) {
            setOrderNumber(order_number);
        }
    }, [flash, order_number]);

    // Check if all required fields are filled
    useEffect(() => {
        const requiredFields = [
            'ticket_id', 'customer.name', 'customer.email', 'customer.phone', 'customer.nik', 
            'customer.id_type', 'customer.full_address', 'customer.province', 'customer.city', 
            'customer.district', 'customer.postal_code', 'customer.birth_date', 
            'customer.place_of_birth', 'customer.gender', 'customer.shirt_size', 
            'customer.emergency_contact_name', 'customer.emergency_contact_phone', 
            'terms_health', 'terms_liability', 'terms_media'
        ];

        const emptyFields = requiredFields.filter(field => {
            const value = data[field as keyof typeof data];
            if (field === 'terms_health' || field === 'terms_liability' || field === 'terms_media') {
                return value === false; // untuk boolean, false berarti belum dicentang
            }
            return value === '' || value === null || value === undefined;
        });

        // Check captcha
        const correctAnswer = captchaNum1 + captchaNum2;
        const isCaptchaValid = captchaAnswer === correctAnswer.toString();

        const isValid = emptyFields.length === 0 && isCaptchaValid;
        setIsFormValid(!!isValid);
        
        // Set captcha error
        if (captchaAnswer && !isCaptchaValid) {
            setCaptchaError('Jawaban captcha tidak benar');
        } else {
            setCaptchaError('');
        }
    }, [data, captchaAnswer, captchaNum1, captchaNum2]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate captcha before proceeding
        const correctAnswer = captchaNum1 + captchaNum2;
        if (captchaAnswer !== correctAnswer.toString()) {
            setCaptchaError('Jawaban captcha tidak benar');
            return;
        }
        
        if (selectedTicket && isFormValid) {
            // Langsung proses pembayaran tanpa dropdown payment method
            handlePayment();
        }
    };

    const processOrder = () => {
        if (!selectedTicket) return;

        // Transform data to match backend expectations  
        const submitData = {
            ticket_id: data.ticket_id,
            quantity: data.quantity,
            customer: {
                name: data['customer.name'],
                email: data['customer.email'],
                phone: data['customer.phone'],
                nik: data['customer.nik'],
                id_type: data['customer.id_type'],
                address: data['customer.address'] || '',
                full_address: data['customer.full_address'],
                province: data['customer.province'],
                city: data['customer.city'],
                district: data['customer.district'],
                postal_code: data['customer.postal_code'],
                birth_date: data['customer.birth_date'],
                place_of_birth: data['customer.place_of_birth'],
                gender: data['customer.gender'],
                blood_type: data['customer.blood_type'] || null,
                shirt_size: data['customer.shirt_size'],
                medical_conditions: data['customer.medical_conditions'] || null,
                allergies: data['customer.allergies'] || null,
                has_insurance: !!data['customer.has_insurance'],
                insurance_name: data['customer.insurance_name'] || null,
                insurance_number: data['customer.insurance_number'] || null,
                emergency_contact_name: data['customer.emergency_contact_name'],
                emergency_contact_phone: data['customer.emergency_contact_phone'],
            },
            terms_health: !!data.terms_health,
            terms_liability: !!data.terms_liability,
            terms_media: !!data.terms_media,
            is_free: selectedTicket.is_free, // Tambahkan flag untuk tiket gratis
        };

        // Request ke backend
        fetch(`/tickets/${selectedTicket.id}/purchase`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                'Accept': 'application/json',
            },
            body: JSON.stringify(submitData)
        })
        .then(async response => {
            if (!response.ok) {
                const responseText = await response.text();
                let errorData = null;
                try {
                    errorData = JSON.parse(responseText);
                } catch (e) {
                    console.error('Error parsing error response:', e);
                    throw new Error(`HTTP ${response.status}: ${responseText}`);
                }
                throw new Error(errorData.message || 'Terjadi kesalahan saat memproses pesanan');
            }
            return response.json();
        })
        .then(result => {
            setIsProcessingPayment(false);
            if (selectedTicket.is_free) {
                // Untuk tiket gratis, redirect langsung ke success page
                router.visit(`/order/success?order_number=${result.order_number}`);
            } else {
                // Untuk tiket berbayar, buka payment gateway
                window.snap.pay(result.snap_token, {
                    onSuccess: (result: any) => {
                        router.visit(`/order/success?order_number=${result.order_id}`);
                    },
                    onPending: (result: any) => {
                        router.visit(`/order/pending?order_number=${result.order_id}`);
                    },
                    onError: (result: any) => {
                        alert('Pembayaran gagal! Silakan coba lagi.');
                        console.error('Payment error:', result);
                    },
                    onClose: () => {
                        console.log('Payment popup closed');
                    }
                });
            }
        })
        .catch(error => {
            setIsProcessingPayment(false);
            console.error('Order processing error:', error);
            alert(`Gagal memproses pesanan: ${error.message}`);
        });
    };

    const handlePayment = () => {
        if (!selectedTicket) return;
        
        // Jika tiket gratis, langsung proses tanpa payment gateway
        if (selectedTicket.is_free) {
            setIsProcessingPayment(true);
            processOrder();
            return;
        }
        
        if (!snapLoaded || !window.snap) {
            alert('Sistem pembayaran belum siap. Silakan tunggu sebentar dan coba lagi.');
            return;
        }
        
        setIsProcessingPayment(true);
        processOrder();
    };

    const handleTicketSelect = (ticketId: string) => {
        const ticket = tickets.find(t => t.id.toString() === ticketId);
        setSelectedTicket(ticket || null);
        setData('ticket_id', ticketId);
        setData('quantity', 1);
    };

    // Debug: Log data yang diterima
    console.log('Tickets received:', tickets);
    
    // Filter tiket yang aktif dan tersedia
    const availableTickets = tickets.filter(ticket => {
        const isActive = ticket.is_active;
        const hasStock = ticket.stock > ticket.sold;
        const startDateOk = !ticket.sale_start_date || new Date(ticket.sale_start_date) <= new Date();
        const endDateOk = !ticket.sale_end_date || new Date(ticket.sale_end_date) >= new Date();
        
        console.log(`Ticket ${ticket.name}:`, { 
            isActive, 
            hasStock, 
            startDateOk, 
            endDateOk,
            stock: ticket.stock,
            sold: ticket.sold,
            sale_start_date: ticket.sale_start_date,
            sale_end_date: ticket.sale_end_date
        });
        
        return isActive && hasStock && startDateOk && endDateOk;
    });
    
    console.log('Available tickets after filter:', availableTickets);

    return (
        <>
            <Head title="Daftar Fun Run" />
            
            <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
                <div className="container mx-auto px-3 sm:px-4 max-w-7xl">
                    <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <Button variant="ghost" asChild>
                            <Link href="/">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Kembali ke Beranda
                            </Link>
                        </Button>
                        
                        <div className="flex flex-col sm:flex-row gap-2">
                            <Button variant="outline" size="sm" asChild>
                                <Link href="/new/order">
                                    🆕 Coba Formulir Baru (Beta)
                                </Link>
                            </Button>
                            <Button variant="outline" size="sm" asChild>
                                <Link href="/tickets/orders/check">
                                    Cek Status Pesanan
                                </Link>
                            </Button>
                        </div>
                    </div>

                    <div className="text-center mb-8">
                        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Daftar Fun Run Event</h1>
                        <p className="text-gray-600 text-sm sm:text-base px-2">Lengkapi data diri dan pilih kategori yang sesuai dengan kemampuan Anda</p>
                        
                        {/* Info Banner untuk Sistem Baru */}
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg max-w-2xl mx-auto">
                            <p className="text-sm text-blue-700">
                                <span className="font-medium">💡 Tips:</span> Tersedia formulir pendaftaran yang lebih sederhana! 
                                <Link href="/new/order" className="underline hover:no-underline ml-1">
                                    Coba di sini
                                </Link>
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                        {/* Form Data Diri - Kolom Besar */}
                        <div className="lg:col-span-2 order-1">
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
                                                    <Label htmlFor="birth_date">Tanggal Lahir *</Label>
                                                    <Input
                                                        id="birth_date"
                                                        type="date"
                                                        value={data['customer.birth_date']}
                                                        onChange={e => setData('customer.birth_date', e.target.value)}
                                                        className={errors['customer.birth_date'] ? 'border-red-500' : ''}
                                                    />
                                                    {errors['customer.birth_date'] && (
                                                        <p className="text-red-500 text-sm mt-1">{errors['customer.birth_date']}</p>
                                                    )}
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
                                                    {errors['customer.place_of_birth'] && (
                                                        <p className="text-red-500 text-sm mt-1">{errors['customer.place_of_birth']}</p>
                                                    )}
                                                </div>

                                                <div>
                                                    <Label htmlFor="gender">Jenis Kelamin *</Label>
                                                    <Select 
                                                        value={data['customer.gender']} 
                                                        onValueChange={value => setData('customer.gender', value)}
                                                    >
                                                        <SelectTrigger className={errors['customer.gender'] ? 'border-red-500' : ''}>
                                                            <SelectValue placeholder="Pilih jenis kelamin" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="male">Laki-laki</SelectItem>
                                                            <SelectItem value="female">Perempuan</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    {errors['customer.gender'] && (
                                                        <p className="text-red-500 text-sm mt-1">{errors['customer.gender']}</p>
                                                    )}
                                                </div>

                                                <div>
                                                    <Label htmlFor="shirt_size">Ukuran Baju *</Label>
                                                    <Select 
                                                        value={data['customer.shirt_size']} 
                                                        onValueChange={value => setData('customer.shirt_size', value)}
                                                    >
                                                        <SelectTrigger className={errors['customer.shirt_size'] ? 'border-red-500' : ''}>
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
                                                    {errors['customer.shirt_size'] && (
                                                        <p className="text-red-500 text-sm mt-1">{errors['customer.shirt_size']}</p>
                                                    )}
                                                    
                                                    {/* Size Chart Display */}
                                                    <div className="mt-2">
                                                        <Dialog>
                                                            <DialogTrigger asChild>
                                                                <p className="text-sm text-blue-600 underline cursor-pointer hover:text-blue-800 transition-colors">
                                                                    Lihat panduan ukuran kaos
                                                                </p>
                                                            </DialogTrigger>

                                                            <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-hidden p-0 border-0">
                                                                <div className="overflow-auto max-h-[90vh]">
                                                                    {size_chart ? (
                                                                        <img 
                                                                            src={size_chart} 
                                                                            alt="Panduan Ukuran Kaos" 
                                                                            className="w-full h-auto"
                                                                        />
                                                                    ) : (
                                                                        <div className="p-4 sm:p-8 text-center bg-gray-50">
                                                                            <h3 className="text-lg font-semibold mb-4">Panduan Ukuran Kaos</h3>
                                                                            <div className="bg-white border rounded-lg p-3 sm:p-6 overflow-x-auto">
                                                                                <table className="w-full text-xs sm:text-sm min-w-[300px]">
                                                                                    <thead>
                                                                                        <tr className="border-b">
                                                                                            <th className="text-left py-2 px-1 sm:px-3">Ukuran</th>
                                                                                            <th className="text-left py-2 px-1 sm:px-3">Dada (cm)</th>
                                                                                            <th className="text-left py-2 px-1 sm:px-3">Panjang (cm)</th>
                                                                                            <th className="text-left py-2 px-1 sm:px-3">Bahu (cm)</th>
                                                                                        </tr>
                                                                                    </thead>
                                                                                    <tbody>
                                                                                        <tr className="border-b">
                                                                                            <td className="py-2 px-1 sm:px-3 font-medium">XS</td>
                                                                                            <td className="py-2 px-1 sm:px-3">86-91</td>
                                                                                            <td className="py-2 px-1 sm:px-3">65</td>
                                                                                            <td className="py-2 px-1 sm:px-3">42</td>
                                                                                        </tr>
                                                                                        <tr className="border-b">
                                                                                            <td className="py-2 px-1 sm:px-3 font-medium">S</td>
                                                                                            <td className="py-2 px-1 sm:px-3">91-96</td>
                                                                                            <td className="py-2 px-1 sm:px-3">68</td>
                                                                                            <td className="py-2 px-1 sm:px-3">44</td>
                                                                                        </tr>
                                                                                        <tr className="border-b">
                                                                                            <td className="py-2 px-1 sm:px-3 font-medium">M</td>
                                                                                            <td className="py-2 px-1 sm:px-3">96-101</td>
                                                                                            <td className="py-2 px-1 sm:px-3">70</td>
                                                                                            <td className="py-2 px-1 sm:px-3">46</td>
                                                                                        </tr>
                                                                                        <tr className="border-b">
                                                                                            <td className="py-2 px-1 sm:px-3 font-medium">L</td>
                                                                                            <td className="py-2 px-1 sm:px-3">101-106</td>
                                                                                            <td className="py-2 px-1 sm:px-3">72</td>
                                                                                            <td className="py-2 px-1 sm:px-3">48</td>
                                                                                        </tr>
                                                                                        <tr className="border-b">
                                                                                            <td className="py-2 px-1 sm:px-3 font-medium">XL</td>
                                                                                            <td className="py-2 px-1 sm:px-3">106-111</td>
                                                                                            <td className="py-2 px-1 sm:px-3">74</td>
                                                                                            <td className="py-2 px-1 sm:px-3">50</td>
                                                                                        </tr>
                                                                                        <tr className="border-b">
                                                                                            <td className="py-2 px-1 sm:px-3 font-medium">XXL</td>
                                                                                            <td className="py-2 px-1 sm:px-3">111-117</td>
                                                                                            <td className="py-2 px-1 sm:px-3">76</td>
                                                                                            <td className="py-2 px-1 sm:px-3">52</td>
                                                                                        </tr>
                                                                                        <tr>
                                                                                            <td className="py-2 px-1 sm:px-3 font-medium">XXXL</td>
                                                                                            <td className="py-2 px-1 sm:px-3">117-122</td>
                                                                                            <td className="py-2 px-1 sm:px-3">78</td>
                                                                                            <td className="py-2 px-1 sm:px-3">54</td>
                                                                                        </tr>
                                                                                    </tbody>
                                                                                </table>
                                                                                <div className="mt-4 text-xs sm:text-sm text-gray-600">
                                                                                    <p className="font-medium mb-2">Tips memilih ukuran:</p>
                                                                                    <ul className="text-left space-y-1 text-xs sm:text-sm">
                                                                                        <li>• Ukur lingkar dada dengan pita ukur</li>
                                                                                        <li>• Pilih ukuran yang memberikan ruang gerak nyaman</li>
                                                                                        <li>• Jika ragu, pilih ukuran yang lebih besar</li>
                                                                                    </ul>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </DialogContent>
                                                        </Dialog>
                                                    </div>
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
                                                    {errors['customer.full_address'] && (
                                                        <p className="text-red-500 text-sm mt-1">{errors['customer.full_address']}</p>
                                                    )}
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
                                                        {errors['customer.province'] && (
                                                            <p className="text-red-500 text-sm mt-1">{errors['customer.province']}</p>
                                                        )}
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
                                                        {errors['customer.city'] && (
                                                            <p className="text-red-500 text-sm mt-1">{errors['customer.city']}</p>
                                                        )}
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
                                                        {errors['customer.district'] && (
                                                            <p className="text-red-500 text-sm mt-1">{errors['customer.district']}</p>
                                                        )}
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
                                                        {errors['customer.postal_code'] && (
                                                            <p className="text-red-500 text-sm mt-1">{errors['customer.postal_code']}</p>
                                                        )}
                                                    </div>
                                                </div>
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
                                                    {errors['customer.emergency_contact_name'] && (
                                                        <p className="text-red-500 text-sm mt-1">{errors['customer.emergency_contact_name']}</p>
                                                    )}
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
                                                    {errors['customer.emergency_contact_phone'] && (
                                                        <p className="text-red-500 text-sm mt-1">{errors['customer.emergency_contact_phone']}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Terms and Conditions */}
                                        <div>
                                            <h3 className="text-lg font-semibold mb-4">Persetujuan Syarat dan Ketentuan</h3>
                                            <div className="space-y-4">
                                                {/* Health Terms */}
                                                <div className="flex items-start space-x-3 p-4 border rounded-lg bg-blue-50 border-blue-200">
                                                    <Checkbox
                                                        id="terms_health"
                                                        checked={data.terms_health}
                                                        onCheckedChange={(checked) => setData('terms_health', !!checked)}
                                                        className={errors.terms_health ? 'border-red-500' : ''}
                                                    />
                                                    <div className="flex-1">
                                                        <Label htmlFor="terms_health" className="text-sm font-medium cursor-pointer">
                                                            Kondisi Kesehatan dan Tanggung Jawab *
                                                        </Label>
                                                        <p className="text-xs text-gray-600 mt-1">
                                                            Saya dalam kondisi sehat dan memahami risiko kegiatan lari, seperti cedera atau kelelahan, serta bertanggung jawab penuh atas kondisi saya sendiri.
                                                        </p>
                                                    </div>
                                                </div>
                                                {errors.terms_health && (
                                                    <p className="text-red-500 text-sm mt-1">{errors.terms_health}</p>
                                                )}

                                                {/* Liability Terms */}
                                                <div className="flex items-start space-x-3 p-4 border rounded-lg bg-green-50 border-green-200">
                                                    <Checkbox
                                                        id="terms_liability"
                                                        checked={data.terms_liability}
                                                        onCheckedChange={(checked) => setData('terms_liability', !!checked)}
                                                        className={errors.terms_liability ? 'border-red-500' : ''}
                                                    />
                                                    <div className="flex-1">
                                                        <Label htmlFor="terms_liability" className="text-sm font-medium cursor-pointer">
                                                            Pembebasan Tanggung Jawab *
                                                        </Label>
                                                        <p className="text-xs text-gray-600 mt-1">
                                                            Saya membebaskan panitia dari tuntutan jika terjadi hal di luar kendali selama acara, selama panitia telah menjalankan tugas sesuai standar.
                                                        </p>
                                                    </div>
                                                </div>
                                                {errors.terms_liability && (
                                                    <p className="text-red-500 text-sm mt-1">{errors.terms_liability}</p>
                                                )}

                                                {/* Media Terms */}
                                                <div className="flex items-start space-x-3 p-4 border rounded-lg bg-yellow-50 border-yellow-200">
                                                    <Checkbox
                                                        id="terms_media"
                                                        checked={data.terms_media}
                                                        onCheckedChange={(checked) => setData('terms_media', !!checked)}
                                                        className={errors.terms_media ? 'border-red-500' : ''}
                                                    />
                                                    <div className="flex-1">
                                                        <Label htmlFor="terms_media" className="text-sm font-medium cursor-pointer">
                                                            Persetujuan Penggunaan Media *
                                                        </Label>
                                                        <p className="text-xs text-gray-600 mt-1">
                                                            Saya menyetujui penggunaan foto/video saya dalam dokumentasi dan publikasi acara oleh panitia.
                                                        </p>
                                                    </div>
                                                </div>
                                                {errors.terms_media && (
                                                    <p className="text-red-500 text-sm mt-1">{errors.terms_media}</p>
                                                )}

                                                <div className="p-4 border rounded-lg bg-gray-50 border-gray-200 mt-4">
                                                    <p className="text-sm font-medium text-gray-700">
                                                        Dengan mencentang semua kotak di atas, saya menyatakan bersedia mengikuti acara Kerungadem Run 2025 dengan sadar dan sukarela tanpa paksaan.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Captcha Security */}
                                        <div>
                                            <h3 className="text-lg font-semibold mb-4">Verifikasi Keamanan</h3>
                                            <div className="p-4 border rounded-lg bg-orange-50 border-orange-200">
                                                <Label htmlFor="captcha" className="text-sm font-medium">
                                                    Jawab pertanyaan matematika berikut untuk melanjutkan *
                                                </Label>
                                                <div className="mt-2 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                                                    <div className="flex items-center gap-2 bg-white px-3 sm:px-4 py-2 rounded border font-mono text-base sm:text-lg">
                                                        <span>{captchaNum1}</span>
                                                        <span>+</span>
                                                        <span>{captchaNum2}</span>
                                                        <span>=</span>
                                                        <span>?</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 sm:gap-3">
                                                        <Input
                                                            id="captcha"
                                                            type="number"
                                                            value={captchaAnswer}
                                                            onChange={(e) => setCaptchaAnswer(e.target.value)}
                                                            placeholder="Jawaban"
                                                            className={`w-20 sm:w-24 ${captchaError ? 'border-red-500' : ''}`}
                                                            min="0"
                                                            max="20"
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={generateCaptcha}
                                                            className="text-xs whitespace-nowrap"
                                                        >
                                                            Ganti Soal
                                                        </Button>
                                                    </div>
                                                </div>
                                                {captchaError && (
                                                    <p className="text-red-500 text-sm mt-2">{captchaError}</p>
                                                )}
                                                <p className="text-xs text-gray-600 mt-2">
                                                    Captcha ini membantu melindungi sistem dari serangan otomatis
                                                </p>
                                            </div>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Pilihan Tiket - Kolom Kecil */}
                        <div className="lg:col-span-1 order-2">
                            <div className="space-y-6">
                                {/* Ticket Selection */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Pilih Kategori</CardTitle>
                                        <CardDescription>
                                            Pilih kategori yang sesuai dengan kemampuan Anda
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {availableTickets.length > 0 ? (
                                            availableTickets.map((ticket) => (
                                                <div 
                                                    key={ticket.id}
                                                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                                                        selectedTicket?.id === ticket.id 
                                                            ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                                                            : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                                    onClick={() => handleTicketSelect(ticket.id.toString())}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-4 h-4 rounded-full border-2 ${
                                                            selectedTicket?.id === ticket.id
                                                                ? 'bg-primary border-primary'
                                                                : 'border-gray-300'
                                                        }`}>
                                                            {selectedTicket?.id === ticket.id && (
                                                                <CheckCircle className="w-4 h-4 text-white" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <h4 className="font-semibold">{ticket.name}</h4>
                                                                {ticket.is_free && (
                                                                    <Badge className="bg-green-500 text-white text-xs">GRATIS</Badge>
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-gray-600 mb-2">{ticket.description}</p>
                                                            <div className="flex justify-between items-center">
                                                                <span className={`font-bold ${ticket.is_free ? 'text-green-600' : 'text-primary'}`}>
                                                                    {formatPrice(ticket.price)}
                                                                </span>
                                                                <Badge variant="outline">{ticket.stock - ticket.sold} tersisa</Badge>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-8">
                                                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                                <p className="text-gray-500 mb-2">Belum ada tiket tersedia</p>
                                                <p className="text-sm text-gray-400">
                                                    Silakan hubungi admin untuk informasi lebih lanjut
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Order Details */}
                                {selectedTicket && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Detail Pesanan</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                                                <p className="text-sm text-blue-700">
                                                    <strong>Kebijakan:</strong> Setiap orang hanya dapat membeli 1 tiket berdasarkan NIK yang terdaftar.
                                                </p>
                                            </div>

                                            <Separator />

                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span>Harga per tiket:</span>
                                                    <span>{formatPrice(selectedTicket.price)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Jumlah:</span>
                                                    <span>1 tiket</span>
                                                </div>
                                                <Separator />
                                                <div className="flex justify-between font-bold text-lg">
                                                    <span>Total:</span>
                                                    <span className="text-primary">{formatPrice(totalPrice)}</span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Submit Button */}
                                <Button 
                                    onClick={handleSubmit}
                                    className="w-full" 
                                    size="lg" 
                                    disabled={!isFormValid || processing || !selectedTicket || isProcessingPayment}
                                >
                                    {isProcessingPayment ? (selectedTicket?.is_free ? 'Memproses pendaftaran...' : 'Memproses pembayaran...') : 
                                     !snapLoaded && !selectedTicket?.is_free ? 'Memuat sistem pembayaran...' : 
                                     processing ? 'Memproses...' : 
                                     selectedTicket?.is_free ? 'Daftar Gratis' : `Bayar ${formatPrice(totalPrice)}`}
                                </Button>

                                {!isFormValid && selectedTicket && (
                                    <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg text-sm">
                                        <AlertCircle className="h-4 w-4" />
                                        <span>
                                            {captchaError ? 'Selesaikan captcha dengan benar' : 'Lengkapi semua field yang wajib diisi dan jawab captcha'}
                                        </span>
                                    </div>
                                )}

                                {/* Success Section - Card untuk hasil pembayaran */}
                                {orderNumber && (
                                    <Card className="border-green-200 bg-green-50">
                                        <CardHeader className="text-center">
                                            <div className="flex items-center justify-center gap-2 mb-2">
                                                <CheckCircle className="h-6 w-6 text-green-600" />
                                                <CardTitle className="text-green-800">Pembayaran Berhasil!</CardTitle>
                                            </div>
                                            <CardDescription className="text-green-700">
                                                Nomor Pesanan: <span className="font-mono font-semibold">{orderNumber}</span>
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="text-center space-y-4">
                                            <p className="text-green-700">
                                                Tiket Anda telah berhasil dibeli dan dikonfirmasi. Detail tiket akan dikirim ke email Anda.
                                            </p>
                                            <div className="flex flex-col sm:flex-row gap-3">
                                                <Button 
                                                    variant="outline" 
                                                    className="flex-1"
                                                    onClick={() => {
                                                        window.location.reload();
                                                    }}
                                                >
                                                    Beli Tiket Lagi
                                                </Button>
                                                <Button 
                                                    className="flex-1"
                                                    asChild
                                                >
                                                    <Link href="/tickets/orders/check">
                                                        Cek Status Pesanan
                                                    </Link>
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
