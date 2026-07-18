import { Link } from 'react-router-dom';

import { getEventTypeLabel } from '../../events/event.constants.js';
import { formatDateTime } from '../../../utils/date.utils.js';

export function UpcomingEventsPanel({ events = [] }) {
  return (
    <section className="application-panel dashboard-panel" aria-labelledby="upcoming-events-title">
      <div className="dashboard-panel-header">
        <div>
          <p className="app-eyebrow">Next steps</p>
          <h3 id="upcoming-events-title">Upcoming events</h3>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="dashboard-empty-state">
          <p>No upcoming events.</p>
        </div>
      ) : (
        <div className="dashboard-list">
          {events.map((event) => {
            const scheduledAt = formatDateTime(event.scheduledAt);

            return (
              <article
                className="dashboard-list-item"
                key={event.eventId || `${event.applicationId}-${event.title}`}
              >
                <div className="dashboard-list-item-main">
                  <div>
                    <p className="event-type-label">{getEventTypeLabel(event.type)}</p>
                    <h4>{event.title || 'Scheduled event'}</h4>
                  </div>
                  {scheduledAt ? <time dateTime={event.scheduledAt}>{scheduledAt}</time> : null}
                </div>

                <p className="dashboard-list-context">
                  {[event.company, event.role].filter(Boolean).join(' - ') || 'Application'}
                </p>

                {event.applicationId ? (
                  <Link className="text-link" to={`/applications/${event.applicationId}`}>
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
