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
        email: 'cliente@gmail.com',
        first_name: 'Cliente',
        last_name: 'SomaFacil',
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
              httpStatus: response.statusCode, 
              // Campos de diagnóstico diretos
              paymentId: payment.id,
              paymentStatus: payment.status,
              statusDetail: payment.status_detail,
              qrCodeGenerated: !!payment.point_of_interaction?.transaction_data?.qr_code,
              // Payload bruto completo do Mercado Pago para diagnóstico
              raw: {
                status: payment.status,
                status_detail: payment.status_detail,
                operation_type: payment.operation_type,
                payment_method_id: payment.payment_method_id,
                payment_type_id: payment.payment_type_id,
                error_codes: payment.error_codes,
                description: payment.description,
                collector_id: payment.collector_id,
                payer: payment.payer,
                point_of_interaction: payment.point_of_interaction,
              },
            });
          } else {
            let errorBody = {};
            try { errorBody = JSON.parse(data); } catch {}
            reject(new Error(`MP API error ${response.statusCode}: ${JSON.stringify(errorBody)}`));
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
