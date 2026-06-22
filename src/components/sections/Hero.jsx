import { useState } from 'react';
import { HiArrowRight } from 'react-icons/hi';
import Button from '../common/Button';
import { HERO_CONTENT, FORM_CONTENT } from '../../data/content';

export default function Hero() {
  const { headline, description, trustBar } = HERO_CONTENT;
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', phone: '' });
  const [status, setStatus] = useState('idle');
  const hc = (e) => setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault(); setStatus('loading');
    await new Promise((r) => setTimeout(r, 1500));
    setStatus('success'); setFormData({ firstName: '', lastName: '', email: '', phone: '' });
  };

  return (
    <section className="pt-24 pb-16 lg:pt-32 lg:pb-24 bg-bg-primary overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* LEFT */}
          <div className="text-center lg:text-left">
            <h1 className="text-[2rem] sm:text-[2.5rem] lg:text-[3.25rem] xl:text-[3.75rem] font-extrabold tracking-[-0.02em] leading-[1.08] text-text-primary mb-5">
              {headline}
            </h1>
            <p className="text-text-secondary text-base lg:text-lg leading-relaxed max-w-[540px] lg:max-w-none mb-7">{description}</p>

            <div className="inline-flex items-center gap-2 text-xs sm:text-sm text-text-muted bg-white/[0.03] border border-border rounded-full px-4 py-2 mb-8">
              <span className="text-accent font-semibold">{trustBar}</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start mb-10">
              <a href="#reg-form"><Button size="xl">Start Free<HiArrowRight className="w-5 h-5" /></Button></a>
              <Button variant="secondary" size="xl" onClick={() => document.getElementById('demo-video')?.scrollIntoView({ behavior: 'smooth' })}>See How It Works</Button>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 justify-center lg:justify-start text-[13px] text-text-muted">
              {['Free forever', 'No ads, ever', 'No credit card required'].map((s, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-green flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>{s}
                </span>
              ))}
              <span className="text-border">·</span>
              <span>⭐ 4.8 by 2,400+ users</span>
            </div>
          </div>

          {/* RIGHT — Form */}
          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-[380px]">
              <div className="rounded-2xl bg-bg-card border border-border p-6 sm:p-7 shadow-2xl shadow-black/30">
                <h3 className="text-lg font-bold text-text-primary text-center mb-0.5">{FORM_CONTENT.headline}</h3>
                <p className="text-[13px] text-text-secondary text-center mb-5">{FORM_CONTENT.subheadline}</p>
                {status === 'success' ? (
                  <div className="text-center py-8">
                    <div className="w-14 h-14 rounded-xl bg-green/10 flex items-center justify-center mx-auto mb-4"><svg className="w-7 h-7 text-green" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></div>
                    <h4 className="text-base font-bold text-text-primary mb-1">Registration Successful!</h4>
                    <p className="text-[13px] text-text-secondary">Welcome to The AI Trader. Check your email for next steps.</p>
                  </div>
                ) : (
                  <form onSubmit={submit} autoComplete="off" className="space-y-3">
                    {FORM_CONTENT.fields.map((f) => (
                      <input key={f.id} id={f.id} name={f.name} type={f.type} value={formData[f.name]} onChange={hc} required={f.required} placeholder={f.label}
                        className="w-full px-4 py-3 rounded-xl bg-bg-primary border border-border text-text-primary text-sm placeholder-text-muted focus:outline-none focus:border-accent/40 transition-colors" />
                    ))}
                    <button type="submit" disabled={status === 'loading'} className="w-full py-3.5 rounded-xl bg-accent hover:bg-accent-dark text-white font-semibold text-sm transition-all duration-200 shadow-lg shadow-accent/20 hover:shadow-accent/30 disabled:opacity-60 flex items-center justify-center gap-2">
                      {status === 'loading' ? 'Processing...' : <>{FORM_CONTENT.submitText}<HiArrowRight className="w-4 h-4" /></>}
                    </button>
                    <p className="text-center text-[10px] text-text-muted">{FORM_CONTENT.footnote2}</p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-16 lg:mt-20 pt-10 lg:pt-12 border-t border-border">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[{ v: '100,000+', l: 'Active Traders' },{ v: '50+', l: 'Countries' },{ v: '24/7', l: 'AI Market Scanning' },{ v: '$250', l: 'Minimum Deposit' }].map((s, i) => (
              <div key={i}><div className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-[-0.01em]">{s.v}</div><div className="text-[13px] text-text-muted mt-1">{s.l}</div></div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
