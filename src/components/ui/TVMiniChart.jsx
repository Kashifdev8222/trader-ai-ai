import { useEffect } from 'react';

let tvReady = null;
function ensureTV() {
  if (tvReady) return tvReady;
  tvReady = new Promise((resolve) => {
    if (window.TradingView) return resolve();
    if (!document.getElementById('tv-script')) {
      const s = document.createElement('script');
      s.id = 'tv-script';
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

export default function TVMiniChart({ symbol = 'SPY', title = '' }) {
  const id = `tv-mini-${symbol.replace(':','-').replace(/[^a-zA-Z0-9]/g,'')}`;

  useEffect(() => {
    ensureTV().then(() => {
      try {
        new window.TradingView.widget({
          container_id: id, symbol, interval: 'D', theme: 'dark',
          style: '1', locale: 'en', width: '100%', height: 250,
          toolbar_bg: '#131620', enable_publishing: false,
          hide_top_toolbar: true, hide_side_toolbar: true,
          allow_symbol_change: false,
        });
      } catch(e) {}
    });
  }, [symbol]);

  return (
    <div className="rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--bg-card)]">
      {title && <div className="px-4 py-2 border-b border-[var(--border)] text-xs font-semibold text-[var(--text)]">{title}</div>}
      <div id={id} className="w-full" style={{minHeight:250}} />
    </div>
  );
}
