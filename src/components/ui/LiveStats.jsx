import { useMarketData } from './MarketDataProvider';

export default function LiveStats() {
  const quotes = useMarketData();

  const items = [
    { k: 'SPY', l: 'S&P 500' },
    { k: 'QQQ', l: 'NASDAQ' },
    { k: 'BINANCE:BTCUSDT', l: 'BTC/USD' },
    { k: 'MSFT', l: 'Microsoft' },
  ];

  return (
    <section className="border-b border-[var(--border)] bg-[var(--bg-alt)]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {items.map((item, i) => {
            const d = quotes[item.k];
            const up = d?.dp >= 0;
            return (
              <div key={i} className="flex items-center justify-between p-3.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border)]">
                <div>
                  <div className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wide">{item.l}</div>
                  <div className="text-lg font-semibold text-[var(--text)] tabular-nums mt-0.5">
                    {d ? `$${d.c?.toFixed(2)}` : '---'}
                  </div>
                </div>
                {d && (
                  <div className={`flex items-center gap-1 px-2 py-1 rounded text-[12px] font-semibold ${up ? 'text-[var(--green)] bg-[var(--green)]/10' : 'text-[var(--red)] bg-[var(--red)]/5'}`}>
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={up ? 'M5 10l7-7m0 0l7 7m-7-7v18' : 'M19 14l-7 7m0 0l-7-7m7 7V3'} />
                    </svg>
                    {up ? '+' : ''}{d.dp?.toFixed(2)}%
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
