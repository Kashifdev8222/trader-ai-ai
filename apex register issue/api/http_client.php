<?php
/* Session for per-login Bearer token */
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

function cp_config(){ static $c=null; if(!$c){ $c=require __DIR__.'/config.php'; } return $c; }

function cp_json($code, $arr){
  http_response_code($code);
  header('Content-Type: application/json');
  echo json_encode($arr);
  exit;
}

/**
 * cp_call
 * $authMode:
 *   'none'    => NO Authorization header (login / register / forgotpass)
 *   'session' => Use token from $_SESSION['cp_token'] (after login)
 *   'static'  => Use STATIC_BEARER from config (only if you really need it)
 */
function cp_call($method, $path, $payload=null, $authMode='none'){
  $cfg = cp_config();
  $url = rtrim($cfg['BASE_URL'],'/').'/'.ltrim($path,'/');

  $headers = ['Accept: application/json', 'Content-Type: application/json'];

  if ($authMode === 'session') {
    if (empty($_SESSION['cp_token'])) {
      return ['ok'=>false,'status'=>401,'data'=>['message'=>'Not authenticated']];
    }
    $headers[] = 'Authorization: Bearer '.$_SESSION['cp_token'];
  } elseif ($authMode === 'static' && !empty($cfg['STATIC_BEARER'])) {
    $headers[] = 'Authorization: Bearer '.$cfg['STATIC_BEARER'];
  }

  $opts = [
    CURLOPT_URL => $url,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_MAXREDIRS => 5,
    CURLOPT_TIMEOUT => 30,
    CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
    CURLOPT_CUSTOMREQUEST => strtoupper($method),
    CURLOPT_HTTPHEADER => $headers,
  ];
  if (!is_null($payload)) {
    $opts[CURLOPT_POSTFIELDS] = json_encode($payload);
  }

  $ch = curl_init();
  curl_setopt_array($ch,$opts);
  $raw    = curl_exec($ch);
  $err    = curl_error($ch);
  $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
  curl_close($ch);

  if ($err) return ['ok'=>false,'status'=>500,'data'=>['message'=>'cURL error: '.$err]];

  $trim = is_string($raw) ? trim($raw) : '';
  if ($trim === '' && $status >= 200 && $status < 300) {
    return ['ok' => true, 'status' => $status, 'data' => null];
  }

  $json = json_decode($raw, true);
  if (json_last_error() !== JSON_ERROR_NONE) {
    return ['ok'=>false,'status'=>500,'data'=>['message'=>'Invalid JSON','raw'=>$raw]];
  }

  return ['ok' => ($status>=200 && $status<300), 'status'=>$status, 'data'=>$json];
}

/* session token helpers */
function cp_set_session_token($token){
  if (session_status() === PHP_SESSION_NONE) session_start();
  $_SESSION['cp_token'] = $token;
}
function cp_clear_session_token(){
  if (session_status() === PHP_SESSION_NONE) session_start();
  unset($_SESSION['cp_token']);
}

/** userDevice keys for auth/login payload. */
function cp_user_device_schema_keys(): array
{
  return ['appVersion', 'uniqueId', 'device', 'systemName', 'useragent', 'type', 'brand', 'systemVersion', 'language'];
}

/** Keep only allowed userDevice fields. */
function cp_sanitize_user_device_overrides(array $overrides): array
{
  $clean = [];
  foreach (cp_user_device_schema_keys() as $key) {
    if (isset($overrides[$key]) && $overrides[$key] !== '') {
      $clean[$key] = $overrides[$key];
    }
  }
  if (isset($overrides['deviceType']) && $overrides['deviceType'] !== '' && empty($clean['device'])) {
    $clean['device'] = $overrides['deviceType'];
  }
  return $clean;
}

function cp_normalize_user_device(array $ud): array
{
  $out = [];
  foreach (cp_user_device_schema_keys() as $key) {
    if (array_key_exists($key, $ud)) {
      $out[$key] = $ud[$key];
    }
  }
  return $out;
}

/** Chrome Sec-CH-UA-Platform (more reliable than spoofed User-Agent). */
function cp_client_hints_platform(): ?string
{
  $raw = (string)($_SERVER['HTTP_SEC_CH_UA_PLATFORM'] ?? '');
  $raw = trim($raw, " \t\n\r\0\x0B\"'");
  return $raw !== '' ? $raw : null;
}

function cp_device_from_platform_name(string $platform): ?string
{
  $p = strtolower($platform);
  if ($p === '') return null;
  if (str_contains($p, 'windows')) return 'Windows';
  if (str_contains($p, 'mac')) return 'Mac';
  if (str_contains($p, 'linux') || str_contains($p, 'chrome os') || str_contains($p, 'cros')) return 'Linux';
  if ($p === 'android') return 'Android';
  if ($p === 'ios') return 'iOS';
  return null;
}

