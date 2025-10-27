import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { type NextRequest } from "next/server";

// Force dynamic rendering
export const dynamic = "force-dynamic";

// Lazy-load router and context to avoid build-time database connection
async function getRouterAndContext(req: NextRequest) {
  const { appRouter } = await import("~/server/api/root");
  const { createTRPCContext } = await import("~/server/api/trpc");
  
  return {
    router: appRouter,
    createContext: () => createTRPCContext({ req, resHeaders: new Headers() }),
  };
}

const handler = async (req: NextRequest) => {
  const { router, createContext } = await getRouterAndContext(req);
  
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router,
    createContext,
    onError:
      process.env.NODE_ENV === "development"
        ? ({ path, error }) => {
            console.error(
              `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`
            );
          }
        : undefined,
  });
};

export { handler as GET, handler as POST };

