# Discord OAuth Setup Guide

This guide will help you set up Discord OAuth authentication for the Besedila app.

## Step 1: Create a Discord Application

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application"
3. Give your application a name (e.g., "Besedila Music Manager")
4. Click "Create"

## Step 2: Configure OAuth2 Settings

1. In your Discord application dashboard, go to the "OAuth2" section
2. Click on "General" under OAuth2
3. Add the following redirect URIs:
   - For development: `http://localhost:3000/api/auth/callback/discord`
   - For production: `https://yourdomain.com/api/auth/callback/discord`

## Step 3: Get Client Credentials

1. In the OAuth2 > General section, copy your:
   - **Client ID**
   - **Client Secret** (click "Reset Secret" if needed)

## Step 4: Update Environment Variables

Update your `.env.local` file with the Discord credentials:

```env
# Discord OAuth Configuration
DISCORD_CLIENT_ID=your_discord_client_id_here
DISCORD_CLIENT_SECRET=your_discord_client_secret_here

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secure_random_string_here

# Database
DATABASE_URL=file:./dev.db
```

### Generate NEXTAUTH_SECRET

You can generate a secure secret using:

```bash
openssl rand -base64 32
```

Or use an online generator like [generate-secret.vercel.app](https://generate-secret.vercel.app/32)

## Step 5: Configure Discord Bot (Optional)

If you want to add Discord bot features later:

1. Go to the "Bot" section in your Discord application
2. Click "Add Bot"
3. Copy the bot token (keep it secure)
4. Add it to your environment variables:

```env
DISCORD_BOT_TOKEN=your_bot_token_here
```

## Step 6: Set OAuth2 Scopes

In the Discord Developer Portal, under OAuth2 > General, make sure these scopes are enabled:

- `identify` - Access to user's basic account information
- `email` - Access to user's email address

## Step 7: Test the Authentication

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000`
3. Click "Sign in with Discord"
4. You should be redirected to Discord's OAuth page
5. After authorization, you'll be redirected back to your app

## Step 8: Production Deployment

When deploying to production:

1. Update the redirect URI in Discord Developer Portal to your production domain
2. Update `NEXTAUTH_URL` in your environment variables to your production URL
3. Make sure all environment variables are set in your hosting platform

## Troubleshooting

### Common Issues:

1. **"Invalid redirect URI"**
   - Make sure the redirect URI in Discord matches exactly with your app's callback URL
   - Check for trailing slashes and protocol (http vs https)

2. **"Invalid client"**
   - Verify your Client ID and Client Secret are correct
   - Make sure the Discord application is not deleted or disabled

3. **"Access denied"**
   - Check if the required scopes are enabled in Discord Developer Portal
   - Ensure the user has granted the necessary permissions

4. **Session not persisting**
   - Verify your database is properly configured
   - Check if the Prisma adapter is working correctly

### Debug Mode:

To enable debug logging, add this to your `.env.local`:

```env
NEXTAUTH_DEBUG=true
```

## Security Notes

- Never commit your `.env.local` file to version control
- Use strong, unique secrets for production
- Regularly rotate your Discord Client Secret
- Consider implementing rate limiting for authentication endpoints

## Additional Features

The current setup includes:

- ✅ Discord OAuth2 authentication
- ✅ User profile information (name, email, avatar)
- ✅ Session management with database storage
- ✅ Custom sign-in and error pages
- ✅ Modern UI with Discord branding
- ✅ Secure token handling

## Next Steps

After setting up Discord authentication, you can:

1. Add user-specific features (personal song collections, etc.)
2. Implement role-based access control
3. Add Discord bot integration for notifications
4. Create user profiles and settings pages
5. Add social features (sharing songs, collaborative playlists)

## Support

If you encounter any issues:

1. Check the [NextAuth.js Discord Provider documentation](https://next-auth.js.org/providers/discord)
2. Review the [Discord OAuth2 documentation](https://discord.com/developers/docs/topics/oauth2)
3. Check the application logs for detailed error messages
