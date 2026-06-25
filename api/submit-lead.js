export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { firstName, lastName, email, phone } = req.body;

    // Get client IP (same as $_SERVER['REMOTE_ADDR'] in PHP)
    // Vercel passes the real client IP via x-forwarded-for header
    const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
      || req.headers['x-real-ip']
      || req.socket?.remoteAddress
      || '';

    const postData = {
      email,
      firstName,
      lastName,
      password: 'Lh23s3',
      ip: clientIp,
      phone,
      offerName: 'ClientCentral-Site',
    };

    console.log('Sending to AffilixAPI:', JSON.stringify(postData));

    const response = await fetch('https://affilixapi.com/api/v2/leads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json',
        'Api-Key': '5C7C919C-F69A-7590-5F67-E8D22ECB5617',
      },
      body: JSON.stringify(postData),
    });

    const data = await response.json();
    console.log('AffilixAPI response:', JSON.stringify(data));

    if (data && data.details) {
      return res.json({
        status: 'success',
        redirectUrl: data.details.redirect?.url || '',
      });
    }

    // Return actual error from API (matching PHP behavior)
    const errMsg = data?.errors?.[0]?.message || data?.message || 'Submission failed. Please try again.';
    return res.json({ status: 'error', message: errMsg });
  } catch (err) {
    console.error('API Error:', err);
    return res.status(500).json({ status: 'error', message: 'Server error. Please try again later.' });
  }
}
