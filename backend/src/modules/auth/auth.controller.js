import { getCurrentUser, loginUser, registerUser } from "./auth.service.js";
import {
  FORGOT_PASSWORD_RESPONSE_MESSAGE,
  requestPasswordReset,
} from "./password-reset.service.js";

export async function register(req, res) {
  const user = await registerUser(req.validatedBody);

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    user,
  });
}

export async function login(req, res) {
  const result = await loginUser(req.validatedBody);

  res.status(200).json({
    success: true,
    message: "Login successful",
    accessToken: result.accessToken,
    user: result.user,
  });
}

export async function me(req, res) {
  const user = await getCurrentUser(req.user.id);

  res.status(200).json({
    success: true,
    user,
  });
}

export async function forgotPassword(req, res) {
  await requestPasswordReset(req.validatedBody.email);

  res.status(200).json({
    message: FORGOT_PASSWORD_RESPONSE_MESSAGE,
  });
}
