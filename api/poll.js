export default async function handler(req, res) {

  // CORS first — before anything else so headers are always sent
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

    // read body for PUT requests
    let body = undefined;
    if (req.method === 'PUT') {
      body = JSON.stringify(req.body);
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
    try {
      data = JSON.parse(text);
    } catch(e) {
      // Braze returned non-JSON — surface the raw text
      return res.status(brazeRes.status).json({ error: 'Non-JSON response from Braze', raw: text });
    }

    return res.status(brazeRes.status).json(data);

  } catch(err) {
    return res.status(500).json({ error: err.message, stack: err.stack });
  }
}
