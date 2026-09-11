/**
 * Throw this from anywhere in a controller (inside an asyncHandler-wrapped
 * function) instead of hand-rolling a response — the global errorHandler
 * middleware (see src/middleware/error/errorHandler.ts) turns it into a
 * properly-shaped JSON error response with the right status code.
 *
 * Prefer this over sendError()'s "return early" style when the failure is
 * genuinely exceptional (should also get logged/stack-traced) rather than
 * an expected business-logic outcome (e.g. "already exists") — those should
 * still just `return sendError(res, ...)` directly.
 */
export class AppError extends Error {
  statusCode: number;
  code?: string;

  constructor(message: string, statusCode = 500, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}
