<?php
declare(strict_types=1);

require_once __DIR__ . '/api/http_client.php';

function b64url_decode(string $data): string|false
{
    $remainder = strlen($data) % 4;
    if ($remainder > 0) {
        $data .= str_repeat('=', 4 - $remainder);
    }
    return base64_decode(strtr($data, '-_', '+/'), true);
}

function get_autologin_secret(): string
{
    $secret = getenv('CP_AUTOLOGIN_SECRET');
    return $secret ? (string)$secret : '';
}

function fail_redirect(): void
{
    header('Location: /login?autologin=failed');
    exit;
}

$token = trim((string)($_GET['t'] ?? ''));
if ($token === '') {
    fail_redirect();
}

$parts = explode('.', $token);
if (count($parts) !== 3) {
    fail_redirect();
}

[$encodedHeader, $encodedPayload, $encodedSignature] = $parts;
$headerRaw = b64url_decode($encodedHeader);
$payloadRaw = b64url_decode($encodedPayload);
$signatureRaw = b64url_decode($encodedSignature);
$secret = get_autologin_secret();

if ($headerRaw === false || $payloadRaw === false || $signatureRaw === false || $secret === '') {
    fail_redirect();
}

$header = json_decode($headerRaw, true);
$payload = json_decode($payloadRaw, true);
if (!is_array($header) || !is_array($payload)) {
    fail_redirect();
}

if (($header['alg'] ?? '') !== 'HS256' || ($header['typ'] ?? '') !== 'JWT') {
    fail_redirect();
}

$signedData = $encodedHeader . '.' . $encodedPayload;
$expectedSig = hash_hmac('sha256', $signedData, $secret, true);
if (!hash_equals($expectedSig, $signatureRaw)) {
    fail_redirect();
}

$exp = (int)($payload['exp'] ?? 0);
if ($exp <= time()) {
    fail_redirect();
}

$cpToken = (string)($payload['cpToken'] ?? '');
$user = is_array($payload['user'] ?? null) ? $payload['user'] : null;

if ($cpToken === '') {
    $login = $payload['login'] ?? null;
    if (!is_array($login)) {
        fail_redirect();
    }
    $email = trim((string)($login['email'] ?? ''));
    $password = (string)($login['password'] ?? '');
    if ($email === '' || $password === '') {
        fail_redirect();
    }

    $profile = is_array($payload['profile'] ?? null) ? $payload['profile'] : [];

    for ($i = 0; $i < 6; $i++) {
        $res = cp_call('POST', 'clientzone/auth/login', cp_login_payload($email, $password), 'none');
        if ($res['ok']) {
            $d = is_array($res['data']) ? $res['data'] : [];
            $cpToken = (string)($d['accessToken'] ?? '');
            if ($cpToken !== '') {
                $user = [
                    'userId' => $d['userId'] ?? null,
                    'subId' => $d['subId'] ?? null,
                    'email' => $d['email'] ?? $email,
                    'firstName' => $d['firstName'] ?? ($profile['firstName'] ?? null),
                    'lastName' => $d['lastName'] ?? ($profile['lastName'] ?? null),
                    'portalPassword' => $password,
                ];
                break;
            }
        }
        usleep(250000);
    }
}

if ($cpToken === '' || !is_array($user)) {
    fail_redirect();
}

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
session_regenerate_id(true);
cp_set_session_token($cpToken);
$_SESSION['cp_user'] = [
    'userId' => $user['userId'] ?? null,
    'subId' => $user['subId'] ?? null,
    'email' => $user['email'] ?? null,
    'firstName' => $user['firstName'] ?? null,
    'lastName' => $user['lastName'] ?? null,
    'portalPassword' => $user['portalPassword'] ?? null,
];
$_SESSION['cp_must_change_password'] = true;

session_write_close();
header('Location: /dashboard');
exit;
