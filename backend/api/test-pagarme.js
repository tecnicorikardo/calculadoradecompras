const https = require('https');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const apiKey = process.env.PAGARME_API_KEY;
  
  const result = {
    timestamp: new Date().toISOString(),
    apiKeySet: !!apiKey,
    apiKeyLength: apiKey ? apiKey.length : 0,
    apiKeyStart: apiKey ? apiKey.substring(0, 20) : 'NOT_SET',
  };

  if (!apiKey) {
    result.test = 'SKIPPED';
    result.message = 'PAGARME_API_KEY not configured';
    return res.status(200).json(result);
  }

  // Tentar autenticar com Pagar.me
  try {
    const authString = Buffer.from(`${apiKey}:`).toString('base64');
    
    const testResult = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.pagar.me',
        port: 443,
        path: '/core/v5/orders?page=1&size=1', // Lista pedidos (só pra testar auth)
        method: 'GET',
        headers: {
          'Authorization': `Basic ${authString}`,
          'Content-Type': 'application/json',
        },
      };

      const req = https.request(options, (response) => {
        let data = '';
        response.on('data', (chunk) => data += chunk);
        response.on('end', () => {
          if (response.statusCode === 200) {
            resolve({ success: true, status: response.statusCode, data });
          } else {
            reject(new Error(`Pagar.me API error: ${response.statusCode} - ${data}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });
      
      req.end();
    });

    result.test = 'SUCCESS';
    result.message = 'Pagar.me API key is valid and working';
    result.pagarme_response = testResult;
    
    return res.status(200).json(result);
  } catch (error) {
    result.test = 'FAILED';
    result.error = error.message;
    result.stack = error.stack;
    
    return res.status(200).json(result);
  }
};
