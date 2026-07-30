/**
 * Form submission → PHP proxy (shared hosting with fixed IP) → AffilixAPI
 *
 * Flow:
 *   Browser → /api/submit-lead (Vercel)
 *           → homeMailAction.php (shared hosting, FIXED outbound IP)
 *           → AffilixAPI
 *
 * KEY: We pass the real user IP to the PHP so it sends the correct
 * IP in the AffilixAPI payload (not Vercel's IP).
 */

const PHP_ENDPOINT = 'https://quantryxtech.com/homeMailAction.php';
const OFFER_NAME = 'ClientCentral-Site'; // ← Change per project

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

    // Extract the REAL user IP (not Vercel's IP)
    const realIp =
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.headers['x-real-ip'] ||
      req.socket?.remoteAddress ||
      '';

    console.log('[submit] Real user IP:', realIp);
    console.log('[submit] Forwarding to:', PHP_ENDPOINT);

    // Forward to PHP — include the REAL user IP in the body
    const response = await fetch(PHP_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Real-IP': realIp,
        'X-Forwarded-For': realIp,
      },
      body: JSON.stringify({
        firstName,
        lastName,
        email,
        phone,
        userIp: realIp,
        offerName: OFFER_NAME,
      }),
    });

    const data = await response.json();

    console.log('[submit] PHP responded:', JSON.stringify(data));

    return res.status(200).json(data);
  } catch (err) {
    console.error('[submit] Error:', err.message);
    return res.status(500).json({
      status: 'error',
      message: 'Server error. Please try again later.',
    });
  }
}
