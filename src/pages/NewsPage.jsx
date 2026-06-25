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

  return (
    <div className="pt-28 pb-20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--text)] mb-4">{title}</h1>
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-0.5 w-8 rounded-full bg-gradient-to-r from-transparent to-[#10b981]/60" />
            <div className="h-1.5 w-1.5 rounded-full bg-[#10b981]" />
            <div className="h-0.5 w-16 rounded-full bg-gradient-to-r from-[#10b981]/60 via-[#10b981] to-[#10b981]/60" />
            <div className="h-1.5 w-1.5 rounded-full bg-[#10b981]" />
            <div className="h-0.5 w-8 rounded-full bg-gradient-to-l from-transparent to-[#10b981]/60" />
          </div>
          <p className="text-lg text-[var(--text-secondary)]">Latest {type} market news and updates.</p>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({length:6}).map((_,i)=>(
              <div key={i} className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] p-5 animate-pulse">
                <div className="w-full h-48 rounded-xl bg-[var(--bg)] mb-4"/>
                <div className="h-5 bg-[var(--bg)] rounded w-3/4 mb-3"/>
                <div className="h-3 bg-[var(--bg)] rounded w-full mb-2"/>
                <div className="h-3 bg-[var(--bg)] rounded w-2/3"/>
              </div>
            ))}
          </div>
        ) : news.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {news.map((item, i) => (
              <a key={i} href={item.url} target="_blank" rel="noopener noreferrer" className="group block rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] hover:border-[#10b981]/20 hover:shadow-xl hover:shadow-black/[0.05] dark:hover:shadow-black/20 hover:-translate-y-1.5 transition-all duration-500 overflow-hidden">
                <div className="aspect-[16/10] overflow-hidden bg-[var(--bg)]">
                  {item.image ? (
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)] text-sm font-medium">{item.site}</div>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[11px] font-semibold text-[#10b981] uppercase bg-[#10b981]/10 px-2.5 py-1 rounded-lg">{item.symbol || type.toUpperCase()}</span>
                    <span className="text-[11px] text-[var(--text-muted)]">{item.site}</span>
                  </div>
                  <h3 className="text-[15px] font-bold text-[var(--text)] mb-2 line-clamp-2 group-hover:text-[#10b981] transition-colors">{item.title}</h3>
                  <p className="text-[var(--text-secondary)] text-[13px] leading-relaxed line-clamp-3 mb-4">{item.text}</p>
                  <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] border-t border-[var(--border)] pt-3">
                    <span className="font-medium">{item.publisher}</span>
                    <span>{item.publishedDate?.split(' ')[0]}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 rounded-3xl bg-[var(--bg-card)] border border-[var(--border)]">
            <p className="text-[var(--text-secondary)] text-lg">No news articles found. Check back later.</p>
          </div>
        )}
      </div>
    </div>
  );
}
