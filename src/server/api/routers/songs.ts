import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../trpc';

export const songsRouter = createTRPCRouter({
  list: publicProcedure
    .input(
      z
        .object({
          search: z.string().optional(),
          genre: z.string().optional(),
          favoritesOnly: z.boolean().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const where: any = {};
      if (input?.genre) where.genre = input.genre;
      if (input?.favoritesOnly) where.favorite = true;
      if (input?.search) {
        where.OR = [
          { title: { contains: input.search, mode: 'insensitive' } },
          { lyrics: { contains: input.search, mode: 'insensitive' } },
        ];
      }
      return ctx.db.song.findMany({ where, orderBy: { title: 'asc' } });
    }),

  toggleFavorite: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.song.findUnique({ where: { id: input.id } });
      if (!existing) return null;
      return ctx.db.song.update({
        where: { id: input.id },
        data: { favorite: !existing.favorite },
      });
    }),

  create: publicProcedure
    .input(
      z.object({
        title: z.string().min(1),
        lyrics: z.string().min(1),
        genre: z.string().min(1),
        key: z.string().optional(),
        notes: z.string().optional(),
        harmonica: z.string().optional(),
        bas_bariton: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.song.create({ data: input });
    }),

  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.song.delete({ where: { id: input.id } });
    }),
});


