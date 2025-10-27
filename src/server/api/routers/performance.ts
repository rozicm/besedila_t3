import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const performanceRouter = createTRPCRouter({
  getPerformanceData: publicProcedure
    .input(
      z.object({
        roundIds: z.array(z.number()),
      })
    )
    .query(async ({ ctx, input }) => {
      const rounds = await ctx.prisma.round.findMany({
        where: {
          id: {
            in: input.roundIds,
          },
        },
        include: {
          roundItems: {
            include: {
              song: true,
            },
            orderBy: {
              position: "asc",
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      const songs = rounds.flatMap((round) =>
        round.roundItems.map((item) => ({
          ...item.song,
          roundName: round.name,
          roundItemId: item.id,
          positionInRound: item.position,
        }))
      );

      return {
        rounds,
        songs,
      };
    }),
});


