import { deleteAccount } from "./account-deletion.service.js";

export async function removeCurrentUser(req, res) {
  await deleteAccount(req.user.id, req.validatedBody.password);

  res.status(200).json({
    message: "Account deleted.",
  });
}
