const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
);

const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { type, data } = req.body;

    if (type !== 'payment') {
      return res.status(200).json({ ok: true });
    }

    const paymentId = data?.id;
    if (!paymentId) {
      return res.status(400).json({ error: 'Missing payment id' });
    }

    // Confirma o pagamento na API do Mercado Pago
    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` },
    });

    if (!mpRes.ok) {
      return res.status(400).json({ error: 'Failed to fetch payment' });
    }

    const payment = await mpRes.json();

    if (payment.status !== 'approved') {
      return res.status(200).json({ ok: true, status: payment.status });
    }

    // Pega o device_id que foi enviado como external_reference
    const deviceId = payment.external_reference;
    if (!deviceId) {
      return res.status(400).json({ error: 'Missing device id' });
    }

    // Salva no Supabase
    const { error } = await supabase
      .from('pro_users')
      .upsert({ device_id: deviceId, activated_at: new Date().toISOString() });

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Database error' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return res.status(500).json({ error: 'Internal error' });
  }
};
