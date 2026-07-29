<?php
/**
 * POST — create ticket (category, title, initial message). userId from session.
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
$title = trim($input['title'] ?? '');
$initial = trim($input['initialMessage'] ?? $input['text'] ?? '');
$category = trim($input['category'] ?? 'General');
$cfg = cp_config();
$departmentId = trim($input['departmentId'] ?? '');
if ($departmentId === '') {
    $departmentId = $cfg['SUPPORT_DEFAULT_DEPARTMENT_ID'] ?? '';
}
$userId = $_SESSION['cp_user']['userId'];

if ($title === '' || $initial === '') {
    cp_json(400, ['status' => 'error', 'message' => 'title and initialMessage are required.']);
}
if ($departmentId === '') {
    cp_json(400, ['status' => 'error', 'message' => 'departmentId is required.']);
}

$payload = [
    'category' => $category,
    'departmentId' => $departmentId,
    'title' => $title,
    'userId' => $userId,
    'userTicketComments' => [
        [
            'text' => $initial,
            'userId' => $userId,
        ],
    ],
];

$res = cp_call('POST', 'clientzone/lead/ticket', $payload, 'session');

if (!$res['ok']) {
    $msg = $res['data']['message'] ?? 'Failed to create ticket';
    $code = $res['status'] >= 400 && $res['status'] < 600 ? $res['status'] : 502;
    cp_json($code, ['status' => 'error', 'message' => $msg, 'details' => $res['data'] ?? null]);
}

cp_json(200, ['status' => 'success', 'data' => $res['data']]);
