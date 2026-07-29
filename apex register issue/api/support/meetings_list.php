<?php
/**
 * GET — call meeting appointments for current user.
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

$res = cp_call('GET', 'clientzone/call-meeting-appointment/user', null, 'session');

if (!$res['ok']) {
    $msg = $res['data']['message'] ?? 'Failed to load meetings';
    $code = $res['status'] >= 400 && $res['status'] < 600 ? $res['status'] : 502;
    cp_json($code, ['status' => 'error', 'message' => $msg, 'details' => $res['data'] ?? null]);
}

$list = $res['data'];
if (!is_array($list)) {
    cp_json(200, ['status' => 'success', 'data' => []]);
}

if (isset($list['data']) && is_array($list['data'])) {
    $list = $list['data'];
}

if (!isset($list[0]) && isset($list['id'])) {
    $list = [$list];
}

if (!is_array($list)) {
    $list = [];
}

cp_json(200, ['status' => 'success', 'data' => $list]);
