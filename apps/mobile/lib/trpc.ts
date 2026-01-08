import { httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import superjson from "superjson";
import type { AppRouter } from "../types/router";
import Constants from "expo-constants";

// @ts-expect-error - tRPC type inference can be complex across packages
export const api = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  // Get the tRPC URL from environment variables
  const trpcUrl = Constants.expoConfig?.extra?.trpcUrl || process.env.EXPO_PUBLIC_TRPC_URL;
  
  if (__DEV__) {
    console.log('[TRPC] Config URL:', Constants.expoConfig?.extra?.trpcUrl);
    console.log('[TRPC] Env URL:', process.env.EXPO_PUBLIC_TRPC_URL);
  }
  
  if (trpcUrl) {
    if (__DEV__) {
      console.log('[TRPC] Using URL:', trpcUrl);
    }
    return trpcUrl;
  }
  
  // Fallback for development - use your production URL or local IP
  if (__DEV__) {
    // Change this to your production URL or local network IP
    const fallbackUrl = "https://zalet.vercel.app/api/trpc";
    console.log('[TRPC] Using fallback URL:', fallbackUrl);
    return fallbackUrl;
  }
  
  throw new Error("EXPO_PUBLIC_TRPC_URL is required");
};

export const createTRPCClient = (getToken: () => Promise<string | null>) => {
  const url = getBaseUrl();
  
  return api.createClient({
    links: [
      httpBatchLink({
        url,
        transformer: superjson,
        async headers() {
          const token = await getToken();
          if (__DEV__) {
            console.log('[TRPC] Request to:', url);
            console.log('[TRPC] Auth token:', token ? `${token.substring(0, 20)}...` : 'none');
          }
          if (token) {
            return {
              authorization: `Bearer ${token}`,
            };
          }
          return {};
        },
      }),
    ],
  });
};
