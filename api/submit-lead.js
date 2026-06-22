export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { firstName, lastName, email, phone } = req.body;
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || '127.0.0.1';

    const postData = {
      email,
      firstName,
      lastName,
      password: 'Lh23s3',
      ip,
      phone,
      offerName: 'ClientCentral-Site',
    };

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

    if (data && data.details) {
      return res.json({
        status: 'success',
        redirectUrl: data.details.redirect?.url || '',
      });
    }

    return res.json({
      status: 'error',
      message: data?.errors?.[0]?.message || 'Submission failed',
    });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
}
