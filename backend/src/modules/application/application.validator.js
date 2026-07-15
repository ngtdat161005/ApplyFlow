import {
  APPLICATION_SORT_FIELDS,
  APPLICATION_STATUSES,
  SORT_ORDERS,
} from "../../config/constants.js";

const LIST_QUERY_FIELDS = ["search", "status", "sortBy", "sortOrder"];
const UPDATE_FIELDS = ["company", "role", "jdUrl", "source", "notes", "currentStatus", "followUpAt"];

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

function isValidUrl(value) {
  try {
    const url = new URL(value);

    return Boolean(url.protocol && url.hostname);
  } catch {
    return false;
  }
}

function getSingleQueryValue(query, fieldName, errors) {
  const value = query[fieldName];

  if (Array.isArray(value)) {
    errors[fieldName] = `${fieldName} must be a single value`;
    return undefined;
  }

  return value;
}

export function validateCreateApplicationPayload(payload) {
  const company = normalizeString(payload.company);
  const role = normalizeString(payload.role);
  const currentStatus = normalizeString(payload.currentStatus);
  const jdUrl = normalizeOptionalString(payload.jdUrl);
  const source = normalizeOptionalString(payload.source);
  const notes = normalizeOptionalString(payload.notes);
  const followUpAt = parseOptionalDate(payload.followUpAt);
  const errors = {};

  if (!company) {
    errors.company = "Company is required";
  }

  if (!role) {
    errors.role = "Role is required";
  }

  if (!currentStatus) {
    errors.currentStatus = "Current status is required";
  } else if (!APPLICATION_STATUSES.includes(currentStatus)) {
    errors.currentStatus = "Current status is invalid";
  }

  if (payload.jdUrl !== undefined && payload.jdUrl !== null) {
    if (typeof payload.jdUrl !== "string") {
      errors.jdUrl = "Job description URL must be a string";
    } else if (jdUrl && !isValidUrl(jdUrl)) {
      errors.jdUrl = "Job description URL must be a valid URL";
    }
  }

  if (
    payload.source !== undefined &&
    payload.source !== null &&
    typeof payload.source !== "string"
  ) {
    errors.source = "Source must be a string or null";
  }

  if (payload.notes !== undefined && payload.notes !== null && typeof payload.notes !== "string") {
    errors.notes = "Notes must be a string or null";
  }

  if (payload.followUpAt !== undefined && payload.followUpAt !== null && payload.followUpAt !== "") {
    if (!followUpAt) {
      errors.followUpAt = "Follow-up date must be a valid date";
    }
  }

  return {
    value: {
      company,
      role,
      jdUrl,
      source,
      notes,
      currentStatus,
      followUpAt,
    },
    errors,
  };
}

export function validateListApplicationsQuery(query) {
  const errors = {};
  const unknownFields = Object.keys(query).filter((fieldName) => !LIST_QUERY_FIELDS.includes(fieldName));

  if (unknownFields.length > 0) {
    errors.query = `Unsupported query parameter(s): ${unknownFields.join(", ")}`;
  }

  const search = normalizeString(getSingleQueryValue(query, "search", errors));
  const status = normalizeString(getSingleQueryValue(query, "status", errors));
  const sortBy = normalizeString(getSingleQueryValue(query, "sortBy", errors)) || "updatedAt";
  const sortOrder = normalizeString(getSingleQueryValue(query, "sortOrder", errors)) || "desc";

  if (status && !APPLICATION_STATUSES.includes(status)) {
    errors.status = "Status is invalid";
  }

  if (!APPLICATION_SORT_FIELDS.includes(sortBy)) {
    errors.sortBy = "Sort field must be createdAt, updatedAt, or followUpAt";
  }

  if (!SORT_ORDERS.includes(sortOrder)) {
    errors.sortOrder = "Sort order must be asc or desc";
  }

  return {
    value: {
      search,
      status: status || null,
      sortBy,
      sortOrder,
    },
    errors,
  };
}

export function validateApplicationIdParams(params) {
  const applicationId = normalizeString(params.applicationId);
  const errors = {};

  if (!applicationId) {
    errors.applicationId = "Application ID is required";
  } else if (!/^[a-f\d]{24}$/i.test(applicationId)) {
    errors.applicationId = "Application ID must be a valid ObjectId";
  }

  return {
    value: {
      applicationId,
    },
    errors,
  };
}

export function validateUpdateApplicationPayload(payload) {
  const errors = {};
  const updates = {};
  const unknownFields = Object.keys(payload).filter((fieldName) => !UPDATE_FIELDS.includes(fieldName));

  if (unknownFields.length > 0) {
    errors.body = `Unsupported field(s): ${unknownFields.join(", ")}`;
  }

  if (Object.prototype.hasOwnProperty.call(payload, "company")) {
    const company = normalizeString(payload.company);

    if (!company) {
      errors.company = "Company must be a non-empty string";
    } else {
      updates.company = company;
    }
  }

  if (Object.prototype.hasOwnProperty.call(payload, "role")) {
    const role = normalizeString(payload.role);

    if (!role) {
      errors.role = "Role must be a non-empty string";
    } else {
      updates.role = role;
    }
  }

  if (Object.prototype.hasOwnProperty.call(payload, "currentStatus")) {
    const currentStatus = normalizeString(payload.currentStatus);

    if (!APPLICATION_STATUSES.includes(currentStatus)) {
      errors.currentStatus = "Current status is invalid";
    } else {
      updates.currentStatus = currentStatus;
    }
  }

  if (Object.prototype.hasOwnProperty.call(payload, "jdUrl")) {
    const jdUrl = normalizeOptionalString(payload.jdUrl);

    if (payload.jdUrl !== null && typeof payload.jdUrl !== "string") {
      errors.jdUrl = "Job description URL must be a string or null";
    } else if (jdUrl && !isValidUrl(jdUrl)) {
      errors.jdUrl = "Job description URL must be a valid URL";
    } else {
      updates.jdUrl = jdUrl;
    }
  }

  if (Object.prototype.hasOwnProperty.call(payload, "source")) {
    if (payload.source !== null && typeof payload.source !== "string") {
      errors.source = "Source must be a string or null";
    } else {
      updates.source = normalizeOptionalString(payload.source);
    }
  }

  if (Object.prototype.hasOwnProperty.call(payload, "notes")) {
    if (payload.notes !== null && typeof payload.notes !== "string") {
      errors.notes = "Notes must be a string or null";
    } else {
      updates.notes = normalizeOptionalString(payload.notes);
    }
  }

  if (Object.prototype.hasOwnProperty.call(payload, "followUpAt")) {
    const followUpAt = parseOptionalDate(payload.followUpAt);

    if (payload.followUpAt !== null && !followUpAt) {
      errors.followUpAt = "Follow-up date must be a valid date or null";
    } else {
      updates.followUpAt = followUpAt;
    }
  }

  if (Object.keys(updates).length === 0 && Object.keys(errors).length === 0) {
    errors.body = "At least one application field must be provided";
  }

  return {
    value: updates,
    errors,
  };
}
