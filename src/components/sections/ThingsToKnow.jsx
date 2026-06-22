import Section, { SectionHeader } from '../common/Section';
import { THINGS_TO_KEEP_IN_MIND } from '../../data/content';

export default function ThingsToKnow() {
  return (
    <Section className="bg-bg-primary">
      <SectionHeader headline={THINGS_TO_KEEP_IN_MIND.headline} />
      <div className="max-w-3xl mx-auto space-y-3">
        {THINGS_TO_KEEP_IN_MIND.items.map((item, i) => (
          <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-bg-card border border-border">
            <div className="w-7 h-7 rounded-lg bg-green/10 text-green flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</div>
            <p className="text-text-secondary text-sm leading-relaxed">{item}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
