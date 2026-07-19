import { httpRequest } from './http-client.js';

export function deleteCurrentUser(payload) {
  return httpRequest('/users/me', {
    method: 'DELETE',
    body: payload,
    invalidateSessionOnUnauthorized: false,
  });
}
