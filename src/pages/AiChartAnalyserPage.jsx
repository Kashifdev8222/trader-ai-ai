import { useState, useEffect, useRef } from 'react';
import { HiArrowRight, HiUpload, HiPhotograph, HiClipboardCopy, HiLightBulb, HiQuestionMarkCircle, HiCamera } from 'react-icons/hi';

/* ============================================================
   AI Persona / Market / Timeframe configs
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
];

const MARKETS = ['Any Market', 'Crypto', 'Forex', 'Stocks', 'Commodities', 'Indices'];

const TIMEFRAMES = [
  'Any Timeframe',
  '1m', '5m', '15m', '30m',
  '1H', '4H', '1D', '1W', '1M',
];

const SUPPORTED_PLATFORMS = ['TradingView', 'MT4', 'MT5', 'Binance', 'Bybit'];

/* ---------- Live Chart symbols ---------- */
const CHART_SYMBOLS = {
  Crypto: [
    { s: 'BINANCE:BTCUSDT', n: 'BTC/USDT' },
    { s: 'BINANCE:ETHUSDT', n: 'ETH/USDT' },
    { s: 'BINANCE:BNBUSDT', n: 'BNB/USDT' },
    { s: 'BINANCE:SOLUSDT', n: 'SOL/USDT' },
  ],
  Forex: [
    { s: 'FX:EURUSD', n: 'EUR/USD' },
    { s: 'FX:GBPUSD', n: 'GBP/USD' },
  ],
  Stocks: [
    { s: 'NASDAQ:AAPL', n: 'Apple' },
    { s: 'NASDAQ:MSFT', n: 'Microsoft' },
  ],
};

/* ---------- TradingView loader ---------- */
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

