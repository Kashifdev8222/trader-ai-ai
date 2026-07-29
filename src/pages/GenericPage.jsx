export default function GenericPage({ title, subtitle, children }) {
  return (
    <div className="pt-24 pb-16">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-2xl lg:text-3xl font-semibold text-[var(--text)] tracking-tight mb-3">{title}</h1>
          {subtitle && <p className="text-[15px] text-[var(--text-secondary)]">{subtitle}</p>}
        </div>
        <div className="max-w-3xl mx-auto">
          {children || (
            <div className="text-center py-12 rounded-lg bg-[var(--bg-card)] border border-[var(--border)]">
              <p className="text-[var(--text-secondary)] text-[14px]">Content coming soon.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
