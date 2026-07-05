import { useCallback, useEffect, useState } from 'react';

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

const EMPTY_SUMMARY = {
  countsByStatus: {},
  totalApplications: 0,
  recentApplications: [],
  upcomingEvents: [],
  attentionFlags: [],
};

export default function DashboardPage() {
  const [summary, setSummary] = useState(EMPTY_SUMMARY);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const loadDashboardSummary = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');

    try {
      const response = await getDashboardSummary();
      setSummary(getDashboardSummaryFromResponse(response));
    } catch (error) {
      setSummary(EMPTY_SUMMARY);
      setLoadError(getErrorMessage(error, 'Unable to load dashboard summary.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardSummary();
  }, [loadDashboardSummary]);

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
        <section className="applications-state" aria-live="polite">
          <p>Loading dashboard...</p>
        </section>
      ) : null}

      {loadError ? (
        <section className="applications-state applications-state-error" role="alert">
          <p>{loadError}</p>
          <button type="button" onClick={loadDashboardSummary}>
            Retry
          </button>
        </section>
      ) : null}

      {!isLoading && !loadError ? (
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
