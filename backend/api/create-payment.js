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
    const apiKey = process.env.PAGARME_API_KEY;
    if (!apiKey) {
      throw new Error('PAGARME_API_KEY not configured');
    }

    // Criar pedido com Pix
    const orderBody = JSON.stringify({
      items: [
        {
          amount: 1000, // R$ 10,00 em centavos
          description: 'Soma Facil PRO - Acesso Vitalício',
          quantity: 1,
          code: device_id, // Usar device_id como código do item
        }
      ],
      customer: {
        name: `Cliente ${device_id.substring(0, 8)}`,
        email: `${device_id.substring(0, 12)}@somafacil.app`,
        type: 'individual',
        document: '00000000000', // CPF genérico
        phones: {
          home_phone: {
            country_code: '55',
            number: '000000000',
            area_code: '11'
          }
        }
      },
      payments: [
        {
          payment_method: 'pix',
          pix: {
            expires_in: 3600, // 1 hora em segundos
            additional_information: [
              {
                name: 'device_id',
                value: device_id
              }
            ]
          }
        }
      ],
      metadata: {
        device_id: device_id // Salvar device_id no metadata para o webhook
      }
    });

    const order = await makePagarmeRequest('/core/v5/orders', 'POST', apiKey, orderBody);

    // Extrair dados do Pix da resposta
    const charge = order.charges && order.charges[0];
    if (!charge || !charge.last_transaction) {
      throw new Error('Pix charge not found in order response');
    }

    const pixData = charge.last_transaction;
    
    return res.status(200).json({
      qrcode: pixData.qr_code || '',
      qrcode_image: pixData.qr_code_url || '',
      txid: order.id,
    });
  } catch (err) {
    console.error('Payment creation error:', err);
    return res.status(500).json({ error: err.message });
  }
};

async function makePagarmeRequest(path, method, apiKey, body = null) {
  return new Promise((resolve, reject) => {
    // Basic Auth: apiKey como username, senha vazia
    const authString = Buffer.from(`${apiKey}:`).toString('base64');
    
    const options = {
      hostname: 'api.pagar.me',
      port: 443,
      path: path,
      method: method,
      headers: {
        'Authorization': `Basic ${authString}`,
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
          reject(new Error(`Pagar.me API error: ${res.statusCode} - ${data}`));
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
