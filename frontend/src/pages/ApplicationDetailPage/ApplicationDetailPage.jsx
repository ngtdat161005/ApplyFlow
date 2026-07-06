import { useCallback, useEffect, useState } from 'react';
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
import { ApplicationOverview } from '../../features/applications/components/ApplicationOverview.jsx';
import { ApplicationForm } from '../../features/applications/components/ApplicationForm.jsx';
import { EventForm } from '../../features/events/components/EventForm.jsx';
import { EventTimeline } from '../../features/events/components/EventTimeline.jsx';
import { getErrorMessage } from '../../features/auth/auth.utils.js';

export default function ApplicationDetailPage() {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [applicationActionError, setApplicationActionError] = useState('');
  const [applicationError, setApplicationError] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [isApplicationDeleteConfirmOpen, setIsApplicationDeleteConfirmOpen] = useState(false);
  const [isApplicationDeleting, setIsApplicationDeleting] = useState(false);
  const [isApplicationEditFormOpen, setIsApplicationEditFormOpen] = useState(false);
  const [deletingEventId, setDeletingEventId] = useState('');
  const [editingEventId, setEditingEventId] = useState('');
  const [events, setEvents] = useState([]);
  const [eventsError, setEventsError] = useState('');
  const [isApplicationLoading, setIsApplicationLoading] = useState(true);
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [isEventsLoading, setIsEventsLoading] = useState(true);
  const [pendingDeleteEventId, setPendingDeleteEventId] = useState('');

  const loadApplication = useCallback(async () => {
    if (!applicationId) {
      setApplicationError('Application ID is missing.');
      setIsApplicationLoading(false);
      return;
    }

    setIsApplicationLoading(true);
    setApplicationError('');

    try {
      const response = await getApplication(applicationId);
      const loadedApplication = getApplicationFromResponse(response);

      if (!loadedApplication) {
        throw new Error('Application response did not include an application.');
      }

      setApplication(loadedApplication);
    } catch (error) {
      setApplication(null);
      setApplicationError(getErrorMessage(error, 'Unable to load application.'));
    } finally {
      setIsApplicationLoading(false);
    }
  }, [applicationId]);

  const loadEvents = useCallback(async () => {
    if (!applicationId) {
      setEventsError('Application ID is missing.');
      setIsEventsLoading(false);
      return;
    }

    setIsEventsLoading(true);
    setEventsError('');

    try {
      const response = await getApplicationEvents(applicationId);
      setEvents(getEventListFromResponse(response));
    } catch (error) {
      setEvents([]);
      setEventsError(getErrorMessage(error, 'Unable to load events.'));
    } finally {
      setIsEventsLoading(false);
    }
  }, [applicationId]);

  useEffect(() => {
    loadApplication();
    loadEvents();
  }, [loadApplication, loadEvents]);

  async function handleCreateEvent(payload) {
    const response = await createApplicationEvent(applicationId, payload);
    const createdEvent = getEventFromResponse(response);

    if (!createdEvent) {
      throw new Error('Create event response did not include an event.');
    }

    setIsCreateFormOpen(false);
    setDeleteError('');
    await loadEvents();

    return createdEvent;
  }

  async function handleUpdateApplication(payload) {
    const response = await updateApplication(applicationId, payload);
    const updatedApplication = getApplicationFromResponse(response);

    if (!updatedApplication) {
      throw new Error('Update application response did not include an application.');
    }

    setApplication(updatedApplication);
    setApplicationActionError('');
    setIsApplicationDeleteConfirmOpen(false);
    setIsApplicationEditFormOpen(false);

    return updatedApplication;
  }

  async function handleDeleteApplication() {
    if (!application) {
      return;
    }

    setIsApplicationDeleting(true);
    setApplicationActionError('');

    try {
      await deleteApplication(applicationId);
      navigate('/applications', { replace: true });
    } catch (error) {
      setApplicationActionError(getErrorMessage(error, 'Unable to delete application.'));
    } finally {
      setIsApplicationDeleting(false);
    }
  }

  async function handleUpdateEvent(event, payload) {
    const response = await updateApplicationEvent(applicationId, event._id, payload);
    const updatedEvent = getEventFromResponse(response);

    if (!updatedEvent) {
      throw new Error('Update event response did not include an event.');
    }

    setEditingEventId('');
    setDeleteError('');
    await loadEvents();

    return updatedEvent;
  }

  async function handleDeleteEvent(event) {
    setDeletingEventId(event._id);
    setDeleteError('');

    try {
      await deleteApplicationEvent(applicationId, event._id);
      setPendingDeleteEventId('');
      setEvents((currentEvents) => currentEvents.filter((currentEvent) => currentEvent._id !== event._id));
    } catch (error) {
      setDeleteError(getErrorMessage(error, 'Unable to delete event.'));
    } finally {
      setDeletingEventId('');
    }
  }

  const isPageLoading = isApplicationLoading && !application;

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
            {application ? `${application.company} - ${application.role}` : 'Application detail'}
          </h2>
          <p className="page-muted">Review application metadata and manage recruitment timeline events.</p>
        </div>
      </div>

      {isPageLoading ? (
        <section className="applications-state" aria-live="polite">
          <p>Loading application...</p>
        </section>
      ) : null}

      {applicationError ? (
        <section className="applications-state applications-state-error" role="alert">
          <p>{applicationError}</p>
          <button type="button" onClick={loadApplication}>
            Retry
          </button>
        </section>
      ) : null}

      {application ? (
        <>
          <ApplicationOverview
            application={application}
            isConfirmingDelete={isApplicationDeleteConfirmOpen}
            isDeleting={isApplicationDeleting}
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
                application={application}
                mode="edit"
                onCancel={() => setIsApplicationEditFormOpen(false)}
                onSubmit={handleUpdateApplication}
              />
            </section>
          ) : null}
        </>
      ) : null}

      <section className="application-panel event-panel" aria-labelledby="event-timeline-title">
        <div className="event-panel-header">
          <div>
            <p className="app-eyebrow">Recruitment timeline</p>
            <h3 id="event-timeline-title">Events</h3>
            <p>Track interviews, calls, assessments, follow-ups, offers, notes, and outcomes.</p>
          </div>
          <button
            className="button-primary"
            disabled={!application || isEventsLoading}
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

        <EventTimeline
          deleteError={deleteError}
          deletingEventId={deletingEventId}
          editingEventId={editingEventId}
          events={events}
          isDeleteConfirmOpenFor={pendingDeleteEventId}
          isLoading={isEventsLoading}
          loadError={eventsError}
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
          onRetry={loadEvents}
          onUpdate={handleUpdateEvent}
        />
      </section>
    </section>
  );
}
