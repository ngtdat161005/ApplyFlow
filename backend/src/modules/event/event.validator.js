import { EVENT_MODES, EVENT_TYPES } from "../../config/constants.js";

const CREATE_EVENT_FIELDS = [
  "type",
  "title",
  "occurredAt",
  "scheduledAt",
  "mode",
  "location",
  "meetingLink",
  "contactName",
  "contactPhone",
  "contactEmail",
  "note",
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OBJECT_ID_PATTERN = /^[a-f\d]{24}$/i;

function normalizeString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeOptionalString(value) {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.trim();

  return normalizedValue || null;
}

function normalizeOptionalEmail(value) {
  return normalizeOptionalString(value)?.toLowerCase() ?? null;
}

function parseOptionalDate(value) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  if (typeof value !== "string") {
    return null;
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate;
}

function validateOptionalString(payload, fieldName, errors) {
  if (
    Object.prototype.hasOwnProperty.call(payload, fieldName) &&
    payload[fieldName] !== null &&
    typeof payload[fieldName] !== "string"
  ) {
    errors[fieldName] = `${fieldName} must be a string or null`;
  }
}

function validateOptionalDate(payload, fieldName, errors) {
  const parsedDate = parseOptionalDate(payload[fieldName]);

  if (
    Object.prototype.hasOwnProperty.call(payload, fieldName) &&
    payload[fieldName] !== null &&
    payload[fieldName] !== "" &&
    !parsedDate
  ) {
    errors[fieldName] = `${fieldName} must be a valid date or null`;
  }

  return parsedDate;
}

export function validateApplicationEventParams(params) {
  const applicationId = normalizeString(params.applicationId);
  const errors = {};

  if (!applicationId) {
    errors.applicationId = "Application ID is required";
  } else if (!OBJECT_ID_PATTERN.test(applicationId)) {
    errors.applicationId = "Application ID must be a valid ObjectId";
  }

  return {
    value: {
      applicationId,
    },
    errors,
  };
}

export function validateCreateEventPayload(payload) {
  const errors = {};
  const unknownFields = Object.keys(payload).filter(
    (fieldName) => !CREATE_EVENT_FIELDS.includes(fieldName),
  );
  const type = normalizeString(payload.type);
  const title = normalizeString(payload.title);
  const occurredAt = validateOptionalDate(payload, "occurredAt", errors);
  const scheduledAt = validateOptionalDate(payload, "scheduledAt", errors);
  const mode = normalizeOptionalString(payload.mode);
  const contactEmail = normalizeOptionalEmail(payload.contactEmail);

  if (unknownFields.length > 0) {
    errors.body = `Unsupported field(s): ${unknownFields.join(", ")}`;
  }

  if (!type) {
    errors.type = "Event type is required";
  } else if (!EVENT_TYPES.includes(type)) {
    errors.type = "Event type is invalid";
  }

  if (!title) {
    errors.title = "Title is required";
  }

  if (payload.mode !== undefined && payload.mode !== null && payload.mode !== "") {
    if (typeof payload.mode !== "string") {
      errors.mode = "Mode must be online, offline, phone, or null";
    } else if (!EVENT_MODES.includes(mode)) {
      errors.mode = "Mode must be online, offline, phone, or null";
    }
  }

  validateOptionalString(payload, "location", errors);
  validateOptionalString(payload, "meetingLink", errors);
  validateOptionalString(payload, "contactName", errors);
  validateOptionalString(payload, "contactPhone", errors);
  validateOptionalString(payload, "note", errors);

  if (payload.contactEmail !== undefined && payload.contactEmail !== null) {
    if (typeof payload.contactEmail !== "string") {
      errors.contactEmail = "Contact email must be a valid email address or null";
    } else if (contactEmail && !EMAIL_PATTERN.test(contactEmail)) {
      errors.contactEmail = "Contact email must be a valid email address";
    }
  }

  return {
    value: {
      type,
      title,
      occurredAt,
      scheduledAt,
      mode,
      location: normalizeOptionalString(payload.location),
      meetingLink: normalizeOptionalString(payload.meetingLink),
      contactName: normalizeOptionalString(payload.contactName),
      contactPhone: normalizeOptionalString(payload.contactPhone),
      contactEmail,
      note: normalizeOptionalString(payload.note),
    },
    errors,
  };
}
