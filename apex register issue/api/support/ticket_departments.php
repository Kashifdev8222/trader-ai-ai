<?php
/**
 * GET — list ticket departments for dropdown (clientzone/lead/ticket/department).
 */
require_once __DIR__ . '/../http_client.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if (empty($_SESSION['cp_token'])) {
    cp_json(401, ['status' => 'error', 'message' => 'Not logged in.']);
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    cp_json(405, ['status' => 'error', 'message' => 'Method not allowed']);
}

$res = cp_call('GET', 'clientzone/lead/ticket/department', null, 'session');

if (!$res['ok']) {
    $msg = $res['data']['message'] ?? 'Failed to load departments';
    $code = $res['status'] >= 400 && $res['status'] < 600 ? $res['status'] : 502;
    cp_json($code, ['status' => 'error', 'message' => $msg, 'details' => $res['data'] ?? null]);
}

$list = $res['data'];
if (!is_array($list)) {
    $list = [];
}

cp_json(200, ['status' => 'success', 'data' => $list]);
