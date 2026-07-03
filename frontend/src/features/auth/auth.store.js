import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  getCurrentUser,
  login as loginRequest,
  register as registerRequest,
} from '../../api/auth.api.js';
import {
  clearStoredAccessToken,
  getStoredAccessToken,
  setStoredAccessToken,
} from '../../utils/storage.utils.js';
import {
  getAuthResponseToken,
  getAuthResponseUser,
  getErrorMessage,
} from './auth.utils.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(() => getStoredAccessToken());
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  const clearSession = useCallback(() => {
    clearStoredAccessToken();
    setAccessToken(null);
    setUser(null);
  }, []);

  const persistSession = useCallback((nextAccessToken, nextUser) => {
    setStoredAccessToken(nextAccessToken);
    setAccessToken(nextAccessToken);
    setUser(nextUser);
    setAuthError(null);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function bootstrapAuth() {
      const storedToken = getStoredAccessToken();

      if (!storedToken) {
        if (isMounted) {
          clearSession();
          setIsLoading(false);
        }

        return;
      }

      try {
        const response = await getCurrentUser();
        const currentUser = getAuthResponseUser(response);

        if (!currentUser) {
          throw new Error('Current user response did not include a user.');
        }

        if (isMounted) {
          setAccessToken(storedToken);
          setUser(currentUser);
          setAuthError(null);
        }
      } catch {
        if (isMounted) {
          clearSession();
          setAuthError(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    bootstrapAuth();

    return () => {
      isMounted = false;
    };
  }, [clearSession]);

  const login = useCallback(
    async (credentials) => {
      setAuthError(null);

      try {
        const response = await loginRequest(credentials);
        const nextAccessToken = getAuthResponseToken(response);
        const nextUser = getAuthResponseUser(response);

        if (!nextAccessToken || !nextUser) {
          throw new Error('Login response did not include a valid session.');
        }

        persistSession(nextAccessToken, nextUser);
        return response;
      } catch (error) {
        setAuthError(getErrorMessage(error, 'Login failed.'));
        throw error;
      }
    },
    [persistSession],
  );

  const register = useCallback(
    async (payload) => {
      setAuthError(null);

      try {
        const response = await registerRequest(payload);
        const nextAccessToken = getAuthResponseToken(response);
        const nextUser = getAuthResponseUser(response);

        if (nextAccessToken && nextUser) {
          persistSession(nextAccessToken, nextUser);
          return { response, didAuthenticate: true };
        }

        return { response, didAuthenticate: false };
      } catch (error) {
        setAuthError(getErrorMessage(error, 'Registration failed.'));
        throw error;
      }
    },
    [persistSession],
  );

  const logout = useCallback(() => {
    clearSession();
    setAuthError(null);
  }, [clearSession]);

  const value = useMemo(
    () => ({
      user,
      accessToken,
      isAuthenticated: Boolean(accessToken && user),
      isLoading,
      authError,
      login,
      register,
      logout,
    }),
    [accessToken, authError, isLoading, login, logout, register, user],
  );

  return createElement(AuthContext.Provider, { value }, children);
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider.');
  }

  return context;
}
