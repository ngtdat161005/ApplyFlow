import { getEventModeLabel, getEventTypeLabel } from '../event.constants.js';
import { formatEventDate, getEventEffectiveDate } from '../event.utils.js';
import { EventForm } from './EventForm.jsx';

export function EventItem({
  event,
  isConfirmingDelete,
  isDeleting,
  isEditing,
  onCancelDelete,
  onCancelEdit,
  onConfirmDelete,
  onEdit,
  onRequestDelete,
  onUpdate,
}) {
  const effectiveDateValue = getEventEffectiveDate(event);
  const effectiveDate = formatEventDate(effectiveDateValue);
  const effectiveDateLabel = event.occurredAt
    ? 'Occurred'
    : event.scheduledAt
      ? 'Scheduled'
      : 'Added';
  const secondaryScheduledDate = event.occurredAt
    ? formatEventDate(event.scheduledAt)
    : null;
  const modeLabel = getEventModeLabel(event.mode);

  if (isEditing) {
    return (
      <article className="event-item event-item-editing">
        <div className="event-item-header">
          <div>
            <p className="event-type-label">{getEventTypeLabel(event.type)}</p>
            <h4>Edit event</h4>
          </div>
        </div>
        <EventForm event={event} mode="edit" onCancel={onCancelEdit} onSubmit={onUpdate} />
      </article>
    );
  }

  return (
    <article className="event-item">
      <div className="event-item-header">
        <div>
          <p className="event-type-label">{getEventTypeLabel(event.type)}</p>
          <h4>{event.title}</h4>
        </div>
        {effectiveDate ? (
          <div className="event-item-date">
            <span>{effectiveDateLabel}</span>
            <time dateTime={effectiveDateValue}>{effectiveDate}</time>
          </div>
        ) : null}
      </div>

      <dl className="event-meta">
        {secondaryScheduledDate ? (
          <div>
            <dt>Scheduled</dt>
            <dd>
              <time dateTime={event.scheduledAt}>{secondaryScheduledDate}</time>
            </dd>
          </div>
        ) : null}
        {modeLabel ? (
          <div>
            <dt>Mode</dt>
            <dd>{modeLabel}</dd>
          </div>
        ) : null}
        {event.location ? (
          <div>
            <dt>Location</dt>
            <dd>{event.location}</dd>
          </div>
        ) : null}
        {event.meetingLink ? (
          <div>
            <dt>Meeting</dt>
            <dd>
              <a href={event.meetingLink} rel="noreferrer" target="_blank">
                Open link
              </a>
            </dd>
          </div>
        ) : null}
        {event.contactName ? (
          <div>
            <dt>Contact</dt>
            <dd>{event.contactName}</dd>
          </div>
        ) : null}
        {event.contactPhone ? (
          <div>
            <dt>Phone</dt>
            <dd>{event.contactPhone}</dd>
          </div>
        ) : null}
        {event.contactEmail ? (
          <div>
            <dt>Email</dt>
            <dd>
              <a href={`mailto:${event.contactEmail}`}>{event.contactEmail}</a>
            </dd>
          </div>
        ) : null}
      </dl>

      {event.note ? <p className="event-note">{event.note}</p> : null}

      {isConfirmingDelete ? (
        <div aria-busy={isDeleting} className="event-delete-confirm" role="alert">
          <p>Delete this event?</p>
          <div className="application-form-actions">
            <button disabled={isDeleting} type="button" onClick={onConfirmDelete}>
              {isDeleting ? 'Deleting...' : 'Delete event'}
            </button>
            <button disabled={isDeleting} type="button" onClick={onCancelDelete}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="event-actions">
          <button disabled={isDeleting} type="button" onClick={onEdit}>
            Edit
          </button>
          <button disabled={isDeleting} type="button" onClick={onRequestDelete}>
            Delete
          </button>
        </div>
      )}
    </article>
  );
}
