"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Smartphone, 
  Wallet, 
  Crown, 
  Sparkles, 
  Shield, 
  CheckCircle,
  CreditCard,
  Lock
  ,Loader2
} from "lucide-react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type PaymentMethod = "upi" | "cash";

// For Next.js 15, we need to handle params as a Promise
type PageProps = {
  params: { menupages: string }
}

export default function CheckoutPaymentPage({ params }: PageProps) {
  const { menupages } = params;
  return <PaymentPageContent menupages={menupages} />;
}

function PaymentPageContent({ menupages }: { menupages: string }) {
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("upi");
  const [upiId, setUpiId] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tableNumber, setTableNumber] = useState("");
  const [lines, setLines] = useState<Array<{ id: string; name: string; price: number; qty: number; image?: string; description?: string }>>([]);
  const [orderNumber, setOrderNumber] = useState<number | null>(null);
  const [taxRate, setTaxRate] = useState(0);
  const [showTax, setShowTax] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Prefetch confirmation page
  useEffect(() => {
    if (orderNumber) {
      router.prefetch(`/${menupages}/menu/order-confirmation?orderNumber=${orderNumber}`);
    }
  }, [orderNumber, menupages, router]);

  // --- PERFORMANCE OPTIMIZATION: USE SWR FOR CAFE DETAILS ---
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

  // --- PERFORMANCE OPTIMIZATION: LOAD CACHED CAFE SETTINGS ---
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

  // Restore checkout form state and cart lines
  useEffect(() => {
    try {
      const rawForm = window.sessionStorage.getItem(`sd:checkout:${menupages}`);
      if (rawForm) {
        const saved = JSON.parse(rawForm) as { tableNumber?: string; paymentMethod?: PaymentMethod };
        if (saved.tableNumber) setTableNumber(saved.tableNumber);
        if (saved.paymentMethod) setPaymentMethod(saved.paymentMethod);
      }
    } catch {}
  }, [menupages]);

  // Persist UPI ID changes
  useEffect(() => {
    try {
      const rawForm = window.sessionStorage.getItem(`sd:checkout:${menupages}`);
      const saved = rawForm ? JSON.parse(rawForm) : {};
      window.sessionStorage.setItem(`sd:checkout:${menupages}`, JSON.stringify({ ...saved, upiId, tableNumber, paymentMethod }));
    } catch {}
  }, [menupages, upiId, tableNumber, paymentMethod]);

  // Listen to cart changes while on payment page
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== `sd:cart:${menupages}`) return;
      try {
        const rawCart = window.localStorage.getItem(`sd:cart:${menupages}`);
        const rawItems = window.sessionStorage.getItem(`sd:items:${menupages}`);
        if (!rawCart || !rawItems) return;
        const quantities = JSON.parse(rawCart) as Record<string, number>;
        const items = JSON.parse(rawItems) as Array<{ id: string; name: string; price: number; image?: string; description?: string }>;
        const entries = Object.entries(quantities).filter(([_, qty]) => qty > 0);
        const mapped: Array<{ id: string; name: string; price: number; qty: number; image?: string; description?: string }> = entries
          .map(([id, qty]) => {
            const item = items.find(i => String(i.id) === String(id));
            return item ? { id: String(item.id), name: item.name, price: item.price, qty, image: item.image, description: item.description } : null;
          })
          .filter(Boolean) as any;
        setLines(mapped);
      } catch {}
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [menupages]);

  useEffect(() => {
    try {
      const rawCart = window.localStorage.getItem(`sd:cart:${menupages}`);
      const rawItems = window.sessionStorage.getItem(`sd:items:${menupages}`);
      const rawLines = window.sessionStorage.getItem(`sd:checkoutLines:${menupages}`);
      if (!rawCart) {
        setLines([]);
        return;
      }
      const quantities = JSON.parse(rawCart) as Record<string, number>;
      const entries = Object.entries(quantities).filter(([_, qty]) => qty > 0);

      const mapped: Array<{ id: string; name: string; price: number; qty: number; image?: string; description?: string }> = [];
      const items = rawItems ? JSON.parse(rawItems) as Array<{ id: string; name: string; price: number; image?: string; description?: string }> : [];
      entries.forEach(([id, qty]) => {
        const item = items.find(i => String(i.id) === String(id));
        if (item) {
          mapped.push({ id: String(item.id), name: item.name, price: item.price, qty, image: item.image, description: item.description });
        }
      });

      if (rawLines) {
        const persisted = JSON.parse(rawLines) as Array<{ id: string; name: string; price: number; qty: number; image?: string; description?: string }>;
        persisted.forEach((l) => {
          if (!mapped.find(m => m.id === l.id)) {
            const q = quantities[l.id] ?? l.qty;
            if (q > 0) mapped.push({ ...l, qty: q });
          }
        });
      }

      const missingIds = entries.map(([id]) => id).filter(id => !mapped.find(m => String(m.id) === String(id)));
      if (missingIds.length > 0) {
        (async () => {
          try {
            const res = await fetch(`/api/menu/${menupages}?ids=${encodeURIComponent(missingIds.join(','))}`, { cache: 'no-store' });
            const json = await res.json();
            if (json?.success && Array.isArray(json.data)) {
              json.data.forEach((it: any) => {
                const id = String(it._id);
                const qty = Number(quantities[id] || quantities[String(it._id)]);
                if (!mapped.find(m => String(m.id) === id) && qty > 0) {
                  mapped.push({
                    id,
                    name: it.name,
                    price: it.price,
                    qty,
                    image: it.imageUrl,
                    description: it.description,
                  });
                }
              });
            }
          } catch {}
          setLines(mapped);
        })();
      } else {
        setLines(mapped);
      }
    } catch {
      setLines([]);
    }
  }, [menupages]);

  // Derived totals
  const subtotal = useMemo(() => lines.reduce((sum, l) => sum + l.price * l.qty, 0), [lines]);
  const tax = useMemo(() => (showTax === true) ? Math.round(subtotal * (taxRate / 100)) : 0, [subtotal, taxRate, showTax]);
  const total = useMemo(() => subtotal + tax, [subtotal, tax]);

  const handlePayment = async () => {
    if (!tableNumber.trim()) {
      setError("Please enter your table number");
      return;
    }
    if (paymentMethod === 'upi' && !upiId.trim()) {
      setError("Please enter UPI ID");
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
        tableNumber,
        paymentMethod,
        paymentStatus: "pending" as const,
        upiId: paymentMethod === 'upi' ? upiId : undefined,
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
      setOrderNumber(order.orderNumber);
      try {
        window.localStorage.removeItem(`sd:cart:${menupages}`);
      } catch {}
      
      router.push(`/${menupages}/menu/order-confirmation?orderNumber=${order.orderNumber}`);
    } catch (e: any) {
      setError(e?.message || "Failed to process payment");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto bg-card/60 backdrop-blur-sm min-h-screen shadow-2xl shadow-primary/5 border border-border/30">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-card/80 backdrop-blur-xl border-b border-border/30 px-4 py-3">
          <div className="flex items-center gap-4">
            <Link 
              href={`/${menupages}/menu/checkout`} 
              className="w-10 h-10 rounded-xl bg-surface/30 border border-border/30 flex items-center justify-center hover:border-primary/30 transition-all duration-300 group"
            >
              <ArrowLeft className="w-5 h-5 text-muted/60 group-hover:text-primary transition-colors" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/20">
                <CreditCard className="w-3.5 h-3.5 text-primary" />
              </div>
              <h1 className="text-lg font-bold text-text tracking-tight">Payment</h1>
            </div>
            <div className="ml-auto">
              <Sparkles className="w-4 h-4 text-primary/30" />
            </div>
          </div>
        </header>

        <div className="p-4 space-y-4">
          {/* Order Total */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 rounded-2xl p-5"
          >
            <p className="text-sm text-muted/60 mb-1">Total Amount</p>
            <p className="text-3xl font-bold text-primary">₹{total}</p>
            {showTax === true && tax > 0 && (
              <p className="text-xs text-muted/40 mt-1">Incl. ₹{tax} tax ({taxRate}%)</p>
            )}
          </motion.div>

          {/* Table Number */}
          <div className="bg-surface/20 border border-border/20 rounded-xl p-4 shadow-lg shadow-primary/5">
            <h2 className="font-semibold text-text mb-3 flex items-center gap-2 tracking-tight">
              <span className="w-1 h-4 bg-primary rounded-full"></span>
              Table Number
            </h2>
            <input
              type="text"
              placeholder="Enter your table no."
              value={tableNumber}
              onChange={(e) => {
                setTableNumber(e.target.value);
                if (error) setError(null);
                try {
                  const rawForm = window.sessionStorage.getItem(`sd:checkout:${menupages}`);
                  const saved = rawForm ? JSON.parse(rawForm) : {};
                  window.sessionStorage.setItem(`sd:checkout:${menupages}`, JSON.stringify({ ...saved, tableNumber: e.target.value, paymentMethod }));
                } catch {}
              }}
              className={`w-full px-4 py-3 bg-surface/30 border rounded-xl text-text placeholder-muted/40 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300 hover:border-primary/50 ${
                error ? "border-rose-500/50" : "border-border/40"
              }`}
              required
            />
          </div>

          {/* Payment Methods */}
          <div className="bg-surface/20 border border-border/20 rounded-xl p-4 shadow-lg shadow-primary/5">
            <h2 className="font-semibold text-text mb-3 flex items-center gap-2 tracking-tight">
              <span className="w-1 h-4 bg-primary rounded-full"></span>
              Payment Method
            </h2>
            <div className="space-y-3">
              {/* UPI Option */}
              <label className={`block border rounded-xl p-4 cursor-pointer transition-all duration-300 ${
                paymentMethod === 'upi' ? 'border-primary bg-primary/5 shadow-lg shadow-primary/5' : 'border-border/30 bg-surface/20 hover:border-primary/30'
              }`}>
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    value="upi"
                    checked={paymentMethod === 'upi'}
                    onChange={(e) => {
                      const val = e.target.value as PaymentMethod;
                      setPaymentMethod(val);
                      try {
                        const rawForm = window.sessionStorage.getItem(`sd:checkout:${menupages}`);
                        const saved = rawForm ? JSON.parse(rawForm) : {};
                        window.sessionStorage.setItem(`sd:checkout:${menupages}`, JSON.stringify({ ...saved, paymentMethod: val, tableNumber }));
                      } catch {}
                    }}
                    className="w-4 h-4 text-primary accent-primary"
                  />
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                    <Smartphone className="w-4 h-4 text-primary" />
                  </div>
                  <span className="font-medium text-text">UPI</span>
                </div>
              </label>

              {/* Cash Only Option */}
              <label className={`block border rounded-xl p-4 cursor-pointer transition-all duration-300 ${
                paymentMethod === 'cash' ? 'border-primary bg-primary/5 shadow-lg shadow-primary/5' : 'border-border/30 bg-surface/20 hover:border-primary/30'
              }`}>
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    value="cash"
                    checked={paymentMethod === 'cash'}
                    onChange={(e) => {
                      const val = e.target.value as PaymentMethod;
                      setPaymentMethod(val);
                      try {
                        const rawForm = window.sessionStorage.getItem(`sd:checkout:${menupages}`);
                        const saved = rawForm ? JSON.parse(rawForm) : {};
                        window.sessionStorage.setItem(`sd:checkout:${menupages}`, JSON.stringify({ ...saved, paymentMethod: val, tableNumber }));
                      } catch {}
                    }}
                    className="w-4 h-4 text-primary accent-primary"
                  />
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                    <Wallet className="w-4 h-4 text-primary" />
                  </div>
                  <span className="font-medium text-text">Cash Only</span>
                </div>
              </label>
            </div>
          </div>

          {/* UPI Details - Show only if UPI selected */}
          {paymentMethod === 'upi' && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-surface/20 border border-border/20 rounded-xl p-4 shadow-lg shadow-primary/5 overflow-hidden"
            >
              <h2 className="font-semibold text-text mb-3 flex items-center gap-2 tracking-tight">
                <span className="w-1 h-4 bg-primary rounded-full"></span>
                UPI Details
              </h2>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Enter UPI ID (e.g., name@okhdfcbank)"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full px-4 py-3 bg-surface/30 border border-border/40 rounded-xl text-text placeholder-muted/40 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300 hover:border-primary/50"
                />
                <div className="grid grid-cols-3 gap-2">
                  {['gpay@okhdfcbank', 'phonepe@ybl', 'paytm@okhdfcbank'].map((id) => (
                    <button
                      key={id}
                      onClick={() => setUpiId(id)}
                      className="px-2 py-1.5 text-xs bg-surface/30 border border-border/30 rounded-lg text-muted/60 hover:text-text hover:border-primary/30 transition-all duration-300"
                    >
                      {id.split('@')[0]}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Cash Only Info */}
          {paymentMethod === 'cash' && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 overflow-hidden"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 flex-shrink-0">
                  <Wallet className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-amber-400 mb-1">Cash Payment</h3>
                  <p className="text-xs text-amber-400/70">
                    Please pay ₹{total} in cash at the counter. Your order will be prepared after payment confirmation.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Payment Button */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onClick={handlePayment}
            disabled={processing || (paymentMethod === 'upi' && !upiId)}
            className={`w-full py-4 rounded-xl font-bold transition-all duration-300 shadow-lg text-center ${
              processing || (paymentMethod === 'upi' && !upiId)
                ? 'bg-surface/50 text-muted/40 cursor-not-allowed border border-border/30' 
                : 'bg-gradient-to-r from-primary to-primary/85 hover:from-primary/90 hover:to-primary/90 text-background shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.01] active:scale-[0.98]'
            }`}
          >
            {processing ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </span>
            ) : (
              `Place Order · ₹${total}`
            )}
          </motion.button>

          {error && (
            <p className="text-xs text-center text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-2.5">
              {error}
            </p>
          )}

          {/* Security Note */}
          <div className="flex items-center justify-center gap-2 text-xs text-muted/40">
            <Lock className="w-3.5 h-3.5" />
            <span>Your information is secure</span>
          </div>
        </div>
      </div>
    </div>
  );
}