<?php
declare(strict_types=1);

require_once __DIR__ . '/../http_client.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    cp_json(405, ['status' => 'error', 'message' => 'Method not allowed']);
}

$input = json_decode(file_get_contents('php://input'), true) ?: [];
$token = trim((string)($input['token'] ?? ''));
$newPassword = (string)($input['newPassword'] ?? '');

if ($token === '') {
    cp_json(400, ['status' => 'error', 'message' => 'Reset token is required.']);
}
if ($newPassword === '') {
    cp_json(400, ['status' => 'error', 'message' => 'New password is required.']);
}
if (strlen($newPassword) < 8) {
    cp_json(400, ['status' => 'error', 'message' => 'Password must be at least 8 characters.']);
}

/* Pre-auth: no session Bearer — token from email link */
$res = cp_call('POST', 'clientzone/auth/resetpass', [
    'token' => $token,
    'newPassword' => $newPassword,
], 'none');

if (!$res['ok']) {
    $httpStatus = $res['status'] >= 400 && $res['status'] < 600 ? $res['status'] : 400;
    cp_json($httpStatus, [
        'status' => 'error',
        'message' => $res['data']['message'] ?? 'Password reset failed.',
        'details' => $res['data'] ?? null,
    ]);
}

$message = is_array($res['data']) && !empty($res['data']['message'])
    ? (string)$res['data']['message']
    : 'Password updated successfully.';

cp_json(200, [
    'status' => 'success',
    'message' => $message,
    'data' => $res['data'],
]);
