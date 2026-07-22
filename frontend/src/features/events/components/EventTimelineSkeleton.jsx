import {
  LoadingSkeleton,
  SkeletonBlock,
} from '../../../components/feedback/LoadingSkeleton.jsx';

export function EventTimelineSkeleton() {
  return (
    <LoadingSkeleton className="event-timeline-skeleton" label="Loading recruitment timeline">
      <div className="skeleton-panel-rows">
        {Array.from({ length: 3 }, (_, index) => (
          <div className="skeleton-event-row" key={index}>
            <div>
              <SkeletonBlock className="skeleton-block-text skeleton-block-label" />
              <SkeletonBlock className="skeleton-block-heading" />
              <SkeletonBlock className="skeleton-block-text" />
            </div>
            <SkeletonBlock className="skeleton-block-text skeleton-block-meta" />
          </div>
        ))}
      </div>
    </LoadingSkeleton>
  );
}
