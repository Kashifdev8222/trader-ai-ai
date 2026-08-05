import { useState, useEffect, useRef } from 'react';
import {
  HiSearch, HiX, HiArrowRight, HiLightBulb, HiQuestionMarkCircle,
  HiViewGrid, HiClock, HiCurrencyDollar, HiEye, HiEyeOff, HiChip,
} from 'react-icons/hi';

/* ============================================================
   MARKET DATA
   ============================================================ */
const MARKETS = {
  crypto: {
    label: 'Crypto',
    pairs: [
      { s: 'BINANCE:BTCUSDT', n: 'BTC/USDT', p: '62,450.80', ch: '+2.34' },
      { s: 'BINANCE:ETHUSDT', n: 'ETH/USDT', p: '3,120.45', ch: '+1.87' },
      { s: 'BINANCE:BNBUSDT', n: 'BNB/USDT', p: '582.30', ch: '-0.42' },
      { s: 'BINANCE:SOLUSDT', n: 'SOL/USDT', p: '142.65', ch: '+5.21' },
      { s: 'BINANCE:XRPUSDT', n: 'XRP/USDT', p: '0.6234', ch: '+0.89' },
      { s: 'BINANCE:ADAUSDT', n: 'ADA/USDT', p: '0.4521', ch: '-1.23' },
      { s: 'BINANCE:DOGEUSDT', n: 'DOGE/USDT', p: '0.1234', ch: '+3.45' },
      { s: 'BINANCE:AVAXUSDT', n: 'AVAX/USDT', p: '35.67', ch: '-2.10' },
    ],
  },
  forex: {
    label: 'Forex',
    pairs: [
      { s: 'FX:EURUSD', n: 'EUR/USD', p: '1.0845', ch: '+0.12' },
      { s: 'FX:GBPUSD', n: 'GBP/USD', p: '1.2630', ch: '-0.08' },
      { s: 'FX:USDJPY', n: 'USD/JPY', p: '151.42', ch: '+0.34' },
      { s: 'FX:AUDUSD', n: 'AUD/USD', p: '0.6580', ch: '-0.15' },
      { s: 'FX:USDCAD', n: 'USD/CAD', p: '1.3580', ch: '+0.05' },
      { s: 'FX:USDCHF', n: 'USD/CHF', p: '0.8920', ch: '-0.22' },
      { s: 'FX:NZDUSD', n: 'NZD/USD', p: '0.6120', ch: '+0.18' },
      { s: 'FX:EURGBP', n: 'EUR/GBP', p: '0.8585', ch: '+0.09' },
    ],
  },
  stocks: {
    label: 'Stocks',
    pairs: [
      { s: 'NASDAQ:AAPL', n: 'Apple', p: '187.32', ch: '+0.87' },
      { s: 'NASDAQ:MSFT', n: 'Microsoft', p: '415.80', ch: '-0.34' },
      { s: 'NASDAQ:GOOGL', n: 'Alphabet', p: '142.56', ch: '+1.23' },
      { s: 'NASDAQ:TSLA', n: 'Tesla', p: '248.90', ch: '-2.15' },
      { s: 'NASDAQ:NVDA', n: 'NVIDIA', p: '875.40', ch: '+4.56' },
      { s: 'NASDAQ:AMZN', n: 'Amazon', p: '178.25', ch: '+0.45' },
      { s: 'NASDAQ:META', n: 'Meta', p: '505.60', ch: '-1.02' },
      { s: 'NASDAQ:NFLX', n: 'Netflix', p: '612.30', ch: '+1.78' },
    ],
  },
};

const INTERVALS = [
  { v: '1', l: '1m' }, { v: '5', l: '5m' }, { v: '15', l: '15m' },
  { v: '30', l: '30m' }, { v: '60', l: '1H' }, { v: '240', l: '4H' },
  { v: 'D', l: '1D' }, { v: 'W', l: '1W' }, { v: 'M', l: '1M' },
];

/* ============================================================
   TRADINGVIEW LOADER
   ============================================================ */
function useTV(containerId, symbol, interval) {
  useEffect(() => {
    const load = () => {
      if (window.TradingView) {
        try {
          new window.TradingView.widget({
            container_id: containerId, symbol, interval, theme: 'dark',
            style: '1', locale: 'en', toolbar_bg: '#131620',
            enable_publishing: false, hide_side_toolbar: false,
            allow_symbol_change: true,
            studies: ['MASimple@tv-basicstudies', 'RSI@tv-basicstudies', 'MACD@tv-basicstudies'],
            width: '100%', height: 560,
          });
        } catch (e) {}
        return;
      }
      const s = document.createElement('script');
      s.src = 'https://s3.tradingview.com/tv.js';
      s.async = true; s.onload = load;
      document.head.appendChild(s);
    };
    load();
  }, [symbol, interval]);
}

/* ============================================================
   LIVE CHART PAGE
   ============================================================ */
