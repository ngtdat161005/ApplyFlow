import { Link } from 'react-router-dom';

import { StatusBadge } from '../../applications/components/StatusBadge.jsx';
import { formatDate } from '../../../utils/date.utils.js';

function getApplicationId(application) {
  return application.applicationId || application._id || application.id || '';
}

export function RecentApplicationsPanel({ applications = [] }) {
  return (
    <section className="application-panel dashboard-panel" aria-labelledby="recent-applications-title">
      <div className="dashboard-panel-header">
        <div>
          <p className="app-eyebrow">Recent activity</p>
          <h3 id="recent-applications-title">Recent applications</h3>
        </div>
        <Link className="text-link" to="/applications">
          View all
        </Link>
      </div>

      {applications.length === 0 ? (
        <div className="dashboard-empty-state">
          <p>No recent applications are available.</p>
        </div>
      ) : (
        <div className="dashboard-list">
          {applications.map((application) => {
            const applicationId = getApplicationId(application);
            const updatedAt = formatDate(application.updatedAt);
            const followUpAt = formatDate(application.followUpAt);

            return (
              <article
                className={
                  applicationId
                    ? 'dashboard-list-item dashboard-list-item-interactive'
                    : 'dashboard-list-item'
                }
                key={applicationId || `${application.company}-${application.role}`}
              >
                <div className="dashboard-list-item-main">
                  <div>
                    <h4>{application.company || 'Unknown company'}</h4>
                    <p>{application.role || 'Role not specified'}</p>
                  </div>
                  <StatusBadge status={application.currentStatus} />
                </div>

                <dl className="dashboard-meta">
                  <div>
                    <dt>Updated</dt>
                    <dd>{updatedAt || '-'}</dd>
                  </div>
                  {followUpAt ? (
                    <div>
                      <dt>Follow up</dt>
                      <dd>{followUpAt}</dd>
                    </div>
                  ) : null}
                </dl>

                {applicationId ? (
                  <Link className="text-link" to={`/applications/${applicationId}`}>
                    Open detail
                  </Link>
                ) : null}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
