import { PrismaClient } from '@prisma/client';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const SOURCE_DATABASE_URL = process.env.SOURCE_DATABASE_URL;
const TARGET_DATABASE_URL = process.env.DIRECT_URL;

if (!SOURCE_DATABASE_URL || !TARGET_DATABASE_URL) {
  console.error('Missing database URL in environment variables');
  process.exit(1);
}

const sourcePool = new Pool({
  connectionString: SOURCE_DATABASE_URL,
});

const targetPrisma = new PrismaClient({
  datasources: {
    db: {
      url: TARGET_DATABASE_URL,
    },
  },
});

async function main() {
  console.log('Starting data migration...');

  // Step 1: Delete all data from target database
  console.log('Deleting all existing data...');
  await targetPrisma.roundItem.deleteMany();
  await targetPrisma.song.deleteMany();
  await targetPrisma.round.deleteMany();
  console.log('✓ Deleted all existing data');

  // Step 2: Import songs from source database
  console.log('Importing songs...');
  const songsResult = await sourcePool.query('SELECT * FROM songs ORDER BY id');
  const songs = songsResult.rows;
  
  const songIdMap = new Map<number, number>();

  for (const song of songs) {
    const newSong = await targetPrisma.song.create({
      data: {
        title: song.title,
        lyrics: song.lyrics,
        genre: song.genre,
        key: song.key,
        notes: song.notes,
        favorite: song.favorite,
        harmonica: song.harmonica,
        accordionTuning: song.accordion_tuning as any,
        instrument: song.instrument as any,
        bas_bariton: song.bas_bariton,
        createdAt: song.inserted_at,
        updatedAt: song.updated_at,
      },
    });
    songIdMap.set(song.id, newSong.id);
  }
  console.log(`✓ Imported ${songs.length} songs`);

  // Step 3: Import rounds
  console.log('Importing rounds...');
  const roundsResult = await sourcePool.query('SELECT * FROM rounds ORDER BY id');
  const rounds = roundsResult.rows;
  
  const roundIdMap = new Map<number, number>();

  for (const round of rounds) {
    const newRound = await targetPrisma.round.create({
      data: {
        name: round.name,
        description: round.description,
        createdAt: round.inserted_at,
        updatedAt: round.updated_at,
      },
    });
    roundIdMap.set(round.id, newRound.id);
  }
  console.log(`✓ Imported ${rounds.length} rounds`);

  // Step 4: Import round items with mapped IDs
  console.log('Importing round items...');
  const roundItemsResult = await sourcePool.query('SELECT * FROM round_items ORDER BY id');
  const roundItems = roundItemsResult.rows;

  for (const item of roundItems) {
    const newRoundId = roundIdMap.get(item.round_id);
    const newSongId = songIdMap.get(item.song_id);
    
    if (!newRoundId || !newSongId) {
      console.warn(`Skipping round item ${item.id}: missing round_id or song_id mapping`);
      continue;
    }

    await targetPrisma.roundItem.create({
      data: {
        roundId: newRoundId,
        songId: newSongId,
        position: item.position,
        createdAt: item.inserted_at,
        updatedAt: item.updated_at,
      },
    });
  }
  console.log(`✓ Imported ${roundItems.length} round items`);

  // Cleanup
  await sourcePool.end();
  await targetPrisma.$disconnect();

  console.log('✓ Data migration completed successfully!');
}

main()
  .catch((error) => {
    console.error('Error during migration:', error);
    process.exit(1);
  });
