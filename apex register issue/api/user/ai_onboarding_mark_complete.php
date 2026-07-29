<?php
/**
 * POST — mark AI dashboard onboarding as completed (writes JSON for this user).
 * Session required; same userId as logged-in user only.
 */
require_once __DIR__ . '/../http_client.php';
require_once dirname(__DIR__, 2) . '/lib/cp_ai_onboarding_store.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    cp_json(405, ['status' => 'error', 'message' => 'Method not allowed']);
}

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$cpUser = $_SESSION['cp_user'] ?? null;
$userId = $cpUser['userId'] ?? null;

if (!$userId) {
    cp_json(401, ['status' => 'error', 'message' => 'Not logged in']);
}

$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) {
    $input = [];
}

$extra = [];
if (!empty($input['tpNumber'])) {
    $extra['tpNumber'] = (string)$input['tpNumber'];
}

if (cp_ai_onboarding_mark_completed($userId, $extra)) {
    cp_json(200, ['status' => 'ok', 'completed' => true]);
}

cp_json(500, ['status' => 'error', 'message' => 'Could not save completion. Check server write permissions for data/cp_ai_onboarding/']);
