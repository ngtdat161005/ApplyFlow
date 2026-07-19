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

function getReadableMessages(value) {
  if (value === null || value === undefined || value === '') {
    return [];
  }

  if (Array.isArray(value)) {
    return value.flatMap(getReadableMessages);
  }

  if (typeof value === 'object') {
    const nestedMessage = getReadableMessages(value.message);

    if (nestedMessage.length > 0) {
      return nestedMessage;
    }

    return Object.values(value).flatMap(getReadableMessages);
  }

  return [String(value)];
}

function getRawErrorDetails(error) {
  return error?.details || error?.errors || null;
}

export function getErrorMessage(error, fallbackMessage) {
  return getReadableMessages(error?.message)[0] || fallbackMessage;
}

export function getErrorDetails(error, options = {}) {
  const details = getRawErrorDetails(error);
  const excludedFields = new Set(options.excludeFields || []);

  if (!details) {
    return [];
  }

  if (Array.isArray(details)) {
    return details.flatMap(getReadableMessages);
  }

  if (typeof details === 'object') {
    return Object.entries(details)
      .filter(([fieldName]) => !excludedFields.has(fieldName))
      .flatMap(([, value]) => getReadableMessages(value));
  }

  return getReadableMessages(details);
}

export function getErrorFieldErrors(error) {
  const details = getRawErrorDetails(error);

  if (!details || Array.isArray(details) || typeof details !== 'object') {
    return {};
  }

  return Object.entries(details).reduce((fieldErrors, [fieldName, value]) => {
    const messages = getReadableMessages(value);

    if (messages.length > 0) {
      fieldErrors[fieldName] = messages.join(' ');
    }

    return fieldErrors;
  }, {});
}

export function getErrorCode(error) {
  return typeof error?.response?.code === 'string' ? error.response.code : '';
}
