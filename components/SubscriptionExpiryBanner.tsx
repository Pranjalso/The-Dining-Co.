"use client";

import { useState, useEffect } from "react";
import { 
  AlertTriangle, 
  Clock, 
  Sparkles, 
  ArrowRight, 
  X, 
  CheckCircle2, 
  Mail, 
  ShieldAlert, 
  Calendar,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SubscriptionExpiryBannerProps {
  cafeSlug: string;
  cafeName?: string;
  subscriptionPlan?: string;
  endDate?: string | Date;
  daysRemaining?: number | null;
  isExpiringSoon?: boolean;
}

export default function SubscriptionExpiryBanner({
  cafeSlug,
  cafeName,
  subscriptionPlan = "Subscription",
  endDate,
  daysRemaining,
  isExpiringSoon
}: SubscriptionExpiryBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Check session storage on mount so user can dismiss banner temporarily during current session
  useEffect(() => {
    if (typeof window !== "undefined") {
      const dismissed = sessionStorage.getItem(`sub_expiry_dismissed_${cafeSlug}`);
      if (dismissed === "true") {
        setIsDismissed(true);
      }
    }
  }, [cafeSlug]);

  const handleDismiss = () => {
    setIsDismissed(true);
    if (typeof window !== "undefined") {
      sessionStorage.setItem(`sub_expiry_dismissed_${cafeSlug}`, "true");
    }
  };

  const handleRestore = () => {
    setIsDismissed(false);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(`sub_expiry_dismissed_${cafeSlug}`);
    }
  };

  if (!isExpiringSoon || daysRemaining === null || daysRemaining === undefined) {
    return null;
  }

  // Format expiry date
  const formattedDate = endDate 
    ? new Date(endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "";

  // Dynamic urgency badge text and colors
  const isUrgent = daysRemaining <= 1;
  const urgencyLabel = daysRemaining === 0 
    ? "Expires Today" 
    : daysRemaining === 1 
    ? "Expires Tomorrow" 
    : `${daysRemaining} Days Left`;

  return (
    <>
      {/* ─── Top Banner ─── */}
      <AnimatePresence>
        {!isDismissed ? (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className={`w-full relative z-30 border-b transition-all duration-300 shadow-md ${
              isUrgent 
                ? "bg-gradient-to-r from-rose-950/90 via-red-900/80 to-amber-950/90 border-rose-500/40 text-rose-50"
                : "bg-gradient-to-r from-amber-950/90 via-orange-950/80 to-amber-900/90 border-amber-500/40 text-amber-50"
            }`}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 sm:py-3 flex flex-wrap items-center justify-between gap-3">
              {/* Left Side: Icon + Badge + Message */}
              <div className="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-[280px]">
                {/* Glowing Pulse Indicator */}
                <div className="relative flex-shrink-0">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center border shadow-sm ${
                    isUrgent 
                      ? "bg-rose-500/20 border-rose-400/30 text-rose-300"
                      : "bg-amber-500/20 border-amber-400/30 text-amber-300"
                  }`}>
                    <Clock size={16} className="animate-spin-slow" />
                  </div>
                  <span className={`absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5`}>
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                      isUrgent ? "bg-rose-400" : "bg-amber-400"
                    }`}></span>
                    <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                      isUrgent ? "bg-rose-500" : "bg-amber-500"
                    }`}></span>
                  </span>
                </div>

                {/* Text Content */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2.5">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider border shadow-sm ${
                      isUrgent
                        ? "bg-rose-500/30 text-rose-200 border-rose-400/40"
                        : "bg-amber-500/30 text-amber-200 border-amber-400/40"
                    }`}>
                      {urgencyLabel}
                    </span>
                    <span className="font-bold text-xs sm:text-sm tracking-tight text-white">
                      Subscription Expiring Soon
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-white/80 leading-snug">
                    Your <span className="font-bold text-white underline decoration-amber-400/60">{subscriptionPlan}</span> plan ends on <span className="font-semibold text-white">{formattedDate}</span>. Renew now to avoid interruption to QR ordering.
                  </p>
                </div>
              </div>

              {/* Right Side: CTA Button + Dismiss */}
              <div className="flex items-center gap-2 flex-shrink-0 ml-auto sm:ml-0">
                <button
                  onClick={() => setShowModal(true)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white transition-all duration-300 shadow-md hover:scale-[1.02] active:scale-[0.98] ${
                    isUrgent
                      ? "bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 border border-rose-400/40 shadow-rose-900/40"
                      : "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 border border-amber-400/40 shadow-amber-900/40"
                  }`}
                >
                  <Sparkles size={13} className="text-amber-200" />
                  <span>Renew Plan</span>
                  <ArrowRight size={13} />
                </button>

                <button
                  onClick={handleDismiss}
                  className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                  title="Dismiss banner for this session"
                >
                  <X size={15} />
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          /* Minimized Top Pill indicator */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full bg-gradient-to-r from-amber-950/60 to-orange-950/60 border-b border-amber-500/20 py-1 px-4 text-center"
          >
            <button
              onClick={handleRestore}
              className="inline-flex items-center gap-1.5 text-[11px] text-amber-300 hover:text-amber-100 font-semibold transition-colors"
            >
              <AlertTriangle size={12} className="text-amber-400" />
              <span>Subscription expires in {daysRemaining} day{daysRemaining === 1 ? '' : 's'} ({formattedDate}).</span>
              <span className="underline font-bold ml-1">Click to view renewal options &rarr;</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Renewal Modal ─── */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-lg bg-[#14141E] border border-amber-500/30 rounded-2xl p-6 sm:p-7 shadow-2xl relative overflow-hidden text-white"
            >
              {/* Background ambient glow */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none"></div>

              {/* Close Button */}
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 p-2 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X size={18} />
              </button>

              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0 text-amber-400 shadow-inner">
                  <ShieldAlert size={24} />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                    Renew Your Subscription
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    {cafeName || cafeSlug} &bull; Currently on <span className="text-amber-400 font-semibold">{subscriptionPlan}</span>
                  </p>
                </div>
              </div>

              {/* Expiry Status Card */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Calendar size={16} className="text-amber-400" />
                  <div>
                    <span className="text-[11px] text-stone-400 block font-medium">Expiration Date</span>
                    <span className="text-sm font-bold text-white">{formattedDate}</span>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${
                  isUrgent
                    ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                    : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                }`}>
                  {urgencyLabel}
                </span>
              </div>

              {/* Available Plans */}
              <div className="space-y-2.5 mb-6">
                <span className="text-xs font-semibold text-stone-300 uppercase tracking-wider block">
                  Available Renewal Plans
                </span>

                {/* 1 Year Plan (Featured) */}
                <div className="relative border-2 border-amber-500/60 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-xl p-3.5 flex items-center justify-between shadow-sm">
                  <span className="absolute -top-2.5 right-4 bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow">
                    Best Value &bull; Save 17%
                  </span>
                  <div>
                    <h4 className="font-bold text-sm text-white">1 Year Plan</h4>
                    <p className="text-xs text-stone-400">Full access &bull; 365 Days &bull; Premium Support</p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-amber-400">₹9,999</span>
                    <span className="text-[10px] text-stone-400 block">/ year</span>
                  </div>
                </div>

                {/* 1 Month Plan */}
                <div className="border border-white/10 bg-white/5 rounded-xl p-3.5 flex items-center justify-between hover:border-white/20 transition-colors">
                  <div>
                    <h4 className="font-bold text-sm text-white">1 Month Plan</h4>
                    <p className="text-xs text-stone-400">Monthly renewal &bull; Full digital features</p>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-bold text-white">₹999</span>
                    <span className="text-[10px] text-stone-400 block">/ month</span>
                  </div>
                </div>

                {/* 15 Days Demo */}
                <div className="border border-white/10 bg-white/5 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-xs text-stone-300">15 Days Extension</h4>
                    <p className="text-[11px] text-stone-400">Short-term trial extension</p>
                  </div>
                  <span className="text-xs font-bold text-stone-300">Demo</span>
                </div>
              </div>

              {/* Actions & Contact Support */}
              <div className="space-y-2.5">
                <a
                  href={`mailto:thediningco.contact@gmail.com?subject=Subscription%20Renewal%20Request%20-%20${encodeURIComponent(cafeName || cafeSlug)}&body=Hello%20The%20Dining%20Co.%20Team,%0A%0AI%20would%20like%20to%20renew%20the%20subscription%20for%20my%20cafe:%20${encodeURIComponent(cafeName || cafeSlug)}%20(Slug:%20${cafeSlug}).%0ACurrent%20Plan:%20${encodeURIComponent(subscriptionPlan)}.%0A%0APlease%20assist%20with%20payment%20and%20activation.`}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all duration-300 text-sm"
                >
                  <Mail size={16} />
                  <span>Contact The Dining Co. to Renew</span>
                  <ChevronRight size={16} />
                </a>

                <p className="text-center text-[11px] text-stone-400">
                  Direct support: <span className="text-amber-300 font-mono">thediningco.contact@gmail.com</span>
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

