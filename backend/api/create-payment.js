const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { device_id } = req.body;
  if (!device_id) {
    return res.status(400).json({ error: 'Missing device_id' });
  }

  const baseUrl = 'https://tecnicorikardo.github.io/calculadoradecompras';

  const body = {
    items: [
      {
        id: 'soma_facil_pro',
        title: 'Soma Fácil PRO — Vitalício',
        description: 'Acesso vitalício ao Soma Fácil sem anúncios',
        quantity: 1,
        currency_id: 'BRL',
        unit_price: 10.0,
      },
    ],
    external_reference: device_id,
    back_urls: {
      success: `${baseUrl}/pro-success.html`,
      failure: `${baseUrl}/pro-failure.html`,
      pending: `${baseUrl}/pro-pending.html`,
    },
    auto_return: 'approved',
    notification_url: 'https://calculadora-pro.vercel.app/api/webhook',
  };

  const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!mpRes.ok) {
    const err = await mpRes.text();
    console.error('MP error:', err);
    return res.status(500).json({ error: 'Failed to create preference' });
  }

  const preference = await mpRes.json();
  return res.status(200).json({ checkout_url: preference.init_point });
};
