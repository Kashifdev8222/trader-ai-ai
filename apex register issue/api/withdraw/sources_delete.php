<?php
// POST { "id": "..." } → DELETE clientzone/transaction-source/delete/{id}
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
if ($id === '') {
  cp_json(400, ['status' => 'error', 'message' => 'Missing id.']);
}

$path = 'clientzone/transaction-source/delete/' . rawurlencode($id);
$res = cp_call('DELETE', $path, null, 'session');

if (!$res['ok']) {
  $msg = $res['data']['message'] ?? 'Failed to delete withdrawal account';
  cp_json($res['status'], ['status' => 'error', 'message' => $msg, 'details' => $res['data'] ?? null]);
}

cp_json(200, ['status' => 'success', 'data' => $res['data']]);
