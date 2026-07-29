// Deposit tab
window.CP_tabs = window.CP_tabs || {};

window.CP_tabs.deposit = async function () {
  if (window.CP_tabs.deposit.loaded) return;

  const mount = document.querySelector('section.view[data-view="deposit"]');
  if (!mount) return;

  // Prefer markup from dashboard.php (avoids wrong path + browser cache on fetch). Fallback: fetch with resolved URL + cache-bust.
  if (!mount.querySelector('#depositMainWrap')) {
    try {
      const html =
        typeof window.CP_fetchView === 'function'
          ? await window.CP_fetchView('assets/views/deposit/deposit.html')
          : await fetch(new URL('assets/views/deposit/deposit.html', document.baseURI).toString() + '?v=' + Date.now(), {
              credentials: 'same-origin'
            }).then(r => {
              if (!r.ok) throw new Error('HTTP ' + r.status);
              return r.text();
            });
      mount.innerHTML = html;
    } catch (err) {
      console.error('[deposit] failed to load view HTML', err);
      mount.innerHTML =
        '<div class="alert alert-danger m-3" role="alert">Could not load deposit layout. Check the console and refresh (Ctrl+F5).</div>';
      return;
    }
  }

  // ===== Simple subview router (main | history) =====
  let currentSubView = 'main'; // default
  const SUBVIEW_IDS = { main: 'depositMainWrap', hist: 'depositHistoryWrap' };

  function ensureHistoryHost() {
    // Create a hidden history wrapper once (so we don't break existing DOM)
    if (mount.querySelector('#' + SUBVIEW_IDS.hist)) return;

    const wrap = document.createElement('div');
    wrap.id = SUBVIEW_IDS.hist;
    wrap.className = 'history-wrap';
    wrap.style.display = 'none'; // hidden by default
    wrap.innerHTML = `
      <div class="history-head dep-hist-toolbar">
        <div class="dep-hist-toolbar-main">
          <div class="dep-hist-toolbar-title-row">
            <span class="dep-hist-toolbar-icon" aria-hidden="true"><i class="bi bi-clock-history"></i></span>
            <div>
              <strong class="dep-hist-toolbar-title">Deposit History</strong>
              <p class="dep-hist-toolbar-desc">Review your deposit activity, filter, export and inspect details.</p>
            </div>
          </div>
        </div>
        <div class="dep-hist-toolbar-actions">
          <div class="dep-hist-select-wrap">
            <select id="histTpSelect" class="form-select dep-hist-select" aria-label="Account filter">
              <option value="">All Accounts</option>
            </select>
            <span class="dep-hist-select-chevron" aria-hidden="true"><i class="bi bi-chevron-down"></i></span>
          </div>
          <div class="dep-hist-filters-wrap">
            <div class="dep-hist-filters btn-group" role="group" aria-label="Filters">
              <button type="button" class="btn dep-hist-filter btn-sm" data-filter="All">All</button>
              <button type="button" class="btn dep-hist-filter btn-sm" data-filter="Approved">Approved</button>
              <button type="button" class="btn dep-hist-filter btn-sm" data-filter="Pending">Pending</button>
              <button type="button" class="btn dep-hist-filter btn-sm" data-filter="Rejected">Rejected</button>
            </div>
          </div>
          <button type="button" class="btn dep-hist-btn-ghost btn-sm" id="histRefresh"><i class="bi bi-arrow-clockwise"></i> Refresh</button>
          <button type="button" class="btn dep-hist-btn-primary btn-sm" id="histDownload"><i class="bi bi-download"></i> Download PDF</button>
          <button type="button" class="btn dep-hist-btn-dark btn-sm" id="histBack"><i class="bi bi-arrow-left"></i> Back</button>
        </div>
      </div>

      <div class="dep-hist-table-shell">
        <div class="dep-hist-table-scroll table-scroll">
          <table class="table align-middle mb-0 dep-hist-table table-accounts" id="histTable">
            <thead>
              <tr>
                <th>Date</th>
                <th>TP Number</th>
                <th>Type</th>
                <th>Status</th>
                <th class="text-end">Amount</th>
                <th>Currency</th>
                <th>Comment</th>
                <th></th>
              </tr>
            </thead>
            <tbody id="histTBody">
              <tr><td colspan="8" class="text-center py-4 dep-hist-loading">Loading…</td></tr>
            </tbody>
          </table>
        </div>
        <div class="dep-hist-footer">
          <div class="dep-hist-summary small" id="histSummary">—</div>
          <div class="dep-hist-pager-wrap" id="histPager" role="navigation" aria-label="History pagination"></div>
        </div>
      </div>
    `;
    mount.appendChild(wrap);
  }

  function ensureMainWrap() {
    // Wrap the existing deposit HTML so we can hide/show cleanly
    if (mount.querySelector('#' + SUBVIEW_IDS.main)) return;
    const mainWrap = document.createElement('div');
    mainWrap.id = SUBVIEW_IDS.main;
    // Move all present children except the history-wrap we may add later
    const kids = Array.from(mount.childNodes);
    kids.forEach(n => {
      if (!(n instanceof HTMLElement)) return;
      if (n.id === SUBVIEW_IDS.hist) return;
      mainWrap.appendChild(n);
    });
    mount.appendChild(mainWrap);
  }

  function showSubview(name) {
    currentSubView = name;
    const main = mount.querySelector('#' + SUBVIEW_IDS.main);
    const hist = mount.querySelector('#' + SUBVIEW_IDS.hist);
    if (main) main.style.display = (name === 'main') ? '' : 'none';
    if (hist) hist.style.display = (name === 'hist') ? '' : 'none';
  }

  // When user switches away and back to this tab, always restore MAIN view.
  const observer = new MutationObserver(() => {
    const isShown = mount.classList.contains('show');
    if (isShown && currentSubView !== 'main') {
      showSubview('main');
    }
  });
  observer.observe(mount, { attributes: true, attributeFilter: ['class'] });

  // DOM
  ensureMainWrap();
  const totalEl = document.getElementById('depTotal');
  const tpSelect = document.getElementById('depTpSelect');
  const depMethodBtn = document.getElementById('depMethodBtn');
  const depMethodMenu = document.getElementById('depMethodMenu');
  const depMethodBtnLabel = document.getElementById('depMethodBtnLabel');
  const depCardChips = document.getElementById('depCardChips');
  const depCardAmountMirror = document.getElementById('depCardAmountMirror');
  const depPanelEmpty = document.getElementById('depPanelEmpty');
  const depPanelCard = document.getElementById('depPanelCard');
  const depPanelLemux = document.getElementById('depPanelLemux');
  const depPanelCrypto = document.getElementById('depPanelCrypto');

  // ===== CryptoPay (inline panel; no modal) =====
  const cpTpSelect = () => document.getElementById('cpTpSelect');
  const cpAmount   = () => document.getElementById('cpAmount');
  const cpFiat     = () => document.getElementById('cpFiat');
  const cpCrypto   = () => document.getElementById('cpCrypto');
  const cpNetwork  = () => document.getElementById('cpNetwork');
  const cpMsg      = () => document.getElementById('cpMsg');

  // In-memory accounts
  let accountsList = [];
  const accByTp = new Map(); // tpNumber -> account

  // Config from payment methods
  let cryptoSupportedFiats = [];  // ['EUR','USD','GBP']
  let cryptoCoins = [];           // from supported-coins API
  let lemuxSupportedFiats = [];   // ['EUR','GBP','USD','AUD'] from config

  let payMethodCard = null;
  let payMethodCrypto = null;
  let payMethodLemux = null;
  let currentPayMethod = null; // 'card' | 'crypto' | 'lemux'

  const WALLET_CHIP_SVG = `<svg class="dep-chip-wallet" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-1.5M3 6h18M17 11a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  function escapeHtml(s) {
    return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  /**
   * Short table dates: numeric month, no year in the current calendar year, two-digit year otherwise (e.g. 31/10, 7/8/25).
   */
  function formatCompactDepositDate(iso) {
    const d = new Date(iso);
    if (Number.isNaN(+d)) {
      const s = String(iso ?? '').trim();
      return s || '—';
    }
    const now = new Date();
    const day = d.getDate();
    const month = d.getMonth() + 1;
    const year = d.getFullYear();
    const currentYear = now.getFullYear();
    const dm = `${day}/${month}`;
    if (year === currentYear) return dm;
    return `${dm}/${String(year).slice(-2)}`;
  }

  /** Same deposit arrow-in-box as home table, scaled for side preview */
  function depRowIcon(uid) {
    const clipId = 'depclip_' + String(uid).replace(/[^a-zA-Z0-9_-]/g, '_');
    return `<span class="dep-fig-tx-icon" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg" focusable="false">
<g clip-path="url(#${clipId})">
<path d="M22.9233 11.5877C22.7598 11.1738 22.4134 10.9801 21.8373 10.9814L18.5255 10.9916C18.0218 10.9916 17.9335 10.9162 17.9328 10.4329C17.9328 8.62032 17.9328 6.80777 17.9328 4.99521C17.9328 4.38347 17.7568 4.20063 17.1428 4.19995C15.2569 4.19995 13.371 4.19995 11.4851 4.19995V4.20675C9.57707 4.20675 7.66817 4.20675 5.75834 4.20675C5.19947 4.20675 5.01387 4.39639 5.01318 4.94355C5.01318 6.73255 5.01318 8.52244 5.01318 10.3133C5.01318 10.9175 4.9221 11.0079 4.28941 11.0086C3.18546 11.0086 2.08152 11.014 0.977572 11.0086C0.569802 11.0086 0.264837 11.1568 0.0888962 11.5272C-0.113264 11.9513 -0.0166689 12.423 0.373162 12.7956C1.20112 13.5833 2.00562 14.3874 2.81771 15.1875C4.38531 16.732 5.99155 18.2421 7.58468 19.7592C8.59295 20.7185 9.60743 21.6701 10.6281 22.614C11.176 23.1251 11.8011 23.1197 12.3385 22.614C13.5441 21.4811 14.7493 20.3482 15.954 19.2154C18.1874 17.1083 20.3628 14.9462 22.5562 12.8003C22.973 12.4082 23.0965 12.0268 22.9233 11.5877ZM18.5765 13.5201C16.7753 15.2665 14.9728 17.0111 13.1693 18.7539C12.6939 19.214 12.2116 19.6681 11.7493 20.1405C11.5761 20.3172 11.465 20.3383 11.2781 20.1575C9.01774 17.9661 6.7535 15.779 4.48536 13.5962C4.4427 13.5582 4.40324 13.5169 4.36737 13.4728C4.31631 13.4046 4.21489 13.3454 4.25629 13.2428C4.29769 13.1402 4.41015 13.1205 4.51778 13.1205C5.12702 13.1205 5.73557 13.1171 6.34481 13.1205C7.11274 13.1205 7.37976 12.8642 7.37976 12.1077C7.37976 10.3534 7.38735 8.59835 7.37493 6.84334C7.37493 6.59593 7.42254 6.5164 7.68749 6.5198C8.9515 6.53339 10.2155 6.52591 11.4823 6.52591V6.52116C12.7463 6.52116 14.0103 6.52659 15.2771 6.5164C15.5013 6.5164 15.5641 6.57485 15.5634 6.79712C15.5552 8.55213 15.5634 10.3065 15.5634 12.0615C15.5634 12.856 15.8139 13.1123 16.6301 13.1123H18.424C18.5503 13.1123 18.6931 13.098 18.7435 13.2482C18.7808 13.3835 18.6524 13.446 18.5758 13.5201H18.5765Z" fill="#7B61FF"/>
<path d="M11.4837 0C13.3453 0 15.2082 0 17.0725 0C17.7024 0 17.9398 0.238579 17.9391 0.863912C17.9391 1.09026 17.9439 1.3166 17.9391 1.54362C17.9246 1.97252 17.6969 2.20837 17.2636 2.2512C17.1947 2.25596 17.1256 2.25732 17.0566 2.25528C13.3308 2.25528 9.60704 2.25528 5.88537 2.25528C5.71272 2.26443 5.54022 2.23467 5.381 2.16827C5.22093 2.09215 5.07949 1.97863 5.05603 1.79715C4.9931 1.36002 4.99613 0.916132 5.065 0.479874C5.12226 0.151575 5.37824 0.00407809 5.79981 0.00407809C7.69676 0.00135925 9.59324 0.00135925 11.4893 0.00407809L11.4837 0Z" fill="#7B61FF"/>
</g>
<defs><clipPath id="${clipId}"><rect width="23" height="23" fill="white"/></clipPath></defs>
</svg></span>`;
  }

  function fmtSideDateTime(iso) {
    const d = new Date(iso);
    if (Number.isNaN(+d)) return { date: '—', time: '—' };
    return {
      date: formatCompactDepositDate(iso),
      time: d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })
    };
  }

  function closeMethodMenu() {
    if (!depMethodMenu || !depMethodBtn) return;
    depMethodMenu.hidden = true;
    depMethodBtn.setAttribute('aria-expanded', 'false');
  }

  function toggleMethodMenu() {
    if (!depMethodMenu || !depMethodBtn) return;
    const open = depMethodMenu.hidden;
    depMethodMenu.hidden = !open;
    depMethodBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  function setPayMethod(key) {
    currentPayMethod = key || null;
    closeMethodMenu();

    [depPanelEmpty, depPanelCard, depPanelLemux, depPanelCrypto].forEach(el => {
      if (!el) return;
      el.classList.remove('is-visible');
    });

    const labels = { card: 'Credit Card Deposit', crypto: 'Cryptopay Deposit', lemux: 'Lemuxion Deposit' };
    if (depMethodBtnLabel) {
      depMethodBtnLabel.textContent = key ? (labels[key] || 'Select Deposit with') : 'Select Deposit with';
    }

    depMethodMenu?.querySelectorAll('.dep-fig-method-item').forEach(btn => {
      btn.classList.toggle('is-active', !!(key && btn.getAttribute('data-method') === key));
    });

    if (key === 'card' && depPanelCard) {
      depPanelCard.classList.add('is-visible');
    } else if (key === 'lemux' && depPanelLemux) {
      depPanelLemux.classList.add('is-visible');
    } else if (key === 'crypto' && depPanelCrypto) {
      depPanelCrypto.classList.add('is-visible');
    } else if (depPanelEmpty) {
      depPanelEmpty.classList.add('is-visible');
    }
  }

  // ===== UI helpers =====
  const fmtMoney = v =>
    (v == null || v === '') ? '0.00'
      : Number(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  function updateHeaderBalance(tp) {
    if (tp && accByTp.has(tp)) {
      totalEl.textContent = '$' + fmtMoney(accByTp.get(tp).balance);
    } else {
      const real = accountsList.filter(a => !a.isDemoAccount);
      const total = real.reduce((s, a) => s + (Number(a.balance) || 0), 0);
      totalEl.textContent = '$' + fmtMoney(total);
    }
  }

  // keep dropdown caret vertically centered even when height changes
  function centerCarets(scope=document){
    const carets = scope.querySelectorAll('.dep-caret');
    carets.forEach(i=>{
      const wrap = i.parentElement;
      if (!wrap) return;
      wrap.style.position = 'relative';
      i.style.top = '50%';
      i.style.transform = 'translateY(-50%)';
    });
  }
  window.addEventListener('resize', ()=>centerCarets());

  // ===== Accounts =====
  async function loadAccounts() {
    try {
      const url = `api/accounts/get_accounts.php?userId=${encodeURIComponent(CP_USER.userId)}`;
      const res = await fetch(url, { headers: { 'Accept':'application/json' }});
      const json = await res.json();
      accountsList = Array.isArray(json.data) ? json.data : (json.data?.accounts || []);

      accByTp.clear();
      for (const a of accountsList) if (a.tpNumber) accByTp.set(a.tpNumber, a);

      updateHeaderBalance(null);

      const opts = ['<option value="" selected disabled>Select a Tp number</option>'];
      for (const a of accountsList) if (a.tpNumber) opts.push(`<option value="${a.tpNumber}">${a.tpNumber}</option>`);
      tpSelect.innerHTML = opts.join('');
      centerCarets();
      syncTpToForms();
    } catch (e) { console.error('accounts error', e); }
  }

  function syncTpToForms() {
    const tp = tpSelect?.value || '';
    const lt = document.getElementById('lemuxTp');
    const cp = cpTpSelect();
    if (lt && tp) lt.value = tp;
    if (cp && tp) cp.value = tp;
  }

  function renderCardChips(card) {
    if (!depCardChips) return;
    const priceCfg = card?.config?.extraData?.priceConfig || [];
    if (!priceCfg.length) {
      depCardChips.innerHTML = '<span class="text-muted small">No quick amounts configured.</span>';
      if (depCardAmountMirror) depCardAmountMirror.value = '';
      return;
    }
    depCardChips.innerHTML = priceCfg.map((p, i) => {
      const amt = String(p.amount);
      const amtAttr = amt.replace(/"/g, '&quot;');
      return `
      <button type="button" class="dep-fig-chip${i === 0 ? ' is-selected' : ''}" data-href="${encodeURI(p.url)}" data-amount="${amtAttr}">
        ${WALLET_CHIP_SVG}
        <span>$${escapeHtml(amt)}</span>
      </button>`;
    }).join('');
    const first = priceCfg[0];
    if (depCardAmountMirror && first) depCardAmountMirror.value = '$' + String(first.amount);
    centerCarets(depPanelCard);
  }

  // ===== Payment methods (Figma method dropdown + panels) =====
  async function loadPaymentMethods() {
    payMethodCard = null;
    payMethodCrypto = null;
    payMethodLemux = null;
    if (depMethodMenu) depMethodMenu.innerHTML = '';
    if (depCardChips) depCardChips.innerHTML = '<span class="text-muted small">Loading…</span>';

    try {
      const res = await fetch('api/payments/get_payment_methods_config.php', { headers: { Accept: 'application/json' } });
      const json = await res.json();
      const items = Array.isArray(json.data) ? json.data : json;

      payMethodCard = items.find(i => i.type === 'DepositLink') || null;
      payMethodCrypto = items.find(i => i.type === 'CryptoPay') || null;
      payMethodLemux = items.find(i => i.type === 'LemuxionPay') || null;

      if (payMethodCrypto) {
        cryptoSupportedFiats = Array.isArray(payMethodCrypto.config?.supportedCurrencies)
          ? payMethodCrypto.config.supportedCurrencies
          : [];
      }
      if (payMethodLemux) {
        lemuxSupportedFiats = Array.isArray(payMethodLemux.config?.supportedCurrencies)
          ? payMethodLemux.config.supportedCurrencies
          : [];
      }

      const menuParts = [];
      if (payMethodCard) {
        menuParts.push(`
          <button type="button" class="dep-fig-method-item${currentPayMethod === 'card' ? ' is-active' : ''}" data-method="card" role="option">
            <img src="https://c20900-backend.dataconect.com/api/v1/signal-market-product/asset/documents/download/05b3ee22-5849-4ff6-8f27-fb119236ca4b/SignalMarketProductAsset_DisplayImage_1757330636486.png" alt="" />
            <span class="dep-fig-method-item-text">
              <span class="dep-fig-method-item-title">Credit Card Deposit</span>
              <span class="dep-fig-method-item-sub">Visa / Mastercard</span>
            </span>
          </button>`);
      }
      if (payMethodLemux) {
        menuParts.push(`
          <button type="button" class="dep-fig-method-item${currentPayMethod === 'lemux' ? ' is-active' : ''}" data-method="lemux" role="option">
            <img src="/assets/images/LemuxionPay.jpg" alt="" />
            <span class="dep-fig-method-item-text">
              <span class="dep-fig-method-item-title">Lemuxion Deposit</span>
              <span class="dep-fig-method-item-sub">${escapeHtml(payMethodLemux.title || 'LemuxionPay')}</span>
            </span>
          </button>`);
      }
      if (payMethodCrypto) {
        menuParts.push(`
          <button type="button" class="dep-fig-method-item${currentPayMethod === 'crypto' ? ' is-active' : ''}" data-method="crypto" role="option">
            <img src="/assets/images/CryptoPay.jpg" alt="" />
            <span class="dep-fig-method-item-text">
              <span class="dep-fig-method-item-title">Cryptopay Deposit</span>
              <span class="dep-fig-method-item-sub">${escapeHtml(payMethodCrypto.title || 'CryptoPay')}</span>
            </span>
          </button>`);
      }

      if (depMethodMenu) {
        depMethodMenu.innerHTML = menuParts.join('') || '<div class="px-3 py-2 text-muted small">No methods configured.</div>';
      }

      if (payMethodCard) renderCardChips(payMethodCard);
      else if (depCardChips) depCardChips.innerHTML = '';

      const first =
        (payMethodCard && 'card') ||
        (payMethodLemux && 'lemux') ||
        (payMethodCrypto && 'crypto') ||
        null;
      if (first) {
        setPayMethod(first);
        if (first === 'lemux') void prepareLemuxPanel();
        if (first === 'crypto') void prepareCryptoPanel();
      } else {
        setPayMethod(null);
      }

      syncTpToForms();
      centerCarets(mount);
    } catch (e) {
      console.error('payment methods error', e);
      if (depMethodMenu) depMethodMenu.innerHTML = '<div class="px-3 py-2 text-danger small">Failed to load payment methods</div>';
      if (depCardChips) depCardChips.innerHTML = '';
    }
  }

  // ===== CryptoPay helpers =====
  async function loadCryptoSupportedCoins(){
    try{
      const res = await fetch('api/payments/get_crypto_supported_coins.php', { headers: { 'Accept':'application/json' }});
      const json = await res.json();
      cryptoCoins = Array.isArray(json.data) ? json.data : [];
    }catch(e){ console.error('crypto supported coins error', e); }
  }
  function fillModalTpSelect() {
    const el = cpTpSelect();
    const opts = [`<option value="" disabled selected>Select a Tp number</option>`];
    for (const a of accountsList) if (a.tpNumber) opts.push(`<option value="${a.tpNumber}">${a.tpNumber}</option>`);
    el.innerHTML = opts.join('');
    if (tpSelect.value) el.value = tpSelect.value;
  }
  function fillModalFiats() {
    const el = cpFiat();
    const list = cryptoSupportedFiats.length ? cryptoSupportedFiats : ['EUR','USD','GBP'];
    el.innerHTML = [`<option value="" disabled selected>Select Fiat Currency</option>`, ...list.map(c => `<option value="${c}">${c}</option>`)].join('');
  }
  function fillModalCryptos() {
    const el = cpCrypto();
    el.innerHTML = [`<option value="" disabled selected>Select Crypto</option>`,
      ...cryptoCoins.map(c => `<option value="${c.currency}">${c.name} (${c.currency})</option>`)].join('');
  }
  function fillNetworksFor(coinCode) {
    const el = cpNetwork();
    const star = document.getElementById('cpNetworkRequiredStar');
    if (!coinCode) {
      el.innerHTML = `<option value="" disabled selected>Select Network</option>`;
      if (star) star.style.display = 'none';
      el.setAttribute('aria-required', 'false');
      return;
    }
    const coin = cryptoCoins.find(c => c.currency === coinCode);
    const nets = coin?.networks || [];
    el.innerHTML = [`<option value="" disabled selected>Select Network</option>`,
      ...nets.map(n => `<option value="${n.network}">${n.name}</option>`)].join('');
    if (star) star.style.display = nets.length ? '' : 'none';
    el.setAttribute('aria-required', nets.length ? 'true' : 'false');
  }

  /** True when selected crypto has at least one network (must pick one). */
  function isCpNetworkRequired() {
    const code = cpCrypto().value || '';
    if (!code) return false;
    const coin = cryptoCoins.find(c => c.currency === code);
    return (coin?.networks || []).length > 0;
  }
  function setInvalid(el, hintEl, state){
    if (state) { el.classList.add('is-invalid'); hintEl?.classList.add('show-hint'); }
    else       { el.classList.remove('is-invalid'); hintEl?.classList.remove('show-hint'); }
  }

  // ===== LemuxionPay — Countries / States / Cities (countriesnow.space) =====
  const CN_ENDPOINT = 'https://countriesnow.space/api/v0.1';
  let CN_COUNTRIES = null;            // [{country}, ...]
  const CN_STATES   = new Map();      // countryName -> [{name}, ...]
  const CN_CITIES   = new Map();      // country|state -> [city,...]

  async function ensureCountryList() {
    if (CN_COUNTRIES) return CN_COUNTRIES;
    try {
      const r = await fetch(`${CN_ENDPOINT}/countries`);
      const j = await r.json();
      const list = Array.isArray(j?.data) ? j.data : [];
      CN_COUNTRIES = list.map(x => ({ country: x.country }));
      return CN_COUNTRIES;
    } catch (e) {
      console.error('[Countries] load failed', e);
      CN_COUNTRIES = [];
      return CN_COUNTRIES;
    }
  }
  async function loadStatesFor(countryName) {
    if (!countryName) return [];
    if (CN_STATES.has(countryName)) return CN_STATES.get(countryName);
    try {
      const r = await fetch(`${CN_ENDPOINT}/countries/states`, {
        method: 'POST', headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ country: countryName })
      });
      const j = await r.json();
      const arr = Array.isArray(j?.data?.states) ? j.data.states : [];
      CN_STATES.set(countryName, arr);
      return arr;
    } catch (e) {
      console.error('[States] load failed', e);
      CN_STATES.set(countryName, []);
      return [];
    }
  }
  async function loadCitiesFor(countryName, stateName) {
    const key = `${countryName}|${stateName}`;
    if (CN_CITIES.has(key)) return CN_CITIES.get(key);
    try {
      const r = await fetch(`${CN_ENDPOINT}/countries/state/cities`, {
        method: 'POST', headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ country: countryName, state: stateName })
      });
      const j = await r.json();
      const arr = Array.isArray(j?.data) ? j.data : [];
      CN_CITIES.set(key, arr);
      return arr;
    } catch (e) {
      console.error('[Cities] load failed', e);
      CN_CITIES.set(key, []);
      return [];
    }
  }

  // ISO-2 derivation for backend
  const ISO2_CODES = [
    'AD','AE','AF','AG','AI','AL','AM','AO','AQ','AR','AS','AT','AU','AW','AX','AZ',
    'BA','BB','BD','BE','BF','BG','BH','BI','BJ','BL','BM','BN','BO','BQ','BR','BS','BT','BV','BW','BY','BZ',
    'CA','CC','CD','CF','CG','CH','CI','CK','CL','CM','CN','CO','CR','CU','CV','CW','CX','CY','CZ',
    'DE','DJ','DK','DM','DO','DZ',
    'EC','EE','EG','EH','ER','ES','ET',
    'FI','FJ','FK','FM','FO','FR',
    'GA','GB','GD','GE','GF','GG','GH','GI','GL','GM','GN','GP','GQ','GR','GS','GT','GU','GW','GY',
    'HK','HM','HN','HR','HT','HU',
    'ID','IE','IL','IM','IN','IO','IQ','IR','IS','IT',
    'JE','JM','JO','JP',
    'KE','KG','KH','KI','KM','KN','KP','KR','KW','KY','KZ',
    'LA','LB','LC','LI','LK','LR','LS','LT','LU','LV','LY',
    'MA','MC','MD','ME','MF','MG','MH','MK','ML','MM','MN','MO','MP','MQ','MR','MS','MT','MU','MV','MW','MX','MY','MZ',
    'NA','NC','NE','NF','NG','NI','NL','NO','NP','NR','NU','NZ',
    'OM',
    'PA','PE','PF','PG','PH','PK','PL','PM','PN','PR','PS','PT','PW','PY',
    'QA',
    'RE','RO','RS','RU','RW',
    'SA','SB','SC','SD','SE','SG','SH','SI','SJ','SK','SL','SM','SN','SO','SR','SS','ST','SV','SX','SY','SZ',
    'TC','TD','TF','TG','TH','TJ','TK','TL','TM','TN','TO','TR','TT','TV','TW','TZ',
    'UA','UG','UM','US','UY','UZ',
    'VA','VC','VE','VG','VI','VN','VU',
    'WF','WS',
    'YE','YT',
    'ZA','ZM','ZW'
  ];
  function iso2FromCountryName(name) {
    if (!name) return '';
    try {
      const dn = new Intl.DisplayNames(['en'], { type: 'region' });
      const target = name.trim().toLowerCase();
      for (const code of ISO2_CODES) {
        if ((dn.of(code) || '').trim().toLowerCase() === target) return code;
      }
      const aliases = {
        'united states':'US','united states of america':'US','u.s.a.':'US',
        'united kingdom':'GB','uk':'GB','south korea':'KR','north korea':'KP',
        'russia':'RU','laos':'LA',"cote d'ivoire":'CI','ivory coast':'CI',
        'bolivia':'BO','tanzania':'TZ','venezuela':'VE'
      };
      if (aliases[target]) return aliases[target];
    } catch {}
    return '';
  }
  function readCountryISO2() {
    const sel = document.getElementById('lemuxCountry');
    const label = sel.options[sel.selectedIndex]?.text || sel.value || '';
    const code = iso2FromCountryName(label);
    if (code) return code;
    if ((sel.value || '').length === 2) return sel.value.toUpperCase();
    return (sel.value || '').trim();
  }

  // validator (works with your .invalid hints)
  function markInvalid(id, on) {
    const el = document.getElementById(id);
    if (!el) return;
    if (on) el.classList.add('is-invalid'); else el.classList.remove('is-invalid');
    const hint = el.closest('.dep-select-wrap2')?.nextElementSibling || el.nextElementSibling;
    if (hint && hint.classList.contains('invalid')) hint.style.display = on ? 'block' : 'none';
  }

  /** City uses select OR text; validate the visible control and shared hint (original behavior). */
  function markInvalidLemuxCity(on) {
    const citySel = document.getElementById('lemuxCitySel');
    const cityTxt = document.getElementById('lemuxCity');
    const block = citySel?.closest('.dep-fig-field-full');
    const hint = block?.querySelector('.invalid.small');
    [citySel, cityTxt].forEach(node => {
      if (node) node.classList.remove('is-invalid');
    });
    if (!on) {
      if (hint) hint.style.display = 'none';
      return;
    }
    const primary = citySel && citySel.style.display !== 'none' ? citySel : cityTxt;
    if (primary) primary.classList.add('is-invalid');
    if (hint) hint.style.display = 'block';
  }

  function fillLemuxTp() {
    const el = document.getElementById('lemuxTp');
    el.innerHTML =
      `<option value="" selected disabled>Select a Tp number</option>` +
      accountsList.filter(a => a.tpNumber).map(a => `<option value="${a.tpNumber}">${a.tpNumber}</option>`).join('');
    if (tpSelect.value) el.value = tpSelect.value;
  }
  function fillLemuxCurr() {
    const el = document.getElementById('lemuxCurrency');
    const list = lemuxSupportedFiats.length ? lemuxSupportedFiats : ['EUR','USD','GBP','AUD'];
    el.innerHTML = [`<option value="" selected disabled>Select Currency</option>`,
      ...list.map(c => `<option value="${c}">${c}</option>`)].join('');
  }

  // Populate Country / bind change handlers every time the Lemux modal opens
  async function initCountriesStatesCities() {
    const countryEl = document.getElementById('lemuxCountry');
    const stateEl   = document.getElementById('lemuxState');
    const citySel   = document.getElementById('lemuxCitySel');
    const cityTxt   = document.getElementById('lemuxCity');

    // placeholders immediately
    countryEl.innerHTML = `<option value="" disabled selected>Loading countries…</option>`;
    stateEl.innerHTML   = `<option value="" disabled selected>Select State</option>`;
    if (citySel) citySel.innerHTML = `<option value="" disabled selected>Select City</option>`;
    if (citySel) citySel.style.display = '';
    if (cityTxt) { cityTxt.style.display = 'none'; cityTxt.value = ''; }

    // load countries async
    const list = await ensureCountryList();
    if (list.length) {
      countryEl.innerHTML = [`<option value="" disabled selected>Select Country</option>`,
        ...list.map(c => `<option value="${c.country}">${c.country}</option>`)].join('');
    } else {
      // fallback
      countryEl.innerHTML =
        `<option value="United States">United States</option>
         <option value="United Kingdom">United Kingdom</option>
         <option value="Germany">Germany</option>
         <option value="France">France</option>
         <option value="India">India</option>
         <option value="Pakistan">Pakistan</option>
         <option value="Australia">Australia</option>`;
    }
    centerCarets(depPanelLemux || mount);

    // country change -> states
    countryEl.onchange = async () => {
      stateEl.innerHTML = `<option value="" disabled selected>Loading states…</option>`;
      if (citySel) citySel.innerHTML = `<option value="" disabled selected>Select City</option>`;
      if (citySel) citySel.style.display = '';
      if (cityTxt) { cityTxt.style.display = 'none'; cityTxt.value = ''; }

      const states = await loadStatesFor(countryEl.value);
      if (states.length) {
        stateEl.innerHTML = [`<option value="" disabled selected>Select State</option>`,
          ...states.map(s => `<option value="${s.name}">${s.name}</option>`)].join('');
      } else {
        stateEl.innerHTML = `<option value="" disabled selected>No states</option>`;
      }
      centerCarets(depPanelLemux || mount);
    };

    // state change -> cities (fallback to free text if none)
    stateEl.onchange = async () => {
      if (!citySel || !cityTxt) return;
      citySel.innerHTML = `<option value="" disabled selected>Loading cities…</option>`;
      citySel.style.display = '';
      cityTxt.style.display = 'none';
      cityTxt.value = '';

      const cities = await loadCitiesFor(countryEl.value, stateEl.value);
      if (cities.length) {
        citySel.innerHTML = [`<option value="" disabled selected>Select City</option>`,
          ...cities.map(c => `<option value="${c}">${c}</option>`)].join('');
      } else {
        citySel.style.display = 'none';
        cityTxt.style.display = '';
        cityTxt.value = '';
      }
      centerCarets(depPanelLemux || mount);
    };
  }

  /** Inline Lemux panel: reset fields, sync TP, load country list once */
  async function prepareLemuxPanel() {
    if (!depPanelLemux) return;

    ['lemuxAmount', 'lemuxDesc', 'lemuxCity', 'lemuxStreet', 'lemuxZip'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });

    fillLemuxTp();
    fillLemuxCurr();
    syncTpToForms();

    document.querySelectorAll('#depPanelLemux .invalid').forEach(n => { n.style.display = 'none'; });
    document.querySelectorAll('#depPanelLemux .is-invalid').forEach(n => n.classList.remove('is-invalid'));
    document.getElementById('lemuxCitySel')?.classList.remove('is-invalid');
    document.getElementById('lemuxCity')?.classList.remove('is-invalid');
    const msgEl = document.getElementById('lemuxMsg');
    if (msgEl) {
      msgEl.textContent = '';
      msgEl.className = 'small mt-2 text-center';
    }

    centerCarets(depPanelLemux);
    await initCountriesStatesCities();
  }

  /** Inline Crypto panel */
  async function prepareCryptoPanel() {
    if (!document.getElementById('cryptoPayForm')) return;
    cpTpSelect().innerHTML = `<option value="" disabled selected>Loading…</option>`;
    cpFiat().innerHTML = `<option value="" disabled selected>Loading…</option>`;
    cpCrypto().innerHTML = `<option value="" disabled selected>Loading…</option>`;
    cpNetwork().innerHTML = `<option value="" disabled selected>Network</option>`;
    const cpAmt = cpAmount();
    if (cpAmt) cpAmt.value = '';
    document.querySelectorAll('#depPanelCrypto .invalid-hint').forEach((h) => h.classList.remove('show-hint'));
    [cpTpSelect(), cpFiat(), cpAmount(), cpCrypto(), cpNetwork()].forEach((el) => {
      if (el) el.classList.remove('is-invalid');
    });
    const netStar = document.getElementById('cpNetworkRequiredStar');
    if (netStar) netStar.style.display = 'none';
    cpNetwork().setAttribute('aria-required', 'false');
    cpMsg().textContent = '';
    centerCarets(depPanelCrypto || mount);

    await loadCryptoSupportedCoins();
    fillModalTpSelect();
    fillModalFiats();
    fillModalCryptos();
    fillNetworksFor('');
    syncTpToForms();
  }

  depMethodBtn?.addEventListener('click', e => {
    e.stopPropagation();
    toggleMethodMenu();
  });

  depMethodMenu?.addEventListener('click', async e => {
    const item = e.target.closest('.dep-fig-method-item');
    if (!item) return;
    const m = item.getAttribute('data-method');
    if (!m) return;
    setPayMethod(m);
    if (m === 'lemux') await prepareLemuxPanel();
    if (m === 'crypto') await prepareCryptoPanel();
  });

  document.addEventListener('click', e => {
    if (e.target.closest('.dep-fig-method-section')) return;
    closeMethodMenu();
  });

  depCardChips?.addEventListener('click', e => {
    const chip = e.target.closest('.dep-fig-chip');
    if (!chip) return;
    if (!hasTpSelected()) {
      showTpRequired();
      return;
    }
    depCardChips.querySelectorAll('.dep-fig-chip').forEach(c => c.classList.remove('is-selected'));
    chip.classList.add('is-selected');
    const amt = chip.getAttribute('data-amount') || '';
    if (depCardAmountMirror) depCardAmountMirror.value = amt ? '$' + amt : '';
    const url = chip.getAttribute('data-href');
    if (!url) return;
    const tp = tpSelect.value || '';
    const finalUrl = tp ? appendParam(url, 'tp', tp) : url;
    window.open(finalUrl, '_blank', 'noopener');
  });

  // Crypto modal change / input — clear inline validation like other fields
  document.addEventListener('change', (e)=>{
    if (e.target?.id === 'cpCrypto') {
      const code = cpCrypto().value || '';
      fillNetworksFor(code);
      setInvalid(cpCrypto(), document.getElementById('cpCryptoHint'), !code);
      const netReq = isCpNetworkRequired();
      setInvalid(cpNetwork(), document.getElementById('cpNetworkHint'), netReq && !(cpNetwork().value || '').trim());
    }
    if (e.target?.id === 'cpTpSelect') {
      const val = cpTpSelect().value || '';
      setInvalid(cpTpSelect(), document.getElementById('cpTpHint'), !val);
    }
    if (e.target?.id === 'cpFiat') {
      setInvalid(cpFiat(), document.getElementById('cpFiatHint'), !(cpFiat().value || '').trim());
    }
    if (e.target?.id === 'cpNetwork') {
      const netReq = isCpNetworkRequired();
      setInvalid(cpNetwork(), document.getElementById('cpNetworkHint'), netReq && !(cpNetwork().value || '').trim());
    }
  });
  document.addEventListener('input', (e) => {
    if (e.target?.id === 'cpAmount') {
      const raw = (cpAmount().value || '').toString().trim();
      const n = Number(raw);
      const bad = !raw || Number.isNaN(n) || n <= 0;
      setInvalid(cpAmount(), document.getElementById('cpAmountHint'), bad);
    }
    if (e.target?.id === 'lemuxDesc') {
      const ok = !!(e.target.value || '').trim();
      markInvalid('lemuxDesc', !ok);
    }
  });

  // CryptoPay submit (with button loading state)
  document.getElementById('cryptoPayForm')?.addEventListener('submit', async (e)=>{
    e.preventDefault();
    syncTpToForms();
    if (!hasTpSelected()) {
      showTpRequired();
      return;
    }
    const tp = (cpTpSelect().value || tpSelect.value || '').trim();
    const crypto = cpCrypto().value || '';
    const network = (cpNetwork().value || '').trim();
    const fiat = (cpFiat().value || '').trim();
    const amountStr = (cpAmount().value || '').toString().trim();
    const amountNum = Number(amountStr);
    const netRequired = isCpNetworkRequired();

    const tpInvalid = !tp;
    const cryptoInvalid = !crypto;
    const fiatInvalid = !fiat;
    const amountInvalid = !amountStr || Number.isNaN(amountNum) || amountNum <= 0;
    const networkInvalid = netRequired && !network;

    setInvalid(cpTpSelect(), document.getElementById('cpTpHint'), tpInvalid);
    setInvalid(cpFiat(), document.getElementById('cpFiatHint'), fiatInvalid);
    setInvalid(cpAmount(), document.getElementById('cpAmountHint'), amountInvalid);
    setInvalid(cpCrypto(), document.getElementById('cpCryptoHint'), cryptoInvalid);
    setInvalid(cpNetwork(), document.getElementById('cpNetworkHint'), networkInvalid);
    if (tpInvalid || cryptoInvalid || fiatInvalid || amountInvalid || networkInvalid) return;

    const acc = accByTp.get(tp);
    if (!acc) { alert('Selected TP not found.'); return; }

    const btn = e.submitter || e.target.querySelector('[type="submit"]');
    const prev = btn.innerHTML; btn.disabled = true; btn.innerHTML = 'Submitting…';

    cpMsg().className = 'small mt-2 text-muted text-center';
    cpMsg().textContent = 'Creating invoice…';

    try{
      const res = await fetch('api/payments/create_crypto_invoice.php', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          accountId: acc.id,
          payCurrency: crypto,
          amount: amountStr,
          priceCurrency: fiat,
          network: network || undefined
        })
      });
      const data = await res.json();
      if (!res.ok || data.status === 'error') {
        cpMsg().className = 'small mt-2 text-danger text-center';
        cpMsg().textContent = data.message || 'Failed to create invoice.';
        return;
      }
      const url = data.data?.hosted_page_url || data.data?.url;
      cpMsg().className = 'small mt-2 text-success text-center';
      cpMsg().textContent = 'Invoice created. Opening…';
      if (url) window.open(url, '_blank', 'noopener');
    }catch(err){
      console.error(err);
      cpMsg().className = 'small mt-2 text-danger text-center';
      cpMsg().textContent = 'Network error. Please try again.';
    } finally {
      btn.disabled = false; btn.innerHTML = prev;
    }
  });

  // LemuxionPay submit (open checkout in new tab; button loading state)
  document.getElementById('lemuxForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    syncTpToForms();
    if (!hasTpSelected()) {
      showTpRequired();
      return;
    }

    const tp   = document.getElementById('lemuxTp').value;
    const acc  = tp ? accByTp.get(tp) : null;
    const currency = document.getElementById('lemuxCurrency').value;
    const amountStr = (document.getElementById('lemuxAmount').value || '').trim();
    const amountNum = Number(amountStr);
    const desc     = (document.getElementById('lemuxDesc').value || '').trim();

    const stateSel   = document.getElementById('lemuxState');
    const citySel    = document.getElementById('lemuxCitySel');
    const cityTxt    = document.getElementById('lemuxCity');

    const country  = readCountryISO2();
    const state    = stateSel.value || '';
    const city     = (citySel && citySel.style.display !== 'none') ? (citySel.value || '') : (cityTxt.value || '');
    const street   = (document.getElementById('lemuxStreet').value || '').trim();
    const zip      = (document.getElementById('lemuxZip').value || '').trim();

    const msgEl    = document.getElementById('lemuxMsg');

    // validate
    let bad = false;
    markInvalid('lemuxTp', !acc);               bad = bad || !acc;
    markInvalid('lemuxCurrency', !currency);    bad = bad || !currency;
    const amountOk = !!(amountStr && !Number.isNaN(amountNum) && amountNum > 0);
    markInvalid('lemuxAmount', !amountOk);      bad = bad || !amountOk;
    const countryOk = !!country && country.length >= 2;
    markInvalid('lemuxCountry', !countryOk);    bad = bad || !countryOk;
    markInvalid('lemuxState', !state);          bad = bad || !state;
    markInvalidLemuxCity(!city);                bad = bad || !city;
    markInvalid('lemuxStreet', !street);        bad = bad || !street;
    markInvalid('lemuxZip', !zip);              bad = bad || !zip;
    markInvalid('lemuxDesc', !desc);            bad = bad || !desc;
    if (bad) return;

    const btn = e.submitter || e.target.querySelector('[type="submit"]');
    const prev = btn.innerHTML; btn.disabled = true; btn.innerHTML = 'Submitting…';

    msgEl.textContent = 'Creating payment...';
    msgEl.className = 'small mt-2 text-muted text-center';

    try {
      const res = await fetch('api/payments/lemuxion_create.php', {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({
          accountId: acc.id,
          amount: amountNum,
          currency,
          description: desc || null,
          street, city, zip, state, country
        })
      });

      let data;
      try { data = await res.json(); }
      catch { data = { status: 'error', message: await res.text() }; }

      if (!res.ok || data.status === 'error') {
        msgEl.textContent = data.message || `Request failed (${res.status}).`;
        msgEl.className = 'small mt-2 text-danger text-center';
        return;
      }

      msgEl.textContent = 'Payment created!';
      msgEl.className = 'small mt-2 text-success text-center';

      const url =
        data?.data?.hosted_page_url ||
        data?.data?.redirectUrl     ||
        data?.data?.redirectURL     ||
        data?.hosted_page_url       ||
        data?.redirectUrl           ||
        data?.redirectURL           ||
        data?.data?.url             ||
        data?.url;

      if (url) window.open(url, '_blank', 'noopener');
    } catch (err) {
      console.error(err);
      msgEl.textContent = 'Network error.';
      msgEl.className = 'small mt-2 text-danger text-center';
    } finally {
      btn.disabled = false; btn.innerHTML = prev;
    }
  });

  function appendParam(url, key, val){
    try { const u = new URL(url); u.searchParams.set(key, val); return u.toString(); }
    catch { const j = url.includes('?') ? '&' : '?'; return `${url}${j}${encodeURIComponent(key)}=${encodeURIComponent(val)}`; }
  }

  function clearTpError() {
    const err = document.getElementById('depTpError');
    const wrap = document.getElementById('depTpWrap');
    if (err) {
      err.hidden = true;
    }
    if (wrap) wrap.classList.remove('dep-tp-wrap--error');
    if (tpSelect) {
      tpSelect.classList.remove('is-invalid');
      tpSelect.setAttribute('aria-invalid', 'false');
    }
  }

  function showTpRequired() {
    const err = document.getElementById('depTpError');
    const wrap = document.getElementById('depTpWrap');
    if (err) {
      err.hidden = false;
      err.textContent = 'Please select a TP number.';
    }
    if (wrap) wrap.classList.add('dep-tp-wrap--error');
    if (tpSelect) {
      tpSelect.classList.add('is-invalid');
      tpSelect.setAttribute('aria-invalid', 'true');
      tpSelect.focus();
      try {
        tpSelect.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } catch (_) {}
    }
  }

  function hasTpSelected() {
    const v = (tpSelect?.value || '').trim();
    return v.length > 0;
  }

  // header TP -> balance + hidden form selects
  tpSelect.addEventListener('change', () => {
    clearTpError();
    updateHeaderBalance(tpSelect.value || '');
    syncTpToForms();
  });

  // ===== Deposit History logic (inside this tab) =====
  ensureHistoryHost();

  const TXN_ENDPOINT = 'api/payments/get_transactions.php'; // <-- implement server proxy to primecrm.io here

  let histAll = [];          // all fetched (unfiltered)
  let histView = 'All';      // All | Approved | Pending | Rejected
  let histPage = 1;
  const histPageSize = 10;
  let histTpFilter = '';     // specific tp or ''

  function uiMapStatus(s) {
    // map API "Completed" to UI "Approved"
    if (!s) return '—';
    if (s === 'Completed') return 'Approved';
    return s;
  }
  function badgeForStatus(s) {
    const m = uiMapStatus(s);
    if (m === 'Approved') return '<span class="dep-status dep-status--approved">Approved</span>';
    if (m === 'Pending') return '<span class="dep-status dep-status--pending">Pending</span>';
    if (m === 'Rejected') return '<span class="dep-status dep-status--rejected">Rejected</span>';
    return `<span class="dep-status dep-status--neutral">${escapeHtml(String(m))}</span>`;
  }
  function sortForAll(a, b) {
    // Approved first, then Pending, then Rejected, then others by date DESC
    const order = (st) => (st==='Completed'?0: st==='Pending'?1: st==='Rejected'?2: 3);
    const ao = order(a.status), bo = order(b.status);
    if (ao !== bo) return ao - bo;
    return (new Date(b.createdAt)) - (new Date(a.createdAt));
  }

  function applyFilters() {
    let arr = histAll.slice();
    if (histTpFilter) arr = arr.filter(x => String(x.tpNumber) === String(histTpFilter));
    if (histView !== 'All') {
      if (histView === 'Approved') arr = arr.filter(x => x.status === 'Completed');
      else arr = arr.filter(x => uiMapStatus(x.status) === histView);
    }
    if (histView === 'All') arr.sort(sortForAll);
    else arr.sort((a,b)=> (new Date(b.createdAt)) - (new Date(a.createdAt)));
    return arr;
  }

  /** Deposit history pager — same rules as Home Recent Transactions (CP_compactPaginationHtml). */
  function renderPager(total) {
    const pages = Math.max(1, Math.ceil(total / histPageSize));
    if (histPage > pages) histPage = pages;
    const cur = Math.min(Math.max(1, histPage), pages);
    histPage = cur;

    const host = document.getElementById('histPager');
    if (!host) return;

    if (pages <= 1) {
      host.innerHTML = '';
    } else if (typeof window.CP_compactPaginationHtml === 'function') {
      const { html } = window.CP_compactPaginationHtml(total, histPage, histPageSize, 'hist-page');
      host.innerHTML = `<div class="dash-pagination dep-hist-dpagination">${html}</div>`;
      window.CP_attachDashPagination?.(host.firstElementChild, 'hist-page', (p) => {
        histPage = p;
        renderHistoryTable();
      });
    } else {
      host.innerHTML = `<div class="dash-pagination dep-hist-dpagination">${renderHistPaginationButtonsLegacy(pages, cur)}</div>`;
      host.querySelectorAll('.dash-page-btn[data-hist-page]').forEach((btn) => {
        btn.addEventListener('click', () => {
          if (btn.disabled) return;
          const p = parseInt(btn.getAttribute('data-hist-page'), 10);
          if (Number.isNaN(p)) return;
          histPage = p;
          renderHistoryTable();
        });
      });
    }

    const sum = document.getElementById('histSummary');
    sum.textContent = `${total} record${total === 1 ? '' : 's'} • page ${histPage} of ${pages}`;
  }

  /** Fallback only if cp-pagination.js failed to load (keeps previous deposit-specific window). */
  function renderHistPaginationButtonsLegacy(pages, cur) {
    let html = '';
    html += `<button type="button" class="dash-page-btn dash-page-btn--arrow" ${cur <= 1 ? 'disabled' : ''} data-hist-page="${cur - 1}" aria-label="Previous">&lt;</button>`;
    const ell = `<span class="dash-page-ellipsis" aria-hidden="true">…</span>`;
    if (pages <= 6) {
      for (let p = 1; p <= pages; p++) {
        html += `<button type="button" class="dash-page-btn${p === cur ? ' is-active' : ''}" data-hist-page="${p}">${p}</button>`;
      }
    } else if (cur <= 2) {
      for (let p = 1; p <= 2; p++) {
        html += `<button type="button" class="dash-page-btn${p === cur ? ' is-active' : ''}" data-hist-page="${p}">${p}</button>`;
      }
      html += ell;
      html += `<button type="button" class="dash-page-btn${pages === cur ? ' is-active' : ''}" data-hist-page="${pages}">${pages}</button>`;
    } else if (cur === 3) {
      for (let p = 1; p <= 3; p++) {
        html += `<button type="button" class="dash-page-btn${p === cur ? ' is-active' : ''}" data-hist-page="${p}">${p}</button>`;
      }
      html += ell;
      html += `<button type="button" class="dash-page-btn${pages === cur ? ' is-active' : ''}" data-hist-page="${pages}">${pages}</button>`;
    } else if (cur >= pages - 1) {
      html += `<button type="button" class="dash-page-btn${cur === 1 ? ' is-active' : ''}" data-hist-page="1">1</button>`;
      html += ell;
      for (let p = pages - 1; p <= pages; p++) {
        html += `<button type="button" class="dash-page-btn${p === cur ? ' is-active' : ''}" data-hist-page="${p}">${p}</button>`;
      }
    } else if (cur === pages - 2) {
      html += `<button type="button" class="dash-page-btn${cur === 1 ? ' is-active' : ''}" data-hist-page="1">1</button>`;
      html += ell;
      for (let p = pages - 2; p <= pages; p++) {
        html += `<button type="button" class="dash-page-btn${p === cur ? ' is-active' : ''}" data-hist-page="${p}">${p}</button>`;
      }
    } else {
      html += `<button type="button" class="dash-page-btn${cur === 1 ? ' is-active' : ''}" data-hist-page="1">1</button>`;
      html += ell;
      for (let p = cur - 1; p <= cur + 1; p++) {
        html += `<button type="button" class="dash-page-btn${p === cur ? ' is-active' : ''}" data-hist-page="${p}">${p}</button>`;
      }
    }
    html += `<button type="button" class="dash-page-btn dash-page-btn--arrow" ${cur >= pages ? 'disabled' : ''} data-hist-page="${cur + 1}" aria-label="Next">&gt;</button>`;
    return html;
  }

  function renderHistoryTable() {
    const body = document.getElementById('histTBody');
    const list = applyFilters();
    renderPager(list.length);

    const start = (histPage-1)*histPageSize;
    const pageRows = list.slice(start, start+histPageSize);

    if (!pageRows.length) {
      body.innerHTML = `<tr><td colspan="8" class="text-center py-4 text-muted">No records</td></tr>`;
      return;
    }

    body.innerHTML = pageRows.map(r=>{
      const when = formatCompactDepositDate(r.createdAt);
      const type = r.type || '—';
      const comment = r.comment || '—';
      const amt = Number(r.amount || 0);
      const viewBtn = `<button class="btn btn-outline-secondary btn-sm" data-view-id="${r.id}"><i class="bi bi-eye"></i> View</button>`;
      return `
        <tr>
          <td>${when}</td>
          <td>${r.tpNumber || '—'}</td>
          <td>${type}</td>
          <td>${badgeForStatus(r.status)}</td>
          <td class="text-end">${amt.toLocaleString(undefined,{minimumFractionDigits:0,maximumFractionDigits:2})}</td>
          <td>${r.currency || '—'}</td>
          <td>${comment}</td>
          <td>${viewBtn}</td>
        </tr>
      `;
    }).join('');

    // Bind view buttons
    body.querySelectorAll('[data-view-id]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const id = btn.getAttribute('data-view-id');
        const rec = histAll.find(x => x.id === id);
        if (!rec) return;
        showTxnDetails(rec);
      });
    });
  }

  // Simple details modal (lazy create)
  function showTxnDetails(rec){
    let modal = document.getElementById('histViewModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'histViewModal';
      modal.className = 'modal fade';
      modal.tabIndex = -1;
      modal.innerHTML = `
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content cp-modal">
            <div class="modal-header border-0">
              <h5 class="modal-title fw-semibold"><i class="bi bi-receipt"></i> Transaction Details</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <div id="histViewBody" class="small"></div>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }
    const b = document.getElementById('histViewBody');
    const rows = [
      ['ID', rec.id],
      ['Date', new Date(rec.createdAt).toLocaleString()],
      ['TP Number', rec.tpNumber || '—'],
      ['Type', rec.type || '—'],
      ['Status', uiMapStatus(rec.status)],
      ['Amount', `${rec.amount||0} ${rec.currency||''}`.trim()],
      ['Comment', rec.comment || '—'],
      ['Reject Type', rec.rejectType || '—'],
      ['Reject Reason', rec.rejectReason || '—'],
      ['Account ID', rec.accountId || '—'],
      ['Original Currency', rec.originalCurrency || '—']
    ];
    b.innerHTML = `
      <div class="table-responsive">
        <table class="table table-sm mb-0">
          <tbody>
            ${rows.map(([k,v])=>`
              <tr>
                <th class="text-muted" style="width:170px">${k}</th>
                <td>${v}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
    new bootstrap.Modal(modal).show();
  }

  async function fetchTransactions() {
    // Implement server proxy in api/payments/get_transactions.php that attaches Bearer and calls:
    //   https://c20900-backend-clientzone.primecrm.io/api/v1/clientzone/lead/account/transactions
    // Return shape: { data: [ ... ] }
    try {
      const res = await fetch(TXN_ENDPOINT, { headers: { 'Accept':'application/json' }});
      const j = await res.json();
      const arr = Array.isArray(j?.data) ? j.data : Array.isArray(j) ? j : [];
      // keep only deposits by default? — NO: show all types, you asked for all. Sorting will bring Approved first.
      histAll = arr.slice().sort(sortForAll);
    } catch (e) {
      console.error('transactions fetch error', e);
      histAll = [];
    }
    renderSidePreview();
  }

  /** All rows matching current account + status filters (not only the current HTML page). */
  function buildDepositHistoryExportTableHtml() {
    const list = applyFilters();
    if (!list.length) return null;
    const headCells = ['Date', 'TP Number', 'Type', 'Status', 'Amount', 'Currency', 'Comment'];
    const thead = `<thead><tr>${headCells.map((c) => `<th>${c}</th>`).join('')}</tr></thead>`;
    const rows = list
      .map((r) => {
        const when = formatCompactDepositDate(r.createdAt);
        const amt = Number(r.amount || 0).toLocaleString(undefined, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        });
        return `<tr>
          <td>${escapeHtml(when)}</td>
          <td>${escapeHtml(String(r.tpNumber ?? '—'))}</td>
          <td>${escapeHtml(String(r.type || '—'))}</td>
          <td>${escapeHtml(uiMapStatus(r.status))}</td>
          <td class="text-end">${escapeHtml(amt)}</td>
          <td>${escapeHtml(String(r.currency || '—'))}</td>
          <td>${escapeHtml(String(r.comment || '—'))}</td>
        </tr>`;
      })
      .join('');
    const subtitle = `${list.length} record(s) · Filter: ${histView}${histTpFilter ? ` · Account ${histTpFilter}` : ''}`;
    return { tableHtml: `<table>${thead}<tbody>${rows}</tbody></table>`, subtitle };
  }

  /**
   * Print → “Save as PDF” in the browser.
   * Uses a hidden iframe instead of window.open: pop-up blockers + noopener often leave about:blank
   * or block document.write on the new window; iframe stays same-origin and needs no pop-ups.
   */
  function openDepositHistoryPrintExport() {
    const payload = buildDepositHistoryExportTableHtml();
    if (!payload) {
      window.alert('No records to export for the current filters.');
      return;
    }
    const style = `<style>
      body { font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; padding: 20px; color: #1e293b; }
      h1 { font-size: 1.25rem; margin: 0 0 8px; }
      .sub { font-size: 0.8125rem; color: #64748b; margin: 0 0 16px; }
      table { width: 100%; border-collapse: collapse; font-size: 12px; }
      thead th { background: #7b61ff; color: #fff; padding: 10px 8px; text-align: left; font-weight: 600; }
      tbody td { border: 1px solid #e2e8f0; padding: 8px; vertical-align: top; }
      tbody tr:nth-child(even) td { background: #f8fafc; }
      .text-end { text-align: right; }
      @media print { body { padding: 12px; } }
    </style>`;
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Deposit History</title>${style}</head><body>
      <h1>Deposit History</h1>
      <p class="sub">${escapeHtml(payload.subtitle)}</p>
      ${payload.tableHtml}
    </body></html>`;

    const iframe = document.createElement('iframe');
    iframe.setAttribute('aria-hidden', 'true');
    iframe.title = 'Deposit history print';
    iframe.style.cssText =
      'position:fixed;right:0;bottom:0;width:min(100%,900px);height:70vh;max-height:900px;border:0;opacity:0;pointer-events:none;z-index:-1;';

    document.body.appendChild(iframe);

    const win = iframe.contentWindow;
    const idoc = iframe.contentDocument || (win && win.document);
    const remove = () => {
      if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
    };
    if (!win || !idoc) {
      remove();
      window.alert('Could not prepare the report for printing. Try refreshing the page.');
      return;
    }
    idoc.open();
    idoc.write(html);
    idoc.close();

    const runPrint = () => {
      try {
        win.focus();
        win.print();
      } catch (err) {
        console.error('[deposit history] print failed', err);
        window.alert('Could not open the print dialog. Try again or use another browser.');
      }
      win.addEventListener('afterprint', remove, { once: true });
      setTimeout(remove, 4000);
    };

    if (win.document.readyState === 'complete') {
      setTimeout(runPrint, 150);
    } else {
      win.addEventListener('load', () => setTimeout(runPrint, 150), { once: true });
    }
  }

  function bindHistoryHeader() {
    const sel = document.getElementById('histTpSelect');
    const head = mount.querySelector('.history-head');
    if (!sel || !head) return;

    // Fill with the same TP numbers (plus "All Accounts")
    const opts = ['<option value="">All Accounts</option>'];
    accountsList.forEach((a) => {
      if (!a.tpNumber) return;
      const v = String(a.tpNumber);
      const vAttr = v.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
      opts.push(`<option value="${vAttr}">${escapeHtml(v)}</option>`);
    });
    sel.innerHTML = opts.join('');

    sel.value = histTpFilter || '';

    sel.onchange = () => {
      histTpFilter = sel.value || '';
      histPage = 1;
      renderHistoryTable();
    };

    // Re-open history: match filter UI to data model (was only visual before).
    histView = 'All';
    histPage = 1;
    head.querySelectorAll('[data-filter]').forEach((b) => b.classList.toggle('active', b.getAttribute('data-filter') === 'All'));

    if (head.dataset.cpDepHistToolbarBound === '1') return;
    head.dataset.cpDepHistToolbarBound = '1';

    head.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-filter]');
      if (!btn || !head.contains(btn)) return;
      head.querySelectorAll('[data-filter]').forEach((x) => x.classList.remove('active'));
      btn.classList.add('active');
      histView = btn.getAttribute('data-filter');
      histPage = 1;
      renderHistoryTable();
    });

    document.getElementById('histRefresh').addEventListener('click', async () => {
      const btn = document.getElementById('histRefresh');
      btn.disabled = true;
      btn.innerHTML = `<i class="bi bi-arrow-clockwise"></i> Refreshing…`;
      await fetchTransactions();
      renderHistoryTable();
      btn.disabled = false;
      btn.innerHTML = `<i class="bi bi-arrow-clockwise"></i> Refresh`;
    });

    document.getElementById('histBack').addEventListener('click', () => {
      showSubview('main');
    });

    document.getElementById('histDownload').addEventListener('click', () => {
      openDepositHistoryPrintExport();
    });
  }

  async function openHistory() {
    // Prepare + show history subview
    ensureHistoryHost();
    showSubview('hist');
    // Fill header selects/filters first (so it's not empty)
    bindHistoryHeader();
    // Fetch and render
    const tbody = document.getElementById('histTBody');
    tbody.innerHTML = `<tr><td colspan="8" class="text-center py-4 text-muted">Loading…</td></tr>`;
    await fetchTransactions();
    renderHistoryTable();
  }

  document.getElementById('depViewAllTx')?.addEventListener('click', openHistory);

  function renderSidePreview() {
    const body = document.getElementById('depTxPreviewBody');
    if (!body) return;
    const rows = histAll.filter(r => {
      const t = (r.type || '').toLowerCase();
      return t.includes('deposit') || t.includes('fund') || t.includes('credit') || t === '' || t === '—';
    });
    const sorted = rows.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 9);
    if (!sorted.length) {
      body.innerHTML = '<tr><td colspan="4" class="dep-fig-side-empty">No deposit transactions yet</td></tr>';
      return;
    }
    body.innerHTML = sorted.map((r, i) => {
      const { date, time } = fmtSideDateTime(r.createdAt);
      const name = escapeHtml(r.comment || 'N/A');
      const amt = Number(r.amount || 0);
      const uid = `d_${r.id || i}`;
      return `<tr>
        <td><span class="dep-fig-tx-name">${depRowIcon(uid)}${name}</span></td>
        <td>${escapeHtml(date)}</td>
        <td>${escapeHtml(time)}</td>
        <td>$${amt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
      </tr>`;
    }).join('');
  }

  window.CP_onViewShow = window.CP_onViewShow || {};
  window.CP_onViewShow.deposit = async function () {
    if (!window.CP_tabs.deposit.loaded) return;
    await loadAccounts();
    await fetchTransactions();
  };

  // ===== init main view =====
  await loadAccounts();
  await loadPaymentMethods();
  await fetchTransactions();
  centerCarets();

  window.CP_tabs.deposit.loaded = true;
};
