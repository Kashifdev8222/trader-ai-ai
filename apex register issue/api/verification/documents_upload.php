<?php
/**
 * POST multipart to clientzone/documents (session Bearer).
 * Fields: file (required), document (JSON string per API).
 */
require_once __DIR__ . '/../http_client.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if (empty($_SESSION['cp_token'])) {
    cp_json(401, ['status' => 'error', 'message' => 'Not logged in.']);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    cp_json(405, ['status' => 'error', 'message' => 'Method not allowed']);
}

if (empty($_FILES['file']) || (int)($_FILES['file']['error'] ?? 0) !== UPLOAD_ERR_OK) {
    $err = (int)($_FILES['file']['error'] ?? UPLOAD_ERR_NO_FILE);
    cp_json(400, ['status' => 'error', 'message' => 'File upload failed (code ' . $err . ').']);
}

$rawDoc = $_POST['document'] ?? '';
$document = json_decode($rawDoc, true);
if (!is_array($document) || json_last_error() !== JSON_ERROR_NONE) {
    cp_json(400, ['status' => 'error', 'message' => 'Invalid document JSON.']);
}

$cfg = cp_config();
$url = rtrim($cfg['BASE_URL'], '/') . '/clientzone/documents';

$tmp = $_FILES['file']['tmp_name'];
$mime = !empty($_FILES['file']['type']) ? $_FILES['file']['type'] : 'application/octet-stream';
$name = !empty($_FILES['file']['name']) ? $_FILES['file']['name'] : 'upload';

// API validates extensions (jpeg|jpg|png|pdf). JPEG files are often named .jfif / .jpe — forward as .jpg.
if (preg_match('/\.(jfif|jpe)$/i', $name)) {
    $name = preg_replace('/\.(jfif|jpe)$/i', '.jpg', $name);
    if ($mime === '' || stripos($mime, 'octet-stream') !== false || stripos($mime, 'jfif') !== false) {
        $mime = 'image/jpeg';
    }
}

$multipart = [
    'file' => new CURLFile($tmp, $mime, $name),
    'document' => json_encode($document),
];

$headers = [
    'Accept: application/json',
    'Authorization: Bearer ' . $_SESSION['cp_token'],
];

$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL => $url,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_TIMEOUT => 120,
    CURLOPT_POSTFIELDS => $multipart,
    CURLOPT_HTTPHEADER => $headers,
    CURLOPT_SAFE_UPLOAD => true,
]);

$raw = curl_exec($ch);
$cerr = curl_error($ch);
$status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($cerr) {
    cp_json(500, ['status' => 'error', 'message' => 'Upload failed: ' . $cerr]);
}

$data = json_decode($raw, true);
if (json_last_error() !== JSON_ERROR_NONE) {
    cp_json(500, ['status' => 'error', 'message' => 'Invalid response from server', 'raw' => $raw]);
}

if ($status >= 200 && $status < 300) {
    cp_json(200, ['status' => 'success', 'httpCode' => $status, 'data' => $data]);
}

$msg = is_array($data) ? ($data['message'] ?? 'Upload rejected') : 'Upload rejected';
cp_json($status >= 400 && $status < 600 ? $status : 400, [
    'status' => 'error',
    'message' => $msg,
    'httpCode' => $status,
    'details' => $data,
]);
