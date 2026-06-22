export default function GenericPage({ title, subtitle, children }) {
  return (
    <div className="pt-28 pb-20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--text)] mb-3">{title}</h1>
          {subtitle && <p className="text-lg text-[var(--text-secondary)]">{subtitle}</p>}
        </div>
        <div className="max-w-3xl mx-auto">
          {children || <div className="text-center py-12"><p className="text-[var(--text-secondary)] text-lg">Content coming soon.</p></div>}
        </div>
      </div>
    </div>
  );
}
