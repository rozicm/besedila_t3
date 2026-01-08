import { z } from "zod";
import { createTRPCRouter, protectedProcedure, ensureUserExists } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const notificationsRouter = createTRPCRouter({
  // Subscribe to push notifications
  subscribe: protectedProcedure
    .input(
      z.object({
        endpoint: z.string(),
        p256dh: z.string(),
        auth: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Ensure user exists in database before creating subscription
      await ensureUserExists(ctx.session.userId);

      // Check if subscription already exists
      const existing = await ctx.prisma.pushSubscription.findUnique({
        where: { endpoint: input.endpoint },
      });

      if (existing) {
        // Update if it's the same user, otherwise delete old and create new
        if (existing.userId === ctx.session.userId) {
          return existing;
        }
        await ctx.prisma.pushSubscription.delete({
          where: { endpoint: input.endpoint },
        });
      }

      const subscription = await ctx.prisma.pushSubscription.create({
        data: {
          userId: ctx.session.userId,
          endpoint: input.endpoint,
          p256dh: input.p256dh,
          auth: input.auth,
        },
      });

      return subscription;
    }),

  // Unsubscribe from push notifications
  unsubscribe: protectedProcedure
    .input(
      z.object({
        endpoint: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.pushSubscription.deleteMany({
        where: {
          endpoint: input.endpoint,
          userId: ctx.session.userId,
        },
      });

      return { success: true };
    }),

  // Get user's subscriptions
  getSubscriptions: protectedProcedure.query(async ({ ctx }) => {
    const subscriptions = await ctx.prisma.pushSubscription.findMany({
      where: {
        userId: ctx.session.userId,
      },
    });

    return subscriptions;
  }),

  // Get pending reminders that need to be sent
  getPendingReminders: protectedProcedure.query(async ({ ctx }) => {
    const now = new Date();
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

    const reminders = await ctx.prisma.performanceReminder.findMany({
      where: {
        sent: false,
        reminderTime: {
          lte: fiveMinutesFromNow,
        },
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
      include: {
        performance: {
          include: {
            group: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        reminderTime: "asc",
      },
    });

    return reminders;
  }),

  // Get all reminders for the current user (for notifications list)
  getMyReminders: protectedProcedure.query(async ({ ctx }) => {
    const reminders = await ctx.prisma.performanceReminder.findMany({
      where: {
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
      include: {
        performance: {
          include: {
            group: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        reminderTime: "desc",
      },
      take: 50, // Limit to last 50 reminders
    });

    return reminders;
  }),

  // Mark reminder as sent
  markReminderSent: protectedProcedure
    .input(
      z.object({
        reminderId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.performanceReminder.update({
        where: { id: input.reminderId },
        data: { sent: true },
      });

      return { success: true };
    }),

  // Test notification (for debugging)
  testNotification: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        body: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // This would be called from a background job or API route
      // Just return success for now
      return {
        success: true,
        message: "Test notification triggered",
        data: input,
      };
    }),
});

