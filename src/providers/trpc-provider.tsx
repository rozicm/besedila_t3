"use client";

import { useState } from "react";
import { api, trpcClientConfig } from "~/utils/api";
import { QueryClient } from "@tanstack/react-query";

export function TRPCProvider({
  children,
  queryClient,
}: {
  children: React.ReactNode;
  queryClient: QueryClient;
}) {
  const [trpcClient] = useState(() => api.createClient(trpcClientConfig));

  return <api.Provider client={trpcClient} queryClient={queryClient}>{children}</api.Provider>;
}

