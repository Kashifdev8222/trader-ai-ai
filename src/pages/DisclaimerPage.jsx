function Section({ title, children, i = 0 }) {
  return (
    <div className="group rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] p-6 sm:p-8 mb-4 hover:border-[#10b981]/10 hover:shadow-md transition-all duration-300">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#10b981]/15 to-[#10b981]/5 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-[#10b981] group-hover:shadow-md group-hover:shadow-[#10b981]/20 transition-all duration-300">
          <span className="text-sm font-bold text-[#10b981] group-hover:text-white transition-colors">{String(i+1).padStart(2,'0')}</span>
        </div>
        <div>
          <h2 className="text-lg font-bold text-[var(--text)] mb-3">{title}</h2>
          <p className="text-[var(--text-secondary)] leading-relaxed text-sm">{children}</p>
        </div>
      </div>
    </div>
  );
}

function Head({ headline, description }) {
  return (
    <div className="text-center mb-10">
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--text)] mb-4">{headline}</h1>
      <div className="flex items-center justify-center gap-2 mb-4">
        <div className="h-0.5 w-8 rounded-full bg-gradient-to-r from-transparent to-[#10b981]/60" />
        <div className="h-1.5 w-1.5 rounded-full bg-[#10b981]" />
        <div className="h-0.5 w-16 rounded-full bg-gradient-to-r from-[#10b981]/60 via-[#10b981] to-[#10b981]/60" />
        <div className="h-1.5 w-1.5 rounded-full bg-[#10b981]" />
        <div className="h-0.5 w-8 rounded-full bg-gradient-to-l from-transparent to-[#10b981]/60" />
      </div>
      {description && <p className="text-[var(--text-secondary)] max-w-3xl mx-auto leading-relaxed">{description}</p>}
    </div>
  );
}

const SECTIONS = [
  { title:'No Financial Advice', text:'The content on this website - including but not limited to articles, videos, analysis, market data, charts, signals, tools, and educational material - is not financial, investment, legal, tax, or other professional advice. Nothing on this site constitutes a recommendation, solicitation, offer, or endorsement to buy, sell, hold, or trade any financial instrument, security, commodity, currency, digital asset, or investment product.' },
  { title:'Risk Acknowledgment', text:'Trading financial markets - including foreign exchange (FX), contracts for difference (CFDs), cryptocurrencies, stocks, indices, and other derivatives - carries significant risk and is not suitable for all investors. Past performance is not indicative of future results. You should carefully consider your financial situation and risk tolerance before engaging in any trading or investment activity.' },
  { title:'No Liability', text:'We make no warranties or guarantees about the accuracy, reliability, timeliness, completeness, or suitability of the information contained on this website. By using this site, you expressly agree that: Trader AI, its owners, employees, contractors, officers, and partners are not responsible or liable for any loss, damage, cost, or expense arising directly or indirectly from your use of this site or reliance on its content. You assume all responsibility for your decisions, trades, strategies, and outcomes.' },
  { title:'Independent Verification', text:'You should independently verify all information before acting on it. This includes consulting with a licensed financial, tax, or legal professional where appropriate.' },
  { title:'No Guarantees', text:'We do not guarantee profits, accuracy of data, completeness of content, or uninterrupted access to the site. Technical issues, errors, omissions, and outdated information may occur.' },
  { title:'External Links', text:'Trader AI may link to third-party websites, tools, or services ("External Sites"). These links are provided for convenience only. We do not endorse and are not responsible for the content, accuracy, or practices of any External Sites.' },
  { title:'Your Responsibility', text:'By accessing or using this website, you agree that all investment decisions are made at your own risk. You expressly release traderai.ai from any and all liability for any direct or indirect loss or damage you incur. If you do not agree with any part of this disclaimer, you must discontinue use of this website immediately.' },
];

export default function DisclaimerPage() {
  return (
    <div className="pt-28 pb-20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Head headline="Disclaimer" description="The information provided by Trader AI, its affiliates, contributors, authors, or partners (collectively, 'we', 'us', or 'our') on this website is for general informational and educational purposes only." />
          {SECTIONS.map((s,i) => <Section key={i} title={s.title} i={i}>{s.text}</Section>)}
        </div>
      </div>
    </div>
  );
}
