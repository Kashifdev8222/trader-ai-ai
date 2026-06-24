import { useState } from 'react';
import { useMarketData } from './MarketDataProvider';

const STOCK_SYMBOLS = ['AAPL','MSFT','SPY','QQQ'];

export default function LiveTicker() {
  const quotes = useMarketData();
  const [active, setActive] = useState('stocks');

  const syms = active === 'stocks' ? STOCK_SYMBOLS : ['BINANCE:BTCUSDT'];
  const data = syms.map(s => ({ s, q: quotes[s] })).filter(d => d.q);

  return (
    <section className="border-y border-[var(--border)] bg-[var(--bg-alt)]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"/>
            <span className="text-xs font-semibold text-[var(--text)]">Live Market</span>
                      </div>
          <div className="flex gap-1">
            <button onClick={()=>setActive('stocks')} className={`px-3 py-1.5 text-[11px] font-semibold rounded-lg ${active==='stocks'?'bg-[var(--accent)] text-white':'bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border)]'}`}>Stocks</button>
            <button onClick={()=>setActive('crypto')} className={`px-3 py-1.5 text-[11px] font-semibold rounded-lg ${active==='crypto'?'bg-[var(--accent)] text-white':'bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border)]'}`}>Crypto</button>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {data.map((d,i)=>(
            <div key={i} className="rounded-xl bg-[var(--bg-card)] border border-[var(--border)] p-3.5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-[var(--text)]">{d.s.replace('BINANCE:','').replace('USDT','')}</span>
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${d.q.dp>=0?'text-green-400 bg-green-400/10':'text-red-400 bg-red-400/10'}`}>{d.q.dp>=0?'+':''}{d.q.dp?.toFixed(2)}%</span>
              </div>
              <div className="text-lg font-bold text-[var(--text)]">${d.q.c?.toFixed(2)}</div>
              <div className="flex gap-3 mt-2 text-[10px]">
                <span className="text-[var(--text-muted)]">H<span className="text-[var(--text-secondary)] ml-0.5">{d.q.h?.toFixed(2)}</span></span>
                <span className="text-[var(--text-muted)]">L<span className="text-[var(--text-secondary)] ml-0.5">{d.q.l?.toFixed(2)}</span></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
