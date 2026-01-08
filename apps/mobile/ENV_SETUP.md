# Mobile App Environment Variables Setup

This guide explains where to get the environment variables needed for the mobile app.

## Required Environment Variables

You need to create a `.env` file in the `apps/mobile/` directory with **ONLY** these two variables:

```
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
EXPO_PUBLIC_TRPC_URL=your-trpc-url
```

### ❌ Variables You DON'T Need

The mobile app **does NOT need** these variables from your root `.env` file:

- ❌ `DATABASE_URL` - Mobile app doesn't connect to the database directly
- ❌ `DIRECT_URL` - Database connection, not needed
- ❌ `CLERK_SECRET_KEY` - Server-side secret, should never be in mobile app
- ❌ `NEXTAUTH_URL` / `AUTH_URL` - Only for NextAuth (web app only)
- ❌ `AUTH_SECRET` - NextAuth secret, not used by mobile
- ❌ `AUTH_DISCORD_ID` / `AUTH_DISCORD_SECRET` - OAuth secrets, not needed
- ❌ `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Not used by mobile
- ❌ Any other database or server secrets

**Why?** The mobile app only communicates with your tRPC API (which runs on your Next.js server). All database operations, authentication verification, and business logic happen on the server. The mobile app is just a client that sends requests to your API.

## 1. EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY

**Where to get it:**

1. Go to your [Clerk Dashboard](https://dashboard.clerk.com/)
2. Select your application (or create one if you haven't)
3. Navigate to **API Keys** in the sidebar
4. You'll see two keys:
   - **Publishable key** (starts with `pk_test_` or `pk_live_`)
   - **Secret key** (starts with `sk_test_` or `sk_live_`)
5. Copy the **Publishable key** (the one that starts with `pk_`)

**Note:** This is the same key you're already using in your web app's `.env` file as `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`. You can reuse the same value!

**Example:**
```
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## 2. EXPO_PUBLIC_TRPC_URL

**Where to get it:**

### For Production (Vercel Deployment):

Your app is deployed at: **https://zalet.vercel.app/**

Your tRPC URL is: `https://zalet.vercel.app/api/trpc`

**Example:**
```
EXPO_PUBLIC_TRPC_URL=https://zalet.vercel.app/api/trpc
```

### For Local Development:

If you're running the web app locally on `http://localhost:3000`, use:

```
EXPO_PUBLIC_TRPC_URL=http://localhost:3000/api/trpc
```

**Note:** For local development, make sure:
- Your Next.js dev server is running (`npm run dev` in the root directory)
- Your phone/emulator can access `localhost:3000` (you may need to use your computer's IP address instead, see below)

### Using Your Computer's IP Address (for physical devices):

If you're testing on a physical device and `localhost` doesn't work:

1. Find your computer's local IP address:
   - **Mac/Linux:** Run `ifconfig | grep "inet "` in terminal
   - **Windows:** Run `ipconfig` in command prompt
   - Look for an IP like `192.168.1.xxx` or `10.0.0.xxx`

2. Use that IP address:
   ```
   EXPO_PUBLIC_TRPC_URL=http://192.168.1.100:3000/api/trpc
   ```

## Complete Example `.env` File

Create `apps/mobile/.env` with **ONLY** these two lines:

```env
# Clerk Authentication (get from https://dashboard.clerk.com/)
# This is the SAME value as NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY in your root .env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# tRPC API URL - Your backend API endpoint
# For production (Vercel):
EXPO_PUBLIC_TRPC_URL=https://zalet.vercel.app/api/trpc

# For local development:
# EXPO_PUBLIC_TRPC_URL=http://localhost:3000/api/trpc
# Or use your computer's IP if testing on physical device:
# EXPO_PUBLIC_TRPC_URL=http://192.168.1.100:3000/api/trpc
```

**That's it!** You only need these two variables. Don't copy other variables from your root `.env` file - they're not needed and some (like secrets) should never be in a mobile app.

## Quick Setup Steps

1. **Get Clerk Key:**
   - Go to https://dashboard.clerk.com/
   - Copy your Publishable Key from API Keys section
   - (Same key as your web app uses)

2. **Get tRPC URL:**
   - **Production:** `https://zalet.vercel.app/api/trpc` (your deployed app)
   - **Local:** Use `http://localhost:3000/api/trpc` (or your computer's IP)

3. **Create the file:**
   ```bash
   cd apps/mobile
   touch .env
   ```

4. **Add the variables:**
   ```bash
   # Open in your editor and paste the values
   code .env  # or nano .env, or use your preferred editor
   ```

5. **Start the app:**
   ```bash
   npm run mobile
   ```

## Do I Need to Run the Web App Too?

**It depends on which URL you're using:**

### ✅ Using Production URL (Recommended)
If your `.env` has:
```
EXPO_PUBLIC_TRPC_URL=https://zalet.vercel.app/api/trpc
```

**You only need to run:**
```bash
npm run mobile
```

The mobile app connects to your deployed Vercel app, so `npm run dev` is **not needed**.

### ⚠️ Using Local Development URL
If your `.env` has:
```
EXPO_PUBLIC_TRPC_URL=http://localhost:3000/api/trpc
```

**You need BOTH running:**

**Terminal 1** - Start the web server:
```bash
npm run dev
```

**Terminal 2** - Start the mobile app:
```bash
npm run mobile
```

**Recommendation:** Use the production URL (`https://zalet.vercel.app/api/trpc`) so you only need to run the mobile app. This is simpler and matches the production environment.

## Troubleshooting

### "Missing Clerk publishable key" error
- Make sure `.env` file exists in `apps/mobile/` directory
- Check that the variable name is exactly `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`
- Restart Expo after creating/updating `.env`

### "EXPO_PUBLIC_TRPC_URL is required" error
- Make sure you've set `EXPO_PUBLIC_TRPC_URL` in your `.env` file
- For local development, ensure your Next.js server is running
- Check that the URL format is correct (should end with `/api/trpc`)

### Connection refused / Network error
- For local development, make sure your Next.js dev server is running
- If using a physical device, try using your computer's IP address instead of `localhost`
- Check that your firewall isn't blocking the connection
- For production, verify your Vercel deployment is live and accessible

