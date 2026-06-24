import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { finnhubFetch } from '../../lib/finnhub';

const SYMBOLS = [
  // US Stocks
  'AAPL','MSFT',
  // Indices
  'SPY','QQQ','DIA','IWM',
  // Crypto
  'BINANCE:BTCUSDT','BINANCE:ETHUSDT','BINANCE:BNBUSDT','BINANCE:SOLUSDT','BINANCE:XRPUSDT',
];
const POLL_MS = 120000; // 2 minutes
const MarketContext = createContext({});
export function useMarketData() { return useContext(MarketContext); }

export default function MarketDataProvider({ children }) {
  const [quotes, setQuotes] = useState({});
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    let timer;

    const fetchAll = async () => {
      for (const s of SYMBOLS) {
        if (!mounted.current) return;
        try {
          const d = await finnhubFetch('quote', s);
          if (!mounted.current) return;
          if (d && d.c !== undefined) {
            setQuotes(prev => ({ ...prev, [s]: { c: d.c, dp: d.dp, h: d.h, l: d.l, o: d.o } }));
          }
        } catch (e) { /* skip failed symbol */ }
      }
    };

    // initial fetch
    fetchAll().then(() => {
      if (mounted.current) timer = setInterval(fetchAll, POLL_MS);
    });

    return () => { mounted.current = false; if (timer) clearInterval(timer); };
  }, []);

  return <MarketContext.Provider value={quotes}>{children}</MarketContext.Provider>;
}
