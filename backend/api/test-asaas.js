const https = require('https');

module.exports = async (req, res) => {
  const apiKey = process.env.ASAAS_API_KEY;
  
  const debug = {
    timestamp: new Date().toISOString(),
    apiKeySet: !!apiKey,
    apiKeyLength: apiKey ? apiKey.length : 0,
    apiKeyStart: apiKey ? apiKey.substring(0, 20) : 'NOT SET',
  };

  if (!apiKey) {
    return res.status(500).json({ ...debug, error: 'API Key not configured' });
  }

  try {
    // Teste simples: listar clientes
    const result = await makeAsaasRequest('/v3/customers?limit=1', 'GET', apiKey);
    
    return res.status(200).json({
      ...debug,
      test: 'SUCCESS',
      response: result,
    });
  } catch (err) {
    return res.status(500).json({
      ...debug,
      test: 'FAILED',
      error: err.message,
      stack: err.stack,
    });
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
          reject(new Error(`Asaas API error: ${res.statusCode} - ${data}`));
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
