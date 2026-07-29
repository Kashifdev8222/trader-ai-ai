const variants = {
  primary: 'bg-accent hover:bg-accent-dark text-white shadow-lg shadow-accent/20 hover:shadow-accent/30',
  secondary: 'bg-transparent hover:bg-white/[0.04] text-text-secondary border border-border hover:border-border-light',
  green: 'bg-green hover:bg-green-light text-white shadow-lg shadow-green/20',
};

const sizes = {
  sm: 'px-3.5 py-1.5 text-[13px] rounded-lg',
  md: 'px-4 py-2 text-[13px] rounded-lg',
  lg: 'px-5 py-2.5 text-sm rounded-xl',
  xl: 'px-7 py-3 text-[15px] rounded-xl',
};

export default function Button({ variant = 'primary', size = 'md', className = '', children, ...props }) {
  return (
    <button className={`inline-flex items-center justify-center gap-1.5 font-semibold transition-all duration-200 cursor-pointer hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
}
