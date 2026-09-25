const { createClient } = require('@supabase/supabase-js');
const https = require('https');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Garante sempre 200 no topo — Mercado Pago não deve retentar por erro interno
  try {
    // Suporte a body como string (alguns proxies não fazem auto-parse)
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch { body = {}; }
    }
    body = body || {};

    const { action, data, type, live_mode } = body;

    console.log('MP Webhook received:', JSON.stringify({ action, type, live_mode, id: data?.id }));

    // ✅ Modo de teste do painel do MP (live_mode: false) — ignorar silenciosamente
    if (live_mode === false) {
      console.log('Test notification (live_mode: false), ignoring safely');
      return res.status(200).json({ received: true, mode: 'test' });
    }

    // Ignora eventos que não são de pagamento
    if (type !== 'payment' || !data?.id) {
      console.log('Non-payment event, ignoring:', type);
      return res.status(200).json({ received: true, ignored: true });
    }

    const paymentId = data.id;

    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!accessToken) {
      console.error('MERCADOPAGO_ACCESS_TOKEN not configured');
      return res.status(200).json({ received: true, warning: 'token not configured' });
    }

    // Buscar detalhes do pagamento no Mercado Pago
    let payment;
    try {
      payment = await getPaymentDetails(paymentId, accessToken);
    } catch (err) {
      console.warn(`Payment ${paymentId} lookup failed:`, err.message);
      return res.status(200).json({ received: true, warning: `lookup failed: ${err.message}` });
    }

    console.log(`Payment ${paymentId}: status=${payment.status} detail=${payment.status_detail}`);

    // Só ativa PRO se aprovado
    if (payment.status !== 'approved') {
      return res.status(200).json({ received: true, payment_status: payment.status });
    }

    const deviceId = payment.external_reference;
    if (!deviceId) {
      console.warn('Approved payment without external_reference, ignoring');
      return res.status(200).json({ received: true, warning: 'no external_reference' });
    }

    // Salvar no Supabase
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Supabase not configured — cannot activate PRO for device:', deviceId);
      return res.status(500).json({ error: 'Database not configured' });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error } = await supabase
      .from('pro_users')
      .upsert(
        { device_id: deviceId, activated_at: new Date().toISOString() },
        { onConflict: 'device_id' }
      );

    if (error) {
      console.error('Supabase upsert error:', error);
      return res.status(500).json({ error: 'Database error' });
    }

    console.log(`✅ PRO activated for device: ${deviceId} (payment: ${paymentId})`);
    return res.status(200).json({ success: true, device_id: deviceId });

  } catch (err) {
    // Segurança final — nunca deixar o MP sem resposta 200 por erro inesperado
    console.error('Webhook unexpected error:', err.message);
    return res.status(200).json({ received: true, warning: 'unexpected error handled' });
  }
};

function getPaymentDetails(paymentId, accessToken) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.mercadopago.com',
      port: 443,
      path: `/v1/payments/${paymentId}`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (response) => {
      let data = '';
      response.on('data', (chunk) => (data += chunk));
      response.on('end', () => {
        if (response.statusCode >= 200 && response.statusCode < 300) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`MP API ${response.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}