/** systemVersion for auth login userDevice. */
function cp_parse_system_version(string $ua): string
{
  if (preg_match('/Android ([0-9.]+)/i', $ua, $m)) return $m[1];
  if (preg_match('/CPU (?:iPhone )?OS ([0-9_]+)/i', $ua, $m)) return str_replace('_', '.', $m[1]);
  if (preg_match('/Mac OS X ([0-9_]+)/i', $ua, $m)) return str_replace('_', '.', $m[1]);
  if (preg_match('/Windows NT ([0-9.]+)/i', $ua, $m)) return explode('.', $m[1])[0];
  if (stripos($ua, 'aarch64') !== false || stripos($ua, 'arm64') !== false) return 'arm64';
  if (stripos($ua, 'x86_64') !== false || stripos($ua, 'Win64') !== false || preg_match('/\bx64\b/i', $ua)) return 'x86_64';
  return PHP_OS_FAMILY;
}

function cp_parse_language(): string
{
  $raw = (string)($_SERVER['HTTP_ACCEPT_LANGUAGE'] ?? 'en');
  if ($raw === '') return 'en';
  $first = strtolower(trim(explode(',', $raw)[0] ?? 'en'));
  $first = explode(';', $first)[0] ?? 'en';
  $lang = explode('-', $first)[0] ?? 'en';
  return preg_match('/^[a-z]{2}$/', $lang) ? $lang : 'en';
}

/** Build auth/login userDevice object. */
function cp_build_user_device(): array
{
  $ua = (string)($_SERVER['HTTP_USER_AGENT'] ?? 'Mozilla/5.0');
  $cfg = cp_config();

  $device = cp_device_from_platform_name((string)(cp_client_hints_platform() ?? '')) ?? 'Web';
  if ($device === 'Web') {
    if (stripos($ua, 'Android') !== false) $device = 'Android';
    elseif (stripos($ua, 'iPhone') !== false || stripos($ua, 'iPad') !== false) $device = 'iOS';
    elseif (stripos($ua, 'Windows') !== false) $device = 'Windows';
    elseif (stripos($ua, 'Mac OS') !== false || stripos($ua, 'Macintosh') !== false) $device = 'Mac';
    elseif (stripos($ua, 'Linux') !== false) $device = 'Linux';
  }

  $brand = 'Web';
  if (preg_match('/Edg\//i', $ua)) $brand = 'Edge';
  elseif (preg_match('/OPR\/|Opera/i', $ua)) $brand = 'Opera';
  elseif (preg_match('/Firefox\//i', $ua)) $brand = 'Firefox';
  elseif (preg_match('/Chrome\//i', $ua)) $brand = 'Chrome';
  elseif (preg_match('/Safari\//i', $ua)) $brand = 'Safari';

  $type = 'web';
  if (stripos($ua, 'Android') !== false) $type = 'android';
  elseif (stripos($ua, 'iPhone') !== false || stripos($ua, 'iPad') !== false) $type = 'ios';

  $systemName = ($type === 'web') ? 'Desktop' : 'Mobile';

  $sid = session_id();
  if ($sid === '') $sid = bin2hex(random_bytes(8));
  $uniqueId = substr(str_pad((string) abs(crc32($sid . '|' . $ua)), 9, '0', STR_PAD_LEFT), 0, 9);

  return cp_normalize_user_device([
    'appVersion' => (string)($cfg['WEB_APP_VERSION'] ?? '3.0.25'),
    'uniqueId' => $uniqueId,
    'device' => $device,
    'systemName' => $systemName,
    'useragent' => $ua,
    'type' => $type,
    'brand' => $brand,
    'systemVersion' => cp_parse_system_version($ua),
    'language' => cp_parse_language(),
  ]);
}

function cp_merge_user_device(array $base, array $overrides): array
{
  $overrides = cp_sanitize_user_device_overrides($overrides);
  foreach ($overrides as $key => $val) {
    if ($val !== '') $base[$key] = $val;
  }
  return cp_normalize_user_device($base);
}

/** Build POST payload for clientzone/auth/login. */
function cp_login_payload(string $email, string $password, array $userDeviceOverrides = []): array
{
  $ud = cp_build_user_device();
  if ($userDeviceOverrides !== []) {
    $ud = cp_merge_user_device($ud, $userDeviceOverrides);
  }
  return [
    'email' => $email,
    'password' => $password,
    'userDevice' => $ud,
  ];
}

/* CORS (basic; adjust for prod) */
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD']==='OPTIONS') exit;
