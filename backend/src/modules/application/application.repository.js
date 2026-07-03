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
