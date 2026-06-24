import { useState, useEffect, useRef } from 'react';

const PAIRS = [
  {s:'OANDA:EUR_USD',n:'EUR/USD'},{s:'OANDA:GBP_USD',n:'GBP/USD'},
  {s:'OANDA:USD_JPY',n:'USD/JPY'},{s:'OANDA:AUD_USD',n:'AUD/USD'},
  {s:'OANDA:USD_CAD',n:'USD/CAD'},{s:'OANDA:USD_CHF',n:'USD/CHF'},
];

export default function ForexRates() {
  const [data, setData] = useState([]);
  const timer = useRef(null);

  const fetchData = () => {
    Promise.all(PAIRS.map(({s}) => fetch(`https://finnhub.io/api/v1/quote?symbol=${s}&token=d8shhd1r01qq7apvngggd8shhd1r01qq7apvngh0`).then(r=>r.json()).then(d=>({s,c:d.c||0,dp:d.dp||0,h:d.h||0,l:d.l||0})).catch(()=>({s,c:0,dp:0}))))
      .then(r => setData(r.map((d,i)=>({...d,n:PAIRS[i].n}))));
  };

  useEffect(()=>{fetchData();timer.current=setInterval(fetchData,1000);return()=>clearInterval(timer.current);},[]);

  return (
    <section className="border-y border-[var(--border)] bg-[var(--bg)]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"/>
          <h3 className="text-sm font-semibold text-[var(--text)]">Forex Rates</h3>
          <span className="text-[10px] text-[var(--text-muted)]">Live</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {data.map((d,i)=>(
            <div key={i} className="p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-center">
              <div className="text-xs font-semibold text-[var(--text)] mb-1">{d.n}</div>
              <div className="text-lg font-bold text-[var(--text)]">{d.c?.toFixed(4)}</div>
              <div className={`text-xs font-semibold mt-1 ${d.dp>=0?'text-green-400':'text-red-400'}`}>{d.dp>=0?'▲':'▼'} {Math.abs(d.dp||0).toFixed(3)}%</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
