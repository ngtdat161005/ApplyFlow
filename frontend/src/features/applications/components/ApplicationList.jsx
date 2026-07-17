import { ApplicationCard } from './ApplicationCard.jsx';
import { ApplicationForm } from './ApplicationForm.jsx';

export function ApplicationList({
  actionError,
  applications,
  deletingApplicationId,
  editingApplicationId,
  error,
  hasActiveFilters,
  isDeleteConfirmOpenFor,
  isCreateFormOpen,
  isLoading,
  onCancelDelete,
  onCancelEdit,
  onConfirmDelete,
  onCreate,
  onEdit,
  onRequestDelete,
  onResetFilters,
  onRetry,
  onUpdate,
}) {
  if (isLoading) {
    return (
      <div
        className="applications-state applications-state-loading"
        aria-live="polite"
        role="status"
      >
        <h3>Loading applications</h3>
        <p>Fetching your latest application list...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="applications-state applications-state-error" role="alert">
        <h3>Could not load applications</h3>
        <p>{error}</p>
        <button type="button" onClick={onRetry}>
          Try again
        </button>
      </div>
    );
  }

  if (applications.length === 0) {
    if (hasActiveFilters) {
      return (
        <div className="applications-state applications-state-filtered-empty">
          <h3>No matching applications</h3>
          <p>No applications match your current search or status filter.</p>
          <button type="button" onClick={onResetFilters}>
            Reset filters
          </button>
        </div>
      );
    }

    return (
      <div className="applications-state applications-state-empty">
        <h3>No applications yet</h3>
        <p>Create your first application to start tracking your search.</p>
        {!isCreateFormOpen ? (
          <button type="button" onClick={onCreate}>
            Create application
          </button>
        ) : null}
      </div>
    );
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
