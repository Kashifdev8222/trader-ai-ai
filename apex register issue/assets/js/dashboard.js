/* assets/js/dashboard.js
   Global shell: login guard, sidebar (desktop+mobile),
   tab switching + lazy tab init.
*/

/**
 * Full-screen preloader:
 * - Boot: visible in HTML until hideBoot() after first route is ready.
 * - After boot: only while a tab’s .js bundle is downloading (not during routine API calls —
 *   a global fetch hook would wait for every parallel request and felt “stuck”).
 * Use CP_preloader.wrap(promise) for a specific long action if needed.
 */
window.CP_preloader = (function () {
  let depth = 0;
  let showTimer = null;
  let bootComplete = false;
  let overlayShown = false;
  const DELAY_MS = 50;
  const MIN_VISIBLE_MS = 0;
  let shownAt = 0;

  function getEl() {
    return document.getElementById('cpPreloader');
  }

  function showOverlayNow() {
    const el = getEl();
    if (!el) return;
    el.classList.add('is-visible');
    el.setAttribute('aria-busy', 'true');
    shownAt = Date.now();
    overlayShown = true;
  }

  function hideOverlayNow() {
    const el = getEl();
    if (!el) return;
    const finish = () => {
      el.classList.remove('is-visible');
      el.setAttribute('aria-busy', 'false');
      overlayShown = false;
      shownAt = 0;
    };
    if (!overlayShown || !shownAt) {
      finish();
      return;
    }
    const wait = Math.max(0, MIN_VISIBLE_MS - (Date.now() - shownAt));
    if (wait <= 0) finish();
    else setTimeout(finish, wait);
  }

  function armShowTimer() {
    clearTimeout(showTimer);
    showTimer = setTimeout(() => {
      showTimer = null;
      if (depth > 0) showOverlayNow();
    }, DELAY_MS);
  }

  function enter() {
    if (!bootComplete) return;
    depth++;
    if (depth === 1) armShowTimer();
  }

  function leave() {
    if (!bootComplete) return;
    depth = Math.max(0, depth - 1);
    if (depth > 0) return;
    clearTimeout(showTimer);
    showTimer = null;
    if (!overlayShown) return;
    hideOverlayNow();
  }

  function hideBoot() {
    bootComplete = true;
    clearTimeout(showTimer);
    showTimer = null;
    depth = 0;
    const el = getEl();
    if (el) {
      el.classList.remove('is-visible');
      el.setAttribute('aria-busy', 'false');
    }
    overlayShown = false;
    shownAt = 0;
  }

  function wrap(promise) {
    enter();
    return Promise.resolve(promise).finally(() => leave());
  }

  return {
    enter,
    leave,
    hideBoot,
    wrap,
    get bootComplete() {
      return bootComplete;
    }
  };
})();

/**
 * Expired or invalid API token: upstream returns 401 → send user to login with a clean session.
 * Excludes change_password.php so a wrong current password can show an error without logging out.
 */
(function () {
  const origFetch = window.fetch.bind(window);
  const SKIP_401_REDIRECT = /change_password\.php/i;
  window.fetch = function (input, init) {
    return origFetch(input, init).then((res) => {
      if (res.status !== 401) return res;
      let urlStr = '';
      try {
        if (typeof input === 'string') urlStr = input;
        else if (input && typeof input.url === 'string') urlStr = input.url;
      } catch (e) {
        /* ignore */
      }
      let abs;
      try {
        abs = new URL(
          urlStr || '',
          window.CP_ROUTER?.siteBaseUrl?.() || window.location.origin + '/'
        );
      } catch (e2) {
        return res;
      }
      if (abs.origin !== window.location.origin) return res;
      const path = abs.pathname || '';
      if (path.indexOf('/api/') === -1) return res;
      if (SKIP_401_REDIRECT.test(path)) return res;
      window.location.assign('/logout');
      return res;
    });
  };
})();

