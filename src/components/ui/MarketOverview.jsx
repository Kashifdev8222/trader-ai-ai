import { useMarketData } from './MarketDataProvider';

const INDICES = ['SPY','QQQ']; // Finnhub rate-limited, reduced set
const NAMES = { SPY:'S&P 500', QQQ:'NASDAQ 100', DIA:'Dow Jones', IWM:'Russell 2000', VXX:'VIX' };

export default function MarketOverview() {
  const quotes = useMarketData();

  return (
    <section className="border-b border-[var(--border)] bg-[var(--bg)]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-2 mb-4"><div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"/><h3 className="text-sm font-semibold text-[var(--text)]">Market Overview</h3></div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {INDICES.map(s => {
            const d = quotes[s];
            if (!d) return <div key={s} className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border)]"><div className="text-xs text-[var(--text-muted)] mb-1">{NAMES[s]}</div><div className="text-xl font-bold text-[var(--text)]">---</div></div>;
            return (
              <div key={s} className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border)]">
                <div className="text-xs text-[var(--text-muted)] mb-1">{NAMES[s]}</div>
                <div className="text-xl font-bold text-[var(--text)]">${d.c?.toFixed(2)}</div>
                <div className={`text-sm font-semibold mt-1 ${d.dp>=0?'text-green-400':'text-red-400'}`}>{d.dp>=0?'▲':'▼'} {Math.abs(d.dp||0).toFixed(2)}%</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
