import { Link } from 'react-router-dom';
import { HiArrowRight } from 'react-icons/hi';
import { SectionHeader } from '../components/common/Section';
import { NAV_LINKS } from '../data/content';
import useScrollReveal from '../hooks/useScrollReveal';

const investLinks = NAV_LINKS.find((l) => l.label === 'Invest')?.children || [];

export default function InvestPage() {
  return (
    <div className="pt-20 lg:pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          headline="Invest with Trader AI"
          subheadline="Everything you need to know about investing with AI-powered tools. Choose your market, connect your broker, and start trading smarter."
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 max-w-5xl mx-auto mt-10">
          {investLinks.map((link, i) => (
            <InvestCard key={i} {...link} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

function InvestCard({ label, href, index }) {
  const ref = useScrollReveal();

  return (
    <Link
      ref={ref}
      to={href}
      className="group p-6 rounded-2xl bg-dark-800/50 border border-white/5 hover:border-brand-orange/20 transition-all duration-300 hover:-translate-y-2 flex items-center justify-between"
      style={{ transitionDelay: `${index * 50}ms` }}
    >
      <span className="text-white/70 group-hover:text-white transition-colors">{label}</span>
      <HiArrowRight className="w-5 h-5 text-white/20 group-hover:text-brand-orange group-hover:translate-x-1 transition-all" />
    </Link>
  );
}
