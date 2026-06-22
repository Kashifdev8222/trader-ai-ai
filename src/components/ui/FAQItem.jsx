import { useState } from 'react';
import { HiChevronDown } from 'react-icons/hi';

export default function FAQItem({ question, answer, defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-white/5 last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-4 py-6 text-left group cursor-pointer"
      >
        <span className="text-base lg:text-lg font-medium text-white group-hover:text-brand-orange transition-colors duration-200 pr-4">
          {question}
        </span>
        <HiChevronDown
          className={`w-5 h-5 text-white/40 flex-shrink-0 transition-transform duration-300 ${
            isOpen ? 'rotate-180 text-brand-orange' : ''
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-96 pb-6' : 'max-h-0'
        }`}
      >
        <p className="text-white/50 text-sm leading-relaxed">{answer}</p>
      </div>
    </div>
  );
}
