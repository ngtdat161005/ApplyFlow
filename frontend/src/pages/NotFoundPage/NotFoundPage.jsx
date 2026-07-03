import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <main className="auth-page">
      <section className="auth-panel">
        <p className="app-eyebrow">ApplyFlow</p>
        <h1>Page not found</h1>
        <p className="page-muted">The requested route does not exist.</p>
        <Link className="text-link" to="/dashboard">
          Go to dashboard
        </Link>
      </section>
    </main>
  );
}
