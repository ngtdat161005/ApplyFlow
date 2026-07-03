import {
  createApplication,
  deleteApplication,
  getApplication,
  listApplications,
  updateApplication,
} from "./application.service.js";

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

export async function detail(req, res) {
  const application = await getApplication(req.user.id, req.validatedParams.applicationId);

  res.status(200).json({
    success: true,
    application,
  });
}

export async function update(req, res) {
  const application = await updateApplication(
    req.user.id,
    req.validatedParams.applicationId,
    req.validatedBody,
  );

  res.status(200).json({
    success: true,
    message: "Application updated successfully",
    application,
  });
}

export async function remove(req, res) {
  await deleteApplication(req.user.id, req.validatedParams.applicationId);

  res.status(200).json({
    success: true,
    message: "Application deleted successfully",
  });
}
