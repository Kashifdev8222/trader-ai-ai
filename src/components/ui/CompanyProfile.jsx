import { useState, useEffect, useRef } from 'react';
import { finnhubFetch } from '../../lib/finnhub';

const SYMBOLS = ['AAPL','MSFT','GOOGL','TSLA','NVDA','AMZN'];

export default function CompanyProfile() {
  const [profiles, setProfiles] = useState({});
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;

    const fetchAll = async () => {
      for (const s of SYMBOLS) {
        if (!mounted.current) return;
        try {
          const d = await finnhubFetch('stock/profile2', s);
          if (!mounted.current) return;
          if (d && d.name) {
            setProfiles(prev => ({ ...prev, [s]: { n: d.name, logo: d.logo, mktCap: d.marketCapitalization, industry: d.finnhubIndustry } }));
          }
        } catch (e) { /* skip */ }
      }
    };
    fetchAll();

    return () => { mounted.current = false; };
  }, []);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {SYMBOLS.map(s=>{
        const p = profiles[s];
        return (
          <div key={s} className="p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-center hover:border-[var(--border-strong)] transition-all">
            {p?.logo ? <img src={p.logo} alt={p.n} className="w-8 h-8 mx-auto mb-2 rounded-full" /> : <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-[var(--accent)]/10 flex items-center justify-center text-xs font-bold text-[var(--accent)]">{s}</div>}
            <div className="text-xs font-semibold text-[var(--text)] truncate">{p?.n||s}</div>
            <div className="text-[10px] text-[var(--text-muted)] mt-0.5">{p?.industry||'---'}</div>
            {p?.mktCap && <div className="text-[10px] text-green-400 mt-0.5">${(p.mktCap/1000).toFixed(1)}T</div>}
          </div>
        );
      })}
    </div>
  );
}
