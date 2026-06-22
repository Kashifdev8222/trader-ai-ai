import { SectionHeader } from '../components/common/Section';
import { MARKETS } from '../data/content';
import useScrollReveal from '../hooks/useScrollReveal';
import Button from '../components/common/Button';

export default function MarketPage() {
  return (
    <div className="pt-20 lg:pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          headline={MARKETS.headline}
          subheadline="Access stocks, crypto, forex, commodities, and indices — all from a single platform."
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto mt-10">
          {MARKETS.items.map((market, i) => (
            <MarketDetailCard key={i} {...market} index={i} />
          ))}
        </div>

        <div className="text-center mt-14">
          <a href="/#reg-form">
            <Button size="xl">Start Trading All Markets</Button>
          </a>
        </div>
      </div>
    </div>
  );
}

function MarketDetailCard({ icon, name, description, index }) {
  const ref = useScrollReveal();

  return (
    <div
      ref={ref}
      className="p-8 rounded-2xl bg-dark-800/50 border border-white/5 hover:border-brand-orange/20 transition-all duration-300"
      style={{ transitionDelay: `${index * 60}ms` }}
    >
      <div className="text-5xl mb-5">{icon}</div>
      <h3 className="text-xl font-bold text-white mb-3">{name}</h3>
      <p className="text-white/40 leading-relaxed">{description}</p>
    </div>
  );
}
