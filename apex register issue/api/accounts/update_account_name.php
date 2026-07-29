<?php
// api/accounts/update_account_name.php
require_once __DIR__ . '/../http_client.php';
if (session_status() === PHP_SESSION_NONE) session_start();

if (empty($_SESSION['cp_token'])) {
  cp_json(401, ['status' => 'error', 'message' => 'Not logged in']);
}

$input     = json_decode(file_get_contents("php://input"), true);
$accountId = $input['accountId'] ?? null;
$name      = trim($input['name'] ?? '');

if (!$accountId || $name === '') {
  cp_json(400, ['status'=>'error', 'message'=>'Missing accountId or name']);
}

// Correct API path
$path = "clientzone/lead/accounts/{$accountId}/name?name=" . urlencode($name);

// Use PATCH - no body needed for this API
$res = cp_call("PATCH", $path, null, "session");

if (!$res['ok']) {
  cp_json($res['status'], [
    'status'  => 'error',
    'message' => $res['data']['message'] ?? 'Failed to update account name',
    'details' => $res['data'] ?? null
  ]);
}

cp_json(200, [
  'status' => 'success',
  'message' => 'Account name updated successfully',
  'data' => $res['data'] ?? null
]);
