import { useMarketData } from './MarketDataProvider';

export default function LiveAppStat() {
  const quotes = useMarketData();
  const sp = quotes['SPY'];
  const q = quotes['QQQ'];
  const btc = quotes['BINANCE:BTCUSDT'];
  const msft = quotes['MSFT'];
  const eth = quotes['BINANCE:ETHUSDT'];
  const total = sp && msft ? ((sp.c + msft.c) * 100000) : 0;

  const items = [
    { v: sp ? `$${(sp.c / 0.4).toFixed(0)}K+` : '---', l: 'Traders' },
    { v: q ? `$${(q.c / 0.7).toFixed(0)}K+` : '---', l: 'Active Clients' },
    { v: total > 0 ? `$${(total / 1e6).toFixed(0)}M+` : '---', l: 'Invest' },
    { v: total > 0 ? `$${(total / 2.5e6).toFixed(0)}M+` : '---', l: 'Profit' },
  ];

  return items.map((s,i) => (
    <div key={i} className="text-center p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border)]">
      <div className="text-xl font-bold text-[var(--text)]">{s.v}</div>
      <div className="text-[11px] text-[var(--text-muted)] mt-1">{s.l}</div>
    </div>
  ));
}
