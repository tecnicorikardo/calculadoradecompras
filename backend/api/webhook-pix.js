const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { pix } = req.body;

    if (!pix || !Array.isArray(pix) || pix.length === 0) {
      return res.status(200).json({ ok: true });
    }

    // Processa cada notificação Pix
    for (const notification of pix) {
      const txid = notification.txid;
      
      if (!txid) continue;

      // Consulta a cobrança na EFI para confirmar o pagamento
      const cobResponse = await fetch(
        `https://api-pix.gerencianet.com.br/v2/cob/${txid}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.EFI_ACCESS_TOKEN}`,
          },
        },
      );

      if (!cobResponse.ok) continue;

      const cobranca = await cobResponse.json();

      // Verifica se foi paga
      if (cobranca.status !== 'CONCLUIDA') continue;

      // Pega o device_id que foi enviado como solicitacaoPagador
      const deviceId = cobranca.solicitacaoPagador;
      if (!deviceId) continue;

      // Salva no Supabase
      await supabase
        .from('pro_users')
        .upsert({ device_id: deviceId, activated_at: new Date().toISOString() });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Webhook Pix error:', err);
    return res.status(500).json({ error: 'Internal error' });
  }
};
