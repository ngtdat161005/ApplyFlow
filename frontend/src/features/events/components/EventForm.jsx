import { useState } from 'react';

import { getErrorDetails, getErrorMessage } from '../../auth/auth.utils.js';
import { EVENT_MODE_OPTIONS, EVENT_TYPE_OPTIONS } from '../event.constants.js';
import { toDateTimeLocalValue, toIsoDateTime } from '../event.utils.js';

const EMPTY_VALUES = {
  type: 'note',
  title: '',
  occurredAt: '',
  scheduledAt: '',
  mode: '',
  location: '',
  meetingLink: '',
  contactName: '',
  contactPhone: '',
  contactEmail: '',
  note: '',
};

function getInitialValues(event) {
  if (!event) {
    return EMPTY_VALUES;
  }

  return {
    type: event.type || 'note',
    title: event.title || '',
    occurredAt: toDateTimeLocalValue(event.occurredAt),
    scheduledAt: toDateTimeLocalValue(event.scheduledAt),
    mode: event.mode || '',
    location: event.location || '',
    meetingLink: event.meetingLink || '',
    contactName: event.contactName || '',
    contactPhone: event.contactPhone || '',
    contactEmail: event.contactEmail || '',
    note: event.note || '',
  };
}

function getOptionalString(value) {
  const normalizedValue = value.trim();

  return normalizedValue || null;
}

function buildEventPayload(values, mode) {
  const occurredAt = toIsoDateTime(values.occurredAt);
  const scheduledAt = toIsoDateTime(values.scheduledAt);

  if (values.occurredAt && !occurredAt) {
    return { error: 'Occurred date must be valid.' };
  }

  if (values.scheduledAt && !scheduledAt) {
    return { error: 'Scheduled date must be valid.' };
  }

  const payload = {
    type: values.type,
    title: values.title.trim(),
  };

  if (mode === 'edit') {
    return {
      payload: {
        ...payload,
        occurredAt,
        scheduledAt,
        mode: values.mode || null,
        location: getOptionalString(values.location),
        meetingLink: getOptionalString(values.meetingLink),
        contactName: getOptionalString(values.contactName),
        contactPhone: getOptionalString(values.contactPhone),
        contactEmail: getOptionalString(values.contactEmail),
        note: getOptionalString(values.note),
      },
    };
  }

  if (occurredAt) {
    payload.occurredAt = occurredAt;
  }

  if (scheduledAt) {
    payload.scheduledAt = scheduledAt;
  }

  if (values.mode) {
    payload.mode = values.mode;
  }

  for (const fieldName of ['location', 'meetingLink', 'contactName', 'contactPhone', 'contactEmail', 'note']) {
    const optionalValue = getOptionalString(values[fieldName]);

    if (optionalValue) {
      payload[fieldName] = optionalValue;
    }
  }

  return { payload };
}

export function EventForm({ event, mode = 'create', onCancel, onSubmit }) {
  const [formValues, setFormValues] = useState(() => getInitialValues(event));
  const [formError, setFormError] = useState('');
  const [formErrorDetails, setFormErrorDetails] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(changeEvent) {
    const { name, value } = changeEvent.target;

    setFormValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }));
  }

  async function handleSubmit(submitEvent) {
    submitEvent.preventDefault();
    setFormError('');
    setFormErrorDetails([]);

    if (!formValues.title.trim()) {
      setFormError('Title is required.');
      return;
    }

    const { error, payload } = buildEventPayload(formValues, mode);

    if (error) {
      setFormError(error);
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(payload);

      if (mode === 'create') {
        setFormValues(EMPTY_VALUES);
      }
    } catch (submitError) {
      setFormError(getErrorMessage(submitError, 'Unable to save event.'));
      setFormErrorDetails(getErrorDetails(submitError));
    } finally {
      setIsSubmitting(false);
    }
  }

  const submitLabel = mode === 'edit' ? 'Save event' : 'Create event';

  return (
    <form className="event-form" noValidate onSubmit={handleSubmit}>
      <div className="event-form-grid">
        <label>
          Type
          <select disabled={isSubmitting} name="type" onChange={handleChange} value={formValues.type}>
            {EVENT_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Title
          <input
            disabled={isSubmitting}
            name="title"
            onChange={handleChange}
            placeholder="Technical Interview"
            value={formValues.title}
          />
        </label>

        <label>
          Mode
          <select disabled={isSubmitting} name="mode" onChange={handleChange} value={formValues.mode}>
            <option value="">No mode</option>
            {EVENT_MODE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Occurred at
          <input
            disabled={isSubmitting}
            name="occurredAt"
            onChange={handleChange}
            type="datetime-local"
            value={formValues.occurredAt}
          />
        </label>

        <label>
          Scheduled at
          <input
            disabled={isSubmitting}
            name="scheduledAt"
            onChange={handleChange}
            type="datetime-local"
            value={formValues.scheduledAt}
          />
        </label>

        <label>
          Meeting link
          <input
            disabled={isSubmitting}
            inputMode="url"
            name="meetingLink"
            onChange={handleChange}
            placeholder="https://meet.google.com/example"
            value={formValues.meetingLink}
          />
        </label>

        <label>
          Location
          <input
            disabled={isSubmitting}
            name="location"
            onChange={handleChange}
            placeholder="Office, campus, or online"
            value={formValues.location}
          />
        </label>

        <label>
          Contact name
          <input
            disabled={isSubmitting}
            name="contactName"
            onChange={handleChange}
            placeholder="HR Nguyen"
            value={formValues.contactName}
          />
        </label>

        <label>
          Contact phone
          <input
            disabled={isSubmitting}
            name="contactPhone"
            onChange={handleChange}
            placeholder="+84..."
            value={formValues.contactPhone}
          />
        </label>

        <label>
          Contact email
          <input
            disabled={isSubmitting}
            inputMode="email"
            name="contactEmail"
            onChange={handleChange}
            placeholder="hr@example.com"
            value={formValues.contactEmail}
          />
        </label>
      </div>

      <label>
        Note
        <textarea
          disabled={isSubmitting}
          name="note"
          onChange={handleChange}
          placeholder="Preparation notes or outcomes"
          rows="4"
          value={formValues.note}
        />
      </label>

      {formError ? (
        <div className="auth-alert" role="alert">
          <p>{formError}</p>
          {formErrorDetails.length > 0 ? (
            <ul>
              {formErrorDetails.map((detail) => (
                <li key={detail}>{detail}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      <div className="application-form-actions">
        <button disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Saving...' : submitLabel}
        </button>
        <button disabled={isSubmitting} type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
