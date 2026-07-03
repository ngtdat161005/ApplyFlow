import { Link, useParams } from 'react-router-dom';

export default function ApplicationDetailPage() {
  const { applicationId } = useParams();

  return (
    <section className="page-section" aria-labelledby="application-detail-title">
      <div className="page-header">
        <p className="app-eyebrow">Application detail</p>
        <h2 id="application-detail-title">Application {applicationId}</h2>
        <p className="page-muted">
          Placeholder for application metadata and recruitment timeline.
        </p>
      </div>

      <div className="placeholder-grid two-column">
        <article className="placeholder-card">
          <h3>Application overview</h3>
          <p>Company, role, status, source, follow-up date, and notes will appear here.</p>
        </article>
        <article className="placeholder-card">
          <h3>Recruitment timeline</h3>
          <p>Timeline events and event actions will be implemented in Task 11.</p>
        </article>
      </div>

      <Link className="text-link" to="/applications">
        Back to applications
      </Link>
    </section>
  );
}
