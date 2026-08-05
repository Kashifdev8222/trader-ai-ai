import { useState, useEffect, useRef } from 'react';
import {
  HiArrowRight, HiUpload, HiPhotograph, HiClipboardCopy,
  HiLightBulb, HiQuestionMarkCircle, HiCamera, HiChip,
  HiStar, HiSparkles, HiCheck, HiX, HiSearch, HiCurrencyDollar,
} from 'react-icons/hi';

/* ============================================================
   DATA
   ============================================================ */
const PERSONAS = [
  'General Analyst', 'Scalping Expert', 'Swing Trader',
  'Day Trader', 'Position Trader', 'Crypto Specialist',
  'Forex Expert', 'Stock Analyst', 'Pattern Scout', 'Trend Follower',
];
const MARKET_OPTS = ['Any Market', 'Crypto', 'Forex', 'Stocks', 'Commodities', 'Indices'];
const TF_OPTS = ['Any Timeframe', '1m', '5m', '15m', '30m', '1H', '4H', '1D', '1W', '1M'];
const PLATFORMS = ['TradingView', 'MT4', 'MT5', 'Binance', 'Bybit'];

const CHART_DATA = {
  Crypto: [
    { s: 'BINANCE:BTCUSDT', n: 'BTC/USDT', p: '62,450.80', ch: '+2.34' },
    { s: 'BINANCE:ETHUSDT', n: 'ETH/USDT', p: '3,120.45', ch: '+1.87' },
    { s: 'BINANCE:BNBUSDT', n: 'BNB/USDT', p: '582.30', ch: '-0.42' },
    { s: 'BINANCE:SOLUSDT', n: 'SOL/USDT', p: '142.65', ch: '+5.21' },
  ],
  Forex: [
    { s: 'FX:EURUSD', n: 'EUR/USD', p: '1.0845', ch: '+0.12' },
    { s: 'FX:GBPUSD', n: 'GBP/USD', p: '1.2630', ch: '-0.08' },
    { s: 'FX:USDJPY', n: 'USD/JPY', p: '151.42', ch: '+0.34' },
    { s: 'FX:AUDUSD', n: 'AUD/USD', p: '0.6580', ch: '-0.15' },
  ],
  Stocks: [
    { s: 'NASDAQ:AAPL', n: 'Apple', p: '187.32', ch: '+0.87' },
    { s: 'NASDAQ:MSFT', n: 'Microsoft', p: '415.80', ch: '-0.34' },
    { s: 'NASDAQ:GOOGL', n: 'Alphabet', p: '142.56', ch: '+1.23' },
    { s: 'NASDAQ:TSLA', n: 'Tesla', p: '248.90', ch: '-2.15' },
  ],
};

/* ============================================================
   TV LOADER
   ============================================================ */
