"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { TRPCProvider } from "~/providers/trpc-provider";

export function Providers({
  children,
  clerkPublishableKey,
}: {
  children: React.ReactNode;
  clerkPublishableKey: string;
}) {
  if (!clerkPublishableKey) {
    throw new Error(
      "Missing Clerk publishable key. Set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY or CLERK_PUBLISHABLE_KEY."
    );
  }

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
    <ClerkProvider publishableKey={clerkPublishableKey}>
      <QueryClientProvider client={queryClient}>
        <TRPCProvider queryClient={queryClient}>{children}</TRPCProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}
