const { createClient } = require('@supabase/supabase-js');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { event, payment } = req.body;

    console.log('Asaas Webhook received:', { event, paymentId: payment?.id });

    // Só processa se for pagamento confirmado
    if (event === 'PAYMENT_RECEIVED' || event === 'PAYMENT_CONFIRMED') {
      const deviceId = payment.externalReference;
      
      if (!deviceId) {
        console.log('Payment without externalReference, ignoring');
        return res.status(200).json({ received: true });
      }

      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

      if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Supabase not configured');
      }

      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      // Ativa PRO para o device_id
      const { error } = await supabase
        .from('pro_users')
        .upsert({ 
          device_id: deviceId,
          activated_at: new Date().toISOString(),
        }, { 
          onConflict: 'device_id' 
        });

      if (error) {
        console.error('Error saving to Supabase:', error);
        return res.status(500).json({ error: 'Database error' });
      }

      console.log(`PRO activated for device: ${deviceId}`);
      return res.status(200).json({ success: true, device_id: deviceId });
    }

    // Outros eventos
    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('Webhook processing error:', err);
    return res.status(500).json({ error: err.message });
  }
};
