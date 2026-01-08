import { initTRPC, TRPCError } from "@trpc/server";
import { superjson } from "~/lib/superjson";
import { ZodError } from "zod";
import { prisma } from "~/server/db";
import { auth, currentUser } from "@clerk/nextjs/server";
import { jwtVerify, createRemoteJWKSet } from "jose";

type CreateContextOptions = {
  session: {
    userId: string;
  } | null;
};

const createInnerTRPCContext = (opts: CreateContextOptions) => {
  return {
    session: opts.session,
    prisma,
  };
};

export const createTRPCContext = async (opts: {
  req: Request;
  resHeaders: Headers;
}) => {
  try {
    // Check for JWT token in Authorization header (for mobile apps)
    const authHeader = opts.req.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      try {
        // Verify the JWT token using jose library
        // Get the JWKS URL from Clerk (this is the public key endpoint)
        const clerkJwksUrl = process.env.CLERK_JWKS_URL || 
          `https://${process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.split('_')[1] || 'clerk'}.clerk.accounts.dev/.well-known/jwks.json`;
        
        const JWKS = createRemoteJWKSet(new URL(clerkJwksUrl));
        const { payload } = await jwtVerify(token, JWKS, {
          issuer: `https://${process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.split('_')[1] || 'clerk'}.clerk.accounts.dev`,
        });
        
        if (payload.sub) {
          return createInnerTRPCContext({
            session: { userId: payload.sub as string },
          });
        }
      } catch (error) {
        // Token verification failed, fall through to cookie-based auth
        // This is expected for web requests that use cookies
      }
    }

    // Fall back to cookie-based auth (for web apps)
    const { userId } = await auth();
    return createInnerTRPCContext({
      session: userId ? { userId } : null,
    });
  } catch (error) {
    // If auth fails, return context without session
    return createInnerTRPCContext({
      session: null,
    });
  }
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
  if (!ctx.session || !ctx.session.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      session: ctx.session,
    },
  });
});

export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);

// Helper function to ensure user exists in database
export async function ensureUserExists(userId: string) {
  // Get user info from Clerk
  const clerkUser = await currentUser();
  
  if (!clerkUser || clerkUser.id !== userId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "User not found in Clerk",
    });
  }

  // Use upsert to handle race conditions (multiple requests creating user simultaneously)
  await prisma.user.upsert({
    where: { id: userId },
    update: {
      // Update user info in case it changed in Clerk
      name: clerkUser.firstName && clerkUser.lastName
        ? `${clerkUser.firstName} ${clerkUser.lastName}`
        : clerkUser.firstName || clerkUser.lastName || clerkUser.username || null,
      email: clerkUser.emailAddresses[0]?.emailAddress || null,
      image: clerkUser.imageUrl || null,
      emailVerified: clerkUser.emailAddresses[0]?.verification?.status === "verified"
        ? new Date()
        : null,
    },
    create: {
      id: userId,
      name: clerkUser.firstName && clerkUser.lastName
        ? `${clerkUser.firstName} ${clerkUser.lastName}`
        : clerkUser.firstName || clerkUser.lastName || clerkUser.username || null,
      email: clerkUser.emailAddresses[0]?.emailAddress || null,
      image: clerkUser.imageUrl || null,
      emailVerified: clerkUser.emailAddresses[0]?.verification?.status === "verified"
        ? new Date()
        : null,
    },
  });

  return userId;
}

