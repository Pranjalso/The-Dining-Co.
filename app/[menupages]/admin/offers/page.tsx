"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import useSWR, { mutate } from "swr";
import {
  TicketPercent,
  BadgePercent,
  Plus,
  Search,
  CheckCircle,
  XCircle,
  Edit2,
  Trash2,
  Copy,
  Check,
  Percent,
  Gift,
  UtensilsCrossed,
  Receipt,
  AlertCircle,
  X,
  Loader2,
  Eye,
  SlidersHorizontal,
  ChevronRight,
  Zap,
} from "lucide-react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export type OfferDiscountType = "percentage" | "combo" | "flat" | "bogo" | "custom";

export type OfferItem = {
  _id: string;
  cafeSlug: string;
  title: string;
  description: string;
  discountType: OfferDiscountType;
  discountValue: string;
  code?: string;
  minOrderAmount?: number;
  badgeText?: string;
  isActive: boolean;
  validTill?: string;
  createdAt: string;
};

// Offer type configuration with icons and labels
const OFFER_TYPES: Array<{
  id: OfferDiscountType;
  label: string;
  shortLabel: string;
  icon: any;
  defaultBadge: string;
  placeholderValue: string;
  placeholderTitle: string;
  accentColor: string;
  badgeBg: string;
}> = [
  {
    id: "percentage",
    label: "Percentage Discount (% Off)",
    shortLabel: "% Discounts",
    icon: Percent,
    defaultBadge: "SPECIAL DISCOUNT",
    placeholderValue: "20% OFF",
    placeholderTitle: "Flat 20% Off on Food Orders",
    accentColor: "#B8860B",
    badgeBg: "bg-amber-50 text-amber-800 border-amber-200",
  },
  {
    id: "combo",
    label: "Combo Meal Special",
    shortLabel: "Combo Deals",
    icon: UtensilsCrossed,
    defaultBadge: "COMBO SPECIAL",
    placeholderValue: "₹299 COMBO",
    placeholderTitle: "Burger + Fries + Cold Drink Combo",
    accentColor: "#8B3A2B",
    badgeBg: "bg-orange-50 text-orange-800 border-orange-200",
  },
  {
    id: "flat",
    label: "Flat Cash Discount (₹ Off)",
    shortLabel: "Flat ₹ Off",
    icon: Receipt,
    defaultBadge: "FLAT DISCOUNT",
    placeholderValue: "₹100 OFF",
    placeholderTitle: "Flat ₹100 Off on Orders Above ₹499",
    accentColor: "#15803D",
    badgeBg: "bg-emerald-50 text-emerald-800 border-emerald-200",
  },
  {
    id: "bogo",
    label: "Buy 1 Get 1 (BOGO)",
    shortLabel: "Buy 1 Get 1",
    icon: Gift,
    defaultBadge: "BUY 1 GET 1",
    placeholderValue: "1 + 1 FREE",
    placeholderTitle: "Buy 1 Mocktail, Get 1 Free",
    accentColor: "#7C3AED",
    badgeBg: "bg-purple-50 text-purple-800 border-purple-200",
  },
  {
    id: "custom",
    label: "Custom Promotional Deal",
    shortLabel: "Custom Deals",
    icon: TicketPercent,
    defaultBadge: "EXCLUSIVE DEAL",
    placeholderValue: "FREE DESSERT",
    placeholderTitle: "Complimentary Chef's Dessert on ₹399+",
    accentColor: "#B8860B",
    badgeBg: "bg-amber-50 text-amber-800 border-amber-200",
  },
];

