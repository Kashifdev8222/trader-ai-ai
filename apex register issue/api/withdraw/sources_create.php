<?php
// POST clientzone/transaction-source/create
require_once __DIR__ . '/../http_client.php';
if (session_status() === PHP_SESSION_NONE) session_start();
if (empty($_SESSION['cp_token'])) {
  cp_json(401, ['status' => 'error', 'message' => 'Not logged in.']);
}

$input = json_decode(file_get_contents('php://input'), true) ?: [];
$type = $input['type'] ?? 'Withdrawal';
$value = $input['value'] ?? null;
$source = $input['source'] ?? 'Crypto';
$extraData = $input['extraData'] ?? null;

if ($value === null || $value === '' || !is_array($extraData)) {
  cp_json(400, ['status' => 'error', 'message' => 'Missing value or extraData.']);
}

$body = [
  'type' => $type,
  'value' => $value,
  'source' => $source,
  'extraData' => $extraData,
];

$res = cp_call('POST', 'clientzone/transaction-source/create', $body, 'session');
if (!$res['ok']) {
  $msg = $res['data']['message'] ?? 'Failed to create withdrawal account';
  cp_json($res['status'], ['status' => 'error', 'message' => $msg, 'details' => $res['data'] ?? null]);
}

cp_json(200, ['status' => 'success', 'data' => $res['data']]);
