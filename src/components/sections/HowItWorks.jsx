import { HiArrowRight } from 'react-icons/hi';
import Section, { SectionHeader } from '../common/Section';
import Button from '../common/Button';
import { HOW_IT_WORKS } from '../../data/content';

export default function HowItWorks() {
  return (
    <Section className="bg-bg-primary">
      <SectionHeader headline={HOW_IT_WORKS.headline} subheadline={HOW_IT_WORKS.subheadline} />
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {HOW_IT_WORKS.steps.map((s, i) => (
          <div key={i} className="text-center p-6 rounded-2xl bg-bg-card border border-border hover:border-border-light transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 rounded-xl bg-green/10 text-green flex items-center justify-center text-lg font-bold mx-auto mb-4">{s.step}</div>
            <h3 className="text-[15px] font-semibold text-text-primary mb-2">{s.title}</h3>
            <p className="text-text-secondary text-[13px] leading-relaxed">{s.description}</p>
          </div>
        ))}
      </div>
      <div className="text-center"><a href="#reg-form"><Button variant="secondary" size="lg">Register Now <HiArrowRight className="w-4 h-4" /></Button></a></div>
    </Section>
  );
}
