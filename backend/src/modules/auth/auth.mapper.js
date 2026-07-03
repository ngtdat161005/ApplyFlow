function mapDate(date) {
  return date instanceof Date ? date.toISOString() : date;
}

export function mapUserToSafeUser(user) {
  if (!user) {
    return null;
  }

  return {
    _id: user._id.toString(),
    displayName: user.displayName,
    email: user.email,
    createdAt: mapDate(user.createdAt),
    updatedAt: mapDate(user.updatedAt),
  };
}
