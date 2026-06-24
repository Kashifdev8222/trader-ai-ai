import { useState, useEffect, useRef } from 'react';

const SYMBOLS = ['AAPL','MSFT','GOOGL','TSLA','NVDA','AMZN','META','SPY'];
const CRYPTO = ['BINANCE:BTCUSDT','BINANCE:ETHUSDT','BINANCE:SOLUSDT','BINANCE:BNBUSDT'];

export default function LiveTicker() {
  const [data, setData] = useState([]);
  const [active, setActive] = useState('stocks');
  const timer = useRef(null);
  const fetchData = () => {
    const syms = active==='stocks'?SYMBOLS:CRYPTO;
    Promise.all(syms.map(s=>fetch(`https://finnhub.io/api/v1/quote?symbol=${s}&token=d8shhd1r01qq7apvngggd8shhd1r01qq7apvngh0`).then(r=>r.json()).then(d=>({s,c:d.c||0,dp:d.dp||0,h:d.h||0,l:d.l||0,o:d.o||0})).catch(()=>({s,c:0,dp:0,h:0,l:0,o:0})))) .then(r=>setData(r.map((d,i)=>({...d,n:syms[i]}))));
  };
  useEffect(()=>{fetchData();timer.current=setInterval(fetchData,1000);return()=>clearInterval(timer.current);},[active]);

  const syms = active==='stocks'?SYMBOLS:CRYPTO;
  return (
    <section className="border-y border-[var(--border)] bg-[var(--bg-alt)]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"/><span className="text-xs font-semibold text-[var(--text)]">Live Market</span><span className="text-[10px] text-[var(--text-muted)]">Live</span></div>
          <div className="flex gap-1"><button onClick={()=>setActive('stocks')} className={`px-3 py-1.5 text-[11px] font-semibold rounded-lg ${active==='stocks'?'bg-[var(--accent)] text-white':'bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border)]'}`}>Stocks</button><button onClick={()=>setActive('crypto')} className={`px-3 py-1.5 text-[11px] font-semibold rounded-lg ${active==='crypto'?'bg-[var(--accent)] text-white':'bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border)]'}`}>Crypto</button></div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {data.map((d,i)=>(
            <div key={i} className="rounded-xl bg-[var(--bg-card)] border border-[var(--border)] p-3.5 hover:border-[var(--border-strong)] transition-all">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-[var(--text)]">{d.s.includes(':')?d.s.split(':')[1].replace('USDT',''):syms[i]}</span>
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${d.dp>=0?'text-green-400 bg-green-400/10':'text-red-400 bg-red-400/10'}`}>{d.dp>=0?'+':''}{d.dp?.toFixed(2)}%</span>
              </div>
              <div className="text-lg font-bold text-[var(--text)]">${d.c?.toFixed(2)}</div>
              <div className="flex gap-3 mt-2 text-[10px]">
                <span className="text-[var(--text-muted)]">H<span className="text-[var(--text-secondary)] ml-0.5">{d.h?.toFixed(2)}</span></span>
                <span className="text-[var(--text-muted)]">L<span className="text-[var(--text-secondary)] ml-0.5">{d.l?.toFixed(2)}</span></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
