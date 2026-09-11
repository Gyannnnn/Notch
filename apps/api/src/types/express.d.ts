import type { User } from "@prisma/client";

// Augments Express's Request type so `req.user` (attached by
// src/middleware/auth/auth.middleware.ts) is typed everywhere without every
// controller having to re-cast or redeclare an AuthenticatedRequest type.
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export {};
