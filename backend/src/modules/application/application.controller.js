import { createApplication, listApplications } from "./application.service.js";

export async function create(req, res) {
  const application = await createApplication(req.user.id, req.validatedBody);

  res.status(201).json({
    success: true,
    message: "Application created successfully",
    application,
  });
}

export async function list(req, res) {
  const applications = await listApplications(req.user.id, req.validatedQuery);

  res.status(200).json({
    success: true,
    applications,
  });
}
