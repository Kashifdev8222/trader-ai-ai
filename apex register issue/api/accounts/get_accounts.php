<?php
// api/accounts/get_accounts.php
require_once __DIR__ . '/../http_client.php';

$res = cp_call('GET', 'clientzone/lead/accounts', null, 'session');

if (!$res['ok']) {
  cp_json(
    $res['status'],
    ['status' => 'error', 'message' => $res['data']['message'] ?? 'Failed to load accounts']
  );
}

cp_json(200, [
  'status' => 'success',
  'data'   => $res['data']  // this is the array you showed from Postman
]);
