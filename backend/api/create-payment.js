const https = require('https');

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
    const apiKey = process.env.ASAAS_API_KEY;
    if (!apiKey) {
      throw new Error('ASAAS_API_KEY not configured');
    }

    // 1. Criar cliente (opcional, mas recomendado)
    const customerName = `Cliente ${device_id.substring(0, 8)}`;
    const customerBody = JSON.stringify({
      name: customerName,
      cpfCnpj: '00000000000', // CPF fictício, ajuste se necessário
      mobilePhone: '00000000000',
      notificationDisabled: true,
    });

    const customer = await makeAsaasRequest('/v3/customers', 'POST', apiKey, customerBody);

    // 2. Criar cobrança Pix
    const paymentBody = JSON.stringify({
      customer: customer.id,
      billingType: 'PIX',
      value: 10.00,
      dueDate: new Date().toISOString().split('T')[0], // hoje
      description: `Soma Facil PRO - ${device_id}`,
      externalReference: device_id,
    });

    const payment = await makeAsaasRequest('/v3/payments', 'POST', apiKey, paymentBody);

    // 3. Pegar QR Code
    const qrCode = await makeAsaasRequest(`/v3/payments/${payment.id}/pixQrCode`, 'GET', apiKey);

    return res.status(200).json({
      qrcode: qrCode.payload,
      qrcode_image: qrCode.encodedImage,
      txid: payment.id,
    });
  } catch (err) {
    console.error('Payment creation error:', err);
    return res.status(500).json({ error: err.message });
  }
};

async function makeAsaasRequest(path, method, apiKey, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.asaas.com',
      port: 443,
      path: path,
      method: method,
      headers: {
        'access_token': apiKey,
        'Content-Type': 'application/json',
      },
    };

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
          reject(new Error(`Asaas API error: ${res.statusCode} ${data}`));
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
