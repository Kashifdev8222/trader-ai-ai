import Section, { SectionHeader } from '../common/Section';
import { WHY_AI } from '../../data/content';

export default function WhyAI() {
  return (
    <Section className="bg-bg-secondary">
      <SectionHeader headline={WHY_AI.headline} />
      <div className="max-w-3xl mx-auto space-y-5">
        <p className="text-text-secondary text-lg leading-relaxed">{WHY_AI.description}</p>
        <p className="text-text-secondary text-lg leading-relaxed">{WHY_AI.description2}</p>
        <p className="text-accent text-lg font-semibold">{WHY_AI.description3}</p>
      </div>
    </Section>
  );
}
