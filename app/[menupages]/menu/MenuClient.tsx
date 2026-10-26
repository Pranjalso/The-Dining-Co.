"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Scan, 
  QrCode, 
  UtensilsCrossed,
  Loader2,
  XCircle,
  X,
  CheckCircle2,
  Armchair,
  TicketPercent,
} from "lucide-react";
import useSWR from "swr";
import { getPusherClient } from "@/lib/pusher-client";
import OfferPopupModal, { OfferItem } from "@/components/OfferPopupModal";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Pleasant 2-tone harmonic confirmation chime
function playPaymentSuccessChime() {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0.18, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.12);
    gain2.gain.setValueAtTime(0.22, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.65);
  } catch {}
}

type MenuItem = {
  id: string | number;
  name: string;
  price: number;
  category: string;
  image: string;
  description?: string;
};

type MenuClientProps = {
  menupages: string;
  cafeName?: string;
  initialItems: MenuItem[];
  initialCategories: Array<{ name: string; image: string }>;
  initialOffers?: OfferItem[];
  initialTable?: string;
};

export default function MenuClient({ 
  menupages, 
  cafeName, 
  initialItems, 
  initialCategories,
  initialOffers = [],
  initialTable = "",
}: MenuClientProps) {
  const router = useRouter();
  const [quantities, setQuantities] = useState<Record<string | number, number>>({});
  const [activeCategory, setActiveCategory] = useState<string>(initialCategories[0]?.name || "");
  const [uniqueItemsCount, setUniqueItemsCount] = useState(0);
  const [items, setItems] = useState<MenuItem[]>(initialItems);
  const [categories] = useState<Array<{ name: string; image: string }>>(initialCategories);
  const [tableNumber, setTableNumber] = useState<string>(initialTable || "");
  const [showWelcomeIntro, setShowWelcomeIntro] = useState<boolean>(true);
  const [countdownSeconds, setCountdownSeconds] = useState<number>(2);
  const [introProgress, setIntroProgress] = useState<number>(0);
  const [rejectedAlert, setRejectedAlert] = useState<{
    orderNumber: string | number;
    tableNumber: string;
    message?: string;
  } | null>(null);
  const [paymentAlert, setPaymentAlert] = useState<{
    orderNumber?: string | number;
    tableNumber?: string;
    total?: number;
    message?: string;
  } | null>(null);

  // Fetch public cafe info for live cafe name fallback
  const { data: cafePublicData } = useSWR(
    menupages ? `/api/cafes/${menupages}/public` : null,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  );

  const effectiveCafeName = cafeName || cafePublicData?.data?.cafeName || menupages;

  // 2-Second timer for Namaste Welcome Intro
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if user came from a fresh scan or already saw the intro in this tab
    const urlParams = new URLSearchParams(window.location.search);
    const isExplicitScan = urlParams.has('table') || urlParams.has('scan');
    const alreadyWelcomed = window.sessionStorage.getItem(`sd:welcomed:${menupages}`);

    // If already welcomed in this tab and not a fresh QR scan with table, dock directly to poster
    if (alreadyWelcomed && !isExplicitScan) {
      setShowWelcomeIntro(false);
      return;
    }

    const duration = 2000;
    const intervalStep = 25;
    let elapsed = 0;

    const timer = setInterval(() => {
      elapsed += intervalStep;
      const remaining = Math.max(0, Math.ceil((duration - elapsed) / 1000));
      setCountdownSeconds(remaining);
      const pct = Math.min(100, (elapsed / duration) * 100);
      setIntroProgress(pct);

      if (elapsed >= duration) {
        clearInterval(timer);
        setShowWelcomeIntro(false);
        try {
          window.sessionStorage.setItem(`sd:welcomed:${menupages}`, 'true');
        } catch {}
      }
    }, intervalStep);

    return () => clearInterval(timer);
  }, [menupages]);

  const handleDismissIntro = () => {
    setShowWelcomeIntro(false);
    if (typeof window !== 'undefined') {
      try {
        window.sessionStorage.setItem(`sd:welcomed:${menupages}`, 'true');
      } catch {}
    }
  };

  // Fetch active promotional offers for this cafe (with instant server-side fallbackData)
  const { data: offersData } = useSWR(
    menupages ? `/api/offers/${menupages}?activeOnly=true` : null,
    fetcher,
    { 
      fallbackData: { success: true, count: initialOffers.length, data: initialOffers },
      revalidateOnFocus: true,
      dedupingInterval: 10000 
    }
  );
  const activeOffers: OfferItem[] = useMemo(() => {
    if (offersData?.data && Array.isArray(offersData.data) && offersData.data.length > 0) {
      return offersData.data;
    }
    return initialOffers;
  }, [offersData, initialOffers]);

  const [showOfferPopup, setShowOfferPopup] = useState<boolean>(false);
  const hasAutoOpenedOffersRef = useRef<boolean>(false);

  // Clear any legacy blocking flags on mount so testing & fresh scans always work
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.sessionStorage.removeItem(`sd:offers_dismissed:${menupages}`);
    } catch {}
  }, [menupages]);

  // Trigger Offer Popup Form after Namaste screen exits (runs once per visit)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (showWelcomeIntro) return; // Wait until Namaste welcome screen has fully exited
    if (hasAutoOpenedOffersRef.current) return;

    if (activeOffers.length > 0) {
      hasAutoOpenedOffersRef.current = true;
      const timer = setTimeout(() => {
        setShowOfferPopup(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [showWelcomeIntro, activeOffers]);

  const handleCloseOfferPopup = () => {
    setShowOfferPopup(false);
  };

  const handleApplyOffer = (offer: OfferItem) => {
    if (typeof window !== "undefined" && menupages && offer.code) {
      try {
        const payload = {
          code: offer.code,
          discountType: offer.discountType,
          discountValue: offer.discountValue,
          minOrderAmount: offer.minOrderAmount || 0,
        };
        window.sessionStorage.setItem(`sd:appliedOffer:${menupages}`, JSON.stringify(payload));
        window.localStorage.setItem(`sd:appliedOffer:${menupages}`, JSON.stringify(payload));
      } catch {}
    }
    setShowOfferPopup(false);
  };

  // Check if latest order was rejected
  useEffect(() => {
    if (typeof window === 'undefined' || !menupages) return;
    try {
      const rawLatest = window.localStorage.getItem(`sd:latestOrder:${menupages}`);
      if (rawLatest) {
        const parsed = JSON.parse(rawLatest);
        const dismissed = window.sessionStorage.getItem(`sd:dismissedRejection:${parsed.orderNumber}`);
        if (!dismissed && parsed.status === 'cancelled') {
          setRejectedAlert({
            orderNumber: parsed.orderNumber,
            tableNumber: parsed.tableNumber || '',
            message: parsed.message || `Your order #${parsed.orderNumber} for Table ${parsed.tableNumber || ''} is rejected`,
          });
        }
        const ackPayment = window.sessionStorage.getItem(`sd:ackPayment:${parsed.orderNumber}`);
        if (!ackPayment && parsed.paymentStatus === 'completed') {
          setPaymentAlert({
            orderNumber: parsed.orderNumber,
            tableNumber: parsed.tableNumber || '',
            total: parsed.total,
            message: `Payment received for Table ${parsed.tableNumber || ''}! Thank you for dining with us.`,
          });
        }
      }
    } catch {}
  }, [menupages]);

  // Auto-capture table number from QR code query parameter (e.g. ?table=4)
  useEffect(() => {
    if (typeof window === 'undefined' || !menupages) return;
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const tableParam = urlParams.get('table');
      if (tableParam && tableParam.trim()) {
        const cleanTable = tableParam.trim();
        setTableNumber(cleanTable);
        const raw = window.sessionStorage.getItem(`sd:checkout:${menupages}`);
        const saved = raw ? JSON.parse(raw) : {};
        window.sessionStorage.setItem(
          `sd:checkout:${menupages}`,
          JSON.stringify({ ...saved, tableNumber: cleanTable })
        );
      } else {
        const raw = window.sessionStorage.getItem(`sd:checkout:${menupages}`);
        if (raw) {
          const saved = JSON.parse(raw);
          if (saved?.tableNumber) setTableNumber(String(saved.tableNumber));
        }
      }
    } catch {}
  }, [menupages]);

  // Real-time table notification via Pusher
  useEffect(() => {
    if (typeof window === 'undefined' || !menupages) return;
    const pusher = getPusherClient();
    if (!pusher) return;

    let tableNumber = '';
    let orderNumber = '';
    try {
      const rawLatest = window.localStorage.getItem(`sd:latestOrder:${menupages}`);
      if (rawLatest) {
        const parsed = JSON.parse(rawLatest);
        orderNumber = parsed.orderNumber ? String(parsed.orderNumber) : '';
        tableNumber = parsed.tableNumber ? String(parsed.tableNumber) : '';
      }
      const rawCheckout = window.sessionStorage.getItem(`sd:checkout:${menupages}`);
      if (rawCheckout && !tableNumber) {
        const parsed = JSON.parse(rawCheckout);
        if (parsed.tableNumber) tableNumber = String(parsed.tableNumber);
      }
    } catch {}

    const channels: any[] = [];

    const handleStatusUpdate = (data: any) => {
      // 1. Order cancellation / rejection
      if (data.isRejected || data.orderStatus === 'cancelled') {
        const matchesTable = tableNumber && String(data.tableNumber).trim() === String(tableNumber).trim();
        const matchesOrder = orderNumber && String(data.orderNumber) === String(orderNumber);

        if (matchesTable || matchesOrder || (!tableNumber && !orderNumber)) {
          setRejectedAlert({
            orderNumber: data.orderNumber,
            tableNumber: data.tableNumber || tableNumber,
            message: data.message || `Your order #${data.orderNumber} for Table ${data.tableNumber || tableNumber} is rejected`,
          });

          try {
            const raw = window.localStorage.getItem(`sd:latestOrder:${menupages}`);
            if (raw) {
              const parsed = JSON.parse(raw);
              window.localStorage.setItem(`sd:latestOrder:${menupages}`, JSON.stringify({
                ...parsed,
                status: 'cancelled',
              }));
            }
          } catch {}
        }
      }

      // 2. Real-time Payment Received confirmation
      if (data.isPaymentCompleted || data.isPaymentReceived || data.paymentStatus === 'completed') {
        const matchesTable = tableNumber && String(data.tableNumber).trim() === String(tableNumber).trim();
        const matchesOrder = orderNumber && String(data.orderNumber) === String(orderNumber);

        if (matchesTable || matchesOrder || (!tableNumber && !orderNumber)) {
          setPaymentAlert({
            orderNumber: data.orderNumber,
            tableNumber: data.tableNumber || tableNumber,
            total: data.total,
            message: data.message || `Payment of ₹${data.total || ''} received for Table ${data.tableNumber || tableNumber}! Thank you.`,
          });
          playPaymentSuccessChime();

          try {
            const raw = window.localStorage.getItem(`sd:latestOrder:${menupages}`);
            if (raw) {
              const parsed = JSON.parse(raw);
              window.localStorage.setItem(`sd:latestOrder:${menupages}`, JSON.stringify({
                ...parsed,
                paymentStatus: 'completed',
              }));
            }
          } catch {}
        }
      }
    };

    if (tableNumber) {
      const clean = tableNumber.trim();
      const tableChan = pusher.subscribe(`cafe-${menupages}-table-${clean}`);
      tableChan.bind('order-status-updated', handleStatusUpdate);
      tableChan.bind('payment-received', handleStatusUpdate);
      channels.push(tableChan);
    }

    if (orderNumber) {
      const orderChan = pusher.subscribe(`order-${orderNumber}`);
      orderChan.bind('order-status-updated', handleStatusUpdate);
      orderChan.bind('payment-received', handleStatusUpdate);
      channels.push(orderChan);
    }

    const cafeChan = pusher.subscribe(`cafe-${menupages}`);
    cafeChan.bind('order-status-updated', handleStatusUpdate);
    cafeChan.bind('payment-received', handleStatusUpdate);
    channels.push(cafeChan);

    return () => {
      channels.forEach(ch => {
        try {
          ch.unbind('order-status-updated', handleStatusUpdate);
          ch.unbind('payment-received', handleStatusUpdate);
        } catch {}
      });
    };
  }, [menupages]);
  
  // Use SWR for fetching category items
  const { data: categoryData, isLoading: loadingCategory } = useSWR(
    activeCategory ? `/api/menu/${menupages}?category=${encodeURIComponent(activeCategory)}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  // Update items when SWR data changes
  useEffect(() => {
    if (categoryData?.success && Array.isArray(categoryData.data)) {
      const mapped = categoryData.data.map((item: any) => ({
        id: item._id,
        name: item.name,
        price: item.price,
        category: item.category,
        image: item.imageUrl,
        description: item.description,
      })) as MenuItem[];
      setItems(mapped);
    }
  }, [categoryData]);

  const [catalog, setCatalog] = useState<Array<{ id: string | number; name: string; price: number; image: string; description?: string }>>([]);
  const [fallbackLines, setFallbackLines] = useState<Array<{ id: string | number; name: string; price: number; image: string; description?: string }>>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const fallbackCatImg = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop";

  // Load saved active category
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = window.sessionStorage.getItem(`sd:activeCat:${menupages}`);
        if (saved) setActiveCategory(saved);
      }
    } catch {}
  }, [menupages]);

  // Save active category
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && activeCategory) {
        window.sessionStorage.setItem(`sd:activeCat:${menupages}`, activeCategory);
      }
    } catch {}
  }, [menupages, activeCategory]);

  // Load catalog from sessionStorage
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const raw = window.sessionStorage.getItem(`sd:items:${menupages}`);
        const existing = raw ? JSON.parse(raw) as Array<{ id: string | number; name: string; price: number; image: string; description?: string }> : [];
        setCatalog(existing);
        
        const rawChk = window.sessionStorage.getItem(`sd:checkoutLines:${menupages}`);
        const chk = rawChk ? JSON.parse(rawChk) as Array<{ id: string | number; name: string; price: number; image: string; description?: string }> : [];
        setFallbackLines(chk);
      }
    } catch {}
  }, [menupages]);

  // Load cart quantities from localStorage
  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem(`sd:cart:${menupages}`) : null;
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, number>;
        setQuantities(parsed);
      }
      setIsInitialized(true);
    } catch (error) {
      console.error('Error loading cart:', error);
      setIsInitialized(true);
    }
  }, [menupages]);

  // Save cart quantities to localStorage whenever they change
  useEffect(() => {
    if (!isInitialized) return;
    
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(`sd:cart:${menupages}`, JSON.stringify(quantities));
      }
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  }, [menupages, quantities, isInitialized]);

  // Calculate unique items count
  useEffect(() => {
    const count = Object.values(quantities).filter(qty => qty > 0).length;
    setUniqueItemsCount(count);
  }, [quantities]);

  // Prefetch critical pages
  useEffect(() => {
    if (uniqueItemsCount > 0) {
      router.prefetch(`/${menupages}/menu/checkout`);
    }
  }, [uniqueItemsCount, menupages, router]);

  const updateQuantity = (item: MenuItem, change: number) => {
    const id = item.id;
    setQuantities(prev => {
      const current = prev[id] || 0;
      const newQty = current + change;
      let next: Record<string | number, number>;
      
      if (newQty <= 0) {
        const { [id]: _, ...rest } = prev;
        next = rest;
      } else {
        next = { ...prev, [id]: newQty };
      }
      
      // Update catalog when adding items
      if (newQty > 0) {
        try {
          const raw = window.sessionStorage.getItem(`sd:items:${menupages}`);
          const list: Array<{ id: string | number; name: string; price: number; image: string; description?: string }> = raw ? JSON.parse(raw) : [];
          const idStr = String(id);
          const idx = list.findIndex((it) => String(it.id) === idStr);
          
          const payload = { id, name: item.name, price: item.price, image: item.image, description: item.description || '' };
          if (idx === -1) {
            list.push(payload);
          } else {
            list[idx] = payload;
          }
          
          window.sessionStorage.setItem(`sd:items:${menupages}`, JSON.stringify(list));
          setCatalog(list);
        } catch {}
      }
      
      return next;
    });
  };

  const getQuantity = (id: string | number) => quantities[id] || 0;

  // Calculate cart items from ALL categories
  const cartItems = useMemo(() => {
    const itemsWithQty = Object.entries(quantities)
      .map(([id, qty]) => {
        const inView = items.find(i => String(i.id) === String(id));
        if (inView) return { ...inView, qty };
        
        const fromCatalog = catalog.find(c => String(c.id) === String(id));
        if (fromCatalog) {
          return {
            id: fromCatalog.id,
            name: fromCatalog.name,
            price: fromCatalog.price,
            category: '',
            image: fromCatalog.image,
            description: fromCatalog.description,
            qty
          } as MenuItem & { qty: number };
        }
        
        const fromFallback = fallbackLines.find(c => String(c.id) === String(id));
        if (fromFallback) {
          return {
            id: fromFallback.id,
            name: fromFallback.name,
            price: fromFallback.price,
            category: '',
            image: fromFallback.image,
            description: fromFallback.description,
            qty
          } as MenuItem & { qty: number };
        }
        
        return null;
      })
      .filter(Boolean) as Array<MenuItem & { qty: number }>;
      
    return itemsWithQty;
  }, [quantities, items, catalog, fallbackLines]);

  // Total price from ALL items in cart
  const totalPrice = useMemo(() => 
    cartItems.reduce((sum, item) => sum + (item.price || 0) * (item.qty || 0), 0),
    [cartItems]
  );

  // Sync checkout lines to storage whenever cartItems change
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && cartItems.length > 0) {
        const payload = cartItems.map(item => ({
          id: String(item.id),
          name: item.name,
          price: item.price,
          qty: item.qty,
          image: item.image,
          description: item.description,
        }));
        window.sessionStorage.setItem(`sd:checkoutLines:${menupages}`, JSON.stringify(payload));
        window.localStorage.setItem(`sd:checkoutLines:${menupages}`, JSON.stringify(payload));
      }
    } catch {}
  }, [cartItems, menupages]);

  return (
    <div className="min-h-screen bg-background">
      {/* Elegant Namaste Welcome Screen (Shown on QR Scan, slides upside smoothly after 5s) */}
      <AnimatePresence>
        {showWelcomeIntro && (
          <motion.div
            key="namaste-welcome-screen"
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ 
              y: "-100%", 
            }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#FBF8F3]/98 backdrop-blur-2xl px-6 text-center select-none cursor-pointer"
            onClick={handleDismissIntro}
          >
            {/* Ambient Honey Gold Radial Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

            {/* Pure Transparent Joined Palms (Namaste) - Zero background */}
            <div className="relative mb-4 flex items-center justify-center">
              <img 
                src="/images/namaste-transparent.png" 
                alt="Namaste" 
                className="w-36 h-44 sm:w-40 sm:h-48 object-contain drop-shadow-[0_8px_30px_rgba(184,134,11,0.35)] select-none pointer-events-none"
              />
            </div>

            {/* Namaste Text */}
            <div className="space-y-1 relative z-10">
              <h2 className="text-4xl sm:text-5xl font-extrabold gold-text tracking-wider font-serif">
                नमस्ते
              </h2>
              <p className="text-xs font-bold tracking-[0.4em] text-primary uppercase font-luxury">
                NAMASTE
              </p>
            </div>

            {/* Welcome to Cafe Name */}
            <div className="mt-5 space-y-1 relative z-10">
              <p className="text-[10px] uppercase tracking-[0.25em] text-muted font-bold font-luxury">
                WELCOME TO
              </p>
              <h1 className="text-2xl sm:text-3xl font-black text-text tracking-tight font-serif">
                {effectiveCafeName}
              </h1>

              {/* Seated Table Badge if available */}
              {tableNumber ? (
                <div className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 border border-primary/30 rounded-full text-primary text-xs font-bold shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Table {tableNumber}</span>
                </div>
              ) : (
                <p className="text-xs text-muted mt-2 font-medium">
                  Scan. Order. Enjoy.
                </p>
              )}
            </div>

            {/* 2-Second Timer Progress Bar & Smooth slide hint */}
            <div className="mt-8 w-full max-w-xs relative z-10">
              <div className="w-full bg-[#E5DFD4] h-1.5 rounded-full overflow-hidden border border-primary/20">
                <div 
                  className="h-full bg-gradient-to-r from-primary via-primary-hover to-primary transition-all duration-75 ease-linear rounded-full"
                  style={{ width: `${introProgress}%` }}
                />
              </div>
              <p className="text-[11px] text-muted mt-2.5 font-medium tracking-wide">
                Entering menu in {countdownSeconds}s • Tap anywhere to start
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Container */}
      <div className="max-w-md mx-auto bg-[#FBF8F3] min-h-screen shadow-xl border-x border-[#E5DFD4] relative flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-[#FBF8F3]/95 backdrop-blur-xl border-b border-[#E5DFD4] px-4 py-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 bg-white rounded-xl border border-[#E5DFD4] flex items-center justify-center flex-shrink-0 shadow-2xs">
                <Scan className="w-4 h-4 text-[#B8860B]" />
              </div>
              <div className="min-w-0">
                <h1 className="text-base font-extrabold text-stone-900 tracking-tight font-heading truncate">
                  {effectiveCafeName}
                </h1>
                <p className="text-[9px] text-stone-500 uppercase tracking-[0.15em] font-semibold">Digital Menu</p>
              </div>
            </div>
            <Link href={`/${menupages}/menu/checkout`} className="relative group" aria-label="Go to checkout">
              <div className="w-8 h-8 rounded-xl bg-white border border-[#E5DFD4] flex items-center justify-center group-hover:border-[#B8860B]/50 group-hover:bg-[#B8860B]/5 transition-all duration-300 shadow-2xs">
                <ShoppingCart className="w-4 h-4 text-stone-800 group-hover:text-[#B8860B] transition-colors" />
              </div>
              {uniqueItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#B8860B] text-white text-[9px] min-w-[18px] h-4 px-0.5 rounded-full flex items-center justify-center border-2 border-white font-extrabold shadow-sm font-price">
                  {uniqueItemsCount}
                </span>
              )}
            </Link>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto pb-28">
          {/* Active Offers Top Banner (Allows re-opening popup anytime) */}
          {activeOffers.length > 0 && (
            <div className="mx-4 mt-2.5">
              <button
                type="button"
                onClick={() => setShowOfferPopup(true)}
                className="w-full flex items-center justify-between py-2 px-3 rounded-xl bg-gradient-to-r from-[#F3EFE6] via-[#FBF8F3] to-[#F3EFE6] border border-primary/30 shadow-2xs hover:border-primary/50 transition-all text-left group cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/25 flex items-center justify-center text-primary flex-shrink-0">
                    <TicketPercent className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                      <span>{activeOffers.length} {activeOffers.length === 1 ? 'Special Deal' : 'Special Deals'} Active!</span>
                      <span className="text-[10px] px-1.5 py-0.2 bg-primary/15 text-primary font-bold rounded-md font-price">
                        {activeOffers[0].discountValue}
                      </span>
                    </div>
                    <p className="text-[10px] text-stone-500 truncate mt-0.5 font-medium">
                      {activeOffers[0].title}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-primary group-hover:translate-x-0.5 transition-transform shrink-0 ml-1.5">
                  View →
                </span>
              </button>
            </div>
          )}
          {/* Payment Received Alert Banner */}
          {paymentAlert && (
            <motion.div 
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="mx-4 mt-3 bg-white border border-[#E5DFD4] rounded-2xl p-4 shadow-[0_4px_16px_rgba(28,25,23,0.06)] relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600" />
              <div className="flex items-start gap-3 pt-0.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center flex-shrink-0 text-emerald-700 shadow-xs">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                        Payment Received! 🎉
                      </h4>
                    </div>
                    <button
                      onClick={() => {
                        if (typeof window !== 'undefined' && paymentAlert.orderNumber) {
                          window.sessionStorage.setItem(`sd:ackPayment:${paymentAlert.orderNumber}`, 'true');
                        }
                        setPaymentAlert(null);
                      }}
                      className="text-stone-400 hover:text-stone-700 p-1 rounded-lg transition-colors -mr-1"
                      aria-label="Dismiss alert"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-stone-700 font-medium mt-1 leading-relaxed">
                    {paymentAlert.message || `Payment received for Table ${paymentAlert.tableNumber}! Thank you for dining with us.`}
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <Link
                      href={`/${menupages}/menu/order-confirmation?orderNumber=${paymentAlert.orderNumber}&table=${encodeURIComponent(paymentAlert.tableNumber || '')}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 active:scale-95 px-3.5 py-1.5 rounded-xl transition-all shadow-sm"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>View Confirmation & Rate</span>
                    </Link>
                    {paymentAlert.tableNumber && (
                      <span className="text-[11px] font-mono font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                        Table {paymentAlert.tableNumber}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Order Rejected Alert Banner */}
          {rejectedAlert && (
            <motion.div 
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="mx-4 mt-3 bg-white border border-[#E5DFD4] rounded-2xl p-4 shadow-[0_4px_16px_rgba(28,25,23,0.06)] relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-rose-500" />
              <div className="flex items-start gap-3 pt-0.5">
                <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center flex-shrink-0 text-rose-600 shadow-xs">
                  <XCircle className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-rose-800 uppercase tracking-wider">
                      Your Order is Rejected
                    </h4>
                    <button
                      onClick={() => {
                        if (typeof window !== 'undefined' && rejectedAlert.orderNumber) {
                          window.sessionStorage.setItem(`sd:dismissedRejection:${rejectedAlert.orderNumber}`, 'true');
                        }
                        setRejectedAlert(null);
                      }}
                      className="text-stone-400 hover:text-stone-700 p-1 rounded-lg transition-colors -mr-1"
                      aria-label="Dismiss alert"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-stone-700 font-medium mt-1 leading-relaxed">
                    {rejectedAlert.message || `Order #${rejectedAlert.orderNumber} for Table ${rejectedAlert.tableNumber} was rejected by the restaurant.`}
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <Link
                      href={`/${menupages}/menu/order-confirmation?orderNumber=${rejectedAlert.orderNumber}&table=${encodeURIComponent(rejectedAlert.tableNumber)}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:scale-95 px-3.5 py-1.5 rounded-xl transition-all shadow-sm"
                    >
                      <span>View Details</span>
                    </Link>
                    {rejectedAlert.tableNumber && (
                      <span className="text-[11px] font-mono font-semibold text-rose-800 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                        Table {rejectedAlert.tableNumber}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Categories Scroll */}
          <div className="py-1.5">
            <div className="flex gap-3 overflow-x-auto px-4 pt-2.5 pb-2 scrollbar-none items-center">
              {categories.map((cat) => {
                const isActive = activeCategory === cat.name;
                return (
                  <button
                    key={cat.name}
                    onClick={() => setActiveCategory(cat.name)}
                    className="flex flex-col items-center gap-1.5 min-w-[62px] max-w-[76px] py-1 transition-all duration-200 group focus:outline-none shrink-0"
                  >
                    <div className={`w-14 h-14 rounded-2xl overflow-hidden transition-all duration-200 bg-white p-0.5 border shadow-2xs ${
                      isActive 
                        ? "border-[#B8860B] ring-2 ring-[#B8860B] ring-offset-2 ring-offset-[#FBF8F3] shadow-sm" 
                        : "border-[#E5DFD4] opacity-85 group-hover:opacity-100 group-hover:border-[#B8860B]/40"
                    }`}>
                      <img 
                        src={cat.image} 
                        alt={cat.name}
                        className="w-full h-full object-cover rounded-[12px] group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = fallbackCatImg;
                        }}
                      />
                    </div>
                    <span className={`text-[11px] leading-tight text-center line-clamp-2 transition-colors duration-200 ${
                      isActive ? "text-stone-900 font-bold" : "text-stone-500 font-medium group-hover:text-stone-800"
                    }`}>
                      {cat.name}
                    </span>
                  </button>
                );
              })}
              {categories.length === 0 && (
                <div className="text-xs text-stone-500 py-4 px-4">No categories available.</div>
              )}
            </div>
          </div>

          {/* Menu Items */}
          <div className="px-4 pt-1 pb-3">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-[#B8860B] rounded-full" />
                <h2 className="text-base font-extrabold text-stone-900 tracking-tight font-heading">
                  {activeCategory || 'Menu'}
                </h2>
              </div>
              {!loadingCategory && (
                <span className="text-[10px] font-semibold text-stone-500 bg-white px-2 py-0.5 rounded-full border border-[#E5DFD4]">
                  {items.filter(item => item.category === activeCategory).length} items
                </span>
              )}
            </div>
            <div className="space-y-2.5">
              {loadingCategory && (
                <div className="text-xs text-stone-500 py-6 text-center bg-white rounded-xl border border-[#E5DFD4]">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto mb-1.5 text-[#B8860B]" />
                  Loading {activeCategory}…
                </div>
              )}
              {!loadingCategory && items
                .filter(item => item.category === activeCategory)
                .map((item) => {
                  const qty = getQuantity(item.id);
                  
                  return (
                    <div
                      key={String(item.id)}
                      className="flex items-center justify-between bg-white border border-[#E5DFD4] rounded-xl p-2.5 sm:p-3 hover:border-[#B8860B]/40 transition-all duration-200 shadow-2xs hover:shadow-xs"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0 pr-2">
                        <div className="w-15 h-15 sm:w-16 sm:h-16 rounded-xl overflow-hidden flex-shrink-0 shadow-2xs border border-[#E5DFD4] bg-[#F3EFE6] p-0.5">
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="w-full h-full object-cover rounded-[10px] transition-transform duration-500 hover:scale-105"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = fallbackCatImg;
                            }}
                          />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-stone-900 text-xs sm:text-sm line-clamp-1">
                            {item.name}
                          </h3>
                          {item.description && (
                            <p className="text-[10px] sm:text-[11px] text-stone-500 line-clamp-1 mt-0.5 leading-snug">
                              {item.description}
                            </p>
                          )}
                          <p className="text-xs sm:text-sm font-black text-stone-900 mt-1 font-price tabular-nums">
                            ₹{item.price}
                          </p>
                        </div>
                      </div>

                      <div className="flex-shrink-0">
                        {qty === 0 ? (
                          <button
                            onClick={() => updateQuantity(item, 1)}
                            className="px-3 py-1.5 bg-white text-[#B8860B] hover:bg-[#B8860B] hover:text-white border border-[#B8860B] rounded-lg text-xs font-bold transition-all duration-200 shadow-2xs min-w-[62px] uppercase tracking-wide active:scale-95 cursor-pointer"
                          >
                            + ADD
                          </button>
                        ) : (
                          <div className="flex items-center bg-[#F3EFE6] border border-[#E5DFD4] rounded-lg p-0.5 shadow-inner">
                            <button
                              onClick={() => updateQuantity(item, -1)}
                              className="w-6 h-6 bg-white text-stone-700 hover:text-[#B8860B] rounded-md flex items-center justify-center transition-all duration-150 border border-[#E5DFD4] shadow-2xs active:scale-90 cursor-pointer"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center font-extrabold text-xs text-stone-900 select-none font-price tabular-nums">
                              {qty}
                            </span>
                            <button
                              onClick={() => updateQuantity(item, 1)}
                              className="w-6 h-6 bg-[#B8860B] text-white hover:bg-[#9C7006] rounded-md flex items-center justify-center transition-all duration-150 shadow-2xs active:scale-90 cursor-pointer"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              {!loadingCategory && items.filter(item => item.category === activeCategory).length === 0 && (
                <div className="text-xs text-stone-500 py-8 text-center border border-dashed border-[#E5DFD4] rounded-xl bg-white">
                  <UtensilsCrossed className="w-7 h-7 mx-auto mb-1.5 text-stone-400" />
                  No items available in this category.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cart Bottom Bar */}
        <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-40 bg-white/95 backdrop-blur-xl border-t border-[#E5DFD4] shadow-[0_-4px_20px_rgba(28,25,23,0.06)]">
          <div className="px-4 py-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#B8860B]/10 border border-[#B8860B]/20 flex items-center justify-center shadow-2xs">
                  <ShoppingCart className="w-4 h-4 text-[#B8860B]" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                    {uniqueItemsCount} {uniqueItemsCount === 1 ? 'Item' : 'Items'}
                  </p>
                  <p className="text-base sm:text-lg font-black text-stone-900 tracking-tight font-price tabular-nums">
                    ₹{totalPrice}
                  </p>
                </div>
              </div>
              <Link
                href={`/${menupages}/menu/checkout`}
                aria-disabled={uniqueItemsCount === 0}
                className={`px-4 py-2 rounded-xl font-bold transition-all duration-300 text-xs flex items-center gap-1.5 ${
                  uniqueItemsCount === 0
                    ? 'bg-[#F3EFE6] text-stone-400 cursor-not-allowed pointer-events-none border border-[#E5DFD4]'
                    : 'bg-gradient-to-r from-[#B8860B] to-[#9C7006] hover:from-[#A2760A] hover:to-[#855D05] text-white shadow-md shadow-[#B8860B]/20 hover:scale-[1.01] active:scale-[0.98]'
                }`}
              >
                <span>Checkout</span>
                <span className="font-bold">→</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Special Offers Customer Popup (Opens after Namaste screen) */}
        <OfferPopupModal
          isOpen={showOfferPopup}
          onClose={handleCloseOfferPopup}
          offers={activeOffers}
          cafeName={effectiveCafeName}
          onApplyOffer={handleApplyOffer}
        />
      </div>
    </div>
  );
}