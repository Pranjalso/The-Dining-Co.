"use client";

import { useState, useEffect } from "react";
import { Sparkles, Check } from "lucide-react";

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
    phase: "before_free_tea" | "during_free_tea" | "after_free_tea" | "expired";
  } | null>(null);

  const [applied, setApplied] = useState(false);

  useEffect(() => {
    // Check if offer already applied in session
    try {
      const existing = window.sessionStorage.getItem(`sd:appliedOffer:${cafeSlug}`);
      if (existing) {
        const parsed = JSON.parse(existing);
        if (parsed?.code === "IGNITE15") {
          setApplied(true);
        }
      }
    } catch {}

    const calculateTime = () => {
      const now = new Date();

      // Today condition: Check if today is 18 Nov 2026
      // Start of Inauguration Day: 2026-11-18T00:00:00+05:30
      // Target start of Free Tea: 18 Nov 2026, 18:00:00 (6 PM)
      // Target end of Free Tea: 18 Nov 2026, 20:00:00 (8 PM)
      // Target end of Day: 18 Nov 2026, 23:59:59 (Midnight)
      const startOfDay = new Date("2026-11-18T00:00:00+05:30");
      const startFreeTea = new Date("2026-11-18T18:00:00+05:30");
      const endFreeTea = new Date("2026-11-18T20:00:00+05:30");
      const endOfDay = new Date("2026-11-18T23:59:59+05:30");

      // Only for today (18 Nov 2026)
      if (now < startOfDay || now > endOfDay) {
        setTimeLeft({ hours: "00", minutes: "00", seconds: "00", phase: "expired" });
        return;
      }

      let diff = 0;
      let currentPhase: "before_free_tea" | "during_free_tea" | "after_free_tea" = "before_free_tea";

      if (now < startFreeTea) {
        // Counting down to 6:00 PM Free Tea!
        diff = startFreeTea.getTime() - now.getTime();
        currentPhase = "before_free_tea";
      } else if (now < endFreeTea) {
        // Active Free Tea (6:00 PM to 8:00 PM) - counting down to 8:00 PM!
        diff = endFreeTea.getTime() - now.getTime();
        currentPhase = "during_free_tea";
      } else {
        // After 8:00 PM - counting down to Midnight end of 15% offer!
        diff = endOfDay.getTime() - now.getTime();
        currentPhase = "after_free_tea";
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

  const handleApply15 = (e: React.MouseEvent) => {
    e.stopPropagation();
    const payload = {
      code: "IGNITE15",
      discountType: "percentage",
      discountValue: "15% OFF",
      minOrderAmount: 0,
    };
    try {
      window.sessionStorage.setItem(`sd:appliedOffer:${cafeSlug}`, JSON.stringify(payload));
      window.localStorage.setItem(`sd:appliedOffer:${cafeSlug}`, JSON.stringify(payload));
      setApplied(true);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("storage"));
      }
    } catch {}
  };

  return (
    <div className="mx-4 mt-2.5 mb-1 animate-fade-in">
      <div className="relative overflow-hidden rounded-xl border border-amber-500/35 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 text-white shadow-md px-3 py-2 flex items-center justify-between gap-2.5 transition-all">
        {/* Subtle glowing accent gradient edge */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-red-600 via-amber-500 to-red-600" />

        {/* Left Section: Live Countdown */}
        <div className="flex items-center gap-2 min-w-0">
          {timeLeft.phase === "during_free_tea" ? (
            <div className="relative flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shrink-0 animate-pulse">
              <span className="text-xs">🔥</span>
            </div>
          ) : (
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
              <span className="text-xs">☕</span>
            </div>
          )}

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400">
                {timeLeft.phase === "during_free_tea" ? (
                  <span className="text-emerald-400 font-black">Free Tea Live!</span>
                ) : timeLeft.phase === "after_free_tea" ? (
                  "15% Off Ends In"
                ) : (
                  "Free Tea Starts In"
                )}
              </span>

              {/* Countdown Digits */}
              <span className="font-mono text-xs font-bold text-white bg-black/60 px-1.5 py-0.5 rounded border border-white/10 tracking-wider">
                {timeLeft.hours}:{timeLeft.minutes}:{timeLeft.seconds}
              </span>
            </div>

            <p className="text-[9px] text-zinc-400 font-medium truncate mt-0.5">
              {timeLeft.phase === "during_free_tea"
                ? "Complimentary Tea at counter (6-8 PM)"
                : timeLeft.phase === "after_free_tea"
                ? "Inauguration 15% OFF valid till midnight"
                : "6 PM – 8 PM Today • Free Tea for all"}
            </p>
          </div>
        </div>

        {/* Right Section: 15% Off Promo Code Pill */}
        <div className="shrink-0 flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleApply15}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
              applied
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                : "bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white shadow-xs"
            }`}
            title="Apply 15% Inauguration Discount"
          >
            {applied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span>15% APPLIED</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3 h-3 text-amber-200" />
                <span>15% OFF</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
