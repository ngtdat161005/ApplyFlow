import { EventItem } from './EventItem.jsx';
import { EventTimelineSkeleton } from './EventTimelineSkeleton.jsx';

export function EventTimeline({
  deleteError,
  deletingEventId,
  editingEventId,
  events,
  isDeleteConfirmOpenFor,
  isLoading,
  loadError,
  onCancelDelete,
  onCancelEdit,
  onConfirmDelete,
  onEdit,
  onRequestDelete,
  onRetry,
  onUpdate,
}) {
  if (isLoading) {
    return <EventTimelineSkeleton />;
  }

  if (loadError) {
    return (
      <section className="applications-state applications-state-error" role="alert">
        <h4>Could not load events</h4>
        <p>{loadError}</p>
        <button type="button" onClick={onRetry}>
          Retry
        </button>
      </section>
    );
  }

  if (events.length === 0) {
    return (
      <section className="applications-state applications-state-empty" aria-live="polite">
        <h4>No timeline events</h4>
        <p>Add the first event to start this application's recruitment history.</p>
      </section>
    );
  }

  return (
    <div className="event-timeline">
      {deleteError ? (
        <div className="auth-alert" role="alert">
          <p>{deleteError}</p>
        </div>
      ) : null}

      {events.map((event) => (
        <EventItem
          event={event}
          isConfirmingDelete={isDeleteConfirmOpenFor === event._id}
          isDeleting={deletingEventId === event._id}
          isEditing={editingEventId === event._id}
          key={event._id}
          onCancelDelete={onCancelDelete}
          onCancelEdit={onCancelEdit}
          onConfirmDelete={() => onConfirmDelete(event)}
          onEdit={() => onEdit(event)}
          onRequestDelete={() => onRequestDelete(event)}
          onUpdate={(payload) => onUpdate(event, payload)}
        />
      ))}
    </div>
  );
}
