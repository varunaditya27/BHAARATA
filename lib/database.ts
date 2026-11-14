import "server-only";
import { PrismaClient } from "@/lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalDatabase = globalThis as unknown as { database?: PrismaClient };
export const database = globalDatabase.database ?? new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL || "postgresql://bhaarata:bhaarata@localhost:55432/bhaarata", connectionTimeoutMillis: 5000 }),
});
if (process.env.NODE_ENV !== "production") globalDatabase.database = database;
