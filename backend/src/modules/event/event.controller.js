import { createApplicationEvent, listApplicationEvents } from "./event.service.js";

export async function create(req, res) {
  const event = await createApplicationEvent(
    req.user.id,
    req.validatedParams.applicationId,
    req.validatedBody,
  );

  res.status(201).json({
    success: true,
    message: "Event created successfully",
    event,
  });
}

export async function list(req, res) {
  const events = await listApplicationEvents(req.user.id, req.validatedParams.applicationId);

  res.status(200).json({
    success: true,
    events,
  });
}
