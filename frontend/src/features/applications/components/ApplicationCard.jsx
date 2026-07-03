import { Link } from 'react-router-dom';

import { StatusBadge } from './StatusBadge.jsx';

function formatDate(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function ApplicationCard({ application }) {
  const followUpAt = formatDate(application.followUpAt);
  const updatedAt = formatDate(application.updatedAt);

  return (
    <article className="application-card">
      <div className="application-card-header">
        <div className="application-card-title">
          <h3>{application.company}</h3>
          <p>{application.role}</p>
        </div>
        <StatusBadge status={application.currentStatus} />
      </div>

      <dl className="application-meta">
        {application.source ? (
          <div>
            <dt>Source</dt>
            <dd>{application.source}</dd>
          </div>
        ) : null}
        {followUpAt ? (
          <div>
            <dt>Follow up</dt>
            <dd>{followUpAt}</dd>
          </div>
        ) : null}
        {updatedAt ? (
          <div>
            <dt>Updated</dt>
            <dd>{updatedAt}</dd>
          </div>
        ) : null}
      </dl>

      {application.notes ? <p className="application-notes">{application.notes}</p> : null}

      <div className="application-card-actions">
        {application.jdUrl ? (
          <a href={application.jdUrl} rel="noreferrer" target="_blank">
            Job post
          </a>
        ) : null}
        <Link to={`/applications/${application._id}`}>Open detail</Link>
      </div>
    </article>
  );
}
