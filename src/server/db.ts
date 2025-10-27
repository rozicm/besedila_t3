import { PrismaClient } from "@prisma/client";
import { env } from "~/lib/env";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const createPrismaClient = () => {
  return new PrismaClient({
    log: env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
};

export const prisma =
  globalForPrisma.prisma ?? createPrismaClient();

if (env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;


