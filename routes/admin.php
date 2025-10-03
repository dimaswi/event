<?php

use App\Http\Controllers\Admin\EventSettingController;
use App\Http\Controllers\Admin\TicketController as AdminTicketController;
use App\Http\Controllers\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Admin\FormFieldController;
use Illuminate\Support\Facades\Route;

Route::prefix('admin')->name('admin.')->middleware(['auth', 'verified'])->group(function () {
    
    // Dashboard Admin
    Route::get('/', function () {
        return redirect()->route('admin.event-settings.index');
    })->name('dashboard');

    // Event Settings Management
    Route::resource('event-settings', EventSettingController::class);
    Route::post('event-settings/bulk-update', [EventSettingController::class, 'bulkUpdate'])
        ->name('event-settings.bulk-update');
    
    // Admin Ticket Management
    Route::prefix('tickets')->name('tickets.')->group(function () {
        Route::get('/', [AdminTicketController::class, 'index'])->name('index')->middleware('permission:ticket.view');
        Route::get('/create', [AdminTicketController::class, 'create'])->name('create')->middleware('permission:ticket.create');
        Route::post('/', [AdminTicketController::class, 'store'])->name('store')->middleware('permission:ticket.create');
        Route::get('/{ticket}', [AdminTicketController::class, 'show'])->name('show')->middleware('permission:ticket.view');
        Route::get('/{ticket}/edit', [AdminTicketController::class, 'edit'])->name('edit')->middleware('permission:ticket.edit');
        Route::put('/{ticket}', [AdminTicketController::class, 'update'])->name('update')->middleware('permission:ticket.edit');
        Route::delete('/{ticket}', [AdminTicketController::class, 'destroy'])->name('destroy')->middleware('permission:ticket.delete');
    });

    // Admin Order Management
    Route::prefix('orders')->name('orders.')->group(function () {
        Route::get('/', [AdminOrderController::class, 'index'])->name('index')->middleware('permission:order.view');
        Route::get('/{order}', [AdminOrderController::class, 'show'])->name('show')->middleware('permission:order.view');
        Route::delete('/{order}', [AdminOrderController::class, 'destroy'])->name('destroy')->middleware('permission:order.delete');
        Route::put('/{order}/status', [AdminOrderController::class, 'updateStatus'])->name('update-status')->middleware('permission:order.edit');
        Route::post('/{order}/resend-email', [AdminOrderController::class, 'resendTicketEmail'])->name('resend-email')->middleware('permission:order.edit');
        Route::get('/{order}/ticket/download', [AdminOrderController::class, 'downloadTicket'])->name('download-ticket')->middleware('permission:order.view');
        Route::post('/{order}/race-pack/collected', [AdminOrderController::class, 'markRacePackCollected'])->name('race-pack-collected')->middleware('permission:order.edit');
        Route::post('/{order}/race-pack/uncollected', [AdminOrderController::class, 'markRacePackUncollected'])->name('race-pack-uncollected')->middleware('permission:order.edit');
        Route::post('/{order}/race-pack/toggle', [AdminOrderController::class, 'toggleRacePack'])->name('race-pack-toggle')->middleware('permission:order.edit');
        Route::get('/export/csv', [AdminOrderController::class, 'export'])->name('export')->middleware('permission:order.view');
    });

    // Form Fields Management
    Route::resource('form-fields', FormFieldController::class);
    Route::post('form-fields/reorder', [FormFieldController::class, 'reorder'])->name('form-fields.reorder');
    
});
