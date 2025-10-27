// Simple environment variable export
export const env = {
  DATABASE_URL: process.env.DATABASE_URL!,
  DIRECT_URL: process.env.DIRECT_URL!,
  AUTH_SECRET: process.env.AUTH_SECRET!,
  AUTH_DISCORD_ID: process.env.AUTH_DISCORD_ID!,
  AUTH_DISCORD_SECRET: process.env.AUTH_DISCORD_SECRET!,
  AUTH_URL: process.env.AUTH_URL,
  AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST === "true",
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  NEXT_PUBLIC_NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? process.env.AUTH_URL,
  NODE_ENV: process.env.NODE_ENV ?? "development",
};

