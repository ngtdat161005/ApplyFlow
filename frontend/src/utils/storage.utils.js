const ACCESS_TOKEN_STORAGE_KEY = 'applyflow.accessToken';

function getLocalStorage() {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage;
}

export function getStoredAccessToken() {
  try {
    return getLocalStorage()?.getItem(ACCESS_TOKEN_STORAGE_KEY) ?? null;
  } catch {
    return null;
  }
}

export function setStoredAccessToken(accessToken) {
  try {
    getLocalStorage()?.setItem(ACCESS_TOKEN_STORAGE_KEY, accessToken);
  } catch {
    // Ignore storage failures so auth state can still live in memory.
  }
}

export function clearStoredAccessToken() {
  try {
    getLocalStorage()?.removeItem(ACCESS_TOKEN_STORAGE_KEY);
  } catch {
    // Ignore storage failures so logout can still clear in-memory state.
  }
}
