import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../features/auth/auth.store.js';
import { getErrorDetails, getErrorMessage } from '../../features/auth/auth.utils.js';

export default function RegisterPage() {
  const { authError, register } = useAuth();
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState({
    displayName: '',
    email: '',
    password: '',
  });
  const [formError, setFormError] = useState('');
  const [formErrorDetails, setFormErrorDetails] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
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
      setFormError(getErrorMessage(error, 'Registration failed.'));
      setFormErrorDetails(getErrorDetails(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-panel" aria-labelledby="register-title">
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

        <form className="stacked-form" onSubmit={handleSubmit}>
          <label>
            Display name
            <input
              autoComplete="name"
              disabled={isSubmitting}
              name="displayName"
              onChange={handleChange}
              placeholder="Your name"
              required
              type="text"
              value={formValues.displayName}
            />
          </label>
          <label>
            Email
            <input
              autoComplete="email"
              disabled={isSubmitting}
              name="email"
              onChange={handleChange}
              placeholder="you@example.com"
              required
              type="email"
              value={formValues.email}
            />
          </label>
          <label>
            Password
            <input
              autoComplete="new-password"
              disabled={isSubmitting}
              minLength={8}
              name="password"
              onChange={handleChange}
              placeholder="Password"
              required
              type="password"
              value={formValues.password}
            />
          </label>
          <button disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </section>
    </main>
  );
}
