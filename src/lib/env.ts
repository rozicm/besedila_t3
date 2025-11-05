// Environment variable export with fallbacks for build time
export const env = {
  DATABASE_URL: process.env.DATABASE_URL ?? "postgresql://user:password@localhost:5432/db",
  DIRECT_URL: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "postgresql://user:password@localhost:5432/db",
  AUTH_SECRET: process.env.AUTH_SECRET ?? "fallback-secret-for-development-only",
  AUTH_DISCORD_ID: process.env.AUTH_DISCORD_ID ?? "",
  AUTH_DISCORD_SECRET: process.env.AUTH_DISCORD_SECRET ?? "",
  AUTH_URL: process.env.AUTH_URL,
  AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST === "true",
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  NEXT_PUBLIC_NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? process.env.AUTH_URL,
  NODE_ENV: process.env.NODE_ENV ?? "development",
  // Clerk
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "",
  CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY ?? "",
  CLERK_SIGN_IN_URL: process.env.CLERK_SIGN_IN_URL ?? "/sign-in",
  CLERK_SIGN_UP_URL: process.env.CLERK_SIGN_UP_URL ?? "/sign-up",
  CLERK_AFTER_SIGN_IN_URL: process.env.CLERK_AFTER_SIGN_IN_URL ?? "/",
  CLERK_AFTER_SIGN_UP_URL: process.env.CLERK_AFTER_SIGN_UP_URL ?? "/",
};

