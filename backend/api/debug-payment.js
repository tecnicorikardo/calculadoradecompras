const https = require('https');
const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
  const debug = {
    timestamp: new Date().toISOString(),
    method: req.method,
    env: {
      EFI_CLIENT_ID: process.env.EFI_CLIENT_ID ? 'SET' : 'NOT SET',
      EFI_CLIENT_SECRET: process.env.EFI_CLIENT_SECRET ? 'SET' : 'NOT SET',
      EFI_PIX_KEY: process.env.EFI_PIX_KEY || 'NOT SET',
      EFI_CERT_PASSWORD: process.env.EFI_CERT_PASSWORD === '' ? 'EMPTY (correct)' : (process.env.EFI_CERT_PASSWORD ? 'SET' : 'NOT SET'),
      EFI_CERT_PATH: process.env.EFI_CERT_PATH || './producao-918763-somafacil.p12',
    },
  };

  // Verifica se o certificado existe
  const certPath = process.env.EFI_CERT_PATH || './producao-918763-somafacil.p12';
  const fullCertPath = path.join(process.cwd(), certPath);
  
  try {
    const certExists = fs.existsSync(fullCertPath);
    debug.certificate = {
      path: certPath,
      fullPath: fullCertPath,
      exists: certExists,
      cwd: process.cwd(),
    };

    if (certExists) {
      const stats = fs.statSync(fullCertPath);
      debug.certificate.size = stats.size;
    }
  } catch (err) {
    debug.certificate = {
      error: err.message,
    };
  }

  // Tenta autenticar na EFI
  if (process.env.EFI_CLIENT_ID && process.env.EFI_CLIENT_SECRET) {
    try {
      const { getEfiToken } = require('./auth-efi');
      const token = await getEfiToken();
      debug.efi_auth = {
        success: true,
        token_length: token ? token.length : 0,
      };
    } catch (err) {
      debug.efi_auth = {
        success: false,
        error: err.message,
        stack: err.stack,
      };
    }
  }

  res.status(200).json(debug);
};