export default function CafeOffersAdminPage() {
  const params = useParams();
  const menupages = (params?.menupages as string) || "";

  const apiUrl = menupages ? `/api/offers/${menupages}` : null;

  const { data, isLoading } = useSWR(apiUrl, fetcher, {
    revalidateOnFocus: true,
  });

  const offers: OfferItem[] = data?.data || [];

  // Active Category Tab: 'all' | 'percentage' | 'combo' | 'flat' | 'bogo' | 'custom'
  const [activeCategoryTab, setActiveCategoryTab] = useState<string>("all");
  // Status Filter: 'all' | 'active' | 'inactive'
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<OfferItem | null>(null);
  const [deletingOfferId, setDeletingOfferId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Form Fields
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formDiscountType, setFormDiscountType] = useState<OfferDiscountType>("percentage");
  const [formDiscountValue, setFormDiscountValue] = useState("");
  const [formCode, setFormCode] = useState("");
  const [formMinOrderAmount, setFormMinOrderAmount] = useState<string>("");
  const [formBadgeText, setFormBadgeText] = useState("SPECIAL OFFER");
  const [formIsActive, setFormIsActive] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  // Type Counts
  const countsByType = useMemo(() => {
    const counts: Record<string, number> = {
      all: offers.length,
      percentage: 0,
      combo: 0,
      flat: 0,
      bogo: 0,
      custom: 0,
    };
    offers.forEach((o) => {
      const type = o.discountType || "percentage";
      if (counts[type] !== undefined) counts[type]++;
    });
    return counts;
  }, [offers]);

  // Status Stats
  const statusStats = useMemo(() => {
    const total = offers.length;
    const active = offers.filter((o) => o.isActive).length;
    const inactive = total - active;
    return { total, active, inactive };
  }, [offers]);

  // Filtered List based on:
  // 1) Category Tab
  // 2) Status Filter
  // 3) Search Query
  const filteredOffers = useMemo(() => {
    return offers.filter((offer) => {
      // 1. Category Tab Filter
      if (activeCategoryTab !== "all" && offer.discountType !== activeCategoryTab) {
        return false;
      }

      // 2. Status Filter
      if (statusFilter === "active" && !offer.isActive) return false;
      if (statusFilter === "inactive" && offer.isActive) return false;

      // 3. Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = offer.title?.toLowerCase().includes(query);
        const matchesDesc = offer.description?.toLowerCase().includes(query);
        const matchesCode = offer.code?.toLowerCase().includes(query);
        const matchesValue = offer.discountValue?.toLowerCase().includes(query);
        return matchesTitle || matchesDesc || matchesCode || matchesValue;
      }

      return true;
    });
  }, [offers, activeCategoryTab, statusFilter, searchQuery]);

  // Handle open create modal
  const handleOpenCreateModal = (type: OfferDiscountType = "percentage", preset?: Partial<OfferItem>) => {
    const typeConfig = OFFER_TYPES.find((t) => t.id === type) || OFFER_TYPES[0];
    setEditingOffer(null);
    setFormTitle(preset?.title || "");
    setFormDescription(preset?.description || "");
    setFormDiscountType(type);
    setFormDiscountValue(preset?.discountValue || typeConfig.placeholderValue);
    setFormCode(preset?.code || "");
    setFormMinOrderAmount(preset?.minOrderAmount ? String(preset.minOrderAmount) : "");
    setFormBadgeText(preset?.badgeText || typeConfig.defaultBadge);
    setFormIsActive(true);
    setFormError(null);
    setIsModalOpen(true);
  };

  // Switch form discount type and auto-update defaults if empty
  const handleSelectDiscountType = (type: OfferDiscountType) => {
    setFormDiscountType(type);
    const typeConfig = OFFER_TYPES.find((t) => t.id === type);
    if (typeConfig) {
      if (!formBadgeText || formBadgeText === "SPECIAL OFFER" || OFFER_TYPES.some((t) => t.defaultBadge === formBadgeText)) {
        setFormBadgeText(typeConfig.defaultBadge);
      }
      if (!formDiscountValue || OFFER_TYPES.some((t) => t.placeholderValue === formDiscountValue)) {
        setFormDiscountValue(typeConfig.placeholderValue);
      }
    }
  };

  // Handle open edit modal
  const handleOpenEditModal = (offer: OfferItem) => {
    setEditingOffer(offer);
    setFormTitle(offer.title || "");
    setFormDescription(offer.description || "");
    setFormDiscountType(offer.discountType || "percentage");
    setFormDiscountValue(offer.discountValue || "");
    setFormCode(offer.code || "");
    setFormMinOrderAmount(offer.minOrderAmount ? String(offer.minOrderAmount) : "");
    setFormBadgeText(offer.badgeText || "SPECIAL OFFER");
    setFormIsActive(offer.isActive !== false);
    setFormError(null);
    setIsModalOpen(true);
  };

  // Handle toggle active status
  const handleToggleActive = async (offer: OfferItem) => {
    if (!apiUrl || togglingId) return;
    setTogglingId(offer._id);

    const newActiveState = !offer.isActive;

    // Optimistic UI update
    mutate(
      apiUrl,
      {
        ...data,
        data: offers.map((o) => (o._id === offer._id ? { ...o, isActive: newActiveState } : o)),
      },
      false
    );

    try {
      const res = await fetch(`/api/offers/${menupages}/${offer._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: newActiveState }),
      });

      if (!res.ok) throw new Error("Failed to update status");
      mutate(apiUrl);
    } catch (err) {
      console.error(err);
      mutate(apiUrl);
    } finally {
      setTogglingId(null);
    }
  };

  // Handle delete offer
  const handleDeleteOffer = async () => {
    if (!deletingOfferId || !apiUrl) return;
    try {
      const res = await fetch(`/api/offers/${menupages}/${deletingOfferId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete offer");
      mutate(apiUrl);
      setDeletingOfferId(null);
    } catch (err) {
      console.error(err);
    }
  };

  // Handle form submit
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setFormError("Please enter a title for this offer.");
      return;
    }
    if (!formDiscountValue.trim()) {
      setFormError("Please specify the discount value (e.g. 10% OFF, ₹100, ₹299).");
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    const payload = {
      title: formTitle.trim(),
      description: formDescription.trim(),
      discountType: formDiscountType,
      discountValue: formDiscountValue.trim(),
      code: formCode.trim().toUpperCase(),
      minOrderAmount: Number(formMinOrderAmount) || 0,
      badgeText: formBadgeText.trim().toUpperCase() || "SPECIAL OFFER",
      isActive: formIsActive,
    };

    try {
      let res;
      if (editingOffer) {
        res = await fetch(`/api/offers/${menupages}/${editingOffer._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`/api/offers/${menupages}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.message || "Failed to save offer.");
      }

      mutate(apiUrl);
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyCode = (code: string) => {
    try {
      navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch {}
  };

  const getTypeBadge = (type: string) => {
    const config = OFFER_TYPES.find((t) => t.id === type) || OFFER_TYPES[0];
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${config.badgeBg}`}>
        <Icon className="w-3 h-3" />
        <span>{config.shortLabel}</span>
      </span>
    );
  };

  const activeCategoryConfig = OFFER_TYPES.find((t) => t.id === activeCategoryTab);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* ─── Top Header ─── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#E5DFD4]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-bold uppercase tracking-wider mb-2">
            <TicketPercent className="w-3.5 h-3.5" />
            <span>Customer Promotions & Deals</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1C1917] tracking-tight font-serif">
            Special Offers & Deals
          </h1>
          <p className="text-sm text-[#78716C] mt-1 max-w-2xl">
            Create percentage discounts, combo meals, and promo vouchers shown to your guests right after scanning the table QR code and the Namaste greeting.
          </p>
        </div>

        {/* Create Button */}
        <button
          onClick={() => handleOpenCreateModal((activeCategoryTab !== "all" ? activeCategoryTab : "percentage") as OfferDiscountType)}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#B8860B] hover:bg-[#9C7006] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer self-start lg:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Offer</span>
        </button>
      </div>

      {/* ─── 1-Tap Quick Preset Starters ─── */}
      <div className="bg-[#FDFBF7] border border-[#EAE3D5] rounded-2xl p-4 shadow-2xs">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-[#8C827A] flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-[#B8860B]" />
            <span>1-Click Preset Shortcuts</span>
          </span>
          <span className="text-[11px] text-[#78716C] hidden sm:inline">
            Tap any preset to prefill and launch in 2 seconds
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            onClick={() =>
              handleOpenCreateModal("percentage", {
                title: "Flat 10% Off Welcome Deal",
                discountValue: "10% OFF",
                badgeText: "10% OFF",
                description: "Enjoy 10% discount on all food & beverage orders today.",
                code: "WELCOME10",
                minOrderAmount: 249,
              })
            }
            className="p-2.5 rounded-xl bg-white border border-[#E5DFD4] hover:border-[#B8860B] hover:shadow-xs transition-all text-left flex items-center gap-2.5 group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-[#B8860B] border border-amber-200/60 flex items-center justify-center shrink-0">
              <Percent className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-[#1C1917] group-hover:text-[#B8860B] transition-colors truncate">
                + 10% Off Deal
              </div>
              <div className="text-[10px] text-[#78716C]">Orders ₹249+</div>
            </div>
          </button>

          <button
            onClick={() =>
              handleOpenCreateModal("percentage", {
                title: "Flat 20% Off Mega Discount",
                discountValue: "20% OFF",
                badgeText: "20% OFF",
                description: "Save 20% on all main course dishes and specialties today.",
                code: "TASTY20",
                minOrderAmount: 499,
              })
            }
            className="p-2.5 rounded-xl bg-white border border-[#E5DFD4] hover:border-[#B8860B] hover:shadow-xs transition-all text-left flex items-center gap-2.5 group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-[#B8860B] border border-amber-200/60 flex items-center justify-center shrink-0">
              <Percent className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-[#1C1917] group-hover:text-[#B8860B] transition-colors truncate">
                + 20% Off Deal
              </div>
              <div className="text-[10px] text-[#78716C]">Orders ₹499+</div>
            </div>
          </button>

          <button
            onClick={() =>
              handleOpenCreateModal("combo", {
                title: "Gourmet Burger + Fries + Drink Combo",
                discountValue: "₹299 COMBO",
                badgeText: "HOT COMBO",
                description: "Personal Signature Burger + Crispy Peri-Peri Fries + Cold Drink at ₹299.",
                code: "COMBO299",
                minOrderAmount: 0,
              })
            }
            className="p-2.5 rounded-xl bg-white border border-[#E5DFD4] hover:border-[#8B3A2B] hover:shadow-xs transition-all text-left flex items-center gap-2.5 group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#8B3A2B] border border-orange-200/60 flex items-center justify-center shrink-0">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-[#1C1917] group-hover:text-[#8B3A2B] transition-colors truncate">
                + Combo Meal
              </div>
              <div className="text-[10px] text-[#78716C]">Special @ ₹299</div>
            </div>
          </button>

          <button
            onClick={() =>
              handleOpenCreateModal("flat", {
                title: "Flat ₹100 Off Today",
                discountValue: "₹100 OFF",
                badgeText: "FLAT ₹100",
                description: "Get flat ₹100 discount deducted instantly from your bill above ₹499.",
                code: "FLAT100",
                minOrderAmount: 499,
              })
            }
            className="p-2.5 rounded-xl bg-white border border-[#E5DFD4] hover:border-emerald-600 hover:shadow-xs transition-all text-left flex items-center gap-2.5 group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center justify-center shrink-0">
              <Receipt className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-[#1C1917] group-hover:text-emerald-700 transition-colors truncate">
                + Flat ₹100 Off
              </div>
              <div className="text-[10px] text-[#78716C]">Cash deduction</div>
            </div>
          </button>
        </div>
      </div>

      {/* ─── Category Tabs for Different Offers ─── */}
      <div className="space-y-3">
        {/* Main Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide border-b border-[#E5DFD4]">
          {/* All Deals Tab */}
          <button
            onClick={() => setActiveCategoryTab("all")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all cursor-pointer shrink-0 border-b-2 ${
              activeCategoryTab === "all"
                ? "border-[#B8860B] text-[#B8860B] bg-white shadow-2xs"
                : "border-transparent text-[#78716C] hover:text-[#1C1917] hover:bg-[#F3EFE6]"
            }`}
          >
            <TicketPercent className="w-4 h-4" />
            <span>All Deals</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
              activeCategoryTab === "all" ? "bg-[#B8860B]/15 text-[#B8860B]" : "bg-black/5 text-[#78716C]"
            }`}>
              {countsByType.all}
            </span>
          </button>

          {/* Type-Specific Tabs */}
          {OFFER_TYPES.map((type) => {
            const Icon = type.icon;
            const count = countsByType[type.id] || 0;
            const isActive = activeCategoryTab === type.id;

            return (
              <button
                key={type.id}
                onClick={() => setActiveCategoryTab(type.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all cursor-pointer shrink-0 border-b-2 ${
                  isActive
                    ? "border-[#B8860B] text-[#B8860B] bg-white shadow-2xs"
                    : "border-transparent text-[#78716C] hover:text-[#1C1917] hover:bg-[#F3EFE6]"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{type.shortLabel}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  isActive ? "bg-[#B8860B]/15 text-[#B8860B]" : "bg-black/5 text-[#78716C]"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Secondary Bar: Status Filters & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#E5DFD4] shadow-2xs">
          {/* Status Sub-Filters */}
          <div className="flex items-center gap-1.5 p-1 bg-[#F5F0E6] rounded-xl self-start">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === "all" ? "bg-white text-[#1C1917] shadow-xs" : "text-[#78716C] hover:text-[#1C1917]"
              }`}
            >
              All Status ({statusStats.total})
            </button>
            <button
              onClick={() => setStatusFilter("active")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                statusFilter === "active" ? "bg-white text-emerald-700 shadow-xs" : "text-[#78716C] hover:text-[#1C1917]"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Active Only ({statusStats.active})</span>
            </button>
            <button
              onClick={() => setStatusFilter("inactive")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === "inactive" ? "bg-white text-[#1C1917] shadow-xs" : "text-[#78716C] hover:text-[#1C1917]"
              }`}
            >
              Inactive / Drafts ({statusStats.inactive})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C827A]" />
            <input
              type="text"
              placeholder="Search by title, promo code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#FBF8F3] border border-[#E5DFD4] rounded-xl text-[#1C1917] placeholder:text-[#8C827A] focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8C827A] hover:text-[#1C1917]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ─── Offers Grid & Empty State ─── */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-[#78716C] gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm font-medium">Loading promotional offers...</p>
        </div>
      ) : filteredOffers.length === 0 ? (
        /* Empty State with TicketPercent Icon */
        <div className="bg-white border border-[#E5DFD4] rounded-3xl p-8 sm:p-14 text-center max-w-2xl mx-auto shadow-xs">
          {/* Distinct Luxury Ticket Icon Container */}
          <div className="w-16 h-16 rounded-2xl bg-[#F3EFE6] border border-[#E5DFD4] text-[#B8860B] flex items-center justify-center mx-auto mb-4 shadow-sm">
            <TicketPercent className="w-8 h-8" />
          </div>

          <h3 className="text-xl font-bold text-[#1C1917] font-serif">
            {searchQuery
              ? "No matching offers found"
              : activeCategoryTab !== "all"
              ? `No ${activeCategoryConfig?.shortLabel || "offers"} created yet`
              : "No offers in this section"}
          </h3>

          <p className="text-sm text-[#78716C] mt-2 max-w-md mx-auto">
            {searchQuery
              ? "Try adjusting your search keywords or clearing the search box."
              : `Create an offer in this tab to highlight discounts when dining guests scan your table QR code.`}
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => handleOpenCreateModal((activeCategoryTab !== "all" ? activeCategoryTab : "percentage") as OfferDiscountType)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#B8860B] hover:bg-[#9C7006] text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>
                Create {activeCategoryTab !== "all" ? activeCategoryConfig?.shortLabel : "Offer"}
              </span>
            </button>

            {(searchQuery || statusFilter !== "all" || activeCategoryTab !== "all") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setActiveCategoryTab("all");
                }}
                className="px-4 py-2.5 rounded-xl border border-[#E5DFD4] text-[#1C1917] text-xs font-bold hover:bg-[#F3EFE6] transition-colors cursor-pointer"
              >
                Reset All Filters
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Offer Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredOffers.map((offer) => {
            const isToggling = togglingId === offer._id;
            const typeConfig = OFFER_TYPES.find((t) => t.id === offer.discountType) || OFFER_TYPES[0];

            return (
              <motion.div
                key={offer._id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`relative bg-white border rounded-2xl p-5 shadow-xs flex flex-col justify-between transition-all ${
                  offer.isActive
                    ? "border-[#E5DFD4] hover:border-primary/40 hover:shadow-md"
                    : "border-gray-200 opacity-70 bg-[#FAF8F5]"
                }`}
              >
                <div>
                  {/* Top Bar: Ribbon Tag + Live Status Switch */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    {getTypeBadge(offer.discountType)}

                    {/* Active/Inactive Switch */}
                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-bold ${offer.isActive ? "text-emerald-700" : "text-[#78716C]"}`}>
                        {offer.isActive ? "Live on QR" : "Inactive"}
                      </span>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={offer.isActive}
                        disabled={isToggling}
                        onClick={() => handleToggleActive(offer)}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          offer.isActive ? "bg-emerald-600" : "bg-gray-300"
                        } ${isToggling ? "opacity-50 cursor-wait" : ""}`}
                        title={offer.isActive ? "Click to deactivate" : "Click to activate"}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                            offer.isActive ? "translate-x-4" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Main Value Callout & Title */}
                  <div className="mt-2">
                    <div className="text-2xl sm:text-3xl font-black text-[#B8860B] font-serif tracking-tight">
                      {offer.discountValue}
                    </div>
                    <h3 className="text-base font-bold text-[#1C1917] mt-1 line-clamp-1">
                      {offer.title}
                    </h3>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-[#78716C] mt-1.5 line-clamp-2 leading-relaxed min-h-[32px]">
                    {offer.description || "No specific terms provided."}
                  </p>

                  {/* Perforated Separator & Details */}
                  <div className="mt-3.5 pt-3 border-t border-dashed border-[#E5DFD4] flex items-center justify-between text-xs">
                    {offer.code ? (
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-[#1C1917] bg-[#F3EFE6] px-2 py-0.5 rounded border border-[#E5DFD4]">
                          {offer.code}
                        </span>
                        <button
                          onClick={() => handleCopyCode(offer.code || "")}
                          className="text-[#8C827A] hover:text-[#1C1917] p-1"
                          title="Copy promo code"
                        >
                          {copiedCode === offer.code ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-[#8C827A] italic">No code needed</span>
                    )}

                    {offer.minOrderAmount && offer.minOrderAmount > 0 ? (
                      <span className="text-[11px] font-semibold text-[#8C827A]">
                        Min. order ₹{offer.minOrderAmount}
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                        No min order
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="mt-4 pt-3 border-t border-[#E5DFD4] flex items-center justify-between gap-2">
                  <div className="text-[11px] text-[#8C827A]">
                    {offer.isActive ? (
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Visible to guests
                      </span>
                    ) : (
                      <span className="text-gray-500">Draft / Paused</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(offer)}
                      className="p-1.5 rounded-lg text-[#78716C] hover:text-[#1C1917] hover:bg-[#F3EFE6] transition-colors cursor-pointer"
                      title="Edit offer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingOfferId(offer._id)}
                      className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete offer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ─── Create / Edit Offer Modal ─── */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 10 }}
              className="relative w-full max-w-lg bg-[#FDFBF7] border border-[#E5DFD4] rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[92vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Gold Accent Bar */}
              <div className="h-1.5 w-full bg-gradient-to-r from-[#9C7006] via-[#D4AF37] to-[#B8860B]" />

              {/* Modal Header */}
              <div className="p-5 pb-3 border-b border-[#E5DFD4] flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[#1C1917] font-serif">
                    {editingOffer ? "Edit Special Offer" : "Create New Offer"}
                  </h2>
                  <p className="text-xs text-[#78716C] mt-0.5">
                    Configure discounts or combos shown to guests after table QR scanning.
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-[#78716C] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSubmitForm} className="p-5 overflow-y-auto space-y-4 flex-1">
                {formError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Offer Type Visual Selector */}
                <div>
                  <label className="block text-xs font-bold text-[#1C1917] mb-1.5">
                    Select Offer Type
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {OFFER_TYPES.filter((t) => t.id !== "custom").map((type) => {
                      const Icon = type.icon;
                      const isSelected = formDiscountType === type.id;
                      return (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => handleSelectDiscountType(type.id)}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            isSelected
                              ? "bg-white border-[#B8860B] ring-2 ring-[#B8860B]/20 shadow-xs"
                              : "bg-[#F5F0E6] border-transparent hover:bg-white hover:border-[#E5DFD4]"
                          }`}
                        >
                          <Icon className={`w-4 h-4 mb-1 ${isSelected ? "text-[#B8860B]" : "text-[#78716C]"}`} />
                          <div className={`text-xs font-bold ${isSelected ? "text-[#1C1917]" : "text-[#78716C]"}`}>
                            {type.shortLabel}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Offer Title */}
                <div>
                  <label className="block text-xs font-bold text-[#1C1917] mb-1">
                    Offer Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Flat 20% Off Main Course or Burger Combo"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#E5DFD4] rounded-xl text-[#1C1917] placeholder:text-[#8C827A] focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                {/* Discount Display Value & Promo Code */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#1C1917] mb-1">
                      Discount Value <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 10% OFF, ₹100, ₹299"
                      value={formDiscountValue}
                      onChange={(e) => setFormDiscountValue(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-[#E5DFD4] rounded-xl text-[#1C1917] placeholder:text-[#8C827A] focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1C1917] mb-1">
                      Promo Code (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. DINING20"
                      value={formCode}
                      onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 text-sm bg-white border border-[#E5DFD4] rounded-xl text-[#1C1917] uppercase font-mono placeholder:text-[#8C827A] focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                {/* Min Order & Badge Ribbon */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#1C1917] mb-1">
                      Minimum Order (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0 for no minimum"
                      value={formMinOrderAmount}
                      onChange={(e) => setFormMinOrderAmount(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-[#E5DFD4] rounded-xl text-[#1C1917] placeholder:text-[#8C827A] focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1C1917] mb-1">
                      Ribbon Tag
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 10% OFF, COMBO SPECIAL"
                      value={formBadgeText}
                      onChange={(e) => setFormBadgeText(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 text-sm bg-white border border-[#E5DFD4] rounded-xl text-[#1C1917] placeholder:text-[#8C827A] focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                {/* Terms / Description */}
                <div>
                  <label className="block text-xs font-bold text-[#1C1917] mb-1">
                    Terms & Description
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Applicable on all main course & dessert items today."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#E5DFD4] rounded-xl text-[#1C1917] placeholder:text-[#8C827A] focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                  />
                </div>

                {/* Active Checkbox */}
                <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-[#E5DFD4]">
                  <input
                    type="checkbox"
                    id="formIsActive"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer accent-[#B8860B]"
                  />
                  <label htmlFor="formIsActive" className="text-xs font-bold text-[#1C1917] cursor-pointer">
                    Publish immediately (Show in customer table QR popup)
                  </label>
                </div>

                {/* Modal Footer Actions */}
                <div className="pt-3 border-t border-[#E5DFD4] flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-[#78716C] hover:text-[#1C1917] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 text-xs font-bold rounded-xl bg-[#B8860B] hover:bg-[#9C7006] text-white shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>{editingOffer ? "Update Offer" : "Save & Publish"}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── Delete Confirmation Modal ─── */}
      <AnimatePresence>
        {deletingOfferId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setDeletingOfferId(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm bg-white border border-[#E5DFD4] rounded-2xl p-6 shadow-xl z-10 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#1C1917]">Delete this offer?</h3>
              <p className="text-xs text-[#78716C] mt-1">
                This will immediately remove the deal from your admin panel and the customer QR popup.
              </p>

              <div className="mt-5 flex items-center justify-center gap-2">
                <button
                  onClick={() => setDeletingOfferId(null)}
                  className="px-4 py-2 text-xs font-bold rounded-xl border border-[#E5DFD4] text-[#1C1917] hover:bg-[#F3EFE6] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteOffer}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-rose-600 text-white hover:bg-rose-700 transition-colors cursor-pointer shadow-sm"
                >
                  Yes, Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
