import { useState, useEffect, useRef } from 'react';
import {
  HiArrowRight, HiLightBulb, HiQuestionMarkCircle,
  HiViewGrid, HiClock, HiCurrencyDollar, HiTemplate, HiEye,
  HiSearch, HiStar, HiChip,
} from 'react-icons/hi';

/* ============================================================
   DATA — mirrors traderai.cloud/chart market tabs + symbols
   ============================================================ */
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
      { s: 'BINANCE:DOGEUSDT', n: 'DOGE/USDT' },
      { s: 'BINANCE:AVAXUSDT', n: 'AVAX/USDT' },
      { s: 'BINANCE:DOTUSDT', n: 'DOT/USDT' },
      { s: 'BINANCE:LINKUSDT', n: 'LINK/USDT' },
      { s: 'BINANCE:MATICUSDT', n: 'MATIC/USDT' },
      { s: 'BINANCE:UNIUSDT', n: 'UNI/USDT' },
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
      { s: 'FX:NZDUSD', n: 'NZD/USD' },
      { s: 'FX:EURGBP', n: 'EUR/GBP' },
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
      { s: 'NASDAQ:META', n: 'Meta' },
      { s: 'NASDAQ:NFLX', n: 'Netflix' },
    ],
  },
};

const INTERVALS = [
  { v: '1', l: '1m' }, { v: '5', l: '5m' }, { v: '15', l: '15m' },
  { v: '30', l: '30m' }, { v: '60', l: '1H' }, { v: '240', l: '4H' },
  { v: 'D', l: '1D' }, { v: 'W', l: '1W' }, { v: 'M', l: '1M' },
];

/* ============================================================
   TRADINGVIEW LAZY LOADER
   ============================================================ */
