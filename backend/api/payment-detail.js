const https = require('https');

/**
 * GET /api/payment-detail?id=<payment_id>
 * Busca os detalhes completos de um pagamento no Mercado Pago.
 * Útil para diagnóstico: mostra status_detail, error_codes, etc.
 */
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const paymentId = req.query.id;
  if (!paymentId) {
    return res.status(400).json({ error: 'Missing ?id=<payment_id>' });
  }

  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) {
    return res.status(503).json({ error: 'MERCADOPAGO_ACCESS_TOKEN not configured' });
  }

  try {
    const payment = await new Promise((resolve, reject) => {
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

      const request = https.request(options, (response) => {
        let data = '';
        response.on('data', (chunk) => (data += chunk));
        response.on('end', () => {
          try {
            resolve({ statusCode: response.statusCode, body: JSON.parse(data) });
          } catch {
            resolve({ statusCode: response.statusCode, body: data });
          }
        });
      });
      request.on('error', reject);
      request.end();
    });

    return res.status(200).json({
      httpStatus: payment.statusCode,
      // Campos principais de diagnóstico
      id: payment.body.id,
      status: payment.body.status,
      status_detail: payment.body.status_detail,
      error_codes: payment.body.error_codes,
      // Dados do pagamento
      payment_method_id: payment.body.payment_method_id,
      payment_type_id: payment.body.payment_type_id,
      operation_type: payment.body.operation_type,
      // Dados do pagador
      payer: payment.body.payer,
      // Dados do Pix
      point_of_interaction: payment.body.point_of_interaction,
      // Coleta/recebedor
      collector_id: payment.body.collector_id,
      // Resposta bruta completa
      raw: payment.body,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
