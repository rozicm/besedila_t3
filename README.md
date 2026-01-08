# Band Song Manager

A full-stack T3 stack application for managing band songs, creating setlists, and running performances with PDF export functionality. Perfect for bands, ensembles, and musical groups.

## Features

### Core Features
- **Song Management**: Create, edit, delete, and organize songs with lyrics, metadata (key, genre, accordion tuning, instrument)
- **Setlists (Rounds)**: Create rounds (setlists) by selecting and ordering songs
- **Drag & Drop**: Reorder songs in rounds with drag-and-drop functionality
- **Performance Mode**: Select multiple rounds to run a performance with navigation controls
- **PDF Export**: Export performance setlists to PDF for printing
- **Dark/Light Theme**: Toggle between light and dark themes
- **Authentication**: Clerk authentication with secure user management

### Multi-Group Support 🎵
- **Groups Management**: Create and manage multiple bands/ensembles
- **Member Invitations**: Invite other musicians to join your groups via email
- **Role-Based Access**: Owner, Admin, and Member roles with different permissions
- **Group-Specific Content**: Each group has its own songs and performances

### Performance Calendar 📅
- **Calendar View**: Visual calendar showing all upcoming performances
- **Performance Management**: Create, edit, and delete performances with details:
  - Date and time
  - Location
  - Duration
  - Description and notes
- **Custom Setlists**: Each performance has its own setlist
- **Setlist Builder**: Add songs, reorder them, add performance-specific notes
- **Copy Setlists**: Copy setlists from other performances or rounds

### Push Notifications 🔔
- **Performance Reminders**: Automatic notifications 1 day and 1 hour before performances
- **Group Invitations**: Get notified when someone invites you to a group
- **Web Push API**: Browser-based push notifications (works on mobile and desktop)
- **Easy Setup**: One-click notification enable/disable in settings

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **TypeScript**: Full type safety
- **Database**: PostgreSQL (via Supabase)
- **ORM**: Prisma
- **API**: tRPC for type-safe API routes
- **Authentication**: Clerk for secure user management
- **UI**: React with Tailwind CSS and Radix UI components
- **Drag & Drop**: @dnd-kit/core and @dnd-kit/sortable
- **PDF Export**: html2pdf.js
- **Notifications**: Web Push API with Service Workers

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

