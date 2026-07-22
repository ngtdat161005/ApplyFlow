import { Link } from 'react-router-dom';

import { formatDate } from '../../../utils/date.utils.js';
import { getAttentionFlagLabel } from '../dashboard.constants.js';

export function AttentionFlagsPanel({ flags = [] }) {
  return (
    <section
      className="application-panel dashboard-panel dashboard-attention-panel"
      aria-labelledby="attention-flags-title"
    >
      <div className="dashboard-panel-header">
        <div>
          <p className="app-eyebrow">Attention</p>
          <h3 id="attention-flags-title">Needs attention</h3>
        </div>
      </div>

      {flags.length === 0 ? (
        <div className="dashboard-empty-state dashboard-empty-state-positive">
          <p>No applications need attention right now.</p>
        </div>
      ) : (
        <div className="dashboard-list">
          {flags.map((flag) => {
            const referenceDate = formatDate(flag.referenceDate);

            return (
              <article
                className={
                  flag.applicationId
                    ? 'dashboard-list-item dashboard-list-item-interactive dashboard-attention-item'
                    : 'dashboard-list-item dashboard-attention-item'
                }
                key={`${flag.flagType}-${flag.applicationId}-${flag.referenceDate}`}
              >
                <div className="dashboard-list-item-main">
                  <div>
                    <p className="event-type-label">{getAttentionFlagLabel(flag.flagType)}</p>
                    <h4>{flag.company || 'Unknown company'}</h4>
                    <p>{flag.role || 'Role not specified'}</p>
                  </div>
                  {referenceDate ? <time dateTime={flag.referenceDate}>{referenceDate}</time> : null}
                </div>

                {flag.message ? <p className="dashboard-attention-message">{flag.message}</p> : null}

                {flag.applicationId ? (
                  <Link className="text-link" to={`/applications/${flag.applicationId}`}>
                    Open application
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
