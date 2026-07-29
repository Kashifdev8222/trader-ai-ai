<?php
// api/payments/lemuxion_create.php
require_once __DIR__ . '/../http_client.php';
if (session_status() === PHP_SESSION_NONE) session_start();

if (empty($_SESSION['cp_token'])) {
  cp_json(401, ['status'=>'error','message'=>'Not logged in.']);
}

$input = json_decode(file_get_contents('php://input'), true) ?: [];
$accountId   = $input['accountId'] ?? null;
$amount      = $input['amount']    ?? null;   // numeric
$currency    = $input['currency']  ?? null;   // 'EUR','USD','GBP','AUD'
$description = isset($input['description']) ? trim((string) $input['description']) : '';

$street = $input['street'] ?? null;
$city   = $input['city']   ?? null;
$zip    = $input['zip']    ?? null;
$state  = $input['state']  ?? null;
$country= $input['country']?? null;           // ISO-2 required by API

if (!$accountId || $amount === null || !$currency || $description === '' || !$street || !$city || !$zip || !$state || !$country) {
  cp_json(400, ['status'=>'error','message'=>'Missing required fields.']);
}

$body = [
  'accountId'   => $accountId,
  'amount'      => $amount,          // numeric is OK
  'currency'    => $currency,
  'description' => $description,
  'street'      => $street,
  'city'        => $city,
  'zip'         => $zip,
  'state'       => $state,
  'country'     => $country          // must be ISO-2 (e.g., 'US','AF')
];

$path = 'clientzone/lead/account/transaction/lemuxion-pay';
$res  = cp_call('POST', $path, $body, 'session');

if (!$res['ok']) {
  $msg = $res['data']['message'] ?? 'Failed to create Lemuxion payment';
  cp_json($res['status'], ['status'=>'error','message'=>$msg,'details'=>$res['data'] ?? null]);
}
cp_json(200, ['status'=>'success','data'=>$res['data']['data'] ?? $res['data']]);
