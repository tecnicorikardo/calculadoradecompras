const fs = require('fs');
const path = require('path');
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
  
  let cert;
  
  // Prioridade 1: Usar certificado em base64 da variável de ambiente
  if (process.env.EFI_CERT_BASE64) {
    cert = Buffer.from(process.env.EFI_CERT_BASE64, 'base64');
    console.log('Using certificate from EFI_CERT_BASE64 environment variable');
  } else {
    // Prioridade 2: Tentar ler do arquivo
    const certFilename = process.env.EFI_CERT_PATH || 'producao-918763-somafacil.p12';
    const possiblePaths = [
      certFilename,
      path.join(process.cwd(), certFilename),
      path.join(__dirname, '..', certFilename),
      path.join('/var/task', certFilename),
    ];

    for (const tryPath of possiblePaths) {
      try {
        if (fs.existsSync(tryPath)) {
          cert = fs.readFileSync(tryPath);
          console.log(`Using certificate from file: ${tryPath}`);
          break;
        }
      } catch (e) {
        // Continua tentando outros caminhos
      }
    }

    if (!cert) {
      throw new Error(`Certificate not found. Set EFI_CERT_BASE64 env var or place file at: ${possiblePaths.join(', ')}`);
    }
  }
  
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  return new Promise((resolve, reject) => {
    const certPassword = process.env.EFI_CERT_PASSWORD;
    const options = {
      hostname: 'pix.api.efipay.com.br',
      port: 443,
      path: '/oauth/token',
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
      pfx: cert,
    };

    // Só adiciona passphrase se realmente tiver valor
    if (certPassword && certPassword !== '') {
      options.passphrase = certPassword;
    }

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
