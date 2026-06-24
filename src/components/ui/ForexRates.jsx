import { useMarketData } from './MarketDataProvider';

const PAIRS = ['SPY','QQQ'];
const NAMES = { SPY:'S&P 500', QQQ:'NASDAQ', DIA:'Dow Jones' };

export default function ForexRates() {
  const quotes = useMarketData();

  return (
    <section className="border-y border-[var(--border)] bg-[var(--bg)]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"/>
          <h3 className="text-sm font-semibold text-[var(--text)]">Market Indices</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {PAIRS.map(s => {
            const d = quotes[s];
            if (!d) return null;
            return (
              <div key={s} className="p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-center">
                <div className="text-xs font-semibold text-[var(--text)] mb-1">{NAMES[s]}</div>
                <div className="text-lg font-bold text-[var(--text)]">${d.c?.toFixed(2)}</div>
                <div className={`text-xs font-semibold mt-1 ${d.dp>=0?'text-green-400':'text-red-400'}`}>{d.dp>=0?'▲':'▼'} {Math.abs(d.dp||0).toFixed(2)}%</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
