<?php
/**
 * GET — list tickets for logged-in user (session Bearer).
 */
require_once __DIR__ . '/../http_client.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if (empty($_SESSION['cp_token']) || empty($_SESSION['cp_user']['userId'] ?? null)) {
    cp_json(401, ['status' => 'error', 'message' => 'Not logged in.']);
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    cp_json(405, ['status' => 'error', 'message' => 'Method not allowed']);
}

$cfg = cp_config();
$path = $cfg['TICKETS_LIST_PATH'] ?? 'clientzone/lead/ticket/user';

$res = cp_call('GET', $path, null, 'session');

if (!$res['ok']) {
    $alt = cp_call('GET', 'clientzone/lead/ticket', null, 'session');
    if ($alt['ok']) {
        $res = $alt;
    } else {
        $msg = $res['data']['message'] ?? 'Failed to load tickets';
        $code = $res['status'] >= 400 && $res['status'] < 600 ? $res['status'] : 502;
        cp_json($code, ['status' => 'error', 'message' => $msg, 'details' => $res['data'] ?? null]);
    }
}

$list = $res['data'];
if (!is_array($list)) {
    cp_json(200, ['status' => 'success', 'data' => []]);
}

if (isset($list['items']) && is_array($list['items'])) {
    $list = $list['items'];
} elseif (isset($list['data']) && is_array($list['data'])) {
    $list = $list['data'];
} elseif (isset($list['tickets']) && is_array($list['tickets'])) {
    $list = $list['tickets'];
}

if (!isset($list[0]) && isset($list['id'])) {
    $list = [$list];
}

if (!is_array($list)) {
    $list = [];
}

cp_json(200, ['status' => 'success', 'data' => $list]);
