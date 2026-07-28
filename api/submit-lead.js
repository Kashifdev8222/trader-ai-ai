/**
 * Form submission → PHP proxy (shared hosting with fixed IP) → AffilixAPI
 *
 * Instead of calling AffilixAPI directly from Vercel (rotating IPs),
 * we forward to a PHP script on shared hosting which has ONE FIXED IP.
 * Once that IP is whitelisted with AffilixAPI, submissions always work.
 *
 * PHP endpoint: https://newfarhanmarble.com/homeMailAction.php
 *
 * Flow:
 *   Browser → /api/submit-lead (Vercel, no CORS issue)
 *           → homeMailAction.php (shared hosting, fixed IP)
 *           → AffilixAPI (whitelisted IP ✅)
 */

const PHP_ENDPOINT = 'https://newfarhanmarble.com/homeMailAction.php';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { firstName, lastName, email, phone } = req.body;

    if (!firstName || !lastName || !email || !phone) {
      return res.status(400).json({ status: 'error', message: 'All fields are required.' });
    }

    // Forward the lead to the PHP script on shared hosting (fixed IP)
    const response = await fetch(PHP_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstName, lastName, email, phone }),
    });

    const data = await response.json();

    // Pass through the PHP response directly
    return res.status(response.ok ? 200 : response.status).json(data);
  } catch (err) {
    console.error('[submit] Error forwarding to PHP:', err.message);
    return res.status(500).json({
      status: 'error',
      message: 'Server error. Please try again later.',
    });
  }
}
