const https = require('https');
const crypto = require('crypto');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  
  const result = {
    timestamp: new Date().toISOString(),
    accessTokenSet: !!accessToken,
    accessTokenLength: accessToken ? accessToken.length : 0,
    accessTokenStart: accessToken ? accessToken.substring(0, 20) : 'NOT_SET',
  };

  if (!accessToken) {
    result.test = 'SKIPPED';
    result.message = 'MERCADOPAGO_ACCESS_TOKEN not configured';
    return res.status(200).json(result);
  }

  // Tentar criar um pagamento de teste
  try {
    const idempotencyKey = crypto.randomUUID();
    
    const paymentBody = JSON.stringify({
      transaction_amount: 10.00,
      description: 'Soma Facil PRO - Teste',
      payment_method_id: 'pix',
      payer: {
        email: 'teste@somafacil.app',
        first_name: 'Cliente',
        last_name: 'Teste',
        identification: {
          type: 'CPF',
          number: '00000000000'
        }
      },
      external_reference: 'test_device_123',
    });

    const testResult = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.mercadopago.com',
        port: 443,
        path: '/v1/payments',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Idempotency-Key': idempotencyKey,
          'Content-Length': Buffer.byteLength(paymentBody),
        },
      };

      const req = https.request(options, (response) => {
        let data = '';
        response.on('data', (chunk) => data += chunk);
        response.on('end', () => {
          if (response.statusCode >= 200 && response.statusCode < 300) {
            const payment = JSON.parse(data);
            resolve({ 
              success: true, 
              status: response.statusCode, 
              paymentId: payment.id,
              paymentStatus: payment.status,
              qrCodeGenerated: !!payment.point_of_interaction?.transaction_data?.qr_code,
            });
          } else {
            reject(new Error(`Mercado Pago API error: ${response.statusCode} - ${data}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });
      
      req.write(paymentBody);
      req.end();
    });

    result.test = 'SUCCESS';
    result.message = 'Mercado Pago Access Token is valid and working';
    result.mercadopago_response = testResult;
    
    return res.status(200).json(result);
  } catch (error) {
    result.test = 'FAILED';
    result.error = error.message;
    result.stack = error.stack;
    
    return res.status(200).json(result);
  }
};
