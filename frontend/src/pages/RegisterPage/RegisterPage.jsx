import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../features/auth/auth.store.js';
import { AuthPresentation } from '../../features/auth/components/AuthPresentation.jsx';
import {
  getErrorDetails,
  getErrorFieldErrors,
  getErrorMessage,
} from '../../features/auth/auth.utils.js';

const REGISTER_FIELD_NAMES = ['displayName', 'email', 'password'];

export default function RegisterPage() {
  const { authError, clearAuthError, register } = useAuth();
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState({
    displayName: '',
    email: '',
    password: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [formErrorDetails, setFormErrorDetails] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitInFlightRef = useRef(false);

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
    clearAuthError();
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (submitInFlightRef.current) {
      return;
    }

    submitInFlightRef.current = true;
    setFieldErrors({});
    setFormError('');
    setFormErrorDetails([]);
    setIsSubmitting(true);

    try {
      const result = await register(formValues);

      if (result.didAuthenticate) {
        navigate('/dashboard', { replace: true });
        return;
      }

      navigate('/login', {
        replace: true,
        state: {
          email: formValues.email,
          message: 'Registration successful. You can log in now.',
        },
      });
    } catch (error) {
      const nextFieldErrors = getErrorFieldErrors(error);

      setFieldErrors(nextFieldErrors);
      setFormError(getErrorMessage(error, 'Registration failed.'));
      setFormErrorDetails(
        getErrorDetails(error, { excludeFields: REGISTER_FIELD_NAMES }),
      );
    } finally {
      submitInFlightRef.current = false;
      setIsSubmitting(false);
    }
  }

  return (
    <AuthPresentation titleId="register-title" variant="register">
        <p className="app-eyebrow">ApplyFlow</p>
        <h1 id="register-title">Register</h1>
        <p className="page-muted">Create an account for your application tracker.</p>

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

        <form className="stacked-form" aria-busy={isSubmitting} onSubmit={handleSubmit}>
          <label>
            Display name
            <input
              autoComplete="name"
              aria-describedby={
                fieldErrors.displayName ? 'register-display-name-error' : undefined
              }
              aria-invalid={Boolean(fieldErrors.displayName)}
              disabled={isSubmitting}
              name="displayName"
              onChange={handleChange}
              placeholder="Your name"
              required
              type="text"
              value={formValues.displayName}
            />
            {fieldErrors.displayName ? (
              <span className="field-error" id="register-display-name-error">
                {fieldErrors.displayName}
              </span>
            ) : null}
          </label>
          <label>
            Email
            <input
              autoComplete="email"
              aria-describedby={fieldErrors.email ? 'register-email-error' : undefined}
              aria-invalid={Boolean(fieldErrors.email)}
              disabled={isSubmitting}
              name="email"
              onChange={handleChange}
              placeholder="you@example.com"
              required
              type="email"
              value={formValues.email}
            />
            {fieldErrors.email ? (
              <span className="field-error" id="register-email-error">
                {fieldErrors.email}
              </span>
            ) : null}
          </label>
          <label>
            Password
            <input
              autoComplete="new-password"
              aria-describedby={fieldErrors.password ? 'register-password-error' : undefined}
              aria-invalid={Boolean(fieldErrors.password)}
              disabled={isSubmitting}
              minLength={8}
              name="password"
              onChange={handleChange}
              placeholder="Password"
              required
              type="password"
              value={formValues.password}
            />
            {fieldErrors.password ? (
              <span className="field-error" id="register-password-error">
                {fieldErrors.password}
              </span>
            ) : null}
          </label>
          <button disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Login</Link>
        </p>
    </AuthPresentation>
  );
}
