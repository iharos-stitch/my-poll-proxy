export default async function handler(req, res) {

  // ── CORS headers ──
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // ── only allow these three catalogs ──
  const ALLOWED_CATALOGS = ['thisorthatpolls', 'poll_responses', 'poll_results'];

  const { catalog, itemId } = req.query;

  if (!catalog || !itemId) {
    return res.status(400).json({ error: 'Missing catalog or itemId param' });
  }

  if (!ALLOWED_CATALOGS.includes(catalog)) {
    return res.status(400).json({ error: `Catalog "${catalog}" is not allowed` });
  }

  // ── forward to Braze ──
  const brazeUrl = `${process.env.BRAZE_REST_ENDPOINT}/catalogs/${catalog}/items/${encodeURIComponent(itemId)}`;

  const brazeRes = await fetch(brazeUrl, {
    method: req.method,
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${process.env.BRAZE_API_KEY}`
    },
    body: req.method === 'PUT' ? JSON.stringify(req.body) : undefined
  });

  const data = await brazeRes.json();
  return res.status(brazeRes.status).json(data);
}
