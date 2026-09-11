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

// Technical-requirement.md §9 requires a conservative connection cap under
// the Vercel serverless dev phase (it describes this as a `connection_limit`
// query param on DATABASE_URL, the mechanism for Prisma's non-adapter
// client). That param is still on DATABASE_URL for documentation/parity, but
// this driver-adapter client doesn't parse query params off the connection
// string at all — this `max` option is the actual, functioning equivalent
// for this Pool implementation. There's no adapter-exposed equivalent to
// `pool_timeout` (a fail-fast acquisition timeout); flagging that gap rather
// than guessing at a workaround.
const adapter = new PrismaNeon({ connectionString: databaseUrl, max: 5 });

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
