<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Ticket;
use App\Models\Customer;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        // Debug: pastikan controller dipanggil
        error_log('Dashboard controller dipanggil');
        
        // Statistik Tiket
        $totalTickets = Ticket::count();
        $ticketsLastMonth = Ticket::where('created_at', '>=', Carbon::now()->subMonth())->count();
        
        error_log('Total tickets: ' . $totalTickets);
        
        // Statistik Orders
        $totalOrders = Order::count();
        $ordersLastWeek = Order::where('created_at', '>=', Carbon::now()->subWeek())->count();
        $ordersThisWeek = Order::where('created_at', '>=', Carbon::now()->startOfWeek())->count();
        $orderGrowthPercentage = $ordersLastWeek > 0 ? round((($ordersThisWeek - $ordersLastWeek) / $ordersLastWeek) * 100) : 0;
        
        error_log('Total orders: ' . $totalOrders);
        
        // Statistik Penjualan
        $totalSales = Order::where('status', 'paid')->sum('total_price') ?? 0;
        $salesLastMonth = Order::where('status', 'paid')
            ->where('created_at', '>=', Carbon::now()->subMonth())
            ->sum('total_price') ?? 0;
        $salesThisMonth = Order::where('status', 'paid')
            ->where('created_at', '>=', Carbon::now()->startOfMonth())
            ->sum('total_price') ?? 0;
        $salesGrowthPercentage = $salesLastMonth > 0 ? round((($salesThisMonth - $salesLastMonth) / $salesLastMonth) * 100) : 0;
        
        // Pending Payments (awaiting_payment + pending)
        $pendingPayments = Order::whereIn('status', ['awaiting_payment', 'pending'])->count();
        
        // Status breakdown
        $awaitingPayments = Order::where('status', 'awaiting_payment')->count();
        $paidOrders = Order::where('status', 'paid')->count();
        $cancelledOrders = Order::where('status', 'cancelled')->count();
        $expiredOrders = Order::where('status', 'expired')->count();
        
        // Total Customers
        $totalCustomers = Customer::count();
        
        // Target calculation
        $targetOrders = 200;
        $targetAchievement = $totalOrders > 0 ? round(($totalOrders / $targetOrders) * 100) : 0;
        
        $stats = [
            'total_tickets' => $totalTickets,
            'tickets_growth' => $ticketsLastMonth,
            'total_orders' => $totalOrders,
            'orders_growth' => $orderGrowthPercentage,
            'total_sales' => $totalSales,
            'sales_growth' => $salesGrowthPercentage,
            'pending_payments' => $pendingPayments,
            'total_customers' => $totalCustomers,
            'target_achievement' => $targetAchievement,
            'awaiting_payments' => $awaitingPayments,
            'paid_orders' => $paidOrders,
            'cancelled_orders' => $cancelledOrders,
            'expired_orders' => $expiredOrders,
        ];
        
        error_log('Stats data: ' . json_encode($stats));
        
        return Inertia::render('dashboard', [
            'stats' => $stats
        ]);
    }
}