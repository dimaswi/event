<?php

return [
    'server_key' => env('MIDTRANS_SERVER_KEY', 'Mid-server-JocLUJR7Ap7WtqmoExDJiQ4a'),
    'client_key' => env('MIDTRANS_CLIENT_KEY', 'Mid-client-71FrsK80eaLdEzWO'),
    'is_production' => env('MIDTRANS_IS_PRODUCTION', false),
    'is_sanitized' => env('MIDTRANS_IS_SANITIZED', true),
    'is_3ds' => env('MIDTRANS_IS_3DS', true),
];
