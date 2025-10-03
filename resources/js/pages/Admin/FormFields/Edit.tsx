import { Head, useForm, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, ArrowLeft, Settings, Loader2, Plus, Trash2 } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface FormField {
    id: number;
    name: string;
    label: string;
    type: 'text' | 'email' | 'tel' | 'number' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date';
    is_required: boolean;
    is_active: boolean;
    placeholder?: string;
    description?: string;
    validation_rules?: string;
    options?: string[];
    order: number;
}

interface Props {
    formField: FormField;
}

const breadcrumbs = (formField: FormField): BreadcrumbItem[] => [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Form Fields',
        href: '/admin/form-fields',
    },
    {
        title: `Edit ${formField.label}`,
        href: `/admin/form-fields/${formField.id}/edit`,
    },
];

const fieldTypes = [
    { value: 'text', label: 'Text' },
    { value: 'email', label: 'Email' },
    { value: 'tel', label: 'Phone' },
    { value: 'number', label: 'Number' },
    { value: 'textarea', label: 'Textarea' },
    { value: 'select', label: 'Select Dropdown' },
    { value: 'checkbox', label: 'Checkbox' },
    { value: 'radio', label: 'Radio Button' },
    { value: 'date', label: 'Date' },
];

export default function Edit({ formField }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: formField.name,
        label: formField.label,
        type: formField.type as string,
        is_required: formField.is_required as boolean,
        is_active: formField.is_active as boolean,
        placeholder: formField.placeholder || '',
        description: formField.description || '',
        validation_rules: formField.validation_rules || '',
        options: formField.options || [] as string[],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/form-fields/${formField.id}`);
    };

    const handleAddOption = () => {
        setData('options', [...data.options, '']);
    };

    const handleUpdateOption = (index: number, value: string) => {
        const newOptions = [...data.options];
        newOptions[index] = value;
        setData('options', newOptions);
    };

    const handleRemoveOption = (index: number) => {
        const newOptions = data.options.filter((_, i) => i !== index);
        setData('options', newOptions);
    };

    const needsOptions = ['select', 'radio'].includes(data.type);

    return (
        <AppLayout breadcrumbs={breadcrumbs(formField)}>
            <Head title={`Edit ${formField.label}`} />
            <div className="p-4">
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Settings className="h-5 w-5 text-blue-600" />
                        <h1 className="text-xl font-semibold">Edit Form Field</h1>
                    </div>
                    <Button 
                        variant="outline" 
                        onClick={() => router.visit('/admin/form-fields')}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Form Fields
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Informasi Dasar</CardTitle>
                            <CardDescription>
                                Edit konfigurasi field yang akan ditampilkan pada formulir pendaftaran
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Field Name *</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="e.g., full_name"
                                        className={errors.name ? 'border-red-500' : ''}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Nama field dalam format snake_case untuk database
                                    </p>
                                    {errors.name && (
                                        <p className="text-sm text-red-500">{errors.name}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="label">Field Label *</Label>
                                    <Input
                                        id="label"
                                        type="text"
                                        value={data.label}
                                        onChange={(e) => setData('label', e.target.value)}
                                        placeholder="e.g., Nama Lengkap"
                                        className={errors.label ? 'border-red-500' : ''}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Label yang akan ditampilkan kepada user
                                    </p>
                                    {errors.label && (
                                        <p className="text-sm text-red-500">{errors.label}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="type">Field Type *</Label>
                                    <Select
                                        value={data.type}
                                        onValueChange={(value) => setData('type', value)}
                                    >
                                        <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {fieldTypes.map((type) => (
                                                <SelectItem key={type.value} value={type.value}>
                                                    {type.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.type && (
                                        <p className="text-sm text-red-500">{errors.type}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="placeholder">Placeholder</Label>
                                    <Input
                                        id="placeholder"
                                        type="text"
                                        value={data.placeholder}
                                        onChange={(e) => setData('placeholder', e.target.value)}
                                        placeholder="Masukkan placeholder..."
                                        className={errors.placeholder ? 'border-red-500' : ''}
                                    />
                                    {errors.placeholder && (
                                        <p className="text-sm text-red-500">{errors.placeholder}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Deskripsi field (opsional)"
                                    className={errors.description ? 'border-red-500' : ''}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Deskripsi tambahan yang akan ditampilkan dibawah field
                                </p>
                                {errors.description && (
                                    <p className="text-sm text-red-500">{errors.description}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="validation_rules">Validation Rules</Label>
                                <Input
                                    id="validation_rules"
                                    type="text"
                                    value={data.validation_rules}
                                    onChange={(e) => setData('validation_rules', e.target.value)}
                                    placeholder="e.g., min:3|max:50"
                                    className={errors.validation_rules ? 'border-red-500' : ''}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Laravel validation rules (pisahkan dengan |)
                                </p>
                                {errors.validation_rules && (
                                    <p className="text-sm text-red-500">{errors.validation_rules}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {needsOptions && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Options</CardTitle>
                                <CardDescription>
                                    Edit pilihan untuk field select atau radio button
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    {data.options.map((option, index) => (
                                        <div key={index} className="flex gap-2">
                                            <Input
                                                value={option}
                                                onChange={(e) => handleUpdateOption(index, e.target.value)}
                                                placeholder={`Option ${index + 1}`}
                                                className="flex-1"
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleRemoveOption(index)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleAddOption}
                                        className="w-full"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Tambah Option
                                    </Button>
                                </div>
                                {errors.options && (
                                    <p className="text-sm text-red-500">{errors.options}</p>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    <Card>
                        <CardHeader>
                            <CardTitle>Settings</CardTitle>
                            <CardDescription>
                                Edit konfigurasi tambahan untuk field
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center space-x-3 rounded-lg border p-3">
                                <Checkbox
                                    id="is_required"
                                    checked={data.is_required}
                                    onCheckedChange={(checked) => setData('is_required', Boolean(checked))}
                                />
                                <div className="flex-1">
                                    <Label htmlFor="is_required" className="text-sm font-medium">
                                        Required Field
                                    </Label>
                                    <p className="text-xs text-muted-foreground">
                                        Field ini wajib diisi oleh user
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3 rounded-lg border p-3">
                                <Switch
                                    id="is_active"
                                    checked={data.is_active}
                                    onCheckedChange={(checked) => setData('is_active', Boolean(checked))}
                                />
                                <div className="flex-1">
                                    <Label htmlFor="is_active" className="text-sm font-medium">
                                        {data.is_active ? 'Active' : 'Inactive'}
                                    </Label>
                                    <p className="text-xs text-muted-foreground">
                                        {data.is_active ? 'Field akan ditampilkan pada form' : 'Field tidak akan ditampilkan pada form'}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex items-center justify-end space-x-4">
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => router.visit('/admin/form-fields')}
                            disabled={processing}
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={processing}
                            className="flex items-center gap-2"
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Menyimpan...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4" />
                                    Update Field
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}