/**
 * AI onboarding on dashboard: support ticket text via CP_AI_TICKET (same as AI Settings) +
 * completion in data/cp_ai_onboarding/completions.json.
 * "Not now" / close: sessionStorage until logout (logout.php clears the key).
 */
(function () {
  const SESSION_SKIP_KEY = 'cp_ai_onboard_skipped';
  const LEGACY_LOCAL_KEY = 'cp_ai_onboarding_v1';

  const riskConfig = {
    low: { percent: 0.05, successRate: 'success rate 77.1% - 88.1%.', maxMargin: 10 },
    medium: { percent: 0.06, successRate: 'success rate 69.2% - 77.0%.', maxMargin: 25 },
    high: { percent: 0.07, successRate: 'success rate 61.1% - 69.1%.', maxMargin: 50 }
  };

  const tradingTypeEmojis = {
    forex: '📈 Forex',
    crypto: '₿ Crypto',
    commodities: '⚡ Commodities',
    stocks: '📊 Stock',
    indices: '📉 Indices'
  };

  const riskLabels = { low: 'Low', medium: 'Medium', high: 'High' };

  let inited = false;
  let currentStep = 1;
  const totalSteps = 4;

  function formatMoney2(num) {
    const n = Number(num) || 0;
    return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function successRateDisplay(cfg) {
    const s = (cfg && cfg.successRate) || '';
    return s
      .replace(/^success rate\s*/i, '')
      .replace(/\.\s*$/, '')
      .trim();
  }

  function serverSaysCompleted() {
    return window.CP_AI_ONBOARD_SERVER_COMPLETED === true;
  }

  function sessionSaysSkipped() {
    try {
      return sessionStorage.getItem(SESSION_SKIP_KEY) === '1';
    } catch {
      return false;
    }
  }

  function markSessionSkipped() {
    try {
      sessionStorage.setItem(SESSION_SKIP_KEY, '1');
    } catch (e) {
      /* ignore */
    }
  }

  function clearLegacyLocalStorage() {
    try {
      localStorage.removeItem(LEGACY_LOCAL_KEY);
    } catch (e) {
      /* ignore */
    }
  }

  async function ensureAccounts() {
    const state = window.CP_state || {};
    if (state.accounts && state.accounts.length) return;
    try {
      const res = await fetch('api/accounts/get_accounts.php', { credentials: 'same-origin' });
      const data = await res.json();
      if (!res.ok || data.status === 'error') return;
      const accounts = (data.data || []).filter((a) => !a.isArchived);
      if (!accounts.length) return;
      window.CP_state = window.CP_state || {};
      window.CP_state.accounts = accounts;
      if (window.CP_state.selectedTp == null || window.CP_state.selectedTp === '') {
        const acc0 = accounts.find((a) => !a.isDemoAccount && !a.isArchived) || accounts[0];
        if (acc0) window.CP_state.selectedTp = acc0.tpNumber;
      }
    } catch (e) {
      console.error('[cp-ai-onboarding] accounts', e);
    }
  }

  function populateTpSelect(overlay) {
    const sel = overlay.querySelector('#cpAiOnboardTp');
    if (!sel) return;
    const accounts = (window.CP_state && window.CP_state.accounts) || [];
    sel.innerHTML = '';
    if (!accounts.length) {
      const o = document.createElement('option');
      o.value = '';
      o.textContent = 'No trading accounts';
      sel.appendChild(o);
      sel.disabled = true;
      return;
    }
    sel.disabled = false;
    accounts.forEach((a) => {
      const o = document.createElement('option');
      o.value = String(a.tpNumber);
      o.textContent = String(a.tpNumber);
      sel.appendChild(o);
    });
    let selected = window.CP_state && window.CP_state.selectedTp;
    const exists = accounts.some((a) => String(a.tpNumber) === String(selected));
    if (!exists) {
      const primary = accounts.find((x) => !x.isDemoAccount && !x.isArchived) || accounts[0];
      selected = primary ? primary.tpNumber : accounts[0].tpNumber;
    }
    sel.value = String(selected);
    window.CP_state = window.CP_state || {};
    window.CP_state.selectedTp = sel.value;
  }

  function getSelectedTp(overlay) {
    const sel = overlay.querySelector('#cpAiOnboardTp');
    if (sel && !sel.disabled && sel.value) return String(sel.value);
    const st = window.CP_state || {};
    return st.selectedTp != null && st.selectedTp !== '' ? String(st.selectedTp) : '';
  }

  function getCurrentBalance() {
    const state = window.CP_state || {};
    const accounts = state.accounts || [];
    if (!accounts.length) return 0;
    let acc = null;
    if (state.selectedTp != null && state.selectedTp !== '') {
      acc = accounts.find((a) => String(a.tpNumber) === String(state.selectedTp));
    }
    if (!acc) acc = accounts.find((a) => !a.isDemoAccount && !a.isArchived) || accounts[0];
    return acc ? parseFloat(acc.balance || 0) || 0 : 0;
  }

  function syncRangeToBalance(rangeEl, minLbl, maxLbl) {
    const bal = getCurrentBalance();
    const maxVal = Math.max(0, Math.floor(bal));
    rangeEl.max = String(maxVal);
    rangeEl.min = '0';
    rangeEl.step = '1';
    let v = Number(rangeEl.value) || 0;
    if (v > maxVal) v = maxVal;
    rangeEl.value = String(v);
    if (minLbl) minLbl.textContent = '$' + formatMoney2(0);
    if (maxLbl) maxLbl.textContent = '$' + formatMoney2(maxVal);
  }

  function selectedMarket() {
    const el = document.querySelector('input[name="cpOnboardMarket"]:checked');
    return (el && el.value) || 'forex';
  }

  function selectedRisk() {
    const el = document.querySelector('input[name="cpOnboardRisk"]:checked');
    return (el && el.value) || 'low';
  }

  function liveWrapSelected(overlay) {
    const wrap = overlay.querySelector('#cpAiOnboardLiveWrap');
    return !!(wrap && wrap.classList.contains('cp-ai-onboard__live-option--selected'));
  }

  function resetLiveWrap(overlay) {
    const wrap = overlay.querySelector('#cpAiOnboardLiveWrap');
    if (!wrap) return;
    wrap.classList.remove('cp-ai-onboard__live-option--selected');
    const input = wrap.querySelector('input[type="radio"]');
    if (input) input.checked = false;
  }

  function buildTicketPayload(overlay, rangeVal, riskKey, balance, tpNumber) {
    const marketKey = selectedMarket();
    const marketLabel = tradingTypeEmojis[marketKey] || marketKey;
    const live = liveWrapSelected(overlay);
    if (window.CP_AI_TICKET && typeof window.CP_AI_TICKET.buildInvestMessage === 'function') {
      return window.CP_AI_TICKET.buildInvestMessage({
        marketLabel,
        tpNumber,
        balance,
        rangeVal,
        risk: riskKey,
        liveEvents: live
      });
    }
    const cfg = riskConfig[riskKey] || riskConfig.low;
    const percent = Math.round(cfg.percent * 100);
    const profit = rangeVal * cfg.percent;
    const riskLabel = riskKey.charAt(0).toUpperCase() + riskKey.slice(1);
    let s =
      `Preferred market: ${marketLabel}. ` +
      (tpNumber ? `Trading account TP: ${tpNumber}. ` : '') +
      `My current balance is $${formatMoney2(balance)}, ` +
      `I have selected investment amount $${formatMoney2(rangeVal)}. ` +
      `upto ${percent}% ($${formatMoney2(profit)}) with ${riskLabel} Risk.`;
    if (live && window.CP_AI_TICKET && window.CP_AI_TICKET.LIVE_EVENTS_SENTENCE) {
      s += ' ' + window.CP_AI_TICKET.LIVE_EVENTS_SENTENCE;
    }
    return s;
  }

  function hideOverlay(overlay) {
    document.body.classList.remove('cp-ai-onboard--open');
    overlay.setAttribute('hidden', '');
    overlay.setAttribute('aria-hidden', 'true');
  }

  function dismissOverlay(overlay) {
    markSessionSkipped();
    hideOverlay(overlay);
  }

  function setMsg(el, text, kind) {
    if (!el) return;
    el.textContent = text || '';
    el.classList.remove('cp-ai-onboard__msg--err', 'cp-ai-onboard__msg--ok');
    if (kind === 'err') el.classList.add('cp-ai-onboard__msg--err');
    if (kind === 'ok') el.classList.add('cp-ai-onboard__msg--ok');
  }

  function updateProgress(overlay) {
    const fill = overlay.querySelector('#cpAiOnboardProgressFill');
    if (fill) fill.style.width = (currentStep / totalSteps) * 100 + '%';
    const sn = overlay.querySelector('#cpAiOnboardStepNum');
    if (sn) sn.textContent = 'Step ' + currentStep + ' of ' + totalSteps;
  }

  function updateHeader(overlay) {
    const titles = [
      'Configure Your AI Trader',
      'Configure Your AI Trader',
      'Configure Your AI Trader',
      'Ready to Launch'
    ];
    const descs = [
      "Let's set up your AI trading preferences for optimal results.",
      "Let's set up your AI trading preferences for optimal results.",
      "Let's set up your AI trading preferences for optimal results.",
      'Review and confirm your AI trader configuration.'
    ];
    const names = [
      'Select Trading Type',
      'Trading account & amount',
      'Choose Risk Level',
      'Review & Confirm'
    ];
    const ht = overlay.querySelector('#cpAiOnboardHdrTitle');
    const hd = overlay.querySelector('#cpAiOnboardHdrDesc');
    const snm = overlay.querySelector('#cpAiOnboardStepName');
    if (ht) ht.textContent = titles[currentStep - 1] || titles[0];
    if (hd) hd.textContent = descs[currentStep - 1] || descs[0];
    if (snm) snm.textContent = names[currentStep - 1] || names[0];
  }

  function updateStepVisibility(overlay) {
    for (let i = 1; i <= totalSteps; i++) {
      const step = overlay.querySelector('#cpAiOnboardStep' + i);
      if (!step) continue;
      step.classList.toggle('cp-ai-onboard__step--active', i === currentStep);
    }
    const back = overlay.querySelector('#cpAiOnboardBack');
    if (back) back.hidden = currentStep === 1;
    const next = overlay.querySelector('#cpAiOnboardNext');
    const consent = overlay.querySelector('#cpAiOnboardConsent');
    if (next) {
      if (currentStep === 4) {
        next.textContent = 'Complete setup';
        next.disabled = !(consent && consent.checked);
      } else {
        next.textContent = 'Next';
        next.disabled = false;
      }
    }
    updateProgress(overlay);
    updateHeader(overlay);
  }

  function updateSummary(overlay) {
    const market = selectedMarket();
    const rangeEl = overlay.querySelector('#cpAiOnboardRange');
    const amount = Number(rangeEl && rangeEl.value) || 0;
    const risk = selectedRisk();
    const cfg = riskConfig[risk] || riskConfig.low;
    const exposurePercent = Math.round(cfg.percent * 100);
    const profitAmount = amount * cfg.percent;
    const tp = getSelectedTp(overlay);

    const sm = overlay.querySelector('#cpAiOnboardSumMarket');
    const stp = overlay.querySelector('#cpAiOnboardSumTp');
    const sa = overlay.querySelector('#cpAiOnboardSumAmount');
    const sr = overlay.querySelector('#cpAiOnboardSumRisk');
    if (sm) sm.textContent = tradingTypeEmojis[market] || market;
    if (stp) stp.textContent = tp || '—';
    if (sa) sa.textContent = '$' + formatMoney2(amount);
    if (sr) sr.textContent = riskLabels[risk] || risk;

    const pl = overlay.querySelector('#cpAiOnboardProfitLine');
    if (pl) {
      const riskCap = riskLabels[risk] || risk;
      pl.textContent =
        'upto ' + exposurePercent + '%($' + formatMoney2(profitAmount) + ') with ' + riskCap + ' Risk';
    }
    const pm = overlay.querySelector('#cpAiOnboardProfitMeta');
    if (pm) {
      const rate = successRateDisplay(cfg);
      pm.innerHTML =
        'Success rate <span class="cp-ai-onboard__rate-pct">' +
        escapeHtml(rate) +
        '</span><br>Based on your ' +
        escapeHtml(risk.toLowerCase()) +
        '-risk strategy';
    }
  }

  function escapeHtml(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  async function persistServerComplete(tpNumber) {
    const res = await fetch('api/user/ai_onboarding_mark_complete.php', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tpNumber: tpNumber || '' })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.status === 'error') {
      return { ok: false, message: data.message || 'Could not save completion on server.' };
    }
    return { ok: true };
  }

  async function completeSetup(overlay) {
    const msg = overlay.querySelector('#cpAiOnboardMsg');
    const next = overlay.querySelector('#cpAiOnboardNext');
    const balance = getCurrentBalance();
    const rangeVal = Number(overlay.querySelector('#cpAiOnboardRange')?.value) || 0;
    const tpNum = getSelectedTp(overlay);
    const text = buildTicketPayload(overlay, rangeVal, selectedRisk(), balance, tpNum);

    setMsg(msg, 'Creating ticket…', null);
    if (next) next.disabled = true;

    try {
      const res = await fetch('api/support/create_ticket.php', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.status === 'error') {
        setMsg(msg, data.message || 'Failed to create ticket. Please try again.', 'err');
        if (next) next.disabled = false;
        return;
      }

      setMsg(msg, 'Saving your profile…', null);
      const saved = await persistServerComplete(tpNum);
      if (!saved.ok) {
        setMsg(
          msg,
          (saved.message || 'Could not save completion.') +
            ' Your support ticket was created. Please refresh the page or contact support if this wizard appears again.',
          'err'
        );
        if (next) next.disabled = false;
        return;
      }

      window.CP_AI_ONBOARD_SERVER_COMPLETED = true;
      setMsg(msg, 'You are all set. Thank you!', 'ok');
      hideOverlay(overlay);
    } catch (e) {
      console.error(e);
      setMsg(msg, 'Network error. Please try again.', 'err');
      if (next) next.disabled = false;
    }
  }

  function bind(overlay) {
    const next = overlay.querySelector('#cpAiOnboardNext');
    const back = overlay.querySelector('#cpAiOnboardBack');
    const skip = overlay.querySelector('#cpAiOnboardSkip');
    const close = overlay.querySelector('#cpAiOnboardClose');
    const consent = overlay.querySelector('#cpAiOnboardConsent');
    const rangeEl = overlay.querySelector('#cpAiOnboardRange');
    const rangeValEl = overlay.querySelector('#cpAiOnboardRangeVal');
    const minLbl = overlay.querySelector('#cpAiOnboardRangeMin');
    const maxLbl = overlay.querySelector('#cpAiOnboardRangeMax');
    const tpSel = overlay.querySelector('#cpAiOnboardTp');

    const onDismiss = () => dismissOverlay(overlay);
    if (skip) skip.addEventListener('click', onDismiss);
    if (close) close.addEventListener('click', onDismiss);

    if (tpSel) {
      tpSel.addEventListener('change', () => {
        window.CP_state = window.CP_state || {};
        window.CP_state.selectedTp = tpSel.value;
        if (rangeEl) {
          syncRangeToBalance(rangeEl, minLbl, maxLbl);
          if (rangeValEl) rangeValEl.textContent = '$' + formatMoney2(Number(rangeEl.value) || 0);
          updateSliderFill(rangeEl); // Update fill color when TP changes
        }
        if (currentStep === 4) updateSummary(overlay);
      });
    }

    overlay.querySelectorAll('input[name="cpOnboardMarket"]').forEach((r) => {
      r.addEventListener('change', () => {
        if (currentStep >= 4) updateSummary(overlay);
      });
    });
    overlay.querySelectorAll('input[name="cpOnboardRisk"]').forEach((r) => {
      r.addEventListener('change', () => {
        if (currentStep >= 4) updateSummary(overlay);
      });
    });

    // Function to update slider fill color
    const updateSliderFill = (slider) => {
      if (!slider) return;
      const val = (slider.value - slider.min) / (slider.max - slider.min);
      const percentage = val * 100;
      slider.style.background = `linear-gradient(90deg, #6366f1 0%, #7c3aed ${percentage}%, #e2e8f0 ${percentage}%)`;
    };

    // Updated range slider with fill color change
    if (rangeEl) {
      rangeEl.addEventListener('input', () => {
        if (rangeValEl) rangeValEl.textContent = '$' + formatMoney2(Number(rangeEl.value) || 0);
        if (currentStep === 4) updateSummary(overlay);
        updateSliderFill(rangeEl); // Update the filled portion color
      });
      
      // Initialize fill color
      updateSliderFill(rangeEl);
    }

    if (consent) {
      consent.addEventListener('change', () => {
        if (currentStep === 4 && next) next.disabled = !consent.checked;
      });
    }

    const liveWrap = overlay.querySelector('#cpAiOnboardLiveWrap');
    if (liveWrap && !liveWrap.dataset.cpOnboardLiveWired) {
      liveWrap.dataset.cpOnboardLiveWired = '1';
      liveWrap.addEventListener('click', (e) => {
        e.preventDefault();
        const input = liveWrap.querySelector('input[type="radio"]');
        if (!input) return;
        const willSelect = !liveWrap.classList.contains('cp-ai-onboard__live-option--selected');
        liveWrap.classList.toggle('cp-ai-onboard__live-option--selected', willSelect);
        input.checked = willSelect;
        if (currentStep === 4) updateSummary(overlay);
      });
    }

    if (back) {
      back.addEventListener('click', () => {
        if (currentStep > 1) {
          currentStep--;
          setMsg(overlay.querySelector('#cpAiOnboardMsg'), '', null);
          updateStepVisibility(overlay);
          if (currentStep === 2) {
            populateTpSelect(overlay);
            if (rangeEl) {
              syncRangeToBalance(rangeEl, minLbl, maxLbl);
              if (rangeValEl) rangeValEl.textContent = '$' + formatMoney2(Number(rangeEl.value) || 0);
              updateSliderFill(rangeEl); // Update fill color when going back
            }
          }
        }
      });
    }

    if (next) {
      next.addEventListener('click', () => {
        setMsg(overlay.querySelector('#cpAiOnboardMsg'), '', null);
        if (currentStep < totalSteps) {
          currentStep++;
          if (currentStep === 2) {
            populateTpSelect(overlay);
            if (rangeEl) {
              syncRangeToBalance(rangeEl, minLbl, maxLbl);
              if (rangeValEl) rangeValEl.textContent = '$' + formatMoney2(Number(rangeEl.value) || 0);
              updateSliderFill(rangeEl); // Update fill color when going next
            }
          }
          if (currentStep === 4) updateSummary(overlay);
          updateStepVisibility(overlay);
        } else {
          void completeSetup(overlay);
        }
      });
    }
  }

  function show(overlay) {
    currentStep = 1;
    overlay.removeAttribute('hidden');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('cp-ai-onboard--open');

    populateTpSelect(overlay);

    const rangeEl = overlay.querySelector('#cpAiOnboardRange');
    const rangeValEl = overlay.querySelector('#cpAiOnboardRangeVal');
    const minLbl = overlay.querySelector('#cpAiOnboardRangeMin');
    const maxLbl = overlay.querySelector('#cpAiOnboardRangeMax');
    if (rangeEl) {
      syncRangeToBalance(rangeEl, minLbl, maxLbl);
      if (rangeValEl) rangeValEl.textContent = '$' + formatMoney2(Number(rangeEl.value) || 0);
    }

    const consent = overlay.querySelector('#cpAiOnboardConsent');
    if (consent) consent.checked = false;
    resetLiveWrap(overlay);

    updateStepVisibility(overlay);
    setMsg(overlay.querySelector('#cpAiOnboardMsg'), '', null);
  }

  window.CP_runAiOnboardingIfPending = async function () {
    if (inited) return;
    clearLegacyLocalStorage();
    if (serverSaysCompleted()) return;
    if (sessionSaysSkipped()) return;

    const overlay = document.getElementById('cpAiOnboardOverlay');
    if (!overlay) return;

    inited = true;
    try {
      await ensureAccounts();
      bind(overlay);
      show(overlay);
    } catch (e) {
      console.error('[cp-ai-onboarding]', e);
      inited = false;
    }
  };
})();
