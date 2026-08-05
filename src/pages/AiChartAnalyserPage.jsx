import { useState, useEffect, useRef } from 'react';
import {
  HiArrowRight, HiUpload, HiPhotograph, HiClipboardCopy,
  HiLightBulb, HiQuestionMarkCircle, HiCamera, HiChip,
  HiStar, HiCurrencyDollar, HiTemplate, HiSearch,
} from 'react-icons/hi';

/* ============================================================
   DATA — mirrors traderai.cloud/analyze
   ============================================================ */
const AI_PERSONAS = [
  'General Analyst',
  'Scalping Expert',
  'Swing Trader',
  'Day Trader',
  'Position Trader',
  'Crypto Specialist',
  'Forex Expert',
  'Stock Analyst',
  'Pattern Scout',
  'Trend Follower',
];

const MARKETS = ['Any Market', 'Crypto', 'Forex', 'Stocks', 'Commodities', 'Indices'];

const TIMEFRAMES = [
  'Any Timeframe', '1m', '5m', '15m', '30m', '1H', '4H', '1D', '1W', '1M',
];

const SUPPORTED_PLATFORMS = ['TradingView', 'MT4', 'MT5', 'Binance', 'Bybit'];

const CHART_MARKETS = {
  Crypto: [
    { s: 'BINANCE:BTCUSDT', n: 'BTC/USDT' },
    { s: 'BINANCE:ETHUSDT', n: 'ETH/USDT' },
    { s: 'BINANCE:BNBUSDT', n: 'BNB/USDT' },
    { s: 'BINANCE:SOLUSDT', n: 'SOL/USDT' },
  ],
  Forex: [
    { s: 'FX:EURUSD', n: 'EUR/USD' },
    { s: 'FX:GBPUSD', n: 'GBP/USD' },
    { s: 'FX:USDJPY', n: 'USD/JPY' },
    { s: 'FX:AUDUSD', n: 'AUD/USD' },
  ],
  Stocks: [
    { s: 'NASDAQ:AAPL', n: 'Apple' },
    { s: 'NASDAQ:MSFT', n: 'Microsoft' },
    { s: 'NASDAQ:GOOGL', n: 'Alphabet' },
    { s: 'NASDAQ:TSLA', n: 'Tesla' },
  ],
};

/* ============================================================
   TRADINGVIEW LAZY LOADER
   ============================================================ */
