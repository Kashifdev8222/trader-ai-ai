<?php
/**
 * GET clientzone/documents/all — list uploaded documents (session Bearer).
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

$res = cp_call('GET', 'clientzone/documents/all', null, 'session');

if (!$res['ok']) {
    $msg = $res['data']['message'] ?? 'Failed to load documents';
    $code = $res['status'] >= 400 && $res['status'] < 600 ? $res['status'] : 502;
    cp_json($code, ['status' => 'error', 'message' => $msg, 'details' => $res['data'] ?? null]);
}

$list = $res['data'];
if (!is_array($list)) {
    cp_json(200, ['status' => 'success', 'data' => []]);
}

// API may return a numeric list of documents or wrap; normalize to list of rows
if (isset($list['items']) && is_array($list['items'])) {
    $list = $list['items'];
} elseif (isset($list['data']) && is_array($list['data'])) {
    $list = $list['data'];
} elseif (isset($list['documents']) && is_array($list['documents'])) {
    $list = $list['documents'];
}

// Single document object → one-element list
if (!isset($list[0]) && isset($list['id'])) {
    $list = [$list];
}

cp_json(200, ['status' => 'success', 'data' => $list]);
