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
