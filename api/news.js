const API_KEY = 'zcaP4Xo3p8vK45tdB1CnMuzOfGR0t9pn';
const BASE = 'https://financialmodelingprep.com/stable/news';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const type = req.query.type || 'crypto';
  const paths = { crypto: 'crypto-latest', stock: 'stock-latest', forex: 'forex-latest' };
  const path = paths[type] || paths.crypto;

  try {
    const response = await fetch(`${BASE}/${path}?page=0&limit=12&apikey=${API_KEY}`);
    const data = await response.json();
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
