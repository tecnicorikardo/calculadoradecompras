const { createClient } = require('@supabase/supabase-js');

/**
 * Endpoint para Keep-Alive do Supabase.
 * Faz uma consulta leve na tabela 'pro_users' para registrar atividade
 * no Postgres do Supabase e evitar que o banco seja pausado por inatividade (regra de 7 dias do plano Free).
 */
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return res.status(500).json({
      status: 'error',
      message: 'Supabase credentials not configured',
      timestamp: new Date().toISOString(),
    });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Consulta leve (HEAD) que conta os registros sem transferir dados pesados
    const { count, error } = await supabase
      .from('pro_users')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Keep-alive query error:', error);
      return res.status(500).json({
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }

    console.log(`[Keep-Alive] Supabase pinged successfully at ${new Date().toISOString()}`);

    return res.status(200).json({
      status: 'ok',
      message: 'Supabase keep-alive ping successful! Database is active.',
      usersCount: count,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Keep-alive exception:', err);
    return res.status(500).json({
      status: 'error',
      error: err.message,
      timestamp: new Date().toISOString(),
    });
  }
};
