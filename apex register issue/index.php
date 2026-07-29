<?php
require_once __DIR__ . '/lib/cp_routes.php';
require_once __DIR__ . '/lib/cp_replain.php';
cp_redirect_if_logged_in();
$cpInitialAuth = cp_auth_view_from_request();
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <!-- Required for /login, /register, /forgot-password: keeps api/ rooted at site / -->
  <base href="/"/>
  <title>ClientZone | Apex AI Activation</title>

  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet"/>
<link rel="icon" type="image/png" href="assets/images/favicon.png">
  <!-- Bootstrap 5 -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet"/>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css">

  <!-- intl-tel-input + jQuery UI (for the phone control) -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/css/intlTelInput.css"/>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.css"/>

  <link rel="stylesheet" href="assets/css/styles.css?v=authui8"/>
</head>
<body class="auth-body">

  <!-- SPLASH / LAUNCH SCREEN -->
  <div id="splashScreen" class="splash-screen">
    <div class="splash-inner text-center">
      <div class="splash-logo">
        <img src="assets/images/logo.png" alt="ClientZone | Apex AI Activation">
      </div>
      <!--<div class="splash-title">Riseeth</div>-->
    </div>
  </div>

  <!-- MAIN AUTH WRAPPER -->
  <div class="vp-center auth-wrapper auth-page-stage d-none">
    <div class="portal-shell">

      <!-- LOGIN VIEW — layout aligned with login.html (hero robot → brand → title → form) -->
      <div id="loginView" class="swap show" role="region" aria-label="Login">
        <div class="auth-login-layout">
          <div class="auth-card auth-card--login">
          <div class="auth-login-hero" aria-hidden="true">
            <img src="assets/images/auth-login-hero.svg" alt="" class="auth-login-hero__robot" width="128" height="117" decoding="async">
          </div>

          <div class="auth-login-body">
          <div class="brand-block">
            <div class="brand-logo-circle">
              <img src="assets/images/logo.png" alt="ApexaiActivation">
            </div>
          </div>
          <form id="loginForm" class="portal-form compact auth-form auth-login-form" novalidate>
            <div class="mb-3">
              <label for="loginEmail" class="form-label auth-label">Email</label>
              <input type="email" id="loginEmail" name="email"
                     class="form-control portal-input"
                     placeholder="e.g: Johndoe@gmail.com" aria-label="Email" required>
            </div>

            <div class="mb-2">
              <label for="loginPassword" class="form-label auth-label">Password</label>
              <div class="password-group">
                <input type="password" id="loginPassword" name="password"
                       class="form-control portal-input"
                       placeholder="••••••••" aria-label="Password" required>
                <button class="portal-eye-btn" type="button" id="toggleLoginPwd" aria-label="Show or hide password">
                  <i class="bi bi-eye-slash"></i>
                </button>
              </div>
            </div>

            <div class="d-flex justify-content-end mb-3 auth-forgot-row">
              <a href="javascript:void(0)" id="goForgot" class="forgot-link">
                Forgot Password?
              </a>
            </div>

            <button class="btn btn-primary w-100 portal-btn-main auth-form-submit mb-0" type="submit">
              Sign in
            </button>

            <div id="loginError" class="auth-form-feedback auth-form-feedback--error tiny text-center" role="alert" aria-live="assertive"></div>

            <div class="text-center auth-switch auth-switch--footer">
              <span>New user? </span>
              <button type="button" id="goRegister"
                      class="link-button link-button--inline text-decoration-underline">
                Sign up
              </button>
            </div>
          </form>
          </div>
          </div>
        </div>
      </div>

      <!-- REGISTER VIEW -->
      <div id="registerView" class="swap" role="region" aria-label="Register">
        <div class="auth-card auth-card--stack">
          <div class="brand-block">
            <div class="brand-logo-circle">
              <img src="assets/images/logo.png" alt="Riseeth logo">
            </div>
            <!--<span class="brand-name">Riseeth</span>-->
          </div>

          <form id="registerForm" class="portal-form compact auth-form" autocomplete="off" novalidate>
            <div class="mb-3">
              <label for="fullName" class="form-label auth-label">Full name</label>
              <input id="fullName" name="fullName" type="text"
                     class="form-control portal-input"
                     placeholder="John Doe"
                     aria-label="Full name" required />
            </div>

            <div class="mb-3">
              <label for="regEmail" class="form-label auth-label">Email</label>
              <input id="regEmail" name="email" type="email"
                     class="form-control portal-input"
                     placeholder="e.g: Johndoe@gmail.com"
                     aria-label="Email" required />
              <div id="emailError" class="text-danger tiny mt-1"></div>
            </div>

            <div class="mb-3">
              <label for="regPassword" class="form-label auth-label">Password</label>
              <div class="password-group">
                <input id="regPassword" name="password" type="password"
                       class="form-control portal-input"
                       placeholder="••••••••"
                       aria-label="Password" required />
                <button class="portal-eye-btn" type="button" id="toggleRegPwd" aria-label="Show or hide password">
                  <i class="bi bi-eye-slash"></i>
                </button>
              </div>
            </div>

            <div class="mb-3">
              <label for="birthDate" class="form-label auth-label">DOB</label>
              <input id="birthDate" name="birthDate" type="date"
                     class="form-control portal-input"
                     aria-label="Birth date" required />
            </div>

            <div class="mb-3">
              <label for="phone" class="form-label auth-label">Phone Number</label>
              <input id="phone" name="phone" type="tel"
                     class="form-control portal-input"
                     placeholder="Enter Phone Number"
                     aria-label="Phone number" required />
              <div id="phoneError" class="text-danger tiny mt-1"></div>
            </div>

            <button type="submit" class="btn btn-primary w-100 portal-btn-main auth-form-submit">
              Sign up
            </button>

            <div id="registerMsg" class="auth-form-feedback tiny text-center" role="status" aria-live="polite"></div>

            <div class="text-center auth-switch auth-switch--footer">
              <span>Already a member? </span>
              <button type="button" id="goLogin"
                      class="link-button link-button--inline text-decoration-underline">
                Sign in
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- FORGOT PASSWORD VIEW -->
      <div id="forgotView" class="swap" role="region" aria-label="Forgot Password">
        <div class="auth-card auth-card--stack">
          <div class="brand-block">
            <div class="brand-logo-circle">
              <img src="assets/images/logo.png" alt="Riseeth logo">
            </div>
            <!--<span class="brand-name">Riseeth</span>-->
          </div>

          <header class="auth-view-head">
            <h1 class="auth-view-title">Forgot password</h1>
            <p class="auth-view-sub">Enter your email and we will send you a reset link</p>
          </header>

          <form id="forgotForm" class="portal-form compact auth-form" novalidate>
            <div class="mb-3">
              <label for="forgotEmail" class="form-label auth-label">Email</label>
              <input type="email" id="forgotEmail"
                     class="form-control portal-input"
                     placeholder="e.g: Johndoe@gmail.com" aria-label="Email" required>
            </div>

            <button type="submit" id="forgotSubmit"
                    class="btn btn-primary w-100 portal-btn-main auth-form-submit">
              Send reset link
            </button>

            <div id="forgotMsg" class="auth-form-feedback tiny text-center" role="status" aria-live="polite"></div>

            <div class="text-center auth-switch auth-switch--footer">
              <button type="button" id="backToLogin"
                      class="link-button link-button--inline text-decoration-underline">
                Back to sign in
              </button>
            </div>
          </form>
        </div>
      </div>

    </div>
  </div>

  <!-- Preloader (login / register / forgot — toggled from app.js) -->
  <div id="preloader" class="preloader d-none" aria-busy="true" aria-live="polite" aria-label="Loading">
    <div class="preloader__backdrop"></div>
    <div class="preloader__inner">
      <div class="preloader__card">
        <img src="assets/images/logo.png" alt="" class="preloader__logo" width="100" height="auto"/>
        <div class="preloader__spinner" aria-hidden="true"></div>
        <p class="preloader__text">Loading…</p>
      </div>
    </div>
  </div>

  <!-- Scripts -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
  <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/intlTelInput.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js"></script>
  <script>window.CP_INITIAL_AUTH_VIEW = <?php echo json_encode($cpInitialAuth, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT); ?>;</script>
  <script src="assets/js/cp-router.js?v=rt2"></script>
  <script src="assets/js/cp-replain.js?v=rp1"></script>
  <script src="assets/js/cp-user-device.js?v=ud5"></script>
  <script>
    window.replainSettings = { id: <?php echo json_encode(CP_REPLAIN_WIDGET_ID, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT); ?> };
    (function (u) {
      var s = document.createElement('script');
      s.async = true;
      s.src = u;
      var x = document.getElementsByTagName('script')[0];
      x.parentNode.insertBefore(s, x);
    })('https://widget.replain.cc/dist/client.js');
  </script>
  <script src="assets/js/app.js?v=authui16"></script>
</body>
</html>
