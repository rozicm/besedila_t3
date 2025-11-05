import { initTRPC, TRPCError } from "@trpc/server";
import { superjson } from "~/lib/superjson";
import { ZodError } from "zod";
import { prisma } from "~/server/db";
import { auth } from "@clerk/nextjs/server";

type CreateContextOptions = {
  auth: {
    userId: string | null;
  } | null;
};

const createInnerTRPCContext = (opts: CreateContextOptions) => {
  return {
    auth: opts.auth,
    prisma,
  };
};

export const createTRPCContext = async (opts: {
  req: Request;
  resHeaders: Headers;
}) => {
  const { userId } = await auth();

  return createInnerTRPCContext({
    auth: { userId: userId ?? null },
  });
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.auth || !ctx.auth.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      auth: ctx.auth,
    },
  });
});

export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);

