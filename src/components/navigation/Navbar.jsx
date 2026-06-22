import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HiMenu, HiX, HiChevronDown } from 'react-icons/hi';
import Button from '../common/Button';
import Logo from '../common/Logo';
import { NAV_LINKS } from '../../data/content';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDrop, setOpenDrop] = useState(null);
  const [openMobDrop, setOpenMobDrop] = useState(null);
  const loc = useLocation();
  const dropRef = useRef(null);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);
  useEffect(() => { setMobileOpen(false); setOpenDrop(null); }, [loc.pathname]);
  useEffect(() => { document.body.style.overflow = mobileOpen ? 'hidden' : ''; return () => { document.body.style.overflow = ''; }; }, [mobileOpen]);
  useEffect(() => {
    const h = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setOpenDrop(null); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-bg-primary/95 backdrop-blur-xl border-b border-border' : 'bg-transparent'}`}>
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-[68px]">
            <Logo />

            {/* Desktop Nav Links */}
            <div className="hidden lg:flex items-center gap-0.5" ref={dropRef}>
              {NAV_LINKS.map((link) =>
                link.children ? (
                  <div key={link.label} className="relative">
                    <button
                      onClick={() => setOpenDrop(openDrop === link.label ? null : link.label)}
                      className={`flex items-center gap-1 px-3 py-2 text-[13px] font-medium rounded-lg transition-colors ${openDrop === link.label ? 'text-text-primary bg-white/[0.04]' : 'text-text-secondary hover:text-text-primary hover:bg-white/[0.03]'}`}
                    >
                      {link.label}
                      <HiChevronDown className={`w-3.5 h-3.5 transition-transform ${openDrop === link.label ? 'rotate-180' : ''}`} />
                    </button>
                    {openDrop === link.label && (
                      <div className="absolute top-full mt-1.5 left-0 min-w-[260px] bg-bg-elevated border border-border rounded-xl shadow-2xl shadow-black/50 py-2 animate-fade-up">
                        {link.children.map((c) => (
                          <Link key={c.label} to={c.href} className="block px-4 py-2.5 text-[13px] text-text-secondary hover:text-text-primary hover:bg-white/[0.03] transition-colors">{c.label}</Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link key={link.label} to={link.href} className={`px-3 py-2 text-[13px] font-medium rounded-lg transition-colors ${loc.pathname === link.href ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary hover:bg-white/[0.03]'}`}>
                    {link.label}
                  </Link>
                )
              )}
            </div>

            {/* Desktop CTA */}
            <div className="hidden lg:flex items-center gap-3">
              <Link to="/contact-us" className="text-[13px] font-medium text-text-secondary hover:text-text-primary transition-colors">Sign In</Link>
              <a href="/#reg-form"><Button size="sm">Get Started</Button></a>
            </div>

            {/* Mobile Toggle */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-1.5 text-text-secondary hover:text-text-primary rounded-lg" aria-label="Menu">
              {mobileOpen ? <HiX className="w-6 h-6" /> : <HiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`fixed inset-0 z-40 lg:hidden transition-opacity duration-300 ${mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
        <div className={`absolute top-0 right-0 w-72 h-full bg-bg-primary border-l border-border shadow-2xl transition-transform duration-300 overflow-y-auto ${mobileOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="pt-20 px-5 pb-8 space-y-0.5">
            {NAV_LINKS.map((link) =>
              link.children ? (
                <div key={link.label}>
                  <button onClick={() => setOpenMobDrop(openMobDrop === link.label ? null : link.label)} className="w-full flex items-center justify-between py-3 text-sm text-text-secondary hover:text-text-primary transition-colors">
                    {link.label}<HiChevronDown className={`w-4 h-4 transition-transform ${openMobDrop === link.label ? 'rotate-180' : ''}`} />
                  </button>
                  {openMobDrop === link.label && (
                    <div className="pb-2 pl-4 space-y-0.5">
                      {link.children.map((c) => (
                        <Link key={c.label} to={c.href} onClick={() => setMobileOpen(false)} className="block py-2 text-[13px] text-text-muted hover:text-text-primary transition-colors">{c.label}</Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link key={link.label} to={link.href} onClick={() => setMobileOpen(false)} className="block py-3 text-sm text-text-secondary hover:text-text-primary transition-colors">{link.label}</Link>
              )
            )}
            <div className="pt-6 mt-4 border-t border-border space-y-3">
              <Link to="/contact-us" onClick={() => setMobileOpen(false)} className="block w-full text-center py-3 text-sm text-text-secondary hover:text-text-primary transition-colors">Sign In</Link>
              <a href="/#reg-form" onClick={() => setMobileOpen(false)}><Button size="lg" className="w-full">Get Started</Button></a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
