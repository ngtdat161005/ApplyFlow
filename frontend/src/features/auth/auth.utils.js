export function getAuthResponseUser(response) {
  return response?.user || response?.data?.user || null;
}

export function getAuthResponseToken(response) {
  return (
    response?.accessToken ||
    response?.token ||
    response?.data?.accessToken ||
    response?.data?.token ||
    null
  );
}

export function getErrorMessage(error, fallbackMessage) {
  return error?.message || fallbackMessage;
}

export function getErrorDetails(error) {
  const details = error?.details || error?.errors;

  if (!details) {
    return [];
  }

  if (Array.isArray(details)) {
    return details.filter(Boolean);
  }

  if (typeof details === 'object') {
    return Object.values(details).flat().filter(Boolean);
  }

  return [String(details)];
}
