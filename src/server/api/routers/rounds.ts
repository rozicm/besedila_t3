import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../trpc';

export const roundsRouter = createTRPCRouter({
  list: publicProcedure.query(({ ctx }) =>
    ctx.db.round.findMany({ orderBy: { name: 'asc' } })
  ),

  create: publicProcedure
    .input(z.object({ 
      name: z.string().min(1),
      description: z.string().optional(),
      songIds: z.array(z.number().int()).optional().default([])
    }))
    .mutation(async ({ ctx, input }) => {
      const round = await ctx.db.round.create({
        data: { 
          name: input.name,
          description: input.description || null,
        },
      });

      // Add songs to the round if provided
      if (input.songIds.length > 0) {
        const roundItems = input.songIds.map((songId, index) => ({
          roundId: round.id,
          songId,
          position: index + 1,
        }));
        
        await ctx.db.roundItem.createMany({
          data: roundItems,
        });
      }

      return round;
    }),

  byIdWithSongs: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const round = await ctx.db.round.findUnique({
        where: { id: input.id },
        include: {
          roundItems: {
            orderBy: { position: 'asc' },
            include: { song: true },
          },
        },
      });
      return round;
    }),

  updateOrder: publicProcedure
    .input(z.object({ id: z.number(), songIds: z.array(z.number().int()) }))
    .mutation(async ({ ctx, input }) => {
      // Clear existing items and recreate with new positions
      await ctx.db.roundItem.deleteMany({ where: { roundId: input.id } });
      if (input.songIds.length === 0) return { count: 0 };
      const data = input.songIds.map((songId, idx) => ({
        roundId: input.id,
        songId,
        position: idx + 1,
      }));
      const res = await ctx.db.roundItem.createMany({ data });
      return res;
    }),
});


