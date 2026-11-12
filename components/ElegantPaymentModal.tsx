"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Sparkles, Star, X, Receipt } from "lucide-react";
import Link from "next/link";

export type PaymentSuccessAlertData = {
  orderNumber?: string | number;
  tableNumber?: string;
  total?: number;
  message?: string;
};

type Props = {
  data: PaymentSuccessAlertData | null;
  cafeSlug: string;
  onDismiss: () => void;
};

export default function ElegantPaymentModal({ data, cafeSlug, onDismiss }: Props) {
  if (!data) return null;

  const displayTable = data.tableNumber
    ? data.tableNumber.toLowerCase().startsWith("table")
      ? data.tableNumber
      : `Table ${data.tableNumber}`
    : "";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 select-none pointer-events-auto">
        {/* Soft frosted glass backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onDismiss}
          className="fixed inset-0 bg-stone-900/60 backdrop-blur-md"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
          className="relative w-full max-w-[360px] bg-gradient-to-b from-[#FFFFFF] to-[#FBF8F3] rounded-3xl p-6 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-[#E5DFD4] overflow-hidden text-center z-10"
        >
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onDismiss}
            className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-[#F3EFE6] hover:bg-[#E5DFD4] text-stone-500 hover:text-stone-800 flex items-center justify-center transition"
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Animated Success Checkmark Ring */}
          <div className="relative mx-auto w-16 h-16 mb-4 flex items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-emerald-100 animate-ping opacity-75" />
            <div className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 border-2 border-white">
              <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
            </div>
          </div>

          {/* Header & Subtitle */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[11px] font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            <span>Payment Confirmed</span>
          </div>

          <h3 className="text-xl font-black text-stone-900 tracking-tight font-heading">
            Settlement Received!
          </h3>

          <p className="text-xs text-stone-600 mt-1.5 leading-relaxed">
            {data.total ? (
              <>
                <span className="font-extrabold text-stone-900 font-price">₹{data.total}</span> was recorded successfully. Thank you for dining with us!
              </>
            ) : (
              "Your bill has been recorded as paid. Thank you for dining with us!"
            )}
          </p>

          {/* Table & Order pill */}
          <div className="mt-4 flex items-center justify-center gap-2">
            {displayTable && (
              <span className="text-[11px] font-bold text-stone-700 bg-white border border-[#E5DFD4] px-3 py-1 rounded-xl shadow-2xs">
                {displayTable}
              </span>
            )}
            {data.orderNumber && (
              <span className="text-[11px] font-mono font-semibold text-stone-500 bg-white border border-[#E5DFD4] px-2.5 py-1 rounded-xl shadow-2xs">
                #{data.orderNumber}
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-col gap-2.5">
            <Link
              href={`/${cafeSlug}/menu/order-confirmation?orderNumber=${data.orderNumber}&table=${encodeURIComponent(data.tableNumber || "")}`}
              onClick={onDismiss}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 transition active:scale-[0.98]"
            >
              <Star className="w-4 h-4 fill-white/20" />
              <span>Rate Experience & Bill Receipt</span>
            </Link>

            <button
              type="button"
              onClick={onDismiss}
              className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-[#F3EFE6] text-stone-600 hover:text-stone-900 font-semibold text-xs border border-[#E5DFD4] transition"
            >
              Back to Menu
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
