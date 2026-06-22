import { HiArrowRight } from 'react-icons/hi';
import Button from '../common/Button';

export default function CTA() {
  return (
    <section className="py-20 lg:py-24 bg-bg-primary">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-bg-card border border-border p-10 sm:p-14 lg:p-16 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-amber-400 text-lg">★★★★★</span>
            <span className="text-text-secondary text-sm">Rated 4.8/5 · by 2,400+ users</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-extrabold text-text-primary mb-3">Ready to Trade Smarter?</h2>
          <p className="text-text-secondary text-lg max-w-lg mx-auto mb-8">Join 100,000+ traders across 50+ countries. Create your free account today.</p>
          <a href="#reg-form"><Button size="xl">Create Free Account <HiArrowRight className="w-4 h-4" /></Button></a>
          <p className="mt-4 text-[13px] text-text-muted">Free to start. $250 minimum deposit. No hidden fees.</p>
        </div>
      </div>
    </section>
  );
}
