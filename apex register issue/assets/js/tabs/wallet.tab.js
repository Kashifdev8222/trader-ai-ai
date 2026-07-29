// Wallet tab module
window.CP_tabs = window.CP_tabs || {};

window.CP_tabs.wallet = async function () {
  if (window.CP_tabs.wallet.loaded) return;

  const mount = document.querySelector('section.view[data-view="wallet"]');
  if (!mount) return;

  // Inject HTML
  const html = await fetch('assets/views/wallet/wallet.html').then(r => r.text());
  mount.innerHTML = html;

  // Helpers
  const fmtMoney = v =>
    (v == null || v === '') ? '0.00' :
      Number(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const fmtDate = iso =>
    iso ? new Date(iso).toLocaleString() : '';

  const realRadio = document.getElementById('walletReal');
  const demoRadio = document.getElementById('walletDemo');
  const totalEl   = document.getElementById('walletTotal');
  const tbody     = document.getElementById('walletTbody');

  let accounts = [];        // full list
  let filterKind = 'real';  // real | demo

  function render() {
    const filtered = accounts.filter(acc => {
      const isDemo = !!acc.isDemoAccount;
      return filterKind === 'demo' ? isDemo : !isDemo;
    });

    // Total
    const sum = filtered.reduce((a,acc)=> a + (Number(acc.balance)||0), 0);
    totalEl.textContent = '$' + fmtMoney(sum);

    // Rows
    if (!filtered.length) {
      tbody.innerHTML = `<tr><td colspan="8" class="text-muted">No accounts</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map(acc => {
      const status = acc.isDisabled ? 'Disabled' : 'Active';
      const lastSync = acc.lastSyncTime || acc.lastLoginNew || acc.lastLogin || null;
      // Fallbacks for "Last Meta Sync" – use your real field if different:
      const lastMeta = acc.lastMetaSyncTime || acc.dateOfLastTrade || null;

      return `
        <tr>
          <td>${acc.tpNumber ?? ''}</td>
          <td class="td-num">${fmtMoney(acc.balance)}</td>
          <td>${acc.baseCurrency ?? ''}</td>
          <td>${status}</td>
          <td>${acc.name ?? ''}</td>
          <td>${fmtDate(lastSync)}</td>
          <td>${fmtDate(lastMeta)}</td>
          <td>
            <div class="wallet-actions">
              <button class="btn wa-btn wa-change" data-act="pwd" data-id="${acc.id}">
                <i class="bi bi-shield-lock"></i><span>Change Password</span>
              </button>
              <button class="btn wa-btn wa-edit" data-act="edit" data-id="${acc.id}" data-name="${(acc.name||'').replace(/"/g,'&quot;')}">
                <i class="bi bi-pencil"></i><span>Edit</span>
              </button>
              <button class="btn wa-btn wa-deposit" data-act="deposit" data-id="${acc.id}">
                <i class="bi bi-arrow-down-circle"></i><span>ADD DEPOSIT</span>
              </button>
              <button class="btn wa-btn wa-withdraw" data-act="withdraw" data-id="${acc.id}">
                <i class="bi bi-arrow-up-circle"></i><span>Withdraw</span>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  async function loadAccounts() {
    tbody.innerHTML = `<tr><td colspan="8" class="text-muted">Loading...</td></tr>`;
    try {
      const url = `api/accounts/get_accounts.php?userId=${encodeURIComponent(CP_USER.userId)}`;
      const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
      const json = await res.json();

      // backend returns either {data: [...] } or {data:{accounts:[...]}}
      accounts = Array.isArray(json.data) ? json.data : (json.data?.accounts || []);
      render();
    } catch (e) {
      console.error(e);
      tbody.innerHTML = `<tr><td colspan="8" class="text-danger">Network error</td></tr>`;
    }
  }

  // Filters
  realRadio?.addEventListener('change', () => { if (realRadio.checked) { filterKind = 'real'; render(); } });
  demoRadio?.addEventListener('change', () => { if (demoRadio.checked) { filterKind = 'demo'; render(); } });

  // Row actions (delegate)
  tbody.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-act]');
    if (!btn) return;
    const act = btn.getAttribute('data-act');
    const id  = btn.getAttribute('data-id');

    if (act === 'pwd') {
      // open global change password modal (already exists in dashboard.php)
      const m = new bootstrap.Modal(document.getElementById('changePassModal'));
      m.show();
    }
    if (act === 'deposit') {
      window.CP_showView('deposit');
    }
    if (act === 'withdraw') {
      window.CP_showView('withdrawals');
    }
    if (act === 'edit') {
      const name = btn.getAttribute('data-name') || '';
      document.getElementById('walletEditAccountId').value = id;
      document.getElementById('walletEditAccountName').value = name;
      document.getElementById('walletEditMsg').textContent = '';
      const m = new bootstrap.Modal(document.getElementById('walletEditNameModal'));
      m.show();
    }
  });

  // Save name
  document.getElementById('walletEditNameForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id   = document.getElementById('walletEditAccountId').value;
    const name = document.getElementById('walletEditAccountName').value.trim();
    const msg  = document.getElementById('walletEditMsg');
    if (!id || !name) return;

    msg.className = 'small mt-2 text-muted text-center';
    msg.textContent = 'Saving...';
    try {
      const res = await fetch('api/accounts/update_account_name.php', {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ accountId: id, name })
      });
      const data = await res.json();
      if (!res.ok || data.status === 'error') {
        msg.className = 'small mt-2 text-danger text-center';
        msg.textContent = data.message || 'Failed to update name';
        return;
      }
      msg.className = 'small mt-2 text-success text-center';
      msg.textContent = 'Updated!';
      await loadAccounts();
      setTimeout(() => bootstrap.Modal.getInstance('#walletEditNameModal').hide(), 700);
    } catch {
      msg.className = 'small mt-2 text-danger text-center';
      msg.textContent = 'Network error';
    }
  });

  // Create account (stub – wire to your flow)
  document.getElementById('btnCreateAccount')?.addEventListener('click', () => {
    // TODO: open your create-account flow/modal
    alert('Create Account: hook up your flow here.');
  });

  // Go!
  await loadAccounts();
  window.CP_tabs.wallet.loaded = true;
};
