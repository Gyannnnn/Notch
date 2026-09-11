import { ZodObject, ZodArray, ZodTypeAny } from "zod";
import { Request, Response, NextFunction } from "express";
import { validationError } from "../../utils/response.handler.js";


export const fieldValidator =
  (schema: ZodObject<any> | ZodArray<ZodTypeAny>) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return validationError(res, "Validation failed", result.error.format());
    }

    req.body = result.data;
    next();
  };
