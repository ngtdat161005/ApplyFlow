import { ObjectId } from "mongodb";
import { getUsersCollection } from "../../db/collections.js";

let usersEmailIndexPromise;

function toObjectId(id) {
  if (!ObjectId.isValid(id)) {
    return null;
  }

  return new ObjectId(id);
}

async function ensureUsersEmailIndex() {
  if (!usersEmailIndexPromise) {
    usersEmailIndexPromise = getUsersCollection().createIndex({ email: 1 }, { unique: true });
  }

  return usersEmailIndexPromise;
}

export async function findUserByEmail(email) {
  return getUsersCollection().findOne({ email });
}

export async function findUserById(userId) {
  const _id = toObjectId(userId);

  if (!_id) {
    return null;
  }

  return getUsersCollection().findOne({ _id });
}

export async function createUser(user) {
  await ensureUsersEmailIndex();

  const result = await getUsersCollection().insertOne(user);

  return {
    _id: result.insertedId,
    ...user,
  };
}
