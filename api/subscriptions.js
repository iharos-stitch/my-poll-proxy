export default async function handler(req, res) {

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS'); 
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { external_id } = req.query;

  if (!external_id) {
    return res.status(400).json({ error: 'Missing external_id param' });
  }

  try {
    const brazeUrl = `${process.env.BRAZE_REST_ENDPOINT}/subscription/user/status?external_id=${encodeURIComponent(external_id)}`;

    const brazeRes = await fetch(brazeUrl, {
      method: 'GET',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${process.env.BRAZE_API_KEY}`
      }
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
