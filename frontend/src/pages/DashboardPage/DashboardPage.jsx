import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

import {
  getDashboardSummary,
  getDashboardSummaryFromResponse,
} from '../../api/dashboard.api.js';
import { dashboardKeys } from '../../app/query-client.js';
import { QueryUpdateStatus } from '../../components/feedback/LoadingSkeleton.jsx';
import { AttentionFlagsPanel } from '../../features/dashboard/components/AttentionFlagsPanel.jsx';
import { DashboardSkeleton } from '../../features/dashboard/components/DashboardSkeleton.jsx';
import { DashboardSummaryCards } from '../../features/dashboard/components/DashboardSummaryCards.jsx';
import { RecentApplicationsPanel } from '../../features/dashboard/components/RecentApplicationsPanel.jsx';
import { StatusCountGrid } from '../../features/dashboard/components/StatusCountGrid.jsx';
import { UpcomingEventsPanel } from '../../features/dashboard/components/UpcomingEventsPanel.jsx';
import { getErrorMessage } from '../../features/auth/auth.utils.js';
import './DashboardPage.css';

export default function DashboardPage() {
  const dashboardQuery = useQuery({
    queryKey: dashboardKeys.summary(),
    queryFn: async () => {
      const response = await getDashboardSummary();
      return getDashboardSummaryFromResponse(response);
    },
  });

  const summary = dashboardQuery.data;
  const queryError = dashboardQuery.isError
    ? getErrorMessage(dashboardQuery.error, 'Unable to load dashboard summary.')
    : '';
  const hasResolvedSummary = dashboardQuery.data !== undefined;
  const initialLoadError = hasResolvedSummary ? '' : queryError;
  const backgroundLoadError = hasResolvedSummary ? queryError : '';
  const isInitialLoading = dashboardQuery.isPending && !hasResolvedSummary;
  const isBackgroundFetching = dashboardQuery.isFetching && hasResolvedSummary;

  const hasNoApplications =
    !isInitialLoading && !initialLoadError && summary?.totalApplications === 0;
  const hasApplications =
    !isInitialLoading && !initialLoadError && summary?.totalApplications > 0;

  if (isInitialLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <section
      className="page-section dashboard-page page-mount"
      aria-labelledby="dashboard-title"
    >
      <div className="page-header">
        <p className="app-eyebrow">Overview</p>
        <h2 id="dashboard-title">Dashboard</h2>
        <p className="page-muted">
          Overview of your job application pipeline.
        </p>
      </div>

      {initialLoadError ? (
        <section
          className="applications-state applications-state-error dashboard-page-state"
          role="alert"
        >
          <h3>Dashboard unavailable</h3>
          <p>{initialLoadError}</p>
          <button
            disabled={dashboardQuery.isFetching}
            type="button"
            onClick={() => dashboardQuery.refetch()}
          >
            Retry
          </button>
        </section>
      ) : null}

      {hasResolvedSummary ? (
        <QueryUpdateStatus isUpdating={isBackgroundFetching}>
          Updating dashboard...
        </QueryUpdateStatus>
      ) : null}

      {backgroundLoadError ? (
        <section
          className="applications-state applications-state-error dashboard-page-state"
          role="alert"
        >
          <h3>Could not update dashboard</h3>
          <p>{backgroundLoadError}</p>
          <button
            disabled={dashboardQuery.isFetching}
            type="button"
            onClick={() => dashboardQuery.refetch()}
          >
            Retry
          </button>
        </section>
      ) : null}

      {hasNoApplications ? (
        <section className="applications-state applications-state-empty dashboard-page-state">
          <h3>No applications yet</h3>
          <p>Start tracking an application to see your dashboard summary.</p>
          <Link className="button-primary dashboard-empty-action" to="/applications">
            Go to applications
          </Link>
        </section>
      ) : null}

      {hasApplications ? (
        <>
          <DashboardSummaryCards
            countsByStatus={summary.countsByStatus}
            totalApplications={summary.totalApplications}
          />

          <div className="dashboard-grid">
            <StatusCountGrid countsByStatus={summary.countsByStatus} />
            <RecentApplicationsPanel applications={summary.recentApplications} />
          </div>

          <div className="dashboard-grid">
            <UpcomingEventsPanel events={summary.upcomingEvents} />
            <AttentionFlagsPanel flags={summary.attentionFlags} />
          </div>
        </>
      ) : null}
    </section>
  );
}
