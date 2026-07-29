<?php
/**
 * POST — schedule a call meeting (body forwarded; aligns with clientzone API).
 */
require_once __DIR__ . '/../http_client.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if (empty($_SESSION['cp_token'])) {
    cp_json(401, ['status' => 'error', 'message' => 'Not logged in.']);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    cp_json(405, ['status' => 'error', 'message' => 'Method not allowed']);
}

$input = json_decode(file_get_contents('php://input'), true) ?: [];

$title = trim($input['title'] ?? '');
$description = trim($input['description'] ?? '');
$date = trim($input['date'] ?? '');
$meetingPeriod = $input['meetingPeriod'] ?? 30;
$importance = trim($input['importance'] ?? 'normal');

if ($title === '' || $description === '' || $date === '') {
    cp_json(400, ['status' => 'error', 'message' => 'title, description, and date are required.']);
}

$payload = [
    'title' => $title,
    'description' => $description,
    'date' => $date,
    'meetingPeriod' => is_numeric($meetingPeriod) ? (int) $meetingPeriod : 30,
    'importance' => in_array($importance, ['urgent', 'normal'], true) ? $importance : 'normal',
    'isUserConfirmed' => !empty($input['isUserConfirmed']) ? true : true,
];

$res = cp_call('POST', 'clientzone/call-meeting-appointment', $payload, 'session');

if (!$res['ok']) {
    $msg = $res['data']['message'] ?? 'Failed to schedule meeting';
    $code = $res['status'] >= 400 && $res['status'] < 600 ? $res['status'] : 502;
    cp_json($code, ['status' => 'error', 'message' => $msg, 'details' => $res['data'] ?? null]);
}

cp_json(200, ['status' => 'success', 'data' => $res['data']]);
