window.CP_tabs = window.CP_tabs || {};

window.CP_tabs.dashboard = async function () {
  if (window.CP_tabs.dashboard.loaded) return;

  // Put HTML inside the dashboard section (not the sidebar)
  const view = document.querySelector('section.view[data-view="dashboard"]');
  if (!view) { console.error('Dashboard section not found'); return; }

  const html = await fetch('assets/views/dashboard/dashboard.html').then(r => r.text());
  view.innerHTML = html;

  // Buttons -> switch tabs (no default links, no z-index, no propagation issues)
  document.getElementById('btnGoDeposit')?.addEventListener('click', () => {
    window.CP_showView('deposit');
  });
  document.getElementById('btnGoVerification')?.addEventListener('click', () => {
    window.CP_showView('verification');
  });

  // Load accounts
  const tbody = document.getElementById('accountsTbody');

  async function loadAccounts() {
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="6" class="text-muted">Loading...</td></tr>`;

    try {
      const url = `api/accounts/get_accounts.php?userId=${encodeURIComponent(CP_USER.userId)}`;
      const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
      const json = await res.json();

      const rows = Array.isArray(json.data) ? json.data : (json.data?.accounts || []);
      if (!rows || rows.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-muted">No accounts</td></tr>`;
        return;
      }

      const num = v => (v == null || v === '') ? '0'
        : Number(v).toLocaleString(undefined, { maximumFractionDigits: 2 });

      tbody.innerHTML = rows.map(acc => `
        <tr>
          <td>${acc.tpNumber ?? ''}</td>
          <td class="td-num">${num(acc.balance)}</td>
          <td class="td-num">${num(acc.equity)}</td>
          <td class="td-num">${num(acc.credit)}</td>
          <td class="td-num">${num(acc.margin)}</td>
          <td class="td-num">${num(acc.profitLost)}</td>
        </tr>
      `).join('');
    } catch (e) {
      console.error(e);
      tbody.innerHTML = `<tr><td colspan="6" class="text-danger">Network error</td></tr>`;
    }
  }

  await loadAccounts();

  window.CP_tabs.dashboard.loaded = true;
  
  // ==== Transactions Fetch + Pagination (10 per page, 5-number window) ====
let txPage = 1;
const txLimit = 10;
let txData = [];

async function loadTransactions() {
  const txBody = document.getElementById('txTbody');
  if (!txBody) return;

  txBody.innerHTML = `<tr><td colspan="10" class="text-muted">Loading...</td></tr>`;

  try {
    const res = await fetch('api/accounts/get_transactions.php', {
      headers: { "Accept": "application/json" }
    });
    const json = await res.json();
    txData = Array.isArray(json.data) ? json.data : [];
    txPage = 1;                 // reset to first page when reloading
    renderTxPage();
  } catch (e) {
    console.error(e);
    txBody.innerHTML = `<tr><td colspan="10" class="text-danger">Network error</td></tr>`;
    renderTxPager(0, 1);
  }
}

function renderTxPage() {
  const txBody = document.getElementById('txTbody');
  if (!txBody) return;

  const totalPages = Math.ceil((txData?.length || 0) / txLimit) || 1;
  txPage = Math.max(1, Math.min(txPage, totalPages));

  const start = (txPage - 1) * txLimit;
  const pageRows = txData.slice(start, start + txLimit);

  if (!pageRows.length) {
    txBody.innerHTML = `<tr><td colspan="10" class="text-muted">No transactions</td></tr>`;
  } else {
    txBody.innerHTML = pageRows.map(tx => `
      <tr>
        <td>${tx.status ?? ''}</td>
        <td class="td-num">${tx.amount ?? ''}</td>
        <td>${tx.type ?? ''}</td>
        <td>${tx.currency ?? ''}</td>
        <td>${tx.accountType ?? ''}</td>
        <td>${tx.tpNumber ?? ''}</td>
        <td>${tx.comment ?? ''}</td>
        <td>${tx.rejectReason ?? ''}</td>
        <td>${tx.createdAt ? new Date(tx.createdAt).toLocaleString() : ''}</td>
        <td>${tx.updatedAt ? new Date(tx.updatedAt).toLocaleString() : ''}</td>
      </tr>
    `).join('');
  }

  renderTxPager(totalPages, txPage);
}

/**
 * Renders a compact pager with:
 *  [Prev]  1 … (window of up to 5 around current) … N  [Next]
 */
function renderTxPager(totalPages, currentPage) {
  const host = document.getElementById('txPager');
  if (!host) return;

  // nothing to paginate
  if (totalPages <= 1) {
    host.innerHTML = '';
    return;
  }

  const windowSize = 5; // always show 5 numbers (or fewer if totalPages < 5)

  // Compute a sliding window of 5 around current page
  let start = currentPage - Math.floor(windowSize / 2);  
  start = Math.max(1, start);                            
  start = Math.min(start, Math.max(1, totalPages - windowSize + 1)); 

  const end = Math.min(totalPages, start + windowSize - 1);

  const btn = (label, page, { disabled=false, active=false, icon=false } = {}) => {
    const classes = ['page-btn'];
    if (icon) classes.push('icon');
    if (active) classes.push('active');
    const dis = disabled ? 'disabled' : '';
    const data = disabled ? '' : `data-page="${page}"`;
    return `<button class="${classes.join(' ')}" ${data} ${dis}>${label}</button>`;
  };

  let html = '';
  // Prev
  html += btn(`<i class="bi bi-chevron-left"></i>`, currentPage - 1, {
    disabled: currentPage === 1, icon: true
  });

  // Window of numbers only (no 1/last/ellipses)
  for (let p = start; p <= end; p++) {
    html += btn(String(p), p, { active: p === currentPage });
  }

  // Next
  html += btn(`<i class="bi bi-chevron-right"></i>`, currentPage + 1, {
    disabled: currentPage === totalPages, icon: true
  });

  host.innerHTML = html;

  // Click handling
  host.onclick = (e) => {
    const target = e.target.closest('.page-btn[data-page]');
    if (!target) return;
    const go = parseInt(target.getAttribute('data-page'), 10);
    if (!Number.isNaN(go) && go >= 1 && go <= totalPages) {
      txPage = go;
      renderTxPage();
    }
  };
}


// Kick off load
loadTransactions();

  
};
