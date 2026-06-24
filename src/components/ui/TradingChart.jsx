import { useState, useEffect } from 'react';

const SYMBOLS = [
  {s:'NASDAQ:AAPL',n:'Apple'},{s:'NASDAQ:MSFT',n:'Microsoft'},{s:'NASDAQ:GOOGL',n:'Alphabet'},
  {s:'NASDAQ:TSLA',n:'Tesla'},{s:'NASDAQ:NVDA',n:'NVIDIA'},{s:'NASDAQ:AMZN',n:'Amazon'},
];

let tvReady = null;
function ensureTV() {
  if (tvReady) return tvReady;
  tvReady = new Promise((resolve) => {
    if (window.TradingView) return resolve();
    if (!document.getElementById('tv-script')) {
      const s = document.createElement('script');
      s.id = 'tv-script'; s.src = 'https://s3.tradingview.com/tv.js'; s.async = true;
      s.onload = resolve;
      document.head.appendChild(s);
    } else {
      const check = setInterval(() => { if (window.TradingView) { clearInterval(check); resolve(); } }, 200);
    }
  });
  return tvReady;
}

export default function TradingChart() {
  const [symbol, setSymbol] = useState('NASDAQ:AAPL');
  const id = `tv-chart-${symbol.replace(':','-').replace(/[^a-zA-Z0-9]/g,'')}`;

  useEffect(() => {
    ensureTV().then(() => {
      try {
        new window.TradingView.widget({
          container_id: id, symbol, interval: '60', theme: 'dark',
          style: '1', locale: 'en', toolbar_bg: '#131620',
          enable_publishing: false, hide_side_toolbar: true,
          allow_symbol_change: false, studies: ['MASimple@tv-basicstudies'],
          width: '100%', height: 450,
        });
      } catch(e) {}
    });
  }, [symbol]);

  return (
    <div className="rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--bg-card)]">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border)] overflow-x-auto">
        {SYMBOLS.map(s=>(
          <button key={s.s} onClick={()=>setSymbol(s.s)}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
            symbol===s.s?'bg-[var(--accent)] text-white shadow-sm':'text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg)] border border-[var(--border)]'}`}>{s.n}</button>
        ))}
      </div>
      <div id={id} className="w-full" style={{minHeight:450}} />
    </div>
  );
}
