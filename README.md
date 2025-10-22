# 🎵 Besedila - Beautiful Music Management App

A stunning, modern music management application built with the T3 Stack, featuring beautiful glassmorphism effects, gradient backgrounds, and smooth animations.

## ✨ Features

- 🎨 **Stunning Design**: Modern UI with glassmorphism effects and gradient backgrounds
- 🎵 **Music Collection**: Manage your songs with beautiful card layouts
- 🎭 **Performance Rounds**: Organize musical performances with style
- 📱 **Responsive**: Optimized for all screen sizes
- 🌙 **Dark Mode**: Enhanced color schemes for both light and dark themes
- ✨ **Smooth Animations**: Micro-interactions and hover effects throughout
- 🔐 **Authentication**: Secure user authentication with NextAuth.js

## 🚀 Tech Stack

- [Next.js](https://nextjs.org) - React framework
- [NextAuth.js](https://next-auth.js.org) - Authentication
- [Prisma](https://prisma.io) - Database ORM
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [tRPC](https://trpc.io) - Type-safe APIs
- [TypeScript](https://www.typescriptlang.org) - Type safety

## 🛠️ Development

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

## 🌐 Deployment

### Vercel Deployment

1. **Set up environment variables in Vercel:**
   - Go to your Vercel project settings
   - Navigate to "Environment Variables"
   - Add the following variables:

   ```bash
   # Required
   AUTH_SECRET=your-secret-key-here
   DATABASE_URL=your-database-url-here
   
   # Optional (for Discord auth)
   AUTH_DISCORD_ID=your-discord-client-id
   AUTH_DISCORD_SECRET=your-discord-client-secret
   ```

2. **Generate AUTH_SECRET:**
   ```bash
   openssl rand -base64 32
   ```

3. **Database Setup:**
   - For production, use a PostgreSQL database (recommended: [Neon](https://neon.tech), [PlanetScale](https://planetscale.com), or [Supabase](https://supabase.com))
   - Update your `DATABASE_URL` in Vercel environment variables

4. **Deploy:**
   ```bash
   # Push to GitHub (if not already done)
   git push origin main
   
   # Connect to Vercel and deploy
   # Vercel will automatically deploy from your GitHub repository
   ```

### Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Database
DATABASE_URL="file:./dev.db"

# Auth
AUTH_SECRET="your-auth-secret-here"
AUTH_DISCORD_ID="your-discord-client-id"
AUTH_DISCORD_SECRET="your-discord-client-secret"
```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── layout/         # Layout components (Navigation, Layout)
│   └── ui/            # Base UI components (Button, Card, etc.)
├── pages/             # Next.js pages
│   ├── songs/         # Songs management pages
│   └── rounds/        # Performance rounds pages
├── server/           # Backend logic
│   ├── api/          # tRPC routers
│   └── auth/         # Authentication config
└── styles/           # Global styles and animations
```

## 🎨 Design Features

- **Glassmorphism Effects**: Modern frosted glass appearance
- **Gradient Backgrounds**: Beautiful color transitions
- **Smooth Animations**: Hover effects, scaling, and rotation
- **Modern Shadows**: Layered shadow system for depth
- **Responsive Design**: Mobile-first approach
- **Dark Mode Support**: Enhanced color schemes

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [T3 Stack](https://create.t3.gg/)
- Icons by [Lucide](https://lucide.dev/)
- Styling with [Tailwind CSS](https://tailwindcss.com/)
