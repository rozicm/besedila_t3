import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Running production database migration...')
  
  // This will create all tables based on your Prisma schema
  await prisma.$executeRaw`
    -- Create songs table
    CREATE TABLE IF NOT EXISTS "songs" (
      "id" SERIAL PRIMARY KEY,
      "title" TEXT NOT NULL,
      "lyrics" TEXT NOT NULL,
      "genre" TEXT NOT NULL,
      "key" TEXT,
      "notes" TEXT,
      "favorite" BOOLEAN NOT NULL DEFAULT false,
      "harmonica" TEXT,
      "bas_bariton" TEXT,
      "inserted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updated_at" TIMESTAMP(3) NOT NULL
    );

    -- Create rounds table
    CREATE TABLE IF NOT EXISTS "rounds" (
      "id" SERIAL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "description" TEXT,
      "inserted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updated_at" TIMESTAMP(3) NOT NULL
    );

    -- Create round_items table
    CREATE TABLE IF NOT EXISTS "round_items" (
      "id" SERIAL PRIMARY KEY,
      "position" INTEGER NOT NULL,
      "round_id" INTEGER NOT NULL,
      "song_id" INTEGER NOT NULL,
      "inserted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updated_at" TIMESTAMP(3) NOT NULL,
      FOREIGN KEY ("round_id") REFERENCES "rounds"("id") ON DELETE CASCADE,
      FOREIGN KEY ("song_id") REFERENCES "songs"("id") ON DELETE CASCADE
    );

    -- Create posts table
    CREATE TABLE IF NOT EXISTS "Post" (
      "id" SERIAL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      "createdById" TEXT NOT NULL
    );

    -- Create users table
    CREATE TABLE IF NOT EXISTS "User" (
      "id" TEXT PRIMARY KEY,
      "name" TEXT,
      "email" TEXT UNIQUE,
      "emailVerified" TIMESTAMP(3),
      "image" TEXT
    );

    -- Create accounts table
    CREATE TABLE IF NOT EXISTS "Account" (
      "id" TEXT PRIMARY KEY,
      "userId" TEXT NOT NULL,
      "type" TEXT NOT NULL,
      "provider" TEXT NOT NULL,
      "providerAccountId" TEXT NOT NULL,
      "refresh_token" TEXT,
      "access_token" TEXT,
      "expires_at" INTEGER,
      "token_type" TEXT,
      "scope" TEXT,
      "id_token" TEXT,
      "session_state" TEXT,
      "refresh_token_expires_in" INTEGER,
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
      UNIQUE("provider", "providerAccountId")
    );

    -- Create sessions table
    CREATE TABLE IF NOT EXISTS "Session" (
      "id" TEXT PRIMARY KEY,
      "sessionToken" TEXT UNIQUE NOT NULL,
      "userId" TEXT NOT NULL,
      "expires" TIMESTAMP(3) NOT NULL,
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
    );

    -- Create verification tokens table
    CREATE TABLE IF NOT EXISTS "VerificationToken" (
      "identifier" TEXT NOT NULL,
      "token" TEXT UNIQUE NOT NULL,
      "expires" TIMESTAMP(3) NOT NULL,
      UNIQUE("identifier", "token")
    );

    -- Create indexes
    CREATE INDEX IF NOT EXISTS "songs_title_idx" ON "songs"("title");
    CREATE INDEX IF NOT EXISTS "songs_genre_idx" ON "songs"("genre");
    CREATE INDEX IF NOT EXISTS "rounds_name_idx" ON "rounds"("name");
    CREATE INDEX IF NOT EXISTS "round_items_round_id_idx" ON "round_items"("round_id");
    CREATE INDEX IF NOT EXISTS "round_items_song_id_idx" ON "round_items"("song_id");
    CREATE INDEX IF NOT EXISTS "round_items_position_idx" ON "round_items"("position");
    CREATE INDEX IF NOT EXISTS "Post_name_idx" ON "Post"("name");

    -- Add foreign key constraint for posts
    ALTER TABLE "Post" ADD CONSTRAINT "Post_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  `

  console.log('✅ Production database migration completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Migration failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
