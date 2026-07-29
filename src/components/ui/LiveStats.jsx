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
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-8 gap-y-2">
          {items.map((item, i) => {
            const d = quotes[item.k];
            const v = d ? `$${d.c?.toFixed(2)}` : '---';
            const up = d?.dp >= 0;
            return (
              <div key={i} className="flex items-center gap-2">
                <span className="text-[12px] font-medium text-[var(--text-muted)]">{item.l}</span>
                <span className="text-[13px] font-semibold text-[var(--text)] tabular-nums">{v}</span>
                {d && (
                  <span className={`text-[11px] font-medium ${up ? 'text-[var(--green)]' : 'text-[var(--red)]'}`}>
                    {up ? '+' : ''}{d.dp?.toFixed(2)}%
                  </span>
                )}
              </div>
            );
          })}
          <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--green)] animate-pulse" />
            Live
          </span>
        </div>
      </div>
    </section>
  );
}