let tvReady = null;
function ensureTV() {
  if (tvReady) return tvReady;
  tvReady = new Promise((resolve) => {
    if (window.TradingView) return resolve();
    if (!document.getElementById('tv-analyser-script')) {
      const s = document.createElement('script');
      s.id = 'tv-analyser-script';
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
   SHARED COMPONENTS
   ============================================================ */
function TabButton({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 sm:flex-none px-5 py-2.5 text-[13px] font-semibold rounded-lg transition-all ${
        active
          ? 'bg-[var(--accent)] text-white shadow-sm shadow-[var(--accent)]/25'
          : 'text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg-overlay)]'
      }`}
    >
      {children}
    </button>
  );
}

function SelectField({ label, value, onChange, options, optional }) {
  return (
    <div>
      <label className="block text-[12px] font-semibold text-[var(--text-secondary)] mb-1.5">
        {label}
        {optional && <span className="text-[var(--text-muted)] font-normal ml-1">(optional)</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3.5 py-2.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] text-[13px] focus:outline-none focus:border-[var(--accent)]/50 focus:ring-1 focus:ring-[var(--accent-light)] transition-all appearance-none cursor-pointer"
      >
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

function ModeToggle({ mode, onChange }) {
  return (
    <div>
      <label className="block text-[12px] font-semibold text-[var(--text-secondary)] mb-1.5">Trading mode</label>
      <div className="grid grid-cols-2 gap-1.5">
        <button
          type="button"
          onClick={() => onChange('spot')}
          className={`py-2.5 text-[13px] font-medium rounded-lg transition-all ${
            mode === 'spot'
              ? 'bg-[var(--accent)] text-white shadow-sm'
              : 'bg-[var(--bg)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text)] hover:border-[var(--border-strong)]'
          }`}
        >
          Spot
        </button>
        <button
          type="button"
          onClick={() => onChange('leverage')}
          className={`py-2.5 text-[13px] font-medium rounded-lg transition-all ${
            mode === 'leverage'
              ? 'bg-[var(--accent)] text-white shadow-sm'
              : 'bg-[var(--bg)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text)] hover:border-[var(--border-strong)]'
          }`}
        >
          <HiCurrencyDollar className="w-3.5 h-3.5 inline mr-1" />
          Leverage / Futures
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   TAB 1 — UPLOAD IMAGE
   ============================================================ */
function UploadTab() {
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [pasteMsg, setPasteMsg] = useState('');
  const [persona, setPersona] = useState(AI_PERSONAS[0]);
  const [market, setMarket] = useState(MARKETS[0]);
  const [timeframe, setTimeframe] = useState(TIMEFRAMES[0]);
  const [mode, setMode] = useState('spot');
  const [context, setContext] = useState('');
  const fileRef = useRef(null);

  const handleFile = (f) => {
    if (f && f.type.startsWith('image/')) {
      setFile(f);
      setPasteMsg('');
    }
  };

  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (items) {
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          handleFile(item.getAsFile());
          setPasteMsg('✓ Image pasted from clipboard!');
        }
      }
    }
  };

  return (
    <div tabIndex={0} onPaste={handlePaste} className="focus:outline-none">
      {/* Supported Platforms */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className="text-[11px] text-[var(--text-muted)] font-medium">Supported:</span>
        {SUPPORTED_PLATFORMS.map((p) => (
          <span key={p} className="px-2.5 py-1 rounded-md bg-[var(--bg)] border border-[var(--border)] text-[12px] text-[var(--text-secondary)] font-medium">
            {p}
          </span>
        ))}
      </div>

      {/* Free Tier Hint */}
      <div className="flex items-center gap-2.5 mb-5 p-3.5 rounded-lg bg-[var(--accent-light)] border border-[var(--accent)]/20">
        <HiLightBulb className="w-4 h-4 text-[var(--accent)] flex-shrink-0" />
        <span className="text-[13px] text-[var(--text)]">
          1 free chart analysis/day.{' '}
          <a href="/#reg-form" className="text-[var(--accent)] font-semibold hover:underline">Upgrade to Pro for more →</a>
        </span>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
        onClick={() => fileRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all mb-4 ${
          dragOver
            ? 'border-[var(--accent)] bg-[var(--accent-light)] scale-[1.01]'
            : 'border-[var(--border)] hover:border-[var(--accent)]/40 hover:bg-[var(--bg-overlay)]'
        }`}
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => handleFile(e.target.files[0])}
        />

        {file ? (
          <div>
            <img src={URL.createObjectURL(file)} alt="Preview" className="max-h-52 mx-auto rounded-lg mb-3 shadow-md" />
            <p className="text-[14px] font-semibold text-[var(--text)]">{file.name}</p>
            <p className="text-[12px] text-[var(--text-muted)]">{(file.size / 1024).toFixed(1)} KB</p>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setFile(null); }}
              className="mt-2.5 text-[12px] text-[var(--accent)] hover:underline font-medium"
            >
              ✕ Remove & upload another
            </button>
          </div>
        ) : (
          <div>
            <div className="w-14 h-14 rounded-2xl bg-[var(--accent-light)] flex items-center justify-center mx-auto mb-4">
              <HiUpload className="w-7 h-7 text-[var(--accent)]" />
            </div>
            <p className="text-[15px] font-semibold text-[var(--text)] mb-1">Drop chart image here</p>
            <p className="text-[12px] text-[var(--text-muted)] mb-4">PNG, JPG, WebP up to 10MB</p>
            <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-[13px] font-semibold transition-all shadow-sm shadow-[var(--accent)]/25">
              <HiPhotograph className="w-4 h-4" /> Browse Files
            </span>
          </div>
        )}
      </div>

      {/* Paste Hint */}
      {pasteMsg ? (
        <p className="text-center text-[12px] text-green-400 mb-4 flex items-center justify-center gap-1.5 font-medium">
          <HiClipboardCopy className="w-3.5 h-3.5" />{pasteMsg}
        </p>
      ) : (
        <p className="text-center text-[11px] text-[var(--text-muted)] mb-5">
          or press <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg)] border border-[var(--border)] text-[var(--text-secondary)] text-[11px] font-medium">Ctrl+V</kbd> to paste from clipboard
        </p>
      )}

      {/* Configuration Form */}
      <div className="space-y-4">
        <SelectField label="Select AI Persona" value={persona} onChange={setPersona} options={AI_PERSONAS} />
        <div className="grid grid-cols-2 gap-4">
          <SelectField label="Market" value={market} onChange={setMarket} options={MARKETS} />
          <SelectField label="Timeframe" value={timeframe} onChange={setTimeframe} options={TIMEFRAMES} />
        </div>
        <ModeToggle mode={mode} onChange={setMode} />

        <div>
          <label className="block text-[12px] font-semibold text-[var(--text-secondary)] mb-1.5">
            Your Intent / Context <span className="text-[var(--text-muted)] font-normal">(optional)</span>
          </label>
          <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="e.g. I think this is a bullish pennant on BTC 4H — confirm entry?"
            rows={3}
            className="w-full px-3.5 py-2.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] text-[13px] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]/50 focus:ring-1 focus:ring-[var(--accent-light)] transition-all resize-none"
          />
          <p className="text-[11px] text-[var(--text-muted)] mt-1.5">
            Help AI give more targeted, personalized analysis
          </p>
        </div>

        {/* Analyze CTA → redirect to #reg-form */}
        <a
          href="/#reg-form"
          className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold text-[14px] transition-all shadow-md shadow-[var(--accent)]/25 hover:shadow-lg hover:shadow-[var(--accent)]/40"
        >
          <HiChip className="w-4 h-4" /> Analyze Chart <HiArrowRight className="w-4 h-4" />
        </a>
        <p className="text-center text-[11px] text-[var(--text-muted)]">
          Create a free account to run AI chart analysis
        </p>
      </div>
    </div>
  );
}

