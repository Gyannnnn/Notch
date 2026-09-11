import { Request, Response, NextFunction } from "express";

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  console.error(err);

  const statusCode = err?.statusCode ?? 500;
  const message = err?.message || "Internal server error";
  const stack = process.env.NODE_ENV === "production" ? undefined : err?.stack;

  res.status(statusCode).json({
    success: false,
    message,
    ...(err?.code && { code: err.code }),
    ...(stack && { error: stack }),
  });
};
