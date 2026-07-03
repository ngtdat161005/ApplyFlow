const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeEmail(value) {
  return normalizeString(value).toLowerCase();
}

export function validateRegisterPayload(payload) {
  const displayName = normalizeString(payload.displayName);
  const email = normalizeEmail(payload.email);
  const password = typeof payload.password === "string" ? payload.password : "";
  const errors = {};

  if (!displayName) {
    errors.displayName = "Display name is required";
  }

  if (!email) {
    errors.email = "Email is required";
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = "Email must be a valid email address";
  }

  if (!password) {
    errors.password = "Password is required";
  } else if (password.length < 8) {
    errors.password = "Password must be at least 8 characters";
  }

  return {
    value: {
      displayName,
      email,
      password,
    },
    errors,
  };
}

export function validateLoginPayload(payload) {
  const email = normalizeEmail(payload.email);
  const password = typeof payload.password === "string" ? payload.password : "";
  const errors = {};

  if (!email) {
    errors.email = "Email is required";
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = "Email must be a valid email address";
  }

  if (!password) {
    errors.password = "Password is required";
  }

  return {
    value: {
      email,
      password,
    },
    errors,
  };
}
