export default {
  async fetch(request, env) {

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url     = new URL(request.url);
    const catalog = url.searchParams.get('catalog');
    const itemId  = url.searchParams.get('itemId');

    const ALLOWED = ['thisorthatpolls', 'poll_responses', 'poll_results'];

    if (!catalog || !itemId) {
      return json({ error: 'Missing catalog or itemId' }, 400, corsHeaders);
    }

    if (!ALLOWED.includes(catalog)) {
      return json({ error: `Catalog "${catalog}" is not allowed` }, 400, corsHeaders);
    }

    try {
      const brazeUrl = `${env.BRAZE_REST_ENDPOINT}/catalogs/${catalog}/items/${encodeURIComponent(itemId)}`;

      let body = undefined;
      if (request.method === 'PUT') {
        const parsed = await request.json();
        if (parsed?.items) {
          parsed.items = parsed.items.map(({ id, ...rest }) => rest);
        }
        body = JSON.stringify(parsed);
      }

      const brazeRes = await fetch(brazeUrl, {
        method:  request.method,
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${env.BRAZE_API_KEY}`
        },
        body
      });

      const data = await brazeRes.json();
      return json(data, brazeRes.status, corsHeaders);

    } catch(err) {
      return json({ error: err.message }, 500, corsHeaders);
    }
  }
};

function json(data, status=200, headers={}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers }
  });
}
