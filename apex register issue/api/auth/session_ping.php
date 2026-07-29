<?php
// Lightweight keepalive: do not call upstream here (prevents false 401 -> forced logout).
require_once __DIR__ . '/../http_client.php';
if (session_status() === PHP_SESSION_NONE) {
  session_start();
}

if (empty($_SESSION['cp_token']) || empty($_SESSION['cp_user'])) {
  cp_json(401, ['status' => 'error', 'message' => 'Not logged in']);
}

cp_json(200, [
  'status' => 'success',
  'data' => [
    'alive' => true,
    'userId' => $_SESSION['cp_user']['userId'] ?? null,
    'email' => $_SESSION['cp_user']['email'] ?? null,
  ],
]);
