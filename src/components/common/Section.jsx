export default function Section({ children, className = '', id }) {
  return (
    <section id={id} className={`py-20 lg:py-24 ${className}`}>
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">{children}</div>
    </section>
  );
}

export function SectionHeader({ badge, headline, subheadline, center = true }) {
  return (
    <div className={`mb-12 lg:mb-16 ${center ? 'text-center' : ''}`}>
      {badge && (
        <span className="inline-block px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[11px] font-semibold uppercase tracking-wider mb-4">
          {badge}
        </span>
      )}
      {headline && (
        <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-bold tracking-[-0.01em] text-text-primary mb-3">{headline}</h2>
      )}
      {subheadline && (
        <p className="text-base lg:text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">{subheadline}</p>
      )}
    </div>
  );
}
