<?php
// api/auth/whoami.php
require_once __DIR__ . '/../http_client.php';
if (session_status() === PHP_SESSION_NONE) session_start();

if (empty($_SESSION['cp_token']) || empty($_SESSION['cp_user'])) {
  cp_json(401, ['status'=>'error','message'=>'Not logged in']);
}

cp_json(200, ['status'=>'success','data'=>['user'=>$_SESSION['cp_user']]]);
