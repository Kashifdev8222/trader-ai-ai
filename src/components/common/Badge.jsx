export default function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-white/5 border border-white/10 text-white/70',
    orange: 'bg-brand-orange/10 border border-brand-orange/20 text-brand-orange',
    green: 'bg-brand-green/10 border border-brand-green/20 text-brand-green-300',
    featured:
      'bg-gradient-to-r from-brand-orange/20 to-brand-green/20 border border-brand-orange/30 text-brand-orange',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
        variants[variant] || variants.default
      } ${className}`}
    >
      {variant === 'featured' && <span className="w-1.5 h-1.5 rounded-full bg-brand-orange animate-pulse" />}
      {children}
    </span>
  );
}
