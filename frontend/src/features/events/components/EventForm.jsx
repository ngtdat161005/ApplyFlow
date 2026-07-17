import { useRef, useState } from 'react';

import {
  getErrorDetails,
  getErrorFieldErrors,
  getErrorMessage,
} from '../../auth/auth.utils.js';
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

const EVENT_FIELD_NAMES = [
  'type',
  'title',
  'occurredAt',
  'scheduledAt',
  'mode',
  'location',
  'meetingLink',
  'contactName',
  'contactPhone',
  'contactEmail',
  'note',
];

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
    return {
      error: 'Occurred date must be valid.',
      fieldErrors: {
        occurredAt: 'Occurred date must be valid.',
      },
    };
  }

  if (values.scheduledAt && !scheduledAt) {
    return {
      error: 'Scheduled date must be valid.',
      fieldErrors: {
        scheduledAt: 'Scheduled date must be valid.',
      },
    };
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
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [formErrorDetails, setFormErrorDetails] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitInFlightRef = useRef(false);

  function handleChange(changeEvent) {
    const { name, value } = changeEvent.target;

    setFormValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }));
    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      [name]: '',
    }));
  }

  async function handleSubmit(submitEvent) {
    submitEvent.preventDefault();

    if (submitInFlightRef.current) {
      return;
    }

    setFieldErrors({});
    setFormError('');
    setFormErrorDetails([]);

    if (!formValues.title.trim()) {
      setFieldErrors({
        title: 'Title is required.',
      });
      setFormError('Title is required.');
      return;
    }

    const { error, fieldErrors: payloadFieldErrors = {}, payload } = buildEventPayload(
      formValues,
      mode,
    );

    if (error) {
      setFieldErrors(payloadFieldErrors);
      setFormError(error);
      return;
    }

    submitInFlightRef.current = true;
    setIsSubmitting(true);

    try {
      await onSubmit(payload);

      if (mode === 'create') {
        setFormValues(EMPTY_VALUES);
      }
    } catch (submitError) {
      const nextFieldErrors = getErrorFieldErrors(submitError);

      setFieldErrors(nextFieldErrors);
      setFormError(getErrorMessage(submitError, 'Unable to save event.'));
      setFormErrorDetails(
        getErrorDetails(submitError, { excludeFields: EVENT_FIELD_NAMES }),
      );
    } finally {
      submitInFlightRef.current = false;
      setIsSubmitting(false);
    }
  }

  const submitLabel = mode === 'edit' ? 'Save event' : 'Create event';
  const submittingLabel = mode === 'edit' ? 'Saving...' : 'Creating...';

  return (
    <form aria-busy={isSubmitting} className="event-form" noValidate onSubmit={handleSubmit}>
      <div className="event-form-grid">
        <label>
          Type (required)
          <select
            aria-invalid={Boolean(fieldErrors.type)}
            disabled={isSubmitting}
            name="type"
            onChange={handleChange}
            required
            value={formValues.type}
          >
            {EVENT_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {fieldErrors.type ? <span className="field-error">{fieldErrors.type}</span> : null}
        </label>

        <label>
          Title (required)
          <input
            aria-invalid={Boolean(fieldErrors.title)}
            disabled={isSubmitting}
            name="title"
            onChange={handleChange}
            placeholder="Technical Interview"
            required
            value={formValues.title}
          />
          {fieldErrors.title ? <span className="field-error">{fieldErrors.title}</span> : null}
        </label>

        <label>
          Mode
          <select
            aria-invalid={Boolean(fieldErrors.mode)}
            disabled={isSubmitting}
            name="mode"
            onChange={handleChange}
            value={formValues.mode}
          >
            <option value="">No mode</option>
            {EVENT_MODE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {fieldErrors.mode ? <span className="field-error">{fieldErrors.mode}</span> : null}
        </label>

        <label>
          Occurred at
          <input
            aria-invalid={Boolean(fieldErrors.occurredAt)}
            disabled={isSubmitting}
            name="occurredAt"
            onChange={handleChange}
            type="datetime-local"
            value={formValues.occurredAt}
          />
          {fieldErrors.occurredAt ? (
            <span className="field-error">{fieldErrors.occurredAt}</span>
          ) : null}
        </label>

        <label>
          Scheduled at
          <input
            aria-invalid={Boolean(fieldErrors.scheduledAt)}
            disabled={isSubmitting}
            name="scheduledAt"
            onChange={handleChange}
            type="datetime-local"
            value={formValues.scheduledAt}
          />
          {fieldErrors.scheduledAt ? (
            <span className="field-error">{fieldErrors.scheduledAt}</span>
          ) : null}
        </label>

        <label>
          Meeting link
          <input
            aria-invalid={Boolean(fieldErrors.meetingLink)}
            disabled={isSubmitting}
            name="meetingLink"
            onChange={handleChange}
            placeholder="https://meet.google.com/example"
            type="url"
            value={formValues.meetingLink}
          />
          {fieldErrors.meetingLink ? (
            <span className="field-error">{fieldErrors.meetingLink}</span>
          ) : null}
        </label>

        <label>
          Location
          <input
            aria-invalid={Boolean(fieldErrors.location)}
            disabled={isSubmitting}
            name="location"
            onChange={handleChange}
            placeholder="Office, campus, or online"
            value={formValues.location}
          />
          {fieldErrors.location ? <span className="field-error">{fieldErrors.location}</span> : null}
        </label>

        <label>
          Contact name
          <input
            aria-invalid={Boolean(fieldErrors.contactName)}
            disabled={isSubmitting}
            name="contactName"
            onChange={handleChange}
            placeholder="HR Nguyen"
            value={formValues.contactName}
          />
          {fieldErrors.contactName ? (
            <span className="field-error">{fieldErrors.contactName}</span>
          ) : null}
        </label>

        <label>
          Contact phone
          <input
            aria-invalid={Boolean(fieldErrors.contactPhone)}
            disabled={isSubmitting}
            name="contactPhone"
            onChange={handleChange}
            placeholder="+84..."
            value={formValues.contactPhone}
          />
          {fieldErrors.contactPhone ? (
            <span className="field-error">{fieldErrors.contactPhone}</span>
          ) : null}
        </label>

        <label>
          Contact email
          <input
            aria-invalid={Boolean(fieldErrors.contactEmail)}
            disabled={isSubmitting}
            name="contactEmail"
            onChange={handleChange}
            placeholder="hr@example.com"
            type="email"
            value={formValues.contactEmail}
          />
          {fieldErrors.contactEmail ? (
            <span className="field-error">{fieldErrors.contactEmail}</span>
          ) : null}
        </label>
      </div>

      <label>
        Note
        <textarea
          aria-invalid={Boolean(fieldErrors.note)}
          disabled={isSubmitting}
          name="note"
          onChange={handleChange}
          placeholder="Preparation notes or outcomes"
          rows="4"
          value={formValues.note}
        />
        {fieldErrors.note ? <span className="field-error">{fieldErrors.note}</span> : null}
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
          {isSubmitting ? submittingLabel : submitLabel}
        </button>
        <button disabled={isSubmitting} type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
