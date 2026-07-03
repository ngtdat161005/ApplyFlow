import { useState } from 'react';

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

function buildCreatePayload(values) {
  const payload = {
    company: values.company.trim(),
    role: values.role.trim(),
    currentStatus: values.currentStatus,
  };

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
    payload.followUpAt = new Date(values.followUpAt).toISOString();
  }

  return payload;
}

export function ApplicationForm({ onCancel, onCreated }) {
  const [formValues, setFormValues] = useState(INITIAL_FORM_VALUES);
  const [formError, setFormError] = useState('');
  const [formErrorDetails, setFormErrorDetails] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      await onCreated(buildCreatePayload(formValues));
      setFormValues(INITIAL_FORM_VALUES);
    } catch (error) {
      setFormError(getErrorMessage(error, 'Unable to create application.'));
      setFormErrorDetails(getErrorDetails(error));
    } finally {
      setIsSubmitting(false);
    }
  }

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
          {isSubmitting ? 'Creating...' : 'Create application'}
        </button>
        <button disabled={isSubmitting} type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
