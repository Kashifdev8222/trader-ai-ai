import { SectionHeader } from '../components/common/Section';
import { HOW_IT_WORKS } from '../data/content';
import useScrollReveal from '../hooks/useScrollReveal';

export default function HowItWorksPage() {
  return (
    <div className="pt-20 lg:pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          headline={HOW_IT_WORKS.headline}
          subheadline="Getting started with Trader AI is simple. Follow these four steps and begin your journey to smarter trading."
        />

        <div className="max-w-4xl mx-auto space-y-12 mt-12">
          {HOW_IT_WORKS.steps.map((step, i) => (
            <StepDetail key={i} {...step} index={i} isLast={i === HOW_IT_WORKS.steps.length - 1} />
          ))}
        </div>
      </div>
    </div>
  );
}

function StepDetail({ step, title, description, index, isLast }) {
  const ref = useScrollReveal();

  return (
    <div ref={ref} className="relative flex gap-8 items-start">
      {/* Step indicator */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div className="w-16 h-16 rounded-2xl bg-brand-orange text-white flex items-center justify-center text-2xl font-bold shadow-lg shadow-brand-orange/20">
          {step}
        </div>
        {!isLast && <div className="w-0.5 h-full bg-gradient-to-b from-brand-orange/50 to-transparent mt-4" />}
      </div>

      {/* Content */}
      <div className="pt-2 pb-8">
        <h2 className="text-2xl font-bold text-white mb-3">{title}</h2>
        <p className="text-white/50 text-lg leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
