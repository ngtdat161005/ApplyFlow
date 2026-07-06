import { ObjectId } from "mongodb";

const OBJECT_ID_PATTERN = /^[a-f\d]{24}$/i;

export function toObjectId(id) {
  if (id instanceof ObjectId) {
    return id;
  }

  if (typeof id !== "string" || !OBJECT_ID_PATTERN.test(id)) {
    return null;
  }

  return new ObjectId(id);
}
