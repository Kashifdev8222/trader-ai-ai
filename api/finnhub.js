const KEY = 'd8shhd1r01qq7apvngggd8shhd1r01qq7apvngh0';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const endpoint = req.query.endpoint || 'quote';
  const symbol = req.query.symbol || 'AAPL';

  try {
    const url = `https://finnhub.io/api/v1/${endpoint}?symbol=${symbol}&token=${KEY}`;
    const r = await fetch(url);
    const data = await r.json();
    return res.json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
