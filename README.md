# Band Song Manager

A full-stack T3 stack application for managing band songs, creating setlists, and running performances with PDF export functionality.

## Features

- **Song Management**: Create, edit, delete, and organize songs with lyrics, metadata (key, genre, accordion tuning, instrument)
- **Setlists (Rounds)**: Create rounds (setlists) by selecting and ordering songs
- **Drag & Drop**: Reorder songs in rounds with drag-and-drop functionality
- **Performance Mode**: Select multiple rounds to run a performance with navigation controls
- **PDF Export**: Export performance setlists to PDF for printing
- **Dark/Light Theme**: Toggle between light and dark themes
- **Authentication**: NextAuth v5 with Discord provider

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **TypeScript**: Full type safety
- **Database**: PostgreSQL (via Supabase)
- **ORM**: Prisma
- **API**: tRPC
- **Authentication**: NextAuth v5
- **UI**: React with Tailwind CSS
- **Drag & Drop**: @dnd-kit/core
- **PDF Export**: html2pdf.js

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- PostgreSQL database (or use Supabase)

### Installation

1. Clone the repository

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables by creating a `.env` file (see `.env.example`):
```
DATABASE_URL=your-database-url
DIRECT_URL=your-direct-database-url
AUTH_SECRET=your-auth-secret
AUTH_DISCORD_ID=your-discord-client-id
AUTH_DISCORD_SECRET=your-discord-client-secret
# ... other env variables
```

4. Generate Prisma client:
```bash
npm run db:generate
```

5. Run database migrations:
```bash
npm run db:migrate
```

6. Start the development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes (auth, tRPC)
│   ├── songs/             # Songs page
│   ├── rounds/            # Rounds page
│   ├── performance/       # Performance page
│   └── layout.tsx         # Root layout
├── components/
│   ├── ui/                # Reusable UI components
│   ├── layout/            # Layout components (Nav)
│   └── providers.tsx      # Provider components
├── server/
│   ├── api/
│   │   ├── routers/       # tRPC routers
│   │   ├── root.ts        # Root router
│   │   └── trpc.ts        # tRPC configuration
│   ├── auth.ts            # NextAuth configuration
│   └── db.ts              # Prisma client
├── lib/
│   ├── env.ts             # Environment validation
│   └── utils.ts           # Utility functions
└── styles/
    └── globals.css        # Global styles with theme variables
```

## Environment Variables

The application requires the following environment variables:

- `DATABASE_URL`: PostgreSQL connection string (with pgbouncer)
- `DIRECT_URL`: Direct PostgreSQL connection string (for migrations)
- `AUTH_SECRET`: Secret for NextAuth
- `AUTH_DISCORD_ID`: Discord OAuth client ID
- `AUTH_DISCORD_SECRET`: Discord OAuth client secret
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon key

## Database Schema

The application uses the following main models:

- `Song`: Songs with lyrics and metadata
- `Round`: Setlists/performance rounds
- `RoundItem`: Junction table connecting songs to rounds with positions
- NextAuth models: `User`, `Account`, `Session`, etc.

## Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Run ESLint
- `npm run db:push`: Push schema to database (dev)
- `npm run db:migrate`: Run database migrations
- `npm run db:generate`: Generate Prisma client
- `npm run db:studio`: Open Prisma Studio
- `npm test`: Run tests

## Deployment

The application is ready for deployment on Vercel:

1. Connect your repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy

The `vercel.json` configuration is included.

## Usage

### Songs

- Create songs with title, lyrics, genre, key, and other metadata
- Filter songs by search, genre, tuning, instrument, and favorites
- Edit or delete songs
- Mark songs as favorites

### Rounds

- Create rounds (setlists) with a name and description
- Select songs to add to the round
- Reorder songs by dragging and dropping
- Remove songs from rounds
- Delete rounds

### Performance

- Select one or more rounds to include in the performance
- Navigate through songs with Previous/Next buttons
- Toggle lyrics display
- Export the performance to PDF for printing
- View print-optimized layout

## Testing

Run tests with:
```bash
npm test
```

Test coverage includes:
- Unit tests for tRPC routers
- Component tests for key UI components

## License

MIT


