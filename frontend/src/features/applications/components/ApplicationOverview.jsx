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
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export function ApplicationOverview({ application }) {
  const followUpAt = formatDate(application.followUpAt);
  const createdAt = formatDate(application.createdAt);
  const updatedAt = formatDate(application.updatedAt);

  return (
    <section className="application-panel application-overview" aria-label="Application overview">
      <div className="application-overview-header">
        <div>
          <p className="app-eyebrow">Application overview</p>
          <h3>{application.company}</h3>
          <p>{application.role}</p>
        </div>
        <StatusBadge status={application.currentStatus} />
      </div>

      <dl className="application-detail-meta">
        {application.source ? (
          <div>
            <dt>Source</dt>
            <dd>{application.source}</dd>
          </div>
        ) : null}
        {application.jdUrl ? (
          <div>
            <dt>Job post</dt>
            <dd>
              <a href={application.jdUrl} rel="noreferrer" target="_blank">
                Open posting
              </a>
            </dd>
          </div>
        ) : null}
        {followUpAt ? (
          <div>
            <dt>Follow up</dt>
            <dd>{followUpAt}</dd>
          </div>
        ) : null}
        {createdAt ? (
          <div>
            <dt>Created</dt>
            <dd>{createdAt}</dd>
          </div>
        ) : null}
        {updatedAt ? (
          <div>
            <dt>Updated</dt>
            <dd>{updatedAt}</dd>
          </div>
        ) : null}
      </dl>

      {application.notes ? (
        <div className="application-detail-notes">
          <h4>Notes</h4>
          <p>{application.notes}</p>
        </div>
      ) : null}
    </section>
  );
}
