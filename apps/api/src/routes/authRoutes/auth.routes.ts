import express, { Router } from "express";
import { handleClerkWebhook } from "../../controller/auth/auth.controller.js";
import { asyncHandler } from "../../utils/async.handler.js";

const authRouter = Router();

// express.raw() here (not the app-wide express.json()) is required: Svix
// signs the exact raw request bytes, and JSON.parse + re-stringify does not
// reliably round-trip to the same bytes. src/index.ts mounts this router
// before the global express.json() middleware for the same reason — do not
// move that mount order without keeping this in mind.
authRouter.post(
  "/clerk",
  express.raw({ type: "application/json" }),
  asyncHandler(handleClerkWebhook),
);

export default authRouter;
