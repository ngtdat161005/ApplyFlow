import { Link } from 'react-router-dom';

export default function LoginPage() {
  return (
    <main className="auth-page">
      <section className="auth-panel" aria-labelledby="login-title">
        <p className="app-eyebrow">ApplyFlow</p>
        <h1 id="login-title">Login</h1>
        <p className="page-muted">Authentication behavior will be implemented in Task 05.</p>

        <form className="stacked-form">
          <label>
            Email
            <input type="email" name="email" placeholder="you@example.com" />
          </label>
          <label>
            Password
            <input type="password" name="password" placeholder="Password" />
          </label>
          <button type="button">Login</button>
        </form>

        <p className="auth-switch">
          Need an account? <Link to="/register">Register</Link>
        </p>
      </section>
    </main>
  );
}
