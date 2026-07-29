<?php
/**
 * GET ?date=YYYY-MM-DD&duration=30|60
 * Proxies: clientzone/call-meeting-appointment/agent/time-slots/{y-m-d}/{duration}
 * Backend often expects month/day without leading zeros (e.g. 2024-1-26).
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

$raw = trim($_GET['date'] ?? '');
$duration = (int) ($_GET['duration'] ?? 30);
if ($duration !== 30 && $duration !== 60) {
    $duration = 30;
}

if ($raw === '') {
    cp_json(400, ['status' => 'error', 'message' => 'date is required (YYYY-MM-DD).']);
}

$ts = strtotime($raw);
if ($ts === false) {
    cp_json(400, ['status' => 'error', 'message' => 'Invalid date.']);
}

$y = (int) date('Y', $ts);
$m = (int) date('n', $ts);
$d = (int) date('j', $ts);
$seg = $y . '-' . $m . '-' . $d;

$path = 'clientzone/call-meeting-appointment/agent/time-slots/' . $seg . '/' . $duration;

$res = cp_call('GET', $path, null, 'session');

if (!$res['ok']) {
    $msg = $res['data']['message'] ?? 'Failed to load time slots';
    $code = $res['status'] >= 400 && $res['status'] < 600 ? $res['status'] : 502;
    cp_json($code, ['status' => 'error', 'message' => $msg, 'details' => $res['data'] ?? null]);
}

$list = $res['data'];
if (!is_array($list)) {
    cp_json(200, ['status' => 'success', 'data' => []]);
}

cp_json(200, ['status' => 'success', 'data' => $list]);
