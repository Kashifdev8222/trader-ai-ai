<?php
// api/auth/login.php
require_once __DIR__ . '/../http_client.php';

if ($_SERVER['REQUEST_METHOD']!=='POST'){
  cp_json(405, ['status'=>'error','message'=>'Method not allowed']);
}

$input    = json_decode(file_get_contents('php://input'), true) ?: [];
$email    = trim($input['email'] ?? '');
$password = (string)($input['password'] ?? '');

if (!$email || !$password) {
  cp_json(400, ['status'=>'error','message'=>'Email and password are required.']);
}

/* Call login with userDevice in body (no separate last-visit API). */
$raw = is_array($input['userDevice'] ?? null) ? $input['userDevice'] : [];
$payload = cp_login_payload($email, $password, cp_sanitize_user_device_overrides($raw));
$res = cp_call('POST', 'clientzone/auth/login', $payload, 'none');

if (!$res['ok']) {
  cp_json($res['status'], [
    'status'=>'error',
    'message'=>$res['data']['message'] ?? 'Wrong Username or Password',
    'details'=>$res['data'] ?? null
  ]);
}

$data  = $res['data'];
$token = $data['accessToken'] ?? null;
if (!$token) {
  cp_json(500, ['status'=>'error','message'=>'Token missing in login response (expected accessToken)']);
}

/* Ensure a session is active, rotate the id, then persist values */
if (session_status() === PHP_SESSION_NONE) session_start();
session_regenerate_id(true);
cp_set_session_token($token);

$_SESSION['cp_user'] = [
  'userId'    => $data['userId']    ?? null,
  'subId'     => $data['subId']     ?? null,
  'email'     => $data['email']     ?? $email,
  'firstName' => $data['firstName'] ?? null,
  'lastName'  => $data['lastName']  ?? null,
  'portalPassword' => $password,
];
unset($_SESSION['cp_must_change_password']);

/* IMPORTANT: flush session to disk before we respond */
session_write_close();

cp_json(200, ['status'=>'success','data'=>$data]);
