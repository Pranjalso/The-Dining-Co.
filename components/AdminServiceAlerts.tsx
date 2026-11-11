"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Droplets,
  Utensils,
  Receipt,
  Sparkles,
  UserCheck,
  Check,
  ChevronRight,
  Volume2,
  X,
} from "lucide-react";
import useSWR, { mutate } from "swr";
import { getPusherClient } from "@/lib/pusher-client";

export type ServiceRequestItem = {
  _id: string;
  tableNumber: string;
  requestType: "water" | "cutlery" | "bill" | "cleaning" | "waiter";
  customNote?: string;
  paymentMethodPreference?: "cash" | "upi";
  status: "pending" | "acknowledged" | "completed";
  createdAt: string;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Play desk bell chime using preloaded HTML5 Audio with Web Audio fallback
let serviceBellAudioInstance: HTMLAudioElement | null = null;
let sharedAudioCtx: AudioContext | null = null;

if (typeof window !== "undefined") {
  try {
    serviceBellAudioInstance = new Audio("/sounds/service-bell.mp3");
    serviceBellAudioInstance.preload = "auto";
  } catch (e) {
    console.warn("Could not preload service bell audio:", e);
  }
}

export function unlockDeskBellAudio() {
  if (typeof window === "undefined") return;
  try {
    if (!sharedAudioCtx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) sharedAudioCtx = new AudioCtx();
    }
    if (sharedAudioCtx && sharedAudioCtx.state === "suspended") {
      sharedAudioCtx.resume();
    }
    if (serviceBellAudioInstance) {
      serviceBellAudioInstance.volume = 0.01;
      const p = serviceBellAudioInstance.play();
      if (p !== undefined) {
        p.then(() => {
          serviceBellAudioInstance?.pause();
          if (serviceBellAudioInstance) {
            serviceBellAudioInstance.currentTime = 0;
            serviceBellAudioInstance.volume = 1.0;
          }
        }).catch(() => {});
      }
    }
  } catch (err) {
    console.warn("Error unlocking audio:", err);
  }
}

export function playDeskBellChime() {
  if (typeof window === "undefined") return;

  // 1. Try playing preloaded HTML5 Audio file first
  if (serviceBellAudioInstance) {
    try {
      serviceBellAudioInstance.currentTime = 0;
      serviceBellAudioInstance.volume = 1.0;
      const playPromise = serviceBellAudioInstance.play();
      if (playPromise !== undefined) {
        playPromise.catch((e) => {
          console.warn("HTML5 audio playback blocked, trying Web Audio API:", e);
          playWebAudioSynthesizer();
        });
        return;
      }
    } catch (e) {
      // Fall through to Web Audio synthesizer
    }
  }

  // 2. Fallback: Synthesized Web Audio API bell
  playWebAudioSynthesizer();
}

function playWebAudioSynthesizer() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    if (!sharedAudioCtx) sharedAudioCtx = new AudioCtx();
    const ctx = sharedAudioCtx;
    if (ctx.state === "suspended") ctx.resume();
    const now = ctx.currentTime;

    // Harmonic 4-tone ascending hospitality chime (C5 -> E5 -> G5 -> C6)
    const notes = [
      { freq: 523.25, time: 0, dur: 0.35, vol: 0.4 },
      { freq: 659.25, time: 0.14, dur: 0.35, vol: 0.45 },
      { freq: 783.99, time: 0.28, dur: 0.4, vol: 0.5 },
      { freq: 1046.5, time: 0.44, dur: 0.8, vol: 0.65 },
    ];

    notes.forEach((n) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(n.freq, now + n.time);

      gain.gain.setValueAtTime(0.0001, now + n.time);
      gain.gain.exponentialRampToValueAtTime(n.vol, now + n.time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + n.time + n.dur);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + n.time);
      osc.stop(now + n.time + n.dur);
    });
  } catch (err) {
    console.warn("Could not play synthesized bell sound:", err);
  }
}

