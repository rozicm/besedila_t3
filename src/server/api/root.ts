import { createTRPCRouter } from "~/server/api/trpc";
import { songsRouter } from "~/server/api/routers/songs";
import { roundsRouter } from "~/server/api/routers/rounds";
import { performanceRouter } from "~/server/api/routers/performance";

export const appRouter = createTRPCRouter({
  songs: songsRouter,
  rounds: roundsRouter,
  performance: performanceRouter,
});

export type AppRouter = typeof appRouter;


