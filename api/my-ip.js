export default async function handler(req, res) {
  // This tells you what IP Vercel uses for outbound requests
  const r = await fetch('https://api.ipify.org?format=json');
  const data = await r.json();
  return res.json({ outboundIP: data.ip, socketIP: req.socket.remoteAddress, forwarded: req.headers['x-forwarded-for'] });
}
