# Setup Guide for Band Song Manager

## Prerequisites

- Node.js 18 or higher
- PostgreSQL database (or use Supabase)
- Discord OAuth app (for authentication)

## Installation Steps

### 1. Clone and Install Dependencies

```bash
npm install
```

### 2. Database Setup

Create a PostgreSQL database. If using Supabase:
- Create a new Supabase project
- Copy the connection strings

### 3. Environment Variables

Copy `env.example` to `.env` and fill in the values:

```bash
cp env.example .env
```

Key variables to configure:
- `DATABASE_URL`: PostgreSQL connection string with pgbouncer
- `DIRECT_URL`: Direct PostgreSQL connection (for migrations)
- `AUTH_SECRET`: Generate with `openssl rand -base64 32`
- `AUTH_DISCORD_ID` and `AUTH_DISCORD_SECRET`: From Discord Developer Portal

### 4. Discord OAuth Setup

1. Go to https://discord.com/developers/applications
2. Create a new application
3. Go to OAuth2 section
4. Copy Client ID and Client Secret
5. Add redirect URI: `http://localhost:3000/api/auth/callback/discord`
6. Save the credentials in `.env`

### 5. Database Migrations

```bash
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run migrations
```

### 6. Start Development Server

```bash
npm run dev
```

Open http://localhost:3000

## Troubleshooting

### Database Connection Issues

- Ensure database is accessible
- Check connection strings in `.env`
- Verify DIRECT_URL for migrations

### Authentication Issues

- Verify Discord OAuth credentials
- Check redirect URI matches in Discord dashboard
- Ensure AUTH_SECRET is set

### Type Errors

```bash
npm run db:generate
```

### Build Errors

Clear Next.js cache:
```bash
rm -rf .next
npm install
npm run build
```

## Production Deployment

### Vercel

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

The project includes `vercel.json` configuration.

### Database Migrations in Production

```bash
npm run db:migrate
```

Ensure DIRECT_URL is configured for migration commands.

## Useful Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:studio` - Open Prisma Studio
- `npm run lint` - Run linter
- `npm test` - Run tests


