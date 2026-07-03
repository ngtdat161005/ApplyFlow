import {
  createApplicationEvent,
  deleteApplicationEvent,
  listApplicationEvents,
  updateApplicationEvent,
} from "./event.service.js";

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

export async function update(req, res) {
  const event = await updateApplicationEvent(
    req.user.id,
    req.validatedParams.applicationId,
    req.validatedParams.eventId,
    req.validatedBody,
  );

  res.status(200).json({
    success: true,
    message: "Event updated successfully",
    event,
  });
}

export async function remove(req, res) {
  await deleteApplicationEvent(
    req.user.id,
    req.validatedParams.applicationId,
    req.validatedParams.eventId,
  );

  res.status(200).json({
    success: true,
    message: "Event deleted successfully",
  });
}
