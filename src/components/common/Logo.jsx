import { Link } from 'react-router-dom';

export default function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
      <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-accent flex items-center justify-center shadow-md shadow-accent/25 group-hover:shadow-accent/35 transition-shadow">
        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      </div>
      <span className="text-lg lg:text-xl font-extrabold tracking-tight text-text-primary">
        The AI <span className="text-accent">Trader</span>
      </span>
    </Link>
  );
}
