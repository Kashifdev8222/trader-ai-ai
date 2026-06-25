import { Link } from 'react-router-dom';
import { HiArrowRight } from 'react-icons/hi';

export default function ThankYouPage() {
  return (
    <div className="pt-28 pb-20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-lg mx-auto text-center">
          <div className="relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-[#10b981]/[0.06] rounded-full blur-3xl pointer-events-none" />
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#10b981] to-[#059669] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-[#10b981]/30 relative z-10">
              <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--text)] mb-3">Thank You!</h1>
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-0.5 w-6 rounded-full bg-gradient-to-r from-transparent to-[#10b981]/60" />
            <div className="h-1.5 w-1.5 rounded-full bg-[#10b981]" />
            <div className="h-0.5 w-12 rounded-full bg-gradient-to-r from-[#10b981]/60 via-[#10b981] to-[#10b981]/60" />
            <div className="h-1.5 w-1.5 rounded-full bg-[#10b981]" />
            <div className="h-0.5 w-6 rounded-full bg-gradient-to-l from-transparent to-[#10b981]/60" />
          </div>
          <p className="text-[var(--text-secondary)] text-lg mb-2">Your registration has been submitted successfully.</p>
          <p className="text-[var(--text-secondary)] text-sm mb-8">Our team will contact you shortly to get you started.</p>
          <Link to="/" className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#10b981] hover:bg-[#059669] text-white font-semibold shadow-lg shadow-[#10b981]/20 hover:shadow-xl hover:shadow-[#10b981]/40 transition-all">Back to Home <HiArrowRight className="w-4 h-4" /></Link>
        </div>
      </div>
    </div>
  );
}
