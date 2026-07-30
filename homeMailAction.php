<?php

header('Content-Type: application/json');

// Read the input data
$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true);

$fname = $data['firstName'] ?? '';
$lname = $data['lastName'] ?? '';
$email = $data['email'] ?? '';
$phone = $data['phone'] ?? '';
$offerName = $data['offerName'] ?? 'ClientCentral-Site'; // from code, fallback to default

// Use the REAL user IP passed from Vercel.
//   $data['userIp']      = the actual end-user IP (passed in JSON body)
//   $_SERVER['HTTP_X_REAL_IP']      = fallback (also passed as header)
//   $_SERVER['HTTP_X_FORWARDED_FOR'] = fallback
//   $_SERVER['REMOTE_ADDR']         = last resort
$userIp = $data['userIp']
       ?? $_SERVER['HTTP_X_REAL_IP']
       ?? $_SERVER['HTTP_X_FORWARDED_FOR']
       ?? $_SERVER['REMOTE_ADDR']
       ?? '';

// If X-Forwarded-For contains multiple IPs, take the first
if (strpos($userIp, ',') !== false) {
    $userIp = trim(explode(',', $userIp)[0]);
}

$post = array(
    "email" => $email,
    "firstName" => $fname,
    "lastName" => $lname,
    "password" => "Lh23s3",
    "ip" => $userIp,
    "phone" => $phone,
    "offerName" => $offerName
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
curl_close($ch);

$data = json_decode($response, true);

if (isset($data['details'])) {
    echo json_encode([
        "status" => "success",
        "redirectUrl" => $data['details']['redirect']['url']
    ]);
} else {
    $errMsg = $data["errors"][0]["message"] ?? $data["message"] ?? 'Submission failed';
    echo json_encode([
        "status" => "error",
        "message" => $errMsg,
        "_debug" => [
            "affilix_http" => $httpCode,
            "affilix_raw"  => $response,
            "payload_sent" => $post,
        ]
    ]);
}
