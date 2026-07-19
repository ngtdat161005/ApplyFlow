import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import { resetPassword } from '../../api/auth.api.js';
import {
  getErrorCode,
  getErrorFieldErrors,
} from '../../features/auth/auth.utils.js';

const INVALID_LINK_MESSAGE = 'This password reset link is invalid or expired.';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';
  const [formValues, setFormValues] = useState({
    newPassword: '',
    confirmation: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [resultState, setResultState] = useState(token ? 'idle' : 'invalid');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitInFlightRef = useRef(false);
  const invalidStateRef = useRef(null);
  const newPasswordRef = useRef(null);
  const confirmationRef = useRef(null);

  useEffect(() => {
    if (resultState === 'invalid') {
      invalidStateRef.current?.focus();
    }
  }, [resultState]);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormValues((currentValues) => ({ ...currentValues, [name]: value }));
    setFieldErrors((currentErrors) => ({ ...currentErrors, [name]: '' }));
    setFormError('');
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (submitInFlightRef.current || !token) {
      return;
    }

    const nextFieldErrors = {};

    if (!formValues.newPassword) {
      nextFieldErrors.newPassword = 'Password is required.';
    } else if (formValues.newPassword.length < 8) {
      nextFieldErrors.newPassword = 'Password must be at least 8 characters.';
    }

    if (!formValues.confirmation) {
      nextFieldErrors.confirmation = 'Confirm your new password.';
    } else if (formValues.confirmation !== formValues.newPassword) {
      nextFieldErrors.confirmation = 'Passwords do not match.';
    }

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      if (nextFieldErrors.newPassword) {
        newPasswordRef.current?.focus();
      } else {
        confirmationRef.current?.focus();
      }
      return;
    }

    submitInFlightRef.current = true;
    setFieldErrors({});
    setFormError('');
    setIsSubmitting(true);

    try {
      await resetPassword({ token, newPassword: formValues.newPassword });
      setFormValues({ newPassword: '', confirmation: '' });
      navigate('/login', {
        replace: true,
        state: { message: 'Password updated. You can log in now.' },
      });
    } catch (error) {
      const errorCode = getErrorCode(error);

      if (errorCode === 'INVALID_TOKEN') {
        setFormValues({ newPassword: '', confirmation: '' });
        setResultState('invalid');
        navigate('/reset-password', { replace: true });
      } else if (errorCode === 'RESET_UNAVAILABLE' || error.status === 503) {
        setFormError('Password reset is temporarily unavailable. Please try again later.');
      } else {
        const responseFieldErrors = getErrorFieldErrors(error);
        setFieldErrors({
          newPassword: responseFieldErrors.newPassword || '',
        });
        setFormError('We could not reset your password. Please try again.');
      }
    } finally {
      submitInFlightRef.current = false;
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-panel" aria-labelledby="reset-password-title">
        <p className="app-eyebrow">ApplyFlow</p>
        <h1 id="reset-password-title">Reset password</h1>

        {resultState === 'invalid' ? (
          <>
            <div className="auth-alert" ref={invalidStateRef} role="alert" tabIndex={-1}>
              <p>{INVALID_LINK_MESSAGE}</p>
            </div>
            <Link className="text-link" to="/forgot-password">
              Request a new reset link
            </Link>
          </>
        ) : null}

        {resultState === 'idle' ? (
          <>
            <p className="page-muted">Choose a new password for your account.</p>

            {formError ? (
              <div className="auth-alert" role="alert">
                <p>{formError}</p>
              </div>
            ) : null}

            <form className="stacked-form" aria-busy={isSubmitting} onSubmit={handleSubmit}>
              <label>
                New password
                <input
                  autoComplete="new-password"
                  aria-describedby={fieldErrors.newPassword ? 'new-password-error' : undefined}
                  aria-invalid={Boolean(fieldErrors.newPassword)}
                  disabled={isSubmitting}
                  name="newPassword"
                  onChange={handleChange}
                  ref={newPasswordRef}
                  type="password"
                  value={formValues.newPassword}
                />
                {fieldErrors.newPassword ? (
                  <span className="field-error" id="new-password-error">
                    {fieldErrors.newPassword}
                  </span>
                ) : null}
              </label>
              <label>
                Confirm new password
                <input
                  autoComplete="new-password"
                  aria-describedby={fieldErrors.confirmation ? 'confirmation-error' : undefined}
                  aria-invalid={Boolean(fieldErrors.confirmation)}
                  disabled={isSubmitting}
                  name="confirmation"
                  onChange={handleChange}
                  ref={confirmationRef}
                  type="password"
                  value={formValues.confirmation}
                />
                {fieldErrors.confirmation ? (
                  <span className="field-error" id="confirmation-error">
                    {fieldErrors.confirmation}
                  </span>
                ) : null}
              </label>
              <button disabled={isSubmitting} type="submit">
                <span aria-live="polite">
                  {isSubmitting ? 'Updating...' : 'Update password'}
                </span>
              </button>
            </form>

            <Link className="text-link" to="/login">
              Back to login
            </Link>
          </>
        ) : null}
      </section>
    </main>
  );
}
