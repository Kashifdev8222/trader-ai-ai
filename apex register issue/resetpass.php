<?php
declare(strict_types=1);

require_once __DIR__ . '/lib/cp_routes.php';
cp_redirect_if_logged_in();

$token = trim((string)($_GET['token'] ?? ''));
$lang = trim((string)($_GET['lang'] ?? 'en'));
$htmlLang = preg_match('/^[a-z]{2}(-[a-z]{2})?$/i', $lang) ? $lang : 'en';
$hasToken = $token !== '';
?>
<!doctype html>
<html lang="<?php echo htmlspecialchars($htmlLang, ENT_QUOTES, 'UTF-8'); ?>">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <base href="/"/>
  <title>Reset password | Apex AI Activation</title>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet"/>
  <link rel="icon" type="image/png" href="/assets/images/favicon.png">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet"/>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css">
  <link rel="stylesheet" href="assets/css/styles.css?v=authui9"/>
  <link rel="stylesheet" href="assets/css/resetpass.css?v=rp5"/>
</head>
<body class="auth-body auth-body--resetpass">

  <div class="vp-center auth-wrapper auth-page-stage auth-page-stage--resetpass show">
    <div class="portal-shell portal-shell--resetpass">
      <div class="auth-card auth-card--resetpass">

        <div class="rp-brand">
          <img src="assets/images/logo.png" alt="Apex AI Activation" width="140" height="auto">
        </div>

        <?php if (!$hasToken): ?>
        <h1 class="rp-title">Link not valid</h1>
        <p class="rp-sub">This link is missing a token or has expired.</p>
        <a href="/login" class="btn btn-primary w-100 portal-btn-main auth-form-submit">Back to sign in</a>
        <?php else: ?>
        <h1 class="rp-title">Reset password</h1>
        <p class="rp-sub">Enter and confirm your new password.</p>

        <form id="resetPassForm" class="portal-form compact auth-form rp-form" novalidate autocomplete="off">
          <input type="hidden" name="token" id="resetToken" value="<?php echo htmlspecialchars($token, ENT_QUOTES, 'UTF-8'); ?>">
          <input type="hidden" name="lang" id="resetLang" value="<?php echo htmlspecialchars($htmlLang, ENT_QUOTES, 'UTF-8'); ?>">

          <div class="mb-2">
            <label for="newPassword" class="form-label auth-label">New password</label>
            <div class="password-group">
              <input type="password" id="newPassword" name="newPassword"
                     class="form-control portal-input"
                     placeholder="New password" required minlength="8" autocomplete="new-password">
              <button class="portal-eye-btn" type="button" id="toggleNewPwd" aria-label="Show or hide new password">
                <i class="bi bi-eye-slash"></i>
              </button>
            </div>
          </div>

          <div class="mb-2">
            <label for="confirmPassword" class="form-label auth-label">Confirm password</label>
            <div class="password-group">
              <input type="password" id="confirmPassword" name="confirmPassword"
                     class="form-control portal-input"
                     placeholder="Confirm password" required minlength="8" autocomplete="new-password">
              <button class="portal-eye-btn" type="button" id="toggleConfirmPwd" aria-label="Show or hide confirm password">
                <i class="bi bi-eye-slash"></i>
              </button>
            </div>
          </div>

          <div id="resetPassMsg" class="auth-form-feedback tiny text-center" role="status" aria-live="polite"></div>

          <button type="submit" class="btn btn-primary w-100 portal-btn-main auth-form-submit" id="resetPassSubmit">
            Reset my password
          </button>

          <p class="rp-login-link text-center">
            <a href="/login" class="link-button link-button--inline text-decoration-underline">Back to sign in</a>
          </p>
        </form>
        <?php endif; ?>

      </div>
    </div>
  </div>

  <script src="assets/js/resetpass.js?v=rp3"></script>
</body>
</html>