document.addEventListener('DOMContentLoaded', async () => {
  if (!window.CP_USER || !window.CP_USER.userId) {
    window.location.assign('/login');
    return;
  }

  // Prefill change-password email
  const passEmailEl = document.getElementById('passEmail');
  if (passEmailEl) passEmailEl.value = CP_USER.email || '';

  function syncProfileDropdown() {
    const u = window.CP_USER;
    if (!u) return;
    const f = [u.firstName, u.lastName].map((s) => String(s || '').trim()).filter(Boolean).join(' ');
    const nameEl = document.getElementById('cpProfileName');
    const emailEl = document.getElementById('cpProfileEmail');
    if (nameEl) nameEl.textContent = f || '—';
    if (emailEl) emailEl.textContent = String(u.email || '').trim() || '—';
  }
  syncProfileDropdown();

  /** When current password is injected from session, hide eye toggle and block reveal. */
  function setOldPassRevealLocked(locked) {
    const oldPass = document.getElementById('oldPass');
    const wrap = document.getElementById('oldPassInputWrap');
    const toggle = document.getElementById('cpOldPassToggle');
    wrap?.classList.toggle('prof-pass-input-wrap--no-toggle', !!locked);
    if (oldPass) {
      oldPass.classList.toggle('cp-old-pass-locked', !!locked);
      if (locked) {
        oldPass.setAttribute('autocomplete', 'off');
        if (oldPass.type === 'text') oldPass.type = 'password';
      } else {
        oldPass.setAttribute('autocomplete', 'current-password');
      }
    }
    if (toggle) {
      toggle.hidden = !!locked;
      toggle.setAttribute('aria-hidden', locked ? 'true' : 'false');
      toggle.tabIndex = locked ? -1 : 0;
      if (locked) {
        const icon = toggle.querySelector('.bi');
        if (icon) {
          icon.classList.add('bi-eye');
          icon.classList.remove('bi-eye-slash');
        }
        toggle.setAttribute('aria-label', 'Current password cannot be shown');
      } else {
        toggle.setAttribute('aria-label', 'Show current password');
      }
    }
  }

  function prepareChangePasswordModalForFirstLogin() {
    const oldPass = document.getElementById('oldPass');
    const hint = document.getElementById('cpTempPassHint');
    const label = document.getElementById('oldPassLabel');
    const fieldGroup = document.getElementById('oldPassFieldGroup');
    const pw = window.CP_USER && window.CP_USER.portalPassword ? String(window.CP_USER.portalPassword) : '';
    const must = !!window.CP_MUST_CHANGE_PASSWORD;
    /** Session has current password — hide field in UI; API still receives it on submit. */
    const hideOldField = !!pw;

    if (fieldGroup) {
      fieldGroup.classList.toggle('d-none', hideOldField);
      fieldGroup.setAttribute('aria-hidden', hideOldField ? 'true' : 'false');
    }
    if (oldPass) {
      if (hideOldField) oldPass.removeAttribute('required');
      else oldPass.setAttribute('required', 'required');
    }

    if (must && pw) {
      if (hint) {
        const def = hint.getAttribute('data-cp-hint-default') || 'Enter and confirm your new password below.';
        hint.textContent = def;
        hint.classList.remove('d-none');
      }
      if (label) label.textContent = 'Current password';
      if (oldPass) {
        oldPass.value = pw;
        oldPass.readOnly = true;
      }
      setOldPassRevealLocked(true);
    } else if (must && !pw) {
      if (hint) {
        hint.textContent =
          'Paste your temporary password below, then choose your new password.';
        hint.classList.remove('d-none');
      }
      if (label) label.textContent = 'Current password';
      if (oldPass) {
        oldPass.readOnly = false;
        oldPass.value = '';
      }
      setOldPassRevealLocked(false);
    } else if (pw) {
      if (hint) {
        hint.classList.add('d-none');
      }
      if (label) label.textContent = 'Current password';
      if (oldPass) {
        oldPass.value = pw;
        oldPass.readOnly = true;
      }
      setOldPassRevealLocked(true);
    } else {
      if (hint) {
        const def = hint.getAttribute('data-cp-hint-default');
        if (def) hint.textContent = def;
        hint.classList.add('d-none');
      }
      if (label) label.textContent = 'Current password';
      if (oldPass) {
        oldPass.readOnly = false;
        oldPass.value = '';
      }
      setOldPassRevealLocked(false);
    }
  }

  function openChangePasswordModal() {
    const profileBtn = document.getElementById('cpProfileBtn');
    if (typeof bootstrap !== 'undefined' && profileBtn) {
      try {
        const dd = bootstrap.Dropdown.getInstance(profileBtn);
        dd?.hide();
      } catch {
        /* ignore */
      }
    }
    const modalEl = document.getElementById('changePassModal');
    if (!modalEl || typeof bootstrap === 'undefined') return;
    try {
      bootstrap.Modal.getOrCreateInstance(modalEl).show();
    } catch {
      /* ignore */
    }
  }

  function clearMustChangePasswordUi() {
    document.getElementById('cpMustChangeOpenModal')?.remove();
    window.CP_MUST_CHANGE_PASSWORD = false;
    if (window.CP_USER) delete window.CP_USER.portalPassword;
    const ddBtn = document.getElementById('cpOpenChangePassword');
    if (ddBtn) {
      ddBtn.classList.remove('cp-profile-action--pulse');
      ddBtn.removeAttribute('aria-current');
    }
  }

  document.getElementById('cpOpenChangePassword')?.addEventListener('click', openChangePasswordModal);
  document.getElementById('cpMustChangeOpenModal')?.addEventListener('click', openChangePasswordModal);
  document.getElementById('cpHeaderChangePassword')?.addEventListener('click', openChangePasswordModal);

  // Show/Hide password in modal (eye icon inside input field)
  document.querySelectorAll('[data-pass-toggle]').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = document.querySelector(btn.getAttribute('data-target'));
      if (!target) return;
      if (target.id === 'oldPass' && target.readOnly) return;
      const to = target.type === 'password' ? 'text' : 'password';
      target.type = to;
      const icon = btn.querySelector('.bi');
      if (icon) {
        icon.classList.toggle('bi-eye', to === 'password');
        icon.classList.toggle('bi-eye-slash', to === 'text');
      }
      const fieldName = target.id === 'oldPass'
        ? 'current'
        : target.id === 'confirmPass'
          ? 'confirm'
          : 'new';
      btn.setAttribute(
        'aria-label',
        (to === 'text' ? 'Hide ' : 'Show ') + fieldName + ' password'
      );
    });
  });

  (function wireChangePassModalOnce() {
    const modal = document.getElementById('changePassModal');
    if (!modal || modal.dataset.cpChangePassModalWired === '1') return;
    modal.dataset.cpChangePassModalWired = '1';
    function resetChangePassModalUi() {
      const oldPass = document.getElementById('oldPass');
      const hint = document.getElementById('cpTempPassHint');
      const label = document.getElementById('oldPassLabel');
      const fieldGroup = document.getElementById('oldPassFieldGroup');
      setOldPassRevealLocked(false);
      if (fieldGroup) {
        fieldGroup.classList.add('d-none');
        fieldGroup.setAttribute('aria-hidden', 'true');
      }
      if (oldPass) {
        oldPass.readOnly = false;
        oldPass.value = '';
        oldPass.removeAttribute('required');
      }
      if (hint) {
        const def = hint.getAttribute('data-cp-hint-default');
        if (def) hint.textContent = def;
        hint.classList.add('d-none');
      }
      if (label) label.textContent = 'Current password';
      ['oldPass', 'newPass', 'confirmPass'].forEach((id) => {
        const inp = document.getElementById(id);
        if (inp && inp.type === 'text') inp.type = 'password';
      });
      modal.querySelectorAll('[data-pass-toggle]').forEach((btn) => {
        const icon = btn.querySelector('.bi');
        if (icon) {
          icon.classList.add('bi-eye');
          icon.classList.remove('bi-eye-slash');
        }
        const sel = btn.getAttribute('data-target');
        const target = sel ? document.querySelector(sel) : null;
        const fieldName =
          target && target.id === 'oldPass'
            ? 'current'
            : target && target.id === 'confirmPass'
              ? 'confirm'
              : 'new';
        btn.setAttribute('aria-label', 'Show ' + fieldName + ' password');
      });
      const msg = document.getElementById('passMsg');
      if (msg) {
        msg.textContent = '';
        msg.className = 'small mt-2 text-center';
      }
    }
    modal.addEventListener('hidden.bs.modal', resetChangePassModalUi);
    modal.addEventListener('show.bs.modal', prepareChangePasswordModalForFirstLogin);
    modal.addEventListener('shown.bs.modal', () => {
      const grp = document.getElementById('oldPassFieldGroup');
      const oldHidden = grp?.classList.contains('d-none');
      if (oldHidden) document.getElementById('newPass')?.focus();
      else document.getElementById('oldPass')?.focus();
    });
  })();

  const sidebar  = document.getElementById('sidebar');
  const backdrop = document.querySelector('.sidebar-backdrop');
  const closeBtn = document.querySelector('.close-sidebar');
  const toggleBtn = document.getElementById('sidebarToggle');

  /**
   * Token can expire after hours while user keeps the tab open — no fetch runs, so they stay on a dead page.
   * Ping backend to validate the active session token.
   */
  function sessionPing() {
    fetch('api/auth/session_ping.php', { credentials: 'same-origin' }).catch(() => {});
  }
  let sessionPingDebounce = null;
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible') return;
    clearTimeout(sessionPingDebounce);
    sessionPingDebounce = setTimeout(sessionPing, 400);
  });
  setInterval(sessionPing, 4 * 60 * 1000);
  setTimeout(sessionPing, 10000);

  async function loadNotifications() {
    const badge = document.getElementById('cpNotifyBadge');
    const listEl = document.getElementById('cpNotifyList');
    const emptyEl = document.getElementById('cpNotifyEmpty');
    if (!listEl) return;
    try {
      const res = await fetch('api/notifications/list.php', { credentials: 'same-origin' });
      const data = await res.json();
      if (!data || data.ok === false) return;
      const unread = Math.max(0, parseInt(String(data.unread ?? 0), 10) || 0);
      const items = Array.isArray(data.items) ? data.items : [];
      if (badge) {
        if (unread > 0) {
          badge.hidden = false;
          badge.textContent = unread > 99 ? '99+' : String(unread);
        } else {
          badge.hidden = true;
          badge.textContent = '';
        }
      }
      const existing = listEl.querySelectorAll('.cp-notify-item');
      existing.forEach(n => n.remove());
      if (emptyEl) {
        emptyEl.classList.toggle('is-hidden', items.length > 0);
      }
      items.forEach((raw) => {
        const title = typeof raw.title === 'string' ? raw.title : 'Notification';
        const body = typeof raw.body === 'string' ? raw.body : '';
        const at = typeof raw.at === 'string' ? raw.at : '';
        const row = document.createElement('div');
        row.className = 'cp-notify-item';
        row.innerHTML =
          `<div class="cp-notify-item-title">${escapeHtml(title)}</div>` +
          (body ? `<div class="small text-muted">${escapeHtml(body)}</div>` : '') +
          (at ? `<div class="cp-notify-item-meta">${escapeHtml(at)}</div>` : '');
        listEl.appendChild(row);
      });
    } catch {
      /* ignore — badge stays hidden */
    }
  }

  function escapeHtml(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  loadNotifications();
  setInterval(loadNotifications, 60000);
  window.CP_refreshNotifications = loadNotifications;

  const DESKTOP_BREAKPOINT = 992;

  function isMobile() {
    return window.innerWidth < DESKTOP_BREAKPOINT;
  }

  function syncSidebarCollapsedState() {
    if (!sidebar) return;
    const collapsedDesktop = !isMobile() && sidebar.classList.contains('collapsed');
    document.body.classList.toggle('cp-sidebar-collapsed', collapsedDesktop);
  }

  // restore collapsed state on desktop
  const savedSidebar = localStorage.getItem('cp_sidebar');
  if (savedSidebar === 'collapsed' && !isMobile()) {
    sidebar?.classList.add('collapsed');
  }
  syncSidebarCollapsedState();

  /**
   * Desktop submenu layout:
   * - default 'sidebar' = dropdown-style panel under the row, still inside #sidebar (not over main content).
   * - 'flyout' = panel beside the rail over the page (set window.CP_SIDEBAR_SUBMENU_DESKTOP = 'flyout').
   */
  const CP_SUBMENU_DESKTOP =
    typeof window.CP_SIDEBAR_SUBMENU_DESKTOP === 'string'
      ? String(window.CP_SIDEBAR_SUBMENU_DESKTOP).trim().toLowerCase()
      : 'sidebar';
  function useDesktopFlyout() {
    return !isMobile() && CP_SUBMENU_DESKTOP === 'flyout';
  }

  const mainContentEl = document.getElementById('mainContent');
  const NAV_FLYOUT_LAYER_ID = 'cpNavFlyoutLayer';

  function ensureNavFlyoutLayer() {
    let el = document.getElementById(NAV_FLYOUT_LAYER_ID);
    if (!el) {
      el = document.createElement('div');
      el.id = NAV_FLYOUT_LAYER_ID;
      el.className = 'cp-nav-flyout-layer';
      el.setAttribute('aria-hidden', 'true');
      document.body.appendChild(el);
    }
    return el;
  }

  function restoreDesktopNavFlyouts() {
    const layer = document.getElementById(NAV_FLYOUT_LAYER_ID);
    if (!layer) return;
    [...layer.querySelectorAll('.submenu')].forEach((sub) => {
      const owner = sub._cpFlyoutOwner;
      sub.classList.remove('submenu--flyout-open');
      if (owner) owner.appendChild(sub);
      delete sub._cpFlyoutOwner;
      sub.style.left = '';
      sub.style.top = '';
    });
  }

  function syncDesktopNavFlyoutDom() {
    if (!sidebar) return;
    restoreDesktopNavFlyouts();
    if (isMobile() || !useDesktopFlyout()) return;
    sidebar.querySelectorAll('.menu-item.has-sub.open').forEach((g) => {
      const sub = g.querySelector(':scope > .submenu');
      if (!sub) return;
      sub._cpFlyoutOwner = g;
      ensureNavFlyoutLayer().appendChild(sub);
      sub.classList.add('submenu--flyout-open');
    });
  }

  let sidebarFlyoutRaf = 0;
  function positionDesktopNavFlyouts() {
    if (isMobile() || !sidebar || !useDesktopFlyout()) return;
    const layer = document.getElementById(NAV_FLYOUT_LAYER_ID);
    if (!layer) return;
    sidebar.querySelectorAll('.menu-item.has-sub.open').forEach((groupItem) => {
      const submenu = [...layer.querySelectorAll('.submenu')].find((s) => s._cpFlyoutOwner === groupItem);
      if (!submenu) return;
      const row = groupItem.querySelector('.menu-main') || groupItem;
      const rowRect = row.getBoundingClientRect();
      const rail = sidebar.getBoundingClientRect();
      const gap = 8;
      const w = submenu.offsetWidth || 0;
      const collapsedRail = document.body.classList.contains('cp-sidebar-collapsed');
      /* Narrow icon-only flyout uses real width; expanded menu keeps min width for hit-testing */
      const estW = collapsedRail ? Math.max(w || 48, 48) : Math.max(w || 240, 240);
      let left = rail.right + gap;
      if (left + estW > window.innerWidth - 10) {
        left = Math.max(10, rail.left - estW - gap);
      }
      let top = rowRect.top;
      const sh = submenu.offsetHeight || 160;
      const maxBottom = window.innerHeight - 10;
      if (top + sh > maxBottom) top = Math.max(8, maxBottom - sh);
      submenu.style.left = `${Math.round(left)}px`;
      submenu.style.top = `${Math.round(top)}px`;
    });
  }

  function schedulePositionNavFlyouts() {
    cancelAnimationFrame(sidebarFlyoutRaf);
    sidebarFlyoutRaf = requestAnimationFrame(() => {
      positionDesktopNavFlyouts();
      requestAnimationFrame(() => positionDesktopNavFlyouts());
    });
  }

  function closeDesktopNavFlyouts() {
    if (isMobile()) {
      restoreDesktopNavFlyouts();
      return;
    }
    if (!sidebar) return;
    sidebar.querySelectorAll('.menu-item.has-sub.open').forEach((g) => g.classList.remove('open'));
    restoreDesktopNavFlyouts();
  }

  /** Accordion mode: drop empty flyout layer so submenus stay in-sidebar (CSS .menu-item.has-sub.open .submenu). */
  function cleanupFlyoutLayerIfAccordion() {
    if (useDesktopFlyout()) return;
    const layer = document.getElementById(NAV_FLYOUT_LAYER_ID);
    if (!layer) return;
    restoreDesktopNavFlyouts();
    layer.remove();
  }
  cleanupFlyoutLayerIfAccordion();

  // === Mobile sidebar overlay helpers ===
  function openMobile() {
    document.body.classList.add('sidebar-open');
    sidebar?.classList.add('show');
  }
  function closeMobile() {
    document.body.classList.remove('sidebar-open');
    sidebar?.classList.remove('show');
  }

  // Single hamburger button controls both desktop collapse and mobile overlay

  toggleBtn?.addEventListener('click', e => {
    e.preventDefault();
    if (isMobile()) {
      if (sidebar?.classList.contains('show')) closeMobile();
      else openMobile();
      return;
    }
    sidebar?.classList.toggle('collapsed');
    closeDesktopNavFlyouts();
    try {
      localStorage.setItem('cp_sidebar', sidebar?.classList.contains('collapsed') ? 'collapsed' : 'expanded');
    } catch {
      /* ignore */
    }
    syncSidebarCollapsedState();
  });

  backdrop?.addEventListener('click', closeMobile);
  closeBtn?.addEventListener('click', closeMobile);
  window.addEventListener('resize', () => {
    if (isMobile()) {
      document.body.classList.remove('cp-sidebar-collapsed');
      sidebar?.querySelectorAll('.menu-item.has-sub.open').forEach((g) => g.classList.remove('open'));
      restoreDesktopNavFlyouts();
    } else {
      closeMobile();
    }
    syncSidebarCollapsedState();
    syncDesktopNavFlyoutDom();
    schedulePositionNavFlyouts();
  });

  mainContentEl?.addEventListener(
    'scroll',
    () => {
      if (useDesktopFlyout()) schedulePositionNavFlyouts();
    },
    { passive: true }
  );

  document.addEventListener('click', (e) => {
    if (isMobile() || !sidebar) return;
    const layer = document.getElementById(NAV_FLYOUT_LAYER_ID);
    if (sidebar.contains(e.target) || layer?.contains(e.target)) return;
    closeDesktopNavFlyouts();
  });

  // Set password modal submit (same API as change password)
  const passMsg = document.getElementById('passMsg');
  document.getElementById('changePassForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    const email = passEmailEl?.value?.trim();
    const oldPassEl = document.getElementById('oldPass');
    let password = (oldPassEl?.value || '').trim();
    if (!password && window.CP_USER && window.CP_USER.portalPassword) {
      password = String(window.CP_USER.portalPassword).trim();
    }
    const newPassword  = document.getElementById('newPass').value;
    const confirmPassword = document.getElementById('confirmPass')?.value || '';
    if (!email || !password || !newPassword || !confirmPassword){
      passMsg.textContent = 'Please complete all fields.';
      passMsg.className = 'small mt-2 text-danger text-center';
      return;
    }
    if (newPassword !== confirmPassword) {
      passMsg.textContent = 'Password and confirmation must match.';
      passMsg.className = 'small mt-2 text-danger text-center';
      return;
    }
    passMsg.textContent = 'Updating...';
    passMsg.className = 'small mt-2 text-muted text-center';

    try{
      const res = await fetch('api/auth/change_password.php',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ email, password, newPassword })
      });
      const data = await res.json();
      if (!res.ok || data.status === 'error'){
        passMsg.textContent = data.message || 'Error changing password.';
        passMsg.className = 'small mt-2 text-danger text-center';
        return;
      }
      if (data.mustChangePasswordCleared) {
        clearMustChangePasswordUi();
      }
      /* Session stores new password after change; keep JS in sync for next modal open / API use */
      if (window.CP_USER) window.CP_USER.portalPassword = newPassword;
      passMsg.textContent = 'Your password was updated.';
      passMsg.className = 'small mt-2 text-success text-center';
      e.target.reset();
      passEmailEl.value = email;
      setTimeout(() => {
        const modalEl = document.getElementById('changePassModal');
        if (!modalEl) return;
        const m = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
        m.hide();
        passMsg.textContent = '';
      }, 1200);
    }catch{
      passMsg.textContent = 'Network error. Try again.';
      passMsg.className = 'small mt-2 text-danger text-center';
    }
  });

  // -------- Tab switching + lazy per-tab init --------
  /** Only main content tab panes (avoids stray `.view` elsewhere in DOM). */
  const views = document.querySelectorAll('#mainContent section.view');

  window.CP_tabLoaded  = window.CP_tabLoaded || {};
  window.CP_tabs       = window.CP_tabs || {};
  window.CP_onViewShow = window.CP_onViewShow || {};   // <-- NEW


  let showViewGeneration = 0;
  const CP_TAB_SCRIPT_V = 'mustpw10';
  const tabScriptLoadPromises = Object.create(null);

  const tabScriptMap = {
    home: '/assets/js/tabs/home.tab.js',
    'trading-account': '/assets/js/tabs/trading-account.tab.js',
    trading: '/assets/js/tabs/trading.tab.js',
    deposit: '/assets/js/tabs/deposit.tab.js',
    withdraw: '/assets/js/tabs/withdraw.tab.js',
    verification: '/assets/js/tabs/verification.tab.js',
    'settings-profile': '/assets/js/tabs/settings-profile.tab.js',
    support: '/assets/js/tabs/support.tab.js',
    'ai-setting': '/assets/js/tabs/ai-setting.tab.js',
    'web-trader': '/assets/js/tabs/web-trader.tab.js',
    settings: '/assets/js/tabs/settings.tab.js',
    help: '/assets/js/tabs/help.tab.js',
    'analysis-embed': '/assets/js/tabs/analysis-embed.tab.js',
  };

  function getViewSection(viewName) {
    const esc =
      typeof CSS !== 'undefined' && typeof CSS.escape === 'function'
        ? CSS.escape(String(viewName || ''))
        : String(viewName || '').replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    return document.querySelector(`#mainContent section.view[data-view="${esc}"]`);
  }

  function showViewTabLoading(view) {
    if (!view) return;
    view.classList.add('cp-view-is-loading');
    let overlay = view.querySelector('.cp-view-load-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'cp-view-load-overlay';
      overlay.setAttribute('role', 'status');
      overlay.setAttribute('aria-live', 'polite');
      overlay.setAttribute('aria-busy', 'true');
      overlay.innerHTML =
        '<div class="cp-view-load-overlay__card">' +
        '<div class="cp-view-load-overlay__spinner" aria-hidden="true"></div>' +
        '<p class="cp-view-load-overlay__text">Loading\u2026</p></div>';
      view.appendChild(overlay);
    }
    overlay.hidden = false;
    const err = view.querySelector('.cp-view-load-error');
    if (err) err.hidden = true;
  }

  function hideViewTabLoading(view) {
    if (!view) return;
    view.classList.remove('cp-view-is-loading');
    const overlay = view.querySelector('.cp-view-load-overlay');
    if (overlay) overlay.hidden = true;
  }

  function showViewTabError(view, retryFn) {
    if (!view) return;
    view.classList.add('cp-view-is-loading');
    hideViewTabLoading(view);
    let err = view.querySelector('.cp-view-load-error');
    if (!err) {
      err = document.createElement('div');
      err.className = 'cp-view-load-error';
      err.setAttribute('role', 'alert');
      err.innerHTML =
        '<p class="cp-view-load-error__text">This section is taking longer than usual to load.</p>' +
        '<button type="button" class="btn btn-sm btn-primary cp-view-load-error__retry">Try again</button>';
      view.appendChild(err);
    }
    err.hidden = false;
    const btn = err.querySelector('.cp-view-load-error__retry');
    if (btn && !btn.dataset.cpWired) {
      btn.dataset.cpWired = '1';
      btn.addEventListener('click', () => {
        err.hidden = true;
        showViewTabLoading(view);
        Promise.resolve(retryFn()).catch(() => {});
      });
    }
  }

  function hideViewTabError(view) {
    const err = view?.querySelector('.cp-view-load-error');
    if (err) err.hidden = true;
    view?.classList.remove('cp-view-is-loading');
  }

  function injectTabScript(loadKey, src) {
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[data-cp-tab-src="${loadKey}"]`);
      if (existing) {
        if (existing.dataset.cpLoaded === '1') {
          resolve();
          return;
        }
        existing.addEventListener('load', () => resolve(), { once: true });
        existing.addEventListener('error', () => reject(new Error('script error')), { once: true });
        return;
      }
      const s = document.createElement('script');
      s.src = src + (src.indexOf('?') >= 0 ? '&' : '?') + 'v=' + CP_TAB_SCRIPT_V;
      s.async = true;
      s.dataset.cpTabSrc = loadKey;
      s.onload = () => {
        s.dataset.cpLoaded = '1';
        resolve();
      };
      s.onerror = () => {
        s.remove();
        reject(new Error('Script load failed'));
      };
      document.head.appendChild(s);
    });
  }

  function loadTabScriptOnce(loadKey, src) {
    if (window.CP_tabLoaded[loadKey]) {
      return Promise.resolve();
    }
    if (tabScriptLoadPromises[loadKey]) {
      return tabScriptLoadPromises[loadKey];
    }
    tabScriptLoadPromises[loadKey] = (async () => {
      const maxAttempts = 3;
      let lastErr;
      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
          await injectTabScript(loadKey, src);
          window.CP_tabLoaded[loadKey] = true;
          return;
        } catch (err) {
          lastErr = err;
          if (attempt < maxAttempts - 1) {
            await new Promise((r) => setTimeout(r, 350 * (attempt + 1)));
          }
        }
      }
      delete tabScriptLoadPromises[loadKey];
      throw lastErr || new Error('Script load failed');
    })();
    return tabScriptLoadPromises[loadKey];
  }

  function initTabOnce(name) {
    if (typeof window.CP_tabs[name] === 'function' && !window.CP_tabs[name]._inited) {
      window.CP_tabs[name]();
      window.CP_tabs[name]._inited = true;
    }
  }

  async function lazyInitTab(name, generation) {
    const isAnalysis = typeof name === 'string' && name.indexOf('analysis-') === 0;
    const loadKey = isAnalysis ? 'analysis-embed' : name;
    const view = getViewSection(name);

    if (window.CP_tabLoaded[loadKey]) {
      initTabOnce(name);
      hideViewTabLoading(view);
      hideViewTabError(view);
      return;
    }

    let src = tabScriptMap[name];
    if (!src && isAnalysis) src = tabScriptMap['analysis-embed'];
    if (!src) src = `/assets/js/tabs/${name}.tab.js`;

    try {
      await loadTabScriptOnce(loadKey, src);
      if (generation != null && generation !== showViewGeneration) return;
      initTabOnce(name);
      hideViewTabLoading(view);
      hideViewTabError(view);
    } catch (err) {
      console.error('[lazyInitTab] failed to load', src, err);
      if (generation != null && generation !== showViewGeneration) return;
      if (view) {
        showViewTabError(view, () => lazyInitTab(name, generation));
      }
    }
  }

  async function showView(name, options) {
    const opts = options && typeof options === 'object' ? options : {};
    const target = String(name || '').trim();
    if (!target) return;
    const generation = ++showViewGeneration;
    const scriptLoadKey =
      typeof target === 'string' && target.indexOf('analysis-') === 0 ? 'analysis-embed' : target;
    const willLoadTabScript = !window.CP_tabLoaded[scriptLoadKey];
    const targetView = getViewSection(target);
    if (willLoadTabScript) {
      showViewTabLoading(targetView);
    }
    if (willLoadTabScript && window.CP_preloader?.bootComplete) {
      window.CP_preloader.enter();
    }
    try {
      views.forEach((v) => v.classList.toggle('show', v.getAttribute('data-view') === target));
      syncChromeTitleFromDom();
      await lazyInitTab(target, generation);
      if (generation !== showViewGeneration) return;
      syncChromeTitleFromDom();
      if (window.CP_onViewShow && typeof window.CP_onViewShow[target] === 'function') {
        window.CP_onViewShow[target]();
      }
      if (generation !== showViewGeneration) return;
      syncChromeTitleFromDom();
      activateSidebarForView(target);
      if (!opts.skipUrl && window.CP_ROUTER) {
        window.CP_ROUTER.navigateDashboard(target, !!opts.replace);
      }
    } finally {
      hideViewTabLoading(targetView);
      if (willLoadTabScript && window.CP_preloader?.bootComplete) {
        window.CP_preloader.leave();
      }
    }
  }

  // make it usable from tab scripts (home, etc)
  window.CP_showView = showView;

  window.addEventListener('popstate', () => {
    const view = window.CP_ROUTER?.dashboardViewFromPath(window.location.pathname);
    if (!view) return;
    void showView(view, { skipUrl: true });
  });

  /** Human-readable title for each `data-view` value (keys must be lowercase). */
  const CP_TAB_TITLES = {
    home: 'Dashboard',
    'trading-account': 'Trading Account',
    deposit: 'Deposit',
    withdraw: 'Withdrawal',
    verification: 'Verification',
    'analysis-technical': 'Technical Analysis',
    'analysis-calendar': 'Economic Calendar',
    'analysis-news': 'News',
    'ai-setting': 'AI Settings',
    'web-trader': 'Web Trader',
    'settings-profile': 'Profile',
    'settings-questionnaire': 'Questionnaire',
    support: 'Support',
    help: 'Help',
  };

  function syncChromeTitleFromDom() {
    const activeTabName = document.getElementById('activeTabName');
    if (!activeTabName) return;
    const shown = document.querySelector('#mainContent section.view.show');
    const raw = (shown && shown.getAttribute('data-view')) || 'home';
    const key = String(raw).trim().toLowerCase();
    activeTabName.textContent = CP_TAB_TITLES[key] || CP_TAB_TITLES.home;
  }

  window.CP_syncChromeTitle = syncChromeTitleFromDom;

  function activateSidebarItem(item) {
    // remove all previous active states
    document
      .querySelectorAll('.menu-item.active, .submenu-item.active')
      .forEach(el => el.classList.remove('active'));

    if (item.classList.contains('submenu-item')) {
      // make submenu active + keep its group open
      item.classList.add('active');
      const parent = item.closest('.menu-item.has-sub');
      document.querySelectorAll('.menu-item.has-sub').forEach((g) => {
        if (g !== parent) g.classList.remove('open');
      });
      parent?.classList.add('open');
    } else {
      // normal (non-dropdown) item
      item.classList.add('active');

      // close dropdown groups that have no active child
      document.querySelectorAll('.menu-item.has-sub').forEach(group => {
        if (!group.querySelector('.submenu-item.active')) {
          group.classList.remove('open');
        }
      });
    }
    if (useDesktopFlyout()) {
      syncDesktopNavFlyoutDom();
      schedulePositionNavFlyouts();
    }
  }

  /**
   * Keep sidebar .active in sync when the view changes programmatically (e.g. home / trading-account → Deposit or Withdraw).
   * Clicks on the sidebar already call activateSidebarItem; this mirrors that for CP_showView().
   */
  function activateSidebarForView(viewName) {
    const target = String(viewName || '').trim();
    if (!target || !sidebar) return;

    const esc =
      typeof CSS !== 'undefined' && typeof CSS.escape === 'function'
        ? CSS.escape(target)
        : String(target).replace(/\\/g, '\\\\').replace(/"/g, '\\"');

    let item =
      sidebar.querySelector(`.submenu-item[data-view="${esc}"]`) ||
      sidebar.querySelector(`#sidebarMenu > li.menu-item[data-view="${esc}"]`) ||
      sidebar.querySelector(`button.menu-item[data-view="${esc}"]`);

    if (!item) {
      item = sidebar.querySelector(`[data-view="${esc}"]`);
    }

    if (item) activateSidebarItem(item);
  }

  // Sidebar: mobile expand in drawer; desktop = in-sidebar dropdown (default) or body flyout (CP_SIDEBAR_SUBMENU_DESKTOP)
  function onSidebarNavClick(e) {
    if (!sidebar) return;

    const groupMain = e.target.closest('.menu-main');
    const groupItem = groupMain?.closest('.menu-item.has-sub');

    // Click on group header (Analysis / Settings)
    if (groupItem && !e.target.closest('.submenu')) {
      if (isMobile()) {
        groupItem.classList.toggle('open');
      } else {
        const wasOpen = groupItem.classList.contains('open');
        sidebar.querySelectorAll('.menu-item.has-sub').forEach((g) => g.classList.remove('open'));
        if (!wasOpen) groupItem.classList.add('open');
        if (useDesktopFlyout()) {
          syncDesktopNavFlyoutDom();
          schedulePositionNavFlyouts();
        }
      }
      e.stopPropagation();
      return;
    }

    const item = e.target.closest('[data-view]');
    if (!item) return;

    const viewName = item.getAttribute('data-view') || item.dataset.view;
    if (!viewName) return;

    activateSidebarItem(item);
    void showView(viewName);

    if (isMobile()) closeMobile();
    else if (useDesktopFlyout()) closeDesktopNavFlyouts();
    else if (!item.classList.contains('submenu-item')) {
      sidebar.querySelectorAll('.menu-item.has-sub.open').forEach((g) => g.classList.remove('open'));
    }
    e.stopPropagation();
  }

  sidebar?.addEventListener('click', onSidebarNavClick);
  if (useDesktopFlyout()) {
    ensureNavFlyoutLayer().addEventListener('click', onSidebarNavClick);
  }



  // Initial tab from URL (or server default), then sidebar highlight
  let initialView =
    window.CP_ROUTER?.dashboardViewFromPath(window.location.pathname) ||
    window.CP_INITIAL_DASHBOARD_VIEW ||
    'home';

  if (
    window.CP_ROUTER &&
    window.location.pathname.startsWith('/dashboard/') &&
    !window.CP_ROUTER.dashboardViewFromPath(window.location.pathname)
  ) {
    initialView = 'home';
    window.CP_ROUTER.navigateDashboard('home', true);
  }

  const initialEsc =
    typeof CSS !== 'undefined' && typeof CSS.escape === 'function'
      ? CSS.escape(initialView)
      : String(initialView).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  const initialActive =
    sidebar?.querySelector(`[data-view="${initialEsc}"]`) ||
    sidebar?.querySelector('[data-view].active') ||
    sidebar?.querySelector('[data-view="home"]');

  if (initialActive) activateSidebarItem(initialActive);
  if (useDesktopFlyout()) {
    syncDesktopNavFlyoutDom();
    schedulePositionNavFlyouts();
  }
  try {
    await showView(initialView, { replace: true });
  } finally {
    if (window.CP_preloader) window.CP_preloader.hideBoot();
  }
  if (typeof window.CP_runAiOnboardingIfPending === 'function') {
    void window.CP_runAiOnboardingIfPending();
  }
  
});

