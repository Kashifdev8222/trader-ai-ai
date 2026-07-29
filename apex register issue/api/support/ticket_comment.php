<?php
/**
 * POST — add comment to ticket. userId from session.
 */
require_once __DIR__ . '/../http_client.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if (empty($_SESSION['cp_token']) || empty($_SESSION['cp_user']['userId'] ?? null)) {
    cp_json(401, ['status' => 'error', 'message' => 'Not logged in.']);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    cp_json(405, ['status' => 'error', 'message' => 'Method not allowed']);
}

$input = json_decode(file_get_contents('php://input'), true) ?: [];
$text = trim($input['text'] ?? '');
$ticketId = trim($input['userTicketId'] ?? '');

if ($text === '' || $ticketId === '') {
    cp_json(400, ['status' => 'error', 'message' => 'text and userTicketId are required.']);
}

$payload = [
    'text' => $text,
    'userId' => $_SESSION['cp_user']['userId'],
    'userTicketId' => $ticketId,
];

$res = cp_call('POST', 'clientzone/lead/ticket-comment', $payload, 'session');

if (!$res['ok']) {
    $msg = $res['data']['message'] ?? 'Failed to send comment';
    $code = $res['status'] >= 400 && $res['status'] < 600 ? $res['status'] : 502;
    cp_json($code, ['status' => 'error', 'message' => $msg, 'details' => $res['data'] ?? null]);
}

cp_json(200, ['status' => 'success', 'data' => $res['data']]);
