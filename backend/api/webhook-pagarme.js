const { createClient } = require('@supabase/supabase-js');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { type, data } = req.body;

    console.log('Pagar.me Webhook received:', { type, orderId: data?.id });

    // Processa eventos de pagamento confirmado
    // Pagar.me envia "order.paid" quando o pedido é pago
    // ou "charge.paid" quando uma cobrança é paga
    if (type === 'order.paid' || type === 'charge.paid') {
      // Para order.paid, os dados vêm em data
      // Para charge.paid, pode vir em data.order
      const order = type === 'order.paid' ? data : data?.order;
      
      if (!order) {
        console.log('Order data not found in webhook');
        return res.status(200).json({ received: true });
      }

      // Buscar device_id do metadata do pedido
      const deviceId = order.metadata?.device_id;
      
      if (!deviceId) {
        console.log('device_id not found in order metadata');
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
