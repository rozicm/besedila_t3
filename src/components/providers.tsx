"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { TRPCProvider } from "~/providers/trpc-provider";
import { ClerkProvider } from "@clerk/nextjs";
import { env } from "~/lib/env";

export function Providers({ children }: { children: React.ReactNode }) {
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

  return (
    <ClerkProvider publishableKey={env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
      <QueryClientProvider client={queryClient}>
        <TRPCProvider queryClient={queryClient}>
          {children}
        </TRPCProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}
