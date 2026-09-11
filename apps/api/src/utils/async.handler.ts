import { Request, Response, NextFunction } from "express";

/**
 * Wraps an async route handler (or async middleware) so a rejected promise
 * gets forwarded to next(err) automatically, instead of every controller
 * needing its own try/catch. Any error that reaches next() is handled by
 * the global errorHandler middleware.
 */
export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
