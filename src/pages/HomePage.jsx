import { useState, useEffect, useRef } from 'react';
import { HiArrowRight, HiChevronDown, HiSun, HiMoon, HiUserGroup, HiChartBar, HiTrendingUp, HiCurrencyDollar, HiGlobeAlt, HiSparkles, HiShieldCheck, HiLightBulb, HiCode, HiEmojiHappy, HiCube, HiPlay, HiUserAdd, HiLightningBolt, HiDesktopComputer, HiPuzzle, HiKey, HiCash, HiLockClosed, HiAcademicCap, HiBriefcase, HiChip, HiCog, HiClipboardList, HiExclamation, HiBadgeCheck, HiScale, HiSupport, HiStar, HiDatabase } from 'react-icons/hi';
import PhoneInputLib from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
const PhoneInput = PhoneInputLib.default || PhoneInputLib;
import { Link, useLocation } from 'react-router-dom';
import { HERO_CONTENT, FORM_CONTENT, ABOUT_CONTENT, FEATURES, HOW_IT_WORKS, WHY_AI, MARKETS, WHO_IS_IT_FOR, APP_SECTION, WHY_CHOOSE_US, THINGS_TO_KEEP_IN_MIND, FAQ_ITEMS } from '../data/content';
import LiveTicker from '../components/ui/LiveTicker';
import MarketOverview from '../components/ui/MarketOverview';
import TradingChart from '../components/ui/TradingChart';
import CompanyProfile from '../components/ui/CompanyProfile';
import ForexRates from '../components/ui/ForexRates';
import LiveStats from '../components/ui/LiveStats';
import MarketDataProvider from '../components/ui/MarketDataProvider';
import LiveAppStat from '../components/ui/LiveAppStat';
import TVMiniChart from '../components/ui/TVMiniChart';

/* ============================================================
   ALL CONTENT from traderai.ai
   Active nav + Dark/Light mode + Green logo
   ============================================================ */

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
      <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-xl bg-[#10b981] flex items-center justify-center shadow-md shadow-[#10b981]/25 group-hover:shadow-[#10b981]/40 group-hover:scale-105 transition-all duration-200">
        <svg className="w-4 h-4 lg:w-5 lg:h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      </div>
      <span className="text-base lg:text-lg font-extrabold text-[var(--text)] tracking-tight">The AI <span className="text-[#10b981]">Trader</span></span>
    </Link>
  );
}

function Bg({ dark: _dark }) {
  return <div className="absolute inset-0 bg-[var(--bg)]" />;
}
function HdDropdown({ label, items }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative" onMouseEnter={()=>setOpen(true)} onMouseLeave={()=>setOpen(false)}>
      <button className="flex items-center gap-1 px-3 py-2 text-[13px] font-medium rounded-lg text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-white/[0.03] transition-colors">{label}<HiChevronDown className="w-3 h-3" /></button>
      {open && <div className="absolute top-full left-0 pt-2 z-50" onMouseEnter={()=>setOpen(true)}><div className="w-48 bg-[var(--bg-elevated)] border border-[var(--border-strong)] rounded-xl shadow-2xl py-2">{items.map(i=><Link key={i.to} to={i.to} className="block px-4 py-2.5 text-[13px] text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-white/[0.03] transition-colors">{i.label}</Link>)}</div></div>}
    </div>
  );
}
function Sec({ children, id, className = '', alt = false }) {
  return <section id={id} className={`relative reveal ${alt ? 'bg-[var(--bg-alt)]' : 'bg-[var(--bg)]'} ${className}`}>{children}</section>;
}
function Con({ children, wide = false }) {
  return <div className={`mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 relative z-10 ${wide ? 'max-w-[1440px]' : 'max-w-[1280px]'}`}>{children}</div>;
}
function Head({ headline, subheadline }) {
  return (
    <div className="text-center mb-10">
      <h2 className="text-xl sm:text-2xl lg:text-[28px] font-semibold text-[var(--text)] tracking-tight mb-3">{headline}</h2>
      {subheadline && <p className="text-sm text-[var(--text-secondary)] max-w-xl mx-auto leading-relaxed">{subheadline}</p>}
    </div>
  );
}
function Btn({ children, variant = 'primary', size = 'md', className = '', ...p }) {
  const base = 'cursor-pointer inline-flex items-center justify-center gap-1.5 font-semibold transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed';
  const sz = { sm: 'px-3.5 py-1.5 text-[13px] rounded-lg', md: 'px-4 py-2 text-[13px] rounded-lg', lg: 'px-5 py-2.5 text-sm rounded-xl', xl: 'px-7 py-3 text-[15px] rounded-xl' };
  if (variant === 'secondary') return <button className={`${base} bg-transparent hover:bg-[var(--bg-overlay)] text-[var(--text)] border border-[var(--border)] hover:border-[var(--border-strong)] ${sz[size]} ${className}`} {...p}>{children}</button>;
  return <button className={`${base} bg-[#10b981] hover:bg-[#059669] text-white shadow-md shadow-[#10b981]/25 hover:shadow-lg hover:shadow-[#10b981]/35 ${sz[size]} ${className}`} {...p}>{children}</button>;
}
function Card({ children, className = '', delay = 0, glow: _glow = false }) {
  return (
    <div className={`group rounded-lg bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--accent)]/30 hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5 transition-all duration-200 reveal relative ${delay ? `delay-${delay}` : ''} ${className}`}>
      {children}
    </div>
  );
}

