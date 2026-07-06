import { useCallback, useEffect, useState } from 'react';

import {
  createApplication,
  deleteApplication,
  getApplicationFromResponse,
  getApplicationListFromResponse,
  getApplications,
  updateApplication,
} from '../../api/application.api.js';
import { ApplicationFilters } from '../../features/applications/components/ApplicationFilters.jsx';
import { ApplicationForm } from '../../features/applications/components/ApplicationForm.jsx';
import { ApplicationList } from '../../features/applications/components/ApplicationList.jsx';
import { getErrorMessage } from '../../features/auth/auth.utils.js';

const DEFAULT_FILTERS = {
  search: '',
  status: '',
  sortBy: 'updatedAt',
  sortOrder: 'desc',
};

function hasActiveFilters(filters) {
  return Boolean(filters.search || filters.status);
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [applicationActionError, setApplicationActionError] = useState('');
  const [deletingApplicationId, setDeletingApplicationId] = useState('');
  const [editingApplicationId, setEditingApplicationId] = useState('');
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [fetchError, setFetchError] = useState('');
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingDeleteApplicationId, setPendingDeleteApplicationId] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchApplications = useCallback(async () => {
    setIsLoading(true);
    setFetchError('');

    try {
      const response = await getApplications(filters);
      setApplications(getApplicationListFromResponse(response));
    } catch (error) {
      setFetchError(getErrorMessage(error, 'Unable to load applications.'));
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications, refreshKey]);

  async function handleCreateApplication(payload) {
    const response = await createApplication(payload);
    const createdApplication = getApplicationFromResponse(response);

    if (!createdApplication) {
      throw new Error('Create application response did not include an application.');
    }

    setIsCreateFormOpen(false);
    setApplicationActionError('');
    setEditingApplicationId('');
    setPendingDeleteApplicationId('');
    setFilters(DEFAULT_FILTERS);
    setRefreshKey((currentKey) => currentKey + 1);

    return createdApplication;
  }

  async function handleUpdateApplication(application, payload) {
    const response = await updateApplication(application._id, payload);
    const updatedApplication = getApplicationFromResponse(response);

    if (!updatedApplication) {
      throw new Error('Update application response did not include an application.');
    }

    setApplicationActionError('');
    setEditingApplicationId('');
    setPendingDeleteApplicationId('');
    setRefreshKey((currentKey) => currentKey + 1);

    return updatedApplication;
  }

  async function handleDeleteApplication(application) {
    setDeletingApplicationId(application._id);
    setApplicationActionError('');

    try {
      await deleteApplication(application._id);
      setApplications((currentApplications) =>
        currentApplications.filter((currentApplication) => currentApplication._id !== application._id),
      );
      setEditingApplicationId((currentId) => (currentId === application._id ? '' : currentId));
      setPendingDeleteApplicationId('');
    } catch (error) {
      setApplicationActionError(getErrorMessage(error, 'Unable to delete application.'));
    } finally {
      setDeletingApplicationId('');
    }
  }

  const emptyMessage = hasActiveFilters(filters)
    ? 'No applications match the current search or filters.'
    : 'No applications yet. Create your first application to start tracking it.';

  return (
    <section className="page-section applications-page" aria-labelledby="applications-title">
      <div className="applications-page-header">
        <div className="page-header">
          <p className="app-eyebrow">Pipeline</p>
          <h2 id="applications-title">Applications</h2>
          <p className="page-muted">
            Track applications by company, role, status, source, and follow-up date.
          </p>
        </div>

        <button
          className="button-primary"
          type="button"
          onClick={() => {
            setEditingApplicationId('');
            setPendingDeleteApplicationId('');
            setIsCreateFormOpen((isOpen) => !isOpen);
          }}
        >
          {isCreateFormOpen ? 'Close form' : 'Create Application'}
        </button>
      </div>

      {isCreateFormOpen ? (
        <section className="application-panel" aria-label="Create application">
          <div className="application-panel-header">
            <h3>New application</h3>
            <p>Add a role to your personal application tracker.</p>
          </div>
          <ApplicationForm
            onCancel={() => setIsCreateFormOpen(false)}
            onCreated={handleCreateApplication}
          />
        </section>
      ) : null}

      <section className="application-panel" aria-label="Application filters">
        <ApplicationFilters
          filters={filters}
          isLoading={isLoading}
          onApply={setFilters}
          onReset={() => setFilters(DEFAULT_FILTERS)}
        />
      </section>

      <ApplicationList
        actionError={applicationActionError}
        applications={applications}
        deletingApplicationId={deletingApplicationId}
        editingApplicationId={editingApplicationId}
        emptyMessage={emptyMessage}
        error={fetchError}
        isDeleteConfirmOpenFor={pendingDeleteApplicationId}
        isLoading={isLoading}
        onCancelDelete={() => setPendingDeleteApplicationId('')}
        onCancelEdit={() => setEditingApplicationId('')}
        onConfirmDelete={handleDeleteApplication}
        onEdit={(application) => {
          setIsCreateFormOpen(false);
          setPendingDeleteApplicationId('');
          setApplicationActionError('');
          setEditingApplicationId(application._id);
        }}
        onRequestDelete={(application) => {
          setEditingApplicationId('');
          setApplicationActionError('');
          setPendingDeleteApplicationId(application._id);
        }}
        onRetry={fetchApplications}
        onUpdate={handleUpdateApplication}
      />
    </section>
  );
}
