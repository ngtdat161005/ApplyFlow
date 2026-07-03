import { ValidationError } from "../domain/shared/domain-errors.js";

export function validateBody(validator) {
  return (req, _res, next) => {
    const result = validator(req.body ?? {});

    if (result.errors && Object.keys(result.errors).length > 0) {
      return next(new ValidationError(result.errors));
    }

    req.validatedBody = result.value;
    return next();
  };
}

export function validateQuery(validator) {
  return (req, _res, next) => {
    const result = validator(req.query ?? {});

    if (result.errors && Object.keys(result.errors).length > 0) {
      return next(new ValidationError(result.errors));
    }

    req.validatedQuery = result.value;
    return next();
  };
}
