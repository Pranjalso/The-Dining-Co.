"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Utensils, ChevronRight, Sparkles, Clock, Receipt, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export type ActiveTableTabData = {
  cafeSlug: string;
  tableNumber: string;
  primaryOrderNumber: number;
  totalRounds: number;
  rounds: Array<{
    orderNumber: number;
    roundNumber: number;
    itemsCount: number;
    total: number;
    orderStatus: string;
  }>;
  items: Array<{
    roundNumber: number;
    name: string;
    price: number;
    quantity: number;
    selectedModifiers?: Array<{ groupName: string; name: string; price: number }>;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  latestStatus: string;
};

type ActiveTableTabBannerProps = {
  tabData: ActiveTableTabData;
  onOpenDetails: () => void;
};

export default function ActiveTableTabBanner({ tabData, onOpenDetails }: ActiveTableTabBannerProps) {
  if (!tabData) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full menu-card border menu-border text-text rounded-2xl p-3.5 shadow-md flex items-center justify-between gap-3 relative overflow-hidden cursor-pointer hover:border-[var(--theme-primary)]/50 transition-all"
      onClick={onOpenDetails}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-[var(--theme-primary)]/15 border border-[var(--theme-primary)]/30 flex items-center justify-center flex-shrink-0">
          <Receipt className="w-5 h-5 menu-primary-text" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-[var(--theme-primary)]/15 menu-primary-text px-2 py-0.5 rounded-full border border-[var(--theme-primary)]/30">
              Active Table Tab
            </span>
            <span className="text-xs font-semibold menu-text">
              Table {tabData.tableNumber}
            </span>
          </div>
          <p className="text-xs font-medium menu-muted mt-0.5 truncate">
            {tabData.totalRounds > 1
              ? `${tabData.totalRounds} Rounds Ordered • Total ₹${tabData.total}`
              : `Order #${tabData.primaryOrderNumber} • Total ₹${tabData.total}`}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 flex-shrink-0">
        <span className="text-xs font-bold menu-primary-text group-hover:opacity-80 transition-colors">
          View Tab
        </span>
        <ChevronRight className="w-4 h-4 menu-primary-text" />
      </div>
    </motion.div>
  );
}

