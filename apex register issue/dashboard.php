<?php
// dashboard.php
require_once __DIR__ . '/lib/cp_routes.php';
session_start();
if (empty($_SESSION['cp_token']) || empty($_SESSION['cp_user'])) {
    header('Location: /login', true, 302);
    exit;
}
$cpInitialDashboardView = cp_dashboard_view_from_request();
$CP_USER = $_SESSION['cp_user'];

require_once __DIR__ . '/lib/cp_ai_onboarding_store.php';
$cpAiOnboardServerCompleted = cp_ai_onboarding_is_completed($CP_USER['userId'] ?? null);
$cpMustChangePassword = !empty($_SESSION['cp_must_change_password']);

$first = trim($CP_USER['firstName'] ?? '');
$last  = trim($CP_USER['lastName'] ?? '');
$fullName = trim(($CP_USER['firstName'] ?? '') . ' ' . ($CP_USER['lastName'] ?? ''));

// initials (e.g. Hassan Izhar -> HI)
$initials = '';
if ($first !== '') $initials .= strtoupper(substr($first, 0, 1));
if ($last  !== '') $initials .= strtoupper(substr($last, 0, 1));
if ($initials === '') $initials = 'JD';
if ($fullName === '') $fullName = 'John Doe';
$cpEmail = trim($CP_USER['email'] ?? '');

