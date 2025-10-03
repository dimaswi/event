import React, { useState, useEffect } from 'react';
import { Head, router, Link, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

interface Ticket {
  id: number;
  name: string;
  price: number;
  description: string;
  is_active: boolean;
  stock: number;
  sold: number;
  available_stock: number;
  is_free?: boolean;
}

interface FormField {
  id: number;
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'number' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date';
  is_required: boolean;
  placeholder?: string;
  description?: string;
  validation_rules?: string;
  options?: string[];
  order: number;
}

interface Props {
  tickets: Ticket[];
  formFields: FormField[];
  eventSettings?: {
    event: Record<string, string>;
    contact: Record<string, string>;
    footer: Record<string, string>;
  };
}

export default function NewOrder({ tickets, formFields, eventSettings }: Props) {
  const { eventSettings: settings } = usePage().props as any;
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  
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

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const renderFormField = (field: FormField) => {
    const fieldValue = formData[field.name] || '';

    switch (field.type) {
      case 'text':
      case 'email':
      case 'tel':
      case 'number':
      case 'date':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label}
              {field.is_required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.name}
              type={field.type}
              placeholder={field.placeholder}
              value={fieldValue}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              required={field.is_required}
            />
            {field.description && (
              <p className="text-sm text-muted-foreground">{field.description}</p>
            )}
          </div>
        );

      case 'textarea':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label}
              {field.is_required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Textarea
              id={field.name}
              placeholder={field.placeholder}
              value={fieldValue}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              required={field.is_required}
            />
            {field.description && (
              <p className="text-sm text-muted-foreground">{field.description}</p>
            )}
          </div>
        );

      case 'select':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label}
              {field.is_required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Select
              value={fieldValue}
              onValueChange={(value) => handleFieldChange(field.name, value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={field.placeholder || `Pilih ${field.label}`} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option, index) => (
                  <SelectItem key={index} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {field.description && (
              <p className="text-sm text-muted-foreground">{field.description}</p>
            )}
          </div>
        );

      case 'checkbox':
        return (
          <div key={field.id} className="space-y-2">
            <div className="flex items-start space-x-3 p-4 border rounded-lg bg-blue-50 border-blue-200">
              <Checkbox
                id={field.name}
                checked={!!fieldValue}
                onCheckedChange={(checked) => handleFieldChange(field.name, checked)}
                required={field.is_required}
              />
              <div className="flex-1">
                <Label htmlFor={field.name} className="text-sm font-medium cursor-pointer">
                  {field.label}
                  {field.is_required && <span className="text-red-500 ml-1">*</span>}
                </Label>
                {field.description && (
                  <p className="text-xs text-gray-600 mt-1">{field.description}</p>
                )}
              </div>
            </div>
          </div>
        );

      case 'radio':
        return (
          <div key={field.id} className="space-y-2">
            <Label>
              {field.label}
              {field.is_required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <div className="space-y-2">
              {field.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id={`${field.name}-${index}`}
                    name={field.name}
                    value={option}
                    checked={fieldValue === option}
                    onChange={(e) => handleFieldChange(field.name, e.target.value)}
                    required={field.is_required}
                    className="h-4 w-4 text-blue-600"
                  />
                  <Label htmlFor={`${field.name}-${index}`} className="text-sm">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
            {field.description && (
              <p className="text-sm text-muted-foreground">{field.description}</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  // Check if all required fields are filled
  useEffect(() => {
    const requiredFields = formFields.filter(field => field.is_required);
    
    const emptyFields = requiredFields.filter(field => {
      const value = formData[field.name];
      if (field.type === 'checkbox') {
        return value !== true; // untuk checkbox, harus true
      }
      return !value || (typeof value === 'string' && value.trim() === '');
    });

    // Check captcha
    const correctAnswer = captchaNum1 + captchaNum2;
    const isCaptchaValid = captchaAnswer === correctAnswer.toString();

    const isValid = emptyFields.length === 0 && isCaptchaValid && selectedTicket;
    setIsFormValid(!!isValid);
    
    // Set captcha error
    if (captchaAnswer && !isCaptchaValid) {
      setCaptchaError('Jawaban captcha tidak benar');
    } else {
      setCaptchaError('');
    }
  }, [formData, captchaAnswer, captchaNum1, captchaNum2, selectedTicket, formFields]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate captcha before proceeding
    const correctAnswer = captchaNum1 + captchaNum2;
    if (captchaAnswer !== correctAnswer.toString()) {
      setCaptchaError('Jawaban captcha tidak benar');
      return;
    }
    
    if (selectedTicket && isFormValid) {
      setIsLoading(true);

      const submitData = {
        ticket_id: selectedTicket.id,
        form_data: formData,
      };

      router.post(route('api.tickets.purchase', selectedTicket.id), submitData, {
        onSuccess: () => {
          toast.success('Pesanan berhasil dibuat! Silakan download tiket Anda.');
        },
        onError: (errors) => {
          console.error('Submission errors:', errors);
          toast.error('Terjadi kesalahan. Silakan coba lagi.');
        },
        onFinish: () => {
          setIsLoading(false);
        },
      });
    }
  };

  const handleTicketSelect = (ticketId: string) => {
    const ticket = tickets.find(t => t.id.toString() === ticketId);
    setSelectedTicket(ticket || null);
  };

  // Debug: Log data yang diterima
  console.log('Tickets received in NewOrder:', tickets);
  
  const availableTickets = tickets.filter(ticket => {
    const isActive = ticket.is_active;
    const availableStock = ticket.available_stock || (ticket.stock - ticket.sold);
    const hasStock = availableStock > 0;
    
    console.log(`Ticket ${ticket.name}:`, { 
      isActive, 
      hasStock,
      available_stock: ticket.available_stock,
      calculated_available_stock: ticket.stock - ticket.sold,
      stock: ticket.stock,
      sold: ticket.sold
    });
    
    return isActive && hasStock;
  });
  
  console.log('Available tickets after filter in NewOrder:', availableTickets);

  const totalPrice = selectedTicket ? selectedTicket.price * 1 : 0;

  return (
    <>
      <Head title="Pendaftaran - Fun Run Event" />
      
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img 
                  src={settings?.event?.event_logo || "/logo.svg"} 
                  alt="Event Logo" 
                  className="h-10 w-10 object-contain" 
                />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    {settings?.event?.event_name || 'TIKET EVENT'}
                  </h1>
                  <p className="text-sm text-gray-600">Formulir Pendaftaran</p>
                </div>
              </div>
              
              <Link href="/" className="flex items-center text-blue-600 hover:text-blue-700 font-medium">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Kembali
              </Link>
            </div>
          </div>
        </header>

        <div className="container mx-auto max-w-6xl px-4 py-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Formulir Pendaftaran Event
            </h2>
            <p className="text-gray-600">
              Lengkapi data diri Anda dan pilih kategori tiket
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Form - Kolom Besar */}
            <div className="lg:col-span-2 order-1">
              <Card>
                <CardHeader>
                  <CardTitle>Data Peserta</CardTitle>
                  <CardDescription>
                    Mohon lengkapi semua informasi yang diperlukan
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form id="order-form" onSubmit={handleSubmit} className="space-y-6">
                    {/* Dynamic Form Fields */}
                    <div className="space-y-4">
                      {formFields.map(renderFormField)}
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
              <div className="space-y-6 sticky top-6">
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
                          <strong>Kebijakan:</strong> Setiap orang hanya dapat membeli 1 tiket.
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

                      <Button 
                        type="submit"
                        form="order-form"
                        disabled={!isFormValid || isLoading}
                        className="w-full"
                        size="lg"
                      >
                        {isLoading ? (
                          'Memproses...'
                        ) : totalPrice === 0 ? (
                          'Daftar Sekarang'
                        ) : (
                          'Lanjut ke Pembayaran'
                        )}
                      </Button>

                      <p className="text-xs text-gray-500 text-center">
                        Dengan mendaftar, Anda menyetujui syarat dan ketentuan yang berlaku
                      </p>
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