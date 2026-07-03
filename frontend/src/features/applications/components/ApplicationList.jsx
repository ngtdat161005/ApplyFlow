import { ApplicationCard } from './ApplicationCard.jsx';

export function ApplicationList({ applications, emptyMessage, error, isLoading, onRetry }) {
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
      {applications.map((application) => (
        <ApplicationCard application={application} key={application._id} />
      ))}
    </div>
  );
}
