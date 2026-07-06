import { getStoredAccessToken } from '../utils/storage.utils.js';

const DEFAULT_API_BASE_URL = '';
const API_PROXY_PREFIX = '/api';
const API_PROXY_PATHS = ['/applications', '/dashboard'];

function normalizeBaseUrl(baseUrl) {
  return (baseUrl ?? DEFAULT_API_BASE_URL).replace(/\/+$/, '');
}

const API_BASE_URL = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL);

export class ApiError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = options.status;
    this.details = options.details;
    this.response = options.response;
  }
}

function buildUrl(path) {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  if (!API_BASE_URL && API_PROXY_PATHS.some((apiPath) => normalizedPath.startsWith(apiPath))) {
    return `${API_PROXY_PREFIX}${normalizedPath}`;
  }

  return `${API_BASE_URL}${normalizedPath}`;
}

async function readJsonResponse(response) {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function getReadableErrorMessages(value) {
  if (value === null || value === undefined || value === '') {
    return [];
  }

  if (Array.isArray(value)) {
    return value.flatMap(getReadableErrorMessages);
  }

  if (typeof value === 'object') {
    const nestedMessage = getReadableErrorMessages(value.message);

    if (nestedMessage.length > 0) {
      return nestedMessage;
    }

    return Object.values(value).flatMap(getReadableErrorMessages);
  }

  return [String(value)];
}

function getFirstReadableError(value) {
  return getReadableErrorMessages(value)[0] || '';
}

function getErrorMessage(payload, response) {
  if (payload && typeof payload === 'object') {
    return (
      getFirstReadableError(payload.error?.message) ||
      getFirstReadableError(payload.message) ||
      response.statusText ||
      `Request failed with status ${response.status}`
    );
  }

  if (typeof payload === 'string') {
    return payload;
  }

  return response.statusText || `Request failed with status ${response.status}`;
}

function getErrorDetails(payload) {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  return payload.error?.errors || payload.errors || null;
}

export async function httpRequest(path, options = {}) {
  const { method = 'GET', body, headers = {}, auth = true } = options;
  const requestHeaders = new Headers(headers);
  const accessToken = auth ? getStoredAccessToken() : null;

  if (body !== undefined && !requestHeaders.has('Content-Type')) {
    requestHeaders.set('Content-Type', 'application/json');
  }

  if (accessToken) {
    requestHeaders.set('Authorization', `Bearer ${accessToken}`);
  }

  let response;

  try {
    response = await fetch(buildUrl(path), {
      method,
      headers: requestHeaders,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (error) {
    throw new ApiError('Unable to reach the ApplyFlow API. Check that the backend is running.', {
      response: error,
    });
  }

  const payload = await readJsonResponse(response);

  if (!response.ok) {
    throw new ApiError(getErrorMessage(payload, response), {
      status: response.status,
      details: getErrorDetails(payload),
      response: payload,
    });
  }

  return payload;
}
