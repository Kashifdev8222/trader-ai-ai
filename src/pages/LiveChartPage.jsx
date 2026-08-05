import { useState, useEffect, useRef } from 'react';
import { HiArrowRight, HiLightBulb, HiQuestionMarkCircle } from 'react-icons/hi';

const MARKETS = {
  crypto: {
    label: 'Crypto',
    symbols: [
      { s: 'BINANCE:BTCUSDT', n: 'BTC/USDT' },
      { s: 'BINANCE:ETHUSDT', n: 'ETH/USDT' },
      { s: 'BINANCE:BNBUSDT', n: 'BNB/USDT' },
      { s: 'BINANCE:SOLUSDT', n: 'SOL/USDT' },
      { s: 'BINANCE:XRPUSDT', n: 'XRP/USDT' },
      { s: 'BINANCE:ADAUSDT', n: 'ADA/USDT' },
    ],
  },
  forex: {
    label: 'Forex',
    symbols: [
      { s: 'FX:EURUSD', n: 'EUR/USD' },
      { s: 'FX:GBPUSD', n: 'GBP/USD' },
      { s: 'FX:USDJPY', n: 'USD/JPY' },
      { s: 'FX:AUDUSD', n: 'AUD/USD' },
      { s: 'FX:USDCAD', n: 'USD/CAD' },
      { s: 'FX:USDCHF', n: 'USD/CHF' },
    ],
  },
  stocks: {
    label: 'Stocks',
    symbols: [
      { s: 'NASDAQ:AAPL', n: 'Apple' },
      { s: 'NASDAQ:MSFT', n: 'Microsoft' },
      { s: 'NASDAQ:GOOGL', n: 'Alphabet' },
      { s: 'NASDAQ:TSLA', n: 'Tesla' },
      { s: 'NASDAQ:NVDA', n: 'NVIDIA' },
      { s: 'NASDAQ:AMZN', n: 'Amazon' },
    ],
  },
};

const INTERVALS = [
  { v: '1', l: '1m' },
  { v: '5', l: '5m' },
  { v: '15', l: '15m' },
  { v: '30', l: '30m' },
  { v: '60', l: '1H' },
  { v: '240', l: '4H' },
  { v: 'D', l: '1D' },
  { v: 'W', l: '1W' },
];

/* ---------- TradingView lazy loader ---------- */
let tvReady = null;
function ensureTV() {
  if (tvReady) return tvReady;
  tvReady = new Promise((resolve) => {
    if (window.TradingView) return resolve();
    if (!document.getElementById('tv-live-chart-script')) {
      const s = document.createElement('script');
      s.id = 'tv-live-chart-script';
      s.src = 'https://s3.tradingview.com/tv.js';
      s.async = true;
      s.onload = resolve;
      document.head.appendChild(s);
    } else {
      const check = setInterval(() => {
        if (window.TradingView) { clearInterval(check); resolve(); }
      }, 200);
    }
  });
  return tvReady;
}

