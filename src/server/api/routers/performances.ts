import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { GroupRole } from "@prisma/client";

export const performancesRouter = createTRPCRouter({
  // List all performances for a group
  list: protectedProcedure
    .input(
      z.object({
        groupId: z.string(),
        from: z.date().optional(),
        to: z.date().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Check if user is a member of the group
      const member = await ctx.prisma.groupMember.findFirst({
        where: {
          groupId: input.groupId,
          userId: ctx.session.userId,
        },
      });

      if (!member) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have access to this group",
        });
      }

      const where: any = {
        groupId: input.groupId,
      };

      if (input.from || input.to) {
        where.date = {};
        if (input.from) {
          where.date.gte = input.from;
        }
        if (input.to) {
          where.date.lte = input.to;
        }
      }

      const performances = await ctx.prisma.performance.findMany({
        where,
        include: {
          setlist: {
            include: {
              song: true,
            },
            orderBy: {
              position: "asc",
            },
          },
          reminders: {
            orderBy: {
              reminderTime: "asc",
            },
          },
          _count: {
            select: {
              setlist: true,
            },
          },
        },
        orderBy: {
          date: "desc",
        },
      });

      return performances;
    }),

  // List upcoming performances for current user (across all their groups)
  upcoming: protectedProcedure
    .input(
      z.object({
        limit: z.number().optional().default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      const performances = await ctx.prisma.performance.findMany({
        where: {
          date: {
            gte: new Date(),
          },
          group: {
            members: {
              some: {
                userId: ctx.session.userId,
              },
            },
          },
        },
        include: {
          group: {
            select: {
              id: true,
              name: true,
            },
          },
          setlist: {
            include: {
              song: true,
            },
            orderBy: {
              position: "asc",
            },
          },
          _count: {
            select: {
              setlist: true,
            },
          },
        },
        orderBy: {
          date: "asc",
        },
        take: input.limit,
      });

      return performances;
    }),

  // Get a specific performance
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const performance = await ctx.prisma.performance.findFirst({
        where: {
          id: input.id,
          group: {
            members: {
              some: {
                userId: ctx.session.userId,
              },
            },
          },
        },
        include: {
          group: {
            select: {
              id: true,
              name: true,
            },
          },
          setlist: {
            include: {
              song: true,
            },
            orderBy: {
              position: "asc",
            },
          },
          reminders: {
            orderBy: {
              reminderTime: "asc",
            },
          },
        },
      });

      if (!performance) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Performance not found or you don't have access",
        });
      }

      return performance;
    }),

  // Create a new performance
  create: protectedProcedure
    .input(
      z.object({
        groupId: z.string(),
        name: z.string().min(1),
        description: z.string().optional(),
        location: z.string().optional(),
        date: z.date(),
        duration: z.number().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is a member of the group
      const member = await ctx.prisma.groupMember.findFirst({
        where: {
          groupId: input.groupId,
          userId: ctx.session.userId,
        },
      });

      if (!member) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have access to this group",
        });
      }

      const performance = await ctx.prisma.performance.create({
        data: {
          groupId: input.groupId,
          name: input.name,
          description: input.description,
          location: input.location,
          date: input.date,
          duration: input.duration,
          notes: input.notes,
          // Create default reminders: 1 day before and 1 hour before
          reminders: {
            create: [
              {
                reminderTime: new Date(input.date.getTime() - 24 * 60 * 60 * 1000), // 1 day before
              },
              {
                reminderTime: new Date(input.date.getTime() - 60 * 60 * 1000), // 1 hour before
              },
            ],
          },
        },
        include: {
          setlist: {
            include: {
              song: true,
            },
          },
          reminders: true,
        },
      });

      return performance;
    }),

  // Update a performance
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        location: z.string().optional(),
        date: z.date().optional(),
        duration: z.number().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is a member of the group
      const performance = await ctx.prisma.performance.findFirst({
        where: {
          id: input.id,
          group: {
            members: {
              some: {
                userId: ctx.session.userId,
              },
            },
          },
        },
      });

      if (!performance) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Performance not found or you don't have access",
        });
      }

      const { id, ...data } = input;

      // If date is updated, update reminders too
      if (data.date) {
        await ctx.prisma.performanceReminder.deleteMany({
          where: { performanceId: id },
        });

        await ctx.prisma.performanceReminder.createMany({
          data: [
            {
              performanceId: id,
              reminderTime: new Date(data.date.getTime() - 24 * 60 * 60 * 1000),
            },
            {
              performanceId: id,
              reminderTime: new Date(data.date.getTime() - 60 * 60 * 1000),
            },
          ],
        });
      }

      const updatedPerformance = await ctx.prisma.performance.update({
        where: { id },
        data,
        include: {
          setlist: {
            include: {
              song: true,
            },
            orderBy: {
              position: "asc",
            },
          },
          reminders: true,
        },
      });

      return updatedPerformance;
    }),

  // Delete a performance
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if user is owner or admin
      const performance = await ctx.prisma.performance.findFirst({
        where: {
          id: input.id,
          group: {
            members: {
              some: {
                userId: ctx.session.userId,
                role: {
                  in: [GroupRole.OWNER, GroupRole.ADMIN],
                },
              },
            },
          },
        },
      });

      if (!performance) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to delete this performance",
        });
      }

      await ctx.prisma.performance.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  // Add song to setlist
  addSongToSetlist: protectedProcedure
    .input(
      z.object({
        performanceId: z.string(),
        songId: z.number(),
        position: z.number().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is a member
      const performance = await ctx.prisma.performance.findFirst({
        where: {
          id: input.performanceId,
          group: {
            members: {
              some: {
                userId: ctx.session.userId,
              },
            },
          },
        },
        include: {
          setlist: {
            orderBy: {
              position: "desc",
            },
            take: 1,
          },
        },
      });

      if (!performance) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Performance not found or you don't have access",
        });
      }

      // Check if song exists
      const song = await ctx.prisma.song.findUnique({
        where: { id: input.songId },
      });

      if (!song) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Song not found",
        });
      }

      // If position not provided, add to end
      const position =
        input.position !== undefined
          ? input.position
          : (performance.setlist[0]?.position ?? -1) + 1;

      const setlistItem = await ctx.prisma.performanceSetlistItem.create({
        data: {
          performanceId: input.performanceId,
          songId: input.songId,
          position,
          notes: input.notes,
        },
        include: {
          song: true,
        },
      });

      return setlistItem;
    }),

  // Remove song from setlist
  removeSongFromSetlist: protectedProcedure
    .input(
      z.object({
        setlistItemId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is a member
      const setlistItem = await ctx.prisma.performanceSetlistItem.findFirst({
        where: {
          id: input.setlistItemId,
          performance: {
            group: {
              members: {
                some: {
                  userId: ctx.session.userId,
                },
              },
            },
          },
        },
      });

      if (!setlistItem) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Setlist item not found or you don't have access",
        });
      }

      await ctx.prisma.performanceSetlistItem.delete({
        where: { id: input.setlistItemId },
      });

      return { success: true };
    }),

  // Reorder setlist
  reorderSetlist: protectedProcedure
    .input(
      z.object({
        performanceId: z.string(),
        items: z.array(
          z.object({
            id: z.string(),
            position: z.number(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is a member
      const performance = await ctx.prisma.performance.findFirst({
        where: {
          id: input.performanceId,
          group: {
            members: {
              some: {
                userId: ctx.session.userId,
              },
            },
          },
        },
      });

      if (!performance) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Performance not found or you don't have access",
        });
      }

      // Update all positions
      await Promise.all(
        input.items.map((item) =>
          ctx.prisma.performanceSetlistItem.update({
            where: { id: item.id },
            data: { position: item.position },
          })
        )
      );

      return { success: true };
    }),

  // Update setlist item notes
  updateSetlistItemNotes: protectedProcedure
    .input(
      z.object({
        setlistItemId: z.string(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is a member
      const setlistItem = await ctx.prisma.performanceSetlistItem.findFirst({
        where: {
          id: input.setlistItemId,
          performance: {
            group: {
              members: {
                some: {
                  userId: ctx.session.userId,
                },
              },
            },
          },
        },
      });

      if (!setlistItem) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Setlist item not found or you don't have access",
        });
      }

      const updated = await ctx.prisma.performanceSetlistItem.update({
        where: { id: input.setlistItemId },
        data: { notes: input.notes },
        include: {
          song: true,
        },
      });

      return updated;
    }),

  // Copy setlist from another performance or round
  copySetlist: protectedProcedure
    .input(
      z.object({
        performanceId: z.string(),
        sourceType: z.enum(["performance", "round"]),
        sourceId: z.string().or(z.number()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is a member
      const performance = await ctx.prisma.performance.findFirst({
        where: {
          id: input.performanceId,
          group: {
            members: {
              some: {
                userId: ctx.session.userId,
              },
            },
          },
        },
      });

      if (!performance) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Performance not found or you don't have access",
        });
      }

      let songs: Array<{ songId: number; position: number; notes?: string }> = [];

      if (input.sourceType === "performance") {
        const sourcePerformance = await ctx.prisma.performance.findFirst({
          where: {
            id: input.sourceId as string,
            group: {
              members: {
                some: {
                  userId: ctx.session.userId,
                },
              },
            },
          },
          include: {
            setlist: {
              orderBy: { position: "asc" },
            },
          },
        });

        if (!sourcePerformance) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Source performance not found",
          });
        }

        songs = sourcePerformance.setlist.map((item) => ({
          songId: item.songId,
          position: item.position,
          notes: item.notes ?? undefined,
        }));
      } else {
        const round = await ctx.prisma.round.findUnique({
          where: { id: input.sourceId as number },
          include: {
            roundItems: {
              orderBy: { position: "asc" },
            },
          },
        });

        if (!round) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Source round not found",
          });
        }

        songs = round.roundItems.map((item) => ({
          songId: item.songId,
          position: item.position,
        }));
      }

      // Add all songs to setlist
      await ctx.prisma.performanceSetlistItem.createMany({
        data: songs.map((song) => ({
          performanceId: input.performanceId,
          songId: song.songId,
          position: song.position,
          notes: song.notes,
        })),
        skipDuplicates: true,
      });

      return { success: true, count: songs.length };
    }),
});