function useTV(containerId, symbol) {
  useEffect(() => {
    const load = () => {
      if (window.TradingView) {
        try {
          new window.TradingView.widget({
            container_id: containerId, symbol, interval: '60', theme: 'dark',
            style: '1', locale: 'en', toolbar_bg: '#131620',
            enable_publishing: false, hide_side_toolbar: true, hide_top_toolbar: true,
            allow_symbol_change: false, width: '100%', height: 380,
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
  }, []);
}

/* ============================================================
   SHARED COMPONENTS
   ============================================================ */
function SelectField({ label, value, onChange, options, optional }) {
  return (
    <div>
      <label className="block text-[12px] font-semibold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wide">
        {label}{optional && <span className="text-[var(--text-muted)] font-normal normal-case tracking-normal ml-1">(optional)</span>}
      </label>
      <select value={value} onChange={e => onChange(e.target.value)}
        className="w-full px-3.5 py-2.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] text-[13px] focus:outline-none focus:border-[var(--accent)]/50 focus:ring-1 focus:ring-[var(--accent-light)] transition-all appearance-none cursor-pointer">
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

/* ============================================================
   UPLOAD TAB
   ============================================================ */
function UploadTab() {
  const [file, setFile] = useState(null);
  const [drag, setDrag] = useState(false);
  const [pasted, setPasted] = useState(false);
  const [persona, setPersona] = useState(PERSONAS[0]);
  const [market, setMarket] = useState(MARKET_OPTS[0]);
  const [tf, setTf] = useState(TF_OPTS[0]);
  const [mode, setMode] = useState('spot');
  const [ctx, setCtx] = useState('');
  const inp = useRef(null);

  const accept = (f) => { if (f?.type?.startsWith('image/')) { setFile(f); setPasted(false); } };

  useEffect(() => {
    const h = (e) => {
      const f = e.clipboardData?.items?.[0]?.getAsFile?.();
      if (f?.type?.startsWith('image/')) { accept(f); setPasted(true); }
    };
    document.addEventListener('paste', h);
    return () => document.removeEventListener('paste', h);
  }, []);

  return (
    <div className="grid lg:grid-cols-[1fr_380px] gap-8">
      {/* ── LEFT: Dropzone ── */}
      <div>
        {/* Platforms */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="text-[11px] text-[var(--text-muted)] font-medium">Supported:</span>
          {PLATFORMS.map(p => (
            <span key={p} className="px-2.5 py-1 rounded-md bg-[var(--bg)] border border-[var(--border)] text-[12px] text-[var(--text-secondary)] font-medium">{p}</span>
          ))}
        </div>

        {/* Free tier */}
        <div className="flex items-start gap-2.5 p-3.5 rounded-lg bg-[var(--accent-light)] border border-[var(--accent)]/20 mb-4">
          <HiLightBulb className="w-4 h-4 text-[var(--accent)] flex-shrink-0 mt-0.5"/>
          <p className="text-[13px] text-[var(--text)] leading-relaxed">
            1 free chart analysis/day.{' '}
            <a href="/#reg-form" className="text-[var(--accent)] font-semibold hover:underline whitespace-nowrap">Upgrade to Pro for more →</a>
          </p>
        </div>

        {/* Dropzone */}
        <div
          onDragOver={e => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={e => { e.preventDefault(); setDrag(false); accept(e.dataTransfer.files[0]); }}
          onClick={() => inp.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
            drag ? 'border-[var(--accent)] bg-[var(--accent-light)] scale-[1.01]' : 'border-[var(--border)] hover:border-[var(--accent)]/40 hover:bg-[var(--bg-overlay)]'
          }`}
        >
          <input ref={inp} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={e => accept(e.target.files[0])}/>
          {file ? (
            <div>
              <img src={URL.createObjectURL(file)} alt="" className="max-h-64 mx-auto rounded-xl mb-4 shadow-lg"/>
              <p className="text-[14px] font-semibold text-[var(--text)]">{file.name}</p>
              <p className="text-[12px] text-[var(--text-muted)] mt-0.5">{(file.size / 1024).toFixed(1)} KB</p>
              <button type="button" onClick={e => { e.stopPropagation(); setFile(null); }}
                className="mt-3 text-[12px] text-[var(--accent)] hover:underline font-medium inline-flex items-center gap-1">
                <HiX className="w-3.5 h-3.5"/> Remove & choose another
              </button>
            </div>
          ) : (
            <div>
              <div className="w-16 h-16 rounded-2xl bg-[var(--accent-light)] flex items-center justify-center mx-auto mb-4">
                <HiUpload className="w-8 h-8 text-[var(--accent)]"/>
              </div>
              <p className="text-[16px] font-semibold text-[var(--text)] mb-1">Drop chart image here</p>
              <p className="text-[13px] text-[var(--text-muted)] mb-5">PNG, JPG, WebP up to 10MB</p>
              <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-[13px] font-semibold transition-all shadow-sm shadow-[var(--accent)]/25">
                <HiPhotograph className="w-4 h-4"/> Browse Files
              </span>
            </div>
          )}
        </div>

        {/* Paste hint */}
        {pasted ? (
          <p className="text-center text-[12px] text-[var(--green)] mt-3 flex items-center justify-center gap-1.5 font-medium">
            <HiCheck className="w-4 h-4"/> Image pasted from clipboard!
          </p>
        ) : (
          <p className="text-center text-[12px] text-[var(--text-muted)] mt-3">
            or press <kbd className="px-1.5 py-0.5 rounded-md bg-[var(--bg)] border border-[var(--border)] text-[var(--text-secondary)] text-[11px] font-medium mx-0.5">Ctrl+V</kbd> to paste from clipboard
          </p>
        )}
      </div>

      {/* ── RIGHT: Config Panel ── */}
      <div className="rounded-xl bg-[var(--bg-card)] border border-[var(--border)] p-5 space-y-4">
        <SelectField label="Select AI Persona" value={persona} onChange={setPersona} options={PERSONAS}/>
        <div className="grid grid-cols-2 gap-3">
          <SelectField label="Market" value={market} onChange={setMarket} options={MARKET_OPTS}/>
          <SelectField label="Timeframe" value={tf} onChange={setTf} options={TF_OPTS}/>
        </div>

        {/* Trading mode */}
        <div>
          <label className="block text-[12px] font-semibold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wide">Trading mode</label>
          <div className="grid grid-cols-2 gap-2">
            {[{ v: 'spot', l: 'Spot' }, { v: 'leverage', l: 'Leverage / Futures' }].map(o => (
              <button key={o.v} type="button" onClick={() => setMode(o.v)}
                className={`py-2.5 text-[13px] font-semibold rounded-lg transition-all ${
                  mode === o.v ? 'bg-[var(--accent)] text-white shadow-sm' : 'bg-[var(--bg)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text)] hover:border-[var(--border-strong)]'
                }`}>
                {o.v === 'leverage' && <HiSparkles className="w-3.5 h-3.5 inline mr-1"/>}{o.l}
              </button>
            ))}
          </div>
        </div>

        {/* Context */}
        <div>
          <label className="block text-[12px] font-semibold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wide">
            Your Intent / Context <span className="text-[var(--text-muted)] font-normal normal-case tracking-normal">(optional)</span>
          </label>
          <textarea value={ctx} onChange={e => setCtx(e.target.value)}
            placeholder="e.g. I think this is a bullish pennant on BTC 4H — confirm entry?"
            rows={3}
            className="w-full px-3.5 py-2.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] text-[13px] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]/50 focus:ring-1 focus:ring-[var(--accent-light)] transition-all resize-none"/>
          <p className="text-[11px] text-[var(--text-muted)] mt-1.5">Adding context helps AI give more targeted, personalized analysis</p>
        </div>

        {/* CTA */}
        <a href="/#reg-form"
          className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold text-sm transition-all shadow-md shadow-[var(--accent)]/25 hover:shadow-lg hover:shadow-[var(--accent)]/40">
          <HiChip className="w-4 h-4"/> Analyze Chart <HiArrowRight className="w-4 h-4"/>
        </a>
      </div>
    </div>
  );
}

/* ============================================================
   LIVE CHART TAB
   ============================================================ */
function LiveChartTab() {
  const [mkt, setMkt] = useState('Crypto');
  const [sym, setSym] = useState('BINANCE:BTCUSDT');
  const [persona, setPersona] = useState(PERSONAS[0]);
  const [mode, setMode] = useState('spot');
  const [ctx, setCtx] = useState('');
  const tvId = useRef(`tvac-${Math.random().toString(36).slice(2,8)}`);
  useTV(tvId.current, sym);

  const symbols = CHART_DATA[mkt] || [];
  const active = symbols.find(x => x.s === sym) || symbols[0];
  const up = (active?.ch || '').startsWith('+');

  return (
    <div className="grid lg:grid-cols-[1fr_380px] gap-8">
      {/* ── LEFT: Chart Area ── */}
      <div>
        {/* How it works hint */}
        <div className="flex items-start gap-2.5 p-3.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] mb-4">
          <HiQuestionMarkCircle className="w-4 h-4 text-[var(--accent)] flex-shrink-0 mt-0.5"/>
          <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
            How the live chart works — select a market & symbol below, configure AI settings on the right, then capture & analyze.
          </p>
        </div>

        {/* Market chips */}
        <div className="flex items-center gap-2 mb-4">
          {Object.keys(CHART_DATA).map(k => (
            <button key={k} onClick={() => { setMkt(k); setSym(CHART_DATA[k][0].s); }}
              className={`px-5 py-2.5 text-[13px] font-semibold rounded-lg transition-all ${
                mkt === k ? 'bg-[var(--accent)] text-white shadow-sm shadow-[var(--accent)]/25' : 'text-[var(--text-secondary)] hover:text-[var(--text)] bg-[var(--bg)] border border-[var(--border)]'
              }`}>{k}</button>
          ))}
        </div>

        {/* Symbol cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          {symbols.map(p => {
            const isUp = (p.ch || '').startsWith('+');
            return (
              <button key={p.s} onClick={() => setSym(p.s)}
                className={`text-left p-3 rounded-lg border transition-all ${
                  sym === p.s
                    ? 'bg-[var(--accent-light)] border-[var(--accent)]/40 shadow-sm'
                    : 'bg-[var(--bg-card)] border-[var(--border)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-elevated)]'
                }`}>
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <span className={`text-[12px] font-bold ${sym === p.s ? 'text-[var(--accent)]' : 'text-[var(--text)]'}`}>{p.n}</span>
                  <span className={`text-[11px] font-semibold ${isUp ? 'text-[var(--green)]' : 'text-[var(--red)]'}`}>{p.ch}%</span>
                </div>
                <div className={`text-[13px] font-semibold ${sym === p.s ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)]'}`}>${p.p}</div>
              </button>
            );
          })}
        </div>

        {/* Chart */}
        <div className="rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--bg-card)] shadow-[var(--shadow-sm)]">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--border)] bg-[var(--bg-alt)]">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--green)] animate-pulse"/>
              <span className="text-[12px] font-bold text-[var(--text)]">{active?.n || 'BTC/USDT'}</span>
              <span className="text-[10px] text-[var(--text-muted)] bg-[var(--bg)] border border-[var(--border)] px-1.5 py-0.5 rounded">{mkt}</span>
            </div>
            {active && (
              <div className="text-right">
                <span className="text-[13px] font-bold text-[var(--text)] tabular-nums">${active.p}</span>
                <span className={`ml-2 text-[11px] font-semibold ${up ? 'text-[var(--green)]' : 'text-[var(--red)]'}`}>{up ? '▲' : '▼'} {active.ch}%</span>
              </div>
            )}
          </div>
          <div id={tvId.current} style={{ minHeight: 380 }}/>
        </div>

        <p className="text-center text-[12px] text-[var(--text-muted)] mt-3">
          We screenshot the live chart and send it to the AI — same as uploading an image.
        </p>
      </div>

      {/* ── RIGHT: Config Panel ── */}
      <div className="rounded-xl bg-[var(--bg-card)] border border-[var(--border)] p-5 space-y-4">
        <SelectField label="Select AI Persona" value={persona} onChange={setPersona} options={PERSONAS}/>

        <div>
          <label className="block text-[12px] font-semibold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wide">Trading mode</label>
          <div className="grid grid-cols-2 gap-2">
            {[{ v: 'spot', l: 'Spot' }, { v: 'leverage', l: 'Leverage / Futures' }].map(o => (
              <button key={o.v} type="button" onClick={() => setMode(o.v)}
                className={`py-2.5 text-[13px] font-semibold rounded-lg transition-all ${
                  mode === o.v ? 'bg-[var(--accent)] text-white shadow-sm' : 'bg-[var(--bg)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text)] hover:border-[var(--border-strong)]'
                }`}>
                {o.v === 'leverage' && <HiSparkles className="w-3.5 h-3.5 inline mr-1"/>}{o.l}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[12px] font-semibold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wide">
            Your Intent / Context <span className="text-[var(--text-muted)] font-normal normal-case tracking-normal">(optional)</span>
          </label>
          <textarea value={ctx} onChange={e => setCtx(e.target.value)}
            placeholder="e.g. Looking for breakout confirmation on BTC 4H…"
            rows={2}
            className="w-full px-3.5 py-2.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] text-[13px] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]/50 focus:ring-1 focus:ring-[var(--accent-light)] transition-all resize-none"/>
          <p className="text-[11px] text-[var(--text-muted)] mt-1.5">Adding context helps AI give more targeted, personalized analysis</p>
        </div>

        <a href="/#reg-form"
          className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold text-sm transition-all shadow-md shadow-[var(--accent)]/25 hover:shadow-lg hover:shadow-[var(--accent)]/40">
          <HiCamera className="w-4 h-4"/> Capture & Analyze <HiArrowRight className="w-4 h-4"/>
        </a>
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
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="pt-24 pb-16 max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── HERO ── */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--accent-light)] border border-[var(--accent)]/20 text-[var(--accent)] text-[11px] font-semibold uppercase tracking-wider mb-4">
            <HiSparkles className="w-3.5 h-3.5"/> AI-Powered Chart Analysis
          </div>
          <h1 className="text-[28px] sm:text-[32px] lg:text-[36px] font-bold text-[var(--text)] tracking-[-0.01em] mb-3">
            AI Chart Analysis
          </h1>
          <p className="text-[15px] text-[var(--text-secondary)] max-w-xl mx-auto leading-relaxed mb-3">
            Upload a chart image — AI detects patterns, trend and suggests Entry / SL / TP
          </p>
          <div className="flex items-center justify-center gap-4 text-[13px] text-[var(--text-muted)]">
            <span className="flex items-center gap-1.5"><HiStar className="w-4 h-4 text-amber-400"/> 4.8/5 accuracy</span>
            <span className="w-1 h-1 rounded-full bg-[var(--border)]"/>
            <span>1 free analysis/day</span>
            <span className="w-1 h-1 rounded-full bg-[var(--border)]"/>
            <a href="/#reg-form" className="text-[var(--accent)] font-medium hover:underline">How to use</a>
          </div>
        </div>

        {/* ── TABS ── */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1 rounded-xl bg-[var(--bg-card)] border border-[var(--border)]">
            {[
              { k: 'upload', icon: HiUpload, l: 'Upload image' },
              { k: 'live', icon: HiCamera, l: 'Live chart' },
            ].map(t => (
              <button key={t.k} onClick={() => setTab(t.k)}
                className={`flex items-center gap-2 px-6 py-2.5 text-[13px] font-semibold rounded-lg transition-all ${
                  tab === t.k ? 'bg-[var(--accent)] text-white shadow-sm shadow-[var(--accent)]/25' : 'text-[var(--text-secondary)] hover:text-[var(--text)]'
                }`}>
                <t.icon className="w-4 h-4"/>{t.l}
              </button>
            ))}
          </div>
        </div>

        {/* ── TAB CONTENT ── */}
        {tab === 'upload' ? <UploadTab/> : <LiveChartTab/>}

        {/* ── RESULTS PLACEHOLDER ── */}
        <div className="mt-8">
          <div className="rounded-xl bg-[var(--bg-card)] border border-[var(--border)] p-8 text-center">
            <div className="w-12 h-12 rounded-xl bg-[var(--bg)] border border-[var(--border)] flex items-center justify-center mx-auto mb-3">
              <HiSearch className="w-6 h-6 text-[var(--text-muted)]"/>
            </div>
            <p className="text-[14px] font-semibold text-[var(--text)] mb-1">No analysis results yet</p>
            <p className="text-[13px] text-[var(--text-muted)] leading-relaxed max-w-md mx-auto">
              Upload a chart image or capture a live chart above, then run AI analysis.{' '}
              <a href="/#reg-form" className="text-[var(--accent)] font-medium hover:underline whitespace-nowrap">Register to get started →</a>
            </p>
          </div>
        </div>

        {/* ── FEATURE CARDS ── */}
        <div className="mt-10 grid sm:grid-cols-3 gap-4">
          {[
            { icon: HiChip, t: 'AI Pattern Detection', d: 'Our AI automatically identifies chart patterns — triangles, wedges, head & shoulders, flags, and more.' },
            { icon: HiCurrencyDollar, t: 'Entry / SL / TP Suggestions', d: 'Get precise Entry, Stop Loss, and Take Profit levels based on technical analysis and market structure.' },
            { icon: HiLightBulb, t: 'Multi-Timeframe Analysis', d: 'AI analyzes multiple timeframes simultaneously to confirm trend direction and strength.' },
          ].map((f, i) => (
            <div key={i} className="p-5 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--accent)]/20 hover:shadow-[var(--shadow-md)] transition-all group">
              <div className="w-10 h-10 rounded-lg bg-[var(--accent-light)] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <f.icon className="w-5 h-5 text-[var(--accent)]"/>
              </div>
              <h3 className="text-[14px] font-semibold text-[var(--text)] mb-1.5">{f.t}</h3>
              <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">{f.d}</p>
            </div>
          ))}
        </div>

        {/* ── PRO TIP CTA ── */}
        <div className="mt-8">
          <div className="rounded-xl bg-[var(--accent-light)] border border-[var(--accent)]/20 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-[var(--accent)] flex items-center justify-center flex-shrink-0">
              <HiSparkles className="w-5 h-5 text-white"/>
            </div>
            <div className="flex-1">
              <p className="text-[14px] font-semibold text-[var(--text)] mb-1">Ready to unlock AI-powered chart analysis?</p>
              <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
                Register your free account — AI detects chart patterns, identifies trend direction, and auto-suggests optimal Entry, Stop Loss & Take Profit levels based on real technical analysis.
              </p>
            </div>
            <a href="/#reg-form"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-[13px] font-semibold transition-all shadow-sm shadow-[var(--accent)]/25 whitespace-nowrap flex-shrink-0">
              Create Free Account <HiArrowRight className="w-4 h-4"/>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
