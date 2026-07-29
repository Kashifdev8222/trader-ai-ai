<?php
/**
 * Returns unread count + notification items for the dashboard bell.
 * Replace the stub body with DB/API integration when available.
 */
session_start();
header('Content-Type: application/json; charset=utf-8');

if (empty($_SESSION['cp_token']) || empty($_SESSION['cp_user'])) {
  http_response_code(401);
  echo json_encode(['ok' => false, 'message' => 'Unauthorized']);
  exit;
}

echo json_encode([
  'ok' => true,
  'unread' => 0,
  'items' => [],
]);
