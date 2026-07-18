import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import {
  getDashboardSummary,
  getDashboardSummaryFromResponse,
} from '../../api/dashboard.api.js';
import { AttentionFlagsPanel } from '../../features/dashboard/components/AttentionFlagsPanel.jsx';
import { DashboardSummaryCards } from '../../features/dashboard/components/DashboardSummaryCards.jsx';
import { RecentApplicationsPanel } from '../../features/dashboard/components/RecentApplicationsPanel.jsx';
import { StatusCountGrid } from '../../features/dashboard/components/StatusCountGrid.jsx';
import { UpcomingEventsPanel } from '../../features/dashboard/components/UpcomingEventsPanel.jsx';
import { getErrorMessage } from '../../features/auth/auth.utils.js';
import './DashboardPage.css';

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const requestIdRef = useRef(0);
  const requestPendingRef = useRef(false);

  const loadDashboardSummary = useCallback(async () => {
    if (requestPendingRef.current) {
      return;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    requestPendingRef.current = true;
    setIsLoading(true);
    setLoadError('');
    setSummary(null);

    try {
      const response = await getDashboardSummary();

      if (requestId === requestIdRef.current) {
        setSummary(getDashboardSummaryFromResponse(response));
      }
    } catch (error) {
      if (requestId === requestIdRef.current) {
        setLoadError(getErrorMessage(error, 'Unable to load dashboard summary.'));
      }
    } finally {
      if (requestId === requestIdRef.current) {
        requestPendingRef.current = false;
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadDashboardSummary();

    return () => {
      requestIdRef.current += 1;
      requestPendingRef.current = false;
    };
  }, [loadDashboardSummary]);

  const hasNoApplications =
    !isLoading && !loadError && summary?.totalApplications === 0;
  const hasApplications =
    !isLoading && !loadError && summary?.totalApplications > 0;

  return (
    <section className="page-section dashboard-page" aria-labelledby="dashboard-title">
      <div className="page-header">
        <p className="app-eyebrow">Overview</p>
        <h2 id="dashboard-title">Dashboard</h2>
        <p className="page-muted">
          Overview of your job application pipeline.
        </p>
      </div>

      {isLoading ? (
        <section
          className="applications-state applications-state-loading dashboard-page-state"
          aria-live="polite"
          role="status"
        >
          <h3>Loading dashboard</h3>
          <p>Retrieving your latest application summary.</p>
        </section>
      ) : null}

      {loadError ? (
        <section
          className="applications-state applications-state-error dashboard-page-state"
          role="alert"
        >
          <h3>Dashboard unavailable</h3>
          <p>{loadError}</p>
          <button disabled={isLoading} type="button" onClick={loadDashboardSummary}>
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