/* ============================================================
   TAB 2 — LIVE CHART CAPTURE
   ============================================================ */
function LiveChartTab() {
  const [chartMarket, setChartMarket] = useState('Crypto');
  const [symbol, setSymbol] = useState('BINANCE:BTCUSDT');
  const [persona, setPersona] = useState(AI_PERSONAS[0]);
  const [mode, setMode] = useState('spot');
  const [context, setContext] = useState('');
  const containerId = useRef(`tv-ac-${Math.random().toString(36).slice(2, 8)}`);

  useEffect(() => {
    ensureTV().then(() => {
      try {
        new window.TradingView.widget({
          container_id: containerId.current,
          symbol,
          interval: '60',
          theme: 'dark',
          style: '1',
          locale: 'en',
          toolbar_bg: '#131620',
          enable_publishing: false,
          hide_side_toolbar: true,
          hide_top_toolbar: true,
          allow_symbol_change: false,
          width: '100%',
          height: 380,
        });
      } catch (e) { /* ignore */ }
    });
  }, []);

  return (
    <div>
      {/* How Live Chart works hint */}
      <div className="flex items-center gap-2 mb-5 p-3 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[12px] text-[var(--text-secondary)]">
        <HiQuestionMarkCircle className="w-4 h-4 text-[var(--accent)] flex-shrink-0" />
        How the live chart works — select a market & symbol, configure AI settings, then capture & analyze.
      </div>

      {/* Market selector chips */}
      <div className="flex items-center gap-1.5 mb-4">
        {Object.keys(CHART_MARKETS).map((m) => (
          <button
            key={m}
            onClick={() => { setChartMarket(m); setSymbol(CHART_MARKETS[m][0].s); }}
            className={`px-4 py-2 text-[12px] font-semibold rounded-lg transition-all ${
              chartMarket === m
                ? 'bg-[var(--accent)] text-white shadow-sm shadow-[var(--accent)]/25'
                : 'text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg-overlay)]'
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Symbol selector chips */}
      <div className="flex items-center gap-1.5 mb-4 flex-wrap">
        {(CHART_MARKETS[chartMarket] || []).map((sym) => (
          <button
            key={sym.s}
            onClick={() => setSymbol(sym.s)}
            className={`px-3 py-1.5 text-[11px] font-medium rounded-lg transition-all ${
              symbol === sym.s
                ? 'bg-[var(--accent-light)] text-[var(--accent)] border border-[var(--accent)]/30'
                : 'text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg-card)] border border-[var(--border)]'
            }`}
          >
            {sym.n}
          </button>
        ))}
      </div>

      {/* Mini Chart */}
      <div className="rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--bg-card)] mb-4 shadow-[var(--shadow-sm)]">
        <div id={containerId.current} style={{ minHeight: 380 }} />
      </div>

      <p className="text-center text-[11px] text-[var(--text-muted)] mb-5">
        We screenshot the live chart and send it to the AI — same as uploading an image.
      </p>

      {/* Configuration */}
      <div className="space-y-4">
        <SelectField label="Select AI Persona" value={persona} onChange={setPersona} options={AI_PERSONAS} />
        <ModeToggle mode={mode} onChange={setMode} />

        <div>
          <label className="block text-[12px] font-semibold text-[var(--text-secondary)] mb-1.5">
            Your Intent / Context <span className="text-[var(--text-muted)] font-normal">(optional)</span>
          </label>
          <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="e.g. Looking for breakout confirmation on BTC 4H…"
            rows={2}
            className="w-full px-3.5 py-2.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] text-[13px] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]/50 focus:ring-1 focus:ring-[var(--accent-light)] transition-all resize-none"
          />
          <p className="text-[11px] text-[var(--text-muted)] mt-1.5">
            Help AI give more targeted, personalized analysis
          </p>
        </div>

        {/* Capture CTA → redirect to #reg-form */}
        <a
          href="/#reg-form"
          className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold text-[14px] transition-all shadow-md shadow-[var(--accent)]/25 hover:shadow-lg hover:shadow-[var(--accent)]/40"
        >
          <HiCamera className="w-4 h-4" /> Capture & Analyze <HiArrowRight className="w-4 h-4" />
        </a>
        <p className="text-center text-[11px] text-[var(--text-muted)]">
          Register to capture and analyze charts with AI
        </p>
      </div>
    </div>
  );
}

/* ============================================================
   MAIN PAGE
   ============================================================ */
export default function AiChartAnalyserPage() {
  const [tab, setTab] = useState('upload');

  return (
    <div className="pt-28 pb-20">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── HERO HEADER ── */}
        <div className="text-center mb-8">
          <h1 className="text-[28px] lg:text-[32px] font-bold text-[var(--text)] tracking-[-0.01em] mb-3">
            AI Chart Analysis
          </h1>
          <p className="text-[15px] text-[var(--text-secondary)] max-w-xl mx-auto leading-relaxed">
            Upload a chart image — AI detects patterns, trend and suggests Entry / SL / TP
          </p>
          <a href="/#reg-form" className="inline-flex items-center gap-1.5 mt-3 text-[13px] text-[var(--accent)] hover:underline font-medium">
            <HiQuestionMarkCircle className="w-4 h-4" /> How to use
          </a>
        </div>

        {/* ── TABS ── */}
        <div className="flex items-center justify-center gap-2 mb-8 max-w-md mx-auto">
          <TabButton active={tab === 'upload'} onClick={() => setTab('upload')}>
            <HiUpload className="w-4 h-4 inline mr-1.5" />
            Upload image
          </TabButton>
          <TabButton active={tab === 'live'} onClick={() => setTab('live')}>
            <HiCamera className="w-4 h-4 inline mr-1.5" />
            Live chart
          </TabButton>
        </div>

        {/* ── TAB CONTENT ── */}
        <div className="max-w-[640px] mx-auto">
          {tab === 'upload' ? <UploadTab /> : <LiveChartTab />}
        </div>

        {/* ── RESULTS PLACEHOLDER ── */}
        <div className="max-w-[640px] mx-auto mt-8">
          <div className="rounded-xl bg-[var(--bg-card)] border border-[var(--border)] p-8 text-center">
            <HiStar className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-3" />
            <p className="text-[14px] text-[var(--text-muted)] mb-1">No analysis results yet</p>
            <p className="text-[12px] text-[var(--text-muted)]">
              Upload a chart image or capture a live chart, then run analysis.{' '}
              <a href="/#reg-form" className="text-[var(--accent)] hover:underline font-medium">
                Register now to get started →
              </a>
            </p>
          </div>
        </div>

        {/* ── PRO TIP ── */}
        <div className="max-w-[640px] mx-auto mt-6">
          <div className="p-5 rounded-xl bg-[var(--accent-light)] border border-[var(--accent)]/20 flex items-start gap-3">
            <HiLightBulb className="w-5 h-5 text-[var(--accent)] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[13px] font-semibold text-[var(--text)] mb-1">
                Unlock AI-Powered Chart Analysis
              </p>
              <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed mb-3">
                Register your free account — AI detects chart patterns, identifies trend direction, and auto-suggests optimal Entry, Stop Loss & Take Profit levels based on technical analysis.
              </p>
              <a
                href="/#reg-form"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-[13px] font-semibold transition-all shadow-sm shadow-[var(--accent)]/25"
              >
                Create Free Account <HiArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
