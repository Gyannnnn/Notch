import { PrismaClient } from "@prisma/client";

// Vercel serverless functions can spin up a fresh module scope per cold start,
// but reuse it across warm invocations — stashing the client on globalThis
// lets warm invocations reuse the connection instead of opening a new one
// each time, which is what keeps us under Postgres's connection limit.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
