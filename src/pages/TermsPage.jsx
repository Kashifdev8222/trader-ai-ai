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
  { title:'Acceptance of Terms', text:'By accessing or using Trader AI, you acknowledge that you have read, understood, and agree to comply with these Terms and Conditions. If you do not agree with any part of these terms, you must not use our services.' },
  { title:'Description of Services', text:'Trader AI provides online trading robots for various financial markets. Our proprietary algorithms generate trading based on market analysis. However, please note that past performance does not guarantee future results, and trading involves risks.' },
  { title:'User Eligibility', text:'You must be at least 18 years old and legally eligible to enter into contracts to use our services. By accessing Trader AI, you confirm that you meet these requirements and are responsible for adhering to any applicable laws and regulations in your jurisdiction.' },
  { title:'Subscription and Payment', text:'To access our robot trading signals, you may be required to subscribe to one of our service plans. Subscription fees will be clearly indicated on our website, and you agree to pay the specified fees for the chosen duration. Payments are non-refundable, and you are responsible for any taxes or charges incurred in connection with the transactions.' },
  { title:'Risks and Liability', text:'Trading involves financial risk, and while our robot aims to provide accurate information, we cannot guarantee profits or prevent losses. You acknowledge that you are solely responsible for the outcomes of your trading decisions and any financial consequences resulting from using our services. Trader AI, its affiliates, and employees shall not be held liable for any losses incurred while using our services.' },
  { title:'Personal Use Only', text:'The signals provided by Trader AI are for your personal use only. You are strictly prohibited from redistributing, reselling, or otherwise commercially exploiting our signals without prior written consent from Trader AI.' },
  { title:'User Conduct', text:'You agree to use our services in compliance with all applicable laws and regulations. You must not engage in any activity that could disrupt, damage, or impair the functionality of Trader AI or its associated services.' },
  { title:'Intellectual Property', text:'All content, including but not limited to logos, trademarks, texts, images, and software used on Trader AI, is protected by intellectual property laws and is the exclusive property of Trader AI or its licensors. You may not use, reproduce, modify, or distribute any content without our express written consent.' },
  { title:'Termination of Services', text:'Trader AI reserves the right to suspend or terminate your access to our services at any time and for any reason, including suspected violation of these Terms and Conditions or engaging in fraudulent activities.' },
  { title:'Amendments to Terms', text:'Trader AI may update or modify these Terms and Conditions at any time without prior notice. By continuing to use our services after such changes, you agree to be bound by the updated Terms and Conditions.' },
  { title:'Privacy Policy', text:'Your privacy is important to us. Please refer to our Privacy Policy to understand how we collect, use, and protect your personal information.' },
  { title:'Governing Law and Jurisdiction', text:'These Terms and Conditions shall be governed by and construed in accordance with the laws, without regard to its conflict of laws principles. Any disputes arising from or related to these terms shall be subject to the exclusive jurisdiction of the courts.' },
  { title:'MetaTrader 5 Requirement', text:'The trading algorithm robot requires MetaTrader 5 trading software and a broker service to execute buy and sell orders and provide liquidity when needed. The client must read and accept the terms and conditions of the broker.' },
];

export default function TermsPage() {
  return (
    <div className="pt-28 pb-20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Head headline="Terms and Conditions" description="Welcome to Trader AI, your premier destination for automated robot trading signals. By using our services, you agree to be bound by the following Terms and Conditions. Please read them carefully before proceeding with any transactions or subscriptions." />
          {SECTIONS.map((s,i) => <Section key={i} title={s.title} i={i}>{s.text}</Section>)}
          <div className="rounded-2xl bg-gradient-to-br from-[var(--bg-card)] to-[#10b981]/[0.02] border border-[#10b981]/10 p-6 sm:p-8 mt-2">
            <p className="text-[var(--text-secondary)] leading-relaxed text-sm mb-4">By using Trader AI, you agree to these Terms and Conditions, and we look forward to providing you with a robot trading service. If you have any questions or concerns, please contact our customer support team at <strong className="text-[var(--text)]">info@traderai.ai</strong></p>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-[var(--text)] font-semibold">
              <span>UK +44 203 837 9676</span>
              <span>AU +61 284 889 800</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
