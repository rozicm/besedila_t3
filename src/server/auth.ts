import NextAuth, { type DefaultSession } from "next-auth";
import Discord from "next-auth/providers/discord";
import { env } from "~/lib/env";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

// Skip adapter during build - auth is disabled anyway
// Set adapter to undefined to avoid build-time database connection
export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: undefined as any,
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

