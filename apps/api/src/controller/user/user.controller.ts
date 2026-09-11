import { Request, Response } from "express";
import type { User } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { sendSuccess } from "../../utils/response.handler.js";
import { AppError } from "../../utils/appError.js";
import { ONBOARDING_FIELDS, UpdateMeInput } from "@repo/schemas/user.schema";

function toUserDto(user: User) {
  const { clerkId: _clerkId, deletedAt: _deletedAt, onboardingCompletedAt, ...rest } = user;
  return {
    ...rest,
    onboardingComplete: onboardingCompletedAt !== null,
  };
}

export const getMe = async (req: Request, res: Response) => {

  if (!req.user) throw new AppError("Not authenticated", 401);
  sendSuccess(res, "User fetched successfully", toUserDto(req.user));
};

export const updateMe = async (req: Request, res: Response) => {
  if (!req.user) throw new AppError("Not authenticated", 401);

  const data = req.body as UpdateMeInput;

  const merged = { ...req.user, ...data };
  const onboardingNowComplete = ONBOARDING_FIELDS.every(
    (field) => merged[field] !== null && merged[field] !== undefined,
  );

  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: {
      ...data,
      ...(onboardingNowComplete &&
        req.user.onboardingCompletedAt === null && {
          onboardingCompletedAt: new Date(),
        }),
    },
  });

  sendSuccess(res, "User updated successfully", toUserDto(user));
};
