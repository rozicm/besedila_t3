import { PrismaAdapter } from "@auth/prisma-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";

import { db } from "~/server/db";
import { env } from "~/env.js";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
// Allowed email addresses
const ALLOWED_EMAILS = [
  'rozicmatic@gmail.com',
  'prasnikar6@gmail.com',
  'anja.kersic5@gmail.com',
  'lenart.pavlic23@gmail.com'
];

export const authConfig: NextAuthConfig = {
  providers: [
    DiscordProvider,
  ],
  adapter: PrismaAdapter(db),
  callbacks: {
    signIn: async ({ user, account, profile }) => {
      // Check if the user's email is in the allowed list
      if (user.email && ALLOWED_EMAILS.includes(user.email)) {
        return true;
      }
      
      // If email is not allowed, return false to deny access
      console.log(`Access denied for email: ${user.email}`);
      return false;
    },
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
      },
    }),
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "database",
  },
};
