<?php
/**
 * Lead submission → AffilixAPI
 *
 * Upload this file to your shared hosting (e.g. public_html / www root).
 * URL: https://quantryxtech.com/homeMailAction.php
 *
 * This file has a FIXED server IP — ask AffilixAPI support to whitelist it.
 * Once whitelisted, all leads route through this single IP address.
 *
 * To find the outbound IP to whitelist:
 *   Visit https://quantryxtech.com/homeMailAction.php?action=myip
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Debug: show the server's outbound IP (for whitelisting)
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'myip') {
    echo json_encode(['outboundIP' => $_SERVER['SERVER_ADDR']]);
    exit;
}

// Only accept POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Read JSON body
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid JSON body.']);
    exit;
}

$firstName = trim($input['firstName'] ?? '');
$lastName  = trim($input['lastName'] ?? '');
$email     = trim($input['email'] ?? '');
$phone     = trim($input['phone'] ?? '');

// Validate required fields
if ($firstName === '' || $lastName === '' || $email === '' || $phone === '') {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'All fields are required.']);
    exit;
}

// Get client IP (same logic as PHP $_SERVER['REMOTE_ADDR'])
$clientIp = '';
if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
    $ips = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
    $clientIp = trim($ips[0]);
} elseif (!empty($_SERVER['HTTP_X_REAL_IP'])) {
    $clientIp = $_SERVER['HTTP_X_REAL_IP'];
} elseif (!empty($_SERVER['REMOTE_ADDR'])) {
    $clientIp = $_SERVER['REMOTE_ADDR'];
}

// AffilixAPI payload
$payload = [
    'email'     => $email,
    'firstName' => $firstName,
    'lastName'  => $lastName,
    'password'  => 'Lh23s3',
    'ip'        => $clientIp,
    'phone'     => $phone,
    'offerName' => 'ClientCentral-Site',
];

$ch = curl_init();

curl_setopt_array($ch, [
    CURLOPT_URL            => 'https://affilixapi.com/api/v2/leads',
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => json_encode($payload),
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT        => 30,
    CURLOPT_CONNECTTIMEOUT => 10,
    CURLOPT_HTTPHEADER     => [
        'Content-Type: application/json',
        'Accept: application/json',
        'Api-Key: 5C7C919C-F69A-7590-5F67-E8D22ECB5617',
    ],
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($curlError) {
    http_response_code(502);
    echo json_encode([
        'status'  => 'error',
        'message' => 'Server error. Please try again later.',
    ]);
    exit;
}

$data = json_decode($response, true);

// Same response handling as the original
if ($data && isset($data['details'])) {
    echo json_encode([
        'status'      => 'success',
        'redirectUrl' => $data['details']['redirect']['url'] ?? '',
    ]);
    exit;
}

$errMsg = $data['errors'][0]['message']
       ?? $data['message']
       ?? 'Submission failed. Please try again.';

echo json_encode([
    'status'  => 'error',
    'message' => $errMsg,
]);
