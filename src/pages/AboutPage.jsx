import { ABOUT_CONTENT, FEATURES, HOW_IT_WORKS, WHY_AI } from '../data/content';

export default function AboutPage() {
  return (
    <div className="pt-28 pb-20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--text)] mb-4">About The AI Trader</h1>
          <p className="text-lg text-[var(--text-secondary)] max-w-3xl mx-auto leading-relaxed">{ABOUT_CONTENT.description}</p>
        </div>

        {/* Inflation / Value Section */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] p-8 lg:p-10 reveal">
            <h2 className="text-2xl font-bold text-[var(--text)] mb-4">{ABOUT_CONTENT.inflation_headline}</h2>
            <p className="text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">{ABOUT_CONTENT.inflation_text}</p>
          </div>
        </div>

        {/* What We Offer */}
        <div className="mb-16">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text)] text-center mb-10">What You Get with The AI Trader</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {FEATURES.map((f, i) => (
              <div key={i} className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--border-strong)] transition-all hover:-translate-y-1">
                <div className="w-10 h-10 rounded-xl bg-[#11643F]/10 flex items-center justify-center mb-3"><span className="text-lg">{f.icon}</span></div>
                <h3 className="text-[15px] font-semibold text-[var(--text)] mb-2">{f.title}</h3>
                <p className="text-[var(--text-secondary)] text-[13px] leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Why AI */}
        <div className="max-w-3xl mx-auto mb-16">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text)] text-center mb-8">{WHY_AI.headline}</h2>
          <div className="space-y-4 text-center">
            <p className="text-[var(--text-secondary)] text-lg leading-relaxed">{WHY_AI.description}</p>
            <p className="text-[var(--text-secondary)] text-lg leading-relaxed">{WHY_AI.description2}</p>
            <p className="text-[#FC6612] text-lg font-semibold">{WHY_AI.description3}</p>
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-16">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text)] text-center mb-10">{HOW_IT_WORKS.headline}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {HOW_IT_WORKS.steps.map((s, i) => (
              <div key={i} className="p-5 text-center rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--border-strong)] transition-all hover:-translate-y-1">
                <div className="w-12 h-12 rounded-xl bg-[#11643F]/10 text-[#11643F] flex items-center justify-center text-lg font-bold mx-auto mb-4">{s.step}</div>
                <h3 className="text-[15px] font-semibold text-[var(--text)] mb-2">{s.title}</h3>
                <p className="text-[var(--text-secondary)] text-[13px] leading-relaxed">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
