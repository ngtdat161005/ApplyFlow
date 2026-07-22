import {
  LoadingSkeleton,
  SkeletonBlock,
} from '../../../components/feedback/LoadingSkeleton.jsx';

export function ApplicationDetailSkeleton() {
  return (
    <LoadingSkeleton
      className="page-section application-detail-page application-detail-skeleton"
      label="Loading application details"
    >
      <SkeletonBlock className="skeleton-block-text skeleton-block-action" />

      <div className="skeleton-page-header">
        <SkeletonBlock className="skeleton-block-eyebrow" />
        <SkeletonBlock className="skeleton-block-title skeleton-block-title-detail" />
        <SkeletonBlock className="skeleton-block-text skeleton-block-text-wide" />
      </div>

      <div className="skeleton-surface skeleton-detail-overview">
        <div className="skeleton-card-header">
          <div>
            <SkeletonBlock className="skeleton-block-eyebrow" />
            <SkeletonBlock className="skeleton-block-heading skeleton-block-heading-wide" />
            <SkeletonBlock className="skeleton-block-text" />
          </div>
          <div className="skeleton-action-row">
            <SkeletonBlock className="skeleton-block-badge" />
            <SkeletonBlock className="skeleton-block-button skeleton-block-button-compact" />
            <SkeletonBlock className="skeleton-block-button skeleton-block-button-compact" />
          </div>
        </div>
        <div className="skeleton-meta-row skeleton-meta-row-detail">
          {Array.from({ length: 5 }, (_, index) => (
            <SkeletonBlock
              className="skeleton-block-text skeleton-block-meta"
              key={index}
            />
          ))}
        </div>
        <div className="skeleton-note-block">
          <SkeletonBlock className="skeleton-block-text skeleton-block-label" />
          <SkeletonBlock className="skeleton-block-text skeleton-block-text-wide" />
          <SkeletonBlock className="skeleton-block-text" />
        </div>
      </div>

      <div className="skeleton-surface skeleton-timeline-panel">
        <div className="skeleton-card-header">
          <div>
            <SkeletonBlock className="skeleton-block-eyebrow" />
            <SkeletonBlock className="skeleton-block-heading" />
            <SkeletonBlock className="skeleton-block-text skeleton-block-text-wide" />
          </div>
          <SkeletonBlock className="skeleton-block-button" />
        </div>
        <div className="skeleton-panel-rows">
          {Array.from({ length: 3 }, (_, index) => (
            <div className="skeleton-event-row" key={index}>
              <div>
                <SkeletonBlock className="skeleton-block-text skeleton-block-label" />
                <SkeletonBlock className="skeleton-block-heading" />
              </div>
              <SkeletonBlock className="skeleton-block-text skeleton-block-meta" />
            </div>
          ))}
        </div>
      </div>
    </LoadingSkeleton>
  );
}