const TYPE_CONFIG = {
  water: { label: "Water", icon: Droplets, color: "text-blue-600 bg-blue-50 border-blue-200" },
  cutlery: { label: "Cutlery", icon: Utensils, color: "text-amber-600 bg-amber-50 border-amber-200" },
  bill: { label: "Final Bill", icon: Receipt, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  cleaning: { label: "Clean Table", icon: Sparkles, color: "text-purple-600 bg-purple-50 border-purple-200" },
  waiter: { label: "Call Waiter", icon: UserCheck, color: "text-orange-600 bg-orange-50 border-orange-200" },
};

type Props = {
  cafeSlug: string;
  soundEnabled?: boolean;
};

export default function AdminServiceAlerts({ cafeSlug, soundEnabled = true }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const swrKey = cafeSlug ? `/api/service-requests/${cafeSlug}?status=pending` : null;
  const { data } = useSWR(swrKey, fetcher, {
    refreshInterval: 6000,
    revalidateOnFocus: true,
  });

  const requests: ServiceRequestItem[] = data?.success && Array.isArray(data.data) ? data.data : [];

  // Unlock audio context on user interaction with the dashboard
  useEffect(() => {
    const handleUserInteraction = () => {
      unlockDeskBellAudio();
    };
    window.addEventListener("click", handleUserInteraction, { once: true });
    window.addEventListener("keydown", handleUserInteraction, { once: true });
    window.addEventListener("touchstart", handleUserInteraction, { once: true });
    return () => {
      window.removeEventListener("click", handleUserInteraction);
      window.removeEventListener("keydown", handleUserInteraction);
      window.removeEventListener("touchstart", handleUserInteraction);
    };
  }, []);

  // Listen to realtime Pusher events
  useEffect(() => {
    if (!cafeSlug) return;
    const pusher = getPusherClient();
    if (!pusher) return;

    const channelName = `cafe-${cafeSlug.toLowerCase()}`;
    const channel = pusher.subscribe(channelName);

    channel.bind("service-request-created", (newReq: any) => {
      if (soundEnabled) {
        playDeskBellChime();
      }
      if (swrKey) mutate(swrKey);
    });

    channel.bind("service-request-updated", () => {
      if (swrKey) mutate(swrKey);
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(channelName);
    };
  }, [cafeSlug, soundEnabled, swrKey]);

  const handleResolve = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setResolvingId(id);
    try {
      await fetch(`/api/service-requests/${cafeSlug}?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "completed" }),
      });
      if (swrKey) mutate(swrKey);
    } catch (err) {
      console.error(err);
    } finally {
      setResolvingId(null);
    }
  };

  const count = requests.length;

  return (
    <div className="relative">
      {/* Alert Pill Button in Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all duration-300 shadow-xs ${
          count > 0
            ? "bg-amber-500 text-white border-amber-600 shadow-amber-500/20 animate-pulse"
            : "bg-[#FBF8F3] text-gray-600 border-[#E5DFD4] hover:bg-white"
        }`}
        title="Table Service Assistance Alerts"
      >
        <Bell className={`w-3.5 h-3.5 ${count > 0 ? "animate-bounce" : ""}`} />
        <span className="hidden sm:inline">Table Help</span>
        {count > 0 && (
          <span className="bg-white text-amber-700 text-[10px] font-bold px-1.5 py-0.2 rounded-full shadow-xs">
            {count}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden"
            >
              <div className="p-3.5 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-amber-500 text-white rounded-lg">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">Table Assistance Requests</h4>
                    <p className="text-[10px] text-gray-500">Live service calls from guests</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-6 h-6 rounded-full hover:bg-black/5 flex items-center justify-center text-gray-500"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto p-2 space-y-2">
                {count === 0 ? (
                  <div className="py-8 text-center text-gray-400 text-xs flex flex-col items-center gap-1.5">
                    <Check className="w-6 h-6 text-emerald-500" />
                    <span>All table requests attended!</span>
                  </div>
                ) : (
                  requests.map((req) => {
                    const cfg = TYPE_CONFIG[req.requestType] || TYPE_CONFIG.waiter;
                    const Icon = cfg.icon;
                    const isResolving = resolvingId === req._id;

                    return (
                      <div
                        key={req._id}
                        className="p-3 rounded-xl border border-gray-100 hover:border-amber-200 bg-white hover:bg-amber-50/30 transition flex items-start justify-between gap-3 shadow-2xs"
                      >
                        <div className="flex items-start gap-2.5">
                          <div className={`p-2 rounded-xl border ${cfg.color} shrink-0`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-xs text-gray-900">
                                {req.tableNumber}
                              </span>
                              <span className="text-[10px] text-gray-400">·</span>
                              <span className="text-xs font-semibold text-amber-700">
                                {cfg.label}
                              </span>
                            </div>
                            {req.requestType === "bill" && req.paymentMethodPreference && (
                              <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
                                Mode: {req.paymentMethodPreference.toUpperCase()}
                              </p>
                            )}
                            {req.customNote && (
                              <p className="text-[11px] text-gray-600 italic mt-0.5">
                                "{req.customNote}"
                              </p>
                            )}
                            <p className="text-[10px] text-gray-400 mt-1">
                              {new Date(req.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={(e) => handleResolve(req._id, e)}
                          disabled={isResolving}
                          className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1 shrink-0 shadow-2xs"
                        >
                          <Check className="w-3 h-3" />
                          <span>Done</span>
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

