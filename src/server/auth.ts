import NextAuth, { type DefaultSession } from "next-auth";
import Discord from "next-auth/providers/discord";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "~/server/db";
import { env } from "~/lib/env";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

// Create auth config - adapter will only be used at runtime, not during build
export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    Discord({
      clientId: env.AUTH_DISCORD_ID || "dummy",
      clientSecret: env.AUTH_DISCORD_SECRET || "dummy",
    }),
  ],
  callbacks: {
    session: ({ session, user }: any) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
      },
    }),
  },
  pages: {
    signIn: "/auth/signin",
  },
  trustHost: env.AUTH_TRUST_HOST,
  secret: env.AUTH_SECRET,
});

