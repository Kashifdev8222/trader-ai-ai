import { HiArrowRight } from 'react-icons/hi';
import Section, { SectionHeader } from '../common/Section';
import Button from '../common/Button';
import { WHY_CHOOSE_US } from '../../data/content';

export default function WhyChooseUs() {
  return (
    <Section className="bg-bg-secondary">
      <SectionHeader headline={WHY_CHOOSE_US.headline} subheadline={WHY_CHOOSE_US.subheadline} />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
        {WHY_CHOOSE_US.items.map((item, i) => (
          <div key={i} className="p-6 rounded-2xl bg-bg-card border border-border hover:border-border-light transition-all duration-300 hover:-translate-y-1">
            <div className="w-2 h-2 rounded-full bg-green mb-3" />
            <h3 className="text-[15px] font-bold text-text-primary mb-2">{item.title}</h3>
            <p className="text-text-secondary text-[13px] leading-relaxed">{item.description}</p>
          </div>
        ))}
      </div>
      <div className="text-center"><a href="#reg-form"><Button size="xl">Register Now <HiArrowRight className="w-4 h-4" /></Button></a></div>
    </Section>
  );
}
