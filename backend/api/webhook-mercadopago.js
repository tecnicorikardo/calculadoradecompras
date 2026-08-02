const { createClient } = require('@supabase/supabase-js');
const https = require('https');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action, data, type } = req.body;

    console.log('Mercado Pago Webhook received:', { action, type, id: data?.id });

    // Mercado Pago envia notificação quando o pagamento é atualizado
    // action: "payment.updated" e type: "payment"
    if (type === 'payment' && data?.id) {
      const paymentId = data.id;

      // Buscar detalhes do pagamento
      const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
      if (!accessToken) {
        throw new Error('MERCADOPAGO_ACCESS_TOKEN not configured');
      }

      const payment = await getPaymentDetails(paymentId, accessToken);

      // Só processa se o pagamento foi aprovado
      if (payment.status === 'approved') {
        const deviceId = payment.external_reference;

        if (!deviceId) {
          console.log('Payment without external_reference, ignoring');
          return res.status(200).json({ received: true });
        }

        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

        if (!supabaseUrl || !supabaseServiceKey) {
          throw new Error('Supabase not configured');
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Ativa PRO para o device_id
        const { error } = await supabase
          .from('pro_users')
          .upsert({ 
            device_id: deviceId,
            activated_at: new Date().toISOString(),
          }, { 
            onConflict: 'device_id' 
          });

        if (error) {
          console.error('Error saving to Supabase:', error);
          return res.status(500).json({ error: 'Database error' });
        }

        console.log(`PRO activated for device: ${deviceId}`);
        return res.status(200).json({ success: true, device_id: deviceId });
      }
    }

    // Outros eventos ou status
    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('Webhook processing error:', err);
    return res.status(500).json({ error: err.message });
  }
};

async function getPaymentDetails(paymentId, accessToken) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.mercadopago.com',
      port: 443,
      path: `/v1/payments/${paymentId}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`Mercado Pago API error: ${res.statusCode} - ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}
