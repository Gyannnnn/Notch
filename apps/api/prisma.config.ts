// Config for the Prisma CLI (migrate, studio, db push, generate) — NOT used by
// the running app. The app's own PrismaClient gets its connection from the
// driver adapter in src/lib/prisma.ts instead, per Prisma ORM's split of
// "connection URL for tooling" (here) vs. "connection for the app" (adapter).
// https://pris.ly/d/config-datasource
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
