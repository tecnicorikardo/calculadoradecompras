const { createClient } = require('@supabase/supabase-js');
const {
  ConfigurationError,
  requireEnvironmentVariable,
} = require('../lib/config');
const { getRequestBody, getSingleValue } = require('../lib/request');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = getRequestBody(req);
    const notificationType = getSingleValue(
      body.type ?? body.topic ?? req.query.type ?? req.query.topic,
    );

    if (notificationType && notificationType !== 'payment') {
      return res.status(200).json({ ok: true });
    }

    const paymentId = getSingleValue(
      body.data?.id ?? body.id ?? req.query['data.id'] ?? req.query.id,
    );
    if (!paymentId) {
      return res.status(400).json({ error: 'Missing payment id' });
    }

    const accessToken = requireEnvironmentVariable('MP_ACCESS_TOKEN');
    const supabaseUrl = requireEnvironmentVariable('SUPABASE_URL');
    const supabaseServiceKey = requireEnvironmentVariable(
      'SUPABASE_SERVICE_KEY',
    );
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const mercadoPagoResponse = await fetch(
      `https://api.mercadopago.com/v1/payments/${encodeURIComponent(paymentId)}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    if (!mercadoPagoResponse.ok) {
      const errorBody = await mercadoPagoResponse.text();
      console.error(
        `Mercado Pago payment error (${mercadoPagoResponse.status}):`,
        errorBody,
      );
      return res.status(400).json({ error: 'Failed to fetch payment' });
    }

    const payment = await mercadoPagoResponse.json();

    if (payment.status !== 'approved') {
      return res.status(200).json({ ok: true, status: payment.status });
    }

    const deviceId = payment.external_reference;
    if (!deviceId) {
      return res.status(400).json({ error: 'Missing device id' });
    }

    const { error } = await supabase
      .from('pro_users')
      .upsert({ device_id: deviceId, activated_at: new Date().toISOString() });

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Database error' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    if (err instanceof ConfigurationError) {
      console.error(err.message);
      return res.status(503).json({
        code: 'configuration_error',
        error: 'Webhook is not configured',
      });
    }

    console.error('Webhook error:', err);
    return res.status(500).json({ error: 'Internal error' });
  }
};
