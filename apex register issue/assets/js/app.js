/* ===== Preloader ===== */
const preloader = document.getElementById('preloader');
const showPreloader = () => preloader?.classList.remove('d-none');
const hidePreloader = () => preloader?.classList.add('d-none');

/* ===== Views (Login / Register / Forgot) ===== */
const loginView = document.getElementById('loginView');
const registerView = document.getElementById('registerView');
const forgotView = document.getElementById('forgotView');

function syncAuthUrl(view, replace) {
  if (window.CP_ROUTER) window.CP_ROUTER.navigateAuth(view, !!replace);
}

function showLogin(replaceUrl) {
  registerView?.classList.remove('show');
  forgotView?.classList.remove('show');
  setTimeout(() => { loginView?.classList.add('show'); }, 10);
  syncAuthUrl('login', replaceUrl);
}

function showRegister(replaceUrl) {
  loginView?.classList.remove('show');
  forgotView?.classList.remove('show');
  setTimeout(() => { registerView?.classList.add('show'); }, 10);
  syncAuthUrl('register', replaceUrl);
}

function showForgot(replaceUrl) {
  loginView?.classList.remove('show');
  registerView?.classList.remove('show');
  setTimeout(() => { forgotView?.classList.add('show'); }, 10);
  syncAuthUrl('forgot', replaceUrl);
}

function applyAuthView(view, replaceUrl) {
  const v = String(view || 'login').trim().toLowerCase();
  if (v === 'register') showRegister(replaceUrl);
  else if (v === 'forgot') showForgot(replaceUrl);
  else showLogin(replaceUrl);
}

/** Canonical public help URL: /login#help (also accepts /help). */
function normalizeAuthHelpUrl() {
  const path = (window.location.pathname || '').replace(/\/+$/, '') || '/';
  const hash = String(window.location.hash || '').trim().toLowerCase();
  if (path === '/help' || hash === '#help' || hash === '#/help') {
    const target = '/login#help';
    if (window.location.pathname + window.location.hash !== target) {
      try {
        window.history.replaceState(null, '', target);
      } catch (e) {
        window.location.replace(target);
      }
    }
  }
}

/* ===== DOM READY ===== */
document.addEventListener('DOMContentLoaded', () => {
  normalizeAuthHelpUrl();
  const goRegister = document.getElementById('goRegister');
  const goLogin = document.getElementById('goLogin');
  const goForgot = document.getElementById('goForgot');
  const backToLogin = document.getElementById('backToLogin');

  goRegister?.addEventListener('click', (e) => { e.preventDefault(); showRegister(false); });
  goLogin?.addEventListener('click', (e) => { e.preventDefault(); showLogin(false); });
  goForgot?.addEventListener('click', (e) => { e.preventDefault(); showForgot(false); });
  backToLogin?.addEventListener('click', (e) => { e.preventDefault(); showLogin(false); });

  window.addEventListener('popstate', () => {
    const view = window.CP_ROUTER?.authViewFromPath(window.location.pathname);
    if (!view) return;
    applyAuthView(view, true);
    window.CP_replain?.openAuthHelpChatIfRequested?.();
  });

  window.addEventListener('hashchange', () => {
    window.CP_replain?.openAuthHelpChatIfRequested?.();
  });

  function scheduleAuthHelpChatOpen() {
    if (!window.CP_replain?.authHashIsHelp?.()) return;
    /* After splash fade so chat is not hidden behind overlay */
    setTimeout(() => {
      window.CP_replain.openAuthHelpChatIfRequested();
    }, 1100);
  }

  const splash = document.getElementById('splashScreen');
  const authWrapper = document.querySelector('.auth-wrapper');
  const autologinCreds = parseAutologinFromHash();

  if (autologinCreds) {
    stripAutologinCredentialsFromUrl();
    if (autologinCreds.lang) document.documentElement.setAttribute('lang', autologinCreds.lang);
    if (splash) splash.style.display = 'none';
    if (authWrapper) {
      authWrapper.classList.add('d-none');
      authWrapper.classList.remove('show');
    }
    showPreloader();
    (async () => {
      const errorBox = document.getElementById('loginError');
      try {
        const result = await attemptLogin(autologinCreds.email, autologinCreds.password);
        if (result.ok) {
          window.location.href = '/dashboard';
          return;
        }
        if (errorBox) errorBox.textContent = result.message;
        setTimeout(() => { if (errorBox) errorBox.textContent = ''; }, 5000);
      } catch (err) {
        if (errorBox) errorBox.textContent = 'Network error. Try again.';
        setTimeout(() => { if (errorBox) errorBox.textContent = ''; }, 5000);
      }
      hidePreloader();
      if (authWrapper) {
        authWrapper.classList.remove('d-none');
        authWrapper.classList.add('show');
      }
      showLogin(true);
    })();
    return;
  }

  /* Normal visit: splash → fade out → reveal auth */
  if (splash && authWrapper) {
    authWrapper.classList.remove('d-none');
    authWrapper.classList.add('show');
    const initialAuth =
      window.CP_INITIAL_AUTH_VIEW ||
      window.CP_ROUTER?.authViewFromPath(window.location.pathname) ||
      'login';
    applyAuthView(initialAuth, true);
    scheduleAuthHelpChatOpen();
    setTimeout(() => {
      splash.classList.add('fade-out');
      setTimeout(() => {
        splash.style.display = 'none';
      }, 600);
    }, 1000);
  } else {
    scheduleAuthHelpChatOpen();
  }
});

