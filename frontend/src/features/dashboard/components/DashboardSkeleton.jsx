import {
  LoadingSkeleton,
  SkeletonBlock,
} from '../../../components/feedback/LoadingSkeleton.jsx';

const SUMMARY_CARD_COUNT = 7;
const PANEL_COUNT = 4;

export function DashboardSkeleton() {
  return (
    <LoadingSkeleton
      className="page-section dashboard-page dashboard-skeleton"
      label="Loading dashboard"
    >
      <div className="skeleton-page-header">
        <SkeletonBlock className="skeleton-block-eyebrow" />
        <SkeletonBlock className="skeleton-block-title" />
        <SkeletonBlock className="skeleton-block-text skeleton-block-text-wide" />
      </div>

      <div className="dashboard-summary-grid">
        {Array.from({ length: SUMMARY_CARD_COUNT }, (_, index) => (
          <div className="skeleton-surface skeleton-summary-card" key={index}>
            <SkeletonBlock className="skeleton-block-text skeleton-block-text-short" />
            <SkeletonBlock className="skeleton-block-metric" />
          </div>
        ))}
      </div>

      <div className="dashboard-skeleton-panels">
        {Array.from({ length: PANEL_COUNT }, (_, panelIndex) => (
          <div className="skeleton-surface skeleton-dashboard-panel" key={panelIndex}>
            <div className="skeleton-panel-heading">
              <SkeletonBlock className="skeleton-block-text skeleton-block-text-short" />
              <SkeletonBlock className="skeleton-block-heading" />
            </div>
            <div className="skeleton-panel-rows">
              {Array.from({ length: panelIndex === 0 ? 6 : 3 }, (_, rowIndex) => (
                <div className="skeleton-dashboard-row" key={rowIndex}>
                  <SkeletonBlock className="skeleton-block-icon" />
                  <div>
                    <SkeletonBlock className="skeleton-block-text" />
                    <SkeletonBlock className="skeleton-block-text skeleton-block-text-short" />
                  </div>
                  <SkeletonBlock className="skeleton-block-badge" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </LoadingSkeleton>
  );
}
