import { HiArrowRight } from 'react-icons/hi';
import Section, { SectionHeader } from '../common/Section';
import Button from '../common/Button';
import { ABOUT_CONTENT } from '../../data/content';

export default function About() {
  return (
    <Section className="bg-bg-secondary">
      <SectionHeader headline={ABOUT_CONTENT.headline} />
      <div className="max-w-3xl mx-auto text-center">
        <p className="text-text-secondary text-lg leading-relaxed mb-8">{ABOUT_CONTENT.description}</p>
        <div className="mb-10 p-7 lg:p-10 rounded-2xl bg-bg-card border border-border text-left">
          <h3 className="text-xl font-bold text-text-primary mb-4">{ABOUT_CONTENT.inflation_headline}</h3>
          <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-line">{ABOUT_CONTENT.inflation_text}</p>
        </div>
        <a href="#reg-form"><Button size="lg">Register Now <HiArrowRight className="w-4 h-4" /></Button></a>
      </div>
    </Section>
  );
}
