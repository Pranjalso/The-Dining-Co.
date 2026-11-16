"use client";

import { motion, AnimatePresence } from "framer-motion";
import { BellRing, Check, Volume2, Sparkles, Utensils } from "lucide-react";
import { useEffect, useRef } from "react";

type OrderPreparedModalProps = {
  isOpen: boolean;
  orderNumber: string | number;
  tableNumber?: string | number;
  onAcknowledge: () => void;
};

export default function OrderPreparedModal({
  isOpen,
  orderNumber,
  tableNumber,
  onAcknowledge,
}: OrderPreparedModalProps) {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Play repeating notification bell / alarm chime pattern
  const playSirenPulse = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtxRef.current || audioCtxRef.current.state === "closed") {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const now = ctx.currentTime;

      // Pulse 1: High crisp alert chime (880 Hz - A5)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(880, now);
      osc1.frequency.exponentialRampToValueAtTime(1174.66, now + 0.12); // Upward chime to D6
      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.28);

      // Pulse 2: Resonant chime (1318.51 Hz - E6)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(1318.51, now + 0.14);
      gain2.gain.setValueAtTime(0.35, now + 0.14);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.14);
      osc2.stop(now + 0.45);

      // Pulse 3: Rich bell harmonic (1760 Hz - A6)
      const osc3 = ctx.createOscillator();
      const gain3 = ctx.createGain();
      osc3.type = "sine";
      osc3.frequency.setValueAtTime(1760, now + 0.26);
      gain3.gain.setValueAtTime(0.25, now + 0.26);
      gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
      osc3.connect(gain3);
      gain3.connect(ctx.destination);
      osc3.start(now + 0.26);
      osc3.stop(now + 0.7);
    } catch (e) {
      console.warn("Audio chime autoplay blocked or unsupported:", e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      // Play immediately
      playSirenPulse();

      // Repeat siren chime every 1.5 seconds continuously until acknowledged
      intervalRef.current = setInterval(() => {
        playSirenPulse();
      }, 1500);

      // Trigger device haptic vibration if supported (phone)
      if (typeof window !== "undefined" && "vibrate" in navigator) {
        try {
          navigator.vibrate([200, 100, 200, 100, 300]);
        } catch {}
      }
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        try {
          audioCtxRef.current.close();
        } catch {}
        audioCtxRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        try {
          audioCtxRef.current.close();
        } catch {}
        audioCtxRef.current = null;
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 30 }}
          transition={{ type: "spring", damping: 22, stiffness: 300 }}
          className="w-full max-w-sm bg-[#FBF8F3] border-2 border-emerald-500 rounded-3xl p-6 text-center shadow-2xl relative overflow-hidden"
        >
          {/* Animated top pulsing accent bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-400 via-amber-400 to-emerald-500 animate-pulse" />

          {/* Pulsing Siren / Bell Icon */}
          <div className="relative w-24 h-24 mx-auto mb-5 mt-2 flex items-center justify-center">
            {/* Outer pulsating rings */}
            <motion.div
              animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              className="absolute inset-0 rounded-full bg-emerald-400/30"
            />
            <motion.div
              animate={{ scale: [1, 1.25, 1], opacity: [0.8, 0.2, 0.8] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut", delay: 0.2 }}
              className="absolute inset-2 rounded-full bg-emerald-500/25"
            />

            {/* Core Icon Circle */}
            <div className="relative w-18 h-18 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 border border-emerald-400">
              <motion.div
                animate={{ rotate: [-12, 12, -12, 12, 0] }}
                transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
              >
                <BellRing className="w-9 h-9" />
              </motion.div>
            </div>
          </div>

          {/* Text Information */}
          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Order Ready / Served!
            </span>
            <h2 className="text-2xl font-black text-stone-900 tracking-tight">
              Your Food is Prepared! 🎉
            </h2>
            <p className="text-xs text-stone-600 max-w-xs mx-auto leading-relaxed pt-1">
              The kitchen has freshly prepared your meal. Please collect it from the counter or our staff will serve you shortly!
            </p>
          </div>

          {/* Order Details Badge */}
          <div className="my-5 bg-white border border-[#E5DFD4] rounded-2xl p-3 flex items-center justify-around shadow-sm text-xs">
            <div>
              <span className="text-[10px] text-muted uppercase font-bold block">Order</span>
              <strong className="font-mono text-base text-stone-900 font-extrabold">
                #{orderNumber}
              </strong>
            </div>
            {tableNumber && (
              <>
                <div className="w-px h-8 bg-[#E5DFD4]" />
                <div>
                  <span className="text-[10px] text-muted uppercase font-bold block">Table</span>
                  <strong className="text-sm text-amber-800 font-bold">
                    Table {tableNumber}
                  </strong>
                </div>
              </>
            )}
            <div className="w-px h-8 bg-[#E5DFD4]" />
            <div>
              <span className="text-[10px] text-muted uppercase font-bold block">Alert</span>
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-bold">
                <Volume2 className="w-3 h-3 animate-pulse" />
                Ringing
              </span>
            </div>
          </div>

          {/* Big OK / Acknowledge Button */}
          <button
            onClick={onAcknowledge}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 active:scale-[0.98] text-white font-black text-sm tracking-wide shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Check className="w-5 h-5 stroke-[3]" />
            OK, I Received It!
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

