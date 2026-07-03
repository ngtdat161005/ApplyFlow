export default function DashboardPage() {
  return (
    <section className="page-section" aria-labelledby="dashboard-title">
      <div className="page-header">
        <p className="app-eyebrow">Overview</p>
        <h2 id="dashboard-title">Dashboard</h2>
        <p className="page-muted">
          Placeholder for status summaries, upcoming events, and attention-needed items.
        </p>
      </div>

      <div className="placeholder-grid">
        <article className="placeholder-card">
          <h3>Status summary</h3>
          <p>Summary cards will be added in Task 14.</p>
        </article>
        <article className="placeholder-card">
          <h3>Upcoming events</h3>
          <p>Scheduled events will be listed here later.</p>
        </article>
        <article className="placeholder-card">
          <h3>Attention needed</h3>
          <p>Computed reminders will appear after dashboard logic exists.</p>
        </article>
      </div>
    </section>
  );
}
