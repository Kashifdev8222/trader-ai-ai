import { useMarketData } from './MarketDataProvider';

const INDICES = ['SPY','QQQ','DIA','IWM'];
const NAMES = {
  SPY: 'S&P 500',
  QQQ: 'NASDAQ 100',
  DIA: 'Dow Jones',
  IWM: 'Russell 2000',
};

export default function MarketOverview() {
  const quotes = useMarketData();

  return (
    <section className="border-b border-[var(--border)] bg-[var(--bg)]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"/>
          <h3 className="text-sm font-semibold text-[var(--text)]">Market Overview</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {INDICES.map(s => {
            const d = quotes[s];
            if (!d) return (
              <div key={s} className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border)]">
                <div className="text-xs text-[var(--text-muted)] mb-1">{NAMES[s]}</div>
                <div className="text-xl font-bold text-[var(--text)]">---</div>
              </div>
            );
            return (
              <div key={s} className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--border-strong)] hover:-translate-y-0.5 transition-all">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-[var(--text-muted)]">{NAMES[s]}</span>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${d.dp>=0?'text-green-400 bg-green-400/10':'text-red-400 bg-red-400/10'}`}>{d.dp>=0?'+':''}{d.dp?.toFixed(2)}%</span>
                </div>
                <div className="text-xl font-bold text-[var(--text)]">${d.c?.toFixed(2)}</div>
                <div className="flex justify-between mt-2 text-[10px]">
                  <span className="text-[var(--text-muted)]">H <span className="text-[var(--text-secondary)]">{d.h?.toFixed(2)}</span></span>
                  <span className="text-[var(--text-muted)]">L <span className="text-[var(--text-secondary)]">{d.l?.toFixed(2)}</span></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