let tvReady = null;
function ensureTV() {
  if (tvReady) return tvReady;
  tvReady = new Promise((resolve) => {
    if (window.TradingView) return resolve();
    if (!document.getElementById('tv-lc-script')) {
      const s = document.createElement('script');
      s.id = 'tv-lc-script';
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

/* ============================================================
   TOOLBAR TOGGLE CHIP
   ============================================================ */
function ToolChip({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-md transition-all border ${
        active
          ? 'bg-[var(--accent-light)] text-[var(--accent)] border-[var(--accent)]/40'
          : 'text-[var(--text-muted)] border-[var(--border)] hover:text-[var(--text)] hover:border-[var(--border-strong)]'
      }`}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </button>
  );
}

/* ============================================================
   MAIN PAGE
   ============================================================ */
export default function LiveChartPage() {
  const [market, setMarket] = useState('crypto');
  const [symbol, setSymbol] = useState('BINANCE:BTCUSDT');
  const [interval, setInterval] = useState('15');
  const [search, setSearch] = useState('');
  const [focusMode, setFocusMode] = useState(false);

  // Toolbar toggles (demo-only — redirect to reg)
  const [multiChart, setMultiChart] = useState(false);
  const [multiTF, setMultiTF] = useState(false);
  const [paperTrading, setPaperTrading] = useState(false);
  const [dom, setDom] = useState(false);

  const containerId = useRef(`tv-lc-${Math.random().toString(36).slice(2, 8)}`);
  const chartRef = useRef(null);

  // Load TV widget
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
          studies: ['MASimple@tv-basicstudies', 'RSI@tv-basicstudies', 'MACD@tv-basicstudies'],
          width: '100%',
          height: focusMode ? window.innerHeight - 80 : 560,
        });
      } catch (e) { /* ignore */ }
    });
  }, [symbol, interval, focusMode]);

  const currentMarket = MARKETS[market];
  const filteredSymbols = currentMarket.symbols.filter((x) =>
    x.n.toLowerCase().includes(search.toLowerCase()) ||
    x.s.toLowerCase().includes(search.toLowerCase())
  );
  const selectedName = currentMarket.symbols.find((x) => x.s === symbol)?.n || symbol;

  return (
    <div className={focusMode ? 'fixed inset-0 z-[9999] bg-[var(--bg)] overflow-hidden' : 'pt-28 pb-20'}>
      <div className={`${focusMode ? 'h-full flex flex-col' : 'max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8'}`}>

        {/* ── PAGE HEADER (hidden in focus) ── */}
        {!focusMode && (
          <div className="text-center mb-6">
            <h1 className="text-2xl lg:text-[28px] font-bold text-[var(--text)] tracking-[-0.01em] mb-1.5">
              Live Charts
            </h1>
            <p className="text-[14px] text-[var(--text-secondary)] max-w-xl mx-auto">
              Professional-grade interactive charts. Analyze any market, any timeframe — with AI.
            </p>
          </div>
        )}

        {/* ── TOOLBAR ── */}
        <div className={`flex flex-wrap items-center justify-between gap-3 mb-3 ${focusMode ? 'px-3 py-2 border-b border-[var(--border)] bg-[var(--bg-card)]' : ''}`}>
          {/* Market Tabs */}
          <div className="flex items-center gap-1">
            {Object.entries(MARKETS).map(([k, v]) => (
              <button
                key={k}
                onClick={() => { setMarket(k); setSymbol(MARKETS[k].symbols[0].s); setSearch(''); }}
                className={`px-4 py-2 text-[13px] font-semibold rounded-lg transition-all ${
                  market === k
                    ? 'bg-[var(--accent)] text-white shadow-sm shadow-[var(--accent)]/25'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg-overlay)]'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>

          {/* Tool Chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <ToolChip icon={HiViewGrid} label="Multi-Chart" active={multiChart} onClick={() => { setMultiChart(!multiChart); window.location.href = '/#reg-form'; }} />
            <ToolChip icon={HiClock} label="Multi-TF" active={multiTF} onClick={() => { setMultiTF(!multiTF); window.location.href = '/#reg-form'; }} />
            <ToolChip icon={HiCurrencyDollar} label="Paper Trading" active={paperTrading} onClick={() => { setPaperTrading(!paperTrading); window.location.href = '/#reg-form'; }} />
            <ToolChip icon={HiTemplate} label="DOM" active={dom} onClick={() => { setDom(!dom); window.location.href = '/#reg-form'; }} />
            <button
              onClick={() => setFocusMode(!focusMode)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-md transition-all border ${
                focusMode
                  ? 'bg-[var(--accent-light)] text-[var(--accent)] border-[var(--accent)]/40'
                  : 'text-[var(--text-muted)] border-[var(--border)] hover:text-[var(--text)]'
              }`}
            >
              <HiEye className="w-3.5 h-3.5" />
              Focus
            </button>
            <a
              href="/#reg-form"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[11px] font-semibold rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white transition-all shadow-sm shadow-[var(--accent)]/25"
            >
              <HiChip className="w-3.5 h-3.5" />
              Analyze with AI
            </a>
          </div>
        </div>

        {/* ── Focus escape hint ── */}
        {focusMode && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] shadow-lg text-[12px] text-[var(--text-secondary)] animate-pulse pointer-events-none">
            Exit focus mode <kbd className="px-1.5 py-0.5 text-[11px] rounded bg-[var(--bg)] border border-[var(--border)] text-[var(--text-muted)]">Esc</kbd>
          </div>
        )}

        {/* ── SYMBOL SEARCH + PICKER (hidden in focus) ── */}
        {!focusMode && (
          <>
            {/* Search */}
            <div className="relative mb-3">
              <HiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Search ${currentMarket.label} symbols…`}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text)] text-[13px] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]/50 focus:ring-1 focus:ring-[var(--accent-light)] transition-all"
              />
            </div>

            {/* Symbol chips */}
            <div className="flex items-center gap-1.5 mb-3 flex-wrap max-h-24 overflow-y-auto">
              {filteredSymbols.map((sym) => (
                <button
                  key={sym.s}
                  onClick={() => setSymbol(sym.s)}
                  className={`px-3 py-1.5 text-[12px] font-medium rounded-lg transition-all whitespace-nowrap ${
                    symbol === sym.s
                      ? 'bg-[var(--accent)] text-white shadow-sm'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg-card)] border border-[var(--border)]'
                  }`}
                >
                  {sym.n}
                </button>
              ))}
              {filteredSymbols.length === 0 && (
                <span className="text-[12px] text-[var(--text-muted)] py-1.5">No symbols found</span>
              )}
            </div>

            {/* Interval Selector */}
            <div className="flex items-center gap-1 mb-4 flex-wrap">
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
          </>
        )}

        {/* ── CHART ── */}
        <div ref={chartRef} className={`rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--bg-card)] shadow-[var(--shadow-md)] ${focusMode ? 'flex-1 rounded-none border-0' : ''}`}>
          {/* Chart top bar */}
          <div className={`flex items-center justify-between px-4 py-2.5 border-b border-[var(--border)] ${focusMode ? 'bg-[var(--bg-card)]' : ''}`}>
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_6px_rgba(74,222,128,0.5)]" />
              <span className="text-xs font-bold text-[var(--text)]">{selectedName}</span>
              <span className="text-[11px] text-[var(--text-muted)] px-1.5 py-0.5 rounded bg-[var(--bg)] border border-[var(--border)]">
                {market.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-[var(--text-muted)]">
                {INTERVALS.find((i) => i.v === interval)?.l || interval}
              </span>
              {focusMode && (
                <button
                  onClick={() => setFocusMode(false)}
                  className="ml-2 px-2 py-1 text-[10px] rounded bg-[var(--bg)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]"
                >
                  ✕ Exit Focus
                </button>
              )}
            </div>
          </div>
          <div id={containerId.current} style={{ minHeight: focusMode ? '100%' : 560 }} />
        </div>

        {/* ── ACTIONS (hidden in focus) ── */}
        {!focusMode && (
          <>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-5 mb-12">
              <a
                href="/#reg-form"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold text-sm transition-all shadow-md shadow-[var(--accent)]/25 hover:shadow-lg hover:shadow-[var(--accent)]/40"
              >
                <HiChip className="w-4 h-4" /> Analyze with AI <HiArrowRight className="w-4 h-4" />
              </a>
              <a
                href="/#reg-form"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-transparent hover:bg-[var(--bg-overlay)] text-[var(--text)] border border-[var(--border)] hover:border-[var(--border-strong)] font-semibold text-sm transition-all"
              >
                <HiStar className="w-4 h-4" /> Register to Unlock All Features
              </a>
            </div>

            {/* ── HOW TO USE ── */}
            <div className="rounded-xl bg-[var(--bg-card)] border border-[var(--border)] p-6 lg:p-8">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-8 h-8 rounded-lg bg-[var(--accent-light)] flex items-center justify-center">
                  <HiQuestionMarkCircle className="w-4 h-4 text-[var(--accent)]" />
                </div>
                <h2 className="text-base font-bold text-[var(--text)]">How to use Live Charts</h2>
              </div>
              <div className="grid sm:grid-cols-3 gap-4 mb-6">
                {[
                  { icon: HiSearch, title: '1. Choose Market & Symbol', desc: 'Select Crypto, Forex, or Stocks — then pick a trading pair and timeframe.' },
                  { icon: HiViewGrid, title: '2. Analyze with Tools', desc: 'Use built-in drawing tools, indicators (MA, RSI, MACD), and multi-timeframe views.' },
                  { icon: HiChip, title: '3. AI-Powered Analysis', desc: 'Click "Analyze with AI" — our AI reads your chart and suggests Entry, SL & TP levels.' },
                ].map((item, i) => (
                  <div key={i} className="p-4 rounded-lg bg-[var(--bg)] border border-[var(--border)]">
                    <item.icon className="w-5 h-5 text-[var(--accent)] mb-2.5" />
                    <h3 className="text-[13px] font-semibold text-[var(--text)] mb-1.5">{item.title}</h3>
                    <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
              <div className="p-4 rounded-lg bg-[var(--accent-light)] border border-[var(--accent)]/20 flex items-start gap-3">
                <HiLightBulb className="w-5 h-5 text-[var(--accent)] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[13px] font-semibold text-[var(--text)] mb-1">Pro Tip: Unlock Full AI Analysis</p>
                  <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed mb-3">
                    Register a free account to let AI analyze any chart — it detects patterns, trend direction, and auto-suggests Entry, Stop Loss & Take Profit levels.
                  </p>
                  <a
                    href="/#reg-form"
                    className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--accent)] hover:underline"
                  >
                    Create Free Account <HiArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
