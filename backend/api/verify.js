const https = require('https');

/**
 * GET /api/verify?txid=<payment_id>
 *
 * Consulta o Mercado Pago pelo ID do pagamento e retorna se foi aprovado.
 * Usado pelo frontend para verificar se o Pix foi pago após o usuário
 * clicar em "Já fiz o Pix — Ativar PRO".
 */
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { txid } = req.query;
  if (!txid) {
    return res.status(400).json({ error: 'Missing txid' });
  }

  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) {
    return res.status(503).json({ error: 'MERCADOPAGO_ACCESS_TOKEN not configured' });
  }

  try {
    const payment = await getPaymentDetails(txid, accessToken);

    const paid = payment.status === 'approved';

    return res.status(200).json({
      paid,
      status: payment.status,
      txid: payment.id,
    });
  } catch (err) {
    console.error('Verify payment error:', err);
    return res.status(500).json({ error: err.message });
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
          reject(new Error(`Mercado Pago API error: ${response.statusCode} - ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}
