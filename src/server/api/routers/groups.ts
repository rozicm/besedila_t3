import { z } from "zod";
import { createTRPCRouter, protectedProcedure, ensureUserExists } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { GroupRole, InvitationStatus } from "@prisma/client";

export const groupsRouter = createTRPCRouter({
  // List all groups for the current user
  list: protectedProcedure.query(async ({ ctx }) => {
    const groups = await ctx.prisma.group.findMany({
      where: {
        members: {
          some: {
            userId: ctx.session.userId,
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
        _count: {
          select: {
            members: true,
            performances: true,
            songs: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return groups;
  }),

  // Get a specific group
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const group = await ctx.prisma.group.findFirst({
        where: {
          id: input.id,
          members: {
            some: {
              userId: ctx.session.userId,
            },
          },
        },
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                },
              },
            },
          },
          performances: {
            orderBy: {
              date: "desc",
            },
            take: 5,
          },
          _count: {
            select: {
              members: true,
              performances: true,
              songs: true,
            },
          },
        },
      });

      if (!group) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Group not found or you don't have access",
        });
      }

      return group;
    }),

  // Create a new group
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Ensure user exists in database before creating group
      await ensureUserExists(ctx.session.userId);

      const group = await ctx.prisma.group.create({
        data: {
          name: input.name,
          description: input.description,
          members: {
            create: {
              userId: ctx.session.userId,
              role: GroupRole.OWNER,
            },
          },
        },
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                },
              },
            },
          },
        },
      });

      return group;
    }),

  // Update a group
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is owner or admin
      const member = await ctx.prisma.groupMember.findFirst({
        where: {
          groupId: input.id,
          userId: ctx.session.userId,
          role: {
            in: [GroupRole.OWNER, GroupRole.ADMIN],
          },
        },
      });

      if (!member) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to update this group",
        });
      }

      const { id, ...data } = input;

      const group = await ctx.prisma.group.update({
        where: { id },
        data,
      });

      return group;
    }),

  // Delete a group
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if user is owner
      const member = await ctx.prisma.groupMember.findFirst({
        where: {
          groupId: input.id,
          userId: ctx.session.userId,
          role: GroupRole.OWNER,
        },
      });

      if (!member) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only the owner can delete the group",
        });
      }

      await ctx.prisma.group.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  // Invite a user to the group
  invite: protectedProcedure
    .input(
      z.object({
        groupId: z.string(),
        email: z.string().email(),
        role: z.enum(["MEMBER", "ADMIN"]).optional().default("MEMBER"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is owner or admin
      const member = await ctx.prisma.groupMember.findFirst({
        where: {
          groupId: input.groupId,
          userId: ctx.session.userId,
          role: {
            in: [GroupRole.OWNER, GroupRole.ADMIN],
          },
        },
      });

      if (!member) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to invite users",
        });
      }

      // Check if user is already a member
      const existingMember = await ctx.prisma.groupMember.findFirst({
        where: {
          groupId: input.groupId,
          user: {
            email: input.email,
          },
        },
      });

      if (existingMember) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User is already a member of this group",
        });
      }

      // Check if there's already a pending invitation
      const existingInvitation = await ctx.prisma.groupInvitation.findFirst({
        where: {
          groupId: input.groupId,
          email: input.email,
          status: InvitationStatus.PENDING,
        },
      });

      if (existingInvitation) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User already has a pending invitation",
        });
      }

      // Find if user exists
      const invitedUser = await ctx.prisma.user.findUnique({
        where: { email: input.email },
      });

      // Get group info for notification
      const group = await ctx.prisma.group.findUnique({
        where: { id: input.groupId },
        select: { name: true },
      });

      // Create invitation
      const invitation = await ctx.prisma.groupInvitation.create({
        data: {
          groupId: input.groupId,
          email: input.email,
          userId: invitedUser?.id,
          role: input.role as GroupRole,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
      });

      // Send push notification if user exists and has subscriptions
      if (invitedUser?.id) {
        const subscriptions = await ctx.prisma.pushSubscription.findMany({
          where: { userId: invitedUser.id },
        });

        // Send push notification to all user's devices
        // Note: This requires web-push library and VAPID keys configured
        // For now, we'll just log it. In production, implement actual push sending.
        if (subscriptions.length > 0 && group) {
          // TODO: Implement actual push notification sending using web-push library
          // Example:
          // import webpush from 'web-push';
          // for (const sub of subscriptions) {
          //   await webpush.sendNotification(
          //     { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          //     JSON.stringify({
          //       title: 'Nova povabila v skupino',
          //       body: `Povabljeni ste v skupino "${group.name}"`,
          //       icon: '/favicon.ico',
          //       badge: '/favicon.ico',
          //       data: { type: 'group_invitation', invitationId: invitation.id, groupId: input.groupId }
          //     })
          //   );
          // }
        }
      }

      // TODO: Send email notification

      return invitation;
    }),

  // List invitations for a group
  invitations: protectedProcedure
    .input(z.object({ groupId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Check if user is owner or admin
      const member = await ctx.prisma.groupMember.findFirst({
        where: {
          groupId: input.groupId,
          userId: ctx.session.userId,
          role: {
            in: [GroupRole.OWNER, GroupRole.ADMIN],
          },
        },
      });

      if (!member) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to view invitations",
        });
      }

      const invitations = await ctx.prisma.groupInvitation.findMany({
        where: {
          groupId: input.groupId,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return invitations;
    }),

  // Get invitations for the current user
  myInvitations: protectedProcedure.query(async ({ ctx }) => {
    // Ensure user exists first (to sync email from Clerk)
    await ensureUserExists(ctx.session.userId);

    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.session.userId },
      select: { email: true },
    });

    // Find invitations by email OR by userId (if invitation was linked to user)
    const whereConditions: any[] = [
      {
        status: InvitationStatus.PENDING,
        expiresAt: {
          gt: new Date(),
        },
      },
    ];

    // Add email condition if user has email
    if (user?.email) {
      whereConditions.push({
        email: user.email,
      });
    }

    // Also search by userId (in case invitation was created with userId)
    whereConditions.push({
      userId: ctx.session.userId,
    });

    const invitations = await ctx.prisma.groupInvitation.findMany({
      where: {
        AND: [
          {
            status: InvitationStatus.PENDING,
            expiresAt: {
              gt: new Date(),
            },
          },
          {
            OR: user?.email
              ? [
                  { email: user.email },
                  { userId: ctx.session.userId },
                ]
              : [{ userId: ctx.session.userId }],
          },
        ],
      },
      include: {
        group: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return invitations;
  }),

  // Accept invitation
  acceptInvitation: protectedProcedure
    .input(z.object({ invitationId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.session.userId },
        select: { email: true },
      });

      if (!user?.email) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User email not found",
        });
      }

      const invitation = await ctx.prisma.groupInvitation.findFirst({
        where: {
          id: input.invitationId,
          email: user.email,
          status: InvitationStatus.PENDING,
          expiresAt: {
            gt: new Date(),
          },
        },
      });

      if (!invitation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invitation not found or expired",
        });
      }

      // Create membership
      await ctx.prisma.groupMember.create({
        data: {
          groupId: invitation.groupId,
          userId: ctx.session.userId,
          role: invitation.role,
        },
      });

      // Update invitation status
      await ctx.prisma.groupInvitation.update({
        where: { id: input.invitationId },
        data: {
          status: InvitationStatus.ACCEPTED,
          userId: ctx.session.userId,
        },
      });

      return { success: true };
    }),

  // Decline invitation
  declineInvitation: protectedProcedure
    .input(z.object({ invitationId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.session.userId },
        select: { email: true },
      });

      if (!user?.email) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User email not found",
        });
      }

      const invitation = await ctx.prisma.groupInvitation.findFirst({
        where: {
          id: input.invitationId,
          email: user.email,
          status: InvitationStatus.PENDING,
        },
      });

      if (!invitation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invitation not found",
        });
      }

      await ctx.prisma.groupInvitation.update({
        where: { id: input.invitationId },
        data: {
          status: InvitationStatus.DECLINED,
        },
      });

      return { success: true };
    }),

  // Remove a member from the group
  removeMember: protectedProcedure
    .input(
      z.object({
        groupId: z.string(),
        memberId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is owner or admin
      const currentMember = await ctx.prisma.groupMember.findFirst({
        where: {
          groupId: input.groupId,
          userId: ctx.session.userId,
          role: {
            in: [GroupRole.OWNER, GroupRole.ADMIN],
          },
        },
      });

      if (!currentMember) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to remove members",
        });
      }

      const memberToRemove = await ctx.prisma.groupMember.findUnique({
        where: { id: input.memberId },
      });

      if (!memberToRemove || memberToRemove.groupId !== input.groupId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Member not found",
        });
      }

      // Can't remove the owner
      if (memberToRemove.role === GroupRole.OWNER) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot remove the group owner",
        });
      }

      // Admin can't remove another admin (only owner can)
      if (
        currentMember.role === GroupRole.ADMIN &&
        memberToRemove.role === GroupRole.ADMIN
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admins cannot remove other admins",
        });
      }

      await ctx.prisma.groupMember.delete({
        where: { id: input.memberId },
      });

      return { success: true };
    }),

  // Leave a group
  leave: protectedProcedure
    .input(z.object({ groupId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const member = await ctx.prisma.groupMember.findFirst({
        where: {
          groupId: input.groupId,
          userId: ctx.session.userId,
        },
      });

      if (!member) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "You are not a member of this group",
        });
      }

      // Owner can't leave (must transfer ownership or delete group)
      if (member.role === GroupRole.OWNER) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Owner cannot leave the group. Transfer ownership or delete the group.",
        });
      }

      await ctx.prisma.groupMember.delete({
        where: { id: member.id },
      });

      return { success: true };
    }),

  // Update member role
  updateMemberRole: protectedProcedure
    .input(
      z.object({
        groupId: z.string(),
        memberId: z.string(),
        role: z.enum(["ADMIN", "MEMBER"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is owner
      const currentMember = await ctx.prisma.groupMember.findFirst({
        where: {
          groupId: input.groupId,
          userId: ctx.session.userId,
          role: GroupRole.OWNER,
        },
      });

      if (!currentMember) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only the owner can change member roles",
        });
      }

      const memberToUpdate = await ctx.prisma.groupMember.findUnique({
        where: { id: input.memberId },
      });

      if (!memberToUpdate || memberToUpdate.groupId !== input.groupId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Member not found",
        });
      }

      // Can't change owner's role
      if (memberToUpdate.role === GroupRole.OWNER) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot change the owner's role",
        });
      }

      await ctx.prisma.groupMember.update({
        where: { id: input.memberId },
        data: { role: input.role as GroupRole },
      });

      return { success: true };
    }),
});

