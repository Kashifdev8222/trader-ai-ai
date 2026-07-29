<?php
/**
 * Create a withdrawal request.
 * The backend exposes POST on the transactions collection (GET uses the same path).
 * POST /transaction/withdraw returns 404 — use POST clientzone/lead/account/transactions
 */
require_once __DIR__ . '/../http_client.php';
if (session_status() === PHP_SESSION_NONE) session_start();
if (empty($_SESSION['cp_token'])) {
  cp_json(401, ['status' => 'error', 'message' => 'Not logged in.']);
}

$input = json_decode(file_get_contents('php://input'), true) ?: [];
$accountId = $input['accountId'] ?? null;
$amount = $input['amount'] ?? null;
$currency = $input['currency'] ?? 'USD';
$transactionSourceId = $input['transactionSourceId'] ?? null;
$tpNumber = $input['tpNumber'] ?? null;

if (!$accountId || $amount === null || $amount === '') {
  cp_json(400, ['status' => 'error', 'message' => 'Missing accountId or amount.']);
}

$body = [
  'accountId' => $accountId,
  'amount' => is_numeric($amount) ? (string)$amount : (string)$amount,
  'currency' => $currency,
  'type' => 'Withdraw',
  'comment' => $input['comment'] ?? 'Withdraw Performed',
];
if (!empty($transactionSourceId)) {
  $body['transactionSourceId'] = $transactionSourceId;
}
if ($tpNumber !== null && $tpNumber !== '') {
  $body['tpNumber'] = (string)$tpNumber;
}

$path = 'clientzone/lead/account/transactions';
$res = cp_call('POST', $path, $body, 'session');

if (!$res['ok']) {
  $d = $res['data'] ?? [];
  $msg = $d['message'] ?? ($d['error'] ?? 'Withdraw request failed');
  if (is_array($msg)) {
    $msg = json_encode($msg);
  }
  cp_json($res['status'], ['status' => 'error', 'message' => (string)$msg, 'details' => $d]);
}

cp_json(200, ['status' => 'success', 'data' => $res['data']]);
