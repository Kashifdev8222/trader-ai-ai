<?php
require_once __DIR__ . '/../http_client.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  cp_json(405, ['status' => 'error', 'message' => 'Method not allowed']);
}

$input = json_decode(file_get_contents('php://input'), true) ?: [];
$email = trim($input['email'] ?? '');
if (!$email) { cp_json(400, ['status' => 'error', 'message' => 'Email is required.']); }

/* Pre-auth: NO Authorization header */
$res = cp_call('POST', 'clientzone/auth/forgotpass', ['email' => $email], 'none');

if (!$res['ok']) {
  cp_json($res['status'], [
    'status'  => 'error',
    'message' => $res['data']['message'] ?? 'Failed to send reset email.',
    'details' => $res['data'] ?? null
  ]);
}

cp_json(200, ['status' => 'success', 'data' => $res['data']]);
