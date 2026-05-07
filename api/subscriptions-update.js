export default async function handler(req, res) {

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { subscription_group_id, subscription_state, external_id } = req.body;

    if (!subscription_group_id || !subscription_state || !external_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const brazeRes = await fetch(`${process.env.BRAZE_REST_ENDPOINT}/subscription/status/set`, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${process.env.BRAZE_API_KEY}`
      },
      body: JSON.stringify({
        subscription_group_id,
        subscription_state,
        external_id
      })
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
