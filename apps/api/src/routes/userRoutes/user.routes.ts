import { Router } from "express";
import { getMe, updateMe } from "../../controller/user/user.controller.js";
import { requireAuth } from "../../middleware/auth/auth.middleware.js";
import { fieldValidator } from "../../middleware/fieldValidator/validator.js";
import { updateMeSchema } from "@repo/schemas/user.schema";
import { asyncHandler } from "../../utils/async.handler.js";

const userRouter = Router();

userRouter.get("/", requireAuth, asyncHandler(getMe));
userRouter.patch("/", requireAuth, fieldValidator(updateMeSchema), asyncHandler(updateMe));

export default userRouter;
