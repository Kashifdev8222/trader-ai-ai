<?php
// api/accounts/get_transactions.php
require_once __DIR__ . '/../http_client.php';

$res = cp_call('GET', 'clientzone/lead/account/transactions', null, 'session');

if (!$res['ok']) {
  cp_json(
    $res['status'],
    ['status' => 'error', 'message' => $res['data']['message'] ?? 'Failed to load transactions']
  );
}

cp_json(200, [
  'status' => 'success',
  'data'   => $res['data']  // array of transactions
]);
