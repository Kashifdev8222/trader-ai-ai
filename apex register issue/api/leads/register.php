<?php
require_once __DIR__ . '/../http_client.php';

if ($_SERVER['REQUEST_METHOD']!=='POST'){
  cp_json(405, ['status'=>'error','message'=>'Method not allowed']);
}

/** Normalize PrimeCRM error payloads (message may be a string or validation array). */
function cp_leads_error_message(array $data, string $fallback): string
{
    $status = $data['statusCode'] ?? null;
    if ($status === 429 || ($data['error'] ?? '') === 'We are unable to process this request') {
        return 'Too many sign-up attempts from this site. Please wait a few minutes and try again.';
    }

    $msg = $data['message'] ?? null;
    if (is_string($msg) && $msg !== '') {
        return $msg;
    }
    if (is_array($msg)) {
        $parts = [];
        foreach ($msg as $item) {
            if (is_string($item)) {
                $parts[] = $item;
            }
        }
        if ($parts !== []) {
            return implode(' ', $parts);
        }
    }
    return $fallback;
}

$input = json_decode(file_get_contents('php://input'), true) ?: [];

/* Parse Full Name */
$fullName = preg_split('/\s+/', trim((string)($input['fullName'] ?? '')), -1, PREG_SPLIT_NO_EMPTY);
$firstName = $fullName[0] ?? '';
$lastName = count($fullName) > 1 ? implode(' ', array_slice($fullName, 1)) : $firstName;

/* Build payload (adjust static values if needed) */
$payload = [
    'firstName'  => $firstName,
    'lastName'   => $lastName,
    'email'      => $input['email'] ?? '',
    'phone'      => $input['phone'] ?? '',
    'country'    => 'PK',
    'language'   => 'bm',
    'customFields' => '',
    'username'   => $input['email'] ?? null,
    'birthDate'  => $input['birthDate'] ?? null,
    'password'   => $input['password'] ?? '',
    'accounts'   => [[ 'groupName'=>'20900\\STANDART.USD', 'leverage'=>100, 'isDemoAccount'=>false ]],
    'brandId'    => '360e85c5-b81b-474d-87a2-a33fae141eca',
    'businessUnitId' => 'ea8b30a5-57c4-4fe9-8fc1-b9260d9f93c1',
    'isDemoAccount'  => true,
    'tags'       => [[ 'id' => 'bf05cca4-0ac8-4d59-aa1b-e07a5b31c969' ]],
    'notes'      => [[ 'text' => 'ClientPortal-Website' ]],
];

/* Check for missing required fields */
foreach (['firstName', 'lastName', 'email', 'phone', 'password'] as $f) {
    if (empty($payload[$f])) cp_json(400, ['status' => 'error', 'message' => "Missing required: $f"]);
}

/* Pre-auth: NO Authorization header */
$res = cp_call('POST', 'clientzone/leads', $payload, 'none');

if (!$res['ok']) {
    $details = is_array($res['data']) ? $res['data'] : [];
    cp_json($res['status'], [
        'status' => 'error',
        'message' => cp_leads_error_message($details, 'Registration failed'),
        'details' => $details ?: null
    ]);
}

cp_json(200, ['status' => 'success', 'data' => $res['data']]);

