import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Plus, Pencil, Trash2, Search, Eye, X, Loader2 } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, SharedData } from '@/types';
import { toast } from "sonner";
import { route } from "ziggy-js";

interface Ticket {
    id: number;
    name: string;
    description?: string;
    price: number;
    stock: number;
    sold: number;
    sale_start_date?: string;
    sale_end_date?: string;
    is_active: boolean;
    image?: string;
    orders_count: number;
    created_at: string;
}

interface PaginatedTickets {
    data: Ticket[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

interface Props extends SharedData {
    tickets: PaginatedTickets;
    filters: {
        search: string;
        perPage: number;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Tickets',
        href: '/admin/tickets',
    },
];

export default function Tickets() {
    const { tickets, filters: initialFilters } = usePage<Props>().props;
    const [search, setSearch] = useState(initialFilters.search);
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        ticket: Ticket | null;
        loading: boolean;
    }>({
        open: false,
        ticket: null,
        loading: false,
    });
    
    const handleSearch = (value: string) => {
        router.get('/admin/tickets', {
            search: value,
            perPage: initialFilters.perPage,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handlePerPageChange = (perPage: number) => {
        router.get('/admin/tickets', {
            search: initialFilters.search,
            perPage,
            page: 1,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handlePageChange = (page: number) => {
        router.get('/admin/tickets', {
            search: initialFilters.search,
            perPage: initialFilters.perPage,
            page,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSearch(search);
    };

    const handleClearSearch = () => {
        setSearch('');
        handleSearch('');
    };

    const handleDeleteClick = (ticket: Ticket) => {
        setDeleteDialog({
            open: true,
            ticket: ticket,
            loading: false,
        });
    };

    const handleDeleteConfirm = async () => {
        if (!deleteDialog.ticket) return;
        
        // Set loading state
        setDeleteDialog(prev => ({ ...prev, loading: true }));
        
        try {
            await router.delete(route('admin.tickets.destroy', deleteDialog.ticket.id), {
                onSuccess: () => {
                    toast.success(`Ticket ${deleteDialog.ticket?.name} berhasil dihapus`);
                    setDeleteDialog({ open: false, ticket: null, loading: false });
                },
                onError: () => {
                    toast.error('Gagal menghapus ticket');
                    setDeleteDialog(prev => ({ ...prev, loading: false }));
                }
            });
        } catch (error) {
            toast.error('Terjadi kesalahan saat menghapus ticket');
            setDeleteDialog(prev => ({ ...prev, loading: false }));
        }
    };

    const handleDeleteCancel = () => {
        setDeleteDialog({ open: false, ticket: null, loading: false });
    };

    const formatRupiah = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const getStockStatus = (ticket: Ticket) => {
        const remaining = ticket.stock - ticket.sold;
        const percentage = (remaining / ticket.stock) * 100;
        
        if (percentage <= 0) return { label: 'Habis', variant: 'destructive' as const };
        if (percentage <= 20) return { label: 'Hampir Habis', variant: 'destructive' as const };
        if (percentage <= 50) return { label: 'Terbatas', variant: 'secondary' as const };
        return { label: 'Tersedia', variant: 'default' as const };
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tickets" />
            <div className="p-4">
                <div className="mb-4 flex items-center justify-between">
                    <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Cari nama tiket..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10 pr-10 w-64"
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={handleClearSearch}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                        <Button type="submit" variant="outline" size="sm">
                            Cari
                        </Button>
                    </form>
                    
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex items-center gap-2 hover:bg-green-200"
                        onClick={() => router.visit('/admin/tickets/create')}
                    >
                        <Plus className="h-4 w-4 text-green-500" />
                        Tambah
                    </Button>
                </div>
                
                <div className="w-full overflow-x-auto rounded-md border">
                    <Table>
                        <TableHeader className="bg-gray-100">
                            <TableRow>
                                <TableHead className="w-[50px]">No.</TableHead>
                                <TableHead>Nama Tiket</TableHead>
                                <TableHead>Harga</TableHead>
                                <TableHead>Stok</TableHead>
                                <TableHead>Terjual</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tickets.data.length > 0 ? (
                                tickets.data.map((ticket: Ticket, index: number) => {
                                    const stockStatus = getStockStatus(ticket);
                                    const remaining = ticket.stock - ticket.sold;
                                    
                                    return (
                                        <TableRow key={ticket.id}>
                                            <TableCell>
                                                {(tickets.current_page - 1) * tickets.per_page + index + 1}
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{ticket.name}</div>
                                                    {ticket.description && (
                                                        <div className="text-sm text-muted-foreground">
                                                            {ticket.description.length > 50
                                                                ? `${ticket.description.substring(0, 50)}...`
                                                                : ticket.description
                                                            }
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-mono">
                                                {formatRupiah(ticket.price)}
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-center">
                                                    <div className="font-medium">{ticket.stock}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        Sisa: {remaining}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant={stockStatus.variant} className="text-xs">
                                                    {ticket.sold}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={ticket.is_active ? 'default' : 'secondary'}>
                                                    {ticket.is_active ? 'Aktif' : 'Nonaktif'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="flex justify-end space-x-2">
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    className="hover:bg-gray-200"
                                                    onClick={() => router.visit(route('admin.tickets.show', ticket.id))}
                                                >
                                                    <Eye className="h-4 w-4 text-blue-500" />
                                                    Lihat
                                                </Button>
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    className="hover:bg-gray-200"
                                                    onClick={() => router.visit(route('admin.tickets.edit', ticket.id))}
                                                >
                                                    <Pencil className="h-4 w-4 text-yellow-500" />
                                                    Edit
                                                </Button>
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    className="hover:bg-gray-200"
                                                    onClick={() => handleDeleteClick(ticket)}
                                                    disabled={ticket.orders_count > 0}
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                    Hapus
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                        <div className="flex flex-col items-center gap-2">
                                            <Search className="h-8 w-8 text-muted-foreground/50" />
                                            <span>Tidak ada data ticket yang ditemukan</span>
                                            {initialFilters.search && (
                                                <span className="text-sm">
                                                    Coba ubah kata kunci pencarian atau hapus filter
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between py-4">
                    <div className="text-sm text-muted-foreground">
                        Menampilkan {tickets.from} - {tickets.to} dari {tickets.total} data
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm">Baris per halaman:</span>
                            <select
                                className="rounded border px-2 py-1 text-sm"
                                value={tickets.per_page}
                                onChange={(e) => handlePerPageChange(Number(e.target.value))}
                            >
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(tickets.current_page - 1)}
                                disabled={tickets.current_page <= 1}
                            >
                                Previous
                            </Button>
                            
                            <span className="text-sm">
                                Page {tickets.current_page} of {tickets.last_page}
                            </span>
                            
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(tickets.current_page + 1)}
                                disabled={tickets.current_page >= tickets.last_page}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialog.open} onOpenChange={(open) => !open && handleDeleteCancel()}>
                <DialogContent className="sm:max-w-2xl top-1/8">
                    <DialogHeader>
                        <DialogTitle>Konfirmasi Hapus Ticket</DialogTitle>
                        <DialogDescription>
                            Apakah Anda yakin ingin menghapus ticket <strong>{deleteDialog.ticket?.name}</strong>?
                            <br />
                            <span className="text-red-600">Tindakan ini tidak dapat dibatalkan.</span>
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
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
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {deleteDialog.loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Menghapus...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Hapus Ticket
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
