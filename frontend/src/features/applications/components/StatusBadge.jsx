import { getApplicationStatusLabel } from '../../../constants/status.js';

export function StatusBadge({ status }) {
  return (
    <span className={`status-badge status-badge-${status || 'unknown'}`}>
      {getApplicationStatusLabel(status)}
    </span>
  );
}
