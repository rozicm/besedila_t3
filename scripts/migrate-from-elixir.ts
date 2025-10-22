import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Client as PgClient } from 'pg';

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

async function main() {
  const SOURCE_DATABASE_URL = requireEnv('SOURCE_DATABASE_URL');
  // Target URLs are read by Prisma from env (DATABASE_URL / DIRECT_URL)

  const prisma = new PrismaClient();
  const pg = new PgClient({ connectionString: SOURCE_DATABASE_URL });

  await pg.connect();

  // Fetch data from source (Elixir) DB
  const songsRes = await pg.query(
    'SELECT id, title, lyrics, genre, key, notes, favorite, harmonica, bas_bariton, inserted_at, updated_at FROM songs ORDER BY id ASC'
  );
  const roundsRes = await pg.query(
    'SELECT id, name, description, inserted_at, updated_at FROM rounds ORDER BY id ASC'
  );
  const roundItemsRes = await pg.query(
    'SELECT id, position, round_id, song_id, inserted_at, updated_at FROM round_items ORDER BY id ASC'
  );

  console.log(
    `Source counts → songs: ${songsRes.rowCount}, rounds: ${roundsRes.rowCount}, round_items: ${roundItemsRes.rowCount}`
  );

  // Helper to batch createMany calls to avoid size limits
  const batch = async <T>(items: T[], size: number, fn: (chunk: T[]) => Promise<unknown>) => {
    for (let i = 0; i < items.length; i += size) {
      // eslint-disable-next-line no-await-in-loop
      await fn(items.slice(i, i + size));
    }
  };

  // Insert into target (Supabase) via Prisma, preserving IDs and coercing types
  if (songsRes.rowCount) {
    const data = songsRes.rows.map((r) => ({
      id: Number(r.id),
      title: r.title as string,
      lyrics: r.lyrics as string,
      genre: String(r.genre),
      key: r.key ?? null,
      notes: r.notes ?? null,
      favorite: Boolean(r.favorite),
      harmonica: r.harmonica ?? null,
      bas_bariton: r.bas_bariton ?? null,
      createdAt: new Date(r.inserted_at),
      updatedAt: new Date(r.updated_at),
    }));
    await batch(data, 500, async (chunk) => {
      await prisma.song.createMany({ data: chunk, skipDuplicates: true });
    });
  }

  if (roundsRes.rowCount) {
    const data = roundsRes.rows.map((r) => ({
      id: Number(r.id),
      name: r.name as string,
      description: r.description ?? null,
      createdAt: new Date(r.inserted_at),
      updatedAt: new Date(r.updated_at),
    }));
    await batch(data, 500, async (chunk) => {
      await prisma.round.createMany({ data: chunk, skipDuplicates: true });
    });
  }

  if (roundItemsRes.rowCount) {
    const data = roundItemsRes.rows.map((r) => ({
      id: Number(r.id),
      position: Number(r.position),
      roundId: Number(r.round_id),
      songId: Number(r.song_id),
      createdAt: new Date(r.inserted_at),
      updatedAt: new Date(r.updated_at),
    }));
    await batch(data, 500, async (chunk) => {
      await prisma.roundItem.createMany({ data: chunk, skipDuplicates: true });
    });
  }

  // Reset sequences to MAX(id)
  await prisma.$executeRawUnsafe(
    "SELECT setval(pg_get_serial_sequence('songs','id'), COALESCE((SELECT MAX(id) FROM songs), 1));"
  );
  await prisma.$executeRawUnsafe(
    "SELECT setval(pg_get_serial_sequence('rounds','id'), COALESCE((SELECT MAX(id) FROM rounds), 1));"
  );
  await prisma.$executeRawUnsafe(
    "SELECT setval(pg_get_serial_sequence('round_items','id'), COALESCE((SELECT MAX(id) FROM round_items), 1));"
  );

  await pg.end();
  await prisma.$disconnect();

  console.log('Migration completed.');
}

main().catch(async (err) => {
  console.error(err);
  process.exitCode = 1;
});