/* ===== Password Show/Hide with eye icon swap ===== */
function makeShowHide(btnId, inputId) {
  const btn = document.getElementById(btnId);
  const input = document.getElementById(inputId);
  if (!btn || !input) return;

  btn.addEventListener('click', () => {
    const to = input.type === 'password' ? 'text' : 'password';
    input.type = to;

    const icon = btn.querySelector('i');
    if (icon) {
      icon.classList.toggle('bi-eye');
      icon.classList.toggle('bi-eye-slash');
    }
  });
}
makeShowHide('toggleLoginPwd', 'loginPassword');
makeShowHide('toggleRegPwd', 'regPassword');

/**
 * Hash route: #/auth/autologin?lang=en&email=...&password=...
 * Fragment is never sent to the server; parse on the client only.
 */
function parseAutologinFromHash() {
  const raw = (window.location.hash || '').trim();
  if (!/^#\/auth\/autologin\b/i.test(raw)) return null;
  const q = raw.indexOf('?');
  const qs = q >= 0 ? raw.slice(q + 1) : '';
  const params = new URLSearchParams(qs);
  const email = (params.get('email') || '').trim();
  const password = params.get('password') || '';
  const lang = (params.get('lang') || '').trim();
  if (!email || !password) return null;
  return { email, password, lang: lang || null };
}

function stripAutologinCredentialsFromUrl() {
  const path = window.location.pathname + window.location.search;
  try {
    window.history.replaceState(null, '', path + '#/auth/autologin');
  } catch (e) {
    /* ignore */
  }
}

async function attemptLogin(email, password) {
  const body = { email, password };
  if (window.CP_userDevice?.collect) {
    try {
      body.userDevice = await window.CP_userDevice.collect();
    } catch (e) {
      /* login still proceeds */
    }
  }
  const res = await fetch('api/auth/login.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok || data.status === 'error') {
    return { ok: false, message: data.message || 'Login failed.' };
  }
  return { ok: true };
}

/* ===== LOGIN submit -> api/auth/login.php ===== */
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value.trim();
  const errorBox = document.getElementById('loginError');

  if (!email || !password) {
    errorBox.textContent = 'Please fill in both fields.';
    setTimeout(() => { errorBox.textContent = ''; }, 3000); // Hide the error after 3 seconds
    return;
  }

  errorBox.textContent = '';
  showPreloader();

  try {
    const result = await attemptLogin(email, password);
    if (!result.ok) {
      errorBox.textContent = result.message;
      setTimeout(() => { errorBox.textContent = ''; }, 3000);
      return;
    }
    window.location.href = '/dashboard';
  } catch (err) {
    errorBox.textContent = 'Network error. Try again.';
    setTimeout(() => { errorBox.textContent = ''; }, 3000); // Hide the error after 3 seconds
  } finally {
    hidePreloader();
  }
});

