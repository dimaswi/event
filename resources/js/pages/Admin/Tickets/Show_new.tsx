import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Edit, Users, Calendar, DollarSign, Package, Image as ImageIcon, Ticket as TicketIcon } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface Customer {
    id: number;
    name: string;
    email: string;
    phone: string;
    nik?: string;
    date_of_birth?: string;
    address?: string;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
}

interface Order {
    id: number;
    order_number: string;
    quantity: number;
    total_price: number;
    status: string;
    created_at: string;
    customer: Customer;
}

interface Ticket {
    id: number;
    name: string;
    description?: string;
    price: number;
    stock: number;
    sale_start_date?: string;
    sale_end_date?: string;
    is_active: boolean;
    image?: string;
    orders: Order[];
    created_at: string;
    updated_at: string;
}

interface Props {
    ticket: Ticket;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: <TicketIcon className="h-4 w-4 mr-2" />,
        href: '/admin/tickets',
    },
    {
        title: 'Detail Ticket',
        href: '#',
    },
];

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount);
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
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

    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: 'secondary' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
};

export default function Show({ ticket }: Props) {
    const soldTickets = ticket.orders.reduce((total, order) => {
        if (order.status === 'paid') {
            return total + order.quantity;
        }
        return total;
    }, 0);

    const remainingStock = ticket.stock - soldTickets;
    const totalRevenue = ticket.orders.reduce((total, order) => {
        if (order.status === 'paid') {
            return total + order.total_price;
        }
        return total;
    }, 0);

    const pendingOrders = ticket.orders.filter(order => order.status === 'awaiting_payment' || order.status === 'pending').length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Ticket ${ticket.name}`} />
            <div className="p-4">
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <TicketIcon className="h-5 w-5 text-blue-600" />
                        <h1 className="text-xl font-semibold">Ticket Details: {ticket.name}</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button 
                            variant="outline" 
                            onClick={() => router.visit(`/admin/tickets/${ticket.id}/edit`)}
                            className="flex items-center gap-2"
                        >
                            <Edit className="h-4 w-4" />
                            Edit Ticket
                        </Button>
                        <Button 
                            variant="outline" 
                            onClick={() => router.visit('/admin/tickets')}
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Tickets
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Ticket Information */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Ticket Information</CardTitle>
                                <CardDescription>
                                    Basic ticket details and configuration
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-muted-foreground">Ticket Name</p>
                                        <p className="font-medium text-lg">{ticket.name}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-muted-foreground">Price</p>
                                        <p className="font-bold text-xl text-green-600">{formatCurrency(ticket.price)}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-muted-foreground">Status</p>
                                        <Badge variant={ticket.is_active ? 'default' : 'secondary'}>
                                            {ticket.is_active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-muted-foreground">Created Date</p>
                                        <p className="font-medium">{formatDate(ticket.created_at)}</p>
                                    </div>
                                </div>
                                
                                {ticket.description && (
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-muted-foreground">Description</p>
                                        <p className="text-sm bg-gray-50 p-3 rounded">{ticket.description}</p>
                                    </div>
                                )}

                                {(ticket.sale_start_date || ticket.sale_end_date) && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {ticket.sale_start_date && (
                                            <div className="space-y-2">
                                                <p className="text-sm font-medium text-muted-foreground">Sale Start Date</p>
                                                <p className="font-medium">{formatDate(ticket.sale_start_date)}</p>
                                            </div>
                                        )}
                                        {ticket.sale_end_date && (
                                            <div className="space-y-2">
                                                <p className="text-sm font-medium text-muted-foreground">Sale End Date</p>
                                                <p className="font-medium">{formatDate(ticket.sale_end_date)}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Ticket Image */}
                        {ticket.image && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <ImageIcon className="h-5 w-5" />
                                        Ticket Image
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex justify-center">
                                        <img
                                            src={`/storage/${ticket.image}`}
                                            alt={ticket.name}
                                            className="max-w-full h-auto rounded-lg shadow-md"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Orders Table */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    Order History
                                </CardTitle>
                                <CardDescription>
                                    List of all orders for this ticket
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {ticket.orders.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Order Number</TableHead>
                                                    <TableHead>Customer</TableHead>
                                                    <TableHead>Quantity</TableHead>
                                                    <TableHead>Total</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead>Date</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {ticket.orders.map((order) => (
                                                    <TableRow key={order.id}>
                                                        <TableCell className="font-mono text-sm">
                                                            {order.order_number}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div>
                                                                <p className="font-medium">{order.customer.name}</p>
                                                                <p className="text-sm text-muted-foreground">{order.customer.email}</p>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            {order.quantity}
                                                        </TableCell>
                                                        <TableCell className="font-mono">
                                                            {formatCurrency(order.total_price)}
                                                        </TableCell>
                                                        <TableCell>
                                                            {getStatusBadge(order.status)}
                                                        </TableCell>
                                                        <TableCell className="text-sm">
                                                            {formatDate(order.created_at)}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                        <p>No orders found for this ticket</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Sales Statistics */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <DollarSign className="h-5 w-5" />
                                    Sales Statistics
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-muted-foreground">Total Stock</p>
                                    <p className="text-2xl font-bold text-blue-600">{ticket.stock}</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-muted-foreground">Sold Tickets</p>
                                    <p className="text-2xl font-bold text-green-600">{soldTickets}</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-muted-foreground">Remaining Stock</p>
                                    <p className="text-2xl font-bold text-orange-600">{remainingStock}</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-muted-foreground">Pending Orders</p>
                                    <p className="text-2xl font-bold text-yellow-600">{pendingOrders}</p>
                                </div>
                                <div className="pt-4 border-t">
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                                        <p className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button 
                                    variant="outline" 
                                    className="w-full justify-start" 
                                    onClick={() => router.visit(`/admin/tickets/${ticket.id}/edit`)}
                                >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit Ticket
                                </Button>
                                <Button 
                                    variant="outline" 
                                    className="w-full justify-start"
                                    onClick={() => router.visit('/admin/tickets/create')}
                                >
                                    <Package className="mr-2 h-4 w-4" />
                                    Create New Ticket
                                </Button>
                                <Button 
                                    variant="outline" 
                                    className="w-full justify-start"
                                    onClick={() => router.visit('/admin/orders?ticket_id=' + ticket.id)}
                                >
                                    <Users className="mr-2 h-4 w-4" />
                                    View All Orders
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
