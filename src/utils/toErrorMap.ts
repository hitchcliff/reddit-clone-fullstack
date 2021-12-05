import { FieldError } from "../generated/graphql";

export const toErrorMap = (errors: FieldError[]) => {
  const errorMap: Record<string, string> = {};

  // FieldError = { field: "username", message: "error"}
  errors.forEach(({ field, message }) => {
    errorMap[field] = message;
  });

  return errorMap;
};