require_once __DIR__ . '/lib/cp_replain.php';
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <!-- Required for /dashboard/* paths: keeps api/ and assets/ rooted at site / -->
  <base href="/"/>
  <title>Clizone</title>
<link rel="icon" type="image/png" href="/assets/images/favicon.png">

  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet"/>

  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet"/>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css">
  <link rel="stylesheet" href="assets/css/dashboard.css?v=dash49"/>
  <link rel="stylesheet" href="assets/css/cp-ai-onboarding.css?v=aiob4"/>
  <link rel="stylesheet" href="assets/css/tabs/ai-setting.tab.css?v=ai22"/>
  <link rel="stylesheet" href="assets/css/tabs/web-trader.tab.css?v=wt11"/>
  <link rel="stylesheet" href="assets/css/tabs/embed-frame.tab.css?v=emb6"/>
  <!--<link rel="stylesheet" href="assets/css/tab-deposit.css"/>-->
  <link rel="stylesheet" href="assets/css/tabs/deposit.tab.css?v=dep15"/>
  <link rel="stylesheet" href="assets/css/tabs/withdraw.tab.css?v=wd37"/>
  <link rel="stylesheet" href="assets/css/tabs/verification.tab.css?v=ver37"/>
  <link rel="stylesheet" href="assets/css/tabs/profile.tab.css?v=prof5"/>
  <link rel="stylesheet" href="assets/css/tabs/support.tab.css?v=sup58"/>
  <!-- Home tab loads before Trading Account so TA layout/CSS wins on equal specificity -->
  <link rel="stylesheet" href="assets/css/tabs/home.tab.css?v=dash44"/>
  <link rel="stylesheet" href="assets/css/tabs/trading-account.tab.css?v=ta20"/>
</head>
<body class="cp-dashboard-body" data-bs-theme="light">

<script>
  window.CP_USER = <?php echo json_encode($CP_USER, JSON_UNESCAPED_SLASHES); ?>;
  window.CP_AI_ONBOARD_SERVER_COMPLETED = <?php echo $cpAiOnboardServerCompleted ? 'true' : 'false'; ?>;
  window.CP_MUST_CHANGE_PASSWORD = <?php echo $cpMustChangePassword ? 'true' : 'false'; ?>;
</script>

<!-- Global preloader (shown until first view ready; then fetch / tab switches) -->
<div id="cpPreloader" class="cp-preloader is-visible" aria-busy="true" aria-live="polite" aria-label="Loading">
  <div class="cp-preloader__backdrop"></div>
  <div class="cp-preloader__inner">
    <div class="cp-preloader__card">
      <img src="assets/images/logo.png" alt="" class="cp-preloader__logo" width="120" height="auto"/>
      <div class="cp-preloader__spinner" aria-hidden="true"></div>
      <p class="cp-preloader__text">Loading…</p>
    </div>
  </div>
</div>

<!-- Chrome header: #F2F2F2 — brand | title + notify + user -->
<header class="cp-chrome-header" role="banner">
  <div class="cp-chrome-header__brand">
    <img src="assets/images/logo.png" alt="Clizone" class="cp-chrome-logo"/>
  </div>
  <div class="cp-chrome-header__main">
    <button type="button" class="cp-chrome-menu-btn" id="sidebarToggle" aria-label="Open menu">
      <i class="bi bi-list"></i>
    </button>
    <h1 class="cp-chrome-page-title"><span id="activeTabName">Dashboard</span></h1>
    <div class="cp-chrome-actions">
      <div class="cp-chrome-actions-lead">
        <?php if ($cpMustChangePassword): ?>
        <button type="button" class="cp-header-pw-chip" id="cpMustChangeOpenModal" title="Set a new password — temporary password is filled for you">
          <i class="bi bi-key-fill" aria-hidden="true"></i>
          <span class="cp-header-pw-chip__text">Set password</span>
          <span class="cp-header-pw-chip__pulse" aria-hidden="true"></span>
        </button>
        <?php endif; ?>
        <div class="cp-chrome-change-pw-wrap">
          <span class="cp-chrome-change-pw-hint" id="cpHeaderChangePasswordHint">Update your sign-in password</span>
          <button type="button" class="cp-chrome-change-pw" id="cpHeaderChangePassword" title="Choose a new sign-in password" aria-label="Set your password" aria-describedby="cpHeaderChangePasswordHint" data-bs-toggle="modal" data-bs-target="#changePassModal">
            <i class="bi bi-key" aria-hidden="true"></i>
            <span class="cp-chrome-change-pw__text">Set your password</span>
          </button>
        </div>
      </div>
      <div class="cp-chrome-actions-trail">
        <div class="dropdown">
          <button type="button" class="cp-chrome-notify" id="cpNotifyBtn" data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-expanded="false" aria-label="Notifications">
            <i class="bi bi-bell"></i>
            <span class="topbar-badge" id="cpNotifyBadge" hidden></span>
          </button>
          <div class="dropdown-menu dropdown-menu-end shadow-sm cp-notify-dropdown" id="cpNotifyPanel" aria-labelledby="cpNotifyBtn">
            <div class="cp-notify-dropdown__head px-3 py-2">Notifications</div>
            <div class="cp-notify-dropdown__body" id="cpNotifyList">
              <div class="cp-notify-empty px-3 py-4 text-center text-muted small" id="cpNotifyEmpty">No notifications yet</div>
            </div>
          </div>
        </div>
        <div class="dropdown cp-chrome-profile-wrap">
          <button type="button" class="cp-chrome-user cp-chrome-user--toggle" id="cpProfileBtn" data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-expanded="false" aria-haspopup="true" aria-label="Account menu" title="<?php echo htmlspecialchars($fullName); ?>">
            <div class="cp-chrome-avatar"><?php echo htmlspecialchars($initials); ?></div>
          </button>
          <div class="dropdown-menu dropdown-menu-end shadow-sm cp-profile-dropdown" aria-labelledby="cpProfileBtn">
            <div class="cp-profile-dropdown__head">
              <div class="cp-profile-name" id="cpProfileName"><?php echo htmlspecialchars($fullName); ?></div>
              <div class="cp-profile-email text-muted" id="cpProfileEmail"><?php echo htmlspecialchars($cpEmail !== '' ? $cpEmail : '—'); ?></div>
            </div>
            <div class="dropdown-divider my-0"></div>
            <button type="button" class="dropdown-item cp-profile-action<?php echo $cpMustChangePassword ? ' cp-profile-action--pulse' : ''; ?>" id="cpOpenChangePassword"<?php echo $cpMustChangePassword ? ' aria-current="true"' : ''; ?>>
              <i class="bi bi-key" aria-hidden="true"></i>
              <span>Set your password</span>
            </button>
            <a class="dropdown-item cp-profile-action cp-profile-action--logout" href="/logout">
              <i class="bi bi-box-arrow-right" aria-hidden="true"></i>
              <span>Log out</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</header>

<!-- Mobile password bar - shows only on screens below 768px -->
<div class="cp-mobile-password-bar">
  <?php if ($cpMustChangePassword): ?>
  <button type="button" class="cp-header-pw-chip-mobile" id="cpMustChangeOpenModalMobile" title="Set a new password">
    <i class="bi bi-key-fill" aria-hidden="true"></i>
    <span>Set password</span>
  </button>
  <?php endif; ?>
  <div class="cp-mobile-password-content">
    <span class="cp-mobile-password-hint">Update your password</span>
    <button type="button" class="cp-mobile-password-btn" id="cpMobileChangePassword" data-bs-toggle="modal" data-bs-target="#changePassModal">
      <i class="bi bi-key" aria-hidden="true"></i>
      <span>Set your password</span>
    </button>
  </div>
</div>

<div class="sidebar-backdrop" aria-hidden="true"></div>

<!-- ===== LAYOUT: sidebar + main content ===== -->
<div class="cp-layout">
  <!-- Sidebar wrapper -->
  <aside id="sidebar" class="sidebar">
    <!--<button class="close-sidebar d-md-none" type="button">&times;</button>-->

    <?php include __DIR__ . '/assets/partials/sidebar-nav.php'; ?>
  </aside>

  <!-- ===== MAIN CONTENT: placeholders ===== -->
  <main id="mainContent">
        <section class="view show view-home-dash" data-view="home">
          <div id="home-view-root"></div>
        </section>

    <section class="view view-ta" data-view="trading-account">
      <div id="trading-account-root"></div>
    </section>

    <section class="view view-deposit" data-view="deposit">
      <?php include __DIR__ . '/assets/views/deposit/deposit.html'; ?>
    </section>

    <section class="view view-withdraw" data-view="withdraw">
      <?php include __DIR__ . '/assets/views/withdraw/withdraw.html'; ?>
    </section>

    <section class="view view-verification" data-view="verification">
      <?php include __DIR__ . '/assets/views/verification/verification.html'; ?>
    </section>

    <section class="view" data-view="analysis-technical"></section>

    <section class="view" data-view="analysis-calendar"></section>

    <section class="view" data-view="analysis-news"></section>

    <section class="view view-ai-setting" data-view="ai-setting">
      <?php include __DIR__ . '/assets/views/ai-setting/ai-setting.html'; ?>
    </section>


   <section class="view" data-view="web-trader">
      <div id="web-trader-view-root">
        <?php include __DIR__ . '/assets/views/web-trader/web-trader.html'; ?>
      </div>
    </section>



    <section class="view view-settings-profile" data-view="settings-profile">
      <?php include __DIR__ . '/assets/views/settings/profile.html'; ?>
    </section>

    <section class="view" data-view="settings-questionnaire">
      <div class="content-card">
        <h5>Questionnaire</h5>
        <p>Questionnaire settings placeholder.</p>
      </div>
    </section>

    <section class="view view-support" data-view="support">
      <?php include __DIR__ . '/assets/views/support/support.html'; ?>
    </section>

    <section class="view" data-view="help"></section>
  </main>
</div>

<?php include __DIR__ . '/assets/partials/ai-onboarding-modal.php'; ?>

<!-- Set password modal (same API: old + new password) -->
<div class="modal fade" id="changePassModal" tabindex="-1" aria-labelledby="changePassModalTitle" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable prof-change-pass-dialog">
    <div class="modal-content cp-modal">
      <div class="modal-header border-0">
        <h5 class="modal-title fw-semibold" id="changePassModalTitle">Set your password</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>

      <div class="modal-body">
        <form id="changePassForm" class="prof-pass-form" autocomplete="off">
          <p id="cpTempPassHint" class="cp-temp-pass-hint d-none small mb-3" role="note" data-cp-hint-default="Enter and confirm your new password below.">Enter and confirm your new password below.</p>
          <div class="prof-pass-field mb-2 d-none" id="oldPassFieldGroup" aria-hidden="true">
            <label for="oldPass" class="prof-pass-label" id="oldPassLabel">Current password</label>
            <div class="prof-pass-input-wrap" id="oldPassInputWrap">
              <input type="password" id="oldPass" class="form-control portal-input prof-pass-input" placeholder="Current password" autocomplete="current-password">
              <button class="prof-pass-toggle" type="button" id="cpOldPassToggle" data-pass-toggle data-target="#oldPass" aria-label="Show current password">
                <i class="bi bi-eye"></i>
              </button>
            </div>
          </div>

          <div class="prof-pass-field mb-2">
            <label for="newPass" class="prof-pass-label">Password</label>
            <div class="prof-pass-input-wrap">
              <input type="password" id="newPass" class="form-control portal-input prof-pass-input" placeholder="New password" required>
              <button class="prof-pass-toggle" type="button" data-pass-toggle data-target="#newPass" aria-label="Show password">
                <i class="bi bi-eye"></i>
              </button>
            </div>
          </div>

          <div class="prof-pass-field mb-2">
            <label for="confirmPass" class="prof-pass-label">Confirm password</label>
            <div class="prof-pass-input-wrap">
              <input type="password" id="confirmPass" class="form-control portal-input prof-pass-input" placeholder="Confirm password" required>
              <button class="prof-pass-toggle" type="button" data-pass-toggle data-target="#confirmPass" aria-label="Show confirm password">
                <i class="bi bi-eye"></i>
              </button>
            </div>
          </div>

          <input type="email" id="passEmail" class="d-none" aria-hidden="true"/>
          <div class="prof-pass-actions mt-3">
            <button type="button" class="btn btn-link prof-pass-action-cancel" data-bs-dismiss="modal">Cancel</button>
            <button type="submit" class="btn portal-btn prof-pass-action-submit">Set password</button>
          </div>
          <div id="passMsg" class="small mt-2 text-center" role="status" aria-live="polite"></div>
        </form>
      </div>
    </div>
  </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
<script src="assets/js/lib/cp-pagination.js?v=cp1"></script>
<script src="assets/js/cp_ai_ticket_message.js?v=ait1"></script>
<script src="assets/js/cp-ai-onboarding.js?v=aiob4"></script>
<script>window.CP_INITIAL_DASHBOARD_VIEW = <?php echo json_encode($cpInitialDashboardView, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT); ?>;</script>
<script src="assets/js/cp-router.js?v=rt2"></script>
<script src="assets/js/cp-replain.js?v=rp1"></script>
<script src="assets/js/cp-user-device.js?v=ud5"></script>
<script src="assets/js/dashboard.js?v=device6"></script>
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
</body>
</html>
