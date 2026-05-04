export default async function handler(req, res) {

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const ALLOWED_CATALOGS = ['thisorthatpolls', 'poll_responses', 'poll_results'];
  const { catalog, itemId } = req.query;

  if (!catalog || !itemId) {
    return res.status(400).json({ error: 'Missing catalog or itemId' });
  }

  if (!ALLOWED_CATALOGS.includes(catalog)) {
    return res.status(400).json({ error: `Catalog "${catalog}" is not allowed` });
  }

  try {
    const brazeUrl = `${process.env.BRAZE_REST_ENDPOINT}/catalogs/${catalog}/items/${encodeURIComponent(itemId)}`;

    let body = undefined;
    if (req.method === 'PUT') {
      // strip id from every item in the body — Braze rejects it when id is in the URL
      const parsed = req.body;
      if (parsed?.items) {
        parsed.items = parsed.items.map(({ id, ...rest }) => rest);
      }
      body = JSON.stringify(parsed);
    }

    const brazeRes = await fetch(brazeUrl, {
      method: req.method,
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${process.env.BRAZE_API_KEY}`
      },
      body
    });

    const text = await brazeRes.text();
    let data;
    try { data = JSON.parse(text); }
    catch(e) { return res.status(brazeRes.status).json({ error: 'Non-JSON from Braze', raw: text }); }

    return res.status(brazeRes.status).json(data);

  } catch(err) {
    return res.status(500).json({ error: err.message });
  }
}
