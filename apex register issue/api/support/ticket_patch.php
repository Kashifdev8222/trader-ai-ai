<?php
/**
 * PATCH ?id= — update ticket (e.g. status: Closed).
 */
require_once __DIR__ . '/../http_client.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if (empty($_SESSION['cp_token'])) {
    cp_json(401, ['status' => 'error', 'message' => 'Not logged in.']);
}

if ($_SERVER['REQUEST_METHOD'] !== 'PATCH' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
    cp_json(405, ['status' => 'error', 'message' => 'Method not allowed']);
}

$id = trim($_GET['id'] ?? $_GET['ticketId'] ?? $_GET['userTicketId'] ?? '');
if ($id === '') {
    cp_json(400, ['status' => 'error', 'message' => 'id is required.']);
}

$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) {
    $input = [];
}

$res = cp_call('PATCH', 'clientzone/lead/ticket/' . rawurlencode($id), $input, 'session');

if (!$res['ok']) {
    $msg = $res['data']['message'] ?? 'Failed to update ticket';
    $code = $res['status'] >= 400 && $res['status'] < 600 ? $res['status'] : 502;
    cp_json($code, ['status' => 'error', 'message' => $msg, 'details' => $res['data'] ?? null]);
}

cp_json(200, ['status' => 'success', 'data' => $res['data']]);
