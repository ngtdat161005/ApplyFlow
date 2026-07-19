import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';

import {
  deleteApplication,
  getApplication,
  getApplicationFromResponse,
  updateApplication,
} from '../../api/application.api.js';
import {
  createApplicationEvent,
  deleteApplicationEvent,
  getApplicationEvents,
  getEventFromResponse,
  getEventListFromResponse,
  updateApplicationEvent,
} from '../../api/event.api.js';
import { applicationKeys, dashboardKeys } from '../../app/query-client.js';
import { ApplicationOverview } from '../../features/applications/components/ApplicationOverview.jsx';
import { ApplicationForm } from '../../features/applications/components/ApplicationForm.jsx';
import { EventForm } from '../../features/events/components/EventForm.jsx';
import { EventTimeline } from '../../features/events/components/EventTimeline.jsx';
import { getErrorMessage } from '../../features/auth/auth.utils.js';

export default function ApplicationDetailPage() {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [applicationActionError, setApplicationActionError] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [isApplicationDeleteConfirmOpen, setIsApplicationDeleteConfirmOpen] = useState(false);
  const [isApplicationEditFormOpen, setIsApplicationEditFormOpen] = useState(false);
  const [deletingEventId, setDeletingEventId] = useState('');
  const [editingEventId, setEditingEventId] = useState('');
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [pendingDeleteEventId, setPendingDeleteEventId] = useState('');
  const applicationDeleteInFlightRef = useRef(false);
  const eventDeleteInFlightRef = useRef('');

  const applicationQuery = useQuery({
    queryKey: applicationKeys.detail(applicationId),
    queryFn: async () => {
      const response = await getApplication(applicationId);
      const loadedApplication = getApplicationFromResponse(response);

      if (!loadedApplication) {
        throw new Error('Application response did not include an application.');
      }

      return loadedApplication;
    },
    enabled: Boolean(applicationId),
  });

  const eventsQuery = useQuery({
    queryKey: applicationKeys.events(applicationId),
    queryFn: async () => {
      const response = await getApplicationEvents(applicationId);
      return getEventListFromResponse(response);
    },
    enabled: Boolean(applicationId),
  });

  const updateApplicationMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await updateApplication(applicationId, payload);
      const updatedApplication = getApplicationFromResponse(response);

      if (!updatedApplication) {
        throw new Error('Update application response did not include an application.');
      }

      return updatedApplication;
    },
    onSuccess: async (updatedApplication) => {
      setApplicationActionError('');
      setIsApplicationDeleteConfirmOpen(false);
      setIsApplicationEditFormOpen(false);

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
    mutationFn: () => deleteApplication(applicationId),
    onMutate: () => {
      setApplicationActionError('');
    },
    onSuccess: async () => {
      queryClient.removeQueries({
        queryKey: applicationKeys.detail(applicationId),
      });

      setIsApplicationDeleteConfirmOpen(false);
      setIsApplicationEditFormOpen(false);
      setIsCreateFormOpen(false);
      navigate('/applications', { replace: true });

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: applicationKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: dashboardKeys.summary() }),
      ]);
    },
    onError: (error) => {
      setApplicationActionError(getErrorMessage(error, 'Unable to delete application.'));
    },
  });

  const createEventMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await createApplicationEvent(applicationId, payload);
      const createdEvent = getEventFromResponse(response);

      if (!createdEvent) {
        throw new Error('Create event response did not include an event.');
      }

      return createdEvent;
    },
    onSuccess: async () => {
      setIsCreateFormOpen(false);
      setDeleteError('');

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: applicationKeys.events(applicationId),
          exact: true,
        }),
        queryClient.invalidateQueries({ queryKey: dashboardKeys.summary() }),
      ]);
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: async ({ eventId, payload }) => {
      const response = await updateApplicationEvent(applicationId, eventId, payload);
      const updatedEvent = getEventFromResponse(response);

      if (!updatedEvent) {
        throw new Error('Update event response did not include an event.');
      }

      return updatedEvent;
    },
    onSuccess: async () => {
      setEditingEventId('');
      setDeleteError('');

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: applicationKeys.events(applicationId),
          exact: true,
        }),
        queryClient.invalidateQueries({ queryKey: dashboardKeys.summary() }),
      ]);
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: (event) => deleteApplicationEvent(applicationId, event._id),
    onMutate: (event) => {
      setDeletingEventId(event._id);
      setDeleteError('');
    },
    onSuccess: async () => {
      setPendingDeleteEventId('');

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: applicationKeys.events(applicationId),
          exact: true,
        }),
        queryClient.invalidateQueries({ queryKey: dashboardKeys.summary() }),
      ]);
    },
    onError: (error) => {
      setDeleteError(getErrorMessage(error, 'Unable to delete event.'));
    },
    onSettled: () => {
      eventDeleteInFlightRef.current = '';
      setDeletingEventId('');
    },
  });

  const currentApplication =
    applicationQuery.data && String(applicationQuery.data._id) === applicationId
      ? applicationQuery.data
      : null;
  const applicationQueryError = applicationQuery.isError
    ? {
        applicationId,
        message: getErrorMessage(applicationQuery.error, 'Unable to load application.'),
        status: applicationQuery.error?.status,
      }
    : null;
  const missingApplicationError = applicationId
    ? null
    : {
        applicationId,
        message: 'Application ID is missing.',
        status: 400,
      };
  const currentApplicationError = applicationQueryError || missingApplicationError;

  useEffect(() => {
    setApplicationActionError('');
    setDeleteError('');
    setDeletingEventId('');
    setEditingEventId('');
    setIsApplicationDeleteConfirmOpen(false);
    setIsApplicationEditFormOpen(false);
    setIsCreateFormOpen(false);
    setPendingDeleteEventId('');
    applicationDeleteInFlightRef.current = false;
    eventDeleteInFlightRef.current = '';
  }, [applicationId]);

  async function handleCreateEvent(payload) {
    return createEventMutation.mutateAsync(payload);
  }

  async function handleUpdateApplication(payload) {
    return updateApplicationMutation.mutateAsync(payload);
  }

  async function handleDeleteApplication() {
    if (!currentApplication || applicationDeleteInFlightRef.current) {
      return;
    }

    applicationDeleteInFlightRef.current = true;

    try {
      await deleteApplicationMutation.mutateAsync();
    } catch {
      // The mutation callback owns the visible delete error state.
    } finally {
      applicationDeleteInFlightRef.current = false;
    }
  }

  async function handleUpdateEvent(event, payload) {
    return updateEventMutation.mutateAsync({
      eventId: event._id,
      payload,
    });
  }

  async function handleDeleteEvent(event) {
    if (eventDeleteInFlightRef.current) {
      return;
    }

    eventDeleteInFlightRef.current = event._id;
    try {
      await deleteEventMutation.mutateAsync(event);
    } catch {
      // The mutation callback owns the visible delete error state.
    } finally {
      if (eventDeleteInFlightRef.current === event._id) {
        eventDeleteInFlightRef.current = '';
      }
    }
  }

  const hasResolvedApplication = applicationQuery.data !== undefined;
  const isPageLoading = applicationQuery.isPending && Boolean(applicationId);
  const isApplicationUpdating = applicationQuery.isFetching && hasResolvedApplication;
  const initialApplicationError = currentApplication ? null : currentApplicationError;
  const backgroundApplicationError = currentApplication ? currentApplicationError : null;
  const isApplicationUnavailable = [400, 404].includes(currentApplicationError?.status);
  const events = eventsQuery.data || [];
  const eventsQueryError = eventsQuery.isError
    ? getErrorMessage(eventsQuery.error, 'Unable to load events.')
    : '';
  const hasResolvedEvents = eventsQuery.data !== undefined;
  const initialEventsError = hasResolvedEvents ? '' : eventsQueryError;
  const backgroundEventsError = hasResolvedEvents ? eventsQueryError : '';
  const isEventsLoading = eventsQuery.isPending && Boolean(applicationId);
  const isEventsUpdating = eventsQuery.isFetching && hasResolvedEvents;

  return (
    <section className="page-section application-detail-page" aria-labelledby="application-detail-title">
      <div className="application-detail-topbar">
        <Link className="text-link" to="/applications">
          Back to applications
        </Link>
      </div>

      <div className="applications-page-header">
        <div className="page-header">
          <p className="app-eyebrow">Application detail</p>
          <h2 id="application-detail-title">
            {currentApplication
              ? `${currentApplication.company} - ${currentApplication.role}`
              : 'Application detail'}
          </h2>
          <p className="page-muted">Review application metadata and manage recruitment timeline events.</p>
        </div>
      </div>

      {isPageLoading ? (
        <section
          className="applications-state applications-state-loading"
          aria-live="polite"
          role="status"
        >
          <h3>Loading application</h3>
          <p>Fetching application details...</p>
        </section>
      ) : null}

      {initialApplicationError && isApplicationUnavailable ? (
        <section className="applications-state application-detail-state-unavailable" role="alert">
          <h3>Application unavailable</h3>
          <p>{initialApplicationError.message}</p>
        </section>
      ) : null}

      {initialApplicationError && !isApplicationUnavailable ? (
        <section className="applications-state applications-state-error" role="alert">
          <h3>Could not load application</h3>
          <p>{initialApplicationError.message}</p>
          <button type="button" onClick={() => applicationQuery.refetch()}>
            Retry
          </button>
        </section>
      ) : null}

      {isApplicationUpdating ? (
        <p className="page-muted" role="status">
          Updating application...
        </p>
      ) : null}

      {backgroundApplicationError ? (
        <section className="applications-state applications-state-error" role="alert">
          <h3>Could not update application</h3>
          <p>{backgroundApplicationError.message}</p>
          <button type="button" onClick={() => applicationQuery.refetch()}>
            Retry
          </button>
        </section>
      ) : null}

      {currentApplication ? (
        <>
          <ApplicationOverview
            application={currentApplication}
            isConfirmingDelete={isApplicationDeleteConfirmOpen}
            isDeleting={deleteApplicationMutation.isPending}
            onCancelDelete={() => setIsApplicationDeleteConfirmOpen(false)}
            onConfirmDelete={handleDeleteApplication}
            onEdit={() => {
              setApplicationActionError('');
              setIsApplicationDeleteConfirmOpen(false);
              setIsApplicationEditFormOpen(true);
              setIsCreateFormOpen(false);
              setEditingEventId('');
              setPendingDeleteEventId('');
            }}
            onRequestDelete={() => {
              setApplicationActionError('');
              setIsApplicationEditFormOpen(false);
              setEditingEventId('');
              setIsCreateFormOpen(false);
              setPendingDeleteEventId('');
              setIsApplicationDeleteConfirmOpen(true);
            }}
          />

          {applicationActionError ? (
            <div className="auth-alert" role="alert">
              <p>{applicationActionError}</p>
            </div>
          ) : null}

          {isApplicationEditFormOpen ? (
            <section className="application-panel" aria-label="Edit application">
              <div className="application-panel-header">
                <h3>Edit application</h3>
                <p>Update company, role, status, source, notes, and follow-up date.</p>
              </div>
              <ApplicationForm
                application={currentApplication}
                mode="edit"
                onCancel={() => setIsApplicationEditFormOpen(false)}
                onSubmit={handleUpdateApplication}
              />
            </section>
          ) : null}
        </>
      ) : null}

      {currentApplication ? (
        <section className="application-panel event-panel" aria-labelledby="event-timeline-title">
          <div className="event-panel-header">
            <div>
              <p className="app-eyebrow">Recruitment timeline</p>
              <h3 id="event-timeline-title">Events</h3>
              <p>Track interviews, calls, assessments, follow-ups, offers, notes, and outcomes.</p>
            </div>
            <button
              className="button-primary"
              disabled={isEventsLoading}
              type="button"
              onClick={() => {
                setIsApplicationEditFormOpen(false);
                setEditingEventId('');
                setPendingDeleteEventId('');
                setIsCreateFormOpen((isOpen) => !isOpen);
              }}
            >
              {isCreateFormOpen ? 'Close form' : 'Add event'}
            </button>
          </div>

          {isCreateFormOpen ? (
            <section className="event-form-panel" aria-label="Add event">
              <EventForm onCancel={() => setIsCreateFormOpen(false)} onSubmit={handleCreateEvent} />
            </section>
          ) : null}

          {isEventsUpdating ? (
            <p className="page-muted" role="status">
              Updating events...
            </p>
          ) : null}

          {backgroundEventsError ? (
            <section className="applications-state applications-state-error" role="alert">
              <h4>Could not update events</h4>
              <p>{backgroundEventsError}</p>
              <button type="button" onClick={() => eventsQuery.refetch()}>
                Retry
              </button>
            </section>
          ) : null}

          <EventTimeline
            deleteError={deleteError}
            deletingEventId={deletingEventId}
            editingEventId={editingEventId}
            events={events}
            isDeleteConfirmOpenFor={pendingDeleteEventId}
            isLoading={isEventsLoading}
            loadError={initialEventsError}
            onCancelDelete={() => setPendingDeleteEventId('')}
            onCancelEdit={() => setEditingEventId('')}
            onConfirmDelete={handleDeleteEvent}
            onEdit={(event) => {
              setIsApplicationEditFormOpen(false);
              setIsCreateFormOpen(false);
              setApplicationActionError('');
              setIsApplicationDeleteConfirmOpen(false);
              setPendingDeleteEventId('');
              setEditingEventId(event._id);
            }}
            onRequestDelete={(event) => {
              setIsApplicationEditFormOpen(false);
              setApplicationActionError('');
              setIsApplicationDeleteConfirmOpen(false);
              setEditingEventId('');
              setPendingDeleteEventId(event._id);
            }}
            onRetry={() => eventsQuery.refetch()}
            onUpdate={handleUpdateEvent}
          />
        </section>
      ) : null}
    </section>
  );
}
