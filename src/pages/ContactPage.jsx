import { useState, useEffect } from 'react';
import { HiArrowRight } from 'react-icons/hi';
import PhoneInputLib from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
const PhoneInput = PhoneInputLib.default || PhoneInputLib;

export default function ContactPage() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '' });
  const [phoneCountry, setPhoneCountry] = useState('us');
  useEffect(() => {
    const l = navigator.language || '';
    const cc = l.split('-')[1]?.toLowerCase() || l.split('-')[0]?.toLowerCase();
    const map = { pk:'pk', in:'in', us:'us', gb:'gb', au:'au', cn:'cn', de:'de', fr:'fr', jp:'jp', ru:'ru', br:'br', it:'it', es:'es', nl:'nl', se:'se', ch:'ch', pl:'pl', ph:'ph', mx:'mx', ae:'ae', ng:'ng', sa:'sa', eg:'eg', za:'za', kr:'kr', vn:'vn', th:'th', my:'my', id:'id', tr:'tr', ca:'ca' };
    if (map[cc]) setPhoneCountry(map[cc]);
  }, []);
  const [status, setStatus] = useState('idle');
  const hc = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  const submit = async (e) => {
    e.preventDefault(); setStatus('loading');
    try {
      const res = await fetch('/api/submit-lead', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName: form.firstName, lastName: form.lastName, email: form.email, phone: form.phone }),
      });
      const data = await res.json();
      if (data.status === 'success') { window.location.href = '/thank-you'; }
      else { setStatus('error'); }
    } catch (err) { setStatus('error'); }
  };

  return (
    <div className="pt-28 pb-20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--text)] mb-3">Contact Us</h1>
          <p className="text-lg text-[var(--text-secondary)]">Explore Trading Opportunities - Get in touch with our team.</p>
        </div>
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 max-w-5xl mx-auto">
          {/* Form */}
          <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] p-7 sm:p-8 shadow-xl">
            <h2 className="text-xl font-bold text-[var(--text)] mb-6">Send us a message</h2>
            {status === 'success' ? (
              <div className="text-center py-10">
                <div className="w-16 h-16 rounded-2xl bg-[#10b981]/10 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-[#10b981]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                </div>
                <h3 className="text-xl font-bold text-[var(--text)] mb-2">Message Sent!</h3>
                <p className="text-[var(--text-secondary)]">We will get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={submit} autoComplete="off" className="space-y-4">
                {[{ n: 'firstName', l: 'First Name' }, { n: 'lastName', l: 'Last Name' }, { n: 'email', l: 'Email' }].map((f) => (
                  <div key={f.n}>
                    <label className="block text-sm font-semibold text-[var(--text)] mb-1.5">{f.l}</label>
                    <input name={f.n} value={form[f.n]} onChange={hc} required placeholder={`Enter your ${f.l.toLowerCase()}`} className="w-full px-4 py-3 rounded-xl bg-[var(--bg)] border border-[var(--border-strong)] text-[var(--text)] text-sm placeholder-[var(--text-secondary)] focus:outline-none focus:border-[#10b981]/50 transition-all"/>
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-semibold text-[var(--text)] mb-1.5">Phone Number</label>
                  <PhoneInput country={phoneCountry} value={form.phone} onChange={(val) => setForm(p => ({...p, phone: val}))} />
                </div>
                <button type="submit" disabled={status === 'loading'} className="w-full py-4 rounded-xl bg-[#10b981] hover:bg-[#059669] text-white font-bold text-sm transition-all shadow-lg shadow-[#10b981]/20 hover:shadow-[#10b981]/40 flex items-center justify-center gap-2">
                  {status === 'loading' ? 'Sending...' : <>Send Message<HiArrowRight className="w-4 h-4"/></>}
                </button>
              </form>
            )}
          </div>
          {/* Info */}
          <div className="space-y-6">
            <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] p-7 sm:p-8">
              <h3 className="text-lg font-bold text-[var(--text)] mb-6">Contact Information</h3>
              <div className="space-y-5">
                {[{ l: 'AU Phone', v: '+61 284 889 800' }, { l: 'UK Phone', v: '+44 203 927 2999' }, { l: 'Email', v: 'info@traderai.ai' }].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#10b981]/10 flex items-center justify-center flex-shrink-0">
                      {i < 2 ? (
                        <svg className="w-5 h-5 text-[#10b981]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                      ) : (
                        <svg className="w-5 h-5 text-[#10b981]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--text)]">{item.l}</p>
                      <p className="text-sm text-[var(--text-secondary)]">{item.v}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-[#10b981]/10 to-[#10b981]/10 border border-[var(--border)] p-7 sm:p-8 text-center">
              <h3 className="text-lg font-bold text-[var(--text)] mb-2">We are here for you 24/5</h3>
              <p className="text-[var(--text-secondary)] text-sm mb-5">Our support team is available Monday to Friday, around the clock.</p>
              <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#10b981] hover:bg-[#0e5434] text-white font-semibold text-sm transition-all shadow-lg shadow-[#10b981]/20">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                LAUNCH LIVE CHAT
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