export default function LiveChartPage() {
  const [market, setMarket] = useState('crypto');
  const [symbol, setSymbol] = useState('BINANCE:BTCUSDT');
  const [interval, setInterval] = useState('15');
  const containerId = useRef(`tv-lc-${Math.random().toString(36).slice(2, 8)}`);

  // Load TradingView widget
  useEffect(() => {
    ensureTV().then(() => {
      try {
        new window.TradingView.widget({
          container_id: containerId.current,
          symbol,
          interval,
          theme: 'dark',
          style: '1',
          locale: 'en',
          toolbar_bg: '#131620',
          enable_publishing: false,
          hide_side_toolbar: false,
          allow_symbol_change: true,
          studies: ['MASimple@tv-basicstudies', 'RSI@tv-basicstudies'],
          width: '100%',
          height: 520,
        });
      } catch (e) { /* ignore */ }
    });
  }, [symbol, interval]);

  // Switch symbol when market changes
  const handleMarketChange = (m) => {
    setMarket(m);
    setSymbol(MARKETS[m].symbols[0].s);
  };

  const currentMarket = MARKETS[market];
  const selectedName = currentMarket.symbols.find((x) => x.s === symbol)?.n || symbol;

  return (
    <div className="pt-28 pb-20">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl lg:text-3xl font-semibold text-[var(--text)] tracking-tight mb-2">
            Live Charts
          </h1>
          <p className="text-[var(--text-secondary)] text-sm max-w-xl mx-auto">
            Real-time interactive charts with drawing tools and indicators. Choose your market, symbol, and timeframe.
          </p>
        </div>

        {/* Market Tabs */}
        <div className="flex items-center gap-1 mb-4 flex-wrap">
          {Object.entries(MARKETS).map(([k, v]) => (
            <button
              key={k}
              onClick={() => handleMarketChange(k)}
              className={`px-5 py-2 text-[13px] font-semibold rounded-lg transition-all ${
                market === k
                  ? 'bg-[var(--accent)] text-white shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg-card)] border border-[var(--border)]'
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>

        {/* Symbol Selector */}
        <div className="flex items-center gap-1.5 mb-3 flex-wrap">
          {currentMarket.symbols.map((sym) => (
            <button
              key={sym.s}
              onClick={() => setSymbol(sym.s)}
              className={`px-3.5 py-1.5 text-[12px] font-medium rounded-lg transition-all ${
                symbol === sym.s
                  ? 'bg-[var(--accent-light)] text-[var(--accent)] border border-[var(--accent)]/30'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg-card)] border border-[var(--border)]'
              }`}
            >
              {sym.n}
            </button>
          ))}
        </div>

        {/* Interval Selector */}
        <div className="flex items-center gap-1 mb-5 flex-wrap">
          {INTERVALS.map((iv) => (
            <button
              key={iv.v}
              onClick={() => setInterval(iv.v)}
              className={`px-3 py-1.5 text-[12px] font-medium rounded-lg transition-all ${
                interval === iv.v
                  ? 'bg-[var(--accent-light)] text-[var(--accent)] border border-[var(--accent)]/30'
                  : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-card)] border border-[var(--border)]'
              }`}
            >
              {iv.l}
            </button>
          ))}
        </div>

        {/* Chart */}
        <div className="rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--bg-card)] mb-5 shadow-[var(--shadow-md)]">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs font-semibold text-[var(--text)]">{selectedName}</span>
              <span className="text-[11px] text-[var(--text-muted)]">{MARKETS[market].label}</span>
            </div>
            <span className="text-[11px] text-[var(--text-muted)]">
              {INTERVALS.find((i) => i.v === interval)?.l || interval}
            </span>
          </div>
          <div id={containerId.current} style={{ minHeight: 520 }} />
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
          <a
            href="/#reg-form"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold text-sm transition-all shadow-md shadow-[var(--accent)]/25"
          >
            Analyze with AI <HiArrowRight className="w-4 h-4" />
          </a>
          <a
            href="/#reg-form"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-transparent hover:bg-[var(--bg-overlay)] text-[var(--text)] border border-[var(--border)] hover:border-[var(--border-strong)] font-semibold text-sm transition-all"
          >
            Register to Unlock All Features
          </a>
        </div>

        {/* How to Use */}
        <div className="max-w-3xl mx-auto rounded-xl bg-[var(--bg-card)] border border-[var(--border)] p-6">
          <div className="flex items-center gap-2 mb-4">
            <HiQuestionMarkCircle className="w-5 h-5 text-[var(--accent)]" />
            <h2 className="text-base font-semibold text-[var(--text)]">How to Use Live Charts</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { title: '1. Choose Your Market', desc: 'Select Crypto, Forex, or Stocks from the tabs above to filter available symbols.' },
              { title: '2. Pick Symbol & Timeframe', desc: 'Click a trading pair and choose your preferred chart interval from 1m to 1W.' },
              { title: '3. Analyze & Register', desc: 'Use drawing tools and indicators, then click "Analyze with AI" to unlock AI-powered insights.' },
            ].map((item, i) => (
              <div key={i} className="p-3 rounded-lg bg-[var(--bg)] border border-[var(--border)]">
                <h3 className="text-[13px] font-semibold text-[var(--text)] mb-1.5">{item.title}</h3>
                <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 p-4 rounded-lg bg-[var(--accent-light)] border border-[var(--accent)]/20">
            <div className="flex items-start gap-3">
              <HiLightBulb className="w-5 h-5 text-[var(--accent)] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[13px] font-semibold text-[var(--text)] mb-1">Unlock Full AI Analysis</p>
                <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
                  Create your free account to unlock AI-powered chart analysis, pattern detection, and automated Entry/SL/TP suggestions.
                </p>
                <a
                  href="/#reg-form"
                  className="inline-flex items-center gap-1.5 mt-3 text-[13px] font-semibold text-[var(--accent)] hover:underline"
                >
                  Register Now <HiArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
