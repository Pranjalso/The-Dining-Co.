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
  Crown,
  Sparkles,
  UtensilsCrossed,
  Table,
  CreditCard,
  Wallet,
  Loader2
} from "lucide-react";
import useSWR from "swr";

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
      setLines(mapped);
    }
  }, [menuData, menupages]);

  const [tableNumber, setTableNumber] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "upi">("upi");
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
      const raw = window.sessionStorage.getItem(`sd:checkout:${menupages}`);
      if (raw) {
        const saved = JSON.parse(raw) as { tableNumber?: string; paymentMethod?: "cash" | "upi" };
        if (saved.tableNumber) setTableNumber(saved.tableNumber);
        else setTableNumber("");
        if (saved.paymentMethod) setPaymentMethod(saved.paymentMethod);
      } else {
        setTableNumber("");
      }
    } catch {}
  }, [menupages]);

  useEffect(() => {
    try {
      if (!menupages) return;
      const payload = { tableNumber, paymentMethod };
      window.sessionStorage.setItem(`sd:checkout:${menupages}`, JSON.stringify(payload));
    } catch {}
  }, [menupages, tableNumber, paymentMethod]);

  const uniqueItemsCount = useMemo(() => lines.length, [lines]);
  const totalQuantity = useMemo(() => lines.reduce((sum, l) => sum + l.qty, 0), [lines]);
  const subtotal = useMemo(() => lines.reduce((sum, l) => sum + l.price * l.qty, 0), [lines]);
  const tax = useMemo(() => (showTax === true) ? Math.round(subtotal * (taxRate / 100)) : 0, [subtotal, taxRate, showTax]);
  const total = useMemo(() => subtotal + tax, [subtotal, tax]);

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
        window.localStorage.removeItem(`sd:cart:${menupages}`);
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
      <div className="max-w-md mx-auto bg-card/60 backdrop-blur-sm min-h-screen shadow-2xl shadow-primary/5 border border-border/30 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-card/80 backdrop-blur-xl border-b border-border/30 px-4 py-3">
          <div className="flex items-center gap-4">
            <Link 
              href={`/${menupages}/menu`} 
              className="w-10 h-10 rounded-xl bg-surface/30 border border-border/30 flex items-center justify-center hover:border-primary/30 transition-all duration-300 group"
              aria-label="Back to menu"
            >
              <ArrowLeft className="w-5 h-5 text-muted/60 group-hover:text-primary transition-colors" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/20">
                <ShoppingCart className="w-3.5 h-3.5 text-primary" />
              </div>
              <h1 className="text-lg font-bold text-text tracking-tight">Checkout</h1>
            </div>
            <div className="ml-auto flex items-center gap-1.5">
              <span className="text-[10px] text-muted/50 uppercase tracking-wider">{uniqueItemsCount} items</span>
              <Sparkles className="w-3.5 h-3.5 text-primary/30" />
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
              <div className="w-24 h-24 bg-surface/20 rounded-2xl mx-auto mb-4 flex items-center justify-center border border-border/30">
                <ShoppingCart className="w-12 h-12 text-muted/30" />
              </div>
              <h2 className="text-lg font-bold text-text mb-2">Your cart is empty</h2>
              <p className="text-sm text-muted/50 mb-6">Add items from the menu to get started</p>
              <Link
                href={`/${menupages}/menu`}
                className="inline-block bg-gradient-to-r from-primary to-primary/85 hover:from-primary/90 hover:to-primary/90 text-background font-bold px-6 py-3 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300"
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
                className="bg-primary/5 border border-primary/20 rounded-xl p-3"
              >
                <p className="text-sm text-muted/60">
                  <span className="font-semibold text-primary">{uniqueItemsCount}</span> different items ·{" "}
                  <span className="font-semibold text-primary">{totalQuantity}</span> total quantity
                </p>
              </motion.div>

              {/* Order Summary */}
              <div className="bg-surface/20 border border-border/20 rounded-xl p-4 shadow-lg shadow-primary/5">
                <h2 className="font-semibold text-text mb-3 tracking-tight">Order Summary</h2>
                <div className="space-y-2.5">
                  {lines.map((item, index) => (
                    <motion.div 
                      key={item.id} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="flex items-center gap-3 bg-surface/30 border border-border/20 rounded-xl p-2 hover:border-primary/30 transition-all duration-300"
                    >
                      <div className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 border border-border/20">
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
                          <h3 className="font-semibold text-sm text-text truncate">{item.name}</h3>
                          <p className="text-xs text-muted/50 font-medium">₹{item.price} × {item.qty}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                          <p className="font-bold text-xs text-primary">₹{item.price * item.qty}</p>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="w-7 h-7 rounded-lg bg-surface/50 border border-border/20 flex items-center justify-center hover:border-primary/30 hover:bg-primary/5 transition-all duration-300"
                            >
                              <Minus className="w-3 h-3 text-muted/60" />
                            </button>
                            <span className="text-sm font-medium w-5 text-center text-text">{item.qty}</span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center hover:bg-primary hover:text-background transition-all duration-300"
                            >
                              <Plus className="w-3 h-3 text-primary" />
                            </button>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="ml-0.5 w-7 h-7 rounded-lg text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all duration-300 flex items-center justify-center"
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

              {/* Price Details */}
              <div className="bg-surface/20 border border-border/20 rounded-xl p-4 shadow-lg shadow-primary/5">
                <h2 className="font-semibold text-text mb-3 tracking-tight">Price Details</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted/60">
                      Subtotal ({uniqueItemsCount} {uniqueItemsCount === 1 ? 'item' : 'items'} · {totalQuantity} {totalQuantity === 1 ? 'quantity' : 'quantities'})
                    </span>
                    <span className="font-medium text-text">₹{subtotal}</span>
                  </div>
                  {showTax === true && (
                    <div className="flex justify-between">
                      <span className="text-muted/60">Tax ({taxRate}%)</span>
                      <span className="font-medium text-text">₹{tax}</span>
                    </div>
                  )}
                  <div className="border-t border-border/30 pt-2 mt-2">
                    <div className="flex justify-between font-bold">
                      <span className="text-text">Total</span>
                      <span className="text-primary">₹{total}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Table Number */}
              <div className="bg-surface/20 border border-border/20 rounded-xl p-4 shadow-lg shadow-primary/5" id="table-number-section">
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
                    className={`w-full px-4 py-3 bg-surface/30 border rounded-xl text-text placeholder-muted/40 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300 hover:border-primary/50 ${
                      error ? "border-rose-500/50" : "border-border/40"
                    }`}
                    required
                  />
                  {error && (
                    <p className="text-xs text-rose-400">⚠️ {error}</p>
                  )}
                  <p className="text-xs text-muted/40">e.g. 01, 02, 03...</p>
                </div>
              </div>

              {error && (
                <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-2.5">
                  {error}
                </div>
              )}
            </>
          ) : successOrder ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6 text-center space-y-4"
            >
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-text">Order Placed!</h2>
              <p className="text-sm text-muted/60">
                Your order number is <span className="font-bold text-primary">#{successOrder.orderNumber}</span>.
              </p>
              <p className="text-sm text-muted/60">
                Amount payable: <span className="font-bold text-primary">₹{successOrder.total}</span>
              </p>
              <p className="text-xs text-muted/40">
                Please keep this screen open or share the order number with the staff.
              </p>
            </motion.div>
          ) : null}
        </div>

        {/* Bottom Bar */}
        <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-card/95 backdrop-blur-xl border-t border-border/30 shadow-2xl shadow-primary/5 z-50 p-4">
          {!successOrder ? (
            <button
              onClick={() => {
                if (!tableNumber.trim()) {
                  setError("Please enter your table number to proceed");
                  const el = document.getElementById("table-number");
                  if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                  return;
                }
                router.push(`/${menupages}/menu/checkout/payment`);
              }}
              disabled={lines.length === 0 || submitting || !tableNumber.trim() || isLoading}
              className={`block w-full py-3.5 rounded-xl font-bold transition-all duration-300 shadow-lg text-center ${
                !tableNumber.trim() || lines.length === 0 || isLoading
                  ? "bg-surface/50 text-muted/40 cursor-not-allowed border border-border/30" 
                  : "bg-gradient-to-r from-primary to-primary/85 hover:from-primary/90 hover:to-primary/90 text-background shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.01] active:scale-[0.98]"
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
              className="block w-full text-center bg-gradient-to-r from-primary to-primary/85 hover:from-primary/90 hover:to-primary/90 text-background py-3.5 rounded-xl font-bold transition-all duration-300 shadow-lg shadow-primary/20 hover:shadow-primary/30"
            >
              Back to Menu
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}