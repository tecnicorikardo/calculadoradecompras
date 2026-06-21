const {
  ConfigurationError,
  getBackendUrl,
  requireEnvironmentVariable,
} = require('../lib/config');
const { getDeviceId, getRequestBody } = require('../lib/request');

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

  const requestBody = getRequestBody(req);
  const deviceId = getDeviceId(requestBody.device_id);
  if (!deviceId) {
    return res.status(400).json({ error: 'Missing device_id' });
  }

  try {
    const accessToken = requireEnvironmentVariable('MP_ACCESS_TOKEN');
    const backendUrl = getBackendUrl();
    const pagesUrl = 'https://tecnicorikardo.github.io/calculadoradecompras';

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
      external_reference: deviceId,
      back_urls: {
        success: `${pagesUrl}/pro-success.html`,
        failure: `${pagesUrl}/pro-failure.html`,
        pending: `${pagesUrl}/pro-pending.html`,
      },
      auto_return: 'approved',
      notification_url: `${backendUrl}/api/webhook`,
    };

    const mercadoPagoResponse = await fetch(
      'https://api.mercadopago.com/checkout/preferences',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      },
    );

    if (!mercadoPagoResponse.ok) {
      const errorBody = await mercadoPagoResponse.text();
      console.error(
        `Mercado Pago preference error (${mercadoPagoResponse.status}):`,
        errorBody,
      );
      return res.status(502).json({
        code: 'payment_provider_error',
        error: 'Failed to create preference',
      });
    }

    const preference = await mercadoPagoResponse.json();
    if (typeof preference.init_point !== 'string') {
      console.error('Mercado Pago response does not contain init_point');
      return res.status(502).json({
        code: 'invalid_payment_response',
        error: 'Invalid payment provider response',
      });
    }

    return res.status(200).json({ checkout_url: preference.init_point });
  } catch (error) {
    if (error instanceof ConfigurationError) {
      console.error(error.message);
      return res.status(503).json({
        code: 'configuration_error',
        error: 'Payment service is not configured',
      });
    }

    console.error('Create payment error:', error);
    return res.status(500).json({
      code: 'internal_error',
      error: 'Internal error',
    });
  }
};
