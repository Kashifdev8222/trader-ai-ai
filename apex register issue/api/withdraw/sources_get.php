<?php
// GET clientzone/transaction-source/get
require_once __DIR__ . '/../http_client.php';
if (session_status() === PHP_SESSION_NONE) session_start();
if (empty($_SESSION['cp_token'])) {
  cp_json(401, ['status' => 'error', 'message' => 'Not logged in.']);
}

$res = cp_call('GET', 'clientzone/transaction-source/get', null, 'session');
if (!$res['ok']) {
  cp_json(
    $res['status'],
    ['status' => 'error', 'message' => $res['data']['message'] ?? 'Failed to load withdrawal accounts', 'details' => $res['data'] ?? null]
  );
}

$data = $res['data'] ?? [];
$rows = is_array($data) ? $data : ($data['data'] ?? []);
cp_json(200, ['status' => 'success', 'data' => $rows]);
