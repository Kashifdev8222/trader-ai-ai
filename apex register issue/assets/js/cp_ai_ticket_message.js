/**
 * Shared AI invest / onboarding support ticket body (same wording everywhere).
 * Loaded from dashboard.php before tab bundles that call CP_AI_TICKET.buildInvestMessage.
 */
(function (w) {
  w.CP_AI_TICKET = w.CP_AI_TICKET || {};

  const LIVE_EVENTS_SENTENCE =
    'Make 20% + potentially on live events let us know and we will contact you.';

  const riskConfig = {
    low: { percent: 0.05 },
    medium: { percent: 0.06 },
    high: { percent: 0.07 }
  };

  function formatMoney2(num) {
    const n = Number(num) || 0;
    return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  /**
   * @param {object} o
   * @param {string} [o.marketLabel] e.g. "📈 Forex"
   * @param {string|number} [o.tpNumber]
   * @param {number} o.balance
   * @param {number} o.rangeVal
   * @param {string} o.risk low|medium|high
   * @param {boolean} [o.liveEvents]
   */
  function buildInvestMessage(o) {
    const riskKey = String(o.risk || 'low').toLowerCase();
    const cfg = riskConfig[riskKey] || riskConfig.low;
    const percent = Math.round(cfg.percent * 100);
    const rangeVal = Number(o.rangeVal) || 0;
    const balance = Number(o.balance) || 0;
    const profit = rangeVal * cfg.percent;
    const riskLabel = riskKey.charAt(0).toUpperCase() + riskKey.slice(1);
    const parts = [];
    const ml = o.marketLabel != null ? String(o.marketLabel).trim() : '';
    if (ml) parts.push('Preferred market: ' + ml + '.');
    const tp = o.tpNumber != null && String(o.tpNumber).trim() !== '' ? String(o.tpNumber).trim() : '';
    if (tp) parts.push('Trading account TP: ' + tp + '.');
    parts.push(
      'My current balance is $' +
        formatMoney2(balance) +
        ', I have selected investment amount $' +
        formatMoney2(rangeVal) +
        '. upto ' +
        percent +
        '% ($' +
        formatMoney2(profit) +
        ') with ' +
        riskLabel +
        ' Risk.'
    );
    let text = parts.join(' ');
    if (o.liveEvents) {
      text += ' ' + LIVE_EVENTS_SENTENCE;
    }
    return text;
  }

  w.CP_AI_TICKET.formatMoney2 = formatMoney2;
  w.CP_AI_TICKET.LIVE_EVENTS_SENTENCE = LIVE_EVENTS_SENTENCE;
  w.CP_AI_TICKET.buildInvestMessage = buildInvestMessage;
})(window);
