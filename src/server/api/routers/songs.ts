import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

const songInputSchema = z.object({
  title: z.string().min(1),
  lyrics: z.string().min(1),
  genre: z.string().min(1),
  key: z.string().optional(),
  notes: z.string().optional(),
  favorite: z.boolean().optional(),
  harmonica: z.enum(["C-F-B", "B-Es-As", "A-D-G"]).optional(),
  bas_bariton: z.string().optional(),
});

export const songsRouter = createTRPCRouter({
  list: publicProcedure
    .input(
      z.object({
        search: z.string().optional(),
        genre: z.string().optional(),
        harmonica: z.string().optional(),
        favorite: z.boolean().optional(),
        sortBy: z.enum(["title", "createdAt", "favorite"]).optional(),
        order: z.enum(["asc", "desc"]).optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const where: any = {};

      if (input?.search) {
        where.title = { contains: input.search, mode: "insensitive" };
      }
      if (input?.genre) {
        where.genre = { contains: input.genre, mode: "insensitive" };
      }
      if (input?.harmonica) {
        where.harmonica = { contains: input.harmonica, mode: "insensitive" };
      }
      if (input?.favorite !== undefined) {
        where.favorite = input.favorite;
      }

      const orderBy: any = {};
      if (input?.sortBy) {
        orderBy[input.sortBy] = input?.order ?? "asc";
      } else {
        orderBy.title = "asc";
      }

      const songs = await ctx.prisma.song.findMany({
        where,
        orderBy,
      });

      return songs;
    }),

  get: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const song = await ctx.prisma.song.findUnique({
        where: { id: input.id },
      });

      if (!song) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Song not found",
        });
      }

      return song;
    }),

  create: protectedProcedure
    .input(songInputSchema)
    .mutation(async ({ ctx, input }) => {
      const song = await ctx.prisma.song.create({
        data: input,
      });
      return song;
    }),

  update: protectedProcedure
    .input(z.object({ id: z.number() }).extend(songInputSchema.shape))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const song = await ctx.prisma.song.update({
        where: { id },
        data,
      });

      return song;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.song.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  toggleFavorite: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const song = await ctx.prisma.song.findUnique({
        where: { id: input.id },
      });

      if (!song) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Song not found",
        });
      }

      const updatedSong = await ctx.prisma.song.update({
        where: { id: input.id },
        data: { favorite: !song.favorite },
      });

      return updatedSong;
    }),
});


