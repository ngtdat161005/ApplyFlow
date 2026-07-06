import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../../features/auth/auth.store.js';
import {
  getErrorDetails,
  getErrorFieldErrors,
  getErrorMessage,
} from '../../features/auth/auth.utils.js';

const LOGIN_FIELD_NAMES = ['email', 'password'];

function getRedirectTarget(location) {
  const from = location.state?.from;

  if (!from?.pathname) {
    return '/dashboard';
  }

  return `${from.pathname}${from.search || ''}`;
}

export default function LoginPage() {
  const { authError, login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState({
    email: location.state?.email || '',
    password: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [formErrorDetails, setFormErrorDetails] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const successMessage = location.state?.message;

  function handleChange(event) {
    const { name, value } = event.target;
    setFormValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }));
    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      [name]: '',
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFieldErrors({});
    setFormError('');
    setFormErrorDetails([]);
    setIsSubmitting(true);

    try {
      await login(formValues);
      navigate(getRedirectTarget(location), { replace: true });
    } catch (error) {
      const nextFieldErrors = getErrorFieldErrors(error);

      setFieldErrors(nextFieldErrors);
      setFormError(getErrorMessage(error, 'Login failed.'));
      setFormErrorDetails(
        getErrorDetails(error, { excludeFields: LOGIN_FIELD_NAMES }),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-panel" aria-labelledby="login-title">
        <p className="app-eyebrow">ApplyFlow</p>
        <h1 id="login-title">Login</h1>
        <p className="page-muted">Sign in to manage your application tracker.</p>

        {successMessage ? (
          <div className="auth-success" role="status">
            {successMessage}
          </div>
        ) : null}

        {formError || authError ? (
          <div className="auth-alert" role="alert">
            <p>{formError || authError}</p>
            {formErrorDetails.length > 0 ? (
              <ul>
                {formErrorDetails.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}

        <form className="stacked-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input
              autoComplete="email"
              aria-invalid={Boolean(fieldErrors.email)}
              disabled={isSubmitting}
              name="email"
              onChange={handleChange}
              placeholder="you@example.com"
              required
              type="email"
              value={formValues.email}
            />
            {fieldErrors.email ? <span className="field-error">{fieldErrors.email}</span> : null}
          </label>
          <label>
            Password
            <input
              autoComplete="current-password"
              aria-invalid={Boolean(fieldErrors.password)}
              disabled={isSubmitting}
              name="password"
              onChange={handleChange}
              placeholder="Password"
              required
              type="password"
              value={formValues.password}
            />
            {fieldErrors.password ? <span className="field-error">{fieldErrors.password}</span> : null}
          </label>
          <button disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="auth-switch">
          Need an account? <Link to="/register">Register</Link>
        </p>
      </section>
    </main>
  );
}
