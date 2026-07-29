// assets/js/tabs/web-trader.tab.js — iframe loads partner URL only; account UI stays inside Web Trader.
window.CP_tabs = window.CP_tabs || {};
window.CP_state = window.CP_state || {};
window.CP_onViewShow = window.CP_onViewShow || {};

const WT_SS_TP = 'cp_wt_last_tp';

window.CP_tabs['web-trader'] = function () {
  const section = document.querySelector('section.view[data-view="web-trader"]');
  if (!section) return;

  const root = document.getElementById('web-trader-view-root') || section;

  function loadHtml() {
    if (root.querySelector('.wt-root')) {
      initWebTrader();
      return;
    }
    const url =
      typeof window.CP_fetchView === 'function'
        ? window.CP_fetchView('assets/views/web-trader/web-trader.html')
        : fetch('assets/views/web-trader/web-trader.html?v=' + Date.now(), { credentials: 'same-origin' }).then(
            (r) => {
              if (!r.ok) throw new Error('HTTP ' + r.status);
              return r.text();
            }
          );

    Promise.resolve(url)
      .then((html) => {
        if (typeof html === 'string') {
          root.innerHTML = html;
          initWebTrader();
        }
      })
      .catch((err) => {
        console.error('web-trader template error', err);
        if (root.querySelector('.wt-root')) initWebTrader();
      });
  }

  loadHtml();

  function initWebTrader() {
    const trader = document.getElementById('wtTrader');
    const errEl = document.getElementById('wtError');
    const status = document.getElementById('wtStatus');
    const frame = document.getElementById('wtFrame');
    const openFullBtn = document.getElementById('wtOpenFullWindowBtn');

    if (!trader || !frame) return;

    let lastOpenedUrl = '';
    /** TP numbers from last account list fetch (for picking default + open-full-window). */
    let cachedTpList = [];
    let lastLoadedTp = undefined;

    function showError(msg) {
      if (!errEl) return;
      errEl.textContent = msg || '';
      errEl.hidden = !msg;
    }

    function persistTp(tp) {
      try {
        if (tp) sessionStorage.setItem(WT_SS_TP, String(tp));
      } catch (e) {
        /* ignore */
      }
    }

    function showTrader(loginUrl) {
      lastOpenedUrl = loginUrl;
      const sep = loginUrl.indexOf('?') >= 0 ? '&' : '?';
      const url = loginUrl + sep + '_wt=' + Date.now();
      if (status) status.textContent = 'Loading Web Trader…';
      frame.src = url;
    }

    frame.addEventListener('load', () => {
      if (status) status.textContent = '';
    });

    async function buildTraderUrl(tpNumber) {
      const q = tpNumber ? '?tpNumber=' + encodeURIComponent(tpNumber) : '';
      const res = await fetch('api/webtrader/url.php' + q, { credentials: 'same-origin' });
      const json = await res.json();
      const payload = json.data && typeof json.data === 'object' ? json.data : {};

      if (json.status === 'error') {
        throw new Error(json.message || 'Could not build Web Trader URL.');
      }

      if (payload.hasCredentials === false) {
        throw new Error(
          payload.message || 'Session has no stored password for Web Trader. Please log out and sign in again.'
        );
      }

      const url = payload.url;
      if (!url) {
        throw new Error('Missing Web Trader URL.');
      }

      return url;
    }

    function pickInitialTp(tpList) {
      const pref = window.CP_state?.selectedTp;
      if (pref && tpList.includes(String(pref))) return String(pref);
      try {
        const saved = sessionStorage.getItem(WT_SS_TP);
        if (saved && tpList.includes(saved)) return saved;
      } catch (e) {
        /* ignore */
      }
      if (tpList.length === 1) return tpList[0];
      return '';
    }

    async function loadPartnerFrame(tp) {
      const t = String(tp || '').trim();
      showError('');
      try {
        const loginUrl = await buildTraderUrl(t);
        if (t) {
          window.CP_state = window.CP_state || {};
          window.CP_state.selectedTp = t;
          persistTp(t);
        }
        lastLoadedTp = t;
        showTrader(loginUrl);
      } catch (e) {
        console.error(e);
        const msg = e.message || 'Failed to load Web Trader.';
        showError(msg);
        if (status) status.textContent = msg;
      }
    }

    async function bootstrap() {
      showError('');
      cachedTpList = [];

      try {
        const res = await fetch('api/accounts/get_accounts.php', { credentials: 'same-origin' });
        const json = await res.json();
        if (!res.ok || json.status === 'error') {
          showError(json.message || 'Could not load accounts.');
          await loadPartnerFrame('');
          return;
        }

        const list = (json.data || []).filter((a) => !a.isArchived);
        cachedTpList = list
          .map((a) => (a.tpNumber != null && String(a.tpNumber).trim() !== '' ? String(a.tpNumber) : null))
          .filter(Boolean);

        const initial = pickInitialTp(cachedTpList);
        await loadPartnerFrame(initial);
      } catch (e) {
        console.error(e);
        showError('Network error.');
        await loadPartnerFrame('');
      }
    }

    openFullBtn?.addEventListener('click', async () => {
      const tp = pickInitialTp(cachedTpList);
      try {
        const u = lastOpenedUrl || (await buildTraderUrl(tp));
        window.open(u, '_blank', 'noopener,noreferrer');
      } catch (e) {
        console.error(e);
        if (status) status.textContent = e.message || 'Could not open.';
      }
    });

    bootstrap();

    window.CP_onViewShow['web-trader'] = function () {
      const next = pickInitialTp(cachedTpList);
      if (cachedTpList.length && String(next) !== String(lastLoadedTp)) {
        void loadPartnerFrame(next);
      }
    };
  }
};
