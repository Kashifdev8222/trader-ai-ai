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
    <section className="relative border-y border-[var(--border)] bg-[var(--bg-alt)]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <div className="flex flex-wrap justify-center gap-14 sm:gap-20 lg:gap-32">
          {items.map((item,i) => {
            const d = quotes[item.k];
            const v = d ? `$${d.c?.toFixed(2)}` : '---';
            return (
              <div key={i} className="flex items-center gap-4">
                <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${d?.dp>=0?'bg-green-400/10 text-green-400':'bg-red-400/10 text-red-400'}`}>
                  <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d?.dp>=0?'M5 10l7-7m0 0l7 7m-7-7v18':'M19 14l-7 7m0 0l-7-7m7 7V3'}/></svg>
                </div>
                <div>
                  <div className="text-[1.2rem] sm:text-[1.4rem] lg:text-[1.6rem] font-bold text-[var(--text)] tracking-[-0.01em]">{v}</div>
                  <div className="text-[11px] sm:text-[12px] text-[var(--text-muted)]">{item.l}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
