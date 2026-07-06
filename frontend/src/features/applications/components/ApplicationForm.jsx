import { useEffect, useState } from 'react';

import { APPLICATION_STATUS_OPTIONS } from '../../../constants/status.js';
import { getErrorDetails, getErrorMessage } from '../../auth/auth.utils.js';

const INITIAL_FORM_VALUES = {
  company: '',
  role: '',
  currentStatus: 'saved',
  jdUrl: '',
  source: '',
  notes: '',
  followUpAt: '',
};

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

function buildApplicationPayload(values, mode) {
  const payload = {
    company: values.company.trim(),
    role: values.role.trim(),
    currentStatus: values.currentStatus,
  };
  const followUpAt = values.followUpAt ? new Date(values.followUpAt).toISOString() : null;

  if (mode === 'edit') {
    return {
      ...payload,
      jdUrl: getOptionalString(values.jdUrl),
      source: getOptionalString(values.source),
      notes: getOptionalString(values.notes),
      followUpAt,
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

  return payload;
}

export function ApplicationForm({
  application,
  mode = 'create',
  onCancel,
  onCreated,
  onSubmit,
}) {
  const [formValues, setFormValues] = useState(() => getInitialFormValues(application));
  const [formError, setFormError] = useState('');
  const [formErrorDetails, setFormErrorDetails] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setFormValues(getInitialFormValues(application));
  }, [application]);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError('');
    setFormErrorDetails([]);

    if (!formValues.company.trim()) {
      setFormError('Company is required.');
      return;
    }

    if (!formValues.role.trim()) {
      setFormError('Role is required.');
      return;
    }

    setIsSubmitting(true);

    try {
      const saveApplication = onSubmit || onCreated;

      await saveApplication(buildApplicationPayload(formValues, mode));

      if (mode === 'create') {
        setFormValues(INITIAL_FORM_VALUES);
      }
    } catch (error) {
      setFormError(getErrorMessage(error, 'Unable to save application.'));
      setFormErrorDetails(getErrorDetails(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  const submitLabel = mode === 'edit' ? 'Save application' : 'Create application';

  return (
    <form className="application-form" noValidate onSubmit={handleSubmit}>
      <div className="application-form-grid">
        <label>
          Company
          <input
            disabled={isSubmitting}
            name="company"
            onChange={handleChange}
            placeholder="OpenAI"
            value={formValues.company}
          />
        </label>

        <label>
          Role
          <input
            disabled={isSubmitting}
            name="role"
            onChange={handleChange}
            placeholder="Frontend Intern"
            value={formValues.role}
          />
        </label>

        <label>
          Status
          <select
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
        </label>

        <label>
          Job URL
          <input
            disabled={isSubmitting}
            inputMode="url"
            name="jdUrl"
            onChange={handleChange}
            placeholder="https://example.com/job"
            value={formValues.jdUrl}
          />
        </label>

        <label>
          Source
          <input
            disabled={isSubmitting}
            name="source"
            onChange={handleChange}
            placeholder="LinkedIn"
            value={formValues.source}
          />
        </label>

        <label>
          Follow-up date
          <input
            disabled={isSubmitting}
            name="followUpAt"
            onChange={handleChange}
            type="datetime-local"
            value={formValues.followUpAt}
          />
        </label>
      </div>

      <label>
        Notes
        <textarea
          disabled={isSubmitting}
          name="notes"
          onChange={handleChange}
          placeholder="Anything worth remembering about this role"
          rows="4"
          value={formValues.notes}
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
