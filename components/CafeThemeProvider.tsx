"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { getPusherClient } from "@/lib/pusher-client";

export default function CafeThemeProvider({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const menupages = (params?.menupages as string) || "";

  // SWR fetch cafe theme
  const { data } = useSWR(
    menupages ? `/api/cafes/${menupages}/theme` : null,
    {
      revalidateOnFocus: true,
      dedupingInterval: 5000,
      onSuccess: (res: any) => {
        if (res?.success && res.data?.theme && typeof document !== "undefined") {
          document.documentElement.setAttribute("data-theme", res.data.theme);
        }
      },
    }
  );

  // Sync theme to root element on data change or local storage fallback
  useEffect(() => {
    if (typeof document === "undefined") return;

    if (data?.data?.theme) {
      document.documentElement.setAttribute("data-theme", data.data.theme);
    } else if (menupages) {
      const cached = window.localStorage.getItem(`sd:theme:${menupages}`);
      if (cached) {
        document.documentElement.setAttribute("data-theme", cached);
      }
    }
  }, [data, menupages]);

  // Real-time Pusher listener across all cafe pages
  useEffect(() => {
    if (!menupages) return;
    const pusher = getPusherClient();
    if (!pusher) return;

    const channelName = `cafe-${String(menupages).toLowerCase()}`;
    const channel = pusher.subscribe(channelName);

    const handleThemeUpdate = (payload?: any) => {
      if (payload?.theme && typeof document !== "undefined") {
        document.documentElement.setAttribute("data-theme", payload.theme);
        try {
          window.localStorage.setItem(`sd:theme:${menupages}`, payload.theme);
        } catch {}
      }
    };

    channel.bind("theme-updated", handleThemeUpdate);

    return () => {
      channel.unbind("theme-updated", handleThemeUpdate);
      pusher.unsubscribe(channelName);
    };
  }, [menupages]);

  return <>{children}</>;
}

