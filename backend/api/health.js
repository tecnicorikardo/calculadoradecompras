const { getBackendUrl, getConfigurationStatus } = require('../lib/config');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const configuration = getConfigurationStatus();
  const ready = Object.values(configuration).every(Boolean);

  return res.status(ready ? 200 : 503).json({
    service: 'soma-facil-backend',
    ready,
    backend_url: getBackendUrl(),
    configuration,
  });
};
