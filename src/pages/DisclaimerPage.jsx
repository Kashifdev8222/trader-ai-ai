export default function DisclaimerPage() {
  return (
    <div className="pt-28 pb-20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--text)] mb-3 text-center">Disclaimer</h1>
          <p className="text-[var(--text-secondary)] text-center mb-10">The information provided by Trader AI, its affiliates, contributors, authors, or partners (collectively, "we", "us", or "our") on this website is for general informational and educational purposes only.</p>

          <Section title="No Financial Advice">The content on this website — including but not limited to articles, videos, analysis, market data, charts, signals, tools, and educational material — is not financial, investment, legal, tax, or other professional advice. Nothing on this site constitutes a recommendation, solicitation, offer, or endorsement to buy, sell, hold, or trade any financial instrument, security, commodity, currency, digital asset, or investment product.</Section>
          <Section title="Risk Acknowledgment">Trading financial markets — including foreign exchange (FX), contracts for difference (CFDs), cryptocurrencies, stocks, indices, and other derivatives — carries significant risk and is not suitable for all investors. Past performance is not indicative of future results. You should carefully consider your financial situation and risk tolerance before engaging in any trading or investment activity.</Section>
          <Section title="No Liability">We make no warranties or guarantees about the accuracy, reliability, timeliness, completeness, or suitability of the information contained on this website. By using this site, you expressly agree that: Trader AI, its owners, employees, contractors, officers, and partners are not responsible or liable for any loss, damage, cost, or expense arising directly or indirectly from your use of this site or reliance on its content. You assume all responsibility for your decisions, trades, strategies, and outcomes.</Section>
          <Section title="Independent Verification">You should independently verify all information before acting on it. This includes consulting with a licensed financial, tax, or legal professional where appropriate.</Section>
          <Section title="No Guarantees">We do not guarantee profits, accuracy of data, completeness of content, or uninterrupted access to the site. Technical issues, errors, omissions, and outdated information may occur.</Section>
          <Section title="External Links">Trader AI may link to third-party websites, tools, or services ("External Sites"). These links are provided for convenience only. We do not endorse and are not responsible for the content, accuracy, or practices of any External Sites.</Section>
          <Section title="Your Responsibility">By accessing or using this website, you agree that all investment decisions are made at your own risk. You expressly release traderai.ai from any and all liability for any direct or indirect loss or damage you incur. If you do not agree with any part of this disclaimer, you must discontinue use of this website immediately.</Section>
        </div>
      </div>
    </div>
  );
}
function Section({ title, children }) {
  return <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] p-8 mb-4"><h2 className="text-lg font-bold text-[var(--text)] mb-3">{title}</h2><p className="text-[var(--text-secondary)] leading-relaxed text-sm">{children}</p></div>;
}
