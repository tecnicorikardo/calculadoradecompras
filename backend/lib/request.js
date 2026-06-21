function getRequestBody(request) {
  if (request.body == null) {
    return {};
  }

  if (typeof request.body === 'string') {
    try {
      return JSON.parse(request.body);
    } catch {
      return {};
    }
  }

  return request.body;
}

function getSingleValue(value) {
  return Array.isArray(value) ? value[0] : value;
}

function getDeviceId(value) {
  const deviceId = getSingleValue(value);
  if (typeof deviceId !== 'string') {
    return null;
  }

  const normalizedDeviceId = deviceId.trim();
  if (normalizedDeviceId === '' || normalizedDeviceId.length > 200) {
    return null;
  }

  return normalizedDeviceId;
}

module.exports = {
  getDeviceId,
  getRequestBody,
  getSingleValue,
};
