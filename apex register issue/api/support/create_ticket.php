<?php
// api/support/create_ticket.php
require_once __DIR__ . '/../http_client.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  cp_json(405, ['status' => 'error', 'message' => 'Method not allowed']);
}

$input = json_decode(file_get_contents('php://input'), true) ?: [];
$text  = trim($input['text'] ?? '');

if ($text === '') {
  cp_json(400, ['status' => 'error', 'message' => 'text is required.']);
}

if (session_status() === PHP_SESSION_NONE) {
  session_start();
}

$cpUser = $_SESSION['cp_user'] ?? null;
$userId = $cpUser['userId'] ?? null;

if (!$userId) {
  cp_json(401, ['status' => 'error', 'message' => 'Not logged in']);
}

/**
 * Final clean payload (same as working cURL)
 */
$payload = [
  'category'      => 'Withdrawal',
  'departmentId'  => '01cbe2c0-0e16-45e7-8f2b-e7e4e2836aaf',
  'title'         => 'Tesst',
  'userId'        => $userId,
  'userTicketComments' => [
    [
      'text'   => $text,
      'userId' => $userId
    ]
  ],
];

$res = cp_call(
  'POST',
  'clientzone/lead/ticket',
  $payload,
  'session'
);

if (!$res['ok']) {
  cp_json(
    $res['status'],
    [
      'status'  => 'error',
      'message' => $res['data']['message'] ?? 'Failed to create ticket'
    ]
  );
}

cp_json(200, ['status' => 'success', 'data' => $res['data']]);
