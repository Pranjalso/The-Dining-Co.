"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  CheckCircle2, 
  ShoppingCart, 
  Minus, 
  Plus, 
  Trash2, 
  Table, 
  Loader2, 
  MessageSquare,
  TicketPercent,
  Tag,
  Check,
  X,
  BadgePercent
} from "lucide-react";
import useSWR from "swr";
import CustomerRatingCard from "@/components/CustomerRatingCard";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type CartLine = {
  id: string;
  name: string;
  price: number;
  qty: number;
  image?: string;
  description?: string;
};

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const menupages = params?.menupages as string;
  const [lines, setLines] = useState<CartLine[]>([]);
  const [cartIds, setCartIds] = useState<string>("");

  // Get cart IDs from localStorage
  useEffect(() => {
    if (!menupages) return;
    const rawCart = window.localStorage.getItem(`sd:cart:${menupages}`);
    if (rawCart) {
      const quantities = JSON.parse(rawCart) as Record<string, number>;
      const ids = Object.entries(quantities)
        .filter(([_, qty]) => qty > 0)
        .map(([id]) => id)
        .join(',');
      setCartIds(ids);
    }
  }, [menupages]);

  // Use SWR for fetching cart items
  const { data: menuData, isLoading: isMenuLoading } = useSWR(
    menupages && cartIds ? `/api/menu/${menupages}?ids=${encodeURIComponent(cartIds)}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  useEffect(() => {
    if (!menupages) return;
    
    try {
      // First try to restore persisted checkout lines directly
      const rawLines = window.sessionStorage.getItem(`sd:checkoutLines:${menupages}`) || window.localStorage.getItem(`sd:checkoutLines:${menupages}`);
      if (rawLines) {
        const parsed = JSON.parse(rawLines);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setLines(parsed);
        }
      }

      const rawCart = window.localStorage.getItem(`sd:cart:${menupages}`);
      const rawCatalog = window.sessionStorage.getItem(`sd:items:${menupages}`);
      if (rawCart && rawCatalog) {
        const quantities = JSON.parse(rawCart) as Record<string, number>;
        const catalog = JSON.parse(rawCatalog) as any[];
        const mapped = Object.entries(quantities)
          .filter(([_, qty]) => qty > 0)
          .map(([id, qty]) => {
            const item = catalog.find(c => String(c.id) === String(id));
            return item ? {
              id: String(item.id),
              name: item.name,
              price: item.price,
              qty: qty,
              image: item.image,
              description: item.description,
            } : null;
          }).filter(Boolean) as CartLine[];
        if (mapped.length > 0) setLines(mapped);
      }
    } catch {}
  }, [menupages]);

  useEffect(() => {
    if (menuData?.success && Array.isArray(menuData.data)) {
      const rawCart = window.localStorage.getItem(`sd:cart:${menupages}`);
      if (!rawCart) return;
      const quantities = JSON.parse(rawCart) as Record<string, number>;
      
      const mapped: CartLine[] = menuData.data
        .map((item: any): CartLine => ({
          id: String(item._id),
          name: item.name,
          price: item.price,
          qty: quantities[String(item._id)] || 0,
          image: item.imageUrl,
          description: item.description,
        }))
        .filter((item: CartLine) => item.qty > 0);
      
      if (mapped.length > 0) {
        setLines(mapped);
        try {
          window.sessionStorage.setItem(`sd:checkoutLines:${menupages}`, JSON.stringify(mapped));
          window.localStorage.setItem(`sd:checkoutLines:${menupages}`, JSON.stringify(mapped));
        } catch {}
      }
    }
  }, [menuData, menupages]);

  // Keep storage updated when lines change
  useEffect(() => {
    if (lines.length > 0) {
      try {
        window.sessionStorage.setItem(`sd:checkoutLines:${menupages}`, JSON.stringify(lines));
        window.localStorage.setItem(`sd:checkoutLines:${menupages}`, JSON.stringify(lines));
      } catch {}
    }
  }, [lines, menupages]);

  const [tableNumber, setTableNumber] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "upi">("upi");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successOrder, setSuccessOrder] = useState<{ orderNumber: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isLoading = isMenuLoading;
  const [taxRate, setTaxRate] = useState(0);
  const [showTax, setShowTax] = useState<boolean | null>(null);

  // Prefetch payment page
  useEffect(() => {
    if (lines.length > 0 && tableNumber.trim()) {
      router.prefetch(`/${menupages}/menu/checkout/payment`);
    }
  }, [lines, tableNumber, menupages, router]);

  const { data: cafeData } = useSWR(
    menupages ? `/api/cafes/${menupages}/public` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  useEffect(() => {
    if (cafeData?.success && cafeData.data) {
      const newTax = typeof cafeData.data.taxRate === 'number' ? cafeData.data.taxRate : 5.0;
      const newShow = typeof cafeData.data.showTax === 'boolean' ? cafeData.data.showTax : true;
      setTaxRate(newTax);
      setShowTax(newShow);
      
      try {
        window.sessionStorage.setItem(`sd:cafeSettings:${menupages}`, JSON.stringify({ 
          taxRate: newTax, 
          showTax: newShow 
        }));
      } catch {}
    }
  }, [cafeData, menupages]);

  useEffect(() => {
    if (!menupages) return;
    try {
      const cached = window.sessionStorage.getItem(`sd:cafeSettings:${menupages}`);
      if (cached) {
        const { taxRate: tr, showTax: st } = JSON.parse(cached);
        if (tr !== undefined) setTaxRate(tr);
        if (st !== undefined) setShowTax(st);
      }
    } catch {}
  }, [menupages]);

  useEffect(() => {
    try {
      if (!menupages) return;
      const raw = window.sessionStorage.getItem(`sd:checkout:${menupages}`) || window.localStorage.getItem(`sd:checkout:${menupages}`);
      const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
      const urlTable = urlParams?.get('table');
      const urlInstructions = urlParams?.get('instructions') || urlParams?.get('notes');

      if (urlTable && urlTable.trim()) {
        setTableNumber(urlTable.trim());
      }

      if (raw) {
        const saved = JSON.parse(raw) as { tableNumber?: string; paymentMethod?: "cash" | "upi"; specialInstructions?: string };
        if (!urlTable && saved.tableNumber) setTableNumber(saved.tableNumber);
        if (saved.paymentMethod) setPaymentMethod(saved.paymentMethod);
        if (saved.specialInstructions) setSpecialInstructions(saved.specialInstructions);
      }

      if (urlInstructions && urlInstructions.trim()) {
        setSpecialInstructions(decodeURIComponent(urlInstructions.trim()));
      }
    } catch {}
  }, [menupages]);

  useEffect(() => {
    try {
      if (!menupages) return;
      const payload = { tableNumber, paymentMethod, specialInstructions };
      window.sessionStorage.setItem(`sd:checkout:${menupages}`, JSON.stringify(payload));
      window.localStorage.setItem(`sd:checkout:${menupages}`, JSON.stringify(payload));
    } catch {}
  }, [menupages, tableNumber, paymentMethod, specialInstructions]);

  // Fetch active promotional offers for this cafe
  const { data: offersData } = useSWR(
    menupages ? `/api/offers/${menupages}?activeOnly=true` : null,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 30000 }
  );
  const activeOffers = useMemo(() => {
    return Array.isArray(offersData?.data) ? offersData.data : [];
  }, [offersData]);

  const [promoInput, setPromoInput] = useState("");
  const [promoError, setPromoError] = useState<string | null>(null);
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discountType: string;
    discountValue: string;
    minOrderAmount?: number;
  } | null>(null);

  // Restore applied promo from sessionStorage
  useEffect(() => {
    try {
      if (!menupages) return;
      const rawPromo = window.sessionStorage.getItem(`sd:appliedOffer:${menupages}`);
      if (rawPromo) {
        setAppliedPromo(JSON.parse(rawPromo));
      }
    } catch {}
  }, [menupages]);

  const handleApplyPromo = (codeOverride?: string) => {
    setPromoError(null);
    const codeToTest = (codeOverride || promoInput).trim().toUpperCase();
    if (!codeToTest) {
      setPromoError("Please enter a promo code");
      return;
    }

    const matched = activeOffers.find((o: any) => o.code && o.code.toUpperCase() === codeToTest);
    if (!matched) {
      setPromoError(`Code "${codeToTest}" is invalid or expired`);
      return;
    }

    if (matched.minOrderAmount && subtotal < matched.minOrderAmount) {
      const diff = matched.minOrderAmount - subtotal;
      setPromoError(`Add items worth ₹${diff} more to use code "${matched.code}" (Min. order ₹${matched.minOrderAmount})`);
      return;
    }

    const promoData = {
      code: matched.code,
      discountType: matched.discountType,
      discountValue: matched.discountValue,
      minOrderAmount: matched.minOrderAmount,
    };
    setAppliedPromo(promoData);
    setPromoInput("");
    setPromoError(null);
    try {
      window.sessionStorage.setItem(`sd:appliedOffer:${menupages}`, JSON.stringify(promoData));
    } catch {}
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoError(null);
    try {
      window.sessionStorage.removeItem(`sd:appliedOffer:${menupages}`);
    } catch {}
  };

  const uniqueItemsCount = useMemo(() => lines.length, [lines]);
  const totalQuantity = useMemo(() => lines.reduce((sum, l) => sum + l.qty, 0), [lines]);
  const subtotal = useMemo(() => lines.reduce((sum, l) => sum + l.price * l.qty, 0), [lines]);

  const discount = useMemo(() => {
    if (!appliedPromo) return 0;
    if (appliedPromo.minOrderAmount && subtotal < appliedPromo.minOrderAmount) {
      return 0;
    }
    if (appliedPromo.discountType === 'percentage') {
      const pctMatch = String(appliedPromo.discountValue).match(/\d+/);
      const pct = pctMatch ? parseInt(pctMatch[0], 10) : 10;
      return Math.round((subtotal * pct) / 100);
    } else if (appliedPromo.discountType === 'flat') {
      const flatMatch = String(appliedPromo.discountValue).match(/\d+/);
      const flatVal = flatMatch ? parseInt(flatMatch[0], 10) : 100;
      return Math.min(subtotal, flatVal);
    } else {
      const valMatch = String(appliedPromo.discountValue).match(/\d+/);
      const val = valMatch ? parseInt(valMatch[0], 10) : 50;
      return Math.min(subtotal, val);
    }
  }, [appliedPromo, subtotal]);

  const discountedSubtotal = Math.max(0, subtotal - discount);
  const tax = useMemo(() => (showTax === true) ? Math.round(discountedSubtotal * (taxRate / 100)) : 0, [discountedSubtotal, taxRate, showTax]);
  const total = useMemo(() => discountedSubtotal + tax, [discountedSubtotal, tax]);

  const updateQuantity = useCallback((itemId: string, change: number) => {
    setLines(prev => {
      const newLines = prev.map(l => {
        if (l.id === itemId) {
          const newQty = Math.max(0, l.qty + change);
          return { ...l, qty: newQty };
        }
        return l;
      }).filter(l => l.qty > 0);
      
      try {
        const quantities: Record<string, number> = {};
        newLines.forEach(l => quantities[l.id] = l.qty);
        window.localStorage.setItem(`sd:cart:${menupages}`, JSON.stringify(quantities));
        
        window.dispatchEvent(new StorageEvent('storage', {
          key: `sd:cart:${menupages}`,
          newValue: JSON.stringify(quantities),
          storageArea: localStorage
        }));
      } catch {}
      
      return newLines;
    });
  }, [menupages]);

  const removeItem = useCallback((itemId: string) => {
    setLines(prev => {
      const newLines = prev.filter(l => l.id !== itemId);
      
      try {
        const quantities: Record<string, number> = {};
        newLines.forEach(l => quantities[l.id] = l.qty);
        window.localStorage.setItem(`sd:cart:${menupages}`, JSON.stringify(quantities));
        
        window.dispatchEvent(new StorageEvent('storage', {
          key: `sd:cart:${menupages}`,
          newValue: JSON.stringify(quantities),
          storageArea: localStorage
        }));
      } catch {}
      
      return newLines;
    });
  }, [menupages]);

  const placeOrder = async () => {
    if (!menupages || lines.length === 0 || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        tableNumber: tableNumber || "1",
        paymentMethod,
        paymentStatus: "pending" as const,
        specialInstructions: specialInstructions.trim() || undefined,
        notes: specialInstructions.trim() || undefined,
        discount,
        discountCode: appliedPromo?.code || undefined,
        items: lines.map(l => ({
          menuItemId: l.id,
          name: l.name,
          price: l.price,
          quantity: l.qty,
        })),
      };
      const res = await fetch(`/api/orders/${menupages}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json?.success) {
        throw new Error(json?.message || "Failed to place order");
      }
      const order = json.data;
      setSuccessOrder({ orderNumber: order.orderNumber, total: order.total });
      
      try {
        window.localStorage.setItem(`sd:latestOrder:${menupages}`, JSON.stringify({
          orderNumber: order.orderNumber,
          tableNumber: order.tableNumber,
          orderId: order._id,
          status: 'pending',
          createdAt: Date.now(),
        }));
        window.localStorage.removeItem(`sd:cart:${menupages}`);
        window.sessionStorage.removeItem(`sd:appliedOffer:${menupages}`);
        window.dispatchEvent(new StorageEvent('storage', {
          key: `sd:cart:${menupages}`,
          newValue: null,
          storageArea: localStorage
        }));
      } catch {}
    } catch (e: any) {
      setError(e?.message || "Failed to place order");
    } finally {
      setSubmitting(false);
    }
  };

  if (!menupages) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto bg-[#FBF8F3] min-h-screen shadow-xl border-x border-[#E5DFD4] flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-[#FBF8F3]/90 backdrop-blur-xl border-b border-[#E5DFD4] px-4 py-3">
          <div className="flex items-center gap-4">
            <Link 
              href={`/${menupages}/menu`} 
              className="w-10 h-10 rounded-xl bg-white border border-[#E5DFD4] flex items-center justify-center hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 shadow-sm group"
              aria-label="Back to menu"
            >
              <ArrowLeft className="w-5 h-5 text-muted group-hover:text-primary transition-colors" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/20">
                <ShoppingCart className="w-3.5 h-3.5 text-primary" />
              </div>
              <h1 className="text-lg font-bold text-text tracking-tight">Checkout</h1>
            </div>
            <div className="ml-auto flex items-center gap-1.5">
              <span className="text-[10px] text-muted uppercase tracking-wider font-semibold">{uniqueItemsCount} items</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-32">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : lines.length === 0 && !successOrder ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="w-24 h-24 bg-white rounded-2xl mx-auto mb-4 flex items-center justify-center border border-[#E5DFD4] shadow-sm">
                <ShoppingCart className="w-12 h-12 text-muted/40" />
              </div>
              <h2 className="text-lg font-bold text-text mb-2">Your cart is empty</h2>
              <p className="text-sm text-muted mb-6">Add items from the menu to get started</p>
              <Link
                href={`/${menupages}/menu`}
                className="inline-block bg-primary hover:bg-primary-hover text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-primary/20 transition-all duration-300"
              >
                Browse Menu
              </Link>
            </motion.div>
          ) : lines.length > 0 && !successOrder ? (
            <>
              {/* Summary Badge */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-primary/10 border border-primary/20 rounded-xl p-3"
              >
                <p className="text-sm text-muted">
                  <span className="font-semibold text-primary">{uniqueItemsCount}</span> different items ·{" "}
                  <span className="font-semibold text-primary">{totalQuantity}</span> total quantity
                </p>
              </motion.div>

              {/* Order Summary */}
              <div className="bg-white border border-[#E5DFD4] rounded-2xl p-4 shadow-sm">
                <h2 className="font-semibold text-text mb-3 tracking-tight">Order Summary</h2>
                <div className="space-y-2.5">
                  {lines.map((item, index) => (
                    <motion.div 
                      key={item.id} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="flex items-center gap-3 bg-[#FBF8F3] border border-[#E5DFD4] rounded-xl p-2.5 hover:border-primary/40 transition-all duration-300"
                    >
                      <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border border-[#E5DFD4] bg-white">
                        <img
                          src={item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop"}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop";
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="font-bold text-sm text-stone-900 truncate">{item.name}</h3>
                          <p className="text-xs text-stone-500 font-medium">₹{item.price} × {item.qty}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                          <p className="font-black text-sm text-stone-900">₹{item.price * item.qty}</p>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="w-7 h-7 rounded-lg bg-white border border-[#E5DFD4] flex items-center justify-center hover:border-[#B8860B]/40 hover:bg-[#F3EFE6] transition-all duration-200 active:scale-90"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3 h-3 text-stone-600" />
                            </button>
                            <span className="text-sm font-extrabold w-5 text-center text-stone-900 select-none">{item.qty}</span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="w-7 h-7 rounded-lg bg-[#B8860B] text-white flex items-center justify-center hover:bg-[#9C7006] transition-all duration-200 shadow-xs active:scale-90"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3 h-3 text-white" />
                            </button>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="ml-0.5 w-7 h-7 rounded-lg text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all duration-200 flex items-center justify-center active:scale-90"
                              aria-label="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Offers & Promo Code Section */}
              <div className="bg-white border border-[#E5DFD4] rounded-2xl p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                      <TicketPercent className="w-4 h-4" />
                    </div>
                    <h2 className="font-bold text-stone-900 text-sm tracking-tight">Offers & Promo Code</h2>
                  </div>
                  {appliedPromo && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1 font-display">
                      <Check className="w-3 h-3" /> Applied
                    </span>
                  )}
                </div>

                {/* If already applied: show banner */}
                {appliedPromo ? (
                  <div className="p-3 bg-gradient-to-r from-emerald-50 via-[#FAF8F2] to-[#FAF8F2] border border-emerald-200/80 rounded-xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 font-display">
                        %
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-black text-sm text-stone-900 tracking-wider">{appliedPromo.code}</span>
                          <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded font-display">
                            {appliedPromo.discountValue}
                          </span>
                        </div>
                        <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                          {discount > 0 ? `You are saving ₹${discount} on this order!` : `Add more items to activate (Min. order ₹${appliedPromo.minOrderAmount})`}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemovePromo}
                      className="text-xs text-stone-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer font-medium"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Input & Apply Button */}
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={promoInput}
                          onChange={(e) => {
                            setPromoInput(e.target.value.toUpperCase());
                            if (promoError) setPromoError(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleApplyPromo();
                            }
                          }}
                          placeholder="Enter coupon code (e.g. TASTY20)"
                          className="w-full px-3.5 py-2.5 bg-[#FBF8F3] border border-[#E5DFD4] rounded-xl text-stone-900 text-xs font-mono font-bold tracking-wider placeholder:font-sans placeholder:font-normal placeholder:text-stone-400 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none uppercase"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleApplyPromo()}
                        className="px-4 py-2.5 bg-gradient-to-r from-[#B8860B] to-[#9C7006] text-white rounded-xl text-xs font-bold tracking-wide shadow-xs hover:from-[#A2760A] hover:to-[#855D05] transition-all cursor-pointer shrink-0 font-display"
                      >
                        Apply
                      </button>
                    </div>

                    {promoError && (
                      <p className="text-xs text-rose-600 font-medium bg-rose-50 border border-rose-200 rounded-lg p-2">
                        ⚠️ {promoError}
                      </p>
                    )}

                    {/* Quick Tap Available Deals */}
                    {activeOffers.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider font-display">
                          Tap to apply coupon:
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {activeOffers.map((deal: any) => (
                            <button
                              key={deal._id || deal.code}
                              type="button"
                              onClick={() => handleApplyPromo(deal.code)}
                              className="px-2.5 py-1.5 rounded-lg bg-[#FBF8F3] hover:bg-[#F3EFE6] border border-[#E5DFD4] hover:border-primary/50 text-left transition-all cursor-pointer flex items-center gap-1.5 group"
                            >
                              <BadgePercent className="w-3.5 h-3.5 text-primary group-hover:scale-110 transition-transform" />
                              <span className="font-mono font-bold text-xs text-stone-900">{deal.code}</span>
                              <span className="text-[10px] text-[#B8860B] font-bold font-price">({deal.discountValue})</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Price Details */}
              <div className="bg-white border border-[#E5DFD4] rounded-2xl p-4 shadow-sm">
                <h2 className="font-bold text-stone-900 mb-3 tracking-tight">Price Details</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-stone-500">
                      Subtotal ({uniqueItemsCount} {uniqueItemsCount === 1 ? 'item' : 'items'} · {totalQuantity} {totalQuantity === 1 ? 'quantity' : 'quantities'})
                    </span>
                    <span className="font-semibold text-stone-900 font-price tabular-nums">₹{subtotal}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-bold">
                      <span className="flex items-center gap-1">
                        <Tag className="w-3.5 h-3.5 text-emerald-600" />
                        Coupon Discount ({appliedPromo?.code})
                      </span>
                      <span className="font-price tabular-nums">-₹{discount}</span>
                    </div>
                  )}
                  {showTax === true && (
                    <div className="flex justify-between">
                      <span className="text-stone-500">Tax ({taxRate}%)</span>
                      <span className="font-semibold text-stone-900 font-price tabular-nums">₹{tax}</span>
                    </div>
                  )}
                  <div className="border-t border-[#E5DFD4] pt-2.5 mt-2">
                    <div className="flex justify-between items-baseline font-bold">
                      <span className="text-stone-900 font-extrabold text-base">Total</span>
                      <div className="text-right">
                        {discount > 0 && (
                          <span className="text-xs text-stone-400 line-through mr-2 font-medium font-price tabular-nums">
                            ₹{subtotal + (showTax === true ? Math.round(subtotal * (taxRate / 100)) : 0)}
                          </span>
                        )}
                        <span className="text-stone-900 font-black text-xl tracking-tight font-price tabular-nums">₹{total}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Table Number */}
              <div className="bg-white border border-[#E5DFD4] rounded-2xl p-4 shadow-sm" id="table-number-section">
                <h2 className="font-semibold text-text mb-3 flex items-center gap-2 tracking-tight">
                  <Table className="w-4 h-4 text-primary" />
                  Table Number <span className="text-primary">*</span>
                </h2>
                <div className="space-y-2">
                  <input
                    id="table-number"
                    type="text"
                    placeholder="Enter your table no."
                    value={tableNumber}
                    onChange={(e) => {
                      setTableNumber(e.target.value);
                      if (error) setError("");
                    }}
                    className={`w-full px-4 py-3 bg-[#FBF8F3] border rounded-xl text-text placeholder:text-muted/60 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300 ${
                      error ? "border-rose-400" : "border-[#E5DFD4]"
                    }`}
                    required
                  />
                  {error && (
                    <p className="text-xs text-rose-500 font-medium">⚠️ {error}</p>
                  )}
                  <p className="text-xs text-muted">e.g. 01, 02, 03...</p>
                </div>
              </div>

              {/* Special Instructions / Requests */}
              <div className="bg-white border border-[#E5DFD4] rounded-2xl p-4 shadow-sm">
                <h2 className="font-semibold text-text mb-2 flex items-center gap-2 tracking-tight">
                  <MessageSquare className="w-4 h-4 text-primary" />
                  Special Instructions / Requests
                  <span className="text-[10px] font-normal text-muted ml-auto uppercase tracking-wider">Optional</span>
                </h2>
                <p className="text-xs text-muted mb-3">
                  Want to add or remove something? Tell the kitchen your preference.
                </p>
                <textarea
                  rows={2}
                  placeholder="e.g. Less spicy, remove onions, extra sauce, no sugar..."
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#FBF8F3] border border-[#E5DFD4] rounded-xl text-text text-sm placeholder:text-muted/60 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300 resize-none"
                />
              </div>

              {error && (
                <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-4 py-2.5 font-medium">
                  {error}
                </div>
              )}
            </>
          ) : successOrder ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-4 shadow-sm"
            >
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center border border-emerald-300 text-emerald-600">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-text">Order Placed!</h2>
              <p className="text-sm text-muted">
                Your order number is <span className="font-bold text-primary">#{successOrder.orderNumber}</span>.
              </p>
              <p className="text-sm text-muted">
                Amount payable: <span className="font-bold text-primary">₹{successOrder.total}</span>
              </p>
              <p className="text-xs text-muted">
                Please keep this screen open or share the order number with the staff.
              </p>

              <CustomerRatingCard 
                cafeSlug={menupages} 
                orderNumber={successOrder.orderNumber} 
                tableNumber={tableNumber} 
                className="mt-5 text-left"
              />
            </motion.div>
          ) : null}
        </div>

        {/* Bottom Bar */}
        <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur-xl border-t border-[#E5DFD4] shadow-2xl z-40 p-4">
          {!successOrder ? (
            <button
              onClick={() => {
                if (!tableNumber.trim()) {
                  setError("Please enter your table number to proceed");
                  const el = document.getElementById("table-number");
                  if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                  return;
                }
                try {
                  const cleanInstructions = specialInstructions.trim();
                  const payload = { 
                    tableNumber: tableNumber.trim(), 
                    paymentMethod, 
                    specialInstructions: cleanInstructions,
                    notes: cleanInstructions,
                    discount,
                    discountCode: appliedPromo?.code
                  };
                  window.sessionStorage.setItem(`sd:checkout:${menupages}`, JSON.stringify(payload));
                  window.localStorage.setItem(`sd:checkout:${menupages}`, JSON.stringify(payload));
                  if (lines.length > 0) {
                    window.sessionStorage.setItem(`sd:checkoutLines:${menupages}`, JSON.stringify(lines));
                    window.localStorage.setItem(`sd:checkoutLines:${menupages}`, JSON.stringify(lines));
                  }
                  
                  const qParams = new URLSearchParams({
                    table: tableNumber.trim(),
                  });
                  if (cleanInstructions) {
                    qParams.set('instructions', cleanInstructions);
                  }
                  router.push(`/${menupages}/menu/checkout/payment?${qParams.toString()}`);
                } catch {
                  router.push(`/${menupages}/menu/checkout/payment?table=${encodeURIComponent(tableNumber.trim())}`);
                }
              }}
              disabled={lines.length === 0 || submitting || !tableNumber.trim() || isLoading}
              className={`block w-full py-3.5 rounded-xl font-bold transition-all duration-300 text-center ${
                !tableNumber.trim() || lines.length === 0 || isLoading
                  ? "bg-[#F3EFE6] text-stone-400 cursor-not-allowed border border-[#E5DFD4]" 
                  : "bg-gradient-to-r from-[#B8860B] to-[#9C7006] hover:from-[#A2760A] hover:to-[#855D05] text-white shadow-lg shadow-[#B8860B]/25 hover:scale-[1.01] active:scale-[0.98]"
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading...
                </span>
              ) : (
                `Proceed to Payment · ₹${total}`
              )}
            </button>
          ) : (
            <Link
              href={`/${menupages}/menu`}
              className="block w-full text-center bg-gradient-to-r from-[#B8860B] to-[#9C7006] hover:from-[#A2760A] hover:to-[#855D05] text-white py-3.5 rounded-xl font-bold transition-all duration-300 shadow-lg shadow-[#B8860B]/25"
            >
              Back to Menu
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}