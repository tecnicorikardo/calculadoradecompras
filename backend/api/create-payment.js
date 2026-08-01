const https = require('https');
const fs = require('fs');

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

  const { device_id } = req.body;
  if (!device_id) {
    return res.status(400).json({ error: 'Missing device_id' });
  }

  try {
    // Autentica na EFI
    const { getEfiToken } = require('./auth-efi');
    const token = await getEfiToken();

    // Cria cobrança Pix
    const txid = `somafacil${Date.now()}`;
    const certPath = process.env.EFI_CERT_PATH || './producao-918763-somafacil.p12';
    const cert = fs.readFileSync(certPath);

    const body = JSON.stringify({
      calendario: { expiracao: 3600 },
      devedor: { nome: 'Cliente Soma Facil' },
      valor: { original: '10.00' },
      chave: process.env.EFI_PIX_KEY,
      solicitacaoPagador: device_id,
      infoAdicionais: [
        { nome: 'Produto', valor: 'Soma Facil PRO Vitalicio' },
      ],
    });

    const pixResponse = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'api-pix.gerencianet.com.br',
        port: 443,
        path: `/v2/cob/${txid}`,
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
        },
        pfx: cert,
        passphrase: process.env.EFI_CERT_PASSWORD || '',
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => resolve({ status: res.statusCode, body: data }));
      });

      req.on('error', reject);
      req.write(body);
      req.end();
    });

    if (pixResponse.status !== 201 && pixResponse.status !== 200) {
      console.error('EFI error:', pixResponse.body);
      return res.status(500).json({ error: 'Failed to create Pix charge' });
    }

    const cobranca = JSON.parse(pixResponse.body);
    return res.status(200).json({
      qrcode: cobranca.pixCopiaECola,
      qrcode_image: cobranca.location,
      txid: cobranca.txid,
    });
  } catch (err) {
    console.error('Payment creation error:', err);
    return res.status(500).json({ error: err.message });
  }
};
