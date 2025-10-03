import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Eye, Loader2, MoveUp, MoveDown, Settings } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, SharedData } from '@/types';
import { toast } from "sonner";
import { route } from "ziggy-js";

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
}

interface PaginatedFormFields {
    data: FormField[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

interface Props extends SharedData {
    formFields: PaginatedFormFields;
    filters: {
        perPage: number;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Form Fields',
        href: '/admin/form-fields',
    },
];

export default function FormFields() {
    const { formFields, filters: initialFilters } = usePage<Props>().props;
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        field: FormField | null;
        loading: boolean;
    }>({
        open: false,
        field: null,
        loading: false,
    });

    const handlePerPageChange = (perPage: number) => {
        router.get('/admin/form-fields', {
            perPage,
            page: 1,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handlePageChange = (page: number) => {
        router.get('/admin/form-fields', {
            perPage: initialFilters.perPage,
            page,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleDeleteClick = (field: FormField) => {
        setDeleteDialog({
            open: true,
            field: field,
            loading: false,
        });
    };

    const handleDeleteConfirm = async () => {
        if (!deleteDialog.field) return;
        
        // Set loading state
        setDeleteDialog(prev => ({ ...prev, loading: true }));
        
        try {
            await router.delete(route('admin.form-fields.destroy', deleteDialog.field.id), {
                onSuccess: () => {
                    toast.success(`Field ${deleteDialog.field?.label} berhasil dihapus`);
                    setDeleteDialog({ open: false, field: null, loading: false });
                },
                onError: () => {
                    toast.error('Gagal menghapus field');
                    setDeleteDialog(prev => ({ ...prev, loading: false }));
                }
            });
        } catch (error) {
            toast.error('Terjadi kesalahan saat menghapus field');
            setDeleteDialog(prev => ({ ...prev, loading: false }));
        }
    };

    const handleDeleteCancel = () => {
        setDeleteDialog({ open: false, field: null, loading: false });
    };

    const handleReorder = (fieldId: number, direction: 'up' | 'down') => {
        router.post(route('admin.form-fields.reorder'), {
            field_id: fieldId,
            direction: direction,
        }, {
            onSuccess: () => {
                toast.success('Urutan field berhasil diubah');
            },
            onError: () => {
                toast.error('Terjadi kesalahan saat mengubah urutan');
            },
        });
    };

    const getFieldTypeLabel = (type: string) => {
        const typeMap: Record<string, string> = {
            'text': 'Text',
            'email': 'Email',
            'tel': 'Phone',
            'number': 'Number',
            'textarea': 'Textarea',
            'select': 'Select',
            'checkbox': 'Checkbox',
            'radio': 'Radio',
            'date': 'Date',
        };
        return typeMap[type] || type;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Form Fields" />
            <div className="p-4">
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Settings className="h-5 w-5 text-blue-600" />
                        <h1 className="text-xl font-semibold">Form Fields</h1>
                    </div>
                    
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex items-center gap-2"
                        onClick={() => router.visit('/admin/form-fields/create')}
                    >
                        <Plus className="h-4 w-4" />
                        Tambah
                    </Button>
                </div>
                
                <div className="w-full overflow-x-auto rounded-md border">
                    <Table>
                        <TableHeader className="bg-gray-100">
                            <TableRow>
                                <TableHead className="w-[50px]">No.</TableHead>
                                <TableHead className="w-[60px]">Order</TableHead>
                                <TableHead>Label</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Required</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {formFields.data.length > 0 ? (
                                formFields.data.map((field: FormField, index: number) => (
                                    <TableRow key={field.id}>
                                        <TableCell>
                                            {(formFields.current_page - 1) * formFields.per_page + index + 1}
                                        </TableCell>
                                        <TableCell className="text-center font-mono text-sm">
                                            #{field.order}
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{field.label}</div>
                                                {field.description && (
                                                    <div className="text-sm text-muted-foreground">
                                                        {field.description.length > 50
                                                            ? `${field.description.substring(0, 50)}...`
                                                            : field.description
                                                        }
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <code className="text-sm bg-muted px-2 py-1 rounded font-mono">
                                                {field.name}
                                            </code>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="text-xs">
                                                {getFieldTypeLabel(field.type)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={field.is_active ? 'default' : 'secondary'}>
                                                {field.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {field.is_required ? (
                                                <Badge variant="destructive" className="text-xs">Required</Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-xs">Optional</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="flex justify-end space-x-2">
                                            <div className="flex items-center gap-1">
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    className="hover:bg-gray-200"
                                                    onClick={() => handleReorder(field.id, 'up')}
                                                    disabled={index === 0}
                                                    title="Move Up"
                                                >
                                                    <MoveUp className="h-4 w-4 text-blue-500" />
                                                </Button>
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    className="hover:bg-gray-200"
                                                    onClick={() => handleReorder(field.id, 'down')}
                                                    disabled={index === formFields.data.length - 1}
                                                    title="Move Down"
                                                >
                                                    <MoveDown className="h-4 w-4 text-blue-500" />
                                                </Button>
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    className="hover:bg-gray-200"
                                                    onClick={() => router.visit(route('admin.form-fields.show', field.id))}
                                                >
                                                    <Eye className="h-4 w-4 text-blue-500" />
                                                </Button>
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    className="hover:bg-gray-200"
                                                    onClick={() => router.visit(route('admin.form-fields.edit', field.id))}
                                                >
                                                    <Pencil className="h-4 w-4 text-yellow-500" />
                                                </Button>
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    className="hover:bg-gray-200"
                                                    onClick={() => handleDeleteClick(field)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-8">
                                        <div className="flex flex-col items-center gap-2">
                                            <Settings className="h-12 w-12 text-muted-foreground" />
                                            <p className="text-muted-foreground">Belum ada form fields</p>
                                            <Button 
                                                variant="outline" 
                                                size="sm"
                                                onClick={() => router.visit('/admin/form-fields/create')}
                                            >
                                                <Plus className="h-4 w-4 mr-2" />
                                                Tambah Field Pertama
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {formFields.last_page > 1 && (
                    <div className="mt-4 flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                            Menampilkan {formFields.from} - {formFields.to} dari {formFields.total} field
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(formFields.current_page - 1)}
                                disabled={formFields.current_page <= 1}
                            >
                                Previous
                            </Button>
                            
                            {Array.from({ length: formFields.last_page }, (_, i) => i + 1)
                                .filter(page => 
                                    page === 1 || 
                                    page === formFields.last_page || 
                                    Math.abs(page - formFields.current_page) <= 1
                                )
                                .map((page, index, array) => (
                                    <div key={page} className="flex items-center">
                                        {index > 0 && array[index - 1] !== page - 1 && (
                                            <span className="text-muted-foreground px-2">...</span>
                                        )}
                                        <Button
                                            variant={page === formFields.current_page ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => handlePageChange(page)}
                                        >
                                            {page}
                                        </Button>
                                    </div>
                                ))
                            }
                            
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(formFields.current_page + 1)}
                                disabled={formFields.current_page >= formFields.last_page}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}

                {/* Per Page Selector */}
                <div className="mt-4 flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Show:</span>
                    {[10, 25, 50, 100].map((perPage) => (
                        <Button
                            key={perPage}
                            variant={initialFilters.perPage === perPage ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePerPageChange(perPage)}
                        >
                            {perPage}
                        </Button>
                    ))}
                    <span className="text-sm text-muted-foreground">per page</span>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialog.open} onOpenChange={(open) => !open && handleDeleteCancel()}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Hapus Form Field</DialogTitle>
                        <DialogDescription>
                            Apakah Anda yakin ingin menghapus field <strong>"{deleteDialog.field?.label}"</strong>?
                            <br />
                            Tindakan ini tidak dapat dibatalkan dan akan mempengaruhi form pendaftaran.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button 
                            variant="outline" 
                            onClick={handleDeleteCancel}
                            disabled={deleteDialog.loading}
                        >
                            Batal
                        </Button>
                        <Button 
                            variant="destructive" 
                            onClick={handleDeleteConfirm}
                            disabled={deleteDialog.loading}
                        >
                            {deleteDialog.loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Menghapus...
                                </>
                            ) : (
                                'Hapus'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}