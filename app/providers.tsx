"use client";

import { SWRConfig } from "swr";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig 
      value={{
        fetcher: async (url: string) => {
          const res = await fetch(url, { credentials: 'include' });
          if (!res.ok) {
            const error = new Error('An error occurred while fetching the data.');
            (error as any).info = await res.json();
            (error as any).status = res.status;
            throw error;
          }
          return res.json();
        },
        revalidateOnFocus: true,
        revalidateIfStale: true,
        dedupingInterval: 5000,
        errorRetryCount: 3,
      }}
    >
      {children}
    </SWRConfig>
  );
}
