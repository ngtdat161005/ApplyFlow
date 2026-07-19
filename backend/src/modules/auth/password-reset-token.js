import { createHash, randomBytes } from "node:crypto";

export function createRawPasswordResetToken() {
  return randomBytes(32).toString("hex");
}

export function hashPasswordResetToken(rawToken) {
  return createHash("sha256").update(rawToken).digest("hex");
}

export function createPasswordResetUrl(frontendOrigin, rawToken) {
  const url = new URL("/reset-password", frontendOrigin);
  url.searchParams.set("token", rawToken);
  return url.toString();
}
