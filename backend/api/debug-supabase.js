const { createClient } = require('@supabase/supabase-js');

module.exports = async (req, res) => {
  const debug = {
    timestamp: new Date().toISOString(),
    env: {
      SUPABASE_URL: process.env.SUPABASE_URL || 'NOT SET',
      SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY ? 'SET (hidden)' : 'NOT SET',
    },
  };

  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return res.status(500).json({
        ...debug,
        error: 'Missing Supabase credentials',
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Teste 1: Tentar listar tabelas
    debug.test1 = 'Attempting to query pro_users table...';
    
    const { data, error, status, statusText } = await supabase
      .from('pro_users')
      .select('device_id, activated_at')
      .limit(5);

    debug.query_result = {
      status,
      statusText,
      data_count: data ? data.length : 0,
      data: data,
      error: error ? {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      } : null,
    };

    return res.status(200).json(debug);
  } catch (err) {
    debug.exception = {
      message: err.message,
      stack: err.stack,
    };
    return res.status(500).json(debug);
  }
};
