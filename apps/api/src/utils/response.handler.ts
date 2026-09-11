import { Response } from "express";

interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: any;
}

export const sendSuccess = <T>(
  res: Response,
  message: string,
  data?: T,
  statusCode = 200,
) => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    ...(data !== undefined && { data }),
  };
  return res.status(statusCode).json(response);
};

export const sendError = (
  res: Response,
  message: string,
  error?: any,
  statusCode = 500,
) => {
  const response: ApiResponse = {
    success: false,
    message,
    ...(error !== undefined && { error }),
  };
  return res.status(statusCode).json(response);
};

export const searchSuccess = <T>(
  res: Response,
  data: T,
  message = "Results found",
) => sendSuccess(res, message, data, 200);

export const createSuccess = <T>(
  res: Response,
  data: T,
  message = "Created successfully",
) => sendSuccess(res, message, data, 201);

export const notFoundError = (res: Response, message = "Resource not found") =>
  sendError(res, message, undefined, 404);

export const validationError = (
  res: Response,
  message = "Validation failed",
  error?: any,
) => sendError(res, message, error, 400);

export const unauthorizedError = (
  res: Response,
  message = "Unauthorized access",
  error?: any,
) => sendError(res, message, error, 401);

export const createFailedError = (
  res: Response,
  message = "Failed to create",
) => sendError(res, message, undefined, 400);

export const updateFailed = (res: Response, message: string) =>
  sendError(res, message, undefined, 400);

export const updateSuccess = <T>(res: Response, data: T, message: string) =>
  sendSuccess(res, message, data, 200);
