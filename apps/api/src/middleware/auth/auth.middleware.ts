import { NextFunction, Request, Response } from "express";
import { verifyToken } from "@clerk/backend";
import { prisma } from "../../lib/prisma.js";
import { unauthorizedError } from "../../utils/response.handler.js";

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const secretKey = process.env.CLERK_SECRET_KEY;
    if (!secretKey) {
      throw new Error("CLERK_SECRET_KEY is not set");
    }

    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return unauthorizedError(
        res,
        "Missing or malformed Authorization header",
      );
    }

    const token = authHeader.slice("Bearer ".length);

    let clerkUserId: string;
    try {
      const payload = await verifyToken(token, { secretKey });
      clerkUserId = payload.sub;
    } catch {
      return unauthorizedError(res, "Invalid or expired token");
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    });

    if (!user) {

      return unauthorizedError(
        res,
        "No local account provisioned for this user yet",
        { code: "USER_NOT_PROVISIONED" },
      );
    }

    if (user.deletedAt) {
      return unauthorizedError(res, "This account has been deleted");
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};
