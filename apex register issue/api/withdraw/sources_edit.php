<?php
// POST { id, type, value, source, extraData } → PATCH clientzone/transaction-source/edit/{id}
require_once __DIR__ . '/../http_client.php';
if (session_status() === PHP_SESSION_NONE) {
  session_start();
}
if (empty($_SESSION['cp_token'])) {
  cp_json(401, ['status' => 'error', 'message' => 'Not logged in.']);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  cp_json(405, ['status' => 'error', 'message' => 'Method not allowed']);
}

$input = json_decode(file_get_contents('php://input'), true) ?: [];
$id = trim($input['id'] ?? '');
$value = $input['value'] ?? null;
$source = $input['source'] ?? 'Crypto';
$extraData = $input['extraData'] ?? null;
$type = $input['type'] ?? 'Withdrawal';

if ($id === '') {
  cp_json(400, ['status' => 'error', 'message' => 'Missing id.']);
}
if ($value === null || $value === '' || !is_array($extraData)) {
  cp_json(400, ['status' => 'error', 'message' => 'Missing value or extraData.']);
}

$body = [
  'type' => $type,
  'value' => $value,
  'source' => $source,
  'extraData' => $extraData,
];

$path = 'clientzone/transaction-source/edit/' . rawurlencode($id);
$res = cp_call('PATCH', $path, $body, 'session');

if (!$res['ok']) {
  $msg = $res['data']['message'] ?? 'Failed to update withdrawal account';
  cp_json($res['status'], ['status' => 'error', 'message' => $msg, 'details' => $res['data'] ?? null]);
}

cp_json(200, ['status' => 'success', 'data' => $res['data']]);
