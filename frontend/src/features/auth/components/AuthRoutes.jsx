import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAuth } from '../auth.store.js';

function AuthLoadingScreen() {
  return (
    <main className="full-page-loader" aria-live="polite">
      <div role="status">Loading session...</div>
    </main>
  );
}

function AuthBootstrapError({ message, onLogout, onRetry }) {
  return (
    <main className="full-page-loader">
      <section
        className="auth-bootstrap-state"
        aria-labelledby="session-error-title"
        role="alert"
      >
        <p className="app-eyebrow">ApplyFlow</p>
        <h1 id="session-error-title">Session unavailable</h1>
        <p>{message}</p>
        <div className="auth-bootstrap-actions">
          <button className="button-primary" type="button" onClick={onRetry}>
            Try again
          </button>
          <button className="auth-secondary-button" type="button" onClick={onLogout}>
            Log out
          </button>
        </div>
      </section>
    </main>
  );
}

export function ProtectedRoute() {
  const {
    bootstrapError,
    isAuthenticated,
    isLoading,
    logout,
    retryBootstrap,
  } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  if (bootstrapError) {
    return (
      <AuthBootstrapError
        message={bootstrapError}
        onLogout={logout}
        onRetry={retryBootstrap}
      />
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export function PublicOnlyRoute() {
  const {
    bootstrapError,
    isAuthenticated,
    isLoading,
    logout,
    retryBootstrap,
  } = useAuth();

  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  if (bootstrapError) {
    return (
      <AuthBootstrapError
        message={bootstrapError}
        onLogout={logout}
        onRetry={retryBootstrap}
      />
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
