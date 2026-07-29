// Withdraw tab — Figma layout; transactions + withdrawal sources APIs
window.CP_tabs = window.CP_tabs || {};
window.CP_onViewShow = window.CP_onViewShow || {};

(function () {
  const TXN_ENDPOINT = 'api/payments/get_transactions.php';
  const ACCOUNTS_ENDPOINT = 'api/accounts/get_accounts.php';
  const SOURCES_GET = 'api/withdraw/sources_get.php';
  const SOURCES_CREATE = 'api/withdraw/sources_create.php';
  const SOURCES_EDIT = 'api/withdraw/sources_edit.php';
  const SOURCES_DELETE = 'api/withdraw/sources_delete.php';
  const WITHDRAW_CREATE = 'api/withdraw/create_request.php';
  /** GET → clientzone/lead/account/transaction/crypto-pay/supported-coins (session) */
  const SUPPORTED_COINS_GET = 'api/payments/get_crypto_supported_coins.php';

  const PAGE_SIZE = 8;
  const MAX_WITHDRAW_DEFAULT = 100000;
  const MIN_WITHDRAW_DEFAULT = 25;

  /** @type {Array<{currency:string,name?:string,logo_url?:string,networks?:Array}>} */
  let wdSupportedCoins = [];

  function isBankSource(src) {
    return String(src || '') === 'BankAccount' || String(src || '') === 'Bank';
  }

  function isSurePaySource(src) {
    return String(src || '') === 'SurePay';
  }

  function sourceLabelForUi(src) {
    const s = String(src || '');
    if (s === 'BankAccount' || s === 'Bank') return 'Bank Account';
    if (s === 'SurePay') return 'SurePay';
    if (s === 'Crypto') return 'Crypto';
    return s || '—';
  }

  function coinRowByCurrency(currency) {
    const c = String(currency || '').toUpperCase();
    if (!c) return null;
    return wdSupportedCoins.find((x) => String(x.currency || '').toUpperCase() === c) || null;
  }

  /** Networks where withdrawals are allowed (matches API `coin_withdrawals.enabled`). */
  function withdrawalNetworksForRow(coinRow) {
    if (!coinRow || !Array.isArray(coinRow.networks)) return [];
    return coinRow.networks.filter(
      (n) => n && (n.coin_withdrawals == null || n.coin_withdrawals.enabled !== false)
    );
  }

  function firstCurrencySymbol() {
    return wdSupportedCoins[0]?.currency ? String(wdSupportedCoins[0].currency) : '';
  }

  async function loadSupportedCoins() {
    wdSupportedCoins = [];
    try {
      const res = await fetch(SUPPORTED_COINS_GET, {
        credentials: 'same-origin',
        headers: { Accept: 'application/json' }
      });
      const j = await res.json();
      if (!res.ok || j.status === 'error') throw new Error(j.message || 'Failed to load coins');
      const arr = Array.isArray(j.data) ? j.data : [];
      wdSupportedCoins = arr;
    } catch (e) {
      console.error('[withdraw] supported coins', e);
      wdSupportedCoins = [];
    }
  }

  function fillAssetSelect(selectEl) {
    if (!selectEl) return;
    if (!wdSupportedCoins.length) {
      selectEl.innerHTML =
        '<option value="" disabled selected>Unable to load currencies — try again later</option>';
      return;
    }
    selectEl.innerHTML = wdSupportedCoins
      .map((c) => {
        const sym = String(c.currency || '').trim();
        const nm = String(c.name || sym).trim();
        return `<option value="${escapeHtml(sym)}">${escapeHtml(sym)} — ${escapeHtml(nm)}</option>`;
      })
      .join('');
  }

  /**
   * @param {HTMLSelectElement|null} netSel
   * @param {string} currencySymbol e.g. BTC
   * @param {string|null|undefined} preserveNetwork API `network` slug (e.g. bitcoin, litecoin)
   */
  function fillNetworkOptionsForCoin(netSel, currencySymbol, preserveNetwork) {
    if (!netSel) return;
    const row = coinRowByCurrency(currencySymbol);
    const nets = row ? withdrawalNetworksForRow(row) : [];
    if (!nets.length) {
      netSel.innerHTML = '<option value="">—</option>';
      if (preserveNetwork) {
        netSel.innerHTML = `<option value="${escapeHtml(preserveNetwork)}">${escapeHtml(
          preserveNetwork
        )}</option>`;
        netSel.value = preserveNetwork;
      }
      return;
    }
    netSel.innerHTML = nets
      .map((n) => {
        const v = String(n.network || '').trim();
        const lab = String(n.name || n.network || '').trim();
        return `<option value="${escapeHtml(v)}">${escapeHtml(lab)}</option>`;
      })
      .join('');
    if (preserveNetwork && nets.some((n) => n.network === preserveNetwork)) {
      netSel.value = preserveNetwork;
    } else if (preserveNetwork) {
      netSel.insertAdjacentHTML(
        'afterbegin',
        `<option value="${escapeHtml(preserveNetwork)}">${escapeHtml(preserveNetwork)}</option>`
      );
      netSel.value = preserveNetwork;
    } else if (nets[0]?.network) {
      netSel.value = nets[0].network;
    }
  }

  let accounts = [];
  let accByTp = new Map();
  /** When the TP &lt;select&gt; is still on the placeholder, card/table use this (first account). Cleared on any dropdown change. */
  let wdImplicitTp = '';
  let allWithdrawTx = [];
  let sources = [];
  let wdPage = 1;
  let viewAllMode = false;

  /** After closing Withdrawal Accounts, open edit or delete child modal (Bootstrap chain). */
  let pendingAfterAccountsClose = null; // 'edit' | 'delete' | null
  let pendingEditSource = null;
  let pendingDeleteId = null;
  /** Re-open accounts modal after edit/delete modal closes. */
  let reopenAccountsAfterChildModal = false;
  let modalChainBound = false;

  function escapeHtml(s) {
    return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function formatMoneyShort(n) {
    const v = Number(n);
    if (Number.isNaN(v)) return '$0.0';
    if (v === 0) return '$0.0';
    if (Math.abs(v) >= 1000) return '$' + (v / 1000).toFixed(1) + 'k';
    return '$' + v.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  }

  function fmtMoney(n) {
    const v = Number(n);
    if (Number.isNaN(v)) return '0.00';
    return v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function currencySymbol(code) {
    if (!code) return '';
    const c = String(code).trim().toUpperCase();
    const map = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      JPY: '¥',
      CNY: '¥',
      AUD: 'A$',
      CAD: 'C$',
      NZD: 'NZ$',
      INR: '₹',
      USDT: '₮',
      BTC: '₿',
      ETH: 'Ξ'
    };
    return map[c] || '';
  }

  function formatTxAmount(amount, currencyCode) {
    if (amount == null) return '—';
    const sym = currencySymbol(currencyCode);
    const raw = typeof amount === 'number' ? amount : parseFloat(String(amount).replace(/,/g, ''));
    if (Number.isNaN(raw)) {
      const c = (currencyCode || '').trim();
      return c ? `${amount} ${c}`.trim() : String(amount);
    }
    const neg = raw < 0;
    const abs = Math.abs(raw);
    const numStr = abs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (!sym) {
      const c = (currencyCode || '').trim();
      return (neg ? '-' : '') + (c ? `${numStr} ${c}` : numStr);
    }
    const core = sym + numStr;
    return neg ? '-' + core : core;
  }

  /** e.g. "14USD" in API messages → "$14" for display */
  function prettifyReasonText(s) {
    if (s == null || s === '' || s === '—') return s;
    return String(s).replace(/(\d+(?:\.\d+)?)\s*USD\b/gi, (_, n) => '$' + n);
  }

  function mockPl(seed) {
    const x = Math.sin(Number(seed) * 12.9898) * 43758.5453;
    return Math.round((x % 2000) - 800);
  }

  function sparklineSvg(seed) {
    const accent = '#7B61FF';
    const w = 280;
    const h = 56;
    const gid = 'wdg' + seed + '-' + Math.random().toString(36).slice(2, 8);
    const pts = [];
    for (let i = 0; i <= 12; i++) {
      const t = i / 12;
      const y = h / 2 + Math.sin(t * Math.PI * 2 + seed) * 16 + (seed % 7) * 2;
      pts.push(`${(t * w).toFixed(1)},${y.toFixed(1)}`);
    }
    const pathD = 'M' + pts.join(' L');
    return `
      <svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#7B61FF" stop-opacity="0.35"/>
            <stop offset="100%" stop-color="#7B61FF" stop-opacity="0"/>
          </linearGradient>
        </defs>
        <path d="${pathD} L ${w},${h} L 0,${h} Z" fill="url(#${gid})"/>
        <path d="${pathD}" fill="none" stroke="${accent}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`;
  }

  function wdRowIcon(uid) {
    const clipId = 'wdclip_' + String(uid).replace(/[^a-zA-Z0-9_-]/g, '_');
    return `<span class="wd-tx-icon" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#${clipId})">
<path d="M22.9233 11.5877C22.7598 11.1738 22.4134 10.9801 21.8373 10.9814L18.5255 10.9916C18.0218 10.9916 17.9335 10.9162 17.9328 10.4329C17.9328 8.62032 17.9328 6.80777 17.9328 4.99521C17.9328 4.38347 17.7568 4.20063 17.1428 4.19995C15.2569 4.19995 13.371 4.19995 11.4851 4.19995V4.20675C9.57707 4.20675 7.66817 4.20675 5.75834 4.20675C5.19947 4.20675 5.01387 4.39639 5.01318 4.94355C5.01318 6.73255 5.01318 8.52244 5.01318 10.3133C5.01318 10.9175 4.9221 11.0079 4.28941 11.0086C3.18546 11.0086 2.08152 11.014 0.977572 11.0086C0.569802 11.0086 0.264837 11.1568 0.0888962 11.5272C-0.113264 11.9513 -0.0166689 12.423 0.373162 12.7956C1.20112 13.5833 2.00562 14.3874 2.81771 15.1875C4.38531 16.732 5.99155 18.2421 7.58468 19.7592C8.59295 20.7185 9.60743 21.6701 10.6281 22.614C11.176 23.1251 11.8011 23.1197 12.3385 22.614C13.5441 21.4811 14.7493 20.3482 15.954 19.2154C18.1874 17.1083 20.3628 14.9462 22.5562 12.8003C22.973 12.4082 23.0965 12.0268 22.9233 11.5877ZM18.5765 13.5201C16.7753 15.2665 14.9728 17.0111 13.1693 18.7539C12.6939 19.214 12.2116 19.6681 11.7493 20.1405C11.5761 20.3172 11.465 20.3383 11.2781 20.1575C9.01774 17.9661 6.7535 15.779 4.48536 13.5962C4.4427 13.5582 4.40324 13.5169 4.36737 13.4728C4.31631 13.4046 4.21489 13.3454 4.25629 13.2428C4.29769 13.1402 4.41015 13.1205 4.51778 13.1205C5.12702 13.1205 5.73557 13.1171 6.34481 13.1205C7.11274 13.1205 7.37976 12.8642 7.37976 12.1077C7.37976 10.3534 7.38735 8.59835 7.37493 6.84334C7.37493 6.59593 7.42254 6.5164 7.68749 6.5198C8.9515 6.53339 10.2155 6.52591 11.4823 6.52591V6.52116C12.7463 6.52116 14.0103 6.52659 15.2771 6.5164C15.5013 6.5164 15.5641 6.57485 15.5634 6.79712C15.5552 8.55213 15.5634 10.3065 15.5634 12.0615C15.5634 12.856 15.8139 13.1123 16.6301 13.1123H18.424C18.5503 13.1123 18.6931 13.098 18.7435 13.2482C18.7808 13.3835 18.6524 13.446 18.5758 13.5201H18.5765Z" fill="#7B61FF"/>
<path d="M11.4837 0C13.3453 0 15.2082 0 17.0725 0C17.7024 0 17.9398 0.238579 17.9391 0.863912C17.9391 1.09026 17.9439 1.3166 17.9391 1.54362C17.9246 1.97252 17.6969 2.20837 17.2636 2.2512C17.1947 2.25596 17.1256 2.25732 17.0566 2.25528C13.3308 2.25528 9.60704 2.25528 5.88537 2.25528C5.71272 2.26443 5.54022 2.23467 5.381 2.16827C5.22093 2.09215 5.07949 1.97863 5.05603 1.79715C4.9931 1.36002 4.99613 0.916132 5.065 0.479874C5.12226 0.151575 5.37824 0.00407809 5.79981 0.00407809C7.69676 0.00135925 9.59324 0.00135925 11.4893 0.00407809L11.4837 0Z" fill="#7B61FF"/>
</g>
<defs><clipPath id="${clipId}"><rect width="23" height="23" fill="white"/></clipPath></defs>
</svg></span>`;
  }

  function fmtCreatedOn(iso) {
    const d = new Date(iso);
    if (Number.isNaN(+d)) return '—';
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  function mapStatusForUi(raw) {
    const s = String(raw || '').trim();
    const low = s.toLowerCase();
    if (low === 'rejected') return { label: 'Blocked', cls: 'wd-status--blocked' };
    if (low === 'completed' || low === 'approved' || low === 'verified') return { label: 'Verified', cls: 'wd-status--verified' };
    if (low === 'pending') return { label: 'Pending', cls: 'wd-status--pending' };
    return { label: s || '—', cls: 'wd-status--neutral' };
  }

  /** Name for dashboard header / table when API only sends userId (session has profile). */
  function cpUserDisplayName() {
    const u = window.CP_USER;
    if (!u) return '';
    const fn = String(u.firstName || '').trim();
    const ln = String(u.lastName || '').trim();
    const full = [fn, ln].filter(Boolean).join(' ');
    if (full) return full;
    const em = String(u.email || '').trim();
    if (em) return em.split('@')[0] || em;
    return '';
  }

  function rowName(tx) {
    const ts = tx.transactionSource;
    if (ts && typeof ts === 'object') {
      const v = ts.value || ts.extraData?.name || ts.name;
      if (v) return String(v);
    }
    if (typeof ts === 'string' && ts.trim()) return ts.trim();

    const txUid = tx.userId != null ? String(tx.userId).trim().toLowerCase() : '';
    const sessionUid =
      window.CP_USER?.userId != null ? String(window.CP_USER.userId).trim().toLowerCase() : '';
    if (txUid && sessionUid && txUid === sessionUid) {
      const fromSession = cpUserDisplayName();
      if (fromSession) return fromSession;
    }

    const comment = tx.comment != null ? String(tx.comment).trim() : '';
    if (comment) return comment;
    const typ = String(tx.type || '').trim();
    if (typ) return typ;
    return 'N/A';
  }

  function currentTp() {
    const sel = document.getElementById('wdTpSelect');
    const v = sel ? String(sel.value || '').trim() : '';
    if (v) return v;
    return wdImplicitTp || '';
  }

  function currentAccount() {
    const tp = currentTp();
    return accByTp.get(tp) || null;
  }

  /** Create Request: faded ghost + disabled until a TP is chosen; then solid primary like Withdrawal Account. */
  function syncWdCreateRequestButtonState() {
    const btn = document.getElementById('wdBtnCreateRequest');
    const sel = document.getElementById('wdTpSelect');
    if (!btn || !sel) return;
    const hasTp = !!(sel.value && String(sel.value).trim());
    btn.disabled = !hasTp;
    btn.setAttribute('aria-disabled', hasTp ? 'false' : 'true');
    btn.classList.toggle('wd-btn--ghost', !hasTp);
    btn.classList.toggle('wd-btn--primary', hasTp);
  }

  function isWithdrawTransactionType(raw) {
    const t = String(raw || '').toLowerCase();
    // API returns "Withdrawal"; older code used "withdraw"
    return t === 'withdraw' || t === 'withdrawal';
  }

  function filteredTx() {
    let arr = allWithdrawTx.filter((x) => isWithdrawTransactionType(x.type));
    const tp = currentTp();
    if (tp) arr = arr.filter((x) => String(x.tpNumber) === String(tp));
    arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return arr;
  }

  function renderAccountCard() {
    const acc = currentAccount();
    const idEl = document.getElementById('wdAccId');
    const balEl = document.getElementById('wdAccBalance');
    const equityEl = document.getElementById('wdAccEquity');
    const plValEl = document.getElementById('wdAccPlVal');
    const marginEl = document.getElementById('wdAccMargin');
    const chart = document.getElementById('wdAccChart');

    if (!acc) {
      if (idEl) idEl.textContent = 'Account : #—';
      if (balEl) balEl.textContent = '$0';
      if (equityEl) equityEl.textContent = '—';
      if (plValEl) {
        plValEl.textContent = '—';
        plValEl.className = 'wd-metric__value wd-metric__value--pl';
      }
      if (marginEl) marginEl.textContent = '—';
      if (chart) chart.innerHTML = '';
      return;
    }

    const tp = acc.tpNumber || '—';
    const bal = Number(acc.balance) || 0;
    const seed = (tp + '').length + bal;
    const pl = acc.profit != null ? Number(acc.profit) : mockPl(seed);
    const equity = acc.equity != null ? Number(acc.equity) : bal + pl * 0.001;
    let marginPct = 45;
    if (acc.marginLevel != null && !Number.isNaN(Number(acc.marginLevel))) {
      marginPct = Math.min(100, Math.max(0, Math.round(Number(acc.marginLevel))));
    } else {
      marginPct = 40 + (seed % 5) * 5;
    }

    if (idEl) idEl.textContent = 'Account : #' + escapeHtml(String(tp));
    if (balEl) balEl.textContent = formatMoneyShort(bal);
    if (equityEl) equityEl.textContent = formatMoneyShort(equity);
    if (plValEl) {
      const neg = pl < 0;
      plValEl.textContent = (neg ? '-' : '+') + formatMoneyShort(Math.abs(pl));
      plValEl.className =
        'wd-metric__value wd-metric__value--pl ' + (neg ? 'wd-metric__value--loss' : 'wd-metric__value--gain');
    }
    if (marginEl) marginEl.textContent = marginPct + '%';
    if (chart) chart.innerHTML = sparklineSvg(seed);
  }

  function disposeWdReasonTooltips() {
    const tbody = document.getElementById('wdTBody');
    if (!tbody || typeof bootstrap === 'undefined') return;
    tbody.querySelectorAll('[data-wd-reason-tip]').forEach((el) => {
      const inst = bootstrap.Tooltip.getInstance(el);
      if (inst) inst.dispose();
    });
  }

  function initWdReasonTooltips() {
    if (typeof bootstrap === 'undefined') return;
    document.querySelectorAll('#wdTBody [data-wd-reason-tip]').forEach((el) => {
      bootstrap.Tooltip.getOrCreateInstance(el, {
        container: 'body',
        placement: 'top',
        customClass: 'wd-reason-tooltip',
        trigger: 'hover focus',
        boundary: 'viewport',
        delay: { show: 200, hide: 80 },
        fallbackPlacements: ['bottom', 'left', 'right']
      });
    });
  }

  function renderTable() {
    const body = document.getElementById('wdTBody');
    const summary = document.getElementById('wdSummary');
    const pagerEl = document.getElementById('wdPager');
    if (!body) return;

    disposeWdReasonTooltips();

    const list = filteredTx();
    const pageSize = viewAllMode ? Math.max(list.length, 1) : PAGE_SIZE;
    const pages = Math.max(1, Math.ceil(list.length / pageSize));
    if (wdPage > pages) wdPage = pages;
    const start = (wdPage - 1) * pageSize;
    const pageRows = list.slice(start, start + pageSize);

    if (!pageRows.length) {
      body.innerHTML = '<tr><td colspan="5" class="wd-empty">No withdrawal transactions</td></tr>';
    } else {
      body.innerHTML = pageRows
        .map((tx) => {
          const st = mapStatusForUi(tx.status);
          const amtDisplay = formatTxAmount(tx.amount, tx.currency);
          const reasonRaw = tx.rejectReason ? String(tx.rejectReason) : '—';
          const reason = prettifyReasonText(reasonRaw);
          const reasonTipAttrs =
            reason && reason !== '—'
              ? ` data-bs-toggle="tooltip" data-bs-placement="top" data-bs-container="body" data-bs-custom-class="wd-reason-tooltip" data-bs-title="${escapeHtml(reason)}" data-wd-reason-tip="1"`
              : '';
          return `
          <tr>
            <td class="wd-name-cell">${wdRowIcon(tx.id)}<span class="wd-name-text">${escapeHtml(rowName(tx))}</span></td>
            <td class="wd-col-created">${escapeHtml(fmtCreatedOn(tx.createdAt))}</td>
            <td class="text-end wd-col-amount"><span class="wd-amount-text">${escapeHtml(amtDisplay)}</span></td>
            <td class="wd-col-status"><span class="wd-status ${st.cls}">${escapeHtml(st.label)}</span></td>
            <td class="wd-col-reason"><span class="wd-reason-text"${reasonTipAttrs}>${escapeHtml(reason)}</span></td>
          </tr>`;
        })
        .join('');
      initWdReasonTooltips();
    }

    if (summary) {
      summary.textContent = `${list.length} records — page ${wdPage} of ${pages}`;
    }

    if (pagerEl) {
      if (pages <= 1) {
        pagerEl.innerHTML = '';
      } else if (typeof window.CP_compactPaginationHtml === 'function') {
        const { html } = window.CP_compactPaginationHtml(list.length, wdPage, pageSize, 'wd-p');
        pagerEl.innerHTML = `<div class="dash-pagination wd-dash-pagination">${html}</div>`;
        window.CP_attachDashPagination?.(pagerEl.firstElementChild, 'wd-p', (p) => {
          wdPage = p;
          renderTable();
        });
      } else {
        let html = '';
        html += `<button type="button" class="wd-page-btn wd-page-btn--nav" ${wdPage <= 1 ? 'disabled' : ''} data-wd-p="${wdPage - 1}" aria-label="Previous">&lt;</button>`;
        for (let p = 1; p <= pages; p++) {
          html += `<button type="button" class="wd-page-btn ${p === wdPage ? 'is-active' : ''}" data-wd-p="${p}">${p}</button>`;
        }
        html += `<button type="button" class="wd-page-btn wd-page-btn--nav" ${wdPage >= pages ? 'disabled' : ''} data-wd-p="${wdPage + 1}" aria-label="Next">&gt;</button>`;
        pagerEl.innerHTML = html;
        pagerEl.querySelectorAll('[data-wd-p]').forEach((btn) => {
          btn.addEventListener('click', () => {
            if (btn.disabled) return;
            const p = parseInt(btn.getAttribute('data-wd-p'), 10);
            if (!Number.isNaN(p)) {
              wdPage = p;
              renderTable();
            }
          });
        });
      }
    }
  }

  async function loadAccounts() {
    try {
      const uid = window.CP_USER?.userId || '';
      const url = uid ? `${ACCOUNTS_ENDPOINT}?userId=${encodeURIComponent(uid)}` : ACCOUNTS_ENDPOINT;
      const res = await fetch(url, { credentials: 'same-origin', headers: { Accept: 'application/json' } });
      const json = await res.json();
      if (!res.ok || json.status === 'error') throw new Error(json.message || 'Failed');
      const raw = json.data;
      accounts = Array.isArray(raw) ? raw : raw?.accounts || [];
      accounts = accounts.filter((a) => !a.isArchived);
      accByTp.clear();
      for (const a of accounts) {
        if (a.tpNumber) accByTp.set(String(a.tpNumber), a);
      }

      const sel = document.getElementById('wdTpSelect');
      if (!sel) return;

      const opts = ['<option value="" selected>Select tp number</option>'];
      for (const a of accounts) {
        if (a.tpNumber) opts.push(`<option value="${escapeHtml(String(a.tpNumber))}">${escapeHtml(String(a.tpNumber))}</option>`);
      }
      sel.innerHTML = opts.join('');

      const firstReal = accounts.find((a) => !a.isDemoAccount && a.tpNumber);
      const pick = firstReal || accounts.find((a) => a.tpNumber);
      wdImplicitTp = pick?.tpNumber != null ? String(pick.tpNumber) : '';

      const pref = window.CP_state?.preferredTpNumber;
      if (pref && accByTp.has(String(pref))) {
        sel.value = String(pref);
        window.CP_state.preferredTpNumber = null;
        wdImplicitTp = '';
      } else {
        sel.value = '';
      }

      sel.onchange = () => {
        wdPage = 1;
        wdImplicitTp = '';
        syncWdCreateRequestButtonState();
        renderAccountCard();
        renderTable();
        updateRequestModalSubtitle();
      };

      syncWdCreateRequestButtonState();
      renderAccountCard();
    } catch (e) {
      console.error('[withdraw] accounts', e);
    }
  }

  async function loadTransactions() {
    try {
      const res = await fetch(TXN_ENDPOINT, { credentials: 'same-origin', headers: { Accept: 'application/json' } });
      const j = await res.json();
      const arr = Array.isArray(j?.data) ? j.data : Array.isArray(j) ? j : [];
      allWithdrawTx = arr;
      wdPage = 1;
      renderTable();
    } catch (e) {
      console.error('[withdraw] transactions', e);
      allWithdrawTx = [];
      renderTable();
    }
  }

  async function loadSources() {
    try {
      const res = await fetch(SOURCES_GET, { credentials: 'same-origin', headers: { Accept: 'application/json' } });
      const j = await res.json();
      if (!res.ok || j.status === 'error') throw new Error(j.message);
      const arr = Array.isArray(j.data) ? j.data : [];
      sources = arr.filter((x) => String(x.type || '').toLowerCase() === 'withdrawal');
      populateSourceSelect();
      renderSourcesList();
    } catch (e) {
      console.error('[withdraw] sources', e);
      sources = [];
      populateSourceSelect();
      renderSourcesList();
    }
  }

  function populateSourceSelect() {
    const sel = document.getElementById('wdReqSource');
    if (!sel) return;
    const parts = ['<option value="" selected disabled>Choose account</option>'];
    for (const s of sources) {
      const id = s.id || '';
      const label = s.value || s.extraData?.name || id;
      parts.push(
        `<option value="${escapeHtml(id)}">${escapeHtml(label)} (${escapeHtml(sourceLabelForUi(s.source))})</option>`
      );
    }
    sel.innerHTML = parts.join('');
  }

  function clearSourceFormFields() {
    const typeSel = document.getElementById('wdSrcType');
    if (typeSel) typeSel.value = 'Crypto';
    syncWdSourceTypeUi();
    const label = document.getElementById('wdSrcLabel');
    const coinSel = document.getElementById('wdSrcCoin');
    const netSel = document.getElementById('wdSrcNetwork');
    const wallet = document.getElementById('wdSrcWallet');
    const bankName = document.getElementById('wdSrcBankName');
    const bankAcct = document.getElementById('wdSrcBankAcct');
    const spProv = document.getElementById('wdSrcSpProvider');
    const spAcct = document.getElementById('wdSrcSpAcct');
    if (label) label.value = '';
    if (coinSel && firstCurrencySymbol()) {
      coinSel.value = firstCurrencySymbol();
      fillNetworkOptionsForCoin(netSel, coinSel.value, null);
    }
    if (wallet) wallet.value = '';
    if (bankName) bankName.value = '';
    if (bankAcct) bankAcct.value = '';
    if (spProv) spProv.value = '';
    if (spAcct) spAcct.value = '';
    const msg = document.getElementById('wdSrcMsg');
    if (msg) {
      msg.textContent = '';
      msg.className = 'wd-modal-request__msg';
    }
  }

  function clearSourceFormEdit() {
    clearSourceFormFields();
  }

  function syncWdSourceTypeUi() {
    const typeSel = document.getElementById('wdSrcType');
    if (!typeSel) return;
    const v = typeSel.value;
    const isCrypto = v === 'Crypto';
    const isBank = v === 'BankAccount';
    const isSurePay = v === 'SurePay';
    document.querySelectorAll('.wd-crypto-only').forEach((el) => {
      el.style.display = isCrypto ? '' : 'none';
    });
    document.querySelectorAll('.wd-bank-only').forEach((el) => {
      el.style.display = isBank ? '' : 'none';
    });
    document.querySelectorAll('.wd-surepay-only').forEach((el) => {
      el.style.display = isSurePay ? '' : 'none';
    });
  }

  function syncWdEditSourceTypeUi() {
    const typeSel = document.getElementById('wdEditSrcType');
    if (!typeSel) return;
    const v = typeSel.value;
    const isCrypto = v === 'Crypto';
    const isBank = v === 'BankAccount';
    const isSurePay = v === 'SurePay';
    document.querySelectorAll('.wd-edit-crypto-only').forEach((el) => {
      el.style.display = isCrypto ? '' : 'none';
    });
    document.querySelectorAll('.wd-edit-bank-only').forEach((el) => {
      el.style.display = isBank ? '' : 'none';
    });
    document.querySelectorAll('.wd-edit-surepay-only').forEach((el) => {
      el.style.display = isSurePay ? '' : 'none';
    });
  }

  function clearEditSourceForm() {
    const msg = document.getElementById('wdEditSrcMsg');
    if (msg) {
      msg.textContent = '';
      msg.className = 'wd-modal-request__msg';
    }
    const idEl = document.getElementById('wdEditSrcId');
    if (idEl) idEl.value = '';
    const typeSel = document.getElementById('wdEditSrcType');
    if (typeSel) typeSel.value = 'Crypto';
    syncWdEditSourceTypeUi();
    [
      'wdEditSrcLabel',
      'wdEditSrcWallet',
      'wdEditSrcBankName',
      'wdEditSrcBankAcct',
      'wdEditSrcSpProvider',
      'wdEditSrcSpAcct'
    ].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    const coinSel = document.getElementById('wdEditSrcCoin');
    const netSel = document.getElementById('wdEditSrcNetwork');
    if (coinSel && firstCurrencySymbol()) {
      coinSel.value = firstCurrencySymbol();
      fillNetworkOptionsForCoin(netSel, coinSel.value, null);
    }
  }

  function fillEditSourceForm(s) {
    clearEditSourceForm();
    const idEl = document.getElementById('wdEditSrcId');
    if (idEl) idEl.value = s.id != null ? String(s.id) : '';
    const srcRaw = String(s.source || 'Crypto');
    const isBank = isBankSource(srcRaw);
    const isSp = isSurePaySource(srcRaw);
    const typeSel = document.getElementById('wdEditSrcType');
    if (typeSel) {
      if (isBank) typeSel.value = 'BankAccount';
      else if (isSp) typeSel.value = 'SurePay';
      else typeSel.value = 'Crypto';
    }
    syncWdEditSourceTypeUi();

    const labelEl = document.getElementById('wdEditSrcLabel');
    if (labelEl) labelEl.value = (s.value != null ? String(s.value) : '') || (s.extraData?.name != null ? String(s.extraData.name) : '');

    if (isBank) {
      const bn = document.getElementById('wdEditSrcBankName');
      const ba = document.getElementById('wdEditSrcBankAcct');
      if (bn) bn.value = s.extraData?.bankName != null ? String(s.extraData.bankName) : '';
      if (ba) ba.value = s.extraData?.accountNumber != null ? String(s.extraData.accountNumber) : '';
    } else if (isSp) {
      const p = document.getElementById('wdEditSrcSpProvider');
      const a = document.getElementById('wdEditSrcSpAcct');
      if (p) p.value = s.extraData?.bankName != null ? String(s.extraData.bankName) : '';
      if (a) a.value = s.extraData?.accountNumber != null ? String(s.extraData.accountNumber) : '';
    } else {
      let coin = extraDataCoin(s.extraData);
      if (coin && !coinRowByCurrency(coin)) {
        const coinSelPre = document.getElementById('wdEditSrcCoin');
        if (coinSelPre) {
          coinSelPre.insertAdjacentHTML(
            'beforeend',
            `<option value="${escapeHtml(coin)}">${escapeHtml(coin)} (saved)</option>`
          );
        }
      }
      const coinSel = document.getElementById('wdEditSrcCoin');
      const netSel = document.getElementById('wdEditSrcNetwork');
      const w = document.getElementById('wdEditSrcWallet');
      if (coinSel) coinSel.value = coin || firstCurrencySymbol();
      const savedNet = s.extraData?.network != null ? String(s.extraData.network) : '';
      fillNetworkOptionsForCoin(netSel, coinSel ? coinSel.value : coin, savedNet);
      if (w) w.value = s.extraData?.walletAddress != null ? String(s.extraData.walletAddress) : '';
    }
  }

  /** When legacy records have `network` but no `coin`, pick the asset row that lists this network slug. */
  function inferCurrencyFromNetworkSlug(networkSlug) {
    const slug = String(networkSlug || '').trim();
    if (!slug) return '';
    for (const row of wdSupportedCoins) {
      const nets = withdrawalNetworksForRow(row);
      if (nets.some((n) => n.network === slug)) return String(row.currency || '').trim();
    }
    return '';
  }

  function extraDataCoin(extra) {
    let c = extra?.coin != null ? String(extra.coin).trim() : '';
    if (c && coinRowByCurrency(c)) return c;
    const net = extra?.network != null ? String(extra.network) : '';
    if (net) {
      const guess = inferCurrencyFromNetworkSlug(net);
      if (guess) return guess;
    }
    return firstCurrencySymbol();
  }

  function bindEditSourceTypeToggle() {
    const typeSel = document.getElementById('wdEditSrcType');
    const coinSel = document.getElementById('wdEditSrcCoin');
    if (typeSel) typeSel.addEventListener('change', syncWdEditSourceTypeUi);
    if (coinSel) {
      coinSel.addEventListener('change', () => {
        fillNetworkOptionsForCoin(document.getElementById('wdEditSrcNetwork'), coinSel.value, null);
      });
    }
  }

  function sourceRowLabel(s) {
    const sid = s.id != null ? String(s.id) : '';
    return s.value || s.extraData?.name || sid || '—';
  }

  function wireWithdrawModalsChain() {
    if (modalChainBound) return;
    const accEl = document.getElementById('wdModalAccounts');
    const editEl = document.getElementById('wdModalEditSource');
    const delEl = document.getElementById('wdModalDeleteSource');
    if (!accEl || !editEl || !delEl) return;
    modalChainBound = true;

    accEl.addEventListener('hidden.bs.modal', () => {
      if (pendingAfterAccountsClose === 'edit' && pendingEditSource) {
        const s = pendingEditSource;
        pendingAfterAccountsClose = null;
        pendingEditSource = null;
        fillEditSourceForm(s);
        reopenAccountsAfterChildModal = true;
        (bootstrap.Modal.getInstance(editEl) || new bootstrap.Modal(editEl)).show();
      } else if (pendingAfterAccountsClose === 'delete') {
        pendingAfterAccountsClose = null;
        reopenAccountsAfterChildModal = true;
        (bootstrap.Modal.getInstance(delEl) || new bootstrap.Modal(delEl)).show();
      }
    });

    function afterChildClosed() {
      if (!reopenAccountsAfterChildModal) return;
      reopenAccountsAfterChildModal = false;
      loadSources().then(() => {
        const m = bootstrap.Modal.getInstance(accEl) || new bootstrap.Modal(accEl);
        m.show();
      });
    }

    editEl.addEventListener('hidden.bs.modal', () => {
      clearEditSourceForm();
      afterChildClosed();
    });

    delEl.addEventListener('hidden.bs.modal', () => {
      pendingDeleteId = null;
      const lbl = document.getElementById('wdDeleteSrcLabel');
      if (lbl) lbl.textContent = '';
      const errEl = document.getElementById('wdDeleteErr');
      if (errEl) {
        errEl.textContent = '';
        errEl.hidden = true;
      }
      afterChildClosed();
    });
  }

  function openEditSourceFromAccounts(s) {
    pendingAfterAccountsClose = 'edit';
    pendingEditSource = s;
    const accEl = document.getElementById('wdModalAccounts');
    if (accEl) bootstrap.Modal.getInstance(accEl)?.hide();
  }

  function openDeleteSourceFromAccounts(id, displayLabel) {
    pendingAfterAccountsClose = 'delete';
    pendingDeleteId = id;
    const errEl = document.getElementById('wdDeleteErr');
    if (errEl) {
      errEl.textContent = '';
      errEl.hidden = true;
    }
    const lbl = document.getElementById('wdDeleteSrcLabel');
    if (lbl) lbl.textContent = displayLabel ? String(displayLabel) : '';
    const accEl = document.getElementById('wdModalAccounts');
    if (accEl) bootstrap.Modal.getInstance(accEl)?.hide();
  }

  function sourceItemModifier(s) {
    if (isBankSource(s.source)) return 'wd-src-item--bank';
    if (isSurePaySource(s.source)) return 'wd-src-item--surepay';
    return 'wd-src-item--crypto';
  }

  function sourceBadge(s) {
    if (isBankSource(s.source)) return { cls: 'wd-src-item__badge wd-src-item__badge--bank', label: 'Bank' };
    if (isSurePaySource(s.source)) return { cls: 'wd-src-item__badge wd-src-item__badge--surepay', label: 'SurePay' };
    return { cls: 'wd-src-item__badge wd-src-item__badge--crypto', label: 'Crypto' };
  }

  function renderSourcesList() {
    const host = document.getElementById('wdSrcList');
    const countHint = document.getElementById('wdSrcCountHint');
    if (countHint) {
      countHint.textContent = sources.length ? `${sources.length} saved` : '';
    }
    if (!host) return;
    if (!sources.length) {
      host.innerHTML = `<div class="wd-modal-accounts__empty">
        <div class="wd-modal-accounts__empty-icon" aria-hidden="true"><i class="bi bi-wallet2"></i></div>
        <p class="wd-modal-accounts__empty-title">No saved accounts yet</p>
        <p class="wd-modal-accounts__empty-text">Add a withdrawal method using the form below.</p>
      </div>`;
      return;
    }
    host.innerHTML = sources
      .map((s) => {
        const sid = s.id != null ? String(s.id) : '';
        const title = escapeHtml(s.value || s.extraData?.name || sid || '—');
        const src = escapeHtml(s.source || '');
        const net = s.extraData?.network ? escapeHtml(s.extraData.network) : '';
        const wa = s.extraData?.walletAddress ? escapeHtml(s.extraData.walletAddress) : '';
        const coin = s.extraData?.coin ? escapeHtml(String(s.extraData.coin)) : '';
        const bankLine =
          isBankSource(s.source) && (s.extraData?.bankName || s.extraData?.accountNumber)
            ? [escapeHtml(s.extraData?.bankName || ''), escapeHtml(s.extraData?.accountNumber || '')].filter(Boolean).join(' · ')
            : '';
        const spLine =
          isSurePaySource(s.source) && (s.extraData?.bankName || s.extraData?.accountNumber)
            ? [escapeHtml(s.extraData?.bankName || ''), escapeHtml(s.extraData?.accountNumber || '')].filter(Boolean).join(' · ')
            : '';
        const meta = isBankSource(s.source) && bankLine
          ? bankLine
          : isSurePaySource(s.source) && spLine
            ? spLine
            : [coin || src, net, wa].filter(Boolean).join(' · ');
        const mod = sourceItemModifier(s);
        const badge = sourceBadge(s);
        return `<div class="wd-src-item ${mod}">
          <div class="wd-src-item__body">
            <div class="wd-src-item__title-row">
              <span class="${badge.cls}">${escapeHtml(badge.label)}</span>
              <strong class="wd-src-item__name">${title}</strong>
            </div>
            <div class="wd-src-meta">${escapeHtml(meta || '—')}</div>
          </div>
          <div class="wd-src-item__actions">
            <button type="button" class="btn btn-sm wd-src-btn wd-src-btn--edit wd-src-edit" data-src-id="${escapeHtml(sid)}">Edit</button>
            <button type="button" class="btn btn-sm wd-src-btn wd-src-btn--del wd-src-delete" data-src-id="${escapeHtml(sid)}">Delete</button>
          </div>
        </div>`;
      })
      .join('');
  }

  function updateRequestModalSubtitle() {
    const sub = document.getElementById('wdModalTpSubtitle');
    const tp = currentTp();
    if (sub) sub.textContent = tp ? 'TP Number- ' + tp : 'TP Number- —';
    const acc = currentAccount();
    const hint = document.getElementById('wdReqMaxHint');
    if (hint && acc) {
      const bal = Number(acc.balance) || 0;
      const max = Math.min(MAX_WITHDRAW_DEFAULT, bal);
      hint.textContent = 'Max Withdrawal : ' + fmtMoney(max) + ' ' + (acc.baseCurrency || 'USD').toUpperCase();
    } else if (hint) {
      hint.textContent = 'Max Withdrawal : ' + MAX_WITHDRAW_DEFAULT;
    }
  }

  function initWdCryptoDropdowns() {
    fillAssetSelect(document.getElementById('wdSrcCoin'));
    fillAssetSelect(document.getElementById('wdEditSrcCoin'));
    const c0 = document.getElementById('wdSrcCoin');
    fillNetworkOptionsForCoin(document.getElementById('wdSrcNetwork'), (c0 && c0.value) || WD_CRYPTO_ASSETS[0], null);
    const e0 = document.getElementById('wdEditSrcCoin');
    fillNetworkOptionsForCoin(document.getElementById('wdEditSrcNetwork'), (e0 && e0.value) || WD_CRYPTO_ASSETS[0], null);
  }

  function bindSourceFormToggle() {
    const typeSel = document.getElementById('wdSrcType');
    const coinSel = document.getElementById('wdSrcCoin');
    if (typeSel) typeSel.addEventListener('change', syncWdSourceTypeUi);
    if (coinSel) {
      coinSel.addEventListener('change', () => {
        fillNetworkOptionsForCoin(document.getElementById('wdSrcNetwork'), coinSel.value, null);
      });
    }
    syncWdSourceTypeUi();
  }

  window.CP_tabs.withdraw = async function () {
    if (window.CP_tabs.withdraw.loaded) return;

    const mount = document.querySelector('section.view[data-view="withdraw"]');
    if (!mount) return;

    if (!mount.querySelector('#wdMainWrap')) {
      try {
        const html =
          typeof window.CP_fetchView === 'function'
            ? await window.CP_fetchView('assets/views/withdraw/withdraw.html')
            : await fetch(new URL('assets/views/withdraw/withdraw.html', document.baseURI).toString() + '?v=' + Date.now(), {
                credentials: 'same-origin'
              }).then((r) => {
                if (!r.ok) throw new Error('HTTP ' + r.status);
                return r.text();
              });
        mount.innerHTML = html;
      } catch (err) {
        console.error('[withdraw] load html', err);
        mount.innerHTML =
          '<div class="alert alert-danger m-3" role="alert">Could not load withdrawal layout.</div>';
        return;
      }
    }

    mount.classList.add('view-withdraw');

    wireWithdrawModalsChain();
    await loadSupportedCoins();
    initWdCryptoDropdowns();
    bindEditSourceTypeToggle();

    document.getElementById('wdViewAll')?.addEventListener('click', () => {
      viewAllMode = !viewAllMode;
      wdPage = 1;
      const btn = document.getElementById('wdViewAll');
      if (btn) btn.textContent = viewAllMode ? 'Paged view' : 'View All';
      renderTable();
    });

    document.getElementById('wdBtnCreateRequest')?.addEventListener('click', () => {
      const tpSel = document.getElementById('wdTpSelect');
      if (!tpSel?.value?.trim()) return;
      updateRequestModalSubtitle();
      const msg = document.getElementById('wdReqMsg');
      if (msg) {
        msg.textContent = '';
        msg.className = 'wd-modal-request__msg';
      }
      const m = document.getElementById('wdModalRequest');
      if (m) new bootstrap.Modal(m).show();
    });

    document.getElementById('wdBtnAccounts')?.addEventListener('click', () => {
      clearSourceFormEdit();
      loadSources().then(() => {
        const m = document.getElementById('wdModalAccounts');
        if (m) (bootstrap.Modal.getInstance(m) || new bootstrap.Modal(m)).show();
      });
    });

    document.getElementById('wdSrcList')?.addEventListener('click', (e) => {
      const editBtn = e.target.closest('.wd-src-edit');
      const delBtn = e.target.closest('.wd-src-delete');
      if (editBtn) {
        const id = editBtn.getAttribute('data-src-id');
        const s = sources.find((x) => String(x.id) === String(id));
        if (s) openEditSourceFromAccounts(s);
        return;
      }
      if (delBtn) {
        const id = delBtn.getAttribute('data-src-id');
        const s = sources.find((x) => String(x.id) === String(id));
        openDeleteSourceFromAccounts(id, s ? sourceRowLabel(s) : '');
      }
    });

    document.getElementById('wdFormEditSource')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const msg = document.getElementById('wdEditSrcMsg');
      const editId = document.getElementById('wdEditSrcId')?.value?.trim();
      if (!editId) {
        if (msg) {
          msg.textContent = 'Missing account id.';
          msg.className = 'wd-modal-request__msg text-danger';
        }
        return;
      }
      const type = document.getElementById('wdEditSrcType')?.value || 'Crypto';
      const label = document.getElementById('wdEditSrcLabel')?.value?.trim();
      if (!label) {
        if (msg) {
          msg.textContent = 'Enter a label.';
          msg.className = 'wd-modal-request__msg text-danger';
        }
        return;
      }

      let extraData;
      let sourceApi = type === 'Crypto' ? 'Crypto' : type;
      if (type === 'BankAccount') {
        const bankName = document.getElementById('wdEditSrcBankName')?.value?.trim() || '';
        const acct = document.getElementById('wdEditSrcBankAcct')?.value?.trim() || '';
        extraData = { name: label, bankName, accountNumber: acct };
      } else if (type === 'SurePay') {
        const prov = document.getElementById('wdEditSrcSpProvider')?.value?.trim() || '';
        const ref = document.getElementById('wdEditSrcSpAcct')?.value?.trim() || '';
        extraData = { name: label, bankName: prov, accountNumber: ref };
      } else {
        if (!wdSupportedCoins.length) {
          if (msg) {
            msg.textContent = 'Cryptocurrency list is not available. Refresh the page or try again later.';
            msg.className = 'wd-modal-request__msg text-danger';
          }
          return;
        }
        const coin = document.getElementById('wdEditSrcCoin')?.value?.trim() || '';
        const network = document.getElementById('wdEditSrcNetwork')?.value?.trim() || '';
        const wallet = document.getElementById('wdEditSrcWallet')?.value?.trim() || '';
        if (!network || !wallet) {
          if (msg) {
            msg.textContent = 'Network and wallet address are required for crypto.';
            msg.className = 'wd-modal-request__msg text-danger';
          }
          return;
        }
        extraData = { name: label, network, walletAddress: wallet };
        if (coin) extraData.coin = coin;
        sourceApi = 'Crypto';
      }

      if (msg) {
        msg.textContent = 'Saving…';
        msg.className = 'wd-modal-request__msg text-muted';
      }

      try {
        const res = await fetch(SOURCES_EDIT, {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            id: editId,
            type: 'Withdrawal',
            value: label,
            source: sourceApi,
            extraData
          })
        });
        const j = await res.json();
        if (!res.ok || j.status === 'error') throw new Error(j.message || 'Update failed');
        if (msg) {
          msg.textContent = 'Saved.';
          msg.className = 'wd-modal-request__msg text-success';
        }
        const editModal = document.getElementById('wdModalEditSource');
        setTimeout(() => bootstrap.Modal.getInstance(editModal)?.hide(), 400);
      } catch (err) {
        console.error(err);
        if (msg) {
          msg.textContent = err.message || 'Error';
          msg.className = 'wd-modal-request__msg text-danger';
        }
      }
    });

    document.getElementById('wdDeleteConfirmBtn')?.addEventListener('click', async () => {
      const id = pendingDeleteId;
      const errEl = document.getElementById('wdDeleteErr');
      const btn = document.getElementById('wdDeleteConfirmBtn');
      if (!id) return;
      if (errEl) {
        errEl.textContent = '';
        errEl.hidden = true;
      }
      if (btn) btn.disabled = true;
      try {
        const res = await fetch(SOURCES_DELETE, {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ id })
        });
        const j = await res.json();
        if (!res.ok || j.status === 'error') throw new Error(j.message || 'Delete failed');
        clearSourceFormEdit();
        const delModal = document.getElementById('wdModalDeleteSource');
        bootstrap.Modal.getInstance(delModal)?.hide();
      } catch (err) {
        console.error(err);
        if (errEl) {
          errEl.textContent = err.message || 'Could not remove account.';
          errEl.hidden = false;
        }
      } finally {
        if (btn) btn.disabled = false;
      }
    });

    document.getElementById('wdFormRequest')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const acc = currentAccount();
      const msg = document.getElementById('wdReqMsg');
      const srcId = document.getElementById('wdReqSource')?.value;
      const amtRaw = document.getElementById('wdReqAmount')?.value?.trim();

      if (!acc?.id) {
        if (msg) {
          msg.textContent = 'Select a TP / account.';
          msg.className = 'wd-modal-request__msg text-danger';
        }
        return;
      }
      if (!srcId) {
        if (msg) {
          msg.textContent = 'Select a withdrawal account.';
          msg.className = 'wd-modal-request__msg text-danger';
        }
        return;
      }
      const amt = parseFloat(amtRaw);
      if (Number.isNaN(amt) || amt < MIN_WITHDRAW_DEFAULT) {
        if (msg) {
          msg.textContent = 'Amount must be at least ' + MIN_WITHDRAW_DEFAULT + '.';
          msg.className = 'small text-danger text-center mt-2';
        }
        return;
      }
      const bal = Number(acc.balance) || 0;
      const maxW = Math.min(MAX_WITHDRAW_DEFAULT, bal);
      if (amt > maxW) {
        if (msg) {
          msg.textContent = 'Amount exceeds max withdrawal.';
          msg.className = 'wd-modal-request__msg text-danger';
        }
        return;
      }

      if (msg) {
        msg.textContent = 'Submitting…';
        msg.className = 'wd-modal-request__msg text-muted';
      }

      try {
        const res = await fetch(WITHDRAW_CREATE, {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            accountId: acc.id,
            amount: String(amt),
            currency: (acc.baseCurrency || 'USD').toUpperCase(),
            transactionSourceId: srcId,
            tpNumber: acc.tpNumber != null ? String(acc.tpNumber) : ''
          })
        });
        const j = await res.json().catch(() => ({}));
        if (!res.ok || j.status === 'error') {
          const detailMsg =
            (j.details && (j.details.message || j.details.error)) ||
            (typeof j.details === 'string' ? j.details : null);
          throw new Error(j.message || detailMsg || 'Request failed');
        }
        if (msg) {
          msg.textContent = 'Withdrawal request submitted.';
          msg.className = 'small text-success text-center mt-2';
        }
        document.getElementById('wdReqAmount').value = '';
        await loadTransactions();
        const modalEl = document.getElementById('wdModalRequest');
        setTimeout(() => {
          const inst = bootstrap.Modal.getInstance(modalEl);
          inst?.hide();
        }, 800);
      } catch (err) {
        console.error(err);
        if (msg) {
          msg.textContent = err.message || 'Failed';
          msg.className = 'wd-modal-request__msg text-danger';
        }
      }
    });

    document.getElementById('wdFormSource')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const msg = document.getElementById('wdSrcMsg');
      const type = document.getElementById('wdSrcType')?.value || 'Crypto';
      const label = document.getElementById('wdSrcLabel')?.value?.trim();
      if (!label) {
        if (msg) {
          msg.textContent = 'Enter a label.';
          msg.className = 'small text-danger';
        }
        return;
      }

      let extraData;
      let sourceApi = type === 'Crypto' ? 'Crypto' : type;
      if (type === 'BankAccount') {
        const bankName = document.getElementById('wdSrcBankName')?.value?.trim() || '';
        const acct = document.getElementById('wdSrcBankAcct')?.value?.trim() || '';
        extraData = { name: label, bankName, accountNumber: acct };
      } else if (type === 'SurePay') {
        const prov = document.getElementById('wdSrcSpProvider')?.value?.trim() || '';
        const ref = document.getElementById('wdSrcSpAcct')?.value?.trim() || '';
        extraData = { name: label, bankName: prov, accountNumber: ref };
      } else {
        if (!wdSupportedCoins.length) {
          if (msg) {
            msg.textContent = 'Cryptocurrency list is not available. Refresh the page or try again later.';
            msg.className = 'wd-modal-request__msg text-danger';
          }
          return;
        }
        const coin = document.getElementById('wdSrcCoin')?.value?.trim() || '';
        const network = document.getElementById('wdSrcNetwork')?.value?.trim() || '';
        const wallet = document.getElementById('wdSrcWallet')?.value?.trim() || '';
        if (!network || !wallet) {
          if (msg) {
            msg.textContent = 'Network and wallet address are required for crypto.';
            msg.className = 'wd-modal-request__msg text-danger';
          }
          return;
        }
        extraData = { name: label, network, walletAddress: wallet };
        if (coin) extraData.coin = coin;
        sourceApi = 'Crypto';
      }

      if (msg) {
        msg.textContent = 'Saving…';
        msg.className = 'wd-modal-request__msg text-muted';
      }

      try {
        const res = await fetch(SOURCES_CREATE, {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            type: 'Withdrawal',
            value: label,
            source: sourceApi,
            extraData
          })
        });
        const j = await res.json();
        if (!res.ok || j.status === 'error') throw new Error(j.message || 'Failed');
        if (msg) {
          msg.textContent = 'Saved.';
          msg.className = 'wd-modal-request__msg text-success';
        }
        clearSourceFormEdit();
        await loadSources();
      } catch (err) {
        console.error(err);
        if (msg) {
          msg.textContent = err.message || 'Error';
          msg.className = 'wd-modal-request__msg text-danger';
        }
      }
    });

    bindSourceFormToggle();

    await Promise.all([loadAccounts(), loadTransactions(), loadSources()]);
    updateRequestModalSubtitle();

    window.CP_tabs.withdraw.loaded = true;
  };

  window.CP_onViewShow.withdraw = function () {
    if (!window.CP_tabs.withdraw.loaded) return;
    loadTransactions();
    loadSources();
    loadSupportedCoins().then(() => initWdCryptoDropdowns());
  };
})();
