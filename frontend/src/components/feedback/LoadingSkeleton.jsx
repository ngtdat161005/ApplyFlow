function joinClassNames(...classNames) {
  return classNames.filter(Boolean).join(' ');
}

export function SkeletonBlock({ className = '' }) {
  return <span className={joinClassNames('skeleton-block', className)} />;
}

export function LoadingSkeleton({ children, className = '', label }) {
  return (
    <section
      aria-busy="true"
      className={joinClassNames('loading-skeleton', className)}
      role="status"
    >
      <span className="visually-hidden">{label}</span>
      <div aria-hidden="true" className="loading-skeleton-content">
        {children}
      </div>
    </section>
  );
}

export function QueryUpdateStatus({ children, isUpdating }) {
  return (
    <div aria-live="polite" className="query-update-slot">
      {isUpdating ? (
        <span className="query-update-status" role="status">
          {children}
        </span>
      ) : null}
    </div>
  );
}
