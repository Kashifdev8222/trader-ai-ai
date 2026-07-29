<?php
require_once __DIR__ . '/../http_client.php';
if (session_status() === PHP_SESSION_NONE) session_start();

if (empty($_SESSION['cp_token'])) { cp_json(401, ['status'=>'error','message'=>'Not logged in.']); }

$userId = $_GET['userId'] ?? ($_SESSION['cp_user']['userId'] ?? null);
if (!$userId) cp_json(400, ['status'=>'error','message'=>'Missing userId (and no session user set).']);

$path = 'clientzone/lead/accounts?userId=' . urlencode($userId);
$res  = cp_call('GET', $path, null, 'session');

if (!$res['ok']) {
  cp_json($res['status'], ['status'=>'error','message'=>$res['data']['message'] ?? 'Failed to fetch accounts','details'=>$res['data'] ?? null]);
}
cp_json(200, ['status'=>'success','data'=>$res['data']]);
