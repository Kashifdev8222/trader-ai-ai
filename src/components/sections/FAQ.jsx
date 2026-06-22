import { useState } from 'react';
import { HiPlus, HiMinus } from 'react-icons/hi';
import Section, { SectionHeader } from '../common/Section';
import { FAQ_ITEMS } from '../../data/content';

export default function FAQ() {
  return (
    <Section className="bg-bg-secondary">
      <SectionHeader headline="Frequently Asked Questions" />
      <div className="max-w-[740px] mx-auto divide-y divide-border">
        {FAQ_ITEMS.map((item, i) => (
          <FaqRow key={i} {...item} defaultOpen={i === 0} />
        ))}
      </div>
    </Section>
  );
}

function FaqRow({ question, answer, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between gap-4 py-5 text-left group cursor-pointer">
        <span className="text-[15px] font-medium text-text-secondary group-hover:text-text-primary transition-colors">{question}</span>
        {open ? <HiMinus className="w-4 h-4 text-accent flex-shrink-0" /> : <HiPlus className="w-4 h-4 text-text-muted flex-shrink-0" />}
      </button>
      <div className={`overflow-hidden transition-all duration-200 ${open ? 'max-h-96 pb-5' : 'max-h-0'}`}>
        <p className="text-text-secondary text-sm leading-relaxed">{answer}</p>
      </div>
    </div>
  );
}
