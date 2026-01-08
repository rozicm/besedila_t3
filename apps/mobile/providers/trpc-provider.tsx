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
          },
        },
      })
  );

  const trpcClient = useMemo(
    () =>
      createTRPCClient(async () => {
        try {
          return await getToken();
        } catch (error) {
          return null;
        }
      }),
    [getToken]
  );

  return (
    <api.Provider client={trpcClient} queryClient={queryClient}>
      {children}
    </api.Provider>
  );
}

