"use client";

import { useState, useEffect } from "react";

interface InaugurationCountdownBarProps {
  cafeSlug: string;
}

export default function InaugurationCountdownBar({ cafeSlug }: InaugurationCountdownBarProps) {
  const isIgniteAeros = cafeSlug?.toLowerCase().includes("ignite-aeros");

  // Live timer state
  const [timeLeft, setTimeLeft] = useState<{
    hours: string;
    minutes: string;
    seconds: string;
    phase: "before_free_tea" | "during_free_tea" | "expired";
  } | null>(null);

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date();

      // Today condition: Check if today is 18 Nov 2026
      // Start of Inauguration Day: 2026-11-18T00:00:00+05:30
      // Target start of Free Tea: 18 Nov 2026, 18:00:00 (6 PM)
      // Target end of Free Tea: 18 Nov 2026, 20:00:00 (8 PM)
      const startOfDay = new Date("2026-11-18T00:00:00+05:30");
      const startFreeTea = new Date("2026-11-18T18:00:00+05:30");
      const endFreeTea = new Date("2026-11-18T20:00:00+05:30");

      // Only for today (18 Nov 2026) and before end of free tea (8 PM)
      if (now < startOfDay || now > endFreeTea) {
        setTimeLeft({ hours: "00", minutes: "00", seconds: "00", phase: "expired" });
        return;
      }

      let diff = 0;
      let currentPhase: "before_free_tea" | "during_free_tea" = "before_free_tea";

      if (now < startFreeTea) {
        // Counting down to 6:00 PM Free Tea!
        diff = startFreeTea.getTime() - now.getTime();
        currentPhase = "before_free_tea";
      } else {
        // Active Free Tea (6:00 PM to 8:00 PM) - counting down to 8:00 PM!
        diff = endFreeTea.getTime() - now.getTime();
        currentPhase = "during_free_tea";
      }

      if (diff <= 0) diff = 0;

      const totalSeconds = Math.floor(diff / 1000);
      const h = Math.floor(totalSeconds / 3600);
      const m = Math.floor((totalSeconds % 3600) / 60);
      const s = totalSeconds % 60;

      setTimeLeft({
        hours: String(h).padStart(2, "0"),
        minutes: String(m).padStart(2, "0"),
        seconds: String(s).padStart(2, "0"),
        phase: currentPhase,
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [cafeSlug]);

  if (!isIgniteAeros || !timeLeft || timeLeft.phase === "expired") {
    return null;
  }

  return (
    <div className="mx-4 mt-2.5 mb-1 animate-fade-in">
      <div className="relative overflow-hidden rounded-xl border border-amber-500/35 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 text-white shadow-md px-3.5 py-2 flex items-center justify-between gap-3 transition-all">
        {/* Subtle glowing accent gradient edge */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-red-600 via-amber-500 to-red-600" />

        {/* Icon & Live Countdown */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {timeLeft.phase === "during_free_tea" ? (
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shrink-0 animate-pulse">
              <span className="text-sm">🔥</span>
            </div>
          ) : (
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
              <span className="text-sm">☕</span>
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 leading-none flex-wrap">
              <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                {timeLeft.phase === "during_free_tea" ? (
                  <span className="text-emerald-400 font-black">Free Tea Live!</span>
                ) : (
                  "Free Tea Starts In"
                )}
              </span>

              {/* Countdown Digits */}
              <span className="font-mono text-xs sm:text-sm font-bold text-white bg-black/60 px-2 py-0.5 rounded border border-white/10 tracking-widest shadow-inner">
                {timeLeft.hours}:{timeLeft.minutes}:{timeLeft.seconds}
              </span>
            </div>

            <p className="text-[10px] text-zinc-400 font-medium truncate mt-1">
              {timeLeft.phase === "during_free_tea"
                ? "Complimentary Tea at the counter (6 PM – 8 PM)"
                : "6 PM – 8 PM Today • Complimentary Tea for all guests"}
            </p>
          </div>
        </div>

        {/* Minimal Timing Tag on Right */}
        <div className="shrink-0">
          <span className="px-2 py-1 rounded-md bg-white/10 text-zinc-300 border border-white/10 text-[10px] font-bold uppercase tracking-wider">
            6 - 8 PM
          </span>
        </div>
      </div>
    </div>
  );
}
