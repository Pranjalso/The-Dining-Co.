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
  X,
  Loader2,
  CheckCircle2,
  Clock,
} from "lucide-react";

export type ServiceOption = {
  id: "water" | "cutlery" | "bill" | "cleaning" | "waiter";
  label: string;
  icon: any;
  color: string;
  subtext: string;
};

const SERVICE_OPTIONS: ServiceOption[] = [
  {
    id: "water",
    label: "Bring Water",
    icon: Droplets,
    color: "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100",
    subtext: "Fresh drinking water for table",
  },
  {
    id: "cutlery",
    label: "Cutlery & Napkins",
    icon: Utensils,
    color: "bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100",
    subtext: "Forks, spoons or extra tissue",
  },
  {
    id: "bill",
    label: "Request Final Bill",
    icon: Receipt,
    color: "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100",
    subtext: "Ready to settle payment",
  },
  {
    id: "cleaning",
    label: "Clean Table",
    icon: Sparkles,
    color: "bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100",
    subtext: "Clear dishes or wipe table",
  },
  {
    id: "waiter",
    label: "Call Waiter",
    icon: UserCheck,
    color: "bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100",
    subtext: "Assistance from service staff",
  },
];

type Props = {
  cafeSlug: string;
  tableNumber: string;
};

export default function ServiceBellModal({ cafeSlug, tableNumber }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [loadingType, setLoadingType] = useState<string | null>(null);
  const [customNote, setCustomNote] = useState("");
  const [paymentPreference, setPaymentPreference] = useState<"upi" | "cash">("upi");
  const [selectedType, setSelectedType] = useState<ServiceOption["id"] | null>(null);
  const [lastSubmitted, setLastSubmitted] = useState<{
    label: string;
    time: number;
  } | null>(null);
  const [cooldown, setCooldown] = useState(0);

  // Countdown timer for cooldown
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  const handleSubmit = async (type: ServiceOption["id"]) => {
    if (!tableNumber) {
      alert("Please ensure your table number is selected before calling service.");
      return;
    }

    setLoadingType(type);
    try {
      const res = await fetch(`/api/service-requests/${cafeSlug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableNumber,
          requestType: type,
          customNote: selectedType === type ? customNote : undefined,
          paymentMethodPreference: type === "bill" ? paymentPreference : undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        const opt = SERVICE_OPTIONS.find((o) => o.id === type);
        setLastSubmitted({
          label: opt?.label || "Request",
          time: Date.now(),
        });
        setCooldown(35); // 35s cooldown
        setIsOpen(false);
        setSelectedType(null);
        setCustomNote("");
      } else {
        alert(data.message || "Failed to notify staff.");
      }
    } catch (e) {
      console.error(e);
      alert("Network error. Please try again.");
    } finally {
      setLoadingType(null);
    }
  };

  return (
    <>
      {/* Floating Service Bell Button */}
      <div className="fixed bottom-24 right-4 z-40 flex flex-col items-end gap-2">
        {/* Active confirmation toast pill if requested recently */}
        {cooldown > 0 && lastSubmitted && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white/95 backdrop-blur-md shadow-lg border border-primary/20 rounded-full px-3.5 py-1.5 flex items-center gap-2 text-xs font-semibold text-primary"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-500 animate-pulse" />
            <span>Staff notified ({lastSubmitted.label})</span>
            <span className="text-gray-400 font-normal">· {cooldown}s</span>
          </motion.div>
        )}

        <motion.button
          id="service-bell-button"
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => setIsOpen(true)}
          className="relative bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white p-3.5 sm:p-4 rounded-full shadow-xl shadow-orange-500/25 border-2 border-white flex items-center justify-center group focus:outline-none"
          aria-label="Call Waiter & Service Bell"
        >
          {/* Subtle pulse ring */}
          <span className="absolute -inset-1 rounded-full bg-orange-400/40 animate-ping pointer-events-none" />

          <Bell className="w-6 h-6 transition-transform group-hover:rotate-12 duration-300" />
          <span className="sr-only">Call Waiter</span>
        </motion.button>
      </div>

      {/* Modal Dialog */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, y: 60, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 60, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 sm:p-6 border border-gray-100 z-10 max-h-[88vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                    <Bell className="w-5 h-5 animate-bounce" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 leading-tight">
                      Table Assistance
                    </h3>
                    <p className="text-xs text-gray-500">
                      {tableNumber ? (
                        <span className="font-semibold text-orange-600">Table: {tableNumber}</span>
                      ) : (
                        "Instant call to floor staff"
                      )}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Service Options Grid */}
              <div className="mt-4 space-y-2.5">
                {SERVICE_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = selectedType === opt.id;
                  const isLoading = loadingType === opt.id;

                  return (
                    <div key={opt.id} className="flex flex-col gap-2">
                      <button
                        onClick={() => {
                          if (opt.id === "waiter" || opt.id === "bill") {
                            setSelectedType(isSelected ? null : opt.id);
                          } else {
                            handleSubmit(opt.id);
                          }
                        }}
                        disabled={cooldown > 0 || !!loadingType}
                        className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all text-left ${
                          opt.color
                        } ${isSelected ? "ring-2 ring-orange-500 border-transparent shadow-sm" : ""}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-white/80 shadow-xs">
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-semibold text-sm text-gray-900 leading-snug">
                              {opt.label}
                            </div>
                            <div className="text-xs text-gray-500 font-normal">
                              {opt.subtext}
                            </div>
                          </div>
                        </div>

                        {isLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin text-gray-700" />
                        ) : opt.id !== "waiter" && opt.id !== "bill" ? (
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/90 text-gray-700 border border-gray-200">
                            Tap to send
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-gray-400">
                            {isSelected ? "▲" : "▼"}
                          </span>
                        )}
                      </button>

                      {/* Expandable options for Bill */}
                      {isSelected && opt.id === "bill" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100 flex flex-col gap-2.5 text-xs"
                        >
                          <div className="font-medium text-emerald-800">
                            Preferred Payment Method:
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setPaymentPreference("upi")}
                              className={`flex-1 py-1.5 px-3 rounded-lg border font-semibold text-center transition ${
                                paymentPreference === "upi"
                                  ? "bg-emerald-600 text-white border-emerald-600"
                                  : "bg-white text-gray-700 border-gray-200"
                              }`}
                            >
                              📱 UPI / QR Code
                            </button>
                            <button
                              type="button"
                              onClick={() => setPaymentPreference("cash")}
                              className={`flex-1 py-1.5 px-3 rounded-lg border font-semibold text-center transition ${
                                paymentPreference === "cash"
                                  ? "bg-emerald-600 text-white border-emerald-600"
                                  : "bg-white text-gray-700 border-gray-200"
                              }`}
                            >
                              💵 Cash at Table
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleSubmit("bill")}
                            disabled={!!loadingType}
                            className="mt-1 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded-lg transition flex items-center justify-center gap-1.5"
                          >
                            {loadingType === "bill" ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : null}
                            Confirm Bill Request
                          </button>
                        </motion.div>
                      )}

                      {/* Expandable note for Call Waiter */}
                      {isSelected && opt.id === "waiter" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="bg-orange-50/50 p-3 rounded-xl border border-orange-100 flex flex-col gap-2 text-xs"
                        >
                          <label className="font-medium text-orange-900">
                            Optional note for waiter:
                          </label>
                          <input
                            type="text"
                            value={customNote}
                            onChange={(e) => setCustomNote(e.target.value)}
                            placeholder="e.g. Need high chair, extra chili oil..."
                            maxLength={120}
                            className="w-full px-3 py-2 rounded-lg border border-orange-200 bg-white text-gray-800 text-xs focus:ring-1 focus:ring-orange-500 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleSubmit("waiter")}
                            disabled={!!loadingType}
                            className="mt-1 w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 rounded-lg transition flex items-center justify-center gap-1.5"
                          >
                            {loadingType === "waiter" ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : null}
                            Call Waiter to Table {tableNumber || ""}
                          </button>
                        </motion.div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Footer info */}
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
                <Clock className="w-3 h-3" />
                <span>Servers are alerted in real time at the counter</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

