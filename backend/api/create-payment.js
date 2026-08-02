const https = require('https');
const crypto = require('crypto');

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

  try {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!accessToken) {
      throw new Error('MERCADOPAGO_ACCESS_TOKEN not configured');
    }

    // Gerar idempotency key único
    const idempotencyKey = crypto.randomUUID();

    // Criar pagamento Pix
    const paymentBody = JSON.stringify({
      transaction_amount: 10.00,
      description: 'Soma Facil PRO - Acesso Vitalício',
      payment_method_id: 'pix',
      payer: {
        email: `${device_id.substring(0, 12)}@somafacil.app`,
        first_name: 'Cliente',
        last_name: device_id.substring(0, 8),
      },
      external_reference: device_id, // device_id para o webhook
      notification_url: `${process.env.BACKEND_URL || 'https://calculadora-pro-ten.vercel.app'}/api/webhook-mercadopago`,
    });

    const payment = await makeMercadoPagoRequest(
      '/v1/payments',
      'POST',
      accessToken,
      paymentBody,
      idempotencyKey
    );

    // Extrair dados do Pix
    const qrCode = payment.point_of_interaction?.transaction_data?.qr_code || '';
    const qrCodeBase64 = payment.point_of_interaction?.transaction_data?.qr_code_base64 || '';
    const ticketUrl = payment.point_of_interaction?.transaction_data?.ticket_url || '';

    return res.status(200).json({
      qrcode: qrCode,
      qrcode_image: qrCodeBase64 ? `data:image/png;base64,${qrCodeBase64}` : ticketUrl,
      txid: payment.id.toString(),
    });
  } catch (err) {
    console.error('Payment creation error:', err);
    return res.status(500).json({ error: err.message });
  }
};

async function makeMercadoPagoRequest(path, method, accessToken, body = null, idempotencyKey = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.mercadopago.com',
      port: 443,
      path: path,
      method: method,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    };

    if (idempotencyKey) {
      options.headers['X-Idempotency-Key'] = idempotencyKey;
    }

    if (body) {
      options.headers['Content-Length'] = Buffer.byteLength(body);
    }

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
    if (body) {
      req.write(body);
    }
    req.end();
  });
}
