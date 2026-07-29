// assets/js/tabs/home.tab.js — Dashboard (Figma layout)
window.CP_tabs = window.CP_tabs || {};
window.CP_state = window.CP_state || {};  

window.CP_tabs.home = function () {
  const view = document.querySelector('section.view[data-view="home"]');
  if (!view) return;

  const root = document.getElementById('home-view-root') || view;

  let allTxs = [];
  let txShowAll = false;
  let txPage = 1;
  const TX_PAGE_SIZE = 5;

  let newsItems = [];
  let newsExpanded = false;
  /** How many news cards to show; grows via scroll (IntersectionObserver) until all loaded */
  let newsVisibleCount = 6;
  const NEWS_PAGE_SIZE = 6;
  let newsScrollObserver = null;

  let allAccounts = [];
  let selectedTp = null;

  function escapeHtml(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  function escapeAttr(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;');
  }

  /** Stock News API: Postman sample uses `news_url`; also support url, link, etc. */
  function newsArticleUrl(n) {
    if (!n || typeof n !== 'object') return '';
    const raw =
      n.news_url ||
      n.url ||
      n.link ||
      n.source_url ||
      n.article_url ||
      n.canonical_url ||
      '';
    if (typeof raw !== 'string') return '';
    const t = raw.trim();
    if (!t) return '';
    if (/^https?:\/\//i.test(t)) return t;
    if (/^\/\//.test(t)) return 'https:' + t;
    return '';
  }

  function formatMoney(n) {
    const v = Number(n);
    if (Number.isNaN(v)) return '$0';
    if (Math.abs(v) >= 1000) return '$' + (v / 1000).toFixed(1) + 'k';
    return '$' + v.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  }

  /** ISO 4217 code → symbol (Recent Transactions amount: show $ not "USD") */
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

  function setGreetingName() {
    const el = document.getElementById('dashUserName');
    if (!el || !window.CP_USER) return;
    const u = window.CP_USER;
    const first = (u.firstName || '').trim();
    const last = (u.lastName || '').trim();
    const full = [first, last].filter(Boolean).join(' ') || u.email || 'John Doe';
    el.textContent = full;
  }

  function mockPl(seed) {
    const x = Math.sin(seed * 12.9898) * 43758.5453;
    return Math.round((x % 2000) - 800);
  }

  /* Sparkline stroke/fill: same hex as --cz-accent in dashboard.css */
  function sparklineSvg(seed) {
    const accent = '#7B61FF';
    const w = 280;
    const h = 56;
    const gid = 'g' + seed + '-' + Math.random().toString(36).slice(2, 8);
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

  function renderAccountCards() {
    const rootEl = document.getElementById('dashAccountCards');
    if (!rootEl) return;

    const list = allAccounts.slice(0, 3);
    if (!list.length) {
      rootEl.innerHTML = '<div class="home-empty" style="grid-column:1/-1">No trading accounts.</div>';
      return;
    }

    rootEl.innerHTML = list
      .map((acc, i) => {
        const bal = parseFloat(acc.balance || 0);
        const id = acc.tpNumber || acc.accountNumber || '—';
        const pl = mockPl(i + (id || '').length);
        const equity = bal + pl * 0.001;
        const marginPct = 40 + (i % 4) * 5;
        const plCls = pl < 0 ? 'pl-neg' : 'pl-pos';
        const plSign = pl < 0 ? '' : '+';
        return `
        <article class="dash-acc-card">
          <div class="dash-acc-id">Account : #${escapeHtml(String(id))}</div>
          <div class="dash-acc-balance">${formatMoney(bal)}</div>
          <div class="dash-acc-meta">
            <span class="dash-acc-meta-item">
              <span class="dash-acc-meta-label">Equity :</span>
              <span class="dash-acc-meta-val">${formatMoney(equity)}</span>
            </span>
            <span class="dash-acc-meta-item ${plCls}">
              <span class="dash-acc-meta-label">P/L :</span>
              <span class="dash-acc-meta-val">${plSign}${formatMoney(Math.abs(pl))}</span>
            </span>
            <span class="dash-acc-meta-item">
              <span class="dash-acc-meta-label">Margin :</span>
              <span class="dash-acc-meta-val">${marginPct}%</span>
            </span>
          </div>
          <div class="dash-acc-chart">${sparklineSvg(i + 1)}</div>
        </article>`;
      })
      .join('');
  }

  /** Compact stroke icon before transaction ID (matches nav / Riseeth-style) */
  function txRowIdIcon() {
    return `<span class="dash-table-id-icon" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" focusable="false" aria-hidden="true"><path stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M12 5v14"/><path stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="m19 12-7 7-7-7"/></svg></span>`;
  }

  function statusBadge(status) {
    const s = (status || '').toLowerCase();
    let cls = 'dash-badge--default';
    if (s.includes('block')) cls = 'dash-badge--blocked';
    else if (s.includes('verif') || s.includes('complete') || s === 'approved') cls = 'dash-badge--verified';
    else if (s.includes('pend')) cls = 'dash-badge--pending';
    else if (s.includes('reject')) cls = 'dash-badge--rejected';
    return `<span class="dash-badge ${cls}">${escapeHtml(status || '—')}</span>`;
  }

  /**
   * Recent Transactions pager — shared rules in assets/js/lib/cp-pagination.js (CP_compactPaginationHtml).
   */
  function renderTxPagination(total, page, pageSize) {
    if (typeof window.CP_compactPaginationHtml === 'function') {
      return window.CP_compactPaginationHtml(total, page, pageSize, 'p');
    }
    const pages = Math.max(1, Math.ceil(total / pageSize));
    const cur = Math.min(Math.max(1, page), pages);
    let html = '';
    html += `<button type="button" class="dash-page-btn dash-page-btn--arrow" ${cur <= 1 ? 'disabled' : ''} data-p="${cur - 1}" aria-label="Previous">&lt;</button>`;
    const ell = `<span class="dash-page-ellipsis" aria-hidden="true">…</span>`;
    const btn = (p) =>
      `<button type="button" class="dash-page-btn ${p === cur ? 'is-active' : ''}" data-p="${p}">${p}</button>`;
    if (pages <= 5) {
      for (let p = 1; p <= pages; p++) html += btn(p);
    } else if (cur <= 3) {
      html += btn(1) + btn(2) + btn(3) + ell + btn(pages);
    } else if (cur >= pages - 2) {
      html += btn(1) + ell + btn(pages - 2) + btn(pages - 1) + btn(pages);
    } else {
      html += btn(1) + ell + btn(cur) + ell + btn(pages);
    }
    html += `<button type="button" class="dash-page-btn dash-page-btn--arrow" ${cur >= pages ? 'disabled' : ''} data-p="${cur + 1}" aria-label="Next">&gt;</button>`;
    return { html, pages, cur };
  }

  function attachPagination(el, handler) {
    if (!el) return;
    if (typeof window.CP_attachDashPagination === 'function') {
      window.CP_attachDashPagination(el, 'p', handler);
      return;
    }
    el.querySelectorAll('.dash-page-btn[data-p]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (btn.disabled) return;
        const p = parseInt(btn.getAttribute('data-p'), 10);
        if (!Number.isNaN(p)) handler(p);
      });
    });
  }

  function disposeHomeTxTooltips(listEl) {
    if (!listEl) return;
    if (listEl._homeTxTipExclusiveShow) {
      listEl.removeEventListener('show.bs.tooltip', listEl._homeTxTipExclusiveShow);
      listEl._homeTxTipExclusiveShow = null;
    }
    if (typeof bootstrap === 'undefined' || !bootstrap.Tooltip) return;
    listEl.querySelectorAll('[data-home-tx-tip="1"]').forEach((el) => {
      const inst = bootstrap.Tooltip.getInstance(el);
      if (inst) inst.dispose();
    });
  }

  /** Desktop: hover/focus. Phone/tablet: tap opens full ID / rejection text (no hover). */
  function initHomeTxTooltips(listEl) {
    if (!listEl || typeof bootstrap === 'undefined' || !bootstrap.Tooltip) return;
    const narrow =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(max-width: 991.98px)').matches;
    listEl.querySelectorAll('[data-home-tx-tip="1"]').forEach((el) => {
      new bootstrap.Tooltip(el, {
        container: 'body',
        customClass: 'home-tx-tooltip',
        html: false,
        trigger: narrow ? 'click focus' : 'hover focus',
        delay: narrow ? { show: 0, hide: 0 } : { show: 150, hide: 80 },
      });
    });

    /** Only one transaction tooltip visible at a time (tap or hover another closes the first). */
    const exclusiveShow = (ev) => {
      const t = ev.target;
      if (!t || t.getAttribute('data-home-tx-tip') !== '1') return;
      listEl.querySelectorAll('[data-home-tx-tip="1"]').forEach((el) => {
        if (el === t) return;
        const inst = bootstrap.Tooltip.getInstance(el);
        if (inst) inst.hide();
      });
    };
    listEl.addEventListener('show.bs.tooltip', exclusiveShow);
    listEl._homeTxTipExclusiveShow = exclusiveShow;
  }

  if (!window._CP_homeTxTooltipResize) {
    window._CP_homeTxTooltipResize = true;
    let homeTxTipResizeT;
    window.addEventListener('resize', () => {
      const list = document.getElementById('homeTransactionsList');
      const home = document.querySelector('section.view[data-view="home"]');
      if (!list || !home?.classList.contains('show') || !list.querySelector('[data-home-tx-tip="1"]')) return;
      clearTimeout(homeTxTipResizeT);
      homeTxTipResizeT = setTimeout(() => {
        disposeHomeTxTooltips(list);
        initHomeTxTooltips(list);
      }, 200);
    });
  }

  fetch('assets/views/home/home.html?v=' + Date.now())
    .then(r => r.text())
    .then(html => {
      root.innerHTML = html;
      setGreetingName();
      bindHomeEvents();
      loadHomeData();
    })
    .catch(err => {
      console.error('home template error', err);
      root.innerHTML = '<div class="text-danger p-3">Failed to load home view.</div>';
    });

  function bindHomeEvents() {
    document.getElementById('homeDepositBtn')?.addEventListener('click', () => {
      window.CP_showView && window.CP_showView('deposit');
    });
    document.getElementById('homeWithdrawBtn')?.addEventListener('click', () => {
      window.CP_showView && window.CP_showView('withdraw');
    });

    document.getElementById('homeTxViewAll')?.addEventListener('click', () => {
      txShowAll = !txShowAll;
      txPage = 1;
      renderTransactions();
    });

    document.getElementById('homeNewsMore')?.addEventListener('click', () => {
      /* Open full News tab (Analysis → News); same pattern as home deposit/withdraw shortcuts. */
      if (typeof window.CP_showView === 'function') {
        void window.CP_showView('analysis-news');
      }
    });

    const tpSelected = document.getElementById('homeTpSelected');
    const tpDropdown = document.getElementById('homeTpDropdown');
    if (tpSelected && tpDropdown) {
      tpSelected.addEventListener('click', e => {
        e.stopPropagation();
        tpDropdown.classList.toggle('open');
      });
      document.addEventListener('click', e => {
        if (!tpSelected.contains(e.target) && !tpDropdown.contains(e.target)) {
          tpDropdown.classList.remove('open');
        }
      });
    }
  }

  async function loadHomeData() {
    await Promise.all([loadAccounts(), loadTransactions(), loadNews()]);
  }

  async function loadAccounts() {
    try {
      const res = await fetch('api/accounts/get_accounts.php');
      const data = await res.json();
      if (!res.ok || data.status === 'error') return;

      allAccounts = (data.data || []).filter(a => !a.isArchived);
      if (!allAccounts.length) {
        renderAccountCards();
        return;
      }

      const defaultAcc = allAccounts.find(a => !a.isDemoAccount) || allAccounts[0];
      selectedTp = defaultAcc.tpNumber;
      
      window.CP_state.accounts = allAccounts;
      window.CP_state.selectedTp = selectedTp;
      
      renderAccountsDropdown();
      updateSelectedAccountUI();
    } catch (e) {
      console.error('accounts fetch error', e);
    }
  }

  function renderAccountsDropdown() {
    const tpDropdown = document.getElementById('homeTpDropdown');
    if (!tpDropdown) return;
    tpDropdown.innerHTML = '';
    allAccounts.forEach(acc => {
      const item = document.createElement('div');
      item.className = 'home-tp-item';
      item.textContent = acc.tpNumber || '';
      if (acc.tpNumber === selectedTp) item.classList.add('active');
      item.addEventListener('click', () => {
        selectedTp = acc.tpNumber;
        tpDropdown.querySelectorAll('.home-tp-item').forEach(el => el.classList.remove('active'));
        item.classList.add('active');
        updateSelectedAccountUI();
        tpDropdown.classList.remove('open');
      });
      tpDropdown.appendChild(item);
    });
  }

  function updateSelectedAccountUI() {
    const tpText = document.getElementById('homeTpSelectedText');
    const acc = allAccounts.find(a => a.tpNumber === selectedTp) || allAccounts[0];
    if (!acc) return;
    if (tpText) tpText.textContent = acc.tpNumber || '—';

    window.CP_state.accounts = allAccounts;
    window.CP_state.selectedTp = selectedTp;

    renderTransactions();
    renderAccountCards();
  }

  async function loadTransactions() {
    const listEl = document.getElementById('homeTransactionsList');
    if (!listEl) return;
    try {
      const res = await fetch('api/accounts/get_transactions.php');
      const data = await res.json();
      if (!res.ok || data.status === 'error') {
        disposeHomeTxTooltips(listEl);
        listEl.innerHTML = `<tr><td colspan="5" class="text-center home-empty">Failed to load transactions.</td></tr>`;
        return;
      }
      allTxs = (data.data || []).slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      txPage = 1;
      renderTransactions();
    } catch (e) {
      console.error('tx error', e);
      disposeHomeTxTooltips(listEl);
      listEl.innerHTML = `<tr><td colspan="5" class="text-center home-empty">Failed to load transactions.</td></tr>`;
    }
  }

  function renderTransactions() {
    const listEl = document.getElementById('homeTransactionsList');
    const btn = document.getElementById('homeTxViewAll');
    const pagEl = document.getElementById('dashTxPagination');
    if (!listEl) return;

    let txs = allTxs.slice();
    if (!txShowAll) {
    if (selectedTp) {
      const filtered = txs.filter(t => {
          const tp = t.tpNumber || t.accountNumber || (t.account && t.account.tpNumber);
        return tp === selectedTp;
      });
        if (filtered.length) txs = filtered;
      }
    } else {
      txs = allTxs.slice();
    }

    if (!txs.length) {
      disposeHomeTxTooltips(listEl);
      listEl.innerHTML = `<tr><td colspan="5" class="text-center home-empty">No transactions yet.</td></tr>`;
      if (pagEl) pagEl.innerHTML = '';
      if (btn) {
        btn.textContent = 'View All';
        btn.title = 'Show transactions from all accounts — page count updates to match the full list';
        btn.setAttribute('aria-pressed', 'false');
      }
      return;
    }

    const total = txs.length;
    const pageSize = TX_PAGE_SIZE;
    const pages = Math.max(1, Math.ceil(total / pageSize));
    txPage = Math.min(Math.max(1, txPage), pages);
    const start = (txPage - 1) * pageSize;
    const slice = txs.slice(start, start + pageSize);

    const hasBsTip = typeof bootstrap !== 'undefined' && bootstrap.Tooltip;

    disposeHomeTxTooltips(listEl);

    listEl.innerHTML = slice
      .map((tx) => {
        const id = tx.id || tx.transactionId || tx.reference || '—';
        const d = new Date(tx.createdAt);
        const dateStr = isNaN(d.getTime())
          ? '—'
          : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
        const amt = formatTxAmount(tx.amount, tx.currency);
        /* API returns rejectReason (see clientzone/lead/account/transactions) */
        const reason = tx.rejectReason || tx.rejectionReason || tx.reason || tx.message || '—';
        const showReason = (tx.status || '').toLowerCase().includes('reject') ? reason : '—';
        const idFull = '#' + String(id);
        const reasonStr = String(showReason);
        const reasonTip = reasonStr !== '—' && reasonStr.length > 0 ? escapeAttr(reasonStr) : '';
        const idTipAttrs = hasBsTip
          ? ` class="dash-table-id dash-tip-tx-id" data-home-tx-tip="1" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-container="body" title="${escapeAttr(idFull)}"`
          : ` class="dash-table-id" title="${escapeAttr(idFull)}"`;
        const reasonCell =
          reasonTip !== ''
            ? hasBsTip
              ? `<span class="dash-table-reason dash-tip-tx-reason" data-home-tx-tip="1" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-container="body" title="${reasonTip}">${escapeHtml(showReason)}</span>`
              : `<span class="dash-table-reason" title="${reasonTip}">${escapeHtml(showReason)}</span>`
            : escapeHtml(showReason);
        return `
        <tr>
          <td>${escapeHtml(dateStr)}</td>
          <td class="dash-table-td--txn-id">
            <span${idTipAttrs}>${txRowIdIcon()}<span class="dash-table-id-num">#${escapeHtml(String(id))}</span></span>
          </td>
          <td>${escapeHtml(amt)}</td>
          <td>${statusBadge(tx.status)}</td>
          <td class="dash-table-td--reason ${showReason === '—' ? 'dash-empty-cell' : ''}">${reasonCell}</td>
        </tr>`;
      })
      .join('');

    initHomeTxTooltips(listEl);

    if (btn) {
      btn.textContent = txShowAll ? 'Show less' : 'View All';
      btn.title = txShowAll
        ? 'Show only transactions for the selected trading account'
        : 'Show transactions from all accounts — page count updates to match the full list';
      btn.setAttribute('aria-pressed', txShowAll ? 'true' : 'false');
    }

    if (pagEl) {
      if (pages > 1) {
        const { html } = renderTxPagination(total, txPage, pageSize);
        pagEl.innerHTML = html;
        attachPagination(pagEl, p => {
          txPage = p;
          renderTransactions();
        });
      } else {
        pagEl.innerHTML = '';
      }
    }
  }

  function timeAgo(dateStr) {
    const d = new Date(dateStr);
    if (isNaN(d)) return '';
    const diffMs = Date.now() - d.getTime();
    const mins = Math.round(diffMs / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return mins + ' min ago';
    const hrs = Math.round(mins / 60);
    if (hrs < 24) return hrs + 'h ago';
    return Math.round(hrs / 24) + 'd ago';
  }

  async function loadNews() {
    const listEl = document.getElementById('homeNewsList');
    if (!listEl) return;
    try {
      const res = await fetch('api/news/latest.php');
      const data = await res.json();
      if (!res.ok || data.status === 'error') {
        listEl.innerHTML = '<div class="home-empty">Failed to load news.</div>';
        return;
      }
      newsItems = data.data || [];
      newsVisibleCount = Math.min(NEWS_PAGE_SIZE, newsItems.length || NEWS_PAGE_SIZE);
      renderNews();
    } catch (e) {
      console.error('news error', e);
      listEl.innerHTML = '<div class="home-empty">Failed to load news.</div>';
    }
  }

  function setupNewsInfiniteScroll() {
    const sentinel = document.getElementById('homeNewsSentinel');
    const mainEl = document.getElementById('mainContent');
    if (newsScrollObserver) {
      newsScrollObserver.disconnect();
      newsScrollObserver = null;
    }
    if (!sentinel || !mainEl) return;
    if (newsExpanded || !newsItems.length) {
      sentinel.classList.toggle('dash-news-sentinel--done', !newsItems.length || newsVisibleCount >= newsItems.length);
      return;
    }
    if (newsVisibleCount >= newsItems.length) {
      sentinel.classList.add('dash-news-sentinel--done');
      return;
    }
    sentinel.classList.remove('dash-news-sentinel--done');

    newsScrollObserver = new IntersectionObserver(
      (entries) => {
        const hit = entries.some((e) => e.isIntersecting);
        if (!hit || newsExpanded) return;
        if (newsVisibleCount >= newsItems.length) return;
        newsVisibleCount = Math.min(newsVisibleCount + NEWS_PAGE_SIZE, newsItems.length);
        renderNews();
      },
      { root: mainEl, rootMargin: '160px 0px', threshold: 0 }
    );
    newsScrollObserver.observe(sentinel);
  }

  function renderNews() {
    const listEl = document.getElementById('homeNewsList');
    const titleEl = document.getElementById('homeNewsTitle');
    const moreBtn = document.getElementById('homeNewsMore');
    if (!listEl) return;

    if (!newsItems.length) {
      if (newsScrollObserver) {
        newsScrollObserver.disconnect();
        newsScrollObserver = null;
      }
      listEl.innerHTML = '<div class="home-empty">No news available.</div>';
      const pb = document.getElementById('dashNewsPaginationBottom');
      if (pb) pb.innerHTML = '';
      if (titleEl) titleEl.textContent = 'Latest News';
      if (moreBtn) moreBtn.textContent = 'View All';
      return;
    }

    const total = newsItems.length;
    const cap = newsExpanded ? total : Math.min(newsVisibleCount, total);
    const itemsToShow = newsItems.slice(0, cap);

    listEl.innerHTML = itemsToShow
      .map(n => {
        const imgUrl = n.image_url || n.image || '';
        const title = n.title || '';
        const text = (n.text || '').substring(0, 220);
        const href = newsArticleUrl(n);
        const thumb = imgUrl
          ? `<div class="dash-news-thumb"><img src="${escapeHtml(imgUrl)}" alt=""></div>`
          : `<div class="dash-news-thumb" aria-hidden="true"></div>`;
        const body = `
          ${thumb}
          <div class="dash-news-body">
            <h3 class="dash-news-card-title">${escapeHtml(title)}</h3>
            <p class="dash-news-card-text">${escapeHtml(text)}${(n.text || '').length > 220 ? '…' : ''}</p>
          </div>`;
        const label = title.trim() || 'News article';
        if (href) {
          return `
        <a class="dash-news-card dash-news-card--link" href="${escapeAttr(href)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeAttr(label)}">
          ${body}
        </a>`;
        }
        return `
        <article class="dash-news-card">
          ${body}
        </article>`;
      })
      .join('');

    const pagBottom = document.getElementById('dashNewsPaginationBottom');
    if (pagBottom) {
      pagBottom.innerHTML = '';
      pagBottom.hidden = true;
    }

    if (titleEl) titleEl.textContent = newsExpanded ? 'All News' : 'Latest News';
    if (moreBtn) moreBtn.textContent = newsExpanded ? '← Back' : 'View All';

    setupNewsInfiniteScroll();
  }
};