/* ===== REGISTER: phone init + validation + submit ===== */
let iti; // intl-tel-input instance
(function initRegister() {
  const phoneEl = document.getElementById('phone');
  if (!phoneEl) return;

  // country by IP (fallback gb)
  fetch('https://ipinfo.io/json?token=5a8c00f1abba8d')
    .then(r => r.json())
    .then(d => setupPhone((d && d.country) ? d.country.toLowerCase() : 'gb'))
    .catch(() => setupPhone('gb'));

  function setupPhone(cc) {
    try {
      iti = window.intlTelInput(phoneEl, {
        initialCountry: cc,
        separateDialCode: true,
        utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js",
      });
    } catch (e) { console.error(e); }
  }

  // helper: validate phone with intl-tel-input
  function validatePhone() {
    const phoneErr = document.getElementById('phoneError');
    phoneErr.textContent = '';
    phoneEl.classList.remove('is-invalid');

    if (!iti) return true; // if init failed, don't block

    if (!iti.isValidNumber()) {
      const code = iti.getValidationError();
      const map = {
        0: 'Invalid phone number',
        1: 'Invalid country code',
        2: 'Number is too short',
        3: 'Number is too long',
        4: 'Invalid phone number'
      };
      phoneErr.textContent = map[code] || 'Invalid phone number';
      phoneEl.classList.add('is-invalid');
      return false;
    }
    return true;
  }

  // live-validate on blur/change
  ['blur', 'change', 'keyup'].forEach(ev => phoneEl.addEventListener(ev, validatePhone));

  // submit
  document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const msgBox = document.getElementById('registerMsg');
    const phoneOk = validatePhone();

    const payload = {
      fullName: document.getElementById('fullName').value.trim(),
      email: document.getElementById('regEmail').value.trim(),
      password: document.getElementById('regPassword').value,
      birthDate: document.getElementById('birthDate').value
        ? new Date(document.getElementById('birthDate').value).toISOString()
        : undefined,
      phone: (window.intlTelInput && iti) ? iti.getNumber() : phoneEl.value.trim()
    };

    if (!payload.fullName || !payload.email || !payload.password || !payload.phone) {
      msgBox.className = 'auth-form-feedback tiny text-center text-danger';
      msgBox.textContent = 'Please fill in all required fields.';
      setTimeout(() => { msgBox.textContent = ''; }, 3000); // Hide the error after 3 seconds
      return;
    }
    if (!phoneOk) {
      msgBox.className = 'auth-form-feedback tiny text-center text-danger';
      msgBox.textContent = 'Please enter a valid phone number.';
      setTimeout(() => { msgBox.textContent = ''; }, 3000); // Hide the error after 3 seconds
      return;
    }

    msgBox.textContent = '';
    showPreloader();

    try {
      const res = await fetch('api/leads/register.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok || data.status === 'error') {
        msgBox.className = 'auth-form-feedback tiny text-center text-danger';
        let errText = data.message || 'Registration failed.';
        if (Array.isArray(errText)) errText = errText.join(' ');
        else if (errText && typeof errText === 'object') errText = 'Registration failed.';
        if (res.status === 429) {
          errText = 'Too many sign-up attempts. Please wait a few minutes and try again.';
        }
        msgBox.textContent = errText;
        hidePreloader();
        setTimeout(() => { msgBox.textContent = ''; }, 3000); // Hide the error after 3 seconds
        return;
      }

      msgBox.className = 'auth-form-feedback tiny text-center text-success';
      msgBox.textContent = 'Registration successful! Redirecting to login...';
      setTimeout(() => { showLogin(true); msgBox.textContent = ''; }, 1500);
    } catch (err) {
      msgBox.className = 'auth-form-feedback tiny text-center text-danger';
      msgBox.textContent = 'Network error. Try again.';
      setTimeout(() => { msgBox.textContent = ''; }, 3000); // Hide the error after 3 seconds
    } finally {
      hidePreloader();
    }
  });
})();

/* ===== FORGOT PASSWORD ===== */
document.getElementById('forgotForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const emailEl = document.getElementById('forgotEmail');
  const msgBox = document.getElementById('forgotMsg');

  const email = emailEl.value.trim();
  msgBox.textContent = '';
  if (!email) {
    msgBox.className = 'auth-form-feedback tiny text-center text-danger';
    msgBox.textContent = 'Please enter your email.';
    emailEl.focus();
    setTimeout(() => { msgBox.textContent = ''; }, 3000); // Hide the error after 3 seconds
    return;
  }

  showPreloader();
  try {
    const res = await fetch('api/auth/forgotpass.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (!res.ok || data.status === 'error') {
      msgBox.className = 'auth-form-feedback tiny text-center text-danger';
      msgBox.textContent = data.message || 'Error sending reset link.';
      hidePreloader();
      setTimeout(() => { msgBox.textContent = ''; }, 3000); // Hide the error after 3 seconds
      return;
    }

    msgBox.className = 'auth-form-feedback tiny text-center text-success';
    msgBox.textContent = 'Password reset email sent! Returning to login...';
    setTimeout(() => { showLogin(true); msgBox.textContent = ''; emailEl.value = ''; }, 1500);
  } catch (err) {
    msgBox.className = 'auth-form-feedback tiny text-center text-danger';
    msgBox.textContent = 'Network error. Please try again.';
    setTimeout(() => { msgBox.textContent = ''; }, 3000); // Hide the error after 3 seconds
  } finally {
    hidePreloader();
  }
});
