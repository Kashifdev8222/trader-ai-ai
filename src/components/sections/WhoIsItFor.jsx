import { HiArrowRight } from 'react-icons/hi';
import Section, { SectionHeader } from '../common/Section';
import Button from '../common/Button';
import { WHO_IS_IT_FOR } from '../../data/content';

export default function WhoIsItFor() {
  return (
    <Section className="bg-bg-secondary">
      <SectionHeader headline={WHO_IS_IT_FOR.headline} subheadline={WHO_IS_IT_FOR.subheadline} />
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {WHO_IS_IT_FOR.personas.map((p, i) => (
          <div key={i} className="p-6 rounded-2xl bg-bg-card border border-border hover:border-border-light transition-all duration-300 hover:-translate-y-1">
            <h3 className="text-[15px] font-bold text-text-primary mb-2">{p.title}</h3>
            <p className="text-text-secondary text-[13px] leading-relaxed">{p.description}</p>
          </div>
        ))}
      </div>
      <div className="text-center"><a href="#reg-form"><Button size="lg">Register Now <HiArrowRight className="w-4 h-4" /></Button></a></div>
    </Section>
  );
}
