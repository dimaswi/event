import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Settings, Pencil, Trash2, Eye } from 'lucide-react';
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
    created_at: string;
    updated_at: string;
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
        title: formField.label,
        href: `/admin/form-fields/${formField.id}`,
    },
];

const getFieldTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
        'text': 'Text',
        'email': 'Email',
        'tel': 'Phone',
        'number': 'Number',
        'textarea': 'Textarea',
        'select': 'Select Dropdown',
        'checkbox': 'Checkbox',
        'radio': 'Radio Button',
        'date': 'Date',
    };
    return typeMap[type] || type;
};

export default function Show({ formField }: Props) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs(formField)}>
            <Head title={`Detail ${formField.label}`} />
            <div className="p-4">
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Settings className="h-5 w-5 text-blue-600" />
                        <h1 className="text-xl font-semibold">Detail Form Field</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button 
                            variant="outline" 
                            onClick={() => router.visit('/admin/form-fields')}
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to List
                        </Button>
                        <Button 
                            variant="outline" 
                            onClick={() => router.visit(`/admin/form-fields/${formField.id}/edit`)}
                            className="flex items-center gap-2 hover:bg-yellow-50"
                        >
                            <Pencil className="h-4 w-4 text-yellow-600" />
                            Edit
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Information */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    Informasi Dasar
                                    <div className="flex items-center gap-2">
                                        <Badge variant={formField.is_active ? 'default' : 'secondary'}>
                                            {formField.is_active ? 'Active' : 'Inactive'}
                                        </Badge>
                                        {formField.is_required && (
                                            <Badge variant="destructive">Required</Badge>
                                        )}
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Field Name</h4>
                                        <code className="text-sm bg-muted px-2 py-1 rounded font-mono">
                                            {formField.name}
                                        </code>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Field Label</h4>
                                        <p className="text-sm font-medium">{formField.label}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Field Type</h4>
                                        <Badge variant="outline" className="text-xs">
                                            {getFieldTypeLabel(formField.type)}
                                        </Badge>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Order</h4>
                                        <p className="text-sm font-mono">#{formField.order}</p>
                                    </div>
                                </div>

                                {formField.placeholder && (
                                    <div>
                                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Placeholder</h4>
                                        <p className="text-sm italic text-muted-foreground">"{formField.placeholder}"</p>
                                    </div>
                                )}

                                {formField.description && (
                                    <div>
                                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Description</h4>
                                        <p className="text-sm">{formField.description}</p>
                                    </div>
                                )}

                                {formField.validation_rules && (
                                    <div>
                                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Validation Rules</h4>
                                        <code className="text-sm bg-muted px-2 py-1 rounded font-mono">
                                            {formField.validation_rules}
                                        </code>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Options (if applicable) */}
                        {formField.options && formField.options.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Options</CardTitle>
                                    <CardDescription>
                                        Pilihan yang tersedia untuk field {getFieldTypeLabel(formField.type).toLowerCase()}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {formField.options.map((option, index) => (
                                            <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                                                <span className="text-xs font-mono text-muted-foreground">
                                                    {index + 1}.
                                                </span>
                                                <span className="text-sm">{option}</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Preview */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Eye className="h-4 w-4" />
                                    Field Preview
                                </CardTitle>
                                <CardDescription>
                                    Pratinjau bagaimana field ini akan tampil pada form
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="p-4 bg-muted rounded-lg">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">
                                            {formField.label}
                                            {formField.is_required && <span className="text-red-500 ml-1">*</span>}
                                        </label>
                                        
                                        {formField.type === 'textarea' ? (
                                            <textarea
                                                placeholder={formField.placeholder || ''}
                                                className="w-full p-2 border rounded-md text-sm"
                                                rows={3}
                                                disabled
                                            />
                                        ) : formField.type === 'select' ? (
                                            <select className="w-full p-2 border rounded-md text-sm" disabled>
                                                <option value="">{formField.placeholder || `Pilih ${formField.label}`}</option>
                                                {formField.options?.map((option, index) => (
                                                    <option key={index} value={option}>{option}</option>
                                                ))}
                                            </select>
                                        ) : formField.type === 'checkbox' ? (
                                            <div className="flex items-center space-x-2">
                                                <input type="checkbox" disabled className="rounded" />
                                                <span className="text-sm">{formField.label}</span>
                                            </div>
                                        ) : formField.type === 'radio' ? (
                                            <div className="space-y-2">
                                                {formField.options?.map((option, index) => (
                                                    <div key={index} className="flex items-center space-x-2">
                                                        <input type="radio" name={formField.name} disabled className="rounded" />
                                                        <span className="text-sm">{option}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <input
                                                type={formField.type}
                                                placeholder={formField.placeholder || ''}
                                                className="w-full p-2 border rounded-md text-sm"
                                                disabled
                                            />
                                        )}

                                        {formField.description && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {formField.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Status</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Status</span>
                                    <Badge variant={formField.is_active ? 'default' : 'secondary'}>
                                        {formField.is_active ? 'Active' : 'Inactive'}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Required</span>
                                    <Badge variant={formField.is_required ? 'destructive' : 'outline'}>
                                        {formField.is_required ? 'Yes' : 'No'}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Order</span>
                                    <span className="text-sm font-mono">#{formField.order}</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Timestamps</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Created</h4>
                                    <p className="text-sm">{formatDate(formField.created_at)}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Last Updated</h4>
                                    <p className="text-sm">{formatDate(formField.updated_at)}</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => router.visit(`/admin/form-fields/${formField.id}/edit`)}
                                    className="w-full justify-start hover:bg-yellow-50"
                                >
                                    <Pencil className="h-4 w-4 mr-2 text-yellow-600" />
                                    Edit Field
                                </Button>
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => {
                                        if (confirm(`Apakah Anda yakin ingin menghapus field "${formField.label}"?`)) {
                                            router.delete(`/admin/form-fields/${formField.id}`);
                                        }
                                    }}
                                    className="w-full justify-start hover:bg-red-50"
                                >
                                    <Trash2 className="h-4 w-4 mr-2 text-red-600" />
                                    Delete Field
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}