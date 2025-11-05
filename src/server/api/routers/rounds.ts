import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const roundsRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    const rounds = await ctx.prisma.round.findMany({
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
        createdAt: "desc",
      },
    });

    return rounds;
  }),

  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const round = await ctx.prisma.round.findUnique({
        where: { id: input.id },
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
      });

      if (!round) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Round not found",
        });
      }

      return round;
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        songIds: z.array(z.number()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { name, description, songIds } = input;

      const round = await ctx.prisma.$transaction(async (tx) => {
        const newRound = await tx.round.create({
          data: {
            name,
            description,
          },
        });

        const roundItems = await Promise.all(
          songIds.map((songId, index) =>
            tx.roundItem.create({
              data: {
                roundId: newRound.id,
                songId,
                position: index,
              },
            })
          )
        );

        return {
          ...newRound,
          roundItems,
        };
      });

      return round;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const round = await ctx.prisma.round.update({
        where: { id },
        data,
      });

      return round;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.round.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  reorderSongs: protectedProcedure
    .input(
      z.object({
        roundId: z.number(),
        songIds: z.array(z.number()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { roundId, songIds } = input;

      await ctx.prisma.$transaction(async (tx) => {
        // Fetch existing items once
        const existingItems = await tx.roundItem.findMany({
          where: { roundId },
          select: { id: true, songId: true },
        });

        const existingSongIds = new Set(existingItems.map((i) => i.songId));

        // Delete items that are no longer present
        await tx.roundItem.deleteMany({
          where: {
            roundId,
            songId: { notIn: songIds },
          },
        });

        // Create items that are new
        const toCreate = songIds.filter((id) => !existingSongIds.has(id));
        if (toCreate.length > 0) {
          await tx.roundItem.createMany({
            data: toCreate.map((songId) => ({ roundId, songId, position: 0 })),
            skipDuplicates: true,
          });
        }

        // Perform a single CASE-based UPDATE for positions
        if (songIds.length > 0) {
          const caseClauses = songIds
            .map((songId, index) => `WHEN ${songId} THEN ${index}`)
            .join(" ");
          const idsList = songIds.join(",");

          await tx.$executeRawUnsafe(
            `UPDATE "public"."round_items"
             SET "position" = CASE "song_id" ${caseClauses} END,
                 "updated_at" = NOW()
             WHERE "round_id" = ${roundId} AND "song_id" IN (${idsList})`
          );
        }
      });

      // Optimistic update on client already adjusts cache; return light payload
      return { success: true };
    }),

  addSong: protectedProcedure
    .input(
      z.object({
        roundId: z.number(),
        songId: z.number(),
        position: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { roundId, songId, position } = input;

      const lastPosition = await ctx.prisma.roundItem.findFirst({
        where: { roundId },
        orderBy: { position: "desc" },
        select: { position: true },
      });

      const newPosition = position ?? ((lastPosition?.position ?? -1) + 1);

      const roundItem = await ctx.prisma.roundItem.create({
        data: {
          roundId,
          songId,
          position: newPosition,
        },
      });

      return roundItem;
    }),

  removeSong: protectedProcedure
    .input(
      z.object({
        roundId: z.number(),
        songId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.roundItem.deleteMany({
        where: {
          roundId: input.roundId,
          songId: input.songId,
        },
      });

      return { success: true };
    }),
});


