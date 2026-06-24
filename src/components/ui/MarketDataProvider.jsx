import { createContext, useContext, useState, useEffect } from 'react';

const TOKEN = 'd8shhd1r01qq7apvngggd8shhd1r01qq7apvngh0';
const SYMBOLS = ['AAPL','MSFT','SPY','QQQ','BINANCE:BTCUSDT','BINANCE:ETHUSDT'];
const CACHE_KEY = 'fn_quotes';
const CACHE_TIME = 60000; // 60 seconds
const MarketContext = createContext({});
export function useMarketData() { return useContext(MarketContext); }

export default function MarketDataProvider({ children }) {
  const [quotes, setQuotes] = useState(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) { const d = JSON.parse(cached); if (Date.now() - d.ts < CACHE_TIME) return d.data; }
    } catch(e) {}
    return {};
  });

  useEffect(() => {
    let mounted = true;
    const fetchAll = async () => {
      // Check if cache is still fresh
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) { const d = JSON.parse(cached); if (Date.now() - d.ts < CACHE_TIME) return; }
      } catch(e) {}

      for (const s of SYMBOLS) {
        if (!mounted) return;
        try {
          const r = await fetch(`https://finnhub.io/api/v1/quote?symbol=${s}&token=${TOKEN}`);
          if (!r.ok) continue;
          const d = await r.clone().json();
          if (!mounted) return;
          if (d && d.c !== undefined) {
            setQuotes(prev => {
              const next = { ...prev, [s]: { c: d.c, dp: d.dp, h: d.h, l: d.l, o: d.o } };
              localStorage.setItem(CACHE_KEY, JSON.stringify({ data: next, ts: Date.now() }));
              return next;
            });
          }
        } catch(e) {}
        await new Promise(r => setTimeout(r, 1000));
      }
    };
    fetchAll();
    const timer = setInterval(fetchAll, 120000); // 2 minutes
    return () => { mounted = false; clearInterval(timer); };
  }, []);

  return <MarketContext.Provider value={quotes}>{children}</MarketContext.Provider>;
}
