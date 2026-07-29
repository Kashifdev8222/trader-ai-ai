<?php
require_once __DIR__ . '/api/http_client.php';
cp_clear_session_token();
session_unset();
session_destroy();
// Clear client skip flag so AI onboarding can show again on next login (until completed on server).
header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>Signing out…</title>
</head>
<body>
<script>
  try { sessionStorage.removeItem('cp_ai_onboard_skipped'); } catch (e) {}
  location.replace('/login');
</script>
<noscript><meta http-equiv="refresh" content="0;url=/login"/></noscript>
<p style="font-family:'Space Grotesk','Poppins',system-ui,sans-serif;padding:1rem">Signing out… <a href="/login">Continue</a></p>
</body>
</html>
<?php
exit;
