const KEY = 'd8shhd1r01qq7apvngggd8shhd1r01qq7apvngh0';

// Simple in-memory cache for the function instance lifetime
const cache = new Map();
const CACHE_TTL = 30000; // 30 seconds server-side

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const endpoint = req.query.endpoint || 'quote';
  const symbol = req.query.symbol || 'AAPL';
  const cacheKey = `${endpoint}:${symbol}`;

  // Check in-memory cache (valid for this function instance)
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return res.json(cached.data);
  }

  try {
    const url = `https://finnhub.io/api/v1/${endpoint}?symbol=${symbol}&token=${KEY}`;
    const r = await fetch(url);
    const data = await r.json();
    cache.set(cacheKey, { data, ts: Date.now() });
    return res.json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
