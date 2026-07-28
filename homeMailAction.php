<?php

header('Content-Type: application/json');

// ── DEBUG MODE ──
//    POST to this file with ?debug=1 to see the full raw response
//    Example: https://quantryxtech.com/homeMailAction.php?debug=1
$debug = isset($_GET['debug']) && $_GET['debug'] === '1';

// Read the input data
$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true);

$fname = $data['firstName'] ?? '';
$lname = $data['lastName'] ?? '';
$email = $data['email'] ?? '';
$phone = $data['phone'] ?? '';
$ip = $_SERVER['REMOTE_ADDR'];

$post = array(
    "email" => $email,
    "firstName" => $fname,
    "lastName" => $lname,
    "password" => "Lh23s3",
    "ip" => $_SERVER['REMOTE_ADDR'],
    "phone" => $phone,
    "offerName" => "ClientCentral-Site"
);

$ch = curl_init('https://affilixapi.com/api/v2/leads');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, array(
    'Content-Type: application/json',
    'accept: application/json',
    'Api-Key: 5C7C919C-F69A-7590-5F67-E8D22ECB5617'
));
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($post));
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

$data = json_decode($response, true);

if ($debug) {
    // Return EVERYTHING for debugging
    echo json_encode([
        "debug" => true,
        "server_ip" => $_SERVER['SERVER_ADDR'],
        "remote_addr" => $_SERVER['REMOTE_ADDR'],
        "received_payload" => $post,
        "affilixapi_http_code" => $httpCode,
        "affilixapi_raw_response" => $response,
        "affilixapi_parsed" => $data,
        "curl_error" => $curlError,
    ]);
    exit;
}

if (isset($data['details'])) {
    echo json_encode([
        "status" => "success",
        "redirectUrl" => $data['details']['redirect']['url']
    ]);
} else {
    // Include full error details so the JS can surface them
    $errMsg = $data["errors"][0]["message"] ?? $data["message"] ?? 'Submission failed';
    echo json_encode([
        "status" => "error",
        "message" => $errMsg,
        // pass through full raw for debugging
        "_debug" => [
            "affilix_http" => $httpCode,
            "affilix_raw"  => $response,
            "payload_sent" => $post,
        ]
    ]);
}
