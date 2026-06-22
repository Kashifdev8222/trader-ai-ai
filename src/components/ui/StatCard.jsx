export default function StatCard({ value, label, delay = 0 }) {
  return (
    <div
      className="text-center animate-slide-up opacity-0"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="text-2xl sm:text-3xl lg:text-4xl font-bold gradient-text mb-1">{value}</div>
      <div className="text-white/40 text-sm">{label}</div>
    </div>
  );
}
