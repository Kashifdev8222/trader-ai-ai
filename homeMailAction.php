<?php

header('Content-Type: application/json');

// Read the input data
$data = json_decode(file_get_contents('php://input'), true);

$fname = $data['firstName'];
$lname = $data['lastName'];
$email = $data['email'];
$phone = $data['phone'];
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
curl_close($ch);

$data = json_decode($response, true);

if (isset($data['details'])) {
    echo json_encode([
        "status" => "success",
        "redirectUrl" => $data['details']['redirect']['url']
    ]);
} else {
    echo json_encode([
        "status" => "error",
        "message" => $data["errors"][0]["message"]
    ]);
}
