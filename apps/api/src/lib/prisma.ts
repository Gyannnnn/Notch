import "dotenv/config";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
import ws from "ws";

// The schema's datasource block declares no `url` (Prisma ORM removed inline
// datasource URLs from schema files — see prisma/schema.prisma). The app's
// connection to Postgres is constructed here instead, via a driver adapter,
// which is also what lets us use Neon's serverless (WebSocket/HTTP) driver
// rather than a raw TCP pool — important since this runs as Vercel serverless
// functions that can't hold long-lived TCP connections cheaply.
neonConfig.webSocketConstructor = ws;

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is not set. Copy apps/api/.env.example to apps/api/.env and fill it in.",
  );
}

// Vercel serverless functions can spin up a fresh module scope per cold start,
// but reuse it across warm invocations — stashing the client on globalThis
// lets warm invocations reuse the connection instead of opening a new one
// each time, which is what keeps us under Postgres's connection limit.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const adapter = new PrismaNeon({ connectionString: databaseUrl });

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
