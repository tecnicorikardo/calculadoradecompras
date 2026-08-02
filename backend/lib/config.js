class ConfigurationError extends Error {
  constructor(variableName) {
    super(`Missing or invalid environment variable: ${variableName}`);
    this.name = 'ConfigurationError';
    this.variableName = variableName;
  }
}

const PLACEHOLDER_PARTS = ['seu_', 'sua_', 'your_', 'example'];

function isConfigured(value) {
  if (typeof value !== 'string' || value.trim() === '') {
    return false;
  }

  const normalizedValue = value.trim().toLowerCase();
  return !PLACEHOLDER_PARTS.some((part) => normalizedValue.includes(part));
}

function requireEnvironmentVariable(name, environment = process.env) {
  const value = environment[name];
  if (!isConfigured(value)) {
    throw new ConfigurationError(name);
  }

  return value.trim();
}

function getBackendUrl(environment = process.env) {
  const configuredUrl = environment.BACKEND_URL;
  if (isConfigured(configuredUrl)) {
    return configuredUrl.trim().replace(/\/+$/, '');
  }

  const productionHost = environment.VERCEL_PROJECT_PRODUCTION_URL;
  if (isConfigured(productionHost)) {
    return `https://${productionHost.trim().replace(/^https?:\/\//, '')}`;
  }

  return 'https://calculadora-pro-ten.vercel.app';
}

function getConfigurationStatus(environment = process.env) {
  return {
    pagarme: isConfigured(environment.PAGARME_API_KEY),
    supabaseUrl: isConfigured(environment.SUPABASE_URL),
    supabaseServiceKey: isConfigured(environment.SUPABASE_SERVICE_KEY),
  };
}

module.exports = {
  ConfigurationError,
  getBackendUrl,
  getConfigurationStatus,
  isConfigured,
  requireEnvironmentVariable,
};
