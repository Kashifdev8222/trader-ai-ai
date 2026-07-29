<?php
/**
 * DELETE ?id= — cancel meeting.
 * Many backends expose cancel as PATCH { status: "canceled" } (raw DELETE returns 404).
 */
require_once __DIR__ . '/../http_client.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if (empty($_SESSION['cp_token'])) {
    cp_json(401, ['status' => 'error', 'message' => 'Not logged in.']);
}

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    cp_json(405, ['status' => 'error', 'message' => 'Method not allowed']);
}

$id = trim($_GET['id'] ?? '');
if ($id === '') {
    cp_json(400, ['status' => 'error', 'message' => 'id is required.']);
}

$path = 'clientzone/call-meeting-appointment/' . rawurlencode($id);
$payload = ['status' => 'canceled'];

$res = cp_call('PATCH', $path, $payload, 'session');

if (!$res['ok'] && ($res['status'] ?? 0) === 404) {
    $res = cp_call('PATCH', $path, ['status' => 'cancelled'], 'session');
}

if (!$res['ok']) {
    $msg = $res['data']['message'] ?? 'Failed to cancel meeting';
    $code = $res['status'] >= 400 && $res['status'] < 600 ? $res['status'] : 502;
    cp_json($code, ['status' => 'error', 'message' => $msg, 'details' => $res['data'] ?? null]);
}

cp_json(200, ['status' => 'success', 'data' => $res['data']]);
