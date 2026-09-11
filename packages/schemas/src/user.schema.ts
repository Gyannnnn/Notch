import { z } from "zod";

/**
 * Whitelist for PATCH /me. `.strict()` means any key not listed here —
 * critically `email` and `clerkId` — fails validation with a 400 instead of
 * being silently dropped or (worse) passed through to Prisma.
 *
 * Field list reconciled against the actual docs (Product-requirement-document.md
 * §6.4 onboarding inputs: "height, current weight, target weight, activity
 * level"; Technical-requirement.md §4: "update goal, weight targets, activity
 * level"):
 *   - goal, heightCm, currentWeightKg, targetWeightKg, activityLevel — directly
 *     specified by one or both docs.
 *   - startingWeightKg, timezone — NOT mentioned in either doc, but added
 *     anyway: both are non-nullable in spirit (timezone drives streak
 *     day-boundaries per schema.prisma's own comments; startingWeightKg is
 *     the pace-indicator baseline per PRD §6.3) and the Clerk webhook creates
 *     the User row without them — with no other endpoint that sets them,
 *     they'd stay null forever. Flagging this as an assumption per the PRD's
 *     own instruction ("flag the ambiguity rather than guessing on scope").
 *   - region — deliberately NOT included, reversing an earlier draft of this
 *     schema that had it. Neither doc describes region as a user-editable
 *     /me field or an onboarding input; PRD §6.4's onboarding list is height/
 *     weight/target/activity level only, and TRD §4 doesn't mention region
 *     either. It's described only as a schema field driving pricing tier +
 *     food presets, which reads more like something inferred (store locale,
 *     timezone) than user-entered. Leaving unresolved per the PRD's guidance
 *     to flag rather than guess — it currently defaults to OTHER and has no
 *     way to be set at all, which is worth a product decision, not a schema
 *     patch made unprompted.
 */
export const updateMeSchema = z
  .object({
    goal: z.enum(["CUT", "BULK", "MAINTAIN"]).optional(),
    activityLevel: z
      .enum(["SEDENTARY", "LIGHT", "MODERATE", "ACTIVE", "VERY_ACTIVE"])
      .optional(),
    heightCm: z.number().positive().max(300).optional(),
    startingWeightKg: z.number().positive().max(500).optional(),
    currentWeightKg: z.number().positive().max(500).optional(),
    targetWeightKg: z.number().positive().max(500).optional(),
    // IANA tz string, e.g. "Asia/Kolkata" — not validated against the full
    // tz database here (no dependency for it yet); just a sane non-empty guard.
    timezone: z.string().min(1).max(100).optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export type UpdateMeInput = z.infer<typeof updateMeSchema>;

/** The set of onboarding-only fields that, once all non-null, flips the
 * user's onboardingCompletedAt from null to now() — see updateMe() in
 * apps/api/src/controller/user/user.controller.ts. Kept next to the schema
 * so the two stay in sync if the onboarding field set ever changes. */
export const ONBOARDING_FIELDS = [
  "timezone",
  "goal",
  "heightCm",
  "startingWeightKg",
  "activityLevel",
] as const;
