import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { requestPasswordReset } from '../../api/auth.api.js';
import { getErrorCode } from '../../features/auth/auth.utils.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SUCCESS_MESSAGE = 'If an account with that email exists, a reset link has been sent.';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessful, setIsSuccessful] = useState(false);
  const submitInFlightRef = useRef(false);
  const emailRef = useRef(null);
  const successRef = useRef(null);

  useEffect(() => {
    if (isSuccessful) {
      successRef.current?.focus();
    }
  }, [isSuccessful]);

  function handleChange(event) {
    setEmail(event.target.value);
    setEmailError('');
    setFormError('');
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (submitInFlightRef.current) {
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setEmailError('Email is required.');
      emailRef.current?.focus();
      return;
    }

    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      setEmailError('Enter a valid email address.');
      emailRef.current?.focus();
      return;
    }

    submitInFlightRef.current = true;
    setFormError('');
    setIsSubmitting(true);

    try {
      await requestPasswordReset({ email: normalizedEmail });
      setIsSuccessful(true);
    } catch (error) {
      if (getErrorCode(error) === 'RESET_RATE_LIMITED' || error.status === 429) {
        setFormError('Too many reset requests. Please try again later.');
      } else {
        setFormError('We could not request a reset link. Please try again.');
      }
    } finally {
      submitInFlightRef.current = false;
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-panel" aria-labelledby="forgot-password-title">
        <p className="app-eyebrow">ApplyFlow</p>
        <h1 id="forgot-password-title">Forgot password</h1>
        <p className="page-muted">Request a secure link to reset your password.</p>

        {isSuccessful ? (
          <>
            <div className="auth-success" ref={successRef} role="status" tabIndex={-1}>
              {SUCCESS_MESSAGE}
            </div>
            <Link className="text-link" to="/login">
              Back to login
            </Link>
          </>
        ) : (
          <>
            {formError ? (
              <div className="auth-alert" role="alert">
                <p>{formError}</p>
              </div>
            ) : null}

            <form className="stacked-form" aria-busy={isSubmitting} onSubmit={handleSubmit}>
              <label>
                Email
                <input
                  autoComplete="email"
                  aria-describedby={emailError ? 'forgot-email-error' : undefined}
                  aria-invalid={Boolean(emailError)}
                  disabled={isSubmitting}
                  name="email"
                  onChange={handleChange}
                  placeholder="you@example.com"
                  ref={emailRef}
                  type="email"
                  value={email}
                />
                {emailError ? (
                  <span className="field-error" id="forgot-email-error">
                    {emailError}
                  </span>
                ) : null}
              </label>
              <button disabled={isSubmitting} type="submit">
                <span aria-live="polite">
                  {isSubmitting ? 'Sending...' : 'Send reset link'}
                </span>
              </button>
            </form>

            <p className="auth-switch">
              Remembered your password? <Link to="/login">Login</Link>
            </p>
          </>
        )}
      </section>
    </main>
  );
}
