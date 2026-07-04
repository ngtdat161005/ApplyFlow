import { EventItem } from './EventItem.jsx';

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
    return (
      <section className="applications-state" aria-live="polite">
        <p>Loading timeline...</p>
      </section>
    );
  }

  if (loadError) {
    return (
      <section className="applications-state applications-state-error" role="alert">
        <p>{loadError}</p>
        <button type="button" onClick={onRetry}>
          Retry
        </button>
      </section>
    );
  }

  if (events.length === 0) {
    return (
      <section className="applications-state" aria-live="polite">
        <p>No events yet. Add the first timeline event for this application.</p>
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
