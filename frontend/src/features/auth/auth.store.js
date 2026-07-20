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
import { subscribeToUnauthorizedResponse } from '../../api/http-client.js';
import { queryClient } from '../../app/query-client.js';
import {
  clearStoredAccessToken,
  getStoredAccessToken,
  setStoredAccessToken,
} from '../../utils/storage.utils.js';
import {
  getAuthResponseToken,
  getAuthResponseUser,
} from './auth.utils.js';

const AuthContext = createContext(null);
const SESSION_EXPIRED_MESSAGE = 'Your session has expired. Please log in again.';
const SESSION_RESTORE_ERROR =
  'We could not restore your session. Check the API connection and try again.';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(() => getStoredAccessToken());
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [bootstrapError, setBootstrapError] = useState(null);
  const [bootstrapAttempt, setBootstrapAttempt] = useState(0);

  const clearSession = useCallback(() => {
    queryClient.clear();
    clearStoredAccessToken();
    setAccessToken(null);
    setUser(null);
  }, []);

  const persistSession = useCallback((nextAccessToken, nextUser) => {
    setStoredAccessToken(nextAccessToken);
    setAccessToken(nextAccessToken);
    setUser(nextUser);
    setAuthError(null);
    setBootstrapError(null);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const unsubscribeFromUnauthorizedResponses = subscribeToUnauthorizedResponse(
      (failedAccessToken) => {
        if (!isMounted || getStoredAccessToken() !== failedAccessToken) {
          return;
        }

        clearSession();
        setBootstrapError(null);
        setAuthError(SESSION_EXPIRED_MESSAGE);
        setIsLoading(false);
      },
    );

    async function bootstrapAuth() {
      const storedToken = getStoredAccessToken();

      if (!storedToken) {
        if (isMounted) {
          clearSession();
          setBootstrapError(null);
          setIsLoading(false);
        }

        return;
      }

      setIsLoading(true);
      setBootstrapError(null);

      try {
        const response = await getCurrentUser();
        const currentUser = getAuthResponseUser(response);

        if (!currentUser) {
          throw new Error(SESSION_RESTORE_ERROR);
        }

        if (isMounted) {
          setAccessToken(storedToken);
          setUser(currentUser);
          setAuthError(null);
        }
      } catch (error) {
        if (isMounted) {
          if (error?.status === 401) {
            clearSession();
            setBootstrapError(null);
            setAuthError(SESSION_EXPIRED_MESSAGE);
          } else {
            setUser(null);
            setAuthError(null);
            setBootstrapError(SESSION_RESTORE_ERROR);
          }
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
      unsubscribeFromUnauthorizedResponses();
    };
  }, [bootstrapAttempt, clearSession]);

  const retryBootstrap = useCallback(() => {
    setBootstrapError(null);
    setIsLoading(true);
    setBootstrapAttempt((currentAttempt) => currentAttempt + 1);
  }, []);

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  const login = useCallback(
    async (credentials) => {
      setAuthError(null);

      const response = await loginRequest(credentials);
      const nextAccessToken = getAuthResponseToken(response);
      const nextUser = getAuthResponseUser(response);

      if (!nextAccessToken || !nextUser) {
        throw new Error('We could not start your session. Please try again.');
      }

      persistSession(nextAccessToken, nextUser);
      return response;
    },
    [persistSession],
  );

  const register = useCallback(
    async (payload) => {
      setAuthError(null);

      const response = await registerRequest(payload);
      const nextAccessToken = getAuthResponseToken(response);
      const nextUser = getAuthResponseUser(response);

      if (nextAccessToken && nextUser) {
        persistSession(nextAccessToken, nextUser);
        return { response, didAuthenticate: true };
      }

      return { response, didAuthenticate: false };
    },
    [persistSession],
  );

  const logout = useCallback(() => {
    clearSession();
    setAuthError(null);
    setBootstrapError(null);
  }, [clearSession]);

  const completeAccountDeletion = useCallback(() => {
    clearSession();
    setAuthError(null);
    setBootstrapError(null);
  }, [clearSession]);

  const value = useMemo(
    () => ({
      user,
      accessToken,
      isAuthenticated: Boolean(accessToken && user),
      isLoading,
      authError,
      bootstrapError,
      clearAuthError,
      completeAccountDeletion,
      login,
      register,
      logout,
      retryBootstrap,
    }),
    [
      accessToken,
      authError,
      bootstrapError,
      clearAuthError,
      completeAccountDeletion,
      isLoading,
      login,
      logout,
      register,
      retryBootstrap,
      user,
    ],
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
