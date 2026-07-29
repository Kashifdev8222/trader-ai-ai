<?php
header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true);
$country = $input['country'] ?? '';
$state   = $input['state'] ?? '';

if (!$country || !$state) {
  echo json_encode(['status'=>'error','message'=>'Missing country or state']);
  exit;
}

$payload = json_encode(['country'=>$country, 'state'=>$state]);

$ch = curl_init('https://countriesnow.space/api/v0.1/countries/state/cities');
curl_setopt_array($ch, [
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_POST => true,
  CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
  CURLOPT_POSTFIELDS => $payload
]);
$res = curl_exec($ch);
curl_close($ch);

$data = json_decode($res, true);
$cities = $data['data'] ?? [];

echo json_encode(['status'=>'ok','data'=>$cities], JSON_UNESCAPED_UNICODE);
