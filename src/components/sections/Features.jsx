import Section, { SectionHeader } from '../common/Section';
import { FEATURES } from '../../data/content';
import { HiOutlineChartBar, HiOutlineLightBulb, HiOutlineViewGrid, HiOutlineShieldCheck, HiOutlineBeaker, HiOutlineDeviceMobile, HiOutlineLockClosed, HiOutlineSupport, HiOutlineUsers, HiOutlineDesktopComputer } from 'react-icons/hi';

const icons = [HiOutlineChartBar, HiOutlineLightBulb, HiOutlineViewGrid, HiOutlineShieldCheck, HiOutlineBeaker, HiOutlineDeviceMobile, HiOutlineLockClosed, HiOutlineSupport, HiOutlineUsers, HiOutlineDesktopComputer];

export default function Features() {
  return (
    <Section className="bg-bg-secondary">
      <SectionHeader headline="What You Get with The AI Trader" subheadline="Here's what makes us different from old-school trading tools." />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
        {FEATURES.map((f, i) => (
          <div key={i} className="group p-6 rounded-2xl bg-bg-card border border-border hover:border-border-light transition-all duration-300 hover:-translate-y-1">
            <div className="w-11 h-11 rounded-xl bg-green/10 flex items-center justify-center mb-4">
              {(() => { const I = icons[i] || HiOutlineChartBar; return <I className="w-5 h-5 text-green" />; })()}
            </div>
            <h3 className="text-[15px] font-semibold text-text-primary mb-2">{f.title}</h3>
            <p className="text-text-secondary text-[13px] leading-relaxed">{f.description}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
