import { useState, useEffect, useRef } from 'react';

export default function LiveStats() {
  const [stats, setStats] = useState([
    {v:'---',l:'S&P 500'},{v:'---',l:'NASDAQ'},{v:'---',l:'BTC/USD'},{v:'---',l:'EUR/USD'}
  ]);
  const timer = useRef(null);

  const fetchData = () => {
    const symbols = [
      {k:'SPY',n:'S&P 500'},{k:'QQQ',n:'NASDAQ'},
      {k:'BINANCE:BTCUSDT',n:'BTC/USD'},{k:'OANDA:EUR_USD',n:'EUR/USD'}
    ];
    Promise.all(symbols.map(s=>fetch(`https://finnhub.io/api/v1/quote?symbol=${s.k}&token=d8shhd1r01qq7apvngggd8shhd1r01qq7apvngh0`).then(r=>r.json()).then(d=>({v:d.c||0,dp:d.dp||0,l:s.n})).catch(()=>({v:0,l:s.n}))))
      .then(r=>setStats(r.map(s=>({
        v:s.k?.includes('BTC')||s.l==='EUR/USD'?'$'+parseFloat(s.v).toLocaleString():'$'+parseFloat(s.v).toFixed(0),
        l:s.l,dp:s.dp
      }))));
  };
  useEffect(()=>{fetchData();timer.current=setInterval(fetchData,1000);return()=>clearInterval(timer.current);},[]);

  return (
    <section className="relative border-y border-[var(--border)] bg-[var(--bg-alt)]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <div className="flex flex-wrap justify-center gap-14 sm:gap-20 lg:gap-32">
          {stats.map((s,i)=>(
            <div key={i} className="flex items-center gap-4">
              <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${s.dp>=0?'bg-green-400/10 text-green-400':'bg-red-400/10 text-red-400'}`}>
                <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={s.dp>=0?'M5 10l7-7m0 0l7 7m-7-7v18':'M19 14l-7 7m0 0l-7-7m7 7V3'}/></svg>
              </div>
              <div>
                <div className="text-[1.2rem] sm:text-[1.4rem] lg:text-[1.6rem] font-bold text-[var(--text)] tracking-[-0.01em]">{s.v}</div>
                <div className="text-[11px] sm:text-[12px] text-[var(--text-muted)]">{s.l}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
