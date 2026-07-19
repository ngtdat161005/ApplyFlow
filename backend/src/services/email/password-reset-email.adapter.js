import { Resend } from "resend";
import { config } from "../../config/env.js";

const SUBJECT = "Reset your ApplyFlow password";

export function createPasswordResetEmailSender({
  provider,
  resendApiKey,
  resendFromEmail,
  resendClient,
  consoleWriter = console.info,
}) {
  let client = resendClient;

  return async function sendPasswordResetEmail({ to, resetUrl }) {
    const text = [
      "A password reset was requested for your ApplyFlow account.",
      `Reset your password: ${resetUrl}`,
      "If you did not request this, you can ignore this message.",
    ].join("\n\n");

    if (provider === "console") {
      consoleWriter({
        to,
        subject: SUBJECT,
        text,
      });
      return;
    }

    client ||= new Resend(resendApiKey);
    const result = await client.emails.send({
      from: resendFromEmail,
      to,
      subject: SUBJECT,
      text,
    });

    if (result.error) {
      throw new Error("Password reset email delivery failed");
    }
  };
}

export const sendPasswordResetEmail = createPasswordResetEmailSender({
  provider: config.email.provider,
  resendApiKey: config.email.resendApiKey,
  resendFromEmail: config.email.resendFromEmail,
  consoleWriter: config.nodeEnv === "test" ? () => {} : console.info,
});
