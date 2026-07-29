<?php
// api/auth/web_trader_url.php — same behaviour as api/webtrader/url.php (legacy path)
require_once __DIR__ . '/../http_client.php';

if (session_status() === PHP_SESSION_NONE) {
  session_start();
}

$email = trim($_SESSION['cp_user']['email'] ?? '');
$pass  = (string)($_SESSION['cp_user']['portalPassword'] ?? '');

$tpRaw = trim($_GET['tpNumber'] ?? '');
$tpNumber = preg_replace('/[^0-9A-Za-z._-]/', '', $tpRaw);

$baseUrl = 'https://trader.mic-market.com/auth/login';

$hasCredentials = ($email !== '' && $pass !== '');

if (!$hasCredentials) {
  cp_json(200, [
    'status' => 'success',
    'data'   => [
      'url'            => $baseUrl,
      'hasCredentials' => false,
      'message'        => 'Please log out and sign in again so Web Trader can use your credentials.',
    ],
  ]);
}

$url = $baseUrl
  . '?email=' . rawurlencode($email)
  . '&password=' . rawurlencode($pass);

if ($tpNumber !== '') {
  $url .= '&tpNumber=' . rawurlencode($tpNumber);
}

$url .= '&from=clientzone&embed=1';

cp_json(200, [
  'status' => 'success',
  'data'   => [
    'url'            => $url,
    'hasCredentials' => true,
    'tpNumber'       => $tpNumber !== '' ? $tpNumber : null,
  ],
]);
