export default function GenericPage({ title, subtitle, children }) {
  return (
    <div className="pt-28 pb-20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--text)] mb-4">{title}</h1>
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-0.5 w-8 rounded-full bg-gradient-to-r from-transparent to-[#10b981]/60" />
            <div className="h-1.5 w-1.5 rounded-full bg-[#10b981]" />
            <div className="h-0.5 w-16 rounded-full bg-gradient-to-r from-[#10b981]/60 via-[#10b981] to-[#10b981]/60" />
            <div className="h-1.5 w-1.5 rounded-full bg-[#10b981]" />
            <div className="h-0.5 w-8 rounded-full bg-gradient-to-l from-transparent to-[#10b981]/60" />
          </div>
          {subtitle && <p className="text-lg text-[var(--text-secondary)]">{subtitle}</p>}
        </div>
        <div className="max-w-3xl mx-auto">
          {children || (
            <div className="text-center py-16 rounded-3xl bg-[var(--bg-card)] border border-[var(--border)]">
              <div className="w-16 h-16 rounded-2xl bg-[#10b981]/10 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#10b981]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
              </div>
              <p className="text-[var(--text-secondary)] text-lg">Content coming soon.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
