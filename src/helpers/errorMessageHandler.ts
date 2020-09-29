import { ValidationError } from "express-validator";

export const errorHandler = (error: ValidationError) => {
  return error.msg;
};
