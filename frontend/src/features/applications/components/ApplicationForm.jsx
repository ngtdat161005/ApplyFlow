import { useEffect, useState } from 'react';

import { APPLICATION_STATUS_OPTIONS } from '../../../constants/status.js';
import {
  getErrorDetails,
  getErrorFieldErrors,
  getErrorMessage,
} from '../../auth/auth.utils.js';

const INITIAL_FORM_VALUES = {
  company: '',
  role: '',
  currentStatus: 'saved',
  jdUrl: '',
  source: '',
  notes: '',
  followUpAt: '',
};

const APPLICATION_FIELD_NAMES = [
  'company',
  'role',
  'currentStatus',
  'jdUrl',
  'source',
  'notes',
  'followUpAt',
];

function toDateTimeLocalValue(value) {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const timezoneOffset = date.getTimezoneOffset() * 60000;
  const localDate = new Date(date.getTime() - timezoneOffset);

  return localDate.toISOString().slice(0, 16);
}

function getInitialFormValues(application) {
  if (!application) {
    return INITIAL_FORM_VALUES;
  }

  return {
    company: application.company || '',
    role: application.role || '',
    currentStatus: application.currentStatus || 'saved',
    jdUrl: application.jdUrl || '',
    source: application.source || '',
    notes: application.notes || '',
    followUpAt: toDateTimeLocalValue(application.followUpAt),
  };
}

function getOptionalString(value) {
  const normalizedValue = value.trim();

  return normalizedValue || null;
}

function toIsoDateTime(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

function buildApplicationPayload(values, mode) {
  const followUpAt = toIsoDateTime(values.followUpAt);

  if (values.followUpAt && !followUpAt) {
    return {
      error: 'Follow-up date must be valid.',
      fieldErrors: {
        followUpAt: 'Follow-up date must be valid.',
      },
    };
  }

  const payload = {
    company: values.company.trim(),
    role: values.role.trim(),
    currentStatus: values.currentStatus,
  };

  if (mode === 'edit') {
    return {
      payload: {
        ...payload,
        jdUrl: getOptionalString(values.jdUrl),
        source: getOptionalString(values.source),
        notes: getOptionalString(values.notes),
        followUpAt,
      },
    };
  }

  if (values.jdUrl.trim()) {
    payload.jdUrl = values.jdUrl.trim();
  }

  if (values.source.trim()) {
    payload.source = values.source.trim();
  }

  if (values.notes.trim()) {
    payload.notes = values.notes.trim();
  }

  if (values.followUpAt) {
    payload.followUpAt = followUpAt;
  }

  return { payload };
}

export function ApplicationForm({
  application,
  mode = 'create',
  onCancel,
  onCreated,
  onSubmit,
}) {
  const [formValues, setFormValues] = useState(() => getInitialFormValues(application));
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [formErrorDetails, setFormErrorDetails] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setFormValues(getInitialFormValues(application));
    setFieldErrors({});
    setFormError('');
    setFormErrorDetails([]);
  }, [application]);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }));
    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      [name]: '',
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFieldErrors({});
    setFormError('');
    setFormErrorDetails([]);

    const validationErrors = {};

    if (!formValues.company.trim()) {
      validationErrors.company = 'Company is required.';
    }

    if (!formValues.role.trim()) {
      validationErrors.role = 'Role is required.';
    }

    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setFormError('Please fix the highlighted fields.');
      return;
    }

    const { error, fieldErrors: payloadFieldErrors = {}, payload } = buildApplicationPayload(
      formValues,
      mode,
    );

    if (error) {
      setFieldErrors(payloadFieldErrors);
      setFormError(error);
      return;
    }

    setIsSubmitting(true);

    try {
      const saveApplication = onSubmit || onCreated;

      await saveApplication(payload);

      if (mode === 'create') {
        setFormValues(INITIAL_FORM_VALUES);
      }
    } catch (error) {
      const nextFieldErrors = getErrorFieldErrors(error);

      setFieldErrors(nextFieldErrors);
      setFormError(getErrorMessage(error, 'Unable to save application.'));
      setFormErrorDetails(
        getErrorDetails(error, { excludeFields: APPLICATION_FIELD_NAMES }),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const submitLabel = mode === 'edit' ? 'Save application' : 'Create application';
  const submittingLabel = mode === 'edit' ? 'Saving...' : 'Creating...';

  return (
    <form className="application-form" noValidate onSubmit={handleSubmit}>
      <div className="application-form-grid">
        <label>
          Company
          <input
            aria-invalid={Boolean(fieldErrors.company)}
            disabled={isSubmitting}
            name="company"
            onChange={handleChange}
            placeholder="OpenAI"
            value={formValues.company}
          />
          {fieldErrors.company ? <span className="field-error">{fieldErrors.company}</span> : null}
        </label>

        <label>
          Role
          <input
            aria-invalid={Boolean(fieldErrors.role)}
            disabled={isSubmitting}
            name="role"
            onChange={handleChange}
            placeholder="Frontend Intern"
            value={formValues.role}
          />
          {fieldErrors.role ? <span className="field-error">{fieldErrors.role}</span> : null}
        </label>

        <label>
          Status
          <select
            aria-invalid={Boolean(fieldErrors.currentStatus)}
            disabled={isSubmitting}
            name="currentStatus"
            onChange={handleChange}
            value={formValues.currentStatus}
          >
            {APPLICATION_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {fieldErrors.currentStatus ? (
            <span className="field-error">{fieldErrors.currentStatus}</span>
          ) : null}
        </label>

        <label>
          Job URL
          <input
            aria-invalid={Boolean(fieldErrors.jdUrl)}
            disabled={isSubmitting}
            inputMode="url"
            name="jdUrl"
            onChange={handleChange}
            placeholder="https://example.com/job"
            value={formValues.jdUrl}
          />
          {fieldErrors.jdUrl ? <span className="field-error">{fieldErrors.jdUrl}</span> : null}
        </label>

        <label>
          Source
          <input
            aria-invalid={Boolean(fieldErrors.source)}
            disabled={isSubmitting}
            name="source"
            onChange={handleChange}
            placeholder="LinkedIn"
            value={formValues.source}
          />
          {fieldErrors.source ? <span className="field-error">{fieldErrors.source}</span> : null}
        </label>

        <label>
          Follow-up date
          <input
            aria-invalid={Boolean(fieldErrors.followUpAt)}
            disabled={isSubmitting}
            name="followUpAt"
            onChange={handleChange}
            type="datetime-local"
            value={formValues.followUpAt}
          />
          {fieldErrors.followUpAt ? (
            <span className="field-error">{fieldErrors.followUpAt}</span>
          ) : null}
        </label>
      </div>

      <label>
        Notes
        <textarea
          aria-invalid={Boolean(fieldErrors.notes)}
          disabled={isSubmitting}
          name="notes"
          onChange={handleChange}
          placeholder="Anything worth remembering about this role"
          rows="4"
          value={formValues.notes}
        />
        {fieldErrors.notes ? <span className="field-error">{fieldErrors.notes}</span> : null}
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