export default function LiveChartPage() {
  const [market, setMarket] = useState('crypto');
  const [symbol, setSymbol] = useState('BINANCE:BTCUSDT');
  const [interval, setInterval] = useState('15');
  const [search, setSearch] = useState('');
  const [multiChart, setMultiChart] = useState(false);
  const [multiTF, setMultiTF] = useState(false);
  const [paperTrading, setPaperTrading] = useState(false);
  const [dom, setDom] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const tvId = useRef(`tv-${Math.random().toString(36).slice(2,8)}`);

  useTV(tvId.current, symbol, interval);

  const m = MARKETS[market];
  const active = m.pairs.find(x => x.s === symbol) || m.pairs[0];
  const filtered = m.pairs.filter(x =>
    x.n.toLowerCase().includes(search.toLowerCase()) ||
    x.s.toLowerCase().includes(search.toLowerCase())
  );
  const up = (active.ch || '').startsWith('+');

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* ================================================================
           PAGE CONTAINER
           ================================================================ */}
      <div className="pt-24 pb-16 max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── HEADER ── */}
        <div className="mb-8">
          <h1 className="text-[26px] lg:text-[30px] font-bold text-[var(--text)] tracking-[-0.01em] mb-2">
            Live Charts
          </h1>
          <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed max-w-lg">
            Professional-grade interactive charts with 100+ indicators, drawing tools, and
            real-time data across Crypto, Forex, and Stock markets.
          </p>
        </div>

        {/* ================================================================
             TOOLBAR
             ================================================================ */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-4 p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border)]">

          {/* Market Tabs */}
          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[var(--bg)] border border-[var(--border)]">
            {Object.entries(MARKETS).map(([k, v]) => (
              <button key={k} onClick={() => { setMarket(k); setSymbol(MARKETS[k].pairs[0].s); setSearch(''); }}
                className={`px-4 py-2 text-[12px] font-semibold rounded-md transition-all ${
                  market === k
                    ? 'bg-[var(--accent)] text-white shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text)]'
                }`}>
                {v.label}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="hidden lg:block w-px h-6 bg-[var(--border)]" />

          {/* Tool Toggles */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { icon: HiViewGrid, label: 'Multi-Chart', on: multiChart, set: setMultiChart },
              { icon: HiClock, label: 'Multi-TF', on: multiTF, set: setMultiTF },
              { icon: HiCurrencyDollar, label: 'Paper Trading', on: paperTrading, set: setPaperTrading },
              { icon: HiViewGrid, label: 'DOM', on: dom, set: setDom },
            ].map(t => (
              <button key={t.label} onClick={() => { t.set(!t.on); window.location.href = '/#reg-form'; }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-md border transition-all ${
                  t.on
                    ? 'bg-[var(--accent-light)] text-[var(--accent)] border-[var(--accent)]/40'
                    : 'text-[var(--text-muted)] border-[var(--border)] hover:text-[var(--text)] hover:border-[var(--border-strong)]'
                }`}>
                <t.icon className="w-3.5 h-3.5" />{t.label}
              </button>
            ))}
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Focus + AI */}
          <div className="flex items-center gap-1.5">
            <button onClick={() => setFocusMode(!focusMode)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-md border transition-all ${
                focusMode ? 'bg-[var(--accent-light)] text-[var(--accent)] border-[var(--accent)]/40' : 'text-[var(--text-muted)] border-[var(--border)] hover:text-[var(--text)]'
              }`}>
              {focusMode ? <HiEyeOff className="w-3.5 h-3.5"/> : <HiEye className="w-3.5 h-3.5"/>}
              {focusMode ? 'Exit Focus' : 'Focus'}
            </button>
            <a href="/#reg-form"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-[11px] font-semibold rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white transition-all shadow-sm">
              <HiChip className="w-3.5 h-3.5"/>Analyze with AI <HiArrowRight className="w-3 h-3"/>
            </a>
          </div>
        </div>

        {/* ================================================================
             SYMBOL SEARCH + PICKER
             ================================================================ */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          {/* Search */}
          <div className="relative flex-1">
            <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]"/>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder={`Search ${m.label.toLowerCase()} pairs…`}
              className="w-full pl-9 pr-8 py-2.5 text-[13px] rounded-lg bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]/50 transition-all"/>
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2">
                <HiX className="w-3.5 h-3.5 text-[var(--text-muted)] hover:text-[var(--text)]"/>
              </button>
            )}
          </div>
          {/* Interval */}
          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border)]">
            {INTERVALS.map(iv => (
              <button key={iv.v} onClick={() => setInterval(iv.v)}
                className={`px-2.5 py-2 text-[11px] font-semibold rounded-md transition-all whitespace-nowrap ${
                  interval === iv.v
                    ? 'bg-[var(--accent)] text-white shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                }`}>
                {iv.l}
              </button>
            ))}
          </div>
        </div>

        {/* Symbol Chips */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {filtered.map(p => {
            const isUp = (p.ch || '').startsWith('+');
            return (
              <button key={p.s} onClick={() => setSymbol(p.s)}
                className={`group px-3.5 py-2 rounded-lg border transition-all text-left min-w-[130px] ${
                  symbol === p.s
                    ? 'bg-[var(--accent-light)] border-[var(--accent)]/40 shadow-sm'
                    : 'bg-[var(--bg-card)] border-[var(--border)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-elevated)]'
                }`}>
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-[12px] font-bold ${symbol === p.s ? 'text-[var(--accent)]' : 'text-[var(--text)]'}`}>{p.n}</span>
                  <span className={`text-[11px] font-semibold ${isUp ? 'text-[var(--green)]' : 'text-[var(--red)]'}`}>{p.ch}%</span>
                </div>
                <div className={`text-[13px] font-semibold mt-0.5 ${symbol === p.s ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)]'}`}>
                  ${p.p}
                </div>
              </button>
            );
          })}
        </div>

        {/* ================================================================
             CHART
             ================================================================ */}
        <div className="rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--bg-card)] shadow-[var(--shadow-md)] mb-6">
          {/* Chart Top Bar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] bg-[var(--bg-alt)]">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[var(--green)] animate-pulse shadow-[0_0_6px_rgba(14,165,113,0.5)]"/>
                <span className="text-[13px] font-bold text-[var(--text)]">{active.n}</span>
              </div>
              <span className="text-[11px] text-[var(--text-muted)] bg-[var(--bg)] border border-[var(--border)] px-2 py-0.5 rounded">
                {m.label}
              </span>
              <span className="text-[11px] text-[var(--text-muted)]">
                {INTERVALS.find(i => i.v === interval)?.l || interval}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-[15px] font-bold text-[var(--text)] tabular-nums">${active.p}</div>
                <div className={`text-[12px] font-semibold tabular-nums ${up ? 'text-[var(--green)]' : 'text-[var(--red)]'}`}>
                  {up ? '▲' : '▼'} {active.ch}%
                </div>
              </div>
            </div>
          </div>
          {/* TV Widget */}
          <div id={tvId.current} style={{ minHeight: 520 }}/>
        </div>

        {/* ================================================================
             CTA ROW
             ================================================================ */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
          <a href="/#reg-form"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold text-sm transition-all shadow-md shadow-[var(--accent)]/25 hover:shadow-lg hover:shadow-[var(--accent)]/40">
            <HiChip className="w-4 h-4"/> Analyze with AI <HiArrowRight className="w-4 h-4"/>
          </a>
          <a href="/#reg-form"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-[var(--text)] font-semibold text-sm border border-[var(--border)] hover:bg-[var(--bg-overlay)] hover:border-[var(--border-strong)] transition-all">
            Register to Unlock All Features
          </a>
        </div>

        {/* ================================================================
             HOW TO USE
             ================================================================ */}
        <div className="rounded-xl bg-[var(--bg-card)] border border-[var(--border)] p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-lg bg-[var(--accent-light)] flex items-center justify-center">
              <HiQuestionMarkCircle className="w-5 h-5 text-[var(--accent)]"/>
            </div>
            <h2 className="text-base font-bold text-[var(--text)]">How to use Live Charts</h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 mb-6">
            {[
              { t: '1. Choose Market & Symbol', d: 'Pick Crypto, Forex, or Stocks — then select your trading pair and preferred timeframe.', i: HiSearch },
              { t: '2. Analyze with Tools', d: '100+ built-in indicators (MA, RSI, MACD, Bollinger Bands), drawing tools, and multi-timeframe views.', i: HiViewGrid },
              { t: '3. Get AI Insights', d: 'Click "Analyze with AI" — our AI reads the chart, detects patterns, and suggests Entry / SL / TP levels.', i: HiChip },
            ].map((s, i) => (
              <div key={i} className="p-4 rounded-lg bg-[var(--bg)] border border-[var(--border)]">
                <s.i className="w-5 h-5 text-[var(--accent)] mb-2.5"/>
                <h3 className="text-[13px] font-semibold text-[var(--text)] mb-2">{s.t}</h3>
                <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>

          <div className="flex items-start gap-3 p-4 rounded-lg bg-[var(--accent-light)] border border-[var(--accent)]/20">
            <HiLightBulb className="w-5 h-5 text-[var(--accent)] flex-shrink-0 mt-0.5"/>
            <div>
              <p className="text-[14px] font-semibold text-[var(--text)] mb-1.5">Unlock Full AI-Powered Chart Analysis</p>
              <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed mb-3">
                Register your free account — AI auto-detects patterns, trend direction, and generates optimal Entry, Stop Loss & Take Profit levels from your chart.
              </p>
              <a href="/#reg-form" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--accent)] hover:underline">
                Create Free Account <HiArrowRight className="w-3.5 h-3.5"/>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
