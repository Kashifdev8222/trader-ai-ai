<?php
require_once __DIR__ . '/../http_client.php';
if (session_status() === PHP_SESSION_NONE) session_start();

if (empty($_SESSION['cp_token'])) {
  cp_json(401, ['status'=>'error','message'=>'Not logged in.']);
}

$path = 'clientzone/lead/account/transaction/crypto-pay/supported-coins';
$res  = cp_call('GET', $path, null, 'session');

if (!$res['ok']) {
  cp_json($res['status'], ['status'=>'error','message'=>$res['data']['message'] ?? 'Failed to fetch supported coins','details'=>$res['data'] ?? null]);
}
cp_json(200, ['status'=>'success','data'=>$res['data']['data'] ?? $res['data']]);
