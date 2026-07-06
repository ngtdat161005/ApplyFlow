import { ApplicationCard } from './ApplicationCard.jsx';
import { ApplicationForm } from './ApplicationForm.jsx';

export function ApplicationList({
  actionError,
  applications,
  deletingApplicationId,
  editingApplicationId,
  emptyMessage,
  error,
  isDeleteConfirmOpenFor,
  isLoading,
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
      <div className="applications-state" role="status">
        Loading applications...
      </div>
    );
  }

  if (error) {
    return (
      <div className="applications-state applications-state-error" role="alert">
        <p>{error}</p>
        <button type="button" onClick={onRetry}>
          Try again
        </button>
      </div>
    );
  }

  if (applications.length === 0) {
    return <div className="applications-state">{emptyMessage}</div>;
  }

  return (
    <div className="application-list" aria-live="polite">
      {actionError ? (
        <div className="auth-alert" role="alert">
          <p>{actionError}</p>
        </div>
      ) : null}

      {applications.map((application) => (
        <div className="application-list-item" key={application._id}>
          <ApplicationCard
            application={application}
            isConfirmingDelete={isDeleteConfirmOpenFor === application._id}
            isDeleting={deletingApplicationId === application._id}
            onCancelDelete={onCancelDelete}
            onConfirmDelete={() => onConfirmDelete(application)}
            onEdit={() => onEdit(application)}
            onRequestDelete={() => onRequestDelete(application)}
          />

          {editingApplicationId === application._id ? (
            <section className="application-panel" aria-label="Edit application">
              <div className="application-panel-header">
                <h3>Edit application</h3>
                <p>Update company, role, status, source, notes, and follow-up date.</p>
              </div>
              <ApplicationForm
                application={application}
                mode="edit"
                onCancel={onCancelEdit}
                onSubmit={(payload) => onUpdate(application, payload)}
              />
            </section>
          ) : null}
        </div>
      ))}
    </div>
  );
}
