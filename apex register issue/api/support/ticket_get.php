<?php
/**
 * GET ?id= — single ticket by id.
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

$id = trim($_GET['id'] ?? $_GET['ticketId'] ?? $_GET['userTicketId'] ?? '');
if ($id === '') {
    cp_json(400, ['status' => 'error', 'message' => 'id is required.']);
}

$res = cp_call('GET', 'clientzone/lead/ticket/' . rawurlencode($id), null, 'session');

/* Some deployments align list under ticket/user; retry if path-style GET fails. */
if (!$res['ok'] && in_array((int) ($res['status'] ?? 0), [400, 404], true)) {
    $alt = cp_call('GET', 'clientzone/lead/ticket/user/' . rawurlencode($id), null, 'session');
    if ($alt['ok']) {
        $res = $alt;
    }
}

if (!$res['ok']) {
    $msg = $res['data']['message'] ?? 'Failed to load ticket';
    $code = $res['status'] >= 400 && $res['status'] < 600 ? $res['status'] : 502;
    cp_json($code, ['status' => 'error', 'message' => $msg, 'details' => $res['data'] ?? null]);
}

cp_json(200, ['status' => 'success', 'data' => $res['data']]);
