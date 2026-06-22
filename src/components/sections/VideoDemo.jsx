import { SectionHeader } from '../common/Section';

export default function VideoDemo() {
  return (
    <section id="demo-video" className="py-20 lg:py-24 bg-bg-primary">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader headline="See The AI Trader in Action" subheadline="Watch how our AI analyzes markets, spots opportunities, and helps you trade smarter — all in real time." />
        <div className="max-w-4xl mx-auto">
          <div className="rounded-2xl overflow-hidden border border-border shadow-2xl shadow-black/40 bg-bg-card">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
              <div className="w-3 h-3 rounded-full bg-red-500/60" /><div className="w-3 h-3 rounded-full bg-amber-400/60" /><div className="w-3 h-3 rounded-full bg-green-400/60" />
              <span className="ml-3 text-[11px] text-text-muted">theaitrader.ai</span>
            </div>
            <div className="aspect-video">
              <iframe src="https://www.youtube.com/embed/u3T7fLT4qGQ" title="The AI Trader" className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
            </div>
          </div>
          <p className="text-center text-[12px] text-text-muted mt-4">The AI Trader makes trading easier and smarter. Explore with FREE registration!</p>
        </div>
      </div>
    </section>
  );
}
