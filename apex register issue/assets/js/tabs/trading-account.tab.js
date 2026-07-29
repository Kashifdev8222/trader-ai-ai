// Trading Account tab — Figma layout; api/accounts/get_accounts.php (session)
window.CP_tabs = window.CP_tabs || {};
window.CP_onViewShow = window.CP_onViewShow || {};

(function () {
  const PAGE_SIZE = 6;

  /* Outline icons — same stroke style as Dashboard home actions */
  const SVG_DEPOSIT = `<svg class="ta-svg-dash" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M12 5v14"/><path stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M5 12h14"/></svg>`;

  const SVG_WITHDRAW = `<svg class="ta-svg-dash" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;

  const SVG_EDIT = `<svg class="ta-svg-edit" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>`;

  const SVG_KEBAB = `<svg class="ta-kebab-icon" width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>`;

  let accounts = [];
  let filterKind = 'real';
  let page = 1;
  let openMenuRow = null;

  function escapeHtml(s) {
    const d = document.createElement('div');
    d.textContent = s == null ? '' : String(s);
    return d.innerHTML;
  }

  function fmtMoney(n) {
    const v = Number(n);
    if (Number.isNaN(v)) return '0.00';
    return v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function fmtBalanceCell(acc) {
    const v = fmtMoney(acc.balance);
    const c = (acc.baseCurrency || 'USD').toUpperCase();
    if (c === 'USD') return `$ ${v}`;
    return `${v} ${c}`;
  }

  function fmtCurrencyCol(acc) {
    return (acc.baseCurrency || 'USD').toUpperCase();
  }

  function fmtLastSync(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  }

  /** Data cells — table thead provides labels (Riseeth-style layout). */
  function taTd(innerHtml, className) {
    const cls = className ? ` class="${className}"` : '';
    return `<td${cls}>${innerHtml}</td>`;
  }

  function filteredAccounts() {
    return accounts.filter(acc => {
      const demo = !!acc.isDemoAccount;
      return filterKind === 'demo' ? demo : !demo;
    });
  }

  function setTableEmptyState(empty) {
  const wrap = document.querySelector('.view-ta .ta-table-responsive');
  const table = document.querySelector('.view-ta .ta-table');
  wrap?.classList.toggle('ta-table-wrap--empty', empty);
  table?.classList.toggle('ta-table--empty', empty);
  
  // Ensure scroll container always has horizontal scroll capability
  if (wrap) {
    wrap.style.overflowX = 'auto';
    wrap.style.webkitOverflowScrolling = 'touch';
  }
}

  function closeRowMenusOnly() {
    document.querySelectorAll('.ta-row-dropdown').forEach((el) => {
      el.hidden = true;
      el.removeAttribute('style');
    });
    document.querySelectorAll('.ta-kebab[aria-expanded="true"]').forEach((b) => b.setAttribute('aria-expanded', 'false'));
    openMenuRow = null;
  }

  function closeTypePicker() {
    const typeMenu = document.getElementById('taTypeMenu');
    const typeBtn = document.getElementById('taTypeBtn');
    if (!typeMenu) return;
    typeMenu.hidden = true;
    typeMenu.removeAttribute('style');
    typeBtn?.setAttribute('aria-expanded', 'false');
  }

  function closeAllMenus() {
    closeRowMenusOnly();
    closeTypePicker();
  }

  /** Real/Demo picker: fixed to viewport so parent overflow never clips it; flips above when needed. */
  function positionTaTypeMenu(btn, menu) {
    if (!btn || !menu) return;
    const r = btn.getBoundingClientRect();
    const gap = 6;
    const minW = Math.max(220, Math.round(r.width));
    menu.style.position = 'fixed';
    menu.style.zIndex = '1060';
    menu.style.boxSizing = 'border-box';
    menu.style.minWidth = `${minW}px`;
    let left = Math.round(r.left);
    if (left + minW > window.innerWidth - 8) {
      left = Math.max(8, window.innerWidth - 8 - minW);
    }
    menu.style.left = `${left}px`;
    menu.style.right = 'auto';
    const h = menu.offsetHeight || 88;
    let top = Math.round(r.bottom + gap);
    if (top + h > window.innerHeight - 8) {
      top = Math.max(8, Math.round(r.top - h - gap));
    }
    menu.style.top = `${top}px`;
    menu.style.bottom = 'auto';
  }

  function positionTaDropdown(btn, drop) {
    const r = btn.getBoundingClientRect();
    const gap = 8;
    drop.style.position = 'fixed';
    drop.style.zIndex = '1055';
    drop.style.left = 'auto';
    drop.style.right = `${Math.max(8, Math.round(window.innerWidth - r.right))}px`;
    let top = r.bottom + gap;
    drop.style.top = `${Math.round(top)}px`;
    requestAnimationFrame(() => {
      const h = drop.offsetHeight;
      if (top + h > window.innerHeight - 12) {
        top = Math.max(12, r.top - h - gap);
        drop.style.top = `${Math.round(top)}px`;
      }
    });
  }

  function renderPagination(total, cur, pages, el, onPage) {
    if (!el) return;
    if (total === 0) {
      el.innerHTML = '';
      return;
    }
    const p = Math.min(Math.max(1, cur), pages);
    if (pages <= 1) {
      el.innerHTML = '';
      return;
    }
    if (typeof window.CP_compactPaginationHtml === 'function') {
      const { html } = window.CP_compactPaginationHtml(total, p, PAGE_SIZE, 'tap');
      el.innerHTML = `<div class="dash-pagination ta-dash-pagination">${html}</div>`;
      window.CP_attachDashPagination?.(el.firstElementChild, 'tap', onPage);
      return;
    }
    let html = '';
    html += `<button type="button" class="ta-page-btn ta-page-btn--arrow" ${p <= 1 ? 'disabled' : ''} data-tap="${p - 1}" aria-label="Previous">&lt;</button>`;
    for (let i = 1; i <= pages; i++) {
      html += `<button type="button" class="ta-page-btn ${i === p ? 'is-active' : ''}" data-tap="${i}">${i}</button>`;
    }
    html += `<button type="button" class="ta-page-btn ta-page-btn--arrow" ${p >= pages ? 'disabled' : ''} data-tap="${p + 1}" aria-label="Next">&gt;</button>`;
    el.innerHTML = html;
    el.querySelectorAll('.ta-page-btn[data-tap]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (btn.disabled) return;
        const next = parseInt(btn.getAttribute('data-tap'), 10);
        if (!Number.isNaN(next)) onPage(next);
      });
    });
  }

  function renderTable() {
  const tbody = document.getElementById('taTableBody');
  const totalEl = document.getElementById('taTotalBalance');
  const pagEl = document.getElementById('taPagination');
  if (!tbody) return;

  closeAllMenus();

  const list = filteredAccounts().filter(a => !a.isArchived);
  const sum = list.reduce((acc, a) => acc + (Number(a.balance) || 0), 0);
  if (totalEl) totalEl.textContent = '$ ' + fmtMoney(sum);

  const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  page = Math.min(page, pages);
  const start = (page - 1) * PAGE_SIZE;
  const slice = list.slice(start, start + PAGE_SIZE);

  const pagHandler = np => {
    page = np;
    renderTable();
  };

  // ALWAYS show table structure - even when empty
  if (!slice.length) {
    // Create an empty row with "no data" message, but preserve all columns
    tbody.innerHTML = `
      <tr class="ta-empty-row">
        <td colspan="6" class="ta-empty">No accounts in this category.</td>
      </tr>
    `;
    setTableEmptyState(true);
    renderPagination(list.length, page, pages, pagEl, pagHandler);
    return;
  }

  setTableEmptyState(false);

  tbody.innerHTML = slice
    .map((acc, idx) => {
      const active = !acc.isDisabled && !acc.isArchived;
      const statusInner = active
        ? `<span class="ta-status"><span class="ta-status-dot ta-status-dot--active" aria-hidden="true"></span>Active</span>`
        : `<span class="ta-status"><span class="ta-status-dot ta-status-dot--off" aria-hidden="true"></span>Inactive</span>`;
      const lastIso = acc.lastLoginNew || acc.lastLogin;
      const syncStr = lastIso ? fmtLastSync(lastIso) : '—';
      const menuId = `m${start + idx}`;
      const accId = escapeHtml(acc.id || '');
      const tpPlain = acc.tpNumber != null && acc.tpNumber !== '' ? String(acc.tpNumber) : '—';
      const tpSafe = escapeHtml(tpPlain);
      const nameEsc = escapeHtml(acc.name || '');

      return `
      <tr data-acc-id="${accId}">
        ${taTd(`<span class="ta-tp-num">${tpSafe}</span>`)}
        ${taTd(escapeHtml(fmtBalanceCell(acc)))}
        ${taTd(`<span class="ta-currency">${escapeHtml(fmtCurrencyCol(acc))}</span>`)}
        ${taTd(statusInner)}
        ${taTd(escapeHtml(syncStr))}
        <td class="ta-actions-cell ta-td--actions">
          <button type="button" class="ta-kebab" data-ta-menu="${menuId}" aria-label="Row actions" aria-expanded="false">
            ${SVG_KEBAB}
          </button>
          <div class="ta-row-dropdown" id="ta-menu-${menuId}" hidden>
            <button type="button" class="ta-drop-deposit" data-act="deposit" data-tp="${tpSafe}" data-id="${accId}">
              ${SVG_DEPOSIT} Deposit
            </button>
            <button type="button" class="ta-drop-link" data-act="withdraw" data-tp="${tpSafe}" data-id="${accId}">
              ${SVG_WITHDRAW} Withdraw
            </button>
            <button type="button" class="ta-drop-link" data-act="edit" data-tp="${tpSafe}" data-id="${accId}" data-name="${nameEsc}">
              ${SVG_EDIT} Edit
            </button>
          </div>
         </td>
       </tr>`;
    })
    .join('');

  renderPagination(list.length, page, pages, pagEl, pagHandler);

  tbody.querySelectorAll('.ta-kebab').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const id = btn.getAttribute('data-ta-menu');
      const drop = document.getElementById('ta-menu-' + id);
      if (!drop) return;
      const wasOpen = !drop.hidden;
      closeAllMenus();
      if (!wasOpen) {
        drop.hidden = false;
        positionTaDropdown(btn, drop);
        btn.setAttribute('aria-expanded', 'true');
        openMenuRow = id;
      }
    });
  });

  tbody.querySelectorAll('.ta-row-dropdown button[data-act]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const act = btn.getAttribute('data-act');
      const id = btn.getAttribute('data-id');
      const tp = btn.getAttribute('data-tp');
      closeAllMenus();
      if (act === 'deposit') {
        window.CP_state = window.CP_state || {};
        window.CP_state.preferredTpNumber = tp;
        if (typeof window.CP_showView === 'function') window.CP_showView('deposit');
      }
      if (act === 'withdraw') {
        window.CP_state = window.CP_state || {};
        window.CP_state.preferredTpNumber = tp;
        if (typeof window.CP_showView === 'function') window.CP_showView('withdraw');
      }
      if (act === 'edit') {
        const name = btn.getAttribute('data-name') || '';
        document.getElementById('taEditAccountId').value = id;
        document.getElementById('taEditAccountName').value = name;
        const msg = document.getElementById('taEditMsg');
        if (msg) {
          msg.textContent = '';
          msg.className = 'small mt-2 text-center';
        }
        const modalEl = document.getElementById('taEditNameModal');
        if (modalEl) {
          const m = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
          m.show();
        }
      }
    });
  });
}

  async function loadAccounts() {
    const tbody = document.getElementById('taTableBody');
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="6" class="ta-empty">Loading…</td></tr>`;
    }
    try {
      const uid = window.CP_USER?.userId || '';
      const url = uid ? `api/accounts/get_accounts.php?userId=${encodeURIComponent(uid)}` : 'api/accounts/get_accounts.php';
      const res = await fetch(url, { credentials: 'same-origin', headers: { Accept: 'application/json' } });
      const json = await res.json();
      if (!res.ok || json.status === 'error') {
        throw new Error(json.message || 'Failed to load');
      }
      const raw = json.data;
      accounts = Array.isArray(raw) ? raw : raw?.accounts || [];
      if (window.CP_state) window.CP_state.accounts = accounts;
      renderTable();
    } catch (err) {
      console.error('Trading accounts:', err);
      if (tbody) {
        tbody.innerHTML = `<tr><td colspan="6" class="ta-empty text-danger">Could not load accounts.</td></tr>`;
        setTableEmptyState(true);
      }
    }
  }

  function bindStaticUi() {
    const typeBtn = document.getElementById('taTypeBtn');
    const typeMenu = document.getElementById('taTypeMenu');
    const typeLabel = document.getElementById('taTypeLabel');

    typeBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      closeRowMenusOnly();
      const willShow = typeMenu.hidden;
      typeMenu.hidden = !willShow;
      typeBtn.setAttribute('aria-expanded', willShow ? 'true' : 'false');
      if (!typeMenu.hidden) {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => positionTaTypeMenu(typeBtn, typeMenu));
        });
      } else {
        typeMenu.removeAttribute('style');
      }
    });

    document.querySelectorAll('.ta-type-option').forEach(opt => {
      opt.addEventListener('click', () => {
        const kind = opt.getAttribute('data-kind');
        filterKind = kind === 'demo' ? 'demo' : 'real';
        if (typeLabel) typeLabel.textContent = filterKind === 'demo' ? 'Demo Account' : 'Real Account';
        typeMenu.hidden = true;
        typeBtn.setAttribute('aria-expanded', 'false');
        page = 1;
        renderTable();
      });
    });

    document.addEventListener('click', () => {
      closeAllMenus();
    });

    typeMenu?.addEventListener('click', e => e.stopPropagation());

    document.getElementById('trading-account-root')?.addEventListener('click', e => {
      if (e.target.closest('.ta-row-dropdown')) e.stopPropagation();
    });

    window.addEventListener('resize', closeAllMenus);
    document.addEventListener('scroll', closeAllMenus, true);

    document.getElementById('taCreateAccount')?.addEventListener('click', () => {
      alert('Create Account: connect your onboarding or CRM flow here.');
    });

    document.getElementById('taEditNameForm')?.addEventListener('submit', async e => {
      e.preventDefault();
      const id = document.getElementById('taEditAccountId').value;
      const name = document.getElementById('taEditAccountName').value.trim();
      const msg = document.getElementById('taEditMsg');
      if (!id || !name) return;
      msg.className = 'small mt-2 text-muted text-center';
      msg.textContent = 'Saving…';
      try {
        const res = await fetch('api/accounts/update_account_name.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accountId: id, name })
        });
        const data = await res.json();
        if (!res.ok || data.status === 'error') {
          msg.className = 'small mt-2 text-danger text-center';
          msg.textContent = data.message || 'Failed to update';
          return;
        }
        msg.className = 'small mt-2 text-success text-center';
        msg.textContent = 'Updated.';
        bootstrap.Modal.getInstance(document.getElementById('taEditNameModal'))?.hide();
        await loadAccounts();
      } catch {
        msg.className = 'small mt-2 text-danger text-center';
        msg.textContent = 'Network error';
      }
    });
  }

  window.CP_tabs['trading-account'] = async function tradingAccountTabInit() {
    const holder = document.getElementById('trading-account-root');
    if (!holder || holder.dataset.taReady === '1') return;
    holder.dataset.taReady = '1';

    const html = await fetch('assets/views/trading-account/trading-account.html?v=ta20').then(r => r.text());
    holder.innerHTML = html;
    bindStaticUi();
    await loadAccounts();
  };

  window.CP_onViewShow['trading-account'] = function () {
    const holder = document.getElementById('trading-account-root');
    if (holder && holder.dataset.taReady === '1') loadAccounts();
  };

  window.__taReloadAccounts = loadAccounts;
})();
