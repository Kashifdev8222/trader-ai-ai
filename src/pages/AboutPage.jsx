import { ABOUT_CONTENT, FEATURES, HOW_IT_WORKS, WHY_AI } from '../data/content';
import { HiChartBar, HiChip, HiDatabase, HiShieldCheck, HiLightBulb, HiDesktopComputer, HiLockClosed, HiSupport, HiUserGroup, HiSparkles } from 'react-icons/hi';

const icoMap = { ChartBar:HiChartBar, Chip:HiChip, ViewGrid:HiDatabase, ShieldCheck:HiShieldCheck, Beaker:HiLightBulb, DeviceMobile:HiDesktopComputer, LockClosed:HiLockClosed, Support:HiSupport, UserGroup:HiUserGroup, DesktopComputer:HiDesktopComputer };

function Head({ headline, subheadline }) {
  return (
    <div className="text-center mb-14">
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[var(--text)] mb-4">{headline}</h2>
      <div className="flex items-center justify-center gap-2 mb-4">
        <div className="h-0.5 w-8 rounded-full bg-gradient-to-r from-transparent to-[#10b981]/60" />
        <div className="h-1.5 w-1.5 rounded-full bg-[#10b981]" />
        <div className="h-0.5 w-16 rounded-full bg-gradient-to-r from-[#10b981]/60 via-[#10b981] to-[#10b981]/60" />
        <div className="h-1.5 w-1.5 rounded-full bg-[#10b981]" />
        <div className="h-0.5 w-8 rounded-full bg-gradient-to-l from-transparent to-[#10b981]/60" />
      </div>
      {subheadline && <p className="text-base lg:text-lg text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">{subheadline}</p>}
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className="pt-28 pb-20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className="text-center mb-14">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--text)] mb-4">About The AI Trader</h1>
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-0.5 w-8 rounded-full bg-gradient-to-r from-transparent to-[#10b981]/60" />
            <div className="h-1.5 w-1.5 rounded-full bg-[#10b981]" />
            <div className="h-0.5 w-16 rounded-full bg-gradient-to-r from-[#10b981]/60 via-[#10b981] to-[#10b981]/60" />
            <div className="h-1.5 w-1.5 rounded-full bg-[#10b981]" />
            <div className="h-0.5 w-8 rounded-full bg-gradient-to-l from-transparent to-[#10b981]/60" />
          </div>
          <p className="text-lg text-[var(--text-secondary)] max-w-3xl mx-auto leading-relaxed">{ABOUT_CONTENT.description}</p>
        </div>

        {/* Inflation / Value */}
        <div className="mb-14">
          <div className="relative rounded-3xl bg-gradient-to-br from-[var(--bg-card)] via-[var(--bg-card)] to-[#10b981]/[0.02] border border-[var(--border)] p-8 lg:p-12 overflow-hidden shadow-xl shadow-black/[0.03] dark:shadow-black/20">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#10b981]/[0.04] rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-10 w-40 h-40 bg-[#10b981]/[0.02] rounded-full blur-2xl pointer-events-none" />
            <div className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-[#10b981]/20 rounded-tr-lg pointer-events-none" />
            <h2 className="text-xl lg:text-2xl font-bold text-[var(--text)] mb-6 relative z-10">{ABOUT_CONTENT.inflation_headline}</h2>
            <p className="text-[var(--text-secondary)] leading-relaxed relative z-10">{ABOUT_CONTENT.inflation_text}</p>
          </div>
        </div>

        {/* What We Offer */}
        <div className="mb-14">
          <Head headline="What You Get with The AI Trader" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
            {FEATURES.map((f, i) => (
              <div key={i} className="group p-6 text-center rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] hover:border-[#10b981]/20 hover:shadow-xl hover:shadow-black/[0.05] dark:hover:shadow-black/20 hover:-translate-y-1.5 transition-all duration-500 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-[#10b981]/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#10b981]/15 to-[#10b981]/5 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-[#10b981]/10 transition-all duration-300">
                  {(()=>{const I=icoMap[f.icon];return I?<I className="w-7 h-7 text-[#10b981]"/>:<HiSparkles className="w-7 h-7 text-[#10b981]"/>})()}
                </div>
                <h3 className="text-[15px] font-semibold text-[var(--text)] mb-2">{f.title}</h3>
                <p className="text-[var(--text-secondary)] text-[13px] leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Why AI */}
        <div className="max-w-3xl mx-auto mb-14">
          <Head headline={WHY_AI.headline} />
          <div className="space-y-4 text-center">
            <p className="text-[var(--text-secondary)] text-lg leading-relaxed">{WHY_AI.description}</p>
            <p className="text-[var(--text-secondary)] text-lg leading-relaxed">{WHY_AI.description2}</p>
            <div className="flex items-center justify-center gap-3 p-5 rounded-2xl bg-[#10b981]/5 border border-[#10b981]/10">
              <HiLightBulb className="w-5 h-5 text-[#10b981]" />
              <p className="text-[var(--text)] text-sm font-semibold leading-relaxed">{WHY_AI.description3}</p>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div>
          <Head headline={HOW_IT_WORKS.headline} subheadline={HOW_IT_WORKS.subheadline} />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 relative">
            <div className="hidden lg:block absolute top-12 left-[12%] right-[12%] h-0.5 bg-gradient-to-r from-[#10b981]/20 via-[#10b981]/40 to-[#10b981]/20 z-0" />
            {HOW_IT_WORKS.steps.map((s, i) => (
              <div key={i} className="group p-6 text-center rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] hover:border-[#10b981]/20 hover:shadow-xl hover:shadow-black/[0.05] dark:hover:shadow-black/20 hover:-translate-y-1.5 transition-all duration-500 relative z-10 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-[#10b981]/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#10b981] to-[#059669] text-white flex items-center justify-center text-xl font-bold mx-auto mb-5 shadow-lg shadow-[#10b981]/25 group-hover:shadow-xl group-hover:shadow-[#10b981]/40 group-hover:scale-110 transition-all duration-300">{s.step}</div>
                <h3 className="text-[15px] font-bold text-[var(--text)] mb-2">{s.title}</h3>
                <p className="text-[var(--text-secondary)] text-[13px] leading-relaxed">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
