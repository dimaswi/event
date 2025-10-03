<?php

use App\Http\Controllers\Public\TicketController as PublicTicketController;
use App\Http\Controllers\Public\NewTicketController;
use Illuminate\Support\Facades\Route;

// API routes for AJAX calls (outside tickets prefix)
Route::prefix('api')->group(function () {
    Route::prefix('orders')->group(function () {
        Route::post('{orderNumber}/mark-paid', [PublicTicketController::class, 'markOrderPaid'])->name('api.orders.mark-paid');
    });
    
    Route::prefix('tickets')->group(function () {
        Route::post('payment/{orderNumber}', [PublicTicketController::class, 'generatePaymentToken'])->name('api.tickets.payment');
        // New dynamic form API
        Route::post('{ticket}/purchase', [NewTicketController::class, 'purchase'])->name('api.tickets.purchase');
    });
});

// New Dynamic Form Routes (main routes)
Route::get('/', [NewTicketController::class, 'index'])->name('new.tickets.index');
Route::get('/order', [NewTicketController::class, 'order'])->name('new.tickets.order');
Route::get('/check', [NewTicketController::class, 'showCheckOrder'])->name('new.tickets.check');
Route::post('/check', [NewTicketController::class, 'checkOrder'])->name('new.tickets.check.submit');
Route::post('tickets/{ticket}/purchase', [NewTicketController::class, 'purchase'])->name('new.tickets.purchase');
Route::get('/tickets/success/{orderNumber}', [NewTicketController::class, 'showSuccess'])->name('tickets.success');
Route::get('/tickets/download/{orderNumber}', [NewTicketController::class, 'downloadTicket'])->name('tickets.download');
Route::get('/tickets/payment/{orderNumber}', [NewTicketController::class, 'showPayment'])->name('tickets.payment');

// Public Routes (no authentication required)
Route::prefix('tickets')->name('public.')->group(function () {
    Route::get('/', [PublicTicketController::class, 'index'])->name('tickets.index');
    Route::get('/order', [PublicTicketController::class, 'order'])->name('tickets.order');
    Route::get('/{ticket}', [PublicTicketController::class, 'show'])->name('tickets.show');
    Route::post('/{ticket}/purchase', [PublicTicketController::class, 'purchase'])->name('tickets.purchase');
    
    // Order routes
    Route::prefix('orders')->name('orders.')->group(function () {
        Route::get('/check', [PublicTicketController::class, 'showCheckOrder'])->name('check.form');
        Route::post('/check', [PublicTicketController::class, 'checkOrder'])->name('check');
        Route::get('/download/{orderNumber}', [PublicTicketController::class, 'downloadTicket'])->name('download');
    });

    // Payment routes
    Route::prefix('payment')->name('payment.')->group(function () {
        Route::get('/process/{order}', [PublicTicketController::class, 'showPayment'])->name('process');
        Route::post('/notification', [PublicTicketController::class, 'handleNotification'])->name('notification');
        Route::get('/finish', [PublicTicketController::class, 'paymentFinish'])->name('finish');
        Route::get('/unfinish', [PublicTicketController::class, 'paymentUnfinish'])->name('unfinish');
        Route::get('/error', [PublicTicketController::class, 'paymentError'])->name('error');
        Route::post('/check-status/{orderNumber}', [PublicTicketController::class, 'checkPaymentStatus'])->name('check-status');
    });
});
