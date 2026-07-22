import {
  LoadingSkeleton,
  SkeletonBlock,
} from '../../../components/feedback/LoadingSkeleton.jsx';

const APPLICATION_CARD_COUNT = 3;
const FILTER_CONTROL_COUNT = 4;

export function ApplicationsSkeleton() {
  return (
    <LoadingSkeleton
      className="page-section applications-page applications-skeleton"
      label="Loading applications"
    >
      <div className="skeleton-page-header skeleton-page-header-with-action">
        <div>
          <SkeletonBlock className="skeleton-block-eyebrow" />
          <SkeletonBlock className="skeleton-block-title" />
          <SkeletonBlock className="skeleton-block-text skeleton-block-text-wide" />
        </div>
        <SkeletonBlock className="skeleton-block-button" />
      </div>

      <div className="skeleton-surface skeleton-filter-panel">
        {Array.from({ length: FILTER_CONTROL_COUNT }, (_, index) => (
          <div className="skeleton-control-group" key={index}>
            <SkeletonBlock className="skeleton-block-text skeleton-block-label" />
            <SkeletonBlock className="skeleton-block-control" />
          </div>
        ))}
        <div className="skeleton-filter-actions">
          <SkeletonBlock className="skeleton-block-button skeleton-block-button-compact" />
          <SkeletonBlock className="skeleton-block-button skeleton-block-button-compact" />
        </div>
      </div>

      <div className="skeleton-application-list">
        {Array.from({ length: APPLICATION_CARD_COUNT }, (_, index) => (
          <div className="skeleton-surface skeleton-application-card" key={index}>
            <div className="skeleton-card-header">
              <div>
                <SkeletonBlock className="skeleton-block-heading" />
                <SkeletonBlock className="skeleton-block-text" />
              </div>
              <SkeletonBlock className="skeleton-block-badge" />
            </div>
            <div className="skeleton-meta-row">
              <SkeletonBlock className="skeleton-block-text skeleton-block-meta" />
              <SkeletonBlock className="skeleton-block-text skeleton-block-meta" />
              <SkeletonBlock className="skeleton-block-text skeleton-block-meta" />
            </div>
            <SkeletonBlock className="skeleton-block-text skeleton-block-text-wide" />
            <div className="skeleton-action-row">
              <SkeletonBlock className="skeleton-block-text skeleton-block-action" />
              <SkeletonBlock className="skeleton-block-text skeleton-block-action" />
              <SkeletonBlock className="skeleton-block-button skeleton-block-button-compact" />
            </div>
          </div>
        ))}
      </div>
    </LoadingSkeleton>
  );
}
