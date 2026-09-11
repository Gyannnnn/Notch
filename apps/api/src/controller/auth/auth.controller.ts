import { Request, Response } from "express";
import { Webhook } from "svix";
import type { UserWebhookEvent } from "@clerk/backend";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/appError.js";
import { sendSuccess, validationError } from "../../utils/response.handler.js";

 
export const handleClerkWebhook = async (req: Request, res: Response) => {
  const signingSecret = process.env.CLERK_WEBHOOK_SIGNING_SECRET;
  if (!signingSecret) {
    throw new AppError("CLERK_WEBHOOK_SIGNING_SECRET is not set", 500);
  }

  const svixId = req.headers["svix-id"];
  const svixTimestamp = req.headers["svix-timestamp"];
  const svixSignature = req.headers["svix-signature"];

  if (
    typeof svixId !== "string" ||
    typeof svixTimestamp !== "string" ||
    typeof svixSignature !== "string"
  ) {
    return validationError(res, "Missing Svix signature headers");
  }

  // express.raw() gives us the body as a Buffer — required as-is (not
  // re-stringified) because Svix signs the exact bytes that were sent.
  const payload = req.body as Buffer;

  const wh = new Webhook(signingSecret);
  try {
    wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    });
  } catch {
    // Do not process unverified payloads.
    return validationError(res, "Invalid webhook signature");
  }

  const event = JSON.parse(payload.toString("utf8")) as UserWebhookEvent;

  switch (event.type) {
    case "user.created":
    case "user.updated": {
      const { id: clerkId, email_addresses, primary_email_address_id } = event.data;
      const email =
        email_addresses.find((e) => e.id === primary_email_address_id)
          ?.email_address ?? email_addresses[0]?.email_address;

      if (!email) {
        // Shouldn't happen for a real Clerk user, but don't let a malformed
        // payload create a row that violates the unique/non-null email column.
        return validationError(res, "Clerk user payload has no email address");
      }

      await prisma.user.upsert({
        where: { clerkId },
        update: { email },
        create: { clerkId, email },
      });

      return sendSuccess(res, "Webhook processed");
    }

    case "user.deleted": {

      console.warn(
        `[clerk webhook] received user.deleted for clerkId=${event.data.id ?? "unknown"} — no-op, see TODO in auth.controller.ts`,
      );
      return sendSuccess(res, "Webhook received (no-op)");
    }

    default:
      
      return sendSuccess(res, "Webhook received (unhandled event type)");
  }
};
