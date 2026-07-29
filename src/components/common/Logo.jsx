import { Link } from 'react-router-dom';

export default function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
      <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-xl bg-accent flex items-center justify-center shadow-md shadow-accent/25 group-hover:shadow-accent/35 transition-shadow">
        <svg className="w-4 h-4 lg:w-5 lg:h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      </div>
      <span className="text-base lg:text-lg font-extrabold tracking-tight text-[var(--text)]">
        The AI <span className="text-[var(--accent)]">Trader</span>
      </span>
    </Link>
  );
}
