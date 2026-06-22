import { Link } from 'react-router-dom';

export default function ThankYouPage() {
  return (
    <div className="pt-28 pb-20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-lg mx-auto text-center">
          <div className="w-20 h-20 rounded-2xl bg-[#11643F]/10 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-[#11643F]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--text)] mb-3">Thank You!</h1>
          <p className="text-[var(--text-secondary)] text-lg mb-2">Your registration has been submitted successfully.</p>
          <p className="text-[var(--text-secondary)] text-sm mb-8">Our team will contact you shortly to get you started.</p>
          <Link to="/" className="inline-flex px-6 py-3 rounded-xl bg-gradient-to-r from-[#FC6612] to-[#11643F] text-white font-semibold shadow-lg shadow-[#FC6612]/20 hover:shadow-[#FC6612]/40 transition-all">Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
