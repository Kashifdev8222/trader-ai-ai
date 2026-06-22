import { useState, useEffect } from 'react';
import { HiSun, HiMoon } from 'react-icons/hi';
import { Link, useLocation } from 'react-router-dom';

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-3 flex-shrink-0 group">
      <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[#11643F] to-[#0e5434] flex items-center justify-center shadow-lg shadow-[#11643F]/30 group-hover:shadow-[#11643F]/40 group-hover:scale-105 transition-all duration-300">
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/10 to-transparent" />
        <svg className="w-5 h-5 text-white relative z-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
      </div>
      <span className="text-lg font-extrabold text-[var(--text)]">The AI <span className="text-[#FC6612]">Trader</span></span>
    </Link>
  );
}

const NAV = [
  { label: 'Home', to: '/' },{ label: 'Invest', to: '/invest' },{ label: 'Market', to: '/market' },
  { label: 'How it Works', to: '/how-it-works' },{ label: 'Automated Trading', to: '/automated-trading' },
  { label: 'News', to: '/crypto-news' },{ label: 'Blog', to: '/blog' },{ label: 'Contact Us', to: '/contact-us' },
];

const SOCIAL_LINKS = [
  {n:'Facebook',d:'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z'},
  {n:'Instagram',d:'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z'},
  {n:'YouTube',d:'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z'},
  {n:'X',d:'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z'},
];

export default function Layout({ children }) {
  const loc = useLocation();
  const [dark, setDark] = useState(true);
  useEffect(() => { document.documentElement.classList.toggle('dark', dark); }, [dark]);

  return (
    <div className="bg-[var(--bg)] min-h-screen text-[var(--text)]">
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--bg-alt)]/95 backdrop-blur-xl border-b-2 border-[var(--border-strong)]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-[68px]">
          <Logo />
          <nav className="hidden lg:flex items-center gap-1">
            {NAV.map(link => {
              const active = loc.pathname === link.to;
              return <Link key={link.to} to={link.to} className={`px-3 py-2 text-[13px] font-medium rounded-lg transition-colors ${active?'text-[#FC6612] bg-[#FC6612]/[0.08]':'text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-white/[0.03]'}`}>{link.label}</Link>;
            })}
            <button onClick={()=>setDark(!dark)} className="ml-2 w-9 h-9 rounded-lg border border-[var(--border-strong)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[#FC6612] transition-colors">{dark?<HiSun className="w-4 h-4"/>:<HiMoon className="w-4 h-4"/>}</button>
          </nav>
          <a href="/#start-form" className="hidden lg:inline-flex px-5 py-2.5 text-[14px] font-semibold rounded-lg text-white shadow-lg shadow-[#FC6612]/20" style={{background:'linear-gradient(135deg, #FC6612, #11643F)'}}>Start Trading</a>
          <button className="lg:hidden p-2 text-[var(--text-secondary)]"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/></svg></button>
        </div>
      </header>

      {/* CONTENT */}
      <main>{children}</main>

      {/* FOOTER — same as HomePage */}
      <footer className="border-t-2 border-[var(--border-strong)] bg-[var(--bg-alt)]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-[40%_30%_30%] gap-8 lg:gap-12 pb-12 border-b border-[var(--border)]">
            <div>
              <Logo />
              <p className="text-[var(--text-secondary)] text-sm mt-4 leading-relaxed max-w-sm">The AI Trader makes ai trading easier and smarter. Analyze markets in real-time, automate strategies safely, stay fully in control.</p>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-[var(--text)] uppercase tracking-wider mb-4">Contact</h4>
              <div className="space-y-2.5">
                <p className="text-[var(--text-secondary)] text-sm flex items-center gap-2"><svg className="w-4 h-4 text-[#11643F] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>AU +61 284 889 800</p>
                <p className="text-[var(--text-secondary)] text-sm flex items-center gap-2"><svg className="w-4 h-4 text-[#11643F] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>UK +44 203 927 2999</p>
                <p className="text-[#FC6612] text-sm font-medium flex items-center gap-2"><svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>info@traderai.ai</p>
              </div>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-[var(--text)] uppercase tracking-wider mb-4">Follow Us</h4>
              <div className="flex items-center gap-3">
                {SOCIAL_LINKS.map(s=>(<a key={s.n} href="#" className="w-10 h-10 rounded-xl bg-[#FC6612]/10 hover:bg-[#FC6612] flex items-center justify-center text-[#FC6612] hover:text-white transition-all hover:scale-110" title={s.n}><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d={s.d}/></svg></a>))}
              </div>
            </div>
          </div>
          <div className="py-10 border-b border-[var(--border)] space-y-4">
            <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed"><strong className="text-[var(--text)] font-semibold">HIGH RISK WARNING:</strong> Dealing or Trading FX, CFDs and Cryptocurrencies is highly speculative, carries a level of non-negligible risk and may not be suitable for all investors. You may lose some or all of your invested capital, therefore you should not speculate with capital that you cannot afford to lose. Please refer to the risk disclosure below. traderai.ai does not gain or lose profits based on your activity and operates as a services company. traderai.ai is not a financial services firm and is not eligible of providing financial advice. traderai.ai shall not be liable for any losses occurred via or in relation to this informational website.</p>
            <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed"><strong className="text-[var(--text)] font-semibold">SITE RISK DISCLOSURE:</strong> traderai.ai does not accept any liability for loss or damage as a result of reliance on the information contained within this website; this includes education material, price quotes and charts, and analysis. Please be aware of and seek professional advice for the risks associated with trading the financial markets; never invest more money than you can risk losing. The risks involved in FX, CFDs and Cryptocurrencies may not be suitable for all investors. traderai.ai doesn't retain responsibility for any trading losses you might face as a result of using or inferring from the data hosted on this site.</p>
            <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed"><strong className="text-[var(--text)] font-semibold">LEGAL RESTRICTIONS:</strong> Without limiting the above mentioned provisions, you understand that laws regarding financial activities vary throughout the world, and it is your responsibility to make sure you properly comply with any law, regulation or guideline in your country of residence regarding the use of the Site. To avoid any doubt, the ability to access our Site does not necessarily mean that our Services and/or your activities through the Site are legal under the laws, regulations or directives relevant to your country of residence. It is against the law to solicit US individuals to buy and sell commodity options, even if they are called 'prediction' contracts, unless they are listed for trading and traded on a CFTC-registered exchange unless legally exempt. The UK Financial Conduct Authority has issued a policy statement PS20/10, which prohibits the sale, promotion, and distribution of CFD on Crypto assets. It prohibits the dissemination of marketing materials relating to distribution of CFDs and other financial products based on Cryptocurrencies that addressed to UK residents. The provision of trading services involving any MiFID II financial instruments is prohibited in the EU, unless when authorized/licensed by the applicable authorities and/or regulator(s). Please note that we may receive advertising fees for users opted to open an account with our partner advertisers via advertisers' websites. We have placed cookies on your computer to help improve your experience when visiting this website. You can change cookie settings on your computer at any time. Use of this website indicates your acceptance of this website.</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-10">
            <div className="flex items-center gap-5 text-[13px] text-[var(--text-secondary)]">
              <Link to="/privacy-policy" className="hover:text-[var(--text)] transition-colors">Privacy Policy</Link>
              <Link to="/terms-conditions" className="hover:text-[var(--text)] transition-colors">Terms & Conditions</Link>
              <Link to="/disclaimer" className="hover:text-[var(--text)] transition-colors">Disclaimer</Link>
            </div>
            <p className="text-[12px] text-[var(--text-muted)]">Copyright © 2026 The AI Trader | All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
