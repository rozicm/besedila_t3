import { createTRPCRouter } from "~/server/api/trpc";
import { songsRouter } from "~/server/api/routers/songs";
import { roundsRouter } from "~/server/api/routers/rounds";
import { performanceRouter } from "~/server/api/routers/performance";
import { groupsRouter } from "~/server/api/routers/groups";
import { performancesRouter } from "~/server/api/routers/performances";
import { notificationsRouter } from "~/server/api/routers/notifications";

export const appRouter = createTRPCRouter({
  songs: songsRouter,
  rounds: roundsRouter,
  performance: performanceRouter,
  groups: groupsRouter,
  performances: performancesRouter,
  notifications: notificationsRouter,
});

export type AppRouter = typeof appRouter;


