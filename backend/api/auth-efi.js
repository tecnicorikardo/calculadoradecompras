const fs = require('fs');
const https = require('https');

let cachedToken = null;
let tokenExpiry = 0;

async function getEfiToken() {
  // Retorna token cacheado se ainda válido
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  const clientId = process.env.EFI_CLIENT_ID;
  const clientSecret = process.env.EFI_CLIENT_SECRET;
  const certPath = process.env.EFI_CERT_PATH || './producao-918763-somafacil.p12';
  
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const cert = fs.readFileSync(certPath);

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api-pix.gerencianet.com.br',
      port: 443,
      path: '/oauth/token',
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
      pfx: cert,
      passphrase: process.env.EFI_CERT_PASSWORD || '',
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          const json = JSON.parse(data);
          cachedToken = json.access_token;
          tokenExpiry = Date.now() + (json.expires_in * 1000) - 60000; // 1min antes
          resolve(cachedToken);
        } else {
          reject(new Error(`EFI auth failed: ${res.statusCode} ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(JSON.stringify({ grant_type: 'client_credentials' }));
    req.end();
  });
}

module.exports = { getEfiToken };
