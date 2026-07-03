export default function ApplicationsPage() {
  return (
    <section className="page-section" aria-labelledby="applications-title">
      <div className="page-header">
        <p className="app-eyebrow">Pipeline</p>
        <h2 id="applications-title">Applications</h2>
        <p className="page-muted">
          Placeholder for the searchable application list and create action.
        </p>
      </div>

      <div className="placeholder-card">
        <div className="toolbar-placeholder">
          <input type="search" placeholder="Search company or role" />
          <select defaultValue="">
            <option value="">All statuses</option>
          </select>
          <button type="button">New application</button>
        </div>
        <p>The application list will be implemented in Task 08.</p>
      </div>
    </section>
  );
}
