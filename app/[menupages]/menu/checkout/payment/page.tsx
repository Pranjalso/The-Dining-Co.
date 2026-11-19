"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Smartphone, 
  Wallet, 
  Lock, 
  Loader2, 
  QrCode, 
  Copy, 
  Check, 
  ExternalLink,
  Edit2,
  ShoppingCart,
  Tag,
  TicketPercent,
  Receipt,
  Store,
  CheckCircle2,
} from "lucide-react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type PaymentMethod = "upi" | "cash";

type PageProps = {
  params: { menupages: string };
};

export default function CheckoutPaymentPage({ params }: PageProps) {
  const { menupages } = params;
  return <PaymentPageContent menupages={menupages} />;
}

function PaymentPageContent({ menupages }: { menupages: string }) {
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("upi");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tableNumber, setTableNumber] = useState("");
  const [isEditingTable, setIsEditingTable] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [showInstructions, setShowInstructions] = useState(false);
  const [lines, setLines] = useState<Array<{
    id: string;
    baseId?: string;
    name: string;
    price: number;
    qty: number;
    image?: string;
    description?: string;
    selectedModifiers?: Array<{ groupName: string; name: string; price: number }>;
  }>>([]);
  const [orderNumber, setOrderNumber] = useState<number | null>(null);
  const [taxRate, setTaxRate] = useState(0);
  const [showTax, setShowTax] = useState<boolean | null>(null);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [cartIds, setCartIds] = useState<string>("");

  // Prefetch confirmation page
  useEffect(() => {
    if (orderNumber) {
      router.prefetch(`/${menupages}/menu/order-confirmation?orderNumber=${orderNumber}`);
    }
  }, [orderNumber, menupages, router]);

  // Extract cart IDs from localStorage
  useEffect(() => {
    try {
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
    } catch {}
  }, [menupages]);

  // Load Cafe Public Settings via SWR
  const { data: cafeData } = useSWR(
    menupages ? `/api/cafes/${menupages}/public` : null,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  );

  // Reliable SWR menu item fetch from server (failsafe for direct refresh or lost session storage)
  const { data: menuData, isLoading: isMenuLoading } = useSWR(
    menupages && cartIds ? `/api/menu/${menupages}?ids=${encodeURIComponent(cartIds)}` : null,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  );

  useEffect(() => {
    if (cafeData?.success && cafeData.data) {
      const newTax = typeof cafeData.data.taxRate === 'number' ? cafeData.data.taxRate : 5.0;
      const newShow = typeof cafeData.data.showTax === 'boolean' ? cafeData.data.showTax : true;
      setTaxRate(newTax);
      setShowTax(newShow);
      try {
        window.sessionStorage.setItem(`sd:cafeSettings:${menupages}`, JSON.stringify({ taxRate: newTax, showTax: newShow }));
      } catch {}
    }
  }, [cafeData, menupages]);

  // Restore form state, table number, and special instructions
  useEffect(() => {
    try {
      const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
      const urlTable = urlParams?.get('table');
      const urlInstructions = urlParams?.get('instructions') || urlParams?.get('notes');
      const rawForm = window.sessionStorage.getItem(`sd:checkout:${menupages}`) || window.localStorage.getItem(`sd:checkout:${menupages}`);
      
      if (urlTable && urlTable.trim()) {
        setTableNumber(urlTable.trim());
      }
      
      if (rawForm) {
        const saved = JSON.parse(rawForm);
        if (!urlTable && saved.tableNumber) setTableNumber(saved.tableNumber);
        if (saved.paymentMethod) setPaymentMethod(saved.paymentMethod);
        const instr = saved.specialInstructions || saved.notes;
        if (instr && instr.trim()) {
          setSpecialInstructions(instr.trim());
          setShowInstructions(true);
        }
      }

      if (urlInstructions && urlInstructions.trim()) {
        const decoded = decodeURIComponent(urlInstructions.trim());
        setSpecialInstructions(decoded);
        setShowInstructions(true);
      }
    } catch (err) {
      console.error("Error restoring checkout state:", err);
    }
  }, [menupages]);

  // Initial immediate restore from checkout lines storage or items catalog
  useEffect(() => {
    try {
      const rawLines = window.sessionStorage.getItem(`sd:checkoutLines:${menupages}`) || window.localStorage.getItem(`sd:checkoutLines:${menupages}`);
      if (rawLines) {
        const parsed = JSON.parse(rawLines);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setLines(parsed);
          return;
        }
      }

      const rawCart = window.localStorage.getItem(`sd:cart:${menupages}`);
      const rawItems = window.sessionStorage.getItem(`sd:items:${menupages}`) || window.localStorage.getItem(`sd:items:${menupages}`);
      if (!rawCart) {
        setLines([]);
        return;
      }
      const quantities = JSON.parse(rawCart) as Record<string, number>;
      const entries = Object.entries(quantities).filter(([_, qty]) => qty > 0);
      const mapped: Array<{ id: string; name: string; price: number; qty: number; image?: string; description?: string }> = [];
      const items = rawItems ? JSON.parse(rawItems) : [];

      entries.forEach(([id, qty]) => {
        const item = items.find((i: any) => String(i.id) === String(id));
        if (item) {
          mapped.push({ id: String(item.id), name: item.name, price: Number(item.price) || 0, qty, image: item.image, description: item.description });
        }
      });

      if (mapped.length > 0) {
        setLines(mapped);
      }
    } catch {
      setLines([]);
    }
  }, [menupages]);

  // Sync from server menuData when fetched
  useEffect(() => {
    if (menuData?.success && Array.isArray(menuData.data) && menuData.data.length > 0) {
      try {
        const rawCart = window.localStorage.getItem(`sd:cart:${menupages}`);
        if (!rawCart) return;
        const quantities = JSON.parse(rawCart) as Record<string, number>;

        const mapped = menuData.data
          .map((item: any) => ({
            id: String(item._id),
            name: item.name,
            price: Number(item.price) || 0,
            qty: quantities[String(item._id)] || 1,
            image: item.imageUrl,
            description: item.description,
          }))
          .filter((item: any) => item.qty > 0);

        if (mapped.length > 0) {
          setLines(mapped);
          try {
            window.sessionStorage.setItem(`sd:checkoutLines:${menupages}`, JSON.stringify(mapped));
            window.localStorage.setItem(`sd:checkoutLines:${menupages}`, JSON.stringify(mapped));
          } catch {}
        }
      } catch {}
    }
  }, [menuData, menupages]);

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
      const rawPromo =
        window.sessionStorage.getItem(`sd:appliedOffer:${menupages}`) ||
        window.localStorage.getItem(`sd:appliedOffer:${menupages}`);
      if (rawPromo) {
        setAppliedPromo(JSON.parse(rawPromo));
      }
    } catch {}
  }, [menupages]);

  // Check active offers to ensure promo is still valid
  const { data: offersData } = useSWR(
    menupages ? `/api/offers/${menupages}?activeOnly=true` : null,
    fetcher,
    { revalidateOnFocus: true, dedupingInterval: 0 }
  );

  // Invalidate applied promo if it is no longer in active offers
  useEffect(() => {
    if (offersData?.data !== undefined && Array.isArray(offersData.data) && appliedPromo) {
      const isStillActive = offersData.data.some(
        (o: any) => o.code && o.code.toUpperCase() === appliedPromo.code?.toUpperCase() && o.isActive !== false
      );
      if (!isStillActive) {
        setAppliedPromo(null);
        try {
          window.sessionStorage.removeItem(`sd:appliedOffer:${menupages}`);
          window.localStorage.removeItem(`sd:appliedOffer:${menupages}`);
        } catch {}
      }
    }
  }, [offersData, appliedPromo, menupages]);

  // Calculated totals with discount
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

  const cafeUpiId = cafeData?.data?.upiId || "";
  const cafeUpiQr = cafeData?.data?.upiQrCode || "";
  const cafeName = cafeData?.data?.cafeName || menupages;

  // Deep-link for mobile UPI apps
  const upiDeepLink = useMemo(() => {
    if (!cafeUpiId) return null;
    const cleanNote = `Order Table ${tableNumber || '1'} ${cafeName}`.replace(/[^a-zA-Z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 35);
    const note = encodeURIComponent(cleanNote);
    return `upi://pay?pa=${encodeURIComponent(cafeUpiId)}&pn=${encodeURIComponent(cafeName)}&am=${total}&cu=INR&tn=${note}`;
  }, [cafeUpiId, cafeName, total, tableNumber]);

  // Client-side dynamic QR generation for exact total amount & table reference
  const [dynamicQr, setDynamicQr] = useState<string>("");

  useEffect(() => {
    let isMounted = true;
    if (upiDeepLink) {
      import("qrcode")
        .then((QRCode) => {
          QRCode.toDataURL(upiDeepLink, {
            width: 400,
            margin: 2,
            color: { dark: "#1C1917", light: "#FFFFFF" },
          })
            .then((dataUrl) => {
              if (isMounted) setDynamicQr(dataUrl);
            })
            .catch(() => {});
        })
        .catch(() => {});
    }
    return () => {
      isMounted = false;
    };
  }, [upiDeepLink]);

  const activeQrCode = dynamicQr || cafeUpiQr;

  // Active table tab detection
  const cleanTable = tableNumber ? tableNumber.trim() : "";
  const tabCheckUrl = menupages && cleanTable ? `/api/orders/${menupages}/tab?table=${encodeURIComponent(cleanTable)}` : null;
  const { data: tableTabData } = useSWR(tabCheckUrl, fetcher, {
    revalidateOnFocus: true,
    dedupingInterval: 10000,
  });
  const hasActiveTab = Boolean(tableTabData?.success && tableTabData?.hasActiveTab);
  const activeTabRounds = tableTabData?.data?.totalRounds || 0;
  const primaryOrderNum = tableTabData?.data?.primaryOrderNumber;

  const handlePayment = async () => {
    if (!tableNumber.trim()) {
      setError("Please specify your table number");
      setIsEditingTable(true);
      return;
    }
    if (lines.length === 0) {
      setError("Your cart is empty");
      return;
    }
    setProcessing(true);
    setError(null);
    try {
      const payload = {
        tableNumber: tableNumber.trim(),
        paymentMethod,
        paymentStatus: "pending" as const,
        specialInstructions: specialInstructions?.trim() || undefined,
        notes: specialInstructions?.trim() || undefined,
        discount,
        discountCode: appliedPromo?.code || undefined,
        parentOrderNumber: primaryOrderNum || undefined,
        items: lines.map(l => ({
          menuItemId: l.baseId || (l.id.includes('::') ? l.id.split('::')[0] : l.id),
          name: l.name,
          price: l.price,
          quantity: l.qty,
          selectedModifiers: l.selectedModifiers && l.selectedModifiers.length > 0 ? l.selectedModifiers : undefined,
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
      setOrderNumber(order.orderNumber);
      try {
        window.localStorage.setItem(`sd:latestOrder:${menupages}`, JSON.stringify({
          orderNumber: order.orderNumber,
          tableNumber: order.tableNumber,
          orderId: order._id,
          specialInstructions: order.specialInstructions || specialInstructions?.trim() || undefined,
          status: 'pending',
          createdAt: Date.now(),
        }));
        window.localStorage.removeItem(`sd:cart:${menupages}`);
        window.localStorage.removeItem(`sd:checkoutLines:${menupages}`);
        window.sessionStorage.removeItem(`sd:checkoutLines:${menupages}`);
        window.sessionStorage.removeItem(`sd:appliedOffer:${menupages}`);
      } catch {}
      
      router.push(`/${menupages}/menu/order-confirmation?orderNumber=${order.orderNumber}&table=${encodeURIComponent(order.tableNumber)}`);
    } catch (e: any) {
      setError(e?.message || "Failed to process payment");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen menu-container text-text flex flex-col justify-between">
      <div className="max-w-md w-full mx-auto min-h-screen flex flex-col menu-container border-x menu-border shadow-xl">
        
        {/* ─── Navigation Header ─── */}
        <header className="sticky top-0 z-20 menu-header/95 backdrop-blur-xl border-b menu-border px-4 py-3 flex items-center justify-between">
          <Link 
            href={`/${menupages}/menu/checkout`}
            className="w-9 h-9 rounded-full menu-card hover:bg-[var(--theme-surface)] border menu-border flex items-center justify-center transition-colors menu-muted hover:menu-text shadow-xs"
            aria-label="Back to checkout"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div className="text-center">
            <span className="text-[10px] uppercase tracking-widest menu-muted font-semibold block">Checkout</span>
            <span className="text-sm font-bold menu-text">Payment</span>
          </div>

          <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
            <Lock className="w-2.5 h-2.5" />
            <span>Secure</span>
          </div>
        </header>

        {/* ─── Main Content ─── */}
        <main className="flex-1 p-4 space-y-4">
          
          {isMenuLoading && lines.length === 0 ? (
            <div className="py-24 text-center space-y-3 menu-card border menu-border rounded-3xl shadow-xs">
              <Loader2 className="w-8 h-8 animate-spin mx-auto menu-primary-text" />
              <p className="text-sm font-bold menu-text">Loading order details...</p>
            </div>
          ) : lines.length === 0 ? (
            <div className="menu-card border menu-border rounded-3xl p-8 text-center space-y-4 shadow-sm my-6">
              <div className="w-16 h-16 bg-[var(--theme-surface)] rounded-2xl mx-auto flex items-center justify-center border menu-border menu-muted">
                <ShoppingCart className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold menu-text">Your Cart is Empty</h3>
              <p className="text-xs menu-muted max-w-xs mx-auto leading-relaxed">
                No items found in your cart. Please add items from the menu before placing an order.
              </p>
              <Link
                href={`/${menupages}/menu`}
                className="inline-block px-6 py-3 bg-gradient-to-r from-[#B8860B] to-[#9C7006] hover:from-[#A2760A] hover:to-[#855D05] text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95"
              >
                Browse Menu
              </Link>
            </div>
          ) : (
            <>
              {/* Continuous Table Tab Badge */}
              {hasActiveTab && (
                <div className="bg-gradient-to-r from-amber-900/90 to-amber-800 text-white rounded-2xl p-4 shadow-md border border-amber-600/30 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Receipt className="w-4 h-4 text-amber-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/30 text-amber-200 px-2 py-0.5 rounded-full border border-amber-400/30">
                        Tab Extension · Round #{activeTabRounds + 1}
                      </span>
                      <span className="text-xs font-semibold text-amber-200">
                        Table {cleanTable}
                      </span>
                    </div>
                    <p className="text-xs text-amber-100/90 mt-1 leading-relaxed">
                      This order will be added to your active table tab (Primary #{primaryOrderNum}). You can pay now or settle everything when you request your final bill.
                    </p>
                  </div>
                </div>
              )}

              {/* Order Summary & Table Pill */}
              <div className="bg-white border border-[#E5DFD4] rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-[#E5DFD4]">
                  <div>
                    <span className="text-[11px] text-stone-500 uppercase tracking-wider font-semibold">Total Amount</span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      {discount > 0 && (
                        <span className="text-xs text-stone-400 line-through font-medium font-price tabular-nums">
                          ₹{subtotal + (showTax === true ? Math.round(subtotal * (taxRate / 100)) : 0)}
                        </span>
                      )}
                      <span className="text-2xl font-black text-stone-900 font-price tracking-tight tabular-nums">
                        ₹{total}
                      </span>
                    </div>
                    {discount > 0 && (
                      <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">
                        🏷️ {appliedPromo?.code} applied (-₹{discount})
                      </span>
                    )}
                    {showTax === true && tax > 0 && (
                      <span className="text-[10px] text-stone-500 block mt-0.5">
                        Includes ₹{tax} tax ({taxRate}%)
                      </span>
                    )}
                  </div>

                  {/* Compact Table Identifier */}
                  <div className="text-right">
                    <span className="text-[10px] text-stone-500 uppercase tracking-wider font-semibold block">Dining At</span>
                    {isEditingTable || !tableNumber.trim() ? (
                      <div className="flex items-center gap-1 mt-1">
                        <input
                          type="text"
                          placeholder="Table #"
                          value={tableNumber}
                          onChange={(e) => {
                            setTableNumber(e.target.value);
                            if (error) setError(null);
                          }}
                          onBlur={() => {
                            if (tableNumber.trim()) setIsEditingTable(false);
                          }}
                          autoFocus
                          className="w-20 px-2 py-1 bg-[#FBF8F3] border border-[#B8860B]/40 rounded-lg text-xs text-stone-900 font-bold text-center outline-none focus:ring-1 focus:ring-[#B8860B]"
                        />
                        {tableNumber.trim() && (
                          <button
                            type="button"
                            onClick={() => setIsEditingTable(false)}
                            className="text-xs text-[#B8860B] font-bold px-1"
                          >
                            ✓
                          </button>
                        )}
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsEditingTable(true)}
                        className="mt-1 inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#B8860B]/10 border border-[#B8860B]/20 text-[#B8860B] text-xs font-bold hover:bg-[#B8860B]/20 transition-colors shadow-xs"
                      >
                        <span>Table {tableNumber}</span>
                        <Edit2 className="w-2.5 h-2.5 opacity-60 ml-0.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Itemized summary rows */}
                <div className="pt-2.5 space-y-1.5">
                  {lines.map((l) => (
                    <div key={l.id} className="py-1 border-b border-[#E5DFD4]/50 last:border-0">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-stone-700 font-semibold truncate max-w-[220px]">
                          {l.name} <span className="text-stone-400 font-bold ml-1">× {l.qty}</span>
                        </span>
                        <span className="font-bold text-stone-900 font-price">₹{l.price * l.qty}</span>
                      </div>
                      {l.selectedModifiers && l.selectedModifiers.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {l.selectedModifiers.map((mod, modIdx) => (
                            <span
                              key={modIdx}
                              className="text-[10px] text-[#9C7006] font-medium"
                            >
                              +{mod.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  {discount > 0 && (
                    <div className="flex justify-between items-center text-xs text-emerald-700 font-bold pt-1.5 border-t border-dashed border-[#E5DFD4]">
                      <span className="flex items-center gap-1">
                        <Tag className="w-3 h-3 text-emerald-600" />
                        Promo Discount ({appliedPromo?.code})
                      </span>
                      <span>-₹{discount}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* ─── Payment Method Selection ─── */}
              <div className="space-y-2.5">
                <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                  Payment Method
                </label>

                <div className="grid grid-cols-2 gap-2.5">
                  {/* Option 1: Scan UPI at Counter */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("upi")}
                    className={`p-3.5 rounded-2xl border text-left transition-all duration-200 relative ${
                      paymentMethod === "upi"
                        ? "bg-[#FBF8F3] border-[#B8860B] ring-2 ring-[#B8860B]/20 shadow-sm"
                        : "bg-white border-[#E5DFD4] hover:border-stone-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                        paymentMethod === "upi" ? "bg-[#B8860B] text-white" : "bg-stone-100 text-stone-600"
                      }`}>
                        <QrCode className="w-4 h-4" />
                      </div>
                      <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        paymentMethod === "upi" ? "border-[#B8860B] bg-[#B8860B]" : "border-stone-300"
                      }`}>
                        {paymentMethod === "upi" && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-stone-900 leading-snug">UPI at Counter</p>
                    <p className="text-[10px] text-stone-500 mt-0.5">Scan Cafe Standee QR</p>
                  </button>

                  {/* Option 2: Cash at Counter */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("cash")}
                    className={`p-3.5 rounded-2xl border text-left transition-all duration-200 relative ${
                      paymentMethod === "cash"
                        ? "bg-[#FBF8F3] border-[#B8860B] ring-2 ring-[#B8860B]/20 shadow-sm"
                        : "bg-white border-[#E5DFD4] hover:border-stone-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                        paymentMethod === "cash" ? "bg-[#B8860B] text-white" : "bg-stone-100 text-stone-600"
                      }`}>
                        <Wallet className="w-4 h-4" />
                      </div>
                      <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        paymentMethod === "cash" ? "border-[#B8860B] bg-[#B8860B]" : "border-stone-300"
                      }`}>
                        {paymentMethod === "cash" && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-stone-900 leading-snug">Cash at Counter</p>
                    <p className="text-[10px] text-stone-500 mt-0.5">Pay cash to staff</p>
                  </button>
                </div>
              </div>

              {/* ─── How Counter Confirmation Works Card ─── */}
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-white border border-[#E5DFD4] rounded-2xl p-4 space-y-3 shadow-xs"
              >
                <div className="flex items-center gap-2.5 pb-2.5 border-b border-[#E5DFD4]">
                  <div className="w-8 h-8 rounded-xl bg-[#B8860B]/10 text-[#B8860B] flex items-center justify-center flex-shrink-0">
                    <Store className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-900">
                      {paymentMethod === "upi" ? "Scan QR & Pay at Cafe Counter" : "Pay Cash at Cafe Counter"}
                    </h4>
                    <p className="text-[10px] text-stone-500">Quick 3-step order confirmation</p>
                  </div>
                </div>

                {/* 3 Step Visual Flow */}
                <div className="space-y-2.5 text-xs">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#B8860B]/15 text-[#B8860B] font-bold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                    <div>
                      <p className="font-semibold text-stone-800">Place Order</p>
                      <p className="text-[11px] text-stone-500">Tap below to submit your order and get your Order #.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#B8860B]/15 text-[#B8860B] font-bold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                    <div>
                      <p className="font-semibold text-stone-800">
                        {paymentMethod === "upi" ? "Scan QR Standee at Counter" : "Pay Cash at Counter"}
                      </p>
                      <p className="text-[11px] text-stone-500">
                        {paymentMethod === "upi" 
                          ? `Visit the counter and scan the physical QR standee for ₹${total} using any UPI app.` 
                          : `Hand ₹${total} in cash to the cafe staff at the billing counter.`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#B8860B]/15 text-[#B8860B] font-bold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                    <div>
                      <p className="font-semibold text-stone-800">Owner Confirms & Prepares Food</p>
                      <p className="text-[11px] text-stone-500">The cafe owner confirms receipt on their portal and kitchen starts preparing your food!</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* ─── Collapsible Special Instructions ─── */}
              <div className="pt-1">
                {!showInstructions ? (
                  <button
                    type="button"
                    onClick={() => setShowInstructions(true)}
                    className="text-xs text-stone-500 hover:text-[#B8860B] transition-colors inline-flex items-center gap-1 font-medium"
                  >
                    <span>+ Add kitchen note (optional)</span>
                  </button>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-1"
                  >
                    <div className="flex items-center justify-between text-[11px] text-stone-500">
                      <span>Kitchen Note</span>
                      <button
                        type="button"
                        onClick={() => {
                          setSpecialInstructions("");
                          setShowInstructions(false);
                        }}
                        className="text-stone-400 hover:text-stone-700"
                      >
                        Cancel
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. Less spicy, no onions, extra ice..."
                      value={specialInstructions}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSpecialInstructions(val);
                        try {
                          const raw = window.sessionStorage.getItem(`sd:checkout:${menupages}`) || "{}";
                          const current = JSON.parse(raw);
                          current.specialInstructions = val;
                          current.notes = val;
                          window.sessionStorage.setItem(`sd:checkout:${menupages}`, JSON.stringify(current));
                          window.localStorage.setItem(`sd:checkout:${menupages}`, JSON.stringify(current));
                        } catch {}
                      }}
                      className="w-full px-3 py-2 bg-white border border-[#E5DFD4] rounded-xl text-xs text-stone-900 placeholder:text-stone-400 outline-none focus:border-[#B8860B]/60"
                      maxLength={160}
                    />
                  </motion.div>
                )}
              </div>
            </>
          )}

          {/* Error Message */}
          {error && (
            <p className="text-xs text-center text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2 font-medium">
              ⚠️ {error}
            </p>
          )}
        </main>

        {/* ─── Sticky Footer ─── */}
        <footer className="sticky bottom-0 menu-card/95 backdrop-blur-xl border-t menu-border p-4 space-y-2 shadow-2xl">
          {lines.length === 0 ? (
            <Link
              href={`/${menupages}/menu`}
              className="w-full py-3.5 rounded-xl menu-primary-btn hover:brightness-110 text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              Browse Menu
            </Link>
          ) : (
            <button
              onClick={handlePayment}
              disabled={processing || lines.length === 0}
              className="w-full py-3.5 rounded-xl menu-primary-btn hover:brightness-110 text-white font-bold text-sm shadow-lg transition-all active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {processing ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Confirming Order...
                </span>
              ) : (
                <span>Place Order & Pay at Counter · ₹{total}</span>
              )}
            </button>
          )}

          <p className="text-[10px] text-center menu-muted flex items-center justify-center gap-1 font-medium">
            <span>Pay at cafe counter via UPI QR or Cash to confirm your order.</span>
          </p>
        </footer>
      </div>
    </div>
  );
}