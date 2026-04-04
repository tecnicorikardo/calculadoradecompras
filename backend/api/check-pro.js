const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
);

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

  const deviceId = req.query.device_id;
  if (!deviceId) {
    return res.status(400).json({ error: 'Missing device_id' });
  }

  const { data, error } = await supabase
    .from('pro_users')
    .select('device_id, activated_at')
    .eq('device_id', deviceId)
    .maybeSingle();

  if (error) {
    return res.status(500).json({ error: 'Database error' });
  }

  return res.status(200).json({ is_pro: data !== null });
};
