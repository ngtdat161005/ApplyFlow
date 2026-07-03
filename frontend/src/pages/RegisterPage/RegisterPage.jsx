import { Link } from 'react-router-dom';

export default function RegisterPage() {
  return (
    <main className="auth-page">
      <section className="auth-panel" aria-labelledby="register-title">
        <p className="app-eyebrow">ApplyFlow</p>
        <h1 id="register-title">Register</h1>
        <p className="page-muted">Registration behavior will be implemented in Task 05.</p>

        <form className="stacked-form">
          <label>
            Display name
            <input type="text" name="displayName" placeholder="Your name" />
          </label>
          <label>
            Email
            <input type="email" name="email" placeholder="you@example.com" />
          </label>
          <label>
            Password
            <input type="password" name="password" placeholder="Password" />
          </label>
          <button type="button">Register</button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </section>
    </main>
  );
}
