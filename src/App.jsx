import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import GenericPage from './pages/GenericPage';
import ContactPage from './pages/ContactPage';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/contact-us" element={<Layout><ContactPage /></Layout>} />
        <Route path="/invest" element={<Layout><GenericPage title="Invest" subtitle="Investment options with Trader AI." /></Layout>} />
        <Route path="/invest/*" element={<Layout><GenericPage title="Invest" subtitle="Learn about investing with Trader AI." /></Layout>} />
        <Route path="/market" element={<Layout><GenericPage title="Market" subtitle="Markets you can trade with Trader AI." /></Layout>} />
        <Route path="/how-it-works" element={<Layout><GenericPage title="How it Works" subtitle="Getting started with Trader AI is simple." /></Layout>} />
        <Route path="/automated-trading" element={<Layout><GenericPage title="Automated Trading" subtitle="Let AI handle the heavy lifting 24/7." /></Layout>} />
        <Route path="/crypto-news" element={<Layout><GenericPage title="Crypto News Traderai" subtitle="Latest cryptocurrency news and updates." /></Layout>} />
        <Route path="/forex-news" element={<Layout><GenericPage title="Forex News Traderai" subtitle="Latest forex market news and analysis." /></Layout>} />
        <Route path="/stock-news" element={<Layout><GenericPage title="Stock News Traderai" subtitle="Latest stock market news and insights." /></Layout>} />
        <Route path="/blog" element={<Layout><GenericPage title="Blog" subtitle="Trading guides, market analysis, and AI insights." /></Layout>} />
        <Route path="/open-account" element={<Layout><GenericPage title="Open Account" subtitle="Start trading with Trader AI today." /></Layout>} />
        <Route path="/privacy-policy" element={<Layout><GenericPage title="Privacy Policy" subtitle="How we collect, use, and protect your data." /></Layout>} />
        <Route path="/terms-conditions" element={<Layout><GenericPage title="Terms & Conditions" subtitle="Terms of service for Trader AI." /></Layout>} />
        <Route path="/disclaimer" element={<Layout><GenericPage title="Disclaimer" subtitle="Important information about trading risks." /></Layout>} />
        <Route path="/download-app" element={<Layout><GenericPage title="Download the Trader AI App" subtitle="Available on iOS, Android, Windows, Mac, and Linux." /></Layout>} />
        <Route path="*" element={<Layout><GenericPage title="Page Not Found" subtitle="The page you're looking for doesn't exist." /></Layout>} />
      </Routes>
    </BrowserRouter>
  );
}
