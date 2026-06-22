import { useState, useEffect, useRef } from 'react';
import { HiArrowRight, HiChevronDown, HiSun, HiMoon, HiUserGroup, HiGlobe, HiChartBar, HiStar } from 'react-icons/hi';
import { Link, useLocation } from 'react-router-dom';
import { HERO_CONTENT, FORM_CONTENT, ABOUT_CONTENT, FEATURES, HOW_IT_WORKS, WHY_AI, MARKETS, WHO_IS_IT_FOR, APP_SECTION, WHY_CHOOSE_US, THINGS_TO_KEEP_IN_MIND, FAQ_ITEMS, FOOTER_CONTENT } from '../data/content';

/* ============================================================
   ALL CONTENT from traderai.ai
   Active nav + Dark/Light mode + Green logo
   ============================================================ */

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-3 flex-shrink-0 group">
      <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[#11643F] to-[#0e5434] flex items-center justify-center shadow-lg shadow-[#11643F]/30 group-hover:shadow-[#11643F]/40 group-hover:scale-105 transition-all duration-300">
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/10 to-transparent" />
        <svg className="w-5 h-5 text-white relative z-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          <line x1="12" y1="3" x2="12" y2="21" strokeWidth="1" stroke="white" opacity="0.3" />
        </svg>
      </div>
      <span className="text-lg font-extrabold text-[var(--text)] group-hover:text-[var(--text)] transition-colors">The AI <span className="text-[#FC6612]">Trader</span></span>
    </Link>
  );
}

const COUNTRIES = [
  {code:'+93',flag:'🇦🇫',name:'Afghanistan'},{code:'+355',flag:'🇦🇱',name:'Albania'},{code:'+213',flag:'🇩🇿',name:'Algeria'},{code:'+54',flag:'🇦🇷',name:'Argentina'},{code:'+374',flag:'🇦🇲',name:'Armenia'},{code:'+61',flag:'🇦🇺',name:'Australia'},{code:'+43',flag:'🇦🇹',name:'Austria'},{code:'+973',flag:'🇧🇭',name:'Bahrain'},{code:'+880',flag:'🇧🇩',name:'Bangladesh'},{code:'+375',flag:'🇧🇾',name:'Belarus'},{code:'+32',flag:'🇧🇪',name:'Belgium'},{code:'+591',flag:'🇧🇴',name:'Bolivia'},{code:'+55',flag:'🇧🇷',name:'Brazil'},{code:'+359',flag:'🇧🇬',name:'Bulgaria'},{code:'+855',flag:'🇰🇭',name:'Cambodia'},{code:'+237',flag:'🇨🇲',name:'Cameroon'},{code:'+1',flag:'🇨🇦',name:'Canada'},{code:'+56',flag:'🇨🇱',name:'Chile'},{code:'+86',flag:'🇨🇳',name:'China'},{code:'+57',flag:'🇨🇴',name:'Colombia'},{code:'+506',flag:'🇨🇷',name:'Costa Rica'},{code:'+385',flag:'🇭🇷',name:'Croatia'},{code:'+53',flag:'🇨🇺',name:'Cuba'},{code:'+420',flag:'🇨🇿',name:'Czechia'},{code:'+45',flag:'🇩🇰',name:'Denmark'},{code:'+1-809',flag:'🇩🇴',name:'Dominican Rep'},{code:'+593',flag:'🇪🇨',name:'Ecuador'},{code:'+20',flag:'🇪🇬',name:'Egypt'},{code:'+503',flag:'🇸🇻',name:'El Salvador'},{code:'+372',flag:'🇪🇪',name:'Estonia'},{code:'+251',flag:'🇪🇹',name:'Ethiopia'},{code:'+358',flag:'🇫🇮',name:'Finland'},{code:'+33',flag:'🇫🇷',name:'France'},{code:'+49',flag:'🇩🇪',name:'Germany'},{code:'+233',flag:'🇬🇭',name:'Ghana'},{code:'+30',flag:'🇬🇷',name:'Greece'},{code:'+502',flag:'🇬🇹',name:'Guatemala'},{code:'+504',flag:'🇭🇳',name:'Honduras'},{code:'+36',flag:'🇭🇺',name:'Hungary'},{code:'+354',flag:'🇮🇸',name:'Iceland'},{code:'+91',flag:'🇮🇳',name:'India'},{code:'+62',flag:'🇮🇩',name:'Indonesia'},{code:'+98',flag:'🇮🇷',name:'Iran'},{code:'+964',flag:'🇮🇶',name:'Iraq'},{code:'+353',flag:'🇮🇪',name:'Ireland'},{code:'+972',flag:'🇮🇱',name:'Israel'},{code:'+39',flag:'🇮🇹',name:'Italy'},{code:'+1-876',flag:'🇯🇲',name:'Jamaica'},{code:'+81',flag:'🇯🇵',name:'Japan'},{code:'+962',flag:'🇯🇴',name:'Jordan'},{code:'+7',flag:'🇰🇿',name:'Kazakhstan'},{code:'+254',flag:'🇰🇪',name:'Kenya'},{code:'+965',flag:'🇰🇼',name:'Kuwait'},{code:'+371',flag:'🇱🇻',name:'Latvia'},{code:'+961',flag:'🇱🇧',name:'Lebanon'},{code:'+218',flag:'🇱🇾',name:'Libya'},{code:'+370',flag:'🇱🇹',name:'Lithuania'},{code:'+352',flag:'🇱🇺',name:'Luxembourg'},{code:'+60',flag:'🇲🇾',name:'Malaysia'},{code:'+52',flag:'🇲🇽',name:'Mexico'},{code:'+373',flag:'🇲🇩',name:'Moldova'},{code:'+212',flag:'🇲🇦',name:'Morocco'},{code:'+95',flag:'🇲🇲',name:'Myanmar'},{code:'+977',flag:'🇳🇵',name:'Nepal'},{code:'+31',flag:'🇳🇱',name:'Netherlands'},{code:'+64',flag:'🇳🇿',name:'New Zealand'},{code:'+234',flag:'🇳🇬',name:'Nigeria'},{code:'+47',flag:'🇳🇴',name:'Norway'},{code:'+968',flag:'🇴🇲',name:'Oman'},{code:'+92',flag:'🇵🇰',name:'Pakistan'},{code:'+507',flag:'🇵🇦',name:'Panama'},{code:'+595',flag:'🇵🇾',name:'Paraguay'},{code:'+51',flag:'🇵🇪',name:'Peru'},{code:'+63',flag:'🇵🇭',name:'Philippines'},{code:'+48',flag:'🇵🇱',name:'Poland'},{code:'+351',flag:'🇵🇹',name:'Portugal'},{code:'+974',flag:'🇶🇦',name:'Qatar'},{code:'+40',flag:'🇷🇴',name:'Romania'},{code:'+7',flag:'🇷🇺',name:'Russia'},{code:'+250',flag:'🇷🇼',name:'Rwanda'},{code:'+966',flag:'🇸🇦',name:'Saudi Arabia'},{code:'+221',flag:'🇸🇳',name:'Senegal'},{code:'+381',flag:'🇷🇸',name:'Serbia'},{code:'+65',flag:'🇸🇬',name:'Singapore'},{code:'+421',flag:'🇸🇰',name:'Slovakia'},{code:'+386',flag:'🇸🇮',name:'Slovenia'},{code:'+27',flag:'🇿🇦',name:'South Africa'},{code:'+82',flag:'🇰🇷',name:'South Korea'},{code:'+34',flag:'🇪🇸',name:'Spain'},{code:'+94',flag:'🇱🇰',name:'Sri Lanka'},{code:'+46',flag:'🇸🇪',name:'Sweden'},{code:'+41',flag:'🇨🇭',name:'Switzerland'},{code:'+886',flag:'🇹🇼',name:'Taiwan'},{code:'+255',flag:'🇹🇿',name:'Tanzania'},{code:'+66',flag:'🇹🇭',name:'Thailand'},{code:'+216',flag:'🇹🇳',name:'Tunisia'},{code:'+90',flag:'🇹🇷',name:'Turkey'},{code:'+256',flag:'🇺🇬',name:'Uganda'},{code:'+380',flag:'🇺🇦',name:'Ukraine'},{code:'+971',flag:'🇦🇪',name:'UAE'},{code:'+44',flag:'🇬🇧',name:'UK'},{code:'+1',flag:'🇺🇸',name:'US'},{code:'+58',flag:'🇻🇪',name:'Venezuela'},{code:'+84',flag:'🇻🇳',name:'Vietnam'},{code:'+260',flag:'🇿🇲',name:'Zambia'},{code:'+263',flag:'🇿🇼',name:'Zimbabwe'},
];

function CountrySelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [ddStyle, setDdStyle] = useState({});
  const btnRef = useRef(null);
  const selected = COUNTRIES.find(c=>c.code===value) || COUNTRIES[0];
  const handleOpen = (e) => {
    e.stopPropagation();
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      if (window.innerHeight - r.bottom < 320) {
        setDdStyle({ bottom: window.innerHeight - r.top + 4, left: r.left });
      } else {
        setDdStyle({ top: r.bottom + 4, left: r.left });
      }
    }
    setOpen(!open);
  };
  return (
    <div className="relative flex-shrink-0">
      <button ref={btnRef} type="button" onClick={handleOpen} className="flex items-center gap-1.5 py-3 pl-4 pr-2 text-sm text-[var(--text)] cursor-pointer whitespace-nowrap border-r border-[var(--border)]">
        <span>{selected.flag}</span>
        <span className="font-medium">{selected.code}</span>
        <svg className={`w-3 h-3 text-[var(--text-muted)] transition-transform ${open?'rotate-180':''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-[9998]" onClick={()=>setOpen(false)}/>
          <div className="fixed z-[9999] w-64 max-h-72 overflow-y-auto rounded-xl bg-[#181B24] border border-[#2a3040] shadow-2xl py-1" style={ddStyle}>
            {COUNTRIES.map(c=>(
              <button key={c.code} type="button" onClick={()=>{onChange(c.code);setOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-white/[0.05] transition-colors ${c.code===value?'bg-white/[0.05] text-[#FC6612] font-semibold':'text-[#cbd5e1]'}`}>
                <span className="text-base">{c.flag}</span>
                <span>{c.name}</span>
                <span className="ml-auto text-[#94a3b8] text-xs">{c.code}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function Sec({ children, id, className = '' }) {
  return <section id={id} className={`relative border-t border-[var(--border)] reveal ${className}`}>{children}</section>;
}
function Con({ children }) {
  return <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 relative z-10">{children}</div>;
}
function Head({ headline, subheadline }) {
  return (
    <div className="text-center mb-12">
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[var(--text)] mb-3">{headline}</h2>
      {subheadline && <p className="text-base lg:text-lg text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">{subheadline}</p>}
    </div>
  );
}
function Btn({ children, variant = 'primary', size = 'md', className = '', ...p }) {
  const base = 'cursor-pointer inline-flex items-center justify-center gap-1.5 font-semibold transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed';
  const sz = { sm: 'px-4 py-2 text-[13px] rounded-lg', md: 'px-5 py-2.5 text-[13px] rounded-lg', lg: 'px-6 py-3 text-sm rounded-xl', xl: 'px-8 py-3.5 text-[15px] rounded-xl' };
  if (variant === 'secondary') return <button className={`${base} bg-transparent hover:bg-white/[0.05] text-[var(--text)] border-2 border-white/20 hover:border-white/40 ${sz[size]} ${className}`} {...p}>{children}</button>;
  if (variant === 'green') return <button style={{background:'linear-gradient(135deg, #11643F, #0e5434)'}} className={`${base} text-white shadow-lg shadow-[#11643F]/20 ${sz[size]} ${className}`} {...p}>{children}</button>;
  return <button style={{background:'linear-gradient(135deg, #FC6612, #11643F)'}} className={`${base} text-white shadow-lg shadow-[#FC6612]/20 ${sz[size]} ${className}`} {...p}>{children}</button>;
}
function Card({ children, className = '', delay = 0 }) {
  return <div className={`rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--border-strong)] transition-all duration-300 hover:-translate-y-1 reveal ${delay ? `delay-${delay}` : ''} ${className}`}>{children}</div>;
}

// Menu items matching traderai.ai + Home
const NAV = [
  { label: 'Home', to: '/' },
  { label: 'About Us', to: '/about-us' },
  { label: 'Blog', to: '/blog' },
  { label: 'Contact Us', to: '/contact-us' },
];

export default function HomePage() {
  const loc = useLocation();
  const [dark, setDark] = useState(true);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', phoneCode: '+1' });

  // Auto-detect country from browser locale
  useEffect(() => {
    try {
      const cc = (navigator.language||'').split('-')[1]?.toUpperCase();
      const map = {US:'+1',GB:'+44',IN:'+91',AU:'+61',CN:'+86',DE:'+49',FR:'+33',JP:'+81',RU:'+7',BR:'+55',IT:'+39',ES:'+34',NL:'+31',SE:'+46',CH:'+41',PL:'+48',PK:'+92',PH:'+63',MX:'+52',AE:'+971',NG:'+234',SA:'+966',EG:'+20',ZA:'+27',KR:'+82',VN:'+84',TH:'+66',MY:'+60',ID:'+62',TR:'+90',CA:'+1'};
      const code = map[cc];
      if(code) setForm(p=>({...p, phoneCode: code}));
    } catch(e) {}
  }, []);
  const [formStatus, setFormStatus] = useState('idle');
  const hc = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

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

  // Section background with light/dark variants
  function Bg({ variant = 'default' }) {
    if (!dark) {
      // Light mode backgrounds
      switch (variant) {
        case 'hero': return (<><div className="absolute inset-0 bg-gradient-to-b from-[#f8fafc] via-[#f8fafc] to-[#f1f5f9]"/><div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#FC6612]/[0.04] rounded-full blur-3xl pointer-events-none"/></>);
        case 'green': return (<><div className="absolute inset-0 bg-gradient-to-br from-[#f0fdf4] via-[#f8fafc] to-[#ecfdf5]"/><div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#11643F]/[0.03] rounded-full blur-3xl pointer-events-none"/></>);
        case 'warm': return (<><div className="absolute inset-0 bg-gradient-to-br from-[#fff7ed] via-[#f8fafc] to-[#fffbeb]"/><div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#FC6612]/[0.03] rounded-full blur-3xl pointer-events-none"/></>);
        case 'blue': return (<><div className="absolute inset-0 bg-gradient-to-br from-[#eff6ff] via-[#f8fafc] to-[#eef2ff]"/><div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#6366f1]/[0.03] rounded-full blur-3xl pointer-events-none"/></>);
        default: return (<><div className="absolute inset-0 bg-[var(--bg)]"/><div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#11643F]/[0.02] rounded-full blur-3xl pointer-events-none"/></>);
      }
    }
    // Dark mode backgrounds
    switch (variant) {
      case 'hero': return (<><div className="absolute inset-0 bg-gradient-to-b from-[#0A0D14] via-[#080A0F] to-[#080A0F]"/><div className="absolute top-0 right-0 w-[700px] h-[700px] bg-[#FC6612]/[0.05] rounded-full blur-3xl pointer-events-none"/><div className="absolute bottom-0 left-1/3 w-[500px] h-[500px] bg-[#11643F]/[0.03] rounded-full blur-3xl pointer-events-none"/></>);
      case 'green': return (<><div className="absolute inset-0 bg-gradient-to-br from-[#0A0E0D] via-[#0A0C0B] to-[#0A0D0C]"/><div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#11643F]/[0.02] rounded-full blur-3xl pointer-events-none"/></>);
      case 'warm': return (<><div className="absolute inset-0 bg-gradient-to-br from-[#0C0C0A] via-[#0B0B09] to-[#0B0B0C]"/><div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#FC6612]/[0.015] rounded-full blur-3xl pointer-events-none"/></>);
      case 'blue': return (<><div className="absolute inset-0 bg-gradient-to-br from-[#0A0C11] via-[#0A0B10] to-[#0A0C12]"/><div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#6366f1]/[0.01] rounded-full blur-3xl pointer-events-none"/></>);
      default: return (<><div className="absolute inset-0 bg-[var(--bg)]"/><div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#11643F]/[0.01] rounded-full blur-3xl pointer-events-none"/></>);
    }
  }

  const submitForm = async (e) => {
    e.preventDefault(); setFormStatus('loading');
    await new Promise((r) => setTimeout(r, 1500));
    setFormStatus('success'); setForm({ firstName: '', lastName: '', email: '', phone: '', phoneCode: form.phoneCode });
  };

  return (
    <div className="bg-[var(--bg)] min-h-screen text-[var(--text)]">

      {/* ====== HEADER ====== */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--bg-alt)]/95 backdrop-blur-xl border-b-2 border-[var(--border-strong)]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-[68px]">
          <Logo />
          <nav className="hidden lg:flex items-center gap-2">
            {NAV.map(link => {
              const active = loc.pathname === link.to;
              return (
                <Link key={link.to} to={link.to}
                  className={`px-4 py-2 text-[14px] font-medium rounded-lg transition-colors ${
                    active ? 'text-[#FC6612] bg-[#FC6612]/[0.08]' : 'text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-white/[0.03]'
                  }`}>{link.label}</Link>
              );
            })}
            <button onClick={() => setDark(!dark)} title="Toggle theme"
              className="ml-2 w-9 h-9 rounded-lg border border-[var(--border-strong)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[#FC6612] hover:border-[#FC6612]/20 transition-colors">
              {dark ? <HiSun className="w-4 h-4" /> : <HiMoon className="w-4 h-4" />}
            </button>
          </nav>
          <div className="hidden lg:block">
            <a href="#start-form" className="cursor-pointer inline-flex px-5 py-2.5 text-[14px] font-semibold rounded-lg text-white transition-all shadow-lg shadow-[#FC6612]/20" style={{background:'linear-gradient(135deg, #FC6612, #11643F)'}}>Start Trading</a>
          </div>
          <button className="lg:hidden p-2 text-[var(--text-secondary)]"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/></svg></button>
        </div>
      </header>

      {/* ====== HERO ====== */}
      <section id="reg-form" className="relative pt-20 pb-0 lg:pt-28 lg:pb-0"><Bg variant="hero" /><Con>
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* LEFT — Text + Trust */}
          <div className="text-center lg:text-left">
            <h1 className="text-[1.75rem] sm:text-[2.2rem] lg:text-[2.8rem] xl:text-[3.2rem] font-extrabold tracking-[-0.02em] leading-[1.12] text-[var(--text)] mb-5">
              Trader AI — Where Smart Traders Turn Market Moves{' '}
              <span className="text-[#FC6612]">Into Real Returns</span>
            </h1>
            <p className="text-[var(--text-secondary)] text-base lg:text-lg leading-relaxed mb-6 max-w-[540px] lg:max-w-none">
              {HERO_CONTENT.description}
            </p>
            {/* Trust badges */}
            <div className="flex flex-wrap items-center gap-3 mb-7">
              {[{icon:'🚀',t:'Free Sign UP'},{icon:'🔒',t:'Secure Connection'},{icon:'💳',t:'Withdraw Anytime'}].map((s,i)=>(
                <span key={i} className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-[var(--text-secondary)] bg-[var(--bg-card)] border border-[var(--border)] rounded-full px-4 py-2">
                  <span className="text-sm">{s.icon}</span>{s.t}
                </span>
              ))}
            </div>
            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start mb-8">
              <a href="#reg-form"><Btn size="xl">Start Free<HiArrowRight className="w-5 h-5"/></Btn></a>
              <Btn variant="secondary" size="xl" onClick={()=>document.getElementById('demo')?.scrollIntoView({behavior:'smooth'})}>See How It Works</Btn>
            </div>
            {/* Trusted By */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 justify-center lg:justify-start text-sm">
              <span className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                <span className="text-amber-400 text-base">★★★★★</span>
                <span className="font-semibold text-[var(--text)]">4.8/5</span>
                <span className="text-[var(--text-muted)]">rated by 2,400+ traders</span>
              </span>
              <span className="text-[var(--text-muted)] hidden sm:inline">•</span>
              <span className="text-[var(--text-muted)]">Trusted by <span className="font-semibold text-[var(--text)]">100,000+</span> traders worldwide</span>
            </div>
          </div>

          {/* RIGHT — Form Card (larger, more prominent) */}
          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-[420px]">
              <div className="relative rounded-2xl bg-[var(--bg-card)] border border-[var(--border-strong)] p-7 sm:p-8 shadow-2xl shadow-black/20 dark:shadow-black/50">
                {/* Glow behind card */}
                <div className="absolute -top-10 right-10 w-40 h-40 bg-[#FC6612]/[0.06] dark:bg-[#FC6612]/[0.04] rounded-full blur-2xl pointer-events-none"/>
                <h3 className="text-xl font-bold text-[var(--text)] text-center mb-1">{FORM_CONTENT.headline}</h3>
                <p className="text-sm text-[var(--text-secondary)] text-center mb-6">{FORM_CONTENT.subheadline}</p>
                {formStatus==='success'?(
                  <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-2xl bg-[#11643F]/10 flex items-center justify-center mx-auto mb-4"><svg className="w-8 h-8 text-[#11643F]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg></div>
                    <h4 className="text-lg font-bold text-[var(--text)] mb-1">Registration Successful!</h4>
                    <p className="text-sm text-[var(--text-secondary)]">Welcome to The AI Trader. Check your email.</p>
                  </div>
                ):(
                  <form onSubmit={submitForm} autoComplete="off" className="space-y-4">
                    {FORM_CONTENT.fields.map((f)=>(
                      <div key={f.id}>
                        <label className="block text-sm font-semibold text-[var(--text)] mb-1.5">{f.label}</label>
                        {f.name === 'phone' ? (
                          <div className="flex rounded-xl bg-[var(--bg)] border border-[var(--border-strong)] focus-within:border-[#FC6612]/50 focus-within:ring-2 focus-within:ring-[#FC6612]/10 transition-all">
                            <CountrySelect value={form.phoneCode} onChange={(code)=>setForm(p=>({...p,phoneCode:code}))}/>
                            <input name="phone" type="tel" value={form.phone} onChange={hc} required placeholder="Phone number" className="flex-1 px-3 py-3 bg-transparent text-[var(--text)] text-sm placeholder-[var(--text-secondary)] outline-none"/>
                          </div>
                        ) : (
                          <input name={f.name} type={f.type} value={form[f.name]} onChange={hc} required placeholder={`Enter your ${f.label.toLowerCase()}`} className="w-full px-4 py-3 rounded-xl bg-[var(--bg)] border border-[var(--border-strong)] text-[var(--text)] text-sm placeholder-[var(--text-secondary)] focus:outline-none focus:border-[#FC6612]/50 focus:ring-2 focus:ring-[#FC6612]/10 transition-all"/>
                        )}
                      </div>
                    ))}
                    <button type="submit" disabled={formStatus==='loading'} style={{background:'linear-gradient(135deg, #FC6612, #11643F)'}} className="w-full py-4 rounded-xl hover:brightness-90 text-white font-bold text-[15px] transition-all shadow-lg shadow-[#FC6612]/25 hover:shadow-[#FC6612]/40 flex items-center justify-center gap-2 mt-2">{formStatus==='loading'?'Processing...':<>{FORM_CONTENT.submitText}<HiArrowRight className="w-5 h-5"/></>}</button>
                    <p className="text-center text-xs text-[var(--text-secondary)]">{FORM_CONTENT.footnote2}</p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>

      </Con></section>

      {/* ====== STATS BAR ====== */}
      <section className="relative bg-[#11643F]/[0.04] dark:bg-[#11643F]/[0.06] border-y border-[var(--border)]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
          <div className="flex flex-wrap justify-center gap-14 sm:gap-20 lg:gap-32">
            {[{v:'100,000+',l:'Active Traders',icon:HiUserGroup},{v:'50+',l:'Countries',icon:HiGlobe},{v:'24/7',l:'AI Market Scanning',icon:HiChartBar},{v:'4.8 ★',l:'User Rating',icon:HiStar}].map((s,i)=>(
              <div key={i} className="flex items-center gap-4">
                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-[#11643F]/10 flex items-center justify-center flex-shrink-0">
                  <s.icon className="w-5 h-5 lg:w-6 lg:h-6 text-[#11643F]" />
                </div>
                <div>
                  <div className="text-[1.2rem] sm:text-[1.4rem] lg:text-[1.6rem] font-bold text-[var(--text)] tracking-[-0.01em]">{s.v}</div>
                  <div className="text-[11px] sm:text-[12px] text-[var(--text-muted)]">{s.l}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== ABOUT ====== */}
      <Sec><Bg variant="green" /><Con>
        <div className="max-w-[1440px]">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[var(--text)] text-center mb-4">{ABOUT_CONTENT.headline}</h2>
          <p className="text-[var(--text-secondary)] text-base lg:text-lg leading-relaxed text-center mb-10">{ABOUT_CONTENT.description}</p>

          {/* Inflation Highlight Card */}
          <div className="relative rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] p-8 lg:p-10 mb-10 overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#FC6612]/[0.04] rounded-full blur-2xl pointer-events-none" />
            <h3 className="text-xl font-bold text-[var(--text)] mb-6">{ABOUT_CONTENT.inflation_headline}</h3>
            <div className="grid sm:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-5 rounded-xl bg-[var(--bg)] border border-[var(--border)]">
                <div className="text-[1.75rem] sm:text-[2rem] font-extrabold text-[#ef4444]">−20%</div>
                <div className="text-sm font-medium text-[var(--text-secondary)] mt-1">Real value lost</div>
              </div>
              <div className="text-center p-5 rounded-xl bg-[var(--bg)] border border-[var(--border)]">
                <div className="text-[1.75rem] sm:text-[2rem] font-extrabold text-[#11643F]">+400%</div>
                <div className="text-sm font-medium text-[var(--text-secondary)] mt-1">Nasdaq 100 growth</div>
              </div>
              <div className="text-center p-5 rounded-xl bg-[var(--bg)] border border-[var(--border)]">
                <div className="text-[1.75rem] sm:text-[2rem] font-extrabold text-[#FC6612]">&lt;1%</div>
                <div className="text-sm font-medium text-[var(--text-secondary)] mt-1">Bank interest/year</div>
              </div>
            </div>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed whitespace-pre-line">{ABOUT_CONTENT.inflation_text}</p>
          </div>

          {/* Market cards + CTA */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[{n:'Stocks',d:'NYSE, NASDAQ, LSE',c:'📈'},{n:'Crypto',d:'BTC, ETH & altcoins',c:'₿'},{n:'Forex',d:'60+ currency pairs',c:'💱'},{n:'Commodities',d:'Gold, Oil, Gas',c:'🥇'}].map((item,i)=>(
              <div key={i} className="group p-5 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] hover:border-[#11643F]/30 hover:-translate-y-1 transition-all text-center">
                <div className="w-11 h-11 rounded-xl bg-[#11643F]/10 flex items-center justify-center text-xl mx-auto mb-3">{item.c}</div>
                <h4 className="text-sm font-bold text-[var(--text)] mb-1">{item.n}</h4>
                <p className="text-[12px] text-[var(--text-secondary)]">{item.d}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8"><a href="#reg-form"><Btn size="lg">Register Now <HiArrowRight className="w-4 h-4"/></Btn></a></div>
        </div>
      </Con></Sec>

      {/* ====== VIDEO DEMO ====== */}
      <Sec id="demo"><Bg /><Con><Head headline="See The AI Trader in Action" subheadline="Watch how our AI analyzes markets, spots opportunities, and helps you trade smarter." /><div className="max-w-4xl mx-auto"><div className="rounded-2xl overflow-hidden border border-[var(--border)] shadow-2xl shadow-black/40 bg-[var(--bg-card)]"><div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border)]"><div className="w-3 h-3 rounded-full bg-red-500/60"/><div className="w-3 h-3 rounded-full bg-amber-400/60"/><div className="w-3 h-3 rounded-full bg-green-400/60"/><span className="ml-3 text-[11px] text-[var(--text-secondary)]">theaitrader.ai</span></div><div className="aspect-video"><iframe src="https://www.youtube.com/embed/u3T7fLT4qGQ" title="The AI Trader" className="w-full h-full" allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"/></div></div></div></Con></Sec>

      {/* ====== FEATURES ====== */}
      <Sec><Bg variant="warm" /><Con><Head headline="What You Get with The AI Trader" subheadline="Here's what makes us different from old-school trading tools." /><div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">{FEATURES.map((f,i)=>(<Card key={i} className="p-5"><div className="w-10 h-10 rounded-xl bg-[#11643F]/10 flex items-center justify-center mb-3"><span className="text-lg">{f.icon}</span></div><h3 className="text-[15px] font-semibold text-[var(--text)] mb-2">{f.title}</h3><p className="text-[var(--text-secondary)] text-[13px] leading-relaxed">{f.description}</p></Card>))}</div></Con></Sec>

      {/* ====== HOW IT WORKS ====== */}
      <Sec><Bg /><Con><Head headline={HOW_IT_WORKS.headline} subheadline={HOW_IT_WORKS.subheadline} /><div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">{HOW_IT_WORKS.steps.map((s,i)=>(<Card key={i} className="p-5 text-center"><div className="w-12 h-12 rounded-xl bg-[#11643F]/10 text-[#11643F] flex items-center justify-center text-lg font-bold mx-auto mb-4">{s.step}</div><h3 className="text-[15px] font-semibold text-[var(--text)] mb-2">{s.title}</h3><p className="text-[var(--text-secondary)] text-[13px] leading-relaxed">{s.description}</p></Card>))}</div><div className="text-center"><a href="#reg-form"><Btn size="lg">Register Now <HiArrowRight className="w-4 h-4"/></Btn></a></div></Con></Sec>

      {/* ====== WHY AI + MARKETS ====== */}
      <Sec><Bg variant="blue" /><Con>
        <div className="grid lg:grid-cols-[1fr_1.3fr] gap-12 lg:gap-16">
          {/* Left: Why AI */}
          <div className="flex flex-col justify-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[var(--text)] mb-5">{WHY_AI.headline}</h2>
            <div className="space-y-4 mb-6">
              <p className="text-[var(--text-secondary)] text-base leading-relaxed">{WHY_AI.description}</p>
              <p className="text-[var(--text-secondary)] text-base leading-relaxed">{WHY_AI.description2}</p>
            </div>
            <p className="text-[var(--text)] text-lg font-bold">{WHY_AI.description3}</p>
          </div>
          {/* Right: Markets */}
          <div>
            <h3 className="text-xl font-bold text-[var(--text)] mb-2">{MARKETS.headline}</h3>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-5">{MARKETS.subheadline}</p>
            <div className="space-y-2.5">
              {MARKETS.items.map((m,i)=>(
                <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] hover:border-[#11643F]/20 hover:-translate-y-0.5 transition-all">
                  <div className="w-14 h-14 rounded-xl bg-[#11643F]/10 flex items-center justify-center text-3xl flex-shrink-0">
                    {i===0?'📈':i===1?'📊':i===2?'₿':i===3?'💱':'🥇'}
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-[var(--text)] mb-1">{m.name}</h4>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{m.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Con></Sec>


      {/* ====== WHO IS IT FOR ====== */}
      <Sec><Bg variant="warm" /><Con>
        <Head headline={WHO_IS_IT_FOR.headline} subheadline={WHO_IS_IT_FOR.subheadline} />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {WHO_IS_IT_FOR.personas.map((p,i)=>(
            <Card key={i} className="p-6 text-center group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FC6612]/15 to-[#11643F]/15 flex items-center justify-center text-3xl mx-auto mb-4 group-hover:scale-110 transition-transform">
                {['🌱','⚡','💻','🏦'][i]}
              </div>
              <h3 className="text-base font-bold text-[var(--text)] mb-2">{p.title}</h3>
              <p className="text-[var(--text-secondary)] text-[13px] leading-relaxed">{p.description}</p>
            </Card>
          ))}
        </div>
        <div className="text-center"><a href="#reg-form"><Btn size="lg">Register Now <HiArrowRight className="w-4 h-4"/></Btn></a></div>
      </Con></Sec>

      {/* ====== APP SECTION ====== */}
      <Sec><Bg /><Con>
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left: Device */}
          <div className="flex justify-center order-2 lg:order-1 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#FC6612]/[0.04] rounded-full blur-3xl pointer-events-none"/>
            <img src="/traderai-responsive-device.webp" alt="The AI Trader Platform" width="500" height="400" loading="lazy" className="w-full max-w-sm lg:max-w-md mx-auto relative z-10"/>
          </div>
          {/* Right: Content */}
          <div className="order-1 lg:order-2">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[var(--text)] mb-4">{APP_SECTION.headline}</h2>
            <p className="text-[var(--text-secondary)] leading-relaxed mb-8">{APP_SECTION.subheadline}</p>
            <ul className="space-y-3 mb-8">
              {APP_SECTION.features.map((f,i)=>(
                <li key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#11643F] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
                  </div>
                  <span className="text-sm text-[var(--text-secondary)]">{f}</span>
                </li>
              ))}
            </ul>
            <div className="grid grid-cols-4 gap-4 mb-8">
              {APP_SECTION.stats.map((s,i)=>(
                <div key={i} className="text-center p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border)]">
                  <div className="text-xl font-bold text-[var(--text)]">{s.value}</div>
                  <div className="text-[11px] text-[var(--text-muted)] mt-1">{s.label}</div>
                </div>
              ))}
            </div>
            <a href="#reg-form"><Btn size="lg">Register Now <HiArrowRight className="w-4 h-4"/></Btn></a>
          </div>
        </div>
      </Con></Sec>

      {/* ====== WHY CHOOSE US ====== */}
      <Sec><Bg variant="blue" /><Con>
        <Head headline={WHY_CHOOSE_US.headline} subheadline={WHY_CHOOSE_US.subheadline} />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          {WHY_CHOOSE_US.items.map((item,i)=>(
            <Card key={i} className="p-6 group">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FC6612]/15 to-[#11643F]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-lg">{['🤖','👤','📦','🎮','⚠️','💎'][i]}</span>
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-[var(--text)] mb-1.5">{item.title}</h3>
                  <p className="text-[var(--text-secondary)] text-[13px] leading-relaxed">{item.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
        <div className="text-center"><a href="#reg-form"><Btn size="xl">Register Now <HiArrowRight className="w-4 h-4"/></Btn></a></div>
      </Con></Sec>

      {/* ====== THINGS TO KNOW ====== */}
      <Sec><Bg /><Con>
        <Head headline={THINGS_TO_KEEP_IN_MIND.headline} />
        <div className="max-w-3xl mx-auto space-y-4">
          {THINGS_TO_KEEP_IN_MIND.items.map((item,i)=>(
            <div key={i} className="flex items-start gap-5 p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--border-strong)] transition-all">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FC6612]/20 to-[#11643F]/20 flex items-center justify-center text-sm font-bold text-[var(--text)] flex-shrink-0">{i+1}</div>
              <div>
                <h4 className="text-base font-bold text-[var(--text)] mb-1">{item.title}</h4>
                <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Con></Sec>

      {/* ====== FAQ ====== */}
      <Sec><Bg variant="green" /><Con>
        <Head headline="Frequently Asked Questions" subheadline="Everything you need to know about The AI Trader" />
        <div className="max-w-3xl mx-auto space-y-3">
          {FAQ_ITEMS.map((item,i)=>(<FaqItem key={i} {...item} open={i===0}/>))}
        </div>
      </Con></Sec>

      {/* ====== BOTTOM REGISTRATION FORM ====== */}
      <Sec id="start-form"><Bg variant="warm" /><Con>
        <div className="max-w-lg mx-auto">
          <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-strong)] p-7 sm:p-10 shadow-2xl shadow-black/10 dark:shadow-black/40">
            <div className="text-center mb-7">
              <div className="w-14 h-14 rounded-2xl bg-[#FC6612]/10 flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-[#FC6612]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text)] mb-2">Start Trading Today</h2>
              <p className="text-[var(--text-secondary)]">Create your free account and begin your journey with AI-powered trading.</p>
            </div>
            {formStatus==='success' ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-2xl bg-[#11643F]/10 flex items-center justify-center mx-auto mb-4"><svg className="w-8 h-8 text-[#11643F]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg></div>
                <h3 className="text-xl font-bold text-[var(--text)] mb-2">You're All Set!</h3>
                <p className="text-[var(--text-secondary)]">Welcome to The AI Trader. Check your email for next steps.</p>
              </div>
            ) : (
              <form onSubmit={submitForm} autoComplete="off" className="space-y-4">
                {FORM_CONTENT.fields.map((f)=>(
                  f.name === 'phone' ? (
                    <div key={f.id} className="flex rounded-xl bg-[var(--bg)] border border-[var(--border-strong)] focus-within:border-[#FC6612]/50 focus-within:ring-2 focus-within:ring-[#FC6612]/10 transition-all">
                      <CountrySelect value={form.phoneCode} onChange={(code)=>setForm(p=>({...p,phoneCode:code}))}/>
                      <input name="phone" type="tel" value={form.phone} onChange={hc} required placeholder="Phone number" className="flex-1 px-3 py-3.5 bg-transparent text-[var(--text)] text-sm placeholder-[var(--text-secondary)] outline-none"/>
                    </div>
                  ) : (
                    <input key={f.id} name={f.name} type={f.type} value={form[f.name]} onChange={hc} required placeholder={f.label} className="w-full px-4 py-3.5 rounded-xl bg-[var(--bg)] border border-[var(--border-strong)] text-[var(--text)] text-sm placeholder-[var(--text-secondary)] focus:outline-none focus:border-[#FC6612]/50 transition-colors"/>
                  )
                ))}
                <button type="submit" disabled={formStatus==='loading'} style={{background:'linear-gradient(135deg, #FC6612, #11643F)'}} className="w-full py-4 rounded-xl hover:brightness-90 text-white font-bold text-sm transition-all shadow-lg shadow-[#FC6612]/25 hover:shadow-[#FC6612]/40 flex items-center justify-center gap-2">{formStatus==='loading'?'Creating Account...':<>Create Account For Free<HiArrowRight className="w-4 h-4"/></>}</button>
                <p className="text-center text-xs text-[var(--text-muted)]">I have read and agree to the Privacy Policy and Terms & Conditions.</p>
              </form>
            )}
          </div>
        </div>
      </Con></Sec>

      {/* ====== CTA ====== */}
      <Sec><Bg /><Con><div className="rounded-3xl bg-[var(--bg-card)] border border-[var(--border)] p-10 sm:p-14 lg:p-16 text-center"><div className="flex items-center justify-center gap-2 mb-4"><span className="text-amber-400 text-lg">★★★★★</span><span className="text-[var(--text-secondary)] text-sm">Rated 4.8/5 · by 2,400+ users</span></div><h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--text)] mb-3">Ready to Trade Smarter?</h2><p className="text-[var(--text-secondary)] text-lg max-w-lg mx-auto mb-8">Join 100,000+ traders across 50+ countries.</p><a href="#start-form"><Btn size="xl">Create Free Account <HiArrowRight className="w-4 h-4"/></Btn></a><p className="mt-4 text-[13px] text-[var(--text-secondary)]">Free to start. $250 minimum deposit. No hidden fees.</p></div></Con></Sec>

      {/* ====== FOOTER ====== */}
      <footer className="border-t-2 border-[var(--border-strong)] bg-[var(--bg-alt)]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Top: Logo + Contact + Follow */}
          <div className="grid grid-cols-[40%_30%_30%] gap-8 lg:gap-12 pb-12 border-b border-[var(--border)]">
            <div>
              <Logo />
              <p className="text-[var(--text-secondary)] text-sm mt-4 leading-relaxed max-w-sm">The AI Trader makes ai trading easier and smarter. Analyze markets in real-time, automate strategies safely, stay fully in control.</p>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-[var(--text)] uppercase tracking-wider mb-4">Contact</h4>
              <div className="space-y-2.5">
                <p className="text-[var(--text-secondary)] text-sm flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#11643F] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                  AU +61 284 889 800
                </p>
                <p className="text-[var(--text-secondary)] text-sm flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#11643F] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                  UK +44 203 927 2999
                </p>
                <p className="text-[#FC6612] text-sm font-medium flex items-center gap-2">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                  info@traderai.ai
                </p>
              </div>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-[var(--text)] uppercase tracking-wider mb-4">Follow Us</h4>
              <div className="flex items-center gap-3">
                {[
                  {n:'Facebook',d:'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z'},
                  {n:'Instagram',d:'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z'},
                  {n:'YouTube',d:'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z'},
                  {n:'X',d:'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z'},
                ].map(s=>(
                  <a key={s.n} href="#" className="w-10 h-10 rounded-xl bg-[#FC6612]/10 hover:bg-[#FC6612] flex items-center justify-center text-[#FC6612] hover:text-white transition-all hover:scale-110" title={s.n}>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d={s.d}/></svg>
                  </a>
                ))}
              </div>
            </div>
          </div>
          {/* Disclaimer */}
          <div className="py-10 border-b border-[var(--border)] space-y-4">
            <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed"><strong className="text-[var(--text)] font-semibold">HIGH RISK WARNING:</strong> Dealing or Trading FX, CFDs and Cryptocurrencies is highly speculative, carries a level of non-negligible risk and may not be suitable for all investors. You may lose some or all of your invested capital, therefore you should not speculate with capital that you cannot afford to lose. Please refer to the risk disclosure below. traderai.ai does not gain or lose profits based on your activity and operates as a services company. traderai.ai is not a financial services firm and is not eligible of providing financial advice. traderai.ai shall not be liable for any losses occurred via or in relation to this informational website.</p>
            <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed"><strong className="text-[var(--text)] font-semibold">SITE RISK DISCLOSURE:</strong> traderai.ai does not accept any liability for loss or damage as a result of reliance on the information contained within this website; this includes education material, price quotes and charts, and analysis. Please be aware of and seek professional advice for the risks associated with trading the financial markets; never invest more money than you can risk losing. The risks involved in FX, CFDs and Cryptocurrencies may not be suitable for all investors. traderai.ai doesn't retain responsibility for any trading losses you might face as a result of using or inferring from the data hosted on this site.</p>
            <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed"><strong className="text-[var(--text)] font-semibold">LEGAL RESTRICTIONS:</strong> Without limiting the above mentioned provisions, you understand that laws regarding financial activities vary throughout the world, and it is your responsibility to make sure you properly comply with any law, regulation or guideline in your country of residence regarding the use of the Site. To avoid any doubt, the ability to access our Site does not necessarily mean that our Services and/or your activities through the Site are legal under the laws, regulations or directives relevant to your country of residence. It is against the law to solicit US individuals to buy and sell commodity options, even if they are called 'prediction' contracts, unless they are listed for trading and traded on a CFTC-registered exchange unless legally exempt. The UK Financial Conduct Authority has issued a policy statement PS20/10, which prohibits the sale, promotion, and distribution of CFD on Crypto assets. It prohibits the dissemination of marketing materials relating to distribution of CFDs and other financial products based on Cryptocurrencies that addressed to UK residents. The provision of trading services involving any MiFID II financial instruments is prohibited in the EU, unless when authorized/licensed by the applicable authorities and/or regulator(s). Please note that we may receive advertising fees for users opted to open an account with our partner advertisers via advertisers' websites. We have placed cookies on your computer to help improve your experience when visiting this website. You can change cookie settings on your computer at any time. Use of this website indicates your acceptance of this website.</p>
          </div>
          {/* Bottom bar */}
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

function FaqItem({ question, answer, open: defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`rounded-2xl border transition-all duration-300 ${open ? 'bg-[var(--bg-card)] border-[var(--border-strong)] shadow-lg' : 'bg-[var(--bg-card)]/50 border-[var(--border)] hover:border-[var(--border-strong)]'}`}>
      <button onClick={()=>setOpen(!open)} className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left">
        <span className={`text-[15px] font-semibold transition-colors ${open ? 'text-[var(--text)]' : 'text-[var(--text-secondary)]'}`}>{question}</span>
        <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${open ? 'bg-[#FC6612] text-white rotate-180' : 'bg-[var(--bg)] text-[var(--text-muted)]'}`}>
          <HiChevronDown className="w-4 h-4 transition-transform" />
        </div>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-96' : 'max-h-0'}`}>
        <p className="px-6 pb-6 text-sm text-[var(--text-secondary)] leading-relaxed">{answer}</p>
      </div>
    </div>
  );
}
