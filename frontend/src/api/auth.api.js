import { httpRequest } from './http-client.js';

export function register(payload) {
  return httpRequest('/auth/register', {
    method: 'POST',
    body: payload,
    auth: false,
  });
}

export function login(payload) {
  return httpRequest('/auth/login', {
    method: 'POST',
    body: payload,
    auth: false,
  });
}

export function getCurrentUser() {
  return httpRequest('/auth/me');
}

export function requestPasswordReset(payload) {
  return httpRequest('/auth/forgot-password', {
    method: 'POST',
    body: payload,
    auth: false,
  });
}

export function resetPassword(payload) {
  return httpRequest('/auth/reset-password', {
    method: 'POST',
    body: payload,
    auth: false,
  });
}
