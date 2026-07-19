export function validateDeleteAccountPayload(payload) {
  const password = typeof payload.password === "string" ? payload.password : "";
  const errors = {};
  const unknownFields = Object.keys(payload).filter((fieldName) => fieldName !== "password");

  if (unknownFields.length > 0) {
    errors.body = `Unsupported field(s): ${unknownFields.join(", ")}`;
  }

  if (!password) {
    errors.password = "Password is required";
  }

  return {
    value: { password },
    errors,
  };
}
