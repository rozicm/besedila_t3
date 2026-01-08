import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { api, createTRPCClient } from "../lib/trpc";
import { useAuth } from "@clerk/clerk-expo";

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth();
  
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 2,
            refetchOnWindowFocus: false,
          },
          mutations: {
            retry: 1,
          },
        },
      })
  );

  const trpcClient = useMemo(
    () =>
      createTRPCClient(async () => {
        try {
          const token = await getToken();
          if (__DEV__) {
            console.log('[TRPC] Token obtained:', token ? 'Yes' : 'No');
          }
          return token;
        } catch (error) {
          console.error('[TRPC] Error getting token:', error);
          return null;
        }
      }),
    [getToken]
  );

  return (
    <QueryClientProvider client={queryClient}>
      <api.Provider client={trpcClient} queryClient={queryClient}>
        {children}
      </api.Provider>
    </QueryClientProvider>
  );
}
