import { getApplicationStatusLabel } from '../../../constants/status.js';
import {
  DASHBOARD_STATUS_ORDER,
  getStatusCount,
} from '../dashboard.constants.js';

export function DashboardSummaryCards({ countsByStatus = {}, totalApplications = 0 }) {
  const cards = [
    {
      label: 'Total Applications',
      value: Number.isFinite(totalApplications) ? totalApplications : 0,
      variant: 'total',
    },
    ...DASHBOARD_STATUS_ORDER.map((status) => ({
      label: getApplicationStatusLabel(status),
      value: getStatusCount(countsByStatus, status),
      variant: status,
    })),
  ];

  return (
    <section className="dashboard-summary-grid" aria-label="Application summary">
      {cards.map((card) => (
        <article
          className={`dashboard-summary-card dashboard-summary-card-${card.variant}`}
          key={card.label}
        >
          <span>{card.label}</span>
          <strong>{card.value}</strong>
        </article>
      ))}
    </section>
  );
}
