<?php
// api/news/latest.php
require_once __DIR__ . '/../http_client.php';

$token = 'yatmisanisrls24vanr4qqh9o5a7gsijghd26bs3'; // move to config later
/* metadata=1 includes article URL and other fields Stock News API may omit otherwise */
$url = 'https://stocknewsapi.com/api/v1/category'
     . '?section=alltickers&items=20&page=1&metadata=1&token=' . urlencode($token);

$ch = curl_init();
curl_setopt_array($ch, [
  CURLOPT_URL            => $url,
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_FOLLOWLOCATION => true,
  CURLOPT_TIMEOUT        => 20,
]);
$raw = curl_exec($ch);
$err = curl_error($ch);
curl_close($ch);

if ($err) {
  cp_json(500, ['status'=>'error','message'=>'News error: '.$err]);
}

$json = json_decode($raw, true);
if (json_last_error() !== JSON_ERROR_NONE) {
  cp_json(500, ['status'=>'error','message'=>'Bad news JSON','raw'=>$raw]);
}

cp_json(200, [
  'status' => 'success',
  'data'   => $json['data'] ?? []
]);
