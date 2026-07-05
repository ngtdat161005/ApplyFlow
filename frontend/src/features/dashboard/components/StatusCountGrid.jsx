import { getApplicationStatusLabel } from '../../../constants/status.js';
import {
  DASHBOARD_STATUS_ORDER,
  getStatusCount,
} from '../dashboard.constants.js';

export function StatusCountGrid({ countsByStatus = {} }) {
  return (
    <section className="application-panel dashboard-panel" aria-labelledby="status-counts-title">
      <div className="dashboard-panel-header">
        <div>
          <p className="app-eyebrow">Status counts</p>
          <h3 id="status-counts-title">Pipeline by status</h3>
        </div>
      </div>

      <div className="dashboard-status-grid">
        {DASHBOARD_STATUS_ORDER.map((status) => (
          <div className="dashboard-status-row" key={status}>
            <span className={`dashboard-status-dot dashboard-status-dot-${status}`} aria-hidden="true" />
            <span>{getApplicationStatusLabel(status)}</span>
            <strong>{getStatusCount(countsByStatus, status)}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}
