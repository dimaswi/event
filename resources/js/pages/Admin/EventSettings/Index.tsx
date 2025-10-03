import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileUpload } from '@/components/ui/file-upload';
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
import { Plus, Save, Trash2, Settings, Eye } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface EventSetting {
    id: number;
    key: string;
    value: string;
    group: string;
    description?: string;
}

interface Props {
    settings: Record<string, EventSetting[]>;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Event Settings',
        href: '/admin/event-settings',
    },
];

export default function Index({ settings }: Props) {
    const [activeGroup, setActiveGroup] = useState('event');
    const [formData, setFormData] = useState<Record<string, string>>({});
    const [sponsorCount, setSponsorCount] = useState(() => {
        const sponsorSettings = settings.sponsors || [];
        const maxIndex = sponsorSettings.reduce((max, setting) => {
            const match = setting.key.match(/sponsor_(\d+)_/);
            return match ? Math.max(max, parseInt(match[1])) : max;
        }, 0);
        return Math.max(1, maxIndex); // Changed from 6 to 1
    });
    
    const { data, setData, post, processing, errors, reset } = useForm({
        key: '',
        value: '',
        group: activeGroup,
        description: ''
    });

    const groups = {
        event: {
            title: 'Event Information',
            description: 'Informasi dasar tentang event',
            icon: <Settings className="h-4 w-4" />,
            fields: [
                { key: 'event_name', label: 'Nama Event', type: 'text', placeholder: 'Fun Run Event 2025' },
                { key: 'event_subtitle', label: 'Subtitle Event', type: 'text', placeholder: 'Jakarta Marathon Series' },
                { key: 'event_description', label: 'Deskripsi Event', type: 'textarea', placeholder: 'Bergabunglah dalam acara lari...' },
                { key: 'event_location', label: 'Lokasi Event', type: 'text', placeholder: 'Monas, Jakarta Pusat' },
                { key: 'event_date', label: 'Tanggal Event', type: 'date' },
                { key: 'event_time', label: 'Waktu Event', type: 'text', placeholder: '06:00 - 10:00 WIB' },
                { key: 'event_logo', label: 'Logo Event', type: 'file', placeholder: '/logo.svg' },
                { key: 'size_chart', label: 'Panduan Ukuran Kaos', type: 'file', placeholder: 'Upload gambar panduan ukuran' },
                { key: 'event_hero_gradient', label: 'Hero Background Gradient', type: 'text', placeholder: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 25%, #059669 75%, #16a34a 100%)' },
            ]
        },
        contact: {
            title: 'Contact Information',
            description: 'Informasi kontak dan penyelenggara',
            icon: <Settings className="h-4 w-4" />,
            fields: [
                { key: 'contact_email', label: 'Email Kontak', type: 'email', placeholder: 'info@funrunevent.com' },
                { key: 'contact_phone', label: 'Nomor Telepon', type: 'text', placeholder: '0812-3456-7890' },
                { key: 'organizer_name', label: 'Nama Penyelenggara', type: 'text', placeholder: 'PT. Sport Event Indonesia' },
            ]
        },
        sponsor: {
            title: 'Sponsor Settings',
            description: 'Pengaturan bagian sponsor',
            icon: <Settings className="h-4 w-4" />,
            fields: [
                { key: 'sponsor_title', label: 'Judul Sponsor', type: 'text', placeholder: 'Didukung Oleh' },
                { key: 'sponsor_subtitle', label: 'Subtitle Sponsor', type: 'text', placeholder: 'Partner dan sponsor yang mendukung...' },
            ]
        },
        sponsors: {
            title: 'Sponsor List',
            description: 'Daftar sponsor dan partner',
            icon: <Settings className="h-4 w-4" />,
            fields: [] // Dynamic fields for sponsors
        },
        footer: {
            title: 'Footer Content',
            description: 'Konten footer website',
            icon: <Settings className="h-4 w-4" />,
            fields: [
                { key: 'footer_description', label: 'Deskripsi Footer', type: 'textarea', placeholder: 'Acara lari terbesar di Jakarta...' },
            ]
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.event-settings.store'), {
            onSuccess: () => {
                reset();
            }
        });
    };

    const handleFormChange = (key: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const saveAllSettings = () => {
        const settingsToSave = Object.entries(formData).map(([key, value]) => {
            const existingSetting = Object.values(settings).flat().find(s => s.key === key);
            return {
                key,
                value,
                group: existingSetting?.group || activeGroup
            };
        });

        if (settingsToSave.length > 0) {
            router.post(route('admin.event-settings.bulk-update'), {
                settings: settingsToSave
            }, {
                onSuccess: () => {
                    setFormData({});
                }
            });
        }
    };

    const addNewSponsor = () => {
        setSponsorCount(prev => prev + 1);
    };

    const updateSetting = (setting: EventSetting, newValue: string) => {
        handleFormChange(setting.key, newValue);
    };

    const deleteSponsor = (sponsorIndex: number) => {
        const nameKey = `sponsor_${sponsorIndex}_name`;
        const typeKey = `sponsor_${sponsorIndex}_type`;
        const logoKey = `sponsor_${sponsorIndex}_logo`;
        
        // Clear from form data
        setFormData(prev => {
            const newData = { ...prev };
            delete newData[nameKey];
            delete newData[typeKey];
            delete newData[logoKey];
            return newData;
        });
        
        // Find and delete from database if exists
        const sponsorSettings = settings.sponsors || [];
        const settingsToDelete = sponsorSettings.filter(s => 
            s.key === nameKey || s.key === typeKey || s.key === logoKey
        );
        
        settingsToDelete.forEach(setting => {
            router.delete(route('admin.event-settings.destroy', setting.id));
        });
        
        // Reduce sponsor count if deleting the last sponsor and count > 1
        if (sponsorIndex === sponsorCount && sponsorCount > 1) {
            setSponsorCount(prev => prev - 1);
        }
    };

    const renderField = (field: any, setting?: EventSetting) => {
        const value = formData[field.key] !== undefined ? formData[field.key] : (setting?.value || '');
        
        if (field.type === 'textarea') {
            return (
                <Textarea
                    value={value}
                    onChange={(e) => handleFormChange(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className="min-h-[100px]"
                />
            );
        }
        
        if (field.type === 'file') {
            return (
                <FileUpload
                    label=""
                    value={value}
                    onChange={(url) => handleFormChange(field.key, url)}
                    placeholder={field.placeholder}
                />
            );
        }

        // Special handling for gradient field
        if (field.key === 'event_hero_gradient') {
            const gradientPresets = [
                { name: 'Blue to Green (Default)', value: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 25%, #059669 75%, #16a34a 100%)' },
                { name: 'Purple to Pink', value: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 25%, #ec4899 75%, #f472b6 100%)' },
                { name: 'Orange to Red', value: 'linear-gradient(135deg, #ea580c 0%, #dc2626 25%, #b91c1c 75%, #991b1b 100%)' },
                { name: 'Teal to Blue', value: 'linear-gradient(135deg, #0d9488 0%, #0891b2 25%, #0284c7 75%, #2563eb 100%)' },
                { name: 'Green to Yellow', value: 'linear-gradient(135deg, #059669 0%, #16a34a 25%, #65a30d 75%, #eab308 100%)' }
            ];

            return (
                <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                        {gradientPresets.map((preset, index) => (
                            <button
                                key={index}
                                type="button"
                                onClick={() => handleFormChange(field.key, preset.value)}
                                className="h-12 rounded border-2 border-gray-200 hover:border-gray-400 transition-colors text-xs p-1 font-medium text-white text-center flex items-center justify-center"
                                style={{ background: preset.value }}
                                title={preset.name}
                            >
                                {preset.name}
                            </button>
                        ))}
                    </div>
                    <Input
                        type="text"
                        value={value}
                        onChange={(e) => handleFormChange(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        className="font-mono text-sm"
                    />
                    {value && (
                        <div 
                            className="h-16 rounded border"
                            style={{ background: value }}
                            title="Preview gradient"
                        />
                    )}
                </div>
            );
        }
        
        return (
            <Input
                type={field.type}
                value={value}
                onChange={(e) => handleFormChange(field.key, e.target.value)}
                placeholder={field.placeholder}
            />
        );
    };

    const renderSponsorFields = () => {
        const sponsorSettings = settings.sponsors || [];
        const sponsorSlots = [];
        
        for (let i = 1; i <= sponsorCount; i++) {
            const nameKey = `sponsor_${i}_name`;
            const typeKey = `sponsor_${i}_type`;
            const logoKey = `sponsor_${i}_logo`;

            const nameSetting = sponsorSettings.find(s => s.key === nameKey);
            const typeSetting = sponsorSettings.find(s => s.key === typeKey);
            const logoSetting = sponsorSettings.find(s => s.key === logoKey);

            const nameValue = formData[nameKey] !== undefined ? formData[nameKey] : (nameSetting?.value || '');
            const typeValue = formData[typeKey] !== undefined ? formData[typeKey] : (typeSetting?.value || '');
            const logoValue = formData[logoKey] !== undefined ? formData[logoKey] : (logoSetting?.value || '');

            sponsorSlots.push(
                <Card key={i} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold">Sponsor {i}</h4>
                        {i > 1 && (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="text-red-600 hover:text-red-700"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Hapus Sponsor</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Apakah Anda yakin ingin menghapus sponsor ini? Tindakan ini tidak dapat dibatalkan.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Batal</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={() => deleteSponsor(i)}
                                            className="bg-red-600 hover:bg-red-700"
                                        >
                                            Hapus
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}
                    </div>
                    <div className="space-y-3">
                        <div>
                            <Label htmlFor={nameKey}>Nama Sponsor</Label>
                            <Input
                                id={nameKey}
                                value={nameValue}
                                onChange={(e) => handleFormChange(nameKey, e.target.value)}
                                placeholder="Nama sponsor"
                            />
                        </div>
                        <div>
                            <Label htmlFor={typeKey}>Tipe Sponsor</Label>
                            <Input
                                id={typeKey}
                                value={typeValue}
                                onChange={(e) => handleFormChange(typeKey, e.target.value)}
                                placeholder="SPONSOR UTAMA"
                            />
                        </div>
                        <div>
                            <Label htmlFor={logoKey}>Logo Sponsor</Label>
                            <FileUpload
                                label=""
                                value={logoValue}
                                onChange={(url) => handleFormChange(logoKey, url)}
                                placeholder="https://example.com/logo.png"
                            />
                        </div>
                    </div>
                </Card>
            );
        }

        return sponsorSlots;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Event Settings - Admin" />
            
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                {/* Header with Save Button */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">Event Settings Management</h1>
                        <p className="text-gray-600">Kelola informasi event dan konten website</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <a href={route('public.tickets.index')} target="_blank">
                                <Eye className="h-4 w-4 mr-2" />
                                Preview Website
                            </a>
                        </Button>
                        <Button 
                            onClick={saveAllSettings} 
                            disabled={processing || Object.keys(formData).length === 0}
                            className="flex items-center gap-2"
                        >
                            <Save className="h-4 w-4" />
                            {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </Button>
                    </div>
                </div>

                {/* Settings Content */}
                <div className="bg-white rounded-xl border border-sidebar-border/70 shadow-sm">
                    <Tabs value={activeGroup} onValueChange={setActiveGroup} className="p-6">
                        <TabsList className="grid w-full grid-cols-5 mb-8">
                            {Object.entries(groups).map(([key, group]) => (
                                <TabsTrigger key={key} value={key} className="flex items-center gap-2">
                                    {group.icon}
                                    {group.title}
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        {Object.entries(groups).map(([groupKey, group]) => (
                            <TabsContent key={groupKey} value={groupKey}>
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            {group.icon}
                                            {group.title}
                                        </CardTitle>
                                        <CardDescription>
                                            {group.description}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {groupKey === 'sponsors' ? (
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="text-lg font-medium">Daftar Sponsor</h3>
                                                    <Button onClick={addNewSponsor} size="sm">
                                                        <Plus className="h-4 w-4 mr-2" />
                                                        Tambah Sponsor
                                                    </Button>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {renderSponsorFields()}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-6">
                                                {group.fields.map((field) => {
                                                    const setting = settings[groupKey]?.find(s => s.key === field.key);
                                                    return (
                                                        <div key={field.key} className="space-y-2">
                                                            <Label htmlFor={field.key}>
                                                                {field.label}
                                                            </Label>
                                                            {renderField(field, setting)}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        ))}
                    </Tabs>
                </div>
            </div>
        </AppLayout>
    );
}