function TabButton({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-2.5 text-[13px] font-semibold rounded-lg transition-all ${
        active
          ? 'bg-[var(--accent)] text-white shadow-sm'
          : 'text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg-card)] border border-[var(--border)]'
      }`}
    >
      {children}
    </button>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div>
      <label className="block text-[12px] font-semibold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wide">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3.5 py-2.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] text-[13px] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent-light)] transition-all appearance-none cursor-pointer"
      >
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

/* ============================================================
   TAB 1: Upload Image
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

  // Ctrl+V
  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (items) {
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          handleFile(item.getAsFile());
          setPasteMsg('Image pasted from clipboard!');
        }
      }
    }
  };

  return (
    <div tabIndex={0} onPaste={handlePaste} className="focus:outline-none">
      {/* Supported platforms */}
      <div className="flex items-center gap-2 mb-4 text-[12px] text-[var(--text-muted)]">
        <span>Supported:</span>
        {SUPPORTED_PLATFORMS.map((p) => (
          <span key={p} className="px-2 py-0.5 rounded bg-[var(--bg)] border border-[var(--border)] text-[var(--text-secondary)]">{p}</span>
        ))}
      </div>

      {/* Free tier notice */}
      <div className="flex items-center gap-2 mb-5 p-3 rounded-lg bg-[var(--accent-light)] border border-[var(--accent)]/20 text-[13px] text-[var(--text)]">
        <HiLightBulb className="w-4 h-4 text-[var(--accent)] flex-shrink-0" />
        1 free chart analysis/day. <a href="/#reg-form" className="text-[var(--accent)] font-semibold hover:underline">Register for more →</a>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
        onClick={() => fileRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all mb-5 ${
          dragOver
            ? 'border-[var(--accent)] bg-[var(--accent-light)]'
            : 'border-[var(--border)] hover:border-[var(--accent)]/50 hover:bg-[var(--bg-overlay)]'
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
            <img src={URL.createObjectURL(file)} alt="Preview" className="max-h-48 mx-auto rounded-lg mb-3" />
            <p className="text-[13px] font-semibold text-[var(--text)]">{file.name}</p>
            <p className="text-[11px] text-[var(--text-muted)]">{(file.size / 1024).toFixed(1)} KB</p>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setFile(null); }}
              className="mt-2 text-[12px] text-[var(--accent)] hover:underline"
            >
              Remove
            </button>
          </div>
        ) : (
          <div>
            <HiUpload className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3" />
            <p className="text-[14px] font-semibold text-[var(--text)] mb-1">Drop chart image here</p>
            <p className="text-[12px] text-[var(--text-muted)] mb-3">PNG, JPG, WebP up to 10MB</p>
            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[13px] font-medium text-[var(--text)] hover:border-[var(--accent)]/30 transition-colors">
              <HiPhotograph className="w-4 h-4" /> Browse Files
            </span>
          </div>
        )}
      </div>

      {pasteMsg && (
        <p className="text-center text-[12px] text-green-400 mb-4 flex items-center justify-center gap-1.5">
          <HiClipboardCopy className="w-3.5 h-3.5" />{pasteMsg}
        </p>
      )}

      <p className="text-center text-[11px] text-[var(--text-muted)] mb-5">
        Or press <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg)] border border-[var(--border)] text-[var(--text-secondary)] text-[11px]">Ctrl+V</kbd> to paste from clipboard
      </p>

      {/* Configuration */}
      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <Select label="AI Persona" value={persona} onChange={setPersona} options={AI_PERSONAS} />
        <Select label="Market" value={market} onChange={setMarket} options={MARKETS} />
        <Select label="Timeframe" value={timeframe} onChange={setTimeframe} options={TIMEFRAMES} />
        <div>
          <label className="block text-[12px] font-semibold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wide">Trading Mode</label>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setMode('spot')}
              className={`flex-1 py-2.5 text-[13px] font-medium rounded-lg transition-all ${
                mode === 'spot'
                  ? 'bg-[var(--accent)] text-white'
                  : 'bg-[var(--bg)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text)]'
              }`}
            >
              Spot
            </button>
            <button
              type="button"
              onClick={() => setMode('leverage')}
              className={`flex-1 py-2.5 text-[13px] font-medium rounded-lg transition-all ${
                mode === 'leverage'
                  ? 'bg-[var(--accent)] text-white'
                  : 'bg-[var(--bg)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text)]'
              }`}
            >
              Leverage / Futures
            </button>
          </div>
        </div>
      </div>

      <div className="mb-5">
        <label className="block text-[12px] font-semibold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wide">
          Your Intent / Context <span className="text-[var(--text-muted)] font-normal normal-case tracking-normal">(optional)</span>
        </label>
        <textarea
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="e.g. I think this is a bullish pennant on BTC 4H — confirm?"
          rows={3}
          className="w-full px-3.5 py-2.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] text-[13px] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent-light)] transition-all resize-none"
        />
      </div>

      {/* CTA -> redirect to #reg-form */}
      <a
        href="/#reg-form"
        className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold text-sm transition-all shadow-md shadow-[var(--accent)]/25"
      >
        <HiArrowRight className="w-4 h-4" /> Analyze Chart
      </a>
      <p className="text-center text-[11px] text-[var(--text-muted)] mt-2">
        Register to unlock AI-powered analysis
      </p>
    </div>
  );
}

/* ============================================================
   TAB 2: Live Chart Capture
   ============================================================ */
function LiveChartTab() {
  const [chartMarket, setChartMarket] = useState('Crypto');
  const [symbol, setSymbol] = useState('BINANCE:BTCUSDT');
  const [persona, setPersona] = useState(AI_PERSONAS[0]);
  const [mode, setMode] = useState('spot');
  const [context, setContext] = useState('');
  const containerId = useRef(`tv-ac-${Math.random().toString(36).slice(2, 8)}`);

  // Load mini TradingView
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
          allow_symbol_change: false,
          width: '100%',
          height: 350,
        });
      } catch (e) { /* ignore */ }
    });
  }, []);

  const symbols = CHART_SYMBOLS[chartMarket] || [];

  return (
    <div>
      {/* Market chips */}
      <div className="flex items-center gap-1.5 mb-4">
        {Object.keys(CHART_SYMBOLS).map((m) => (
          <button
            key={m}
            onClick={() => { setChartMarket(m); setSymbol(CHART_SYMBOLS[m][0].s); }}
            className={`px-4 py-2 text-[12px] font-semibold rounded-lg transition-all ${
              chartMarket === m
                ? 'bg-[var(--accent)] text-white shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg-card)] border border-[var(--border)]'
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Symbol selector */}
      <div className="flex items-center gap-1.5 mb-4 flex-wrap">
        {symbols.map((sym) => (
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
      <div className="rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--bg-card)] mb-5">
        <div id={containerId.current} style={{ minHeight: 350 }} />
      </div>

      <p className="text-[11px] text-[var(--text-muted)] mb-5 text-center">
        AI captures a screenshot of this chart and analyzes it — same as uploading an image
      </p>

      {/* Configuration */}
      <div className="grid sm:grid-cols-2 gap-4 mb-5">
        <Select label="AI Persona" value={persona} onChange={setPersona} options={AI_PERSONAS} />
        <div>
          <label className="block text-[12px] font-semibold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wide">Trading Mode</label>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setMode('spot')}
              className={`flex-1 py-2.5 text-[13px] font-medium rounded-lg transition-all ${
                mode === 'spot'
                  ? 'bg-[var(--accent)] text-white'
                  : 'bg-[var(--bg)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text)]'
              }`}
            >
              Spot
            </button>
            <button
              type="button"
              onClick={() => setMode('leverage')}
              className={`flex-1 py-2.5 text-[13px] font-medium rounded-lg transition-all ${
                mode === 'leverage'
                  ? 'bg-[var(--accent)] text-white'
                  : 'bg-[var(--bg)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text)]'
              }`}
            >
              Leverage / Futures
            </button>
          </div>
        </div>
      </div>

      <div className="mb-5">
        <label className="block text-[12px] font-semibold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wide">
          Your Intent / Context <span className="text-[var(--text-muted)] font-normal normal-case tracking-normal">(optional)</span>
        </label>
        <textarea
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="e.g. Looking for breakout confirmation on BTC..."
          rows={2}
          className="w-full px-3.5 py-2.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] text-[13px] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent-light)] transition-all resize-none"
        />
      </div>

      {/* CTA -> redirect to #reg-form */}
      <a
        href="/#reg-form"
        className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold text-sm transition-all shadow-md shadow-[var(--accent)]/25"
      >
        <HiCamera className="w-4 h-4" /> Capture & Analyze
      </a>
      <p className="text-center text-[11px] text-[var(--text-muted)] mt-2">
        Register to capture and analyze charts with AI
      </p>
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
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl lg:text-3xl font-semibold text-[var(--text)] tracking-tight mb-2">
            AI Chart Analysis
          </h1>
          <p className="text-[var(--text-secondary)] text-sm max-w-2xl mx-auto">
            Upload a chart image — AI detects patterns, trend and suggests Entry / SL / TP
          </p>
          <a href="/#reg-form" className="inline-flex items-center gap-1 mt-2 text-[13px] text-[var(--accent)] hover:underline font-medium">
            <HiQuestionMarkCircle className="w-4 h-4" /> How to use
          </a>
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <TabButton active={tab === 'upload'} onClick={() => setTab('upload')}>
            <HiUpload className="w-4 h-4 inline mr-1.5" /> Upload Image
          </TabButton>
          <TabButton active={tab === 'live'} onClick={() => setTab('live')}>
            <HiCamera className="w-4 h-4 inline mr-1.5" /> Live Chart
          </TabButton>
        </div>

        {/* Tab Content */}
        <div className="max-w-2xl mx-auto">
          {tab === 'upload' ? <UploadTab /> : <LiveChartTab />}
        </div>

        {/* Results placeholder */}
        <div className="max-w-2xl mx-auto mt-8 p-6 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-center">
          <p className="text-[var(--text-muted)] text-[13px]">---</p>
          <p className="text-[12px] text-[var(--text-muted)] mt-1">
            Analysis results will appear here. <a href="/#reg-form" className="text-[var(--accent)] hover:underline font-medium">Register to get started →</a>
          </p>
        </div>
      </div>
    </div>
  );
}
