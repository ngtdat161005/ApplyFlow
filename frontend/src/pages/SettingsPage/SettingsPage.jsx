import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { deleteCurrentUser } from '../../api/user.api.js';
import { useAuth } from '../../features/auth/auth.store.js';
import { getErrorCode } from '../../features/auth/auth.utils.js';

export default function SettingsPage() {
  const { completeAccountDeletion } = useAuth();
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dialogRef = useRef(null);
  const openButtonRef = useRef(null);
  const passwordRef = useRef(null);
  const submitInFlightRef = useRef(false);
  const restoreFocusRef = useRef(false);

  useEffect(() => {
    if (!isDialogOpen) {
      if (restoreFocusRef.current) {
        restoreFocusRef.current = false;
        openButtonRef.current?.focus();
      }

      return undefined;
    }

    const dialog = dialogRef.current;

    if (dialog && !dialog.open) {
      dialog.showModal();
      passwordRef.current?.focus();
    }

    return () => {
      if (dialog?.open) {
        dialog.close();
      }
    };
  }, [isDialogOpen]);

  function openDialog() {
    setPassword('');
    setPasswordError('');
    setFormError('');
    setIsDialogOpen(true);
  }

  function closeDialog() {
    if (submitInFlightRef.current) {
      return;
    }

    setPassword('');
    setPasswordError('');
    setFormError('');
    restoreFocusRef.current = true;
    setIsDialogOpen(false);
  }

  function handleCancel(event) {
    event.preventDefault();
    closeDialog();
  }

  function handleDialogKeyDown(event) {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeDialog();
    }
  }

  function handlePasswordChange(event) {
    setPassword(event.target.value);
    setPasswordError('');
    setFormError('');
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (submitInFlightRef.current) {
      return;
    }

    if (!password) {
      setPasswordError('Password is required.');
      passwordRef.current?.focus();
      return;
    }

    submitInFlightRef.current = true;
    setPasswordError('');
    setFormError('');
    setIsSubmitting(true);

    try {
      await deleteCurrentUser({ password });
      setPassword('');
      completeAccountDeletion();
      navigate('/login', { replace: true });
    } catch (error) {
      const errorCode = getErrorCode(error);

      if (errorCode === 'INVALID_PASSWORD') {
        setPasswordError('Current password is incorrect.');
        passwordRef.current?.focus();
      } else if (errorCode === 'DELETE_UNAVAILABLE' || error.status === 503) {
        setFormError('Account deletion is temporarily unavailable. Please try again later.');
      } else {
        setFormError('We could not delete your account. Please try again.');
      }
    } finally {
      submitInFlightRef.current = false;
      setIsSubmitting(false);
    }
  }

  return (
    <section
      className="page-section settings-page page-mount"
      aria-labelledby="settings-title"
    >
      <div className="page-header">
        <p className="app-eyebrow">Account</p>
        <h2 id="settings-title">Settings</h2>
        <p className="page-muted">Manage permanent account actions.</p>
      </div>

      <section className="danger-zone" aria-labelledby="danger-zone-title">
        <div className="danger-zone-content">
          <h3 id="danger-zone-title">Delete account</h3>
          <p>
            Permanently delete your account, applications, and application events. This action
            cannot be undone.
          </p>
        </div>
        <button
          className="danger-button"
          ref={openButtonRef}
          type="button"
          onClick={openDialog}
        >
          Delete my account
        </button>
      </section>

      {isDialogOpen ? (
        <dialog
          aria-describedby="delete-account-description"
          aria-labelledby="delete-account-title"
          className="account-delete-dialog"
          ref={dialogRef}
          onCancel={handleCancel}
          onKeyDown={handleDialogKeyDown}
        >
          <form className="account-delete-form" onSubmit={handleSubmit}>
            <div className="account-delete-dialog-header">
              <h3 id="delete-account-title">Permanently delete account?</h3>
              <p id="delete-account-description">
                Enter your current password to delete your account, applications, and events.
              </p>
            </div>

            {formError ? (
              <div className="auth-alert" role="alert">
                <p>{formError}</p>
              </div>
            ) : null}

            <label>
              Current password
              <input
                autoComplete="current-password"
                aria-describedby={passwordError ? 'delete-account-password-error' : undefined}
                aria-invalid={Boolean(passwordError)}
                disabled={isSubmitting}
                name="password"
                onChange={handlePasswordChange}
                ref={passwordRef}
                type="password"
                value={password}
              />
              {passwordError ? (
                <span className="field-error" id="delete-account-password-error" role="alert">
                  {passwordError}
                </span>
              ) : null}
            </label>

            <div className="account-delete-actions">
              <button disabled={isSubmitting} type="button" onClick={closeDialog}>
                Cancel
              </button>
              <button className="danger-button" disabled={isSubmitting} type="submit">
                <span aria-live="polite">
                  {isSubmitting ? 'Deleting...' : 'Delete account permanently'}
                </span>
              </button>
            </div>
          </form>
        </dialog>
      ) : null}
    </section>
  );
}
