import { useEffect, useState } from 'react';

import { APPLICATION_STATUS_OPTIONS } from '../../../constants/status.js';

const SORT_FIELD_OPTIONS = [
  { value: 'updatedAt', label: 'Updated date' },
  { value: 'createdAt', label: 'Created date' },
  { value: 'followUpAt', label: 'Follow-up date' },
];

const DEFAULT_SORT_ORDER_OPTIONS = [
  { value: 'desc', label: 'Newest first' },
  { value: 'asc', label: 'Oldest first' },
];

const FOLLOW_UP_SORT_ORDER_OPTIONS = [
  { value: 'desc', label: 'Latest follow-up first' },
  { value: 'asc', label: 'Earliest follow-up first' },
];

export function ApplicationFilters({ filters, isLoading, onApply, onReset }) {
  const [draftFilters, setDraftFilters] = useState(filters);
  const sortOrderOptions =
    draftFilters.sortBy === 'followUpAt'
      ? FOLLOW_UP_SORT_ORDER_OPTIONS
      : DEFAULT_SORT_ORDER_OPTIONS;

  useEffect(() => {
    setDraftFilters(filters);
  }, [filters]);

  function handleChange(event) {
    const { name, value } = event.target;

    setDraftFilters((currentFilters) => ({
      ...currentFilters,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onApply({
      ...draftFilters,
      search: draftFilters.search.trim(),
    });
  }

  return (
    <form className="application-filters" onSubmit={handleSubmit}>
      <label>
        Search
        <input
          disabled={isLoading}
          name="search"
          onChange={handleChange}
          placeholder="Company or role"
          type="search"
          value={draftFilters.search}
        />
      </label>

      <label>
        Status
        <select
          disabled={isLoading}
          name="status"
          onChange={handleChange}
          value={draftFilters.status}
        >
          <option value="">All statuses</option>
          {APPLICATION_STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label>
        Sort by
        <select
          disabled={isLoading}
          name="sortBy"
          onChange={handleChange}
          value={draftFilters.sortBy}
        >
          {SORT_FIELD_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label>
        Order
        <select
          disabled={isLoading}
          name="sortOrder"
          onChange={handleChange}
          value={draftFilters.sortOrder}
        >
          {sortOrderOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <div className="application-filter-actions">
        <button disabled={isLoading} type="submit">
          Apply
        </button>
        <button disabled={isLoading} type="button" onClick={onReset}>
          Reset
        </button>
      </div>
    </form>
  );
}
