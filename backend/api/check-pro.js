const { createClient } = require('@supabase/supabase-js');
const {
  ConfigurationError,
  requireEnvironmentVariable,
} = require('../lib/config');
const { getDeviceId } = require('../lib/request');

module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const deviceId = getDeviceId(req.query.device_id);
  if (!deviceId) {
    return res.status(400).json({ error: 'Missing device_id' });
  }

  try {
    const supabaseUrl = requireEnvironmentVariable('SUPABASE_URL');
    const supabaseServiceKey = requireEnvironmentVariable(
      'SUPABASE_SERVICE_KEY',
    );
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data, error } = await supabase
      .from('pro_users')
      .select('device_id, activated_at')
      .eq('device_id', deviceId)
      .maybeSingle();

    if (error) {
      console.error('Supabase check-pro error:', error);
      return res.status(500).json({ error: 'Database error' });
    }

    return res.status(200).json({ is_pro: data !== null });
  } catch (error) {
    if (error instanceof ConfigurationError) {
      console.error(error.message);
      return res.status(503).json({
        code: 'configuration_error',
        error: 'PRO service is not configured',
      });
    }

    console.error('Check PRO error:', error);
    return res.status(500).json({ error: 'Internal error' });
  }
};
