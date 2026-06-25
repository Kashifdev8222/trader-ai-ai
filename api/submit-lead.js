/**
 * Form submission — direct to AffilixAPI.
 *
 * Implements the same logic as your PHP homeMailAction.php
 * but in pure Node.js for Vercel serverless.
 *
 * Flow:
 *   Browser → /api/submit-lead → AffilixAPI
 */

const AFFILIX_URL = 'https://affilixapi.com/api/v2/leads';
const API_KEY = '5C7C919C-F69A-7590-5F67-E8D22ECB5617';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { firstName, lastName, email, phone } = req.body;

    // Same validation as PHP
    if (!firstName || !lastName || !email || !phone) {
      return res.status(400).json({ status: 'error', message: 'All fields are required.' });
    }

    // Equivalent to $_SERVER['REMOTE_ADDR'] in PHP
    const clientIp =
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.headers['x-real-ip'] ||
      req.socket?.remoteAddress ||
      '';

    // Exact same payload as PHP $post array
    const payload = {
      email,
      firstName,
      lastName,
      password: 'Lh23s3',
      ip: clientIp,
      phone,
      offerName: 'ClientCentral-Site',
    };

    console.log('[submit] Sending lead:', JSON.stringify({ ...payload, password: '***' }));

    // Same as PHP curl_exec to AffilixAPI
    const response = await fetch(AFFILIX_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        accept: 'application/json',
        'Api-Key': API_KEY,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    console.log('[submit] Response:', response.status, JSON.stringify(data).slice(0, 300));

    // Same response handling as PHP:
    // if(isset($data['details'])) → success
    // else → error with message
    if (data && data.details) {
      return res.json({
        status: 'success',
        redirectUrl: data.details.redirect?.url || '',
      });
    }

    const errMsg =
      data?.errors?.[0]?.message ||
      data?.message ||
      'Submission failed. Please try again.';

    return res.json({ status: 'error', message: errMsg });
  } catch (err) {
    console.error('[submit] Error:', err);
    return res.status(500).json({
      status: 'error',
      message: 'Server error. Please try again later.',
    });
  }
}
