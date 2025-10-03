import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, SharedData } from "@/types";
import { Head, router, usePage } from "@inertiajs/react";
import { Eye, Search, Trash, X, Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { route } from "ziggy-js";

interface Customer {
    id?: number | null;
    name?: string;
    email?: string;
    phone?: string;
    nik?: string;
}

interface Ticket {
    id: number;
    name: string;
    price: number;
}

interface Order {
    id: number;
    order_number: string;
    bib_number?: string;
    customer?: Customer;
    form_data?: Record<string, any>;
    ticket: Ticket;
    quantity: number;
    unit_price: number;
    total_price: number;
    status: 'awaiting_payment' | 'pending' | 'paid' | 'cancelled' | 'expired' | 'denied' | 'challenge';
    race_pack_collected: boolean;
    race_pack_collected_at?: string;
    race_pack_collected_by?: string;
    payment_method?: string;
    payment_reference?: string;
    paid_at?: string;
    created_at: string;
    updated_at: string;
}

interface PaginatedOrders {
    data: Order[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

interface FormField {
    id: number;
    name: string;
    label: string;
    type: string;
    required: boolean;
    options?: string;
}

interface Props extends SharedData {
    orders: PaginatedOrders;
    tickets: { id: number; name: string }[];
    formFields?: FormField[];
    filters: {
        status?: string;
        ticket_id?: string;
        search: string;
        perPage: number;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Orders',
        href: '/admin/orders',
    },
];

export default function Orders() {
    const { orders, tickets, formFields = [], filters: initialFilters } = usePage<Props>().props;
    const [search, setSearch] = useState(initialFilters.search);
    const [status, setStatus] = useState(initialFilters.status || 'all');
    const [ticketId, setTicketId] = useState(initialFilters.ticket_id || 'all');
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        order: Order | null;
        loading: boolean;
    }>({
        open: false,
        order: null,
        loading: false,
    });

    
    const handleSearch = (value: string) => {
        router.get('/admin/orders', {
            search: value,
            status: status === 'all' ? undefined : status,
            ticket_id: ticketId === 'all' ? undefined : ticketId,
            perPage: initialFilters.perPage,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleFilter = () => {
        router.get('/admin/orders', {
            search: search || undefined,
            status: status === 'all' ? undefined : status,
            ticket_id: ticketId === 'all' ? undefined : ticketId,
            perPage: initialFilters.perPage,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handlePerPageChange = (perPage: number) => {
        router.get('/admin/orders', {
            search: initialFilters.search,
            status: status === 'all' ? undefined : status,
            ticket_id: ticketId === 'all' ? undefined : ticketId,
            perPage,
            page: 1,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handlePageChange = (page: number) => {
        router.get('/admin/orders', {
            search: initialFilters.search,
            status: status === 'all' ? undefined : status,
            ticket_id: ticketId === 'all' ? undefined : ticketId,
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

    const handleDeleteClick = (order: Order) => {
        setDeleteDialog({
            open: true,
            order: order,
            loading: false,
        });
    };

    const handleDeleteConfirm = async () => {
        if (!deleteDialog.order) return;
        
        setDeleteDialog(prev => ({ ...prev, loading: true }));
        
        try {
            await router.delete(route('admin.orders.destroy', deleteDialog.order.id), {
                onSuccess: () => {
                    toast.success(`Order ${deleteDialog.order?.order_number} berhasil dihapus`);
                    setDeleteDialog({ open: false, order: null, loading: false });
                },
                onError: () => {
                    toast.error('Gagal menghapus order');
                    setDeleteDialog(prev => ({ ...prev, loading: false }));
                }
            });
        } catch (error) {
            toast.error('Terjadi kesalahan saat menghapus order');
            setDeleteDialog(prev => ({ ...prev, loading: false }));
        }
    };

    const handleDeleteCancel = () => {
        setDeleteDialog({ open: false, order: null, loading: false });
    };



    const formatRupiah = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };



    const getStatusBadge = (status: string) => {
        const statusConfig = {
            awaiting_payment: { label: 'Menunggu Pembayaran', variant: 'secondary' as const },
            pending: { label: 'Menunggu Konfirmasi', variant: 'secondary' as const },
            paid: { label: 'Lunas', variant: 'default' as const },
            cancelled: { label: 'Dibatalkan', variant: 'destructive' as const },
            expired: { label: 'Kedaluwarsa', variant: 'destructive' as const },
            denied: { label: 'Ditolak', variant: 'destructive' as const },
            challenge: { label: 'Perlu Verifikasi', variant: 'secondary' as const },
        };
        return statusConfig[status as keyof typeof statusConfig] || { label: status, variant: 'secondary' as const };
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Orders" />
            <div className="p-4">
                <div className="mb-4 flex items-center justify-between">
                    <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Cari nomor order, nama, email, atau telepon..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10 pr-10 w-80"
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
                    
                    <div className="flex items-center gap-2">
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Status Pesanan" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Status</SelectItem>
                                <SelectItem value="awaiting_payment">Menunggu Pembayaran</SelectItem>
                                <SelectItem value="pending">Menunggu Konfirmasi</SelectItem>
                                <SelectItem value="paid">Lunas</SelectItem>
                                <SelectItem value="cancelled">Dibatalkan</SelectItem>
                                <SelectItem value="expired">Kedaluwarsa</SelectItem>
                                <SelectItem value="denied">Ditolak</SelectItem>
                                <SelectItem value="challenge">Perlu Verifikasi</SelectItem>
                            </SelectContent>
                        </Select>
                        
                        <Select value={ticketId} onValueChange={setTicketId}>
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Pilih Tiket" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Tiket</SelectItem>
                                {tickets.map((ticket) => (
                                    <SelectItem key={ticket.id} value={ticket.id.toString()}>
                                        {ticket.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        
                        <Button onClick={handleFilter} variant="outline" size="sm">
                            Filter
                        </Button>
                        
                        <Button 
                            onClick={() => window.open('/admin/orders/export/csv', '_blank')}
                            variant="outline" 
                            size="sm"
                            className="flex items-center gap-2"
                        >
                            <Download className="h-4 w-4" />
                            Export CSV
                        </Button>
                    </div>
                </div>
                
                <div className="w-full overflow-x-auto rounded-md border">
                    <Table>
                        <TableHeader className="bg-gray-100">
                            <TableRow>
                                <TableHead className="w-[50px]">No.</TableHead>
                                <TableHead>Order Number</TableHead>
                                <TableHead>Ticket</TableHead>
                                <TableHead>Quantity</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Perbekalan</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.data.length > 0 ? (
                                orders.data.map((order: Order, index: number) => {
                                    const statusBadge = getStatusBadge(order.status);
                                    
                                    return (
                                        <TableRow key={order.id}>
                                            <TableCell>
                                                {(orders.current_page - 1) * orders.per_page + index + 1}
                                            </TableCell>
                                            <TableCell className="font-mono">
                                                {order.order_number}
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{order.ticket.name}</div>
                                                    <div className="text-sm text-muted-foreground">{formatRupiah(order.ticket.price)}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {order.quantity}
                                            </TableCell>
                                            <TableCell className="font-mono">
                                                {formatRupiah(order.total_price)}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={statusBadge.variant}>
                                                    {statusBadge.label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {order.status === 'paid' ? (
                                                    order.race_pack_collected ? (
                                                        <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                                                            ✓ Diambil
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                                                            Belum
                                                        </Badge>
                                                    )
                                                ) : (
                                                    <span className="text-muted-foreground text-sm">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="flex justify-end space-x-2">
                                                <button 
                                                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
                                                    onClick={() => router.visit(route('admin.orders.show', order.id))}
                                                >
                                                    <Eye className="h-4 w-4 text-blue-500 mr-1" />
                                                    Lihat
                                                </button>
                                                <button 
                                                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
                                                    onClick={() => handleDeleteClick(order)}
                                                >
                                                    <Trash className="h-4 w-4 text-red-500 mr-1" />
                                                    Hapus
                                                </button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                        <div className="flex flex-col items-center gap-2">
                                            <Search className="h-8 w-8 text-muted-foreground/50" />
                                            <span>Tidak ada data order yang ditemukan</span>
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
                        Menampilkan {orders.from} - {orders.to} dari {orders.total} data
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm">Baris per halaman:</span>
                            <select
                                className="rounded border px-2 py-1 text-sm"
                                value={orders.per_page}
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
                                onClick={() => handlePageChange(orders.current_page - 1)}
                                disabled={orders.current_page <= 1}
                            >
                                Previous
                            </Button>
                            
                            <span className="text-sm">
                                Page {orders.current_page} of {orders.last_page}
                            </span>
                            
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(orders.current_page + 1)}
                                disabled={orders.current_page >= orders.last_page}
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
                        <DialogTitle>Konfirmasi Hapus Order</DialogTitle>
                        <DialogDescription>
                            Apakah Anda yakin ingin menghapus order <strong>{deleteDialog.order?.order_number}</strong>?
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
                                    <Trash className="h-4 w-4 mr-2" />
                                    Hapus Order
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
