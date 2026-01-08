#!/bin/bash

# Script to create mobile app .env from root .env file

ROOT_ENV="../.env"
MOBILE_ENV=".env"

if [ ! -f "$ROOT_ENV" ]; then
    echo "❌ Root .env file not found at $ROOT_ENV"
    echo "Please create it first or run this script from apps/mobile directory"
    exit 1
fi

echo "📋 Creating mobile app .env from root .env..."

# Read Clerk key from root .env (try both variable names)
CLERK_KEY=$(grep -E "^NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=|^CLERK_PUBLISHABLE_KEY=" "$ROOT_ENV" | head -1 | cut -d '=' -f2- | tr -d '"' | tr -d "'")

if [ -z "$CLERK_KEY" ]; then
    echo "⚠️  Warning: Could not find Clerk publishable key in root .env"
    echo "   You'll need to add it manually"
    CLERK_KEY="your-clerk-publishable-key-here"
fi

# Determine TRPC URL
echo ""
echo "What tRPC URL do you want to use?"
echo "1) Production (Vercel) - https://zalet.vercel.app/api/trpc"
echo "2) Local development - http://localhost:3000/api/trpc"
echo "3) Custom URL"
read -p "Enter choice [1-3]: " choice

case $choice in
    1)
        TRPC_URL="https://zalet.vercel.app/api/trpc"
        ;;
    2)
        TRPC_URL="http://localhost:3000/api/trpc"
        ;;
    3)
        read -p "Enter custom tRPC URL: " TRPC_URL
        ;;
    *)
        echo "Invalid choice, using production URL"
        TRPC_URL="https://zalet.vercel.app/api/trpc"
        ;;
esac

# Create mobile .env file
cat > "$MOBILE_ENV" << EOF
# Mobile App Environment Variables
# Generated from root .env file

# Clerk Authentication (copied from root .env)
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=${CLERK_KEY}

# tRPC API URL
EXPO_PUBLIC_TRPC_URL=${TRPC_URL}
EOF

echo ""
echo "✅ Created $MOBILE_ENV"
echo ""
echo "Contents:"
cat "$MOBILE_ENV"
echo ""
echo "✨ Done! You can now run 'npm run mobile'"

