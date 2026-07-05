import { getApplicationsCollection } from "../../db/collections.js";

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildApplicationsFilter(userId, options) {
  const filter = {
    userId,
  };

  if (options.status) {
    filter.currentStatus = options.status;
  }

  if (options.search) {
    const searchPattern = new RegExp(escapeRegex(options.search), "i");

    filter.$or = [{ company: searchPattern }, { role: searchPattern }];
  }

  return filter;
}

function buildApplicationsSort(options) {
  const direction = options.sortOrder === "asc" ? 1 : -1;

  return {
    [options.sortBy]: direction,
    _id: direction,
  };
}

export async function createApplicationDocument(application) {
  const result = await getApplicationsCollection().insertOne(application);

  return {
    _id: result.insertedId,
    ...application,
  };
}

export async function findApplicationsByUser(userId, options) {
  const filter = buildApplicationsFilter(userId, options);
  const sort = buildApplicationsSort(options);

  return getApplicationsCollection().find(filter).sort(sort).toArray();
}

export async function findAllApplicationsByUser(userId) {
  return getApplicationsCollection()
    .find({ userId })
    .sort({
      updatedAt: -1,
      _id: -1,
    })
    .toArray();
}

export async function findApplicationByIdForUser(userId, applicationId) {
  return getApplicationsCollection().findOne({
    _id: applicationId,
    userId,
  });
}

export async function updateApplicationByIdForUser(userId, applicationId, updates) {
  const result = await getApplicationsCollection().findOneAndUpdate(
    {
      _id: applicationId,
      userId,
    },
    {
      $set: updates,
    },
    {
      returnDocument: "after",
    },
  );

  return result?.value ?? result;
}

export async function deleteApplicationByIdForUser(userId, applicationId) {
  const result = await getApplicationsCollection().deleteOne({
    _id: applicationId,
    userId,
  });

  return result.deletedCount === 1;
}
