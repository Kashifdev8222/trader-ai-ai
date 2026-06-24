import { useEffect, useRef, useState } from 'react';

const SYMBOLS = [
  {s:'NASDAQ:AAPL',n:'Apple'},{s:'NASDAQ:MSFT',n:'Microsoft'},{s:'NASDAQ:GOOGL',n:'Alphabet'},
  {s:'NASDAQ:TSLA',n:'Tesla'},{s:'NASDAQ:NVDA',n:'NVIDIA'},{s:'NASDAQ:AMZN',n:'Amazon'},
];

export default function TradingChart() {
  const container = useRef(null);
  const [symbol, setSymbol] = useState('NASDAQ:AAPL');
  const [loaded, setLoaded] = useState(false);
  const id = 'tv-chart-main';

  useEffect(() => {
    if (loaded) return;
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      try {
        new window.TradingView.widget({
          container_id: id, symbol, interval: '60', theme: 'dark',
          style: '1', locale: 'en', toolbar_bg: '#131620',
          enable_publishing: false, hide_side_toolbar: true,
          allow_symbol_change: false, width: '100%', height: 450,
          studies: ['MASimple@tv-basicstudies'],
        });
        setLoaded(true);
      } catch(e) { console.log('TV load error:', e); }
    };
    document.head.appendChild(script);
    return () => { if(script.parentNode) script.parentNode.removeChild(script); };
  }, []);

  return (
    <div className="rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--bg-card)]">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border)] overflow-x-auto">
        {SYMBOLS.map(s=>(
          <button key={s.s} onClick={()=>{setSymbol(s.s);setLoaded(false);}} className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${symbol===s.s?'bg-[var(--accent)] text-white':'text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg)]'}`}>{s.n}</button>
        ))}
      </div>
      <div id={id} ref={container} className="w-full" style={{minHeight:450}} />
    </div>
  );
}
