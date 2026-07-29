// assets/js/tabs/ai-setting.tab.js ? Figma AI Setting layout
window.CP_tabs = window.CP_tabs || {};
window.CP_state = window.CP_state || {};
window.CP_onViewShow = window.CP_onViewShow || {};

window.CP_tabs['ai-setting'] = function () {
  const rootSection = document.querySelector('section.view[data-view="ai-setting"]');
  if (!rootSection) return;

  const root = document.getElementById('ai-setting-view-root') || rootSection;

  function loadHtml() {
    if (root.querySelector('.ai-settings-container')) {
      initAiSetting();
      return;
    }
    const url =
      typeof window.CP_fetchView === 'function'
        ? window.CP_fetchView('assets/views/ai-setting/ai-setting.html')
        : fetch(new URL('assets/views/ai-setting/ai-setting.html', document.baseURI).toString() + '?v=' + Date.now(), {
            credentials: 'same-origin'
          }).then((r) => {
            if (!r.ok) throw new Error('HTTP ' + r.status);
            return r.text();
          });

    Promise.resolve(url)
      .then((html) => {
        if (typeof html === 'string') {
          root.innerHTML = html;
          initAiSetting();
        }
      })
      .catch((err) => {
        console.error('ai-setting template error', err);
        root.innerHTML = '<div class="text-danger p-3">Failed to load AI Setting view.</div>';
      });
  }

  loadHtml();

  function initAiSetting() {
    const tpSelect = document.getElementById('aiTpSelect');
    const balanceEl = document.getElementById('aiCurrentBalance');
    const balanceNote = document.getElementById('aiBalanceNote');
    const rangeInput = document.getElementById('aiRange');
    const rangeTooltip = document.getElementById('aiRangeTooltip');
    const rangeMinLbl = document.getElementById('aiRangeMinLabel');
    const rangeMaxLbl = document.getElementById('aiRangeMaxLabel');
    const rangeValueLbl = document.getElementById('aiRangeValueLabel');
    const profitBadge = document.getElementById('aiProfitBadge');
    const successRateEl = document.getElementById('aiSuccessRate');
    const profitDetail = document.getElementById('aiProfitDetail');
    const marginText = document.getElementById('aiMarginText');
    const radioOption = document.querySelector('.live-events-block .ai-radio-option');
    const riskPills = document.querySelectorAll('.risk-btn');
    const termsChk = document.getElementById('aiTerms');
    const investBtn = document.getElementById('aiInvestBtn');
    const investMsg = document.getElementById('aiInvestMsg');
    const rangeZeroMsg = document.getElementById('aiRangeZeroMsg');
    const termsLink = document.getElementById('aiTermsLink');
    const termsModal = document.getElementById('aiTermsModal');
    const termsClose = document.getElementById('aiTermsClose');
    const marketModal = document.getElementById('aiMarketModal');
    const marketModalContent = marketModal?.querySelector('.modal-content');
    const popoverBody = document.getElementById('aiMarketPopoverBody');
    const popoverOk = document.getElementById('aiMarketPopoverOk');
    const marketModalTitleText = document.getElementById('aiMarketModalTitleText');
    const marketModalIcon = document.getElementById('aiMarketModalIcon');

    let currentBalance = 0;
    let selectedRisk = 'low';
    let rangeZeroHideTimer = null;

    function isZeroBalance() {
      return (Number(currentBalance) || 0) <= 0;
    }

    function hideRangeBalanceHint() {
      if (!rangeZeroMsg) return;
      clearTimeout(rangeZeroHideTimer);
      rangeZeroMsg.classList.remove('ai-range-balance-hint--show');
      rangeZeroMsg.setAttribute('aria-hidden', 'true');
      rangeZeroHideTimer = setTimeout(() => {
        rangeZeroMsg.textContent = '';
      }, 240);
    }

    function flashRangeBalanceHint() {
      if (!rangeZeroMsg || !isZeroBalance()) return;
      rangeZeroMsg.textContent =
        'Balance is $0.00 — add funds before you can use this slider.';
      rangeZeroMsg.setAttribute('aria-hidden', 'false');
      clearTimeout(rangeZeroHideTimer);
      rangeZeroMsg.classList.remove('ai-range-balance-hint--show');
      void rangeZeroMsg.offsetWidth;
      requestAnimationFrame(() => rangeZeroMsg.classList.add('ai-range-balance-hint--show'));
      rangeZeroHideTimer = setTimeout(hideRangeBalanceHint, 3600);
    }

    const riskConfig = {
      low: { percent: 0.05, successRate: 'success rate 77.1% - 88.1%.', maxMargin: 10 },
      medium: { percent: 0.06, successRate: 'success rate 69.2% - 77.0%.', maxMargin: 25 },
      high: { percent: 0.07, successRate: 'success rate 61.1% - 69.1%.', maxMargin: 50 }
    };

    function successRateDisplay(cfg) {
      const s = (cfg && cfg.successRate) || '';
      return s
        .replace(/^success rate\s*/i, '')
        .replace(/\.\s*$/, '')
        .trim();
    }

    function getActiveMarketDisplayLabelForTicket() {
      const btn = document.querySelector('.asset-tab[data-market].active');
      const key = btn?.dataset?.market;
      const map = {
        forex: '📈 Forex',
        crypto: '₿ Crypto',
        commodities: '⚡ Commodities',
        stocks: '📊 Stock',
        indices: '📉 Indices'
      };
      if (key && map[key]) return map[key];
      const labelEl = btn?.querySelector('span:not(.asset-icon)');
      const t = labelEl?.textContent?.trim();
      return t || 'Forex';
    }

    function setActiveAssetTab(btn) {
      if (!btn) return;
      document.querySelectorAll('.asset-tab[data-market]').forEach((b) => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
    }

    function fillMarketModalBody(key) {
      const html = POPOVER_HTML[key];
      if (!html || !popoverBody) return;
      const tmp = document.createElement('div');
      tmp.innerHTML = html;
      const h4 = tmp.querySelector('h4.ai-popover-title, h4');
      if (h4 && marketModalTitleText) {
        marketModalTitleText.textContent = h4.textContent.trim();
        h4.remove();
      } else if (marketModalTitleText) {
        marketModalTitleText.textContent =
          key === 'stocks' ? 'Stock' : key.charAt(0).toUpperCase() + key.slice(1);
      }
      if (marketModalIcon) {
        marketModalIcon.textContent = MARKET_TAB_ICONS[key] || '📊';
      }
      popoverBody.innerHTML = tmp.innerHTML;
    }

    function resetLiveEventsOption() {
      if (!radioOption) return;
      const input = radioOption.querySelector('input[type="radio"]');
      if (input) input.checked = false;
      radioOption.classList.remove('selected');
    }

    /* Market info popovers ? copy for Forex, Crypto, Commodities, Stocks, Indices (asset row). */
    const POPOVER_HTML = {
      forex: `<h4 class="ai-popover-title">Forex (Foreign Exchange)</h4>
<ul class="ai-popover-list">
<li><strong>What it is:</strong> Trading of currency pairs (e.g., EUR/USD, GBP/JPY) in the world's largest and most liquid financial market.</li>
<li><strong>Typical users:</strong> Retail traders, banks, hedge funds, governments.</li>
<li><strong>Leverage:</strong> High (often 1:200 for retail, higher for professionals) you have 1:200</li>
<li><strong>Volatility:</strong> High (can be very high during news).</li>
<li><strong>Liquidity:</strong> Extremely high.</li>
<li><strong>Risk Level:</strong> Medium to High</li>
</ul>
<p class="ai-popover-foot">Forex is affected by economic data, interest rates, geopolitics, and central bank policies. High leverage increases the risk of significant losses. Market is open 24/5.</p>`,
      crypto: `<h4 class="ai-popover-title">Crypto</h4>
<ul class="ai-popover-list">
<li><strong>What it is:</strong> Digital currencies (e.g., Bitcoin, Ethereum) traded on decentralized or centralized exchanges.</li>
<li><strong>Typical users:</strong> Retail and institutional investors, speculators.</li>
<li><strong>Leverage:</strong> Available, but often lower than Forex (varies by platform and jurisdiction) You have 1:5.</li>
<li><strong>Volatility:</strong> Very High (large price swings, often double-digit % moves).</li>
<li><strong>Liquidity:</strong> Variable (major coins have good liquidity, smaller ones less so).</li>
<li><strong>Risk Level:</strong> High to Very High</li>
</ul>
<p class="ai-popover-foot">Crypto markets are open 24/7, can move sharply due to sentiment, regulation, hacks, or technological changes. Many coins are unregulated.</p>`,
      commodities: `<h4 class="ai-popover-title">Commodities</h4>
<ul class="ai-popover-list">
<li><strong>What it is:</strong> Physical goods like gold, oil, silver, agricultural products, traded via futures, spot, or CFDs.</li>
<li><strong>Typical users:</strong> Traders, investors, producers, corporations.</li>
<li><strong>Leverage:</strong> Varies (often significant via futures and CFDs) You have 1:50.</li>
<li><strong>Volatility:</strong> Medium to High (depends on the commodity, e.g., oil is more volatile than gold).</li>
<li><strong>Liquidity:</strong> High for major commodities, lower for niche markets.</li>
<li><strong>Risk Level:</strong> Medium to High</li>
</ul>
<p class="ai-popover-foot">Prices affected by global supply/demand, weather, politics, economic cycles. Some (like gold) are seen as &ldquo;safe havens,&rdquo; others (like oil or agricultural products) are much more volatile.</p>`,
      stocks: `<h4 class="ai-popover-title">Stocks</h4>
<ul class="ai-popover-list">
<li><strong>What it is:</strong> Ownership in publicly traded companies.</li>
<li><strong>Typical users:</strong> Retail and institutional investors.</li>
<li><strong>Leverage:</strong> Low in most cases (unless using margin or CFDs) You have 1:10.</li>
<li><strong>Volatility:</strong> Low to Medium (blue chips are less volatile, small caps more so).</li>
<li><strong>Liquidity:</strong> High for large companies, can be low for small or exotic stocks.</li>
<li><strong>Risk Level:</strong> Low to Medium (varies widely)</li>
</ul>
<p class="ai-popover-foot">Stock prices move based on company performance, earnings, news, and overall market sentiment. Generally considered less risky over the long-term, but individual companies can be highly risky.</p>`,
      indices: `<h4 class="ai-popover-title">Indices</h4>
<ul class="ai-popover-list">
<li><strong>What it is:</strong> Baskets of stocks representing a sector or country (e.g., S&amp;P 500, NASDAQ, FTSE 100).</li>
<li><strong>Typical users:</strong> Investors, traders, institutions.</li>
<li><strong>Leverage:</strong> Available via CFDs and futures. You have 1:50</li>
<li><strong>Volatility:</strong> Low-Medium (less than single stocks, but can spike in crises).</li>
<li><strong>Liquidity:</strong> Very high (major indices).</li>
<li><strong>Risk Level:</strong> Low - Medium</li>
</ul>
<p class="ai-popover-foot">Indices smooth out individual stock risk, but can still be volatile in bear markets or crises. Generally less risky than trading individual stocks, but more risky than cash or bonds.</p>`
    };

    function formatMoney2(num) {
      const n = Number(num) || 0;
      return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    function formatMoney1(num) {
      const n = Number(num) || 0;
      return n.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    }

    /** TP values from API/UI may include stray spaces or parentheses — keep select + state consistent. */
    function normalizeTpNumber(tp) {
      return String(tp == null ? '' : tp)
        .trim()
        .replace(/^[\s(]+/g, '')
        .replace(/[\s)]+$/g, '');
    }

    function paintRangeTrack() {
      if (!rangeInput) return;
      const min = Number(rangeInput.min) || 0;
      const max = Number(rangeInput.max) || 0;
      const val = Number(rangeInput.value) || 0;
      const pct = max <= min ? 0 : ((val - min) / (max - min)) * 100;
      rangeInput.style.setProperty('--ai-range-fill', pct + '%');
    }

    function positionTooltip() {
      if (!rangeInput || !rangeTooltip) return;
      const wrap = rangeInput.closest('.ai-range-wrap');
      if (!wrap) return;
      const min = Number(rangeInput.min) || 0;
      const max = Number(rangeInput.max) || 0;
      const val = Number(rangeInput.value) || 0;
      const ratio = max <= min ? 0 : (val - min) / (max - min);
      rangeTooltip.textContent = '$' + formatMoney1(val);

      const scaleEl = wrap.querySelector('.ai-range-scale');
      const valueWrap = wrap.querySelector('.ai-range-scale__value-wrap');
      if (scaleEl) {
        scaleEl.style.setProperty('--ai-range-thumb-pct', ratio * 100 + '%');
      }
      if (rangeValueLbl) {
        rangeValueLbl.textContent = '$' + formatMoney1(val);
      }
      /* At minimum, left label is already "0"; hide under-thumb "$0" to avoid double "0" overlap */
      if (valueWrap) {
        const hideUnderThumb = val <= min;
        valueWrap.classList.toggle('ai-range-scale__value-wrap--redundant', hideUnderThumb);
        valueWrap.setAttribute('aria-hidden', hideUnderThumb ? 'true' : 'false');
      }

      const place = () => {
        const w = wrap.clientWidth;
        if (w <= 0) return;
        const tw = rangeTooltip.offsetWidth;
        const thumbCenter = ratio * w;
        let x = thumbCenter - tw / 2;
        const pad = 8;
        x = Math.max(pad, Math.min(x, w - tw - pad));
        rangeTooltip.style.left = x + 'px';
        const arrowX = Math.max(
          14,
          Math.min(tw - 14, thumbCenter - x)
        );
        rangeTooltip.style.setProperty('--ai-tooltip-arrow-left', arrowX + 'px');
      };
      requestAnimationFrame(place);
    }

    function rebuildTpSelectOptions(activeAcc) {
      if (!tpSelect) return;
      const accounts = (window.CP_state && window.CP_state.accounts) || [];
      if (!accounts.length) {
        tpSelect.innerHTML = '';
        const opt = document.createElement('option');
        opt.value = '';
        opt.textContent = '—';
        tpSelect.appendChild(opt);
        tpSelect.disabled = true;
        return;
      }
      tpSelect.disabled = false;
      const primary =
        activeAcc ||
        accounts.find((a) => !a.isDemoAccount && !a.isArchived) ||
        accounts[0];
      const primaryTp = normalizeTpNumber(primary.tpNumber);
      const others = accounts.filter((a) => normalizeTpNumber(a.tpNumber) !== primaryTp);
      others.sort((a, b) =>
        normalizeTpNumber(a.tpNumber).localeCompare(normalizeTpNumber(b.tpNumber), undefined, { numeric: true })
      );
      const ordered = [primary, ...others];
      tpSelect.innerHTML = '';
      ordered.forEach((a) => {
        const opt = document.createElement('option');
        const v = normalizeTpNumber(a.tpNumber);
        opt.value = v;
        opt.textContent = v;
        tpSelect.appendChild(opt);
      });
      tpSelect.value = primaryTp;
    }

    function syncFromGlobal() {
      const state = window.CP_state || {};
      const accounts = state.accounts || [];
      if (!accounts.length) return;

      let acc = null;
      if (state.selectedTp != null && state.selectedTp !== '') {
        const want = normalizeTpNumber(state.selectedTp);
        acc = accounts.find((a) => normalizeTpNumber(a.tpNumber) === want);
      }
      if (!acc) {
        acc = accounts.find((a) => !a.isDemoAccount && !a.isArchived) || accounts[0];
      }
      if (!acc) return;

      window.CP_state.selectedTp = normalizeTpNumber(acc.tpNumber);
      currentBalance = parseFloat(acc.balance || 0) || 0;

      resetLiveEventsOption();
      if (termsChk) termsChk.checked = false;
      if (investMsg) {
        investMsg.textContent = '';
        investMsg.classList.remove('error', 'success');
      }

      rebuildTpSelectOptions(acc);
      if (balanceEl) balanceEl.textContent = '$' + formatMoney2(currentBalance);

      if (balanceNote) {
        if (currentBalance <= 0) {
          balanceNote.textContent = 'Your balance is $0.00. Add funds to use the investment range.';
          balanceNote.hidden = false;
        } else {
          balanceNote.textContent = '';
          balanceNote.hidden = true;
        }
      }

      const rangeWrap = rangeInput?.closest('.ai-range-wrap');
      if (rangeWrap) {
        rangeWrap.classList.toggle('ai-range-wrap--zero-balance', currentBalance <= 0);
      }
      if (rangeZeroMsg && currentBalance > 0) {
        clearTimeout(rangeZeroHideTimer);
        rangeZeroMsg.classList.remove('ai-range-balance-hint--show');
        rangeZeroMsg.setAttribute('aria-hidden', 'true');
        rangeZeroMsg.textContent = '';
      }

      if (rangeInput && rangeMinLbl) {
        const maxVal = Math.max(0, Math.floor(currentBalance));
        rangeInput.max = String(maxVal);
        if (Number(rangeInput.value) > maxVal) rangeInput.value = String(maxVal);
        rangeMinLbl.textContent = '0';
        if (rangeMaxLbl) rangeMaxLbl.textContent = '$' + formatMoney2(maxVal);
        paintRangeTrack();
        positionTooltip();
      }

      updateSummary();
      updateMarketAccess();
    }

    window.CP_onViewShow['ai-setting'] = syncFromGlobal;

    loadAccountsFromApi().then(() => {
      setupEvents();
      syncFromGlobal();
    });

    async function loadAccountsFromApi() {
      try {
        const res = await fetch('api/accounts/get_accounts.php', { credentials: 'same-origin' });
        const data = await res.json();
        if (!res.ok || data.status === 'error') return;
        const accounts = (data.data || []).filter((a) => !a.isArchived);
        if (!accounts.length) return;
        window.CP_state.accounts = accounts;
        if (!window.CP_state.selectedTp) {
          const acc0 = accounts.find((a) => !a.isDemoAccount && !a.isArchived) || accounts[0];
          if (acc0) window.CP_state.selectedTp = normalizeTpNumber(acc0.tpNumber);
        } else {
          window.CP_state.selectedTp = normalizeTpNumber(window.CP_state.selectedTp);
        }
      } catch (e) {
        console.error('AI Setting accounts', e);
      }
    }

    function updateSummary() {
      const cfg = riskConfig[selectedRisk] || riskConfig.low;
      const rangeVal = rangeInput ? Number(rangeInput.value) || 0 : 0;
      const profitAmount = rangeVal * cfg.percent;
      const exposurePercent = Math.round(cfg.percent * 100);
      const riskLabel = selectedRisk.charAt(0).toUpperCase() + selectedRisk.slice(1);
      const formattedBalance = '$' + formatMoney1(currentBalance);
      const currency = '$';
      const formattedProfit = formatMoney1(profitAmount);
      const numberOfTrades = rangeVal <= 0 ? 0 : Math.max(1, Math.floor(rangeVal / 100));

      if (profitBadge) {
        profitBadge.textContent =
          `upto ${exposurePercent}%($${formatMoney2(profitAmount)}) with ${riskLabel} Risk`;
      }
      if (successRateEl) {
        successRateEl.innerHTML =
          'Success rate <span class="success-rate ai-profit-rate__pct">' +
          successRateDisplay(cfg) +
          '</span>';
      }
      if (profitDetail) {
        profitDetail.textContent =
          `Your current balance is ${formattedBalance} with selected investment amount ` +
          `${currency}${formatMoney1(rangeVal)} under a ${selectedRisk.toLowerCase()}-risk strategy ` +
          `(upto ${exposurePercent} % profit ${currency}${formattedProfit}) ${cfg.successRate} ` +
          `You can perform upto ${numberOfTrades} trades only.`;
      }
      if (marginText) {
        marginText.textContent = `Max margin used up to ${cfg.maxMargin}% risk management.`;
      }
    }

    const MARKET_TAB_ICONS = {
      forex: '📊',
      crypto: '₿',
      commodities: '🛢️',
      stocks: '📈',
      indices: '📊'
    };

    function updateMarketAccess() {
      const items = document.querySelectorAll('.asset-tab[data-market]');
      const allowed = getAllowedMarkets(currentBalance);
      items.forEach((btn) => {
        const id = btn.dataset.market;
        if (!id) return;
        const isOn = allowed.includes(id);
        const iconEl = btn.querySelector('.asset-icon');
        btn.classList.toggle('locked', !isOn);
        if (iconEl) {
          iconEl.textContent = isOn ? MARKET_TAB_ICONS[id] || '📊' : '🔒';
        }
      });
      const currentActive = document.querySelector('.asset-tab[data-market].active');
      const curId = currentActive?.dataset.market;
      if (curId && allowed.includes(curId)) {
        setActiveAssetTab(currentActive);
        return;
      }
      let placed = false;
      items.forEach((btn) => {
        const id = btn.dataset.market;
        if (!id) return;
        if (!allowed.includes(id) || placed) return;
        items.forEach((b) => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        placed = true;
      });
      if (!placed) {
        items.forEach((b) => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
      }
    }

    function getAllowedMarkets(balance) {
      const b = Number(balance) || 0;
      if (b <= 1000) return ['forex', 'crypto'];
      if (b <= 2500) return ['forex', 'crypto'];
      if (b <= 5000) return ['forex', 'crypto', 'commodities', 'stocks'];
      return ['forex', 'crypto', 'commodities', 'stocks', 'indices'];
    }

    function setupEvents() {
      const rangeWrap = rangeInput?.closest('.ai-range-wrap');

      if (rangeInput) {
        rangeInput.addEventListener('input', () => {
          if (isZeroBalance()) {
            const v = Number(rangeInput.value) || 0;
            if (v !== 0) {
              rangeInput.value = '0';
              flashRangeBalanceHint();
            }
          }
          paintRangeTrack();
          positionTooltip();
          updateSummary();
        });
      }

      function onRangeBlockedPointer() {
        if (!isZeroBalance()) return;
        flashRangeBalanceHint();
      }

      if (rangeInput && rangeInput.dataset.aiZeroRangeGuard !== '1') {
        rangeInput.dataset.aiZeroRangeGuard = '1';
        ['pointerdown', 'mousedown', 'touchstart'].forEach((ev) => {
          rangeInput.addEventListener(ev, onRangeBlockedPointer);
        });
        rangeInput.addEventListener('keydown', (e) => {
          if (!isZeroBalance()) return;
          const inc = ['ArrowRight', 'ArrowUp', 'PageUp', 'End'];
          if (inc.includes(e.key)) {
            e.preventDefault();
            flashRangeBalanceHint();
          }
        });
      }

      if (rangeWrap && rangeWrap.dataset.aiZeroRangeWheel !== '1') {
        rangeWrap.dataset.aiZeroRangeWheel = '1';
        rangeWrap.addEventListener(
          'wheel',
          (e) => {
            if (!isZeroBalance()) return;
            flashRangeBalanceHint();
            e.preventDefault();
          },
          { passive: false }
        );
      }

      let rangeReflowTimer = null;
      window.addEventListener('resize', () => {
        clearTimeout(rangeReflowTimer);
        rangeReflowTimer = setTimeout(() => {
          paintRangeTrack();
          positionTooltip();
        }, 80);
      });

      riskPills.forEach((pill) => {
        pill.addEventListener('click', () => {
          riskPills.forEach((p) => p.classList.remove('active'));
          pill.classList.add('active');
          selectedRisk = pill.dataset.risk || 'low';
          updateSummary();
        });
      });

      if (tpSelect && tpSelect.dataset.aiTpWired !== '1') {
        tpSelect.dataset.aiTpWired = '1';
        tpSelect.addEventListener('change', () => {
          window.CP_state = window.CP_state || {};
          window.CP_state.selectedTp = normalizeTpNumber(tpSelect.value);
          syncFromGlobal();
        });
      }

      if (radioOption) {
        radioOption.addEventListener('click', (e) => {
          e.preventDefault();
          const input = radioOption.querySelector('input[type="radio"]');
          if (!input) return;
          const willSelect = !input.checked;
          input.checked = willSelect;
          radioOption.classList.toggle('selected', willSelect);
        });
      }

      document.querySelector('.asset-tabs')?.addEventListener('click', (e) => {
        const btn = e.target.closest('.asset-tab[data-market]');
        const key = btn?.dataset.popover || btn?.dataset.market;
        if (!btn || !key) return;
        e.preventDefault();
        e.stopPropagation();
        if (!marketModal || !popoverBody || !POPOVER_HTML[key]) return;
        setActiveAssetTab(btn);
        fillMarketModalBody(key);
        marketModal.classList.add('active');
        marketModal.setAttribute('aria-hidden', 'false');
        lockScrollForAiMarketPopover();
      });

      marketModalContent?.addEventListener('click', (e) => e.stopPropagation());
      marketModal?.addEventListener('click', (e) => {
        if (e.target === marketModal) closeMarketPopover();
      });

      /** Lock dashboard #mainContent while market popover is open so wheel/touch does not scroll the page behind it. */
      function lockScrollForAiMarketPopover() {
        const main = document.getElementById('mainContent');
        if (!main || main.dataset.aiPopoverScrollLock === '1') return;
        main.dataset.aiPopoverScrollLock = '1';
        main.dataset.aiPopoverScrollTop = String(main.scrollTop);
        main.style.overflow = 'hidden';
        document.documentElement.classList.add('ai-market-popover-scroll-lock');
      }

      function unlockScrollForAiMarketPopover() {
        const main = document.getElementById('mainContent');
        if (!main || main.dataset.aiPopoverScrollLock !== '1') return;
        const top = parseInt(main.dataset.aiPopoverScrollTop || '0', 10);
        main.style.overflow = '';
        main.scrollTop = top;
        delete main.dataset.aiPopoverScrollLock;
        delete main.dataset.aiPopoverScrollTop;
        document.documentElement.classList.remove('ai-market-popover-scroll-lock');
      }

      function closeMarketPopover() {
        if (marketModal) {
          marketModal.classList.remove('active');
          marketModal.setAttribute('aria-hidden', 'true');
        }
        unlockScrollForAiMarketPopover();
      }

      function onDocumentWheelWhileMarketModalOpen(e) {
        if (!marketModal || !marketModal.classList.contains('active')) return;
        if (e.target.closest && e.target.closest('#aiMarketModal .modal-content')) return;
        e.preventDefault();
      }

      function onDocumentTouchMoveWhileMarketModalOpen(e) {
        if (!marketModal || !marketModal.classList.contains('active')) return;
        if (e.target.closest && e.target.closest('#aiMarketModal .modal-content')) return;
        e.preventDefault();
      }

      document.addEventListener('wheel', onDocumentWheelWhileMarketModalOpen, { passive: false, capture: true });
      document.addEventListener('touchmove', onDocumentTouchMoveWhileMarketModalOpen, { passive: false, capture: true });

      if (popoverOk) {
        popoverOk.addEventListener('click', closeMarketPopover);
      }

      if (investBtn) {
        investBtn.addEventListener('click', async () => {
          if (!termsChk || !termsChk.checked) {
            if (investMsg) {
              investMsg.textContent = 'Please agree to the terms before investing.';
              investMsg.classList.remove('success');
              investMsg.classList.add('error');
            }
            return;
          }

          const rangeVal = Number(rangeInput?.value) || 0;
          const cfg = riskConfig[selectedRisk] || riskConfig.low;
          const liveSelected = radioOption?.classList.contains('selected');

          const tpForTicket = normalizeTpNumber(
            (tpSelect && tpSelect.value) ||
              (window.CP_state && window.CP_state.selectedTp != null && String(window.CP_state.selectedTp)) ||
              ''
          );

          let finalText;
          if (typeof window.CP_AI_TICKET?.buildInvestMessage === 'function') {
            finalText = window.CP_AI_TICKET.buildInvestMessage({
              marketLabel: getActiveMarketDisplayLabelForTicket(),
              tpNumber: tpForTicket,
              balance: currentBalance,
              rangeVal,
              risk: selectedRisk,
              liveEvents: liveSelected
            });
          } else {
            const percent = Math.round(cfg.percent * 100);
            const profit = rangeVal * cfg.percent;
            const riskLabel = selectedRisk.charAt(0).toUpperCase() + selectedRisk.slice(1);
            const baseMsg =
              `My current balance is $${formatMoney2(currentBalance)}, ` +
              `I have selected investment amount $${formatMoney2(rangeVal)}. ` +
              `upto ${percent}% ($${formatMoney2(profit)}) with ${riskLabel} Risk.`;
            const LIVE_FALLBACK =
              'Make 20% + potentially on live events let us know and we will contact you.';
            finalText = liveSelected ? `${baseMsg} ${LIVE_FALLBACK}` : baseMsg;
          }

          if (investMsg) {
            investMsg.textContent = 'Creating ticket...';
            investMsg.classList.remove('error', 'success');
          }
          investBtn.disabled = true;

          try {
            const res = await fetch('api/support/create_ticket.php', {
              method: 'POST',
              credentials: 'same-origin',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ text: finalText })
            });
            const data = await res.json();

            if (!res.ok || data.status === 'error') {
              if (investMsg) {
                investMsg.textContent = data.message || 'Failed to create ticket. Please try again.';
                investMsg.classList.remove('success');
                investMsg.classList.add('error');
              }
              return;
            }

            if (investMsg) {
              investMsg.textContent = 'Congratulations! Your ticket has been created successfully.';
              investMsg.classList.remove('error');
              investMsg.classList.add('success');
            }
            setTimeout(() => {
              if (investMsg) {
                investMsg.textContent = '';
                investMsg.classList.remove('success');
              }
            }, 4000);

            resetLiveEventsOption();
            if (termsChk) termsChk.checked = false;
            if (rangeInput) {
              rangeInput.value = '0';
              paintRangeTrack();
              positionTooltip();
              updateSummary();
            }
          } catch (err) {
            console.error(err);
            if (investMsg) {
              investMsg.textContent = 'Network error. Please try again.';
              investMsg.classList.remove('success');
              investMsg.classList.add('error');
            }
          } finally {
            investBtn.disabled = false;
          }
        });
      }

      const termsModalContent = termsModal?.querySelector('.modal-content');
      termsModalContent?.addEventListener('click', (e) => e.stopPropagation());

      if (termsLink && termsModal) {
        termsLink.addEventListener('click', (e) => {
          e.preventDefault();
          termsModal.classList.add('active');
          termsModal.setAttribute('aria-hidden', 'false');
        });
      }
      if (termsClose && termsModal) {
        termsClose.addEventListener('click', () => {
          termsModal.classList.remove('active');
          termsModal.setAttribute('aria-hidden', 'true');
        });
      }
      if (termsModal) {
        termsModal.addEventListener('click', (e) => {
          if (e.target === termsModal) {
            termsModal.classList.remove('active');
            termsModal.setAttribute('aria-hidden', 'true');
          }
        });
      }
    }
  }
};