3. Set up environment variables by creating a `.env` file:
```
# Database
DATABASE_URL=your-database-url
DIRECT_URL=your-direct-database-url

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
CLERK_SECRET_KEY=your-clerk-secret-key

# Web Push Notifications (optional - generate with: npx web-push generate-vapid-keys)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key

# Supabase (optional)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
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
│   ├── api/               # API routes (tRPC)
│   ├── songs/             # Songs page
│   ├── rounds/            # Rounds page
│   ├── performance/       # Performance page
│   ├── groups/            # Groups management pages
│   │   └── [id]/         # Group detail page
│   ├── calendar/          # Performance calendar pages
│   │   └── [id]/         # Performance detail & setlist page
│   ├── settings/
│   │   └── notifications/ # Notification settings page
│   └── layout.tsx         # Root layout
├── components/
│   ├── ui/                # Reusable UI components (Button, Card, Modal, etc.)
│   ├── layout/            # Layout components (Nav)
│   ├── providers.tsx      # Provider components
│   └── theme-provider.tsx # Theme context provider
├── server/
│   ├── api/
│   │   ├── routers/       # tRPC routers
│   │   │   ├── songs.ts   # Songs CRUD
│   │   │   ├── rounds.ts  # Rounds CRUD
│   │   │   ├── groups.ts  # Groups, members, invitations
│   │   │   ├── performances.ts  # Performances & setlists
│   │   │   └── notifications.ts # Push notifications
│   │   ├── root.ts        # Root router
│   │   └── trpc.ts        # tRPC configuration
│   └── db.ts              # Prisma client
├── utils/
│   ├── api.ts             # tRPC client
│   └── push-notifications.ts  # Push notification utilities
├── lib/
│   ├── env.ts             # Environment validation
│   └── utils.ts           # Utility functions
├── middleware.ts          # Clerk authentication middleware
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

### Core Models
- `Song`: Songs with lyrics and metadata
- `Round`: Setlists/performance rounds
- `RoundItem`: Junction table connecting songs to rounds with positions

### Multi-Group Models
- `Group`: Bands/ensembles with name and description
- `GroupMember`: Members of groups with roles (OWNER, ADMIN, MEMBER)
- `GroupInvitation`: Email invitations to join groups
- `GroupSong`: Junction table for group-specific songs

### Performance Models
- `Performance`: Scheduled performances with date, location, duration
- `PerformanceSetlistItem`: Songs in a performance setlist with position and notes
- `PerformanceReminder`: Scheduled reminders for performances

### Notification Models
- `PushSubscription`: User's push notification subscriptions

### Authentication Models
- `User`, `Account`, `Session`, `VerificationToken`: Clerk authentication models

## Mobile App

The project includes a React Native mobile app built with Expo and expo-router.

### Mobile App Setup

1. Navigate to the mobile app directory:
```bash
cd apps/mobile
```

2. Install dependencies (if not already installed):
```bash
npm install
```

3. Set up environment variables by creating a `.env` file in `apps/mobile/`:
   - **EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY**: Get this from your [Clerk Dashboard](https://dashboard.clerk.com/) → API Keys → Publishable Key (same key as your web app uses)
   - **EXPO_PUBLIC_TRPC_URL**: 
     - **Production**: `https://your-vercel-url.vercel.app/api/trpc` (get from Vercel dashboard)
     - **Local**: `http://localhost:3000/api/trpc` (or use your computer's IP for physical devices)

   See `apps/mobile/ENV_SETUP.md` for detailed instructions on where to get these values.

4. Start the Expo development server:
```bash
npm run mobile
```

Or from the root directory:
```bash
npm run mobile
```

5. Use the Expo Go app on your phone to scan the QR code, or press `i` for iOS simulator, `a` for Android emulator.

### Mobile App Features

- **Authentication**: Sign in and sign up with Clerk
- **Protected Routes**: Automatic route protection based on auth state
- **tRPC Integration**: Full type-safe API access with JWT token authentication
- **Session Persistence**: Secure token storage using expo-secure-store

### Mobile App Structure

```
apps/mobile/
├── app/
│   ├── (auth)/          # Authentication screens
│   │   ├── sign-in.tsx
│   │   └── sign-up.tsx
│   └── (app)/            # Protected app screens
│       └── index.tsx     # Home screen
├── lib/
│   └── trpc.ts           # tRPC client configuration
└── providers/
    ├── clerk-provider.tsx
    └── trpc-provider.tsx
```

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
- `npm run mobile`: Start Expo development server for mobile app

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

### Groups

1. **Create a Group**: Click "Nova skupina" and enter group name and description
2. **Invite Members**: 
   - Click the invite button on a group card
   - Enter member's email address
   - Select role (Member or Admin)
   - They'll receive an invitation to join
3. **Manage Members**: 
   - View all group members
   - Change member roles (Owner only)
   - Remove members (Owner/Admin)
4. **Leave a Group**: Click the leave button (not available for owners)

### Calendar & Performances

1. **View Calendar**: See all upcoming performances in a visual calendar
2. **Create Performance**:
   - Click "Nov nastop"
   - Select the group
   - Enter performance details (name, date, location, duration)
   - Add optional description and notes
3. **Build Setlist**:
   - Open a performance from the calendar
   - Click "Dodaj pesem" to add songs
   - Drag and drop to reorder songs
   - Add performance-specific notes to each song
   - Copy setlists from other performances or rounds
4. **Performance Reminders**: Automatic notifications sent 1 day and 1 hour before

### Rounds

- Create rounds (setlists) with a name and description
- Select songs to add to the round
- Reorder songs by dragging and dropping
- Remove songs from rounds
- Delete rounds
- Use rounds as templates for performance setlists

### Performance Mode

- Select one or more rounds to include in the performance
- Navigate through songs with Previous/Next buttons
- Toggle lyrics display
- Export the performance to PDF for printing
- View print-optimized layout

### Push Notifications

1. Navigate to Settings → Notifications
2. Click the toggle to enable notifications
3. Allow notifications in your browser when prompted
4. You'll receive notifications for:
   - Performance reminders (1 day and 1 hour before)
   - Group invitations
   - Setlist changes

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


