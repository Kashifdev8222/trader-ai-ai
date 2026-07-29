/**
 * IP Geolocation — returns the user's country code.
 *
 * Vercel injects geo headers on every request, so no external API needed.
 * Header: x-vercel-ip-country → e.g. "PK", "GB", "US"
 */

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const country = req.headers['x-vercel-ip-country'] || 'US';

  return res.json({ country_code: country });
}
