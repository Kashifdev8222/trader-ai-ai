import { useState, useEffect } from 'react';

const INDICES = [
  {s:'SPY',n:'S&P 500'},{s:'QQQ',n:'NASDAQ 100'},{s:'DIA',n:'Dow Jones'},
  {s:'IWM',n:'Russell 2000'},{s:'VXX',n:'VIX'},
];

export default function MarketOverview() {
  const [indices, setIndices] = useState([]);

  useEffect(() => {
    const fetchData = () => Promise.all(INDICES.map(({s}) => fetch(`https://finnhub.io/api/v1/quote?symbol=${s}&token=d8shhd1r01qq7apvngggd8shhd1r01qq7apvngh0`).then(r=>r.json()).then(d=>({...d,s})).catch(()=>({}))))
      .then(r => setIndices(r.map((d,i)=>({...INDICES[i],c:d.c||0,dp:d.dp||0}))));
    fetchData();
    const t = setInterval(fetchData, 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="border-b border-[var(--border)] bg-[var(--bg)]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h3 className="text-sm font-semibold text-[var(--text)] mb-4">Market Overview</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {indices.map((d,i)=>(
            <div key={i} className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border)]">
              <div className="text-xs text-[var(--text-muted)] mb-1">{d.n}</div>
              <div className="text-xl font-bold text-[var(--text)]">${d.c?.toFixed(2)}</div>
              <div className={`text-sm font-semibold mt-1 ${d.dp>=0?'text-green-400':'text-red-400'}`}>{d.dp>=0?'▲':'▼'} {Math.abs(d.dp||0).toFixed(2)}%</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
