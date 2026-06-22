export default function TermsPage() {
  return (
    <div className="pt-28 pb-20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--text)] mb-3 text-center">Terms and Conditions for Trader AI Trading Robot</h1>
          <p className="text-[var(--text-secondary)] text-center mb-10">Welcome to Trader AI, your premier destination for automated robot trading signals. By using our services, you agree to be bound by the following Terms and Conditions. Please read them carefully before proceeding with any transactions or subscriptions.</p>

          <Section title="Acceptance of Terms">By accessing or using Trader AI, you acknowledge that you have read, understood, and agree to comply with these Terms and Conditions. If you do not agree with any part of these terms, you must not use our services.</Section>
          <Section title="Description of Services">Trader AI provides online trading robots for various financial markets. Our proprietary algorithms generate trading based on market analysis. However, please note that past performance does not guarantee future results, and trading involves risks.</Section>
          <Section title="User Eligibility">You must be at least 18 years old and legally eligible to enter into contracts to use our services. By accessing Trader AI, you confirm that you meet these requirements and are responsible for adhering to any applicable laws and regulations in your jurisdiction.</Section>
          <Section title="Subscription and Payment">To access our robot trading signals, you may be required to subscribe to one of our service plans. Subscription fees will be clearly indicated on our website, and you agree to pay the specified fees for the chosen duration. Payments are non-refundable, and you are responsible for any taxes or charges incurred in connection with the transactions.</Section>
          <Section title="Risks and Liability">Trading involves financial risk, and while our robot aims to provide accurate information, we cannot guarantee profits or prevent losses. You acknowledge that you are solely responsible for the outcomes of your trading decisions and any financial consequences resulting from using our services. Trader AI, its affiliates, and employees shall not be held liable for any losses incurred while using our services.</Section>
          <Section title="Personal Use Only">The signals provided by Trader AI are for your personal use only. You are strictly prohibited from redistributing, reselling, or otherwise commercially exploiting our signals without prior written consent from Trader AI.</Section>
          <Section title="User Conduct">You agree to use our services in compliance with all applicable laws and regulations. You must not engage in any activity that could disrupt, damage, or impair the functionality of Trader AI or its associated services.</Section>
          <Section title="Intellectual Property">All content, including but not limited to logos, trademarks, texts, images, and software used on Trader AI, is protected by intellectual property laws and is the exclusive property of Trader AI or its licensors. You may not use, reproduce, modify, or distribute any content without our express written consent.</Section>
          <Section title="Termination of Services">Trader AI reserves the right to suspend or terminate your access to our services at any time and for any reason, including suspected violation of these Terms and Conditions or engaging in fraudulent activities.</Section>
          <Section title="Amendments to Terms">Trader AI may update or modify these Terms and Conditions at any time without prior notice. By continuing to use our services after such changes, you agree to be bound by the updated Terms and Conditions.</Section>
          <Section title="Privacy Policy">Your privacy is important to us. Please refer to our Privacy Policy to understand how we collect, use, and protect your personal information.</Section>
          <Section title="Governing Law and Jurisdiction">These Terms and Conditions shall be governed by and construed in accordance with the laws, without regard to its conflict of laws principles. Any disputes arising from or related to these terms shall be subject to the exclusive jurisdiction of the courts.</Section>
          <Section title="MetaTrader 5 Requirement">The trading algorithm robot requires MetaTrader 5 trading software and a broker service to execute buy and sell orders and provide liquidity when needed. The client must read and accept the terms and conditions of the broker.</Section>
          <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] p-8 mb-4">
            <p className="text-[var(--text-secondary)] leading-relaxed text-sm mb-3">By using Trader AI, you agree to these Terms and Conditions, and we look forward to providing you with a robot trading service. If you have any questions or concerns, please contact our customer support team at info@traderai.ai</p>
            <p className="text-[var(--text)] font-semibold text-sm">Call Us At: UK +44 203 837 9676 &nbsp;·&nbsp; AU +61 284 889 800</p>
          </div>
        </div>
      </div>
    </div>
  );
}
function Section({ title, children }) {
  return <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] p-8 mb-4"><h2 className="text-lg font-bold text-[var(--text)] mb-3">{title}</h2><p className="text-[var(--text-secondary)] leading-relaxed text-sm">{children}</p></div>;
}
