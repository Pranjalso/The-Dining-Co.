"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Crown,
  Percent,
  Receipt,
  UtensilsCrossed,
  Gift,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  X,
  ArrowRight,
} from "lucide-react";

export type OfferItem = {
  _id: string;
  cafeSlug: string;
  title: string;
  description: string;
  discountType: "percentage" | "flat" | "combo" | "bogo" | "custom";
  discountValue: string;
  code?: string;
  minOrderAmount?: number;
  badgeText?: string;
  isActive: boolean;
  validTill?: string;
};

interface OfferPopupModalProps {
  isOpen: boolean;
  onClose: () => void;
  offers: OfferItem[];
  cafeName: string;
  onApplyOffer?: (offer: OfferItem) => void;
}

export default function OfferPopupModal({
  isOpen,
  onClose,
  offers,
  cafeName,
  onApplyOffer,
}: OfferPopupModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Filter only active offers
  const activeOffers = offers.filter((o) => o.isActive !== false);

  // Reset index when opened or offers change
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
      setCopiedCode(null);
    }
  }, [isOpen, offers.length]);

  const currentOffer = activeOffers[currentIndex] || activeOffers[0];
  const hasMultiple = activeOffers.length > 1;

  const handleCopyCode = (code: string, offer?: OfferItem) => {
    if (!code) return;
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        navigator.clipboard.writeText(code);
      }
      setCopiedCode(code);

      // Auto-save to storage so checkout automatically pre-fills this promo
      if (offer && typeof window !== "undefined") {
        try {
          const payload = {
            code: offer.code,
            discountType: offer.discountType,
            discountValue: offer.discountValue,
            minOrderAmount: offer.minOrderAmount || 0,
          };
          window.sessionStorage.setItem(`sd:appliedOffer:${offer.cafeSlug}`, JSON.stringify(payload));
          window.localStorage.setItem(`sd:appliedOffer:${offer.cafeSlug}`, JSON.stringify(payload));
        } catch {}
      }

      setTimeout(() => setCopiedCode(null), 2500);
    } catch {
      // Fallback
    }
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % activeOffers.length);
    setCopiedCode(null);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + activeOffers.length) % activeOffers.length);
    setCopiedCode(null);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "combo":
        return <UtensilsCrossed className="w-3.5 h-3.5 text-[#8B3A2B]" />;
      case "bogo":
        return <Gift className="w-3.5 h-3.5 text-purple-600" />;
      case "flat":
        return <Receipt className="w-3.5 h-3.5 text-emerald-600" />;
      case "percentage":
      default:
        return <Percent className="w-3.5 h-3.5 text-[#B8860B]" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && activeOffers.length > 0 && currentOffer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3.5 sm:p-4 select-none overflow-y-auto">
          {/* Deep Luxury Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24 }}
            className="fixed inset-0 bg-black/75 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Modal Dialog Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ type: "spring", stiffness: 360, damping: 28 }}
            className="relative w-full max-w-[365px] xs:max-w-[385px] sm:max-w-[420px] my-auto max-h-[92vh] bg-gradient-to-b from-[#FFFDF9] via-[#FAF6EE] to-[#F3EDE2] border border-[#D4AF37]/35 ring-1 ring-[#D4AF37]/15 rounded-[28px] shadow-[0_25px_60px_-15px_rgba(28,25,23,0.35)] overflow-hidden z-10 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Ambient Gold Radial Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 bg-[#D4AF37]/15 blur-3xl pointer-events-none rounded-full" />

            {/* Top Metallic 2px Gold Hairline Bar */}
            <div className="h-[3px] w-full bg-gradient-to-r from-[#9C7006] via-[#E8D174] to-[#B8860B] shrink-0" />

            {/* Close Button */}
            <button
              onClick={onClose}
              aria-label="Close offers popup"
              className="absolute top-3.5 right-3.5 z-20 w-8 h-8 rounded-full bg-stone-900/5 hover:bg-stone-900/10 text-stone-400 hover:text-stone-800 border border-[#E5DFD4]/80 flex items-center justify-center transition-all cursor-pointer active:scale-90"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Content Container */}
            <div className="overflow-y-auto scrollbar-none flex-1 flex flex-col relative z-10">
              {/* Header Section */}
              <div className="px-5 pt-5 pb-2 text-center relative shrink-0">
                {/* Royal Crown VIP Medallion */}
                <div className="relative mx-auto mb-2.5 inline-block">
                  <div className="w-13 h-13 rounded-full bg-gradient-to-b from-[#FFFDF8] via-[#FAF3E0] to-[#EFE0C1] border border-[#D4AF37]/60 shadow-[0_4px_18px_rgba(184,134,11,0.22)] flex items-center justify-center relative ring-4 ring-[#D4AF37]/15">
                    <Crown className="w-6 h-6 text-[#B8860B] stroke-[1.8] drop-shadow-xs" />
                  </div>
                </div>

                {/* VIP Table Privilege Tag */}
                <div>
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-[#B8860B]/10 via-[#B8860B]/18 to-[#B8860B]/10 border border-[#B8860B]/30 text-[#8F6605] text-[9px] font-extrabold uppercase tracking-[0.25em] mb-1.5 font-display shadow-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B8860B]" />
                    <span>VIP Table Privilege</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B8860B]" />
                  </div>
                </div>

                <h2 className="text-xl sm:text-[23px] font-bold text-stone-900 tracking-tight font-serif">
                  Exclusive Dining Privileges
                </h2>
                <p className="text-xs text-stone-500 mt-0.5 line-clamp-1 font-medium">
                  Special savings for your table at <span className="font-semibold text-stone-800">{cafeName}</span>
                </p>

                {/* Segmented Capsule Deal Tabs if Multiple */}
                {hasMultiple && (
                  <div className="mt-3.5 inline-flex p-1 bg-[#ECE5D8]/80 rounded-2xl border border-[#E2D8C7] items-center gap-1 max-w-full overflow-x-auto scrollbar-none shadow-inner">
                    {activeOffers.map((offer, idx) => (
                      <button
                        key={offer._id || idx}
                        onClick={() => {
                          setCurrentIndex(idx);
                          setCopiedCode(null);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer shrink-0 font-price tabular-nums ${
                          idx === currentIndex
                            ? "bg-gradient-to-r from-[#B8860B] via-[#C5931C] to-[#9C7006] text-white shadow-xs scale-[1.02]"
                            : "text-stone-600 hover:text-stone-900 hover:bg-white/60"
                        }`}
                      >
                        {offer.discountValue || `Deal ${idx + 1}`}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Main Voucher Body (Animated per slide) */}
              <div className="px-4 py-2 sm:px-5 sm:py-2.5 relative flex-1">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentOffer._id || currentIndex}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18 }}
                    className="relative"
                  >
                    {/* Refined Luxury Privilege Card */}
                    <div className="relative bg-white/95 backdrop-blur-xs border border-[#E8DFD0] rounded-2xl p-4 sm:p-5 shadow-[0_4px_20px_rgba(28,25,23,0.04)] overflow-hidden">
                      {/* Top Row: Badge & Min Spend */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#F5EFE6] border border-[#E5DFD4] text-[#8B3A2B] text-[10px] font-bold uppercase tracking-wider font-display">
                          {getTypeIcon(currentOffer.discountType)}
                          <span>{currentOffer.badgeText || "SPECIAL OFFER"}</span>
                        </span>

                        {currentOffer.minOrderAmount && currentOffer.minOrderAmount > 0 ? (
                          <span className="text-[10px] text-stone-500 font-semibold font-price">
                            Min order ₹{currentOffer.minOrderAmount}
                          </span>
                        ) : (
                          <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60 font-display">
                            ✨ No min order
                          </span>
                        )}
                      </div>

                      {/* Main Value Callout */}
                      <div className="my-1.5">
                        <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#B8860B] via-[#C99726] to-[#8C6207] tracking-tight font-price tabular-nums">
                          {currentOffer.discountValue}
                        </div>
                        <h3 className="text-sm sm:text-base font-bold text-stone-900 mt-1 leading-snug">
                          {currentOffer.title}
                        </h3>
                      </div>

                      {/* Description */}
                      {currentOffer.description && (
                        <p className="text-xs text-stone-500 mt-1 leading-relaxed line-clamp-2">
                          {currentOffer.description}
                        </p>
                      )}

                      {/* Coupon Code Strip (if present) */}
                      {currentOffer.code ? (
                        <div className="mt-3.5 pt-3 border-t border-dashed border-[#D4AF37]/35 flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <div className="text-[9px] uppercase tracking-wider text-stone-400 font-bold font-display">
                              Promo Code
                            </div>
                            <div className="font-mono font-bold text-stone-900 text-sm sm:text-base tracking-wider truncate">
                              {currentOffer.code}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleCopyCode(currentOffer.code || "", currentOffer)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer shrink-0 font-display ${
                              copiedCode === currentOffer.code
                                ? "bg-emerald-600 text-white shadow-xs"
                                : "bg-[#F3EFE6] hover:bg-[#EAE3D5] text-stone-800 border border-[#E5DFD4] active:scale-95"
                            }`}
                          >
                            {copiedCode === currentOffer.code ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-white" />
                                <span>Applied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-[#B8860B]" />
                                <span>Copy & Apply</span>
                              </>
                            )}
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Left / Right Carousel Controls if Multiple */}
                {hasMultiple && (
                  <div className="flex items-center justify-between mt-2.5 px-1">
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="w-7 h-7 rounded-full bg-white border border-[#E5DFD4] text-stone-700 hover:bg-[#F3EFE6] flex items-center justify-center shadow-2xs transition-colors cursor-pointer active:scale-90"
                      aria-label="Previous offer"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[10px] text-stone-500 font-bold font-price">
                      Deal {currentIndex + 1} of {activeOffers.length}
                    </span>
                    <button
                      type="button"
                      onClick={handleNext}
                      className="w-7 h-7 rounded-full bg-white border border-[#E5DFD4] text-stone-700 hover:bg-[#F3EFE6] flex items-center justify-center shadow-2xs transition-colors cursor-pointer active:scale-90"
                      aria-label="Next offer"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Action Footer */}
              <div className="p-4 sm:p-5 pt-1.5 flex flex-col gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    if (onApplyOffer) {
                      onApplyOffer(currentOffer);
                    } else if (currentOffer.code && typeof window !== "undefined") {
                      try {
                        const payload = {
                          code: currentOffer.code,
                          discountType: currentOffer.discountType,
                          discountValue: currentOffer.discountValue,
                          minOrderAmount: currentOffer.minOrderAmount || 0,
                        };
                        window.sessionStorage.setItem(`sd:appliedOffer:${currentOffer.cafeSlug}`, JSON.stringify(payload));
                        window.localStorage.setItem(`sd:appliedOffer:${currentOffer.cafeSlug}`, JSON.stringify(payload));
                      } catch {}
                    }
                    onClose();
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#B8860B] via-[#C99726] to-[#9C7006] hover:from-[#A2760A] hover:to-[#855D05] text-white font-bold text-xs sm:text-sm tracking-wide shadow-md shadow-[#B8860B]/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 group cursor-pointer active:scale-[0.98] min-h-[44px]"
                >
                  <span>Claim Privilege & Order</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="text-center text-xs text-stone-400 hover:text-stone-700 py-0.5 font-medium transition-colors cursor-pointer"
                >
                  Browse without deal
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