// Menu items matching traderai.ai + Home
const NAV = [
  { label: 'Home', to: '/' },
  { label: 'About Us', to: '/about-us' },
  { label: 'Blog', to: '/blog' },
  { label: 'News', to: '#', children: [{ label: 'Crypto News', to: '/crypto-news' },{ label: 'Stock News', to: '/stock-news' },{ label: 'Forex News', to: '/forex-news' }] },
  { label: 'Contact Us', to: '/contact-us' },
];

export default function HomePage() {
  const loc = useLocation();
  const [dark, setDark] = useState(true);
  const [formStatus, setFormStatus] = useState('idle');
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '' });
  const [errorMsg, setErrorMsg] = useState('');
  const [phoneCountry, setPhoneCountry] = useState('us');
  const hc = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  useEffect(() => {
    // Detect country by IP via our own API (no CORS, server-side geo)
    fetch('/api/geo')
      .then(r => r.json())
      .then(d => {
        if (d.country_code) {
          setPhoneCountry(d.country_code.toLowerCase());
        }
      })
      .catch(() => {
        // Fallback to browser language
        const l = navigator.language || '';
        const cc = l.split('-')[1]?.toLowerCase() || l.split('-')[0]?.toLowerCase();
        if (cc) setPhoneCountry(cc);
      });
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  // Scroll reveal animations
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => { if(e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const submitForm = async (e) => {
    e.preventDefault(); setFormStatus('loading'); setErrorMsg('');
    try {
      const res = await fetch('/api/submit-lead', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName: form.firstName, lastName: form.lastName, email: form.email, phone: form.phone }),
      });
      const data = await res.json();
      if (data.status === 'success') { window.location.href = '/thank-you'; }
      else { setFormStatus('error'); setErrorMsg(data.message || 'Submission failed'); }
    } catch (err) { setFormStatus('error'); setErrorMsg('Network error. Please try again.'); }
  };

  return (
    <div className="bg-[var(--bg)] min-h-screen text-[var(--text)]">

      {/* ====== HEADER ====== */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--bg)]/85 backdrop-blur-xl border-b border-[var(--border)]">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-6 lg:px-8 flex items-center justify-between h-[64px]">
          <Logo />
          <nav className="hidden lg:flex items-center gap-0.5">
            {NAV.map(link => link.children ? (
              <HdDropdown key={link.label} label={link.label} items={link.children} />
            ) : (
              <Link key={link.to} to={link.to} className={`px-3.5 py-2 text-sm font-medium rounded-lg transition-colors ${loc.pathname===link.to?'text-[var(--accent)] bg-[var(--accent-light)]':'text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg-overlay)]'}`}>{link.label}</Link>
            ))}
            <button onClick={() => setDark(!dark)} title="Toggle theme"
              className="ml-2 w-8 h-8 rounded-lg border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--accent)] hover:border-[var(--accent)]/30 transition-colors">
              {dark ? <HiSun className="w-4 h-4" /> : <HiMoon className="w-4 h-4" />}
            </button>
          </nav>
          <div className="hidden lg:block">
            <a href="#reg-form"><Btn size="sm">Start Trading</Btn></a>
          </div>
          <button className="lg:hidden p-2 text-[var(--text-secondary)]" aria-label="Open menu"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/></svg></button>
        </div>
      </header>

      {/* ====== HERO ====== */}
      <section id="reg-form" className="relative py-16 lg:py-20">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-[1.2fr_1fr] gap-8 lg:gap-12 items-start">
          {/* LEFT — Headline */}
          <div className="text-center lg:text-left">
            <h1 className="text-[1.75rem] sm:text-[2.2rem] lg:text-[2.6rem] xl:text-[3rem] font-bold tracking-[-0.02em] leading-[1.15] text-[var(--text)] mb-4">
              Trader AI Where Smart Traders Turn Market Moves{' '}
              <span className="text-[var(--accent)]">Into Real Returns</span>
            </h1>
            <p className="text-[15px] lg:text-base text-[var(--text-secondary)] leading-relaxed mb-8">
              {HERO_CONTENT.description}
            </p>
            <div className="flex flex-wrap items-center gap-3 justify-center lg:justify-start mb-8">
              <a href="#reg-form"><Btn size="lg">Get Started Free<HiArrowRight className="w-4 h-4"/></Btn></a>
              <Btn variant="secondary" size="lg" onClick={()=>document.getElementById('demo')?.scrollIntoView({behavior:'smooth'})}>Watch Demo</Btn>
            </div>
            <div className="flex items-center gap-6 justify-center lg:justify-start text-[13px] text-[var(--text-muted)]">
              <span className="flex items-center gap-1.5"><span className="text-amber-500 text-sm">★★★★★</span> 4.8/5</span>
              <span>100K+ traders</span>
              <span>50+ countries</span>
            </div>
          </div>

          {/* RIGHT — Form */}
          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-[380px]">
              <div className="rounded-xl bg-[var(--bg-card)] border border-[var(--border)] p-6">
                <h3 className="text-lg font-semibold text-[var(--text)] text-center mb-1">{FORM_CONTENT.headline}</h3>
                <p className="text-[13px] text-[var(--text-secondary)] text-center mb-5">{FORM_CONTENT.subheadline}</p>
                {formStatus==='success'?(
                  <div className="text-center py-8">
                    <div className="w-12 h-12 rounded-lg bg-[var(--accent-light)] flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                    </div>
                    <h4 className="text-base font-semibold text-[var(--text)] mb-1">Registration Successful</h4>
                    <p className="text-[13px] text-[var(--text-secondary)]">Check your email for next steps.</p>
                  </div>
                ):(
                  <form onSubmit={submitForm} autoComplete="off" className="space-y-3.5">
                    {FORM_CONTENT.fields.map((f)=>(
                      <div key={f.id}>
                        <label className="block text-sm font-medium text-[var(--text)] mb-1.5">{f.label}</label>
                        {f.name === 'phone' ? (
                          <PhoneInput country={phoneCountry} value={form.phone} onChange={(val) => setForm(p => ({...p, phone: val}))} />
                        ) : (
                          <input name={f.name} type={f.type} value={form[f.name]} onChange={hc} required placeholder={f.label} className="w-full px-3.5 py-2.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] text-sm placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent-light)] transition-all"/>
                        )}
                      </div>
                    ))}
                    <button type="submit" disabled={formStatus==='loading'} className="w-full py-3 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 mt-1">
                      {formStatus==='loading'?'Processing...':<>{FORM_CONTENT.submitText}<HiArrowRight className="w-4 h-4"/></>}
                    </button>
                    {errorMsg && <p className="text-center text-[13px] text-[var(--red)] bg-[var(--red)]/5 rounded-lg py-2">{errorMsg}</p>}
                    <p className="text-center text-[12px] text-[var(--text-muted)]">{FORM_CONTENT.footnote2}</p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
        </div>
      </section>

      {/* ====== LIVE MARKET STATS ====== */}
      <MarketDataProvider>
      <LiveStats />
      <LiveTicker />
      <MarketOverview />

      {/* ====== TRADING CHARTS ====== */}
      <Sec alt><Bg dark={dark} /><Con wide>
        <Head headline="Live Trading Charts" subheadline="Real-time candlestick charts with drawing tools and indicators. Click any symbol to switch." />
        <TradingChart />
        <div className="mt-6"><CompanyProfile /></div>
      </Con></Sec>

      {/* ====== MORE MARKET CHARTS ====== */}
      <Sec alt><Bg dark={dark} /><Con wide>
        <Head headline="Track More Markets" subheadline="Follow Bitcoin, Ethereum, S&P 500 and more with live mini charts." />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <TVMiniChart symbol="BINANCE:BTCUSDT" title="Bitcoin (BTC/USD)" />
          <TVMiniChart symbol="BINANCE:ETHUSDT" title="Ethereum (ETH/USD)" />
          <TVMiniChart symbol="SPY" title="S&P 500 (SPY)" />
        </div>
      </Con></Sec>

      {/* ====== FOREX RATES ====== */}
      <ForexRates />
      {/* ====== ABOUT ====== */}
      <Sec alt><Bg dark={dark} /><Con>
        <Head headline={ABOUT_CONTENT.headline} />
        <p className="text-[var(--text-secondary)] text-[15px] leading-relaxed text-center mb-10 max-w-3xl mx-auto">{ABOUT_CONTENT.description}</p>
        <div className="rounded-xl bg-[var(--bg-card)] border border-[var(--border)] p-6 lg:p-8 mb-10">
          <h3 className="text-lg font-semibold text-[var(--text)] mb-6">{ABOUT_CONTENT.inflation_headline}</h3>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[{v:'−20%',l:'Real value lost',c:'text-[var(--red)]',bg:'bg-[var(--red)]/5'},{v:'+400%',l:'Nasdaq 100 growth',c:'text-[var(--accent)]',bg:'bg-[var(--accent-light)]'},{v:'<1%',l:'Bank interest/year',c:'text-[var(--amber)]',bg:'bg-[var(--amber)]/5'}].map((s,i)=>(
              <div key={i} className={`text-center p-4 rounded-lg ${s.bg} border border-[var(--border)]`}>
                <div className={`text-2xl lg:text-3xl font-semibold ${s.c} tracking-tight`}>{s.v}</div>
                <div className="text-[12px] text-[var(--text-secondary)] mt-1">{s.l}</div>
              </div>
            ))}
          </div>
          <p className="text-[var(--text-secondary)] text-[13px] leading-relaxed">{ABOUT_CONTENT.inflation_text}</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[{n:'Stocks',d:'NYSE, NASDAQ, LSE',Icon:HiTrendingUp},{n:'Crypto',d:'BTC, ETH & altcoins',Icon:HiCurrencyDollar},{n:'Forex',d:'60+ currency pairs',Icon:HiGlobeAlt},{n:'Commodities',d:'Gold, Oil, Gas',Icon:HiSparkles}].map((item,i)=>(
            <div key={i} className="p-4 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] text-center">
              <item.Icon className="w-5 h-5 text-[var(--accent)] mx-auto mb-2" />
              <h4 className="text-[13px] font-semibold text-[var(--text)]">{item.n}</h4>
              <p className="text-[12px] text-[var(--text-muted)]">{item.d}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-8"><a href="#reg-form"><Btn size="lg">Register Now <HiArrowRight className="w-3.5 h-3.5"/></Btn></a></div>
      </Con></Sec>

      {/* ====== VIDEO DEMO ====== */}
      <Sec id="demo"><Bg dark={dark} /><Con>
        <Head headline="See The AI Trader in Action" subheadline="Watch how our AI analyzes markets, spots opportunities, and helps you trade smarter." />
        <div className="max-w-4xl mx-auto">
          <div className="rounded-lg overflow-hidden border border-[var(--border)] bg-[var(--bg-card)]">
            <div className="flex items-center gap-1.5 px-4 py-3 border-b border-[var(--border)]">
              <div className="w-2.5 h-2.5 rounded-full bg-[var(--red)]/40"/>
              <div className="w-2.5 h-2.5 rounded-full bg-[var(--amber)]/40"/>
              <div className="w-2.5 h-2.5 rounded-full bg-[var(--green)]/40"/>
              <span className="ml-2 text-[11px] text-[var(--text-muted)]">theaitrader.ai</span>
            </div>
            <div className="aspect-video"><YouTubeEmbed /></div>
          </div>
        </div>
      </Con></Sec>


      {/* ====== FEATURES ====== */}
      <Sec alt><Bg dark={dark} /><Con>
        <Head headline="What You Get with The AI Trader" subheadline="Everything you need to trade smarter, faster, and with more confidence." />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {FEATURES.map((f,i)=>(
            <Card key={i} className="p-4 text-center">
              <div className="w-9 h-9 rounded-lg bg-[var(--accent-light)] flex items-center justify-center mx-auto mb-3">
                {(()=>{const ico={ChartBar:<HiChartBar className="w-4 h-4 text-[var(--accent)]"/>,Chip:<HiChip className="w-4 h-4 text-[var(--accent)]"/>,ViewGrid:<HiDatabase className="w-4 h-4 text-[var(--accent)]"/>,ShieldCheck:<HiShieldCheck className="w-4 h-4 text-[var(--accent)]"/>,Beaker:<HiLightBulb className="w-4 h-4 text-[var(--accent)]"/>,DeviceMobile:<HiDesktopComputer className="w-4 h-4 text-[var(--accent)]"/>,LockClosed:<HiLockClosed className="w-4 h-4 text-[var(--accent)]"/>,Support:<HiSupport className="w-4 h-4 text-[var(--accent)]"/>,UserGroup:<HiUserGroup className="w-4 h-4 text-[var(--accent)]"/>,DesktopComputer:<HiDesktopComputer className="w-4 h-4 text-[var(--accent)]"/>};return ico[f.icon]||<HiSparkles className="w-4 h-4 text-[var(--accent)]"/>})()}
              </div>
              <h3 className="text-sm font-semibold text-[var(--text)] mb-1.5">{f.title}</h3>
              <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">{f.description}</p>
            </Card>
          ))}
        </div>
      </Con></Sec>

      {/* ====== HOW IT WORKS ====== */}
      <Sec><Bg dark={dark} /><Con>
        <Head headline={HOW_IT_WORKS.headline} subheadline={HOW_IT_WORKS.subheadline} />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {HOW_IT_WORKS.steps.map((s,i)=>(
            <Card key={i} className="p-4 text-center">
              <div className="w-9 h-9 rounded-lg bg-[var(--accent)] text-white flex items-center justify-center text-sm font-semibold mx-auto mb-3">{s.step}</div>
              <h3 className="text-sm font-semibold text-[var(--text)] mb-1.5">{s.title}</h3>
              <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">{s.description}</p>
            </Card>
          ))}
        </div>
        <div className="text-center"><a href="#reg-form"><Btn size="lg">Start Trading Now <HiArrowRight className="w-3.5 h-3.5"/></Btn></a></div>
      </Con></Sec>

      {/* ====== WHY AI + MARKETS ====== */}
      <Sec alt><Bg dark={dark} /><Con>
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
          <div>
            <h2 className="text-xl lg:text-2xl font-semibold text-[var(--text)] tracking-tight mb-4">{WHY_AI.headline}</h2>
            <div className="space-y-3 mb-6">
              <p className="text-[var(--text-secondary)] text-[14px] leading-relaxed">{WHY_AI.description}</p>
              <p className="text-[var(--text-secondary)] text-[14px] leading-relaxed">{WHY_AI.description2}</p>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-[var(--accent-light)] border border-[var(--accent-light)]">
              <HiLightBulb className="w-4 h-4 text-[var(--accent)] mt-0.5 flex-shrink-0" />
              <p className="text-[var(--text)] text-[13px] font-medium leading-relaxed">{WHY_AI.description3}</p>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[var(--text)] mb-2">{MARKETS.headline}</h3>
            <p className="text-[var(--text-secondary)] text-[13px] leading-relaxed mb-4">{MARKETS.subheadline}</p>
            <div className="space-y-2">
              {MARKETS.items.map((m,i)=>(
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg-card)] border border-[var(--border)]">
                  <div className="w-9 h-9 rounded-lg bg-[var(--accent-light)] flex items-center justify-center flex-shrink-0">
                    {i===0?<HiTrendingUp className="w-4 h-4 text-[var(--accent)]" />:i===1?<HiChartBar className="w-4 h-4 text-[var(--accent)]" />:i===2?<HiCurrencyDollar className="w-4 h-4 text-[var(--accent)]" />:i===3?<HiGlobeAlt className="w-4 h-4 text-[var(--accent)]" />:<HiSparkles className="w-4 h-4 text-[var(--accent)]" />}
                  </div>
                  <div>
                    <h4 className="text-[13px] font-semibold text-[var(--text)]">{m.name}</h4>
                    <p className="text-[12px] text-[var(--text-secondary)]">{m.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Con></Sec>

      {/* ====== WHO IS IT FOR ====== */}
      <Sec><Bg dark={dark} /><Con>
        <Head headline={WHO_IS_IT_FOR.headline} subheadline={WHO_IS_IT_FOR.subheadline} />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {WHO_IS_IT_FOR.personas.map((p,i)=>(
            <Card key={i} className="p-4 text-center">
              <div className="w-9 h-9 rounded-lg bg-[var(--accent-light)] flex items-center justify-center mx-auto mb-3">
                {i===0?<HiAcademicCap className="w-4 h-4 text-[var(--accent)]" />:i===1?<HiTrendingUp className="w-4 h-4 text-[var(--accent)]" />:i===2?<HiCode className="w-4 h-4 text-[var(--accent)]" />:<HiBriefcase className="w-4 h-4 text-[var(--accent)]" />}
              </div>
              <h3 className="text-sm font-semibold text-[var(--text)] mb-1.5">{p.title}</h3>
              <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">{p.description}</p>
            </Card>
          ))}
        </div>
        <div className="text-center"><a href="#reg-form"><Btn size="lg">Join Now <HiArrowRight className="w-3.5 h-3.5"/></Btn></a></div>
      </Con></Sec>

      {/* ====== APP SECTION ====== */}
      <Sec alt><Bg dark={dark} /><Con>
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="flex justify-center order-2 lg:order-1">
            <div className="p-2 rounded-xl border border-[var(--border)] bg-[var(--bg-card)]">
              <img src="/Trade AI.webp" alt="The AI Trader App" loading="lazy" className="w-full h-auto rounded-lg" />
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <h2 className="text-xl lg:text-2xl font-semibold text-[var(--text)] tracking-tight mb-3">{APP_SECTION.headline}</h2>
            <p className="text-[var(--text-secondary)] text-[14px] leading-relaxed mb-5">{APP_SECTION.subheadline}</p>
            <ul className="space-y-2 mb-6">
              {APP_SECTION.features.map((f,i)=>(
                <li key={i} className="flex items-start gap-2.5 text-[13px] text-[var(--text-secondary)]">
                  <svg className="w-4 h-4 text-[var(--accent)] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
                  {f}
                </li>
              ))}
            </ul>
            <div className="grid grid-cols-4 gap-3 mb-6"><LiveAppStat /></div>
            <a href="#reg-form"><Btn size="lg">Get the App <HiArrowRight className="w-3.5 h-3.5"/></Btn></a>
          </div>
        </div>
      </Con></Sec>
      </MarketDataProvider>

      {/* ====== WHY CHOOSE US ====== */}
      <Sec><Bg dark={dark} /><Con>
        <Head headline={WHY_CHOOSE_US.headline} subheadline={WHY_CHOOSE_US.subheadline} />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
          {WHY_CHOOSE_US.items.map((item,i)=>(
            <Card key={i} className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--accent-light)] flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i===0?<HiChip className="w-4 h-4 text-[var(--accent)]" />:i===1?<HiEmojiHappy className="w-4 h-4 text-[var(--accent)]" />:i===2?<HiDatabase className="w-4 h-4 text-[var(--accent)]" />:i===3?<HiCog className="w-4 h-4 text-[var(--accent)]" />:i===4?<HiScale className="w-4 h-4 text-[var(--accent)]" />:<HiBadgeCheck className="w-4 h-4 text-[var(--accent)]" />}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[var(--text)] mb-1">{item.title}</h3>
                  <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">{item.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
        <div className="text-center"><a href="#reg-form"><Btn size="xl">Register Now <HiArrowRight className="w-3.5 h-3.5"/></Btn></a></div>
      </Con></Sec>

      {/* ====== THINGS TO KNOW ====== */}
      <Sec alt><Bg dark={dark} /><Con>
        <Head headline={THINGS_TO_KEEP_IN_MIND.headline} />
        <div className="grid sm:grid-cols-3 gap-4">
          {THINGS_TO_KEEP_IN_MIND.items.map((item,i)=>(
            <div key={i} className="p-4 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] text-center">
              <div className="w-9 h-9 rounded-lg bg-[var(--accent-light)] flex items-center justify-center mx-auto mb-3">
                {i===0?<HiExclamation className="w-4 h-4 text-[var(--accent)]" />:i===1?<HiClipboardList className="w-4 h-4 text-[var(--accent)]" />:<HiKey className="w-4 h-4 text-[var(--accent)]" />}
              </div>
              <h3 className="text-sm font-semibold text-[var(--text)] mb-1.5">{item.title}</h3>
              <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </Con></Sec>

      {/* ====== FAQ ====== */}
      <Sec><Bg dark={dark} /><Con>
        <Head headline="Frequently Asked Questions" />
        <div className="max-w-2xl mx-auto space-y-2">
          {FAQ_ITEMS.map((item,i)=>(<FaqItem key={i} {...item} open={i===0}/>))}
        </div>
        <div className="text-center mt-8">
          <p className="text-[13px] text-[var(--text-secondary)] mb-3">Still have questions?</p>
          <Link to="/contact-us"><Btn variant="secondary" size="lg">Contact Support <HiArrowRight className="w-3.5 h-3.5"/></Btn></Link>
        </div>
      </Con></Sec>

      {/* ====== CTA ====== */}
      <Sec alt><Bg dark={dark} /><Con>
        <div className="rounded-xl bg-[var(--bg-card)] border border-[var(--border)] p-10 lg:p-14 text-center">
          <h2 className="text-2xl lg:text-3xl font-semibold text-[var(--text)] tracking-tight mb-3">
            Ready to trade <span className="text-[var(--accent)]">smarter?</span>
          </h2>
          <p className="text-[var(--text-secondary)] text-[14px] max-w-md mx-auto mb-8">Join 100,000+ traders across 50+ countries using AI to level up their trading.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
            <a href="#reg-form"><Btn size="xl">Create Free Account <HiArrowRight className="w-3.5 h-3.5"/></Btn></a>
            <Link to="/about-us"><Btn variant="secondary" size="xl">Learn More</Btn></Link>
          </div>
          <p className="text-[12px] text-[var(--text-muted)]">Free to start. $250 minimum deposit. No hidden fees.</p>
        </div>
      </Con></Sec>

      {/* ====== FOOTER ====== */}
      <footer className="border-t border-[var(--border)] bg-[var(--bg-alt)]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Top: Logo + Contact + Follow */}
          <div className="grid grid-cols-1 sm:grid-cols-[40%_30%_30%] gap-10 lg:gap-14 pb-12 border-b border-[var(--border)]">
            <div>
              <Logo />
              <p className="text-[var(--text-secondary)] text-sm mt-5 leading-relaxed max-w-sm">The AI Trader makes ai trading easier and smarter. Analyze markets in real-time, automate strategies safely, stay fully in control.</p>
              <div className="flex items-center gap-3 mt-5">
                <span className="text-amber-400 text-sm">★★★★★</span>
                <span className="text-[var(--text-muted)] text-xs">4.8/5 rated by 2,400+ traders</span>
              </div>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-[var(--text)] uppercase tracking-wider mb-5">Contact</h3>
              <div className="space-y-3">
                <p className="text-[var(--text-secondary)] text-sm flex items-center gap-3 group hover:text-[var(--text)] transition-colors">
                  <span className="w-8 h-8 rounded-lg bg-[#10b981]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#10b981] transition-colors">
                    <svg className="w-4 h-4 text-[#10b981] group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                  </span>
                  AU +61 284 889 800
                </p>
                <p className="text-[var(--text-secondary)] text-sm flex items-center gap-3 group hover:text-[var(--text)] transition-colors">
                  <span className="w-8 h-8 rounded-lg bg-[#10b981]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#10b981] transition-colors">
                    <svg className="w-4 h-4 text-[#10b981] group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                  </span>
                  UK +44 203 927 2999
                </p>
                <p className="text-[var(--text-secondary)] text-sm flex items-center gap-3 group hover:text-[var(--text)] transition-colors">
                  <span className="w-8 h-8 rounded-lg bg-[#10b981]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#10b981] transition-colors">
                    <svg className="w-4 h-4 text-[#10b981] group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                  </span>
                  info@traderai.ai
                </p>
              </div>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-[var(--text)] uppercase tracking-wider mb-5">Follow Us</h3>
              <div className="flex items-center gap-3">
                {[
                  {n:'Facebook',d:'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z'},
                  {n:'Instagram',d:'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z'},
                  {n:'YouTube',d:'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z'},
                  {n:'X',d:'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z'},
                ].map(s=>(
                  <a key={s.n} href="#" className="w-10 h-10 rounded-xl bg-[#10b981]/10 hover:bg-[#10b981] flex items-center justify-center text-[#10b981] hover:text-white transition-all hover:scale-110 hover:shadow-lg hover:shadow-[#10b981]/20" title={s.n}>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d={s.d}/></svg>
                  </a>
                ))}
              </div>
            </div>
          </div>
          {/* Disclaimer */}
          <div className="py-8 border-b border-[var(--border)] space-y-4">
            <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed"><strong className="text-[var(--text)] font-semibold">HIGH RISK WARNING:</strong> Dealing or Trading FX, CFDs and Cryptocurrencies is highly speculative, carries a level of non-negligible risk and may not be suitable for all investors. You may lose some or all of your invested capital, therefore you should not speculate with capital that you cannot afford to lose. Please refer to the risk disclosure below. traderai.ai does not gain or lose profits based on your activity and operates as a services company. traderai.ai is not a financial services firm and is not eligible of providing financial advice. traderai.ai shall not be liable for any losses occurred via or in relation to this informational website.</p>
            <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed"><strong className="text-[var(--text)] font-semibold">SITE RISK DISCLOSURE:</strong> traderai.ai does not accept any liability for loss or damage as a result of reliance on the information contained within this website; this includes education material, price quotes and charts, and analysis. Please be aware of and seek professional advice for the risks associated with trading the financial markets; never invest more money than you can risk losing. The risks involved in FX, CFDs and Cryptocurrencies may not be suitable for all investors. traderai.ai doesn't retain responsibility for any trading losses you might face as a result of using or inferring from the data hosted on this site.</p>
            <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed"><strong className="text-[var(--text)] font-semibold">LEGAL RESTRICTIONS:</strong> Without limiting the above mentioned provisions, you understand that laws regarding financial activities vary throughout the world, and it is your responsibility to make sure you properly comply with any law, regulation or guideline in your country of residence regarding the use of the Site. To avoid any doubt, the ability to access our Site does not necessarily mean that our Services and/or your activities through the Site are legal under the laws, regulations or directives relevant to your country of residence. It is against the law to solicit US individuals to buy and sell commodity options, even if they are called 'prediction' contracts, unless they are listed for trading and traded on a CFTC-registered exchange unless legally exempt. The UK Financial Conduct Authority has issued a policy statement PS20/10, which prohibits the sale, promotion, and distribution of CFD on Crypto assets. It prohibits the dissemination of marketing materials relating to distribution of CFDs and other financial products based on Cryptocurrencies that addressed to UK residents. The provision of trading services involving any MiFID II financial instruments is prohibited in the EU, unless when authorized/licensed by the applicable authorities and/or regulator(s). Please note that we may receive advertising fees for users opted to open an account with our partner advertisers via advertisers' websites. We have placed cookies on your computer to help improve your experience when visiting this website. You can change cookie settings on your computer at any time. Use of this website indicates your acceptance of this website.</p>
          </div>
          {/* Bottom bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8">
            <div className="flex items-center gap-6 text-[13px] text-[var(--text-secondary)]">
              <Link to="/privacy-policy" className="hover:text-[var(--text)] transition-colors">Privacy Policy</Link>
              <Link to="/terms-conditions" className="hover:text-[var(--text)] transition-colors">Terms &amp; Conditions</Link>
              <Link to="/disclaimer" className="hover:text-[var(--text)] transition-colors">Disclaimer</Link>
            </div>
            <p className="text-[12px] text-[var(--text-muted)]">Copyright © 2026 The AI Trader | All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function YouTubeEmbed() {
  const [load, setLoad] = useState(false);
  return load ? (
    <iframe src="https://www.youtube.com/embed/u3T7fLT4qGQ?autoplay=1" title="The AI Trader" className="w-full h-full" allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"/>
  ) : (
    <button onClick={()=>setLoad(true)} className="w-full h-full relative bg-black flex items-center justify-center group cursor-pointer overflow-hidden">
      <img src="/TRADER AI THUMBNAIL 3.webp" alt="The AI Trader - Watch Video" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors flex items-center justify-center">
        <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-[#10b981] flex items-center justify-center shadow-2xl shadow-[#10b981]/50 group-hover:scale-110 transition-transform">
          <svg className="w-7 h-7 lg:w-9 lg:h-9 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
        </div>
      </div>
    </button>
  );
}

function FaqItem({ question, answer, open: defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`rounded-2xl border transition-all duration-500 ${open ? 'bg-[var(--bg-card)] border-[#10b981]/20 shadow-lg shadow-[#10b981]/[0.03]' : 'bg-[var(--bg-card)]/50 border-[var(--border)] hover:border-[#10b981]/10 hover:shadow-md'}`}>
      <button onClick={()=>setOpen(!open)} className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left">
        <span className={`text-[15px] font-semibold transition-colors duration-300 ${open ? 'text-[var(--text)]' : 'text-[var(--text-secondary)] hover:text-[var(--text)]'}`}>{question}</span>
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${open ? 'bg-[#10b981] text-white shadow-md shadow-[#10b981]/20' : 'bg-[var(--bg)] text-[var(--text-muted)] border border-[var(--border)]'}`}>
          <svg className={`w-4 h-4 transition-transform duration-300 ${open?'rotate-180':''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7"/></svg>
        </div>
      </button>
      <div className={`overflow-hidden transition-all duration-500 ${open ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <p className="px-5 pb-5 text-sm text-[var(--text-secondary)] leading-relaxed">{answer}</p>
      </div>
    </div>
  );
}
