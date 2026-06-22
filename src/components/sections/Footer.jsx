import { Link } from 'react-router-dom';
import Logo from '../common/Logo';
import { FOOTER_CONTENT } from '../../data/content';

export default function Footer() {
  const { tagline, social, columns, disclaimer, copyright } = FOOTER_CONTENT;

  return (
    <footer className="border-t border-border bg-bg-primary">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] gap-10">
          <div>
            <div className="mb-4"><Logo /></div>
            <p className="text-text-muted text-sm leading-relaxed mb-5 max-w-xs">{tagline}</p>
            <div className="flex items-center gap-2">
              {social.map((s) => (
                <a key={s.label} href={s.href} className="w-9 h-9 rounded-lg bg-bg-card border border-border flex items-center justify-center text-text-muted hover:text-accent hover:border-accent/20 transition-all text-[11px] font-medium" aria-label={s.label}>{s.label[0]}</a>
              ))}
            </div>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-4">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}><Link to={link.href} className="text-[13px] text-text-muted hover:text-text-primary transition-colors">{link.label}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[12px] text-text-muted">{copyright}</p>
          <p className="text-[12px] text-text-muted text-center max-w-lg">⚠️ {disclaimer}</p>
        </div>
      </div>
    </footer>
  );
}
