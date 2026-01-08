import { httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import superjson from "superjson";
import type { AppRouter } from "../types/router";
import Constants from "expo-constants";

export const api = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  // Get the tRPC URL from environment variables
  const trpcUrl = Constants.expoConfig?.extra?.trpcUrl || process.env.EXPO_PUBLIC_TRPC_URL;
  
  if (trpcUrl) {
    return trpcUrl;
  }
  
  // Fallback for development
  if (__DEV__) {
    return "http://localhost:3000/api/trpc";
  }
  
  throw new Error("EXPO_PUBLIC_TRPC_URL is required");
};

export const createTRPCClient = (getToken: () => Promise<string | null>) => {
  return api.createClient({
    transformer: superjson,
    links: [
      httpBatchLink({
        url: getBaseUrl(),
        async headers() {
          const token = await getToken();
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

