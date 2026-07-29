<?php
require_once __DIR__ . '/../http_client.php';

if ($_SERVER['REQUEST_METHOD']!=='POST'){ cp_json(405, ['status'=>'error','message'=>'Method not allowed']); }

$input = json_decode(file_get_contents('php://input'), true) ?: [];
$email       = trim($input['email'] ?? '');
$password    = $input['password'] ?? '';
$newPassword = $input['newPassword'] ?? '';

if (!$email || !$password || !$newPassword) cp_json(400, ['status'=>'error','message'=>'Email, old and new password required.']);

$payload = ['email'=>$email,'password'=>$password,'newPassword'=>$newPassword];
$res = cp_call('POST', 'clientzone/auth/changepass', $payload, 'session');

if (!$res['ok']) cp_json($res['status'], ['status'=>'error','message'=>$res['data']['message'] ?? 'Password change failed.','details'=>$res['data'] ?? null]);

$sessionEmail = trim((string)($_SESSION['cp_user']['email'] ?? ''));
if ($sessionEmail !== '' && strcasecmp($sessionEmail, $email) === 0) {
  $_SESSION['cp_user']['portalPassword'] = $newPassword;
}
unset($_SESSION['cp_must_change_password']);

cp_json(200, [
  'status' => 'success',
  'data' => $res['data'],
  'mustChangePasswordCleared' => true,
]);
