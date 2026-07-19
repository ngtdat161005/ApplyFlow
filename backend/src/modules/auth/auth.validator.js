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

export function validateForgotPasswordPayload(payload) {
  const email = normalizeEmail(payload.email);
  const errors = {};
  const unknownFields = Object.keys(payload).filter((fieldName) => fieldName !== "email");

  if (unknownFields.length > 0) {
    errors.body = `Unsupported field(s): ${unknownFields.join(", ")}`;
  }

  if (!email) {
    errors.email = "Email is required";
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = "Email must be a valid email address";
  }

  return {
    value: { email },
    errors,
  };
}

export function validateResetPasswordPayload(payload) {
  const token = typeof payload.token === "string" ? payload.token : "";
  const newPassword = typeof payload.newPassword === "string" ? payload.newPassword : "";
  const errors = {};
  const allowedFields = new Set(["token", "newPassword"]);
  const unknownFields = Object.keys(payload).filter((fieldName) => !allowedFields.has(fieldName));

  if (unknownFields.length > 0) {
    errors.body = `Unsupported field(s): ${unknownFields.join(", ")}`;
  }

  if (!newPassword) {
    errors.newPassword = "Password is required";
  } else if (newPassword.length < 8) {
    errors.newPassword = "Password must be at least 8 characters";
  }

  return {
    value: { token, newPassword },
    errors,
  };
}
