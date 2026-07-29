<?php
// api/payments/get_payment_methods_config.php
require_once __DIR__ . '/../http_client.php';
if (session_status() === PHP_SESSION_NONE) session_start();

if (empty($_SESSION['cp_token'])) {
  cp_json(401, ['status'=>'error','message'=>'Not logged in.']);
}

$path = 'clientzone/payment-methods/config';
$res  = cp_call('GET', $path, null, 'session');
if (!$res['ok']) {
  cp_json($res['status'], [
    'status'=>'error',
    'message'=>$res['data']['message'] ?? 'Failed to fetch payment methods config',
    'details'=>$res['data'] ?? null
  ]);
}
cp_json(200, ['status'=>'success','data'=>$res['data']]);
