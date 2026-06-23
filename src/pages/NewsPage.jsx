import { useState, useEffect } from 'react';

export default function NewsPage({ type = 'crypto' }) {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  const title = type === 'crypto' ? 'Crypto News' : type === 'stock' ? 'Stock News' : 'Forex News';

  useEffect(() => {
    setLoading(true); setNews([]);
    const paths = { crypto: 'crypto-latest', stock: 'stock-latest', forex: 'forex-latest' };
    const url = `https://financialmodelingprep.com/stable/news/${paths[type] || 'crypto-latest'}?page=0&limit=12&apikey=zcaP4Xo3p8vK45tdB1CnMuzOfGR0t9pn`;
    fetch(url).then(r => r.json()).then(data => {
      setNews(Array.isArray(data) ? data : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [type]);

  if (loading) return (
    <div className="pt-28 pb-20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--text)] text-center mb-2">{title}</h1>
        <p className="text-[var(--text-secondary)] text-center mb-10">Loading latest news...</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({length:6}).map((_,i)=>(<div key={i} className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] p-5 animate-pulse"><div className="w-full h-48 rounded-xl bg-[var(--bg)] mb-4"/><div className="h-4 bg-[var(--bg)] rounded w-3/4 mb-2"/><div className="h-3 bg-[var(--bg)] rounded w-full"/></div>))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="pt-28 pb-20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--text)] text-center mb-2">{title}</h1>
        <p className="text-lg text-[var(--text-secondary)] text-center mb-10">Latest {type} market news and updates.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {news.map((item, i) => (
            <a key={i} href={item.url} target="_blank" rel="noopener noreferrer" className="group block rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--border-strong)] hover:-translate-y-1 transition-all duration-300 overflow-hidden">
              <div className="aspect-[16/10] overflow-hidden bg-[var(--bg)]">
                {item.image ? (
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)] text-sm">{item.site}</div>
                )}
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[11px] font-semibold text-[#FC6612] uppercase bg-[#FC6612]/10 px-2 py-0.5 rounded-md">{item.symbol || type.toUpperCase()}</span>
                  <span className="text-[11px] text-[var(--text-muted)]">{item.site}</span>
                </div>
                <h3 className="text-[15px] font-bold text-[var(--text)] mb-2 line-clamp-2 group-hover:text-[#FC6612] transition-colors">{item.title}</h3>
                <p className="text-[var(--text-secondary)] text-[13px] leading-relaxed line-clamp-3 mb-3">{item.text}</p>
                <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                  <span>{item.publisher}</span>
                  <span>{item.publishedDate?.split(' ')[0]}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
        {news.length === 0 && <p className="text-center text-[var(--text-secondary)] py-10">No news articles found. Check back later.</p>}
      </div>
    </div>
  );
}
