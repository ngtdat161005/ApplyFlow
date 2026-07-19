import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createApplication,
  deleteApplication,
  getApplicationFromResponse,
  getApplicationListFromResponse,
  getApplications,
  updateApplication,
} from '../../api/application.api.js';
import {
  applicationKeys,
  canonicalizeApplicationFilters,
  dashboardKeys,
} from '../../app/query-client.js';
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
  const queryClient = useQueryClient();
  const [applicationActionError, setApplicationActionError] = useState('');
  const [deletingApplicationId, setDeletingApplicationId] = useState('');
  const [editingApplicationId, setEditingApplicationId] = useState('');
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [pendingDeleteApplicationId, setPendingDeleteApplicationId] = useState('');

  const canonicalFilters = useMemo(
    () => canonicalizeApplicationFilters(filters),
    [filters.search, filters.sortBy, filters.sortOrder, filters.status],
  );

  const applicationsQuery = useQuery({
    queryKey: applicationKeys.list(canonicalFilters),
    queryFn: async () => {
      const response = await getApplications(canonicalFilters);
      return getApplicationListFromResponse(response);
    },
  });

  const createApplicationMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await createApplication(payload);
      const createdApplication = getApplicationFromResponse(response);

      if (!createdApplication) {
        throw new Error('Create application response did not include an application.');
      }

      return createdApplication;
    },
    onSuccess: async () => {
      setIsCreateFormOpen(false);
      setApplicationActionError('');
      setEditingApplicationId('');
      setPendingDeleteApplicationId('');
      setFilters({ ...DEFAULT_FILTERS });

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: applicationKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: dashboardKeys.summary() }),
      ]);
    },
  });

  const updateApplicationMutation = useMutation({
    mutationFn: async ({ applicationId, payload }) => {
      const response = await updateApplication(applicationId, payload);
      const updatedApplication = getApplicationFromResponse(response);

      if (!updatedApplication) {
        throw new Error('Update application response did not include an application.');
      }

      return updatedApplication;
    },
    onSuccess: async (updatedApplication) => {
      setApplicationActionError('');
      setEditingApplicationId('');
      setPendingDeleteApplicationId('');

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: applicationKeys.detail(updatedApplication._id),
          exact: true,
        }),
        queryClient.invalidateQueries({ queryKey: applicationKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: dashboardKeys.summary() }),
      ]);
    },
  });

  const deleteApplicationMutation = useMutation({
    mutationFn: async (application) => {
      await deleteApplication(application._id);
      return application;
    },
    onMutate: (application) => {
      setDeletingApplicationId(application._id);
      setApplicationActionError('');
    },
    onSuccess: async (deletedApplication) => {
      queryClient.removeQueries({
        queryKey: applicationKeys.detail(deletedApplication._id),
      });

      setEditingApplicationId((currentId) =>
        currentId === deletedApplication._id ? '' : currentId,
      );
      setPendingDeleteApplicationId('');

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: applicationKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: dashboardKeys.summary() }),
      ]);
    },
    onError: (error) => {
      setApplicationActionError(getErrorMessage(error, 'Unable to delete application.'));
    },
    onSettled: () => {
      setDeletingApplicationId('');
    },
  });

  const applications = applicationsQuery.data || [];
  const queryError = applicationsQuery.isError
    ? getErrorMessage(applicationsQuery.error, 'Unable to load applications.')
    : '';
  const hasResolvedData = applicationsQuery.data !== undefined;
  const initialQueryError = hasResolvedData ? '' : queryError;
  const backgroundQueryError = hasResolvedData ? queryError : '';
  const isInitialLoading = applicationsQuery.isPending;
  const isBackgroundFetching = applicationsQuery.isFetching && hasResolvedData;

  async function handleCreateApplication(payload) {
    return createApplicationMutation.mutateAsync(payload);
  }

  async function handleUpdateApplication(application, payload) {
    return updateApplicationMutation.mutateAsync({
      applicationId: application._id,
      payload,
    });
  }

  async function handleDeleteApplication(application) {
    try {
      await deleteApplicationMutation.mutateAsync(application);
    } catch {
      // The mutation callback owns the visible delete error state.
    }
  }

  function handleOpenCreateForm() {
    setEditingApplicationId('');
    setPendingDeleteApplicationId('');
    setIsCreateFormOpen(true);
  }

  function handleResetFilters() {
    setFilters({ ...DEFAULT_FILTERS });
  }

  function handleApplyFilters(nextFilters) {
    setFilters(canonicalizeApplicationFilters(nextFilters));
  }

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
            if (isCreateFormOpen) {
              setIsCreateFormOpen(false);
              return;
            }

            handleOpenCreateForm();
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
          filters={canonicalFilters}
          isLoading={isInitialLoading}
          onApply={handleApplyFilters}
          onReset={handleResetFilters}
        />
      </section>

      {isBackgroundFetching ? (
        <p className="page-muted" role="status">
          Updating applications...
        </p>
      ) : null}

      {backgroundQueryError ? (
        <div className="applications-state applications-state-error" role="alert">
          <h3>Could not update applications</h3>
          <p>{backgroundQueryError}</p>
          <button type="button" onClick={() => applicationsQuery.refetch()}>
            Try again
          </button>
        </div>
      ) : null}

      <ApplicationList
        actionError={applicationActionError}
        applications={applications}
        deletingApplicationId={deletingApplicationId}
        editingApplicationId={editingApplicationId}
        error={initialQueryError}
        hasActiveFilters={hasActiveFilters(canonicalFilters)}
        isDeleteConfirmOpenFor={pendingDeleteApplicationId}
        isCreateFormOpen={isCreateFormOpen}
        isLoading={isInitialLoading}
        onCancelDelete={() => setPendingDeleteApplicationId('')}
        onCancelEdit={() => setEditingApplicationId('')}
        onConfirmDelete={handleDeleteApplication}
        onCreate={handleOpenCreateForm}
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
        onResetFilters={handleResetFilters}
        onRetry={() => applicationsQuery.refetch()}
        onUpdate={handleUpdateApplication}
      />
    </section>
  );
}
