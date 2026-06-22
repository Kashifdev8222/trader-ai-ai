import { HiArrowRight } from 'react-icons/hi';
import Section from '../common/Section';
import Button from '../common/Button';
import { APP_SECTION } from '../../data/content';

export default function AppSection() {
  return (
    <Section className="bg-bg-primary">
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <div className="flex justify-center order-2 lg:order-1">
          <img src="/traderai-responsive-device.webp" alt="App" className="w-full max-w-sm mx-auto drop-shadow-2xl" />
        </div>
        <div className="order-1 lg:order-2">
          <h2 className="text-3xl lg:text-[40px] font-bold text-text-primary mb-3">{APP_SECTION.headline}</h2>
          <p className="text-text-secondary leading-relaxed mb-6">{APP_SECTION.subheadline}</p>
          <p className="text-[12px] font-semibold text-text-muted uppercase tracking-wider mb-3">What you can do on the app:</p>
          <ul className="space-y-2.5 mb-8">
            {APP_SECTION.features.map((f, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <svg className="w-4 h-4 text-green mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                <span className="text-text-secondary text-sm">{f}</span>
              </li>
            ))}
          </ul>
          <div className="grid grid-cols-4 gap-3 mb-8">
            {APP_SECTION.stats.map((s, i) => (
              <div key={i} className="text-center p-3 rounded-xl bg-bg-card border border-border">
                <div className="text-lg font-bold text-text-primary">{s.value}</div>
                <div className="text-[10px] text-text-muted mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
          <a href="#reg-form"><Button variant="green" size="lg">Register Now <HiArrowRight className="w-4 h-4" /></Button></a>
        </div>
      </div>
    </Section>
  );
}
