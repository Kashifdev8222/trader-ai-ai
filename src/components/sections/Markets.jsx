import Section, { SectionHeader } from '../common/Section';
import { MARKETS } from '../../data/content';

export default function Markets() {
  return (
    <Section className="bg-bg-primary">
      <SectionHeader headline={MARKETS.headline} subheadline={MARKETS.subheadline} />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {MARKETS.items.map((m, i) => (
          <div key={i} className="group p-5 rounded-2xl bg-bg-card border border-border hover:border-border-light transition-all duration-300 hover:-translate-y-1">
            <h3 className="text-[15px] font-bold text-text-primary mb-1.5">{m.name}</h3>
            <p className="text-text-secondary text-[13px] leading-relaxed">{m.description}</p>
          </div>
        ))}
      </div>
      <p className="text-center text-[12px] text-text-muted mt-6">⚠️ Demo data for illustration — not real market prices.</p>

      <div className="mt-14 pt-12 border-t border-border space-y-6">
        {['Crypto Exchanges', 'Forex / Brokers', 'Stock Brokers'].map((label) => (
          <div key={label} className="text-center">
            <div className="text-[11px] uppercase tracking-wider text-text-muted mb-2">{label}</div>
            <div className="text-[13px] text-text-muted max-w-3xl mx-auto leading-relaxed">
              {label === 'Crypto Exchanges' && 'Binance · OKX · Bybit · Kraken · Coinbase · KuCoin · Bitfinex · Gate.io · MEXC · Gemini · Crypto.com'}
              {label === 'Forex / Brokers' && 'OANDA · IG Markets · FXCM · Saxo Bank · Interactive Brokers · Pepperstone · IC Markets · eToro · XTB · CMC Markets'}
              {label === 'Stock Brokers' && 'Fidelity · TD Ameritrade · Charles Schwab · Robinhood · Webull · E*TRADE · TradeStation · Merrill Edge · Alpaca'}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
