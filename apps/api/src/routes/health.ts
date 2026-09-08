import { Router } from "express";
import { prisma } from "../lib/prisma.js";

export const healthRouter = Router();

healthRouter.get("/health", async (_req, res, next) => {
  try {
    await prisma.user.count();
    res.json({ status: "ok" });
  } catch (err) {
    next(err);
  }
});
