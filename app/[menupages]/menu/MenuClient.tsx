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
import useSWR, { mutate } from "swr";
import { getPusherClient } from "@/lib/pusher-client";
import OfferPopupModal, { OfferItem } from "@/components/OfferPopupModal";
import InaugurationCountdownBar from "@/components/InaugurationCountdownBar";
import ServiceBellModal from "@/components/ServiceBellModal";
import ItemCustomizationModal, { ModifierGroup } from "@/components/ItemCustomizationModal";
import ActiveTableTabBanner, { ActiveTableTabData } from "@/components/ActiveTableTabBanner";
import TableTabDrawer from "@/components/TableTabDrawer";
import OrderPreparedModal from "@/components/OrderPreparedModal";

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
  } catch { }
}

type MenuItem = {
  id: string | number;
  name: string;
  price: number;
  category: string;
  image: string;
  description?: string;
  modifierGroups?: ModifierGroup[];
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
  const [showWelcomeIntro, setShowWelcomeIntro] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('from') === 'order-more' || urlParams.has('skipWelcome')) {
        return false;
      }
      const isExplicitScan = urlParams.has('scan');
      const alreadyWelcomed = window.sessionStorage.getItem(`sd:welcomed:${menupages}`);
      if (alreadyWelcomed && !isExplicitScan) {
        return false;
      }
      return true;
    } catch {
      return false;
    }
  });
  const [rejectedAlert, setRejectedAlert] = useState<{
    orderNumber: string | number;
    tableNumber: string;
    message?: string;
  } | null>(null);
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);
  const [activeTabDrawerOpen, setActiveTabDrawerOpen] = useState<boolean>(false);
  const [preparedAlert, setPreparedAlert] = useState<{
    orderNumber: string | number;
    tableNumber: string;
  } | null>(null);

  // Active Table Tab State & SWR Polling
  const effectiveTable = tableNumber ? tableNumber.trim() : "";
  const tabUrl = menupages && effectiveTable ? `/api/orders/${menupages}/tab?table=${encodeURIComponent(effectiveTable)}` : null;
  const { data: tabResponse, mutate: mutateTab } = useSWR(tabUrl, fetcher, {
    refreshInterval: 5000,
    revalidateOnFocus: true,
  });

  const activeTabData: ActiveTableTabData | null = useMemo(() => {
    if (tabResponse?.success && tabResponse?.hasActiveTab && tabResponse?.data) {
      return tabResponse.data as ActiveTableTabData;
    }
    return null;
  }, [tabResponse]);

  // Fetch public cafe info for live cafe name fallback & theme sync
  const { data: cafePublicData } = useSWR(
    menupages ? `/api/cafes/${menupages}/public` : null,
    fetcher,
    { 
      revalidateOnFocus: false, 
      dedupingInterval: 30000,
      onSuccess: (res) => {
        if (res?.success && res.data?.theme && typeof document !== 'undefined') {
          document.documentElement.setAttribute('data-theme', res.data.theme);
        }
      }
    }
  );

  // Sync theme attribute to HTML root for customer menu
  useEffect(() => {
    if (cafePublicData?.data?.theme && typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', cafePublicData.data.theme);
    }
  }, [cafePublicData]);

  const effectiveCafeName = cafeName || cafePublicData?.data?.cafeName || menupages;

  // Smooth 2.2-Second timer for Namaste Welcome Intro (zero interval overhead)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if user came from a fresh scan or already saw the intro in this tab
    const urlParams = new URLSearchParams(window.location.search);
    const isExplicitScan = urlParams.has('scan');
    const fromOrderMore = urlParams.get('from') === 'order-more' || urlParams.has('skipWelcome');
    const alreadyWelcomed = window.sessionStorage.getItem(`sd:welcomed:${menupages}`);

    // If already welcomed in this tab and not a fresh QR scan with ?scan=1, or if returning via Order More, skip intro
    if ((alreadyWelcomed && !isExplicitScan) || fromOrderMore) {
      setShowWelcomeIntro(false);
      return;
    }

    const timer = setTimeout(() => {
      setShowWelcomeIntro(false);
      try {
        window.sessionStorage.setItem(`sd:welcomed:${menupages}`, 'true');
      } catch { }
    }, 2200);

    return () => clearTimeout(timer);
  }, [menupages]);

  const handleDismissIntro = () => {
    setShowWelcomeIntro(false);
    if (typeof window !== 'undefined') {
      try {
        window.sessionStorage.setItem(`sd:welcomed:${menupages}`, 'true');
      } catch { }
    }
  };

  // Fetch active promotional offers for this cafe (with instant server-side fallbackData)
  const { data: offersData } = useSWR(
    menupages ? `/api/offers/${menupages}?activeOnly=true` : null,
    fetcher,
    {
      fallbackData: {
        success: true,
        count: Array.isArray(initialOffers) ? initialOffers.filter((o: any) => o.isActive === true).length : 0,
        data: Array.isArray(initialOffers) ? initialOffers.filter((o: any) => o.isActive === true) : []
      },
      revalidateOnFocus: true,
      dedupingInterval: 0
    }
  );
  const activeOffers: OfferItem[] = useMemo(() => {
    // If offersData exists and has a data array, that is the authoritative source of truth (even if empty [])
    if (offersData?.data !== undefined && Array.isArray(offersData.data)) {
      return offersData.data.filter((o: any) => o.isActive !== false);
    }
    // Only use initialOffers before SWR finishes, and only if strictly active
    if (Array.isArray(initialOffers)) {
      return initialOffers.filter((o: any) => o.isActive === true);
    }
    return [];
  }, [offersData, initialOffers]);

  const [showOfferPopup, setShowOfferPopup] = useState<boolean>(false);
  const hasAutoOpenedOffersRef = useRef<boolean>(false);

  // If offers become inactive or empty, immediately dismiss popup
  useEffect(() => {
    if (activeOffers.length === 0 && showOfferPopup) {
      setShowOfferPopup(false);
    }
  }, [activeOffers.length, showOfferPopup]);

  // Clean up stale applied offers from localStorage & sessionStorage if no longer active
  useEffect(() => {
    if (typeof window === 'undefined' || !menupages) return;
    if (offersData?.data !== undefined && Array.isArray(offersData.data)) {
      try {
        const stored = window.sessionStorage.getItem(`sd:appliedOffer:${menupages}`) ||
                       window.localStorage.getItem(`sd:appliedOffer:${menupages}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          const isStillActive = offersData.data.some(
            (o: any) => o.code && o.code.toUpperCase() === parsed.code?.toUpperCase() && o.isActive !== false
          );
          if (!isStillActive) {
            window.sessionStorage.removeItem(`sd:appliedOffer:${menupages}`);
            window.localStorage.removeItem(`sd:appliedOffer:${menupages}`);
          }
        }
      } catch {}
    }
  }, [offersData, menupages]);

  // Trigger Offer Popup ONLY after a fresh QR scan and once per scan session
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (showWelcomeIntro) return; // Wait until Namaste welcome screen has fully finished
    if (hasAutoOpenedOffersRef.current) return;

    const urlParams = new URLSearchParams(window.location.search);
    const isExplicitScan = urlParams.has('scan');
    const fromOrderMore = urlParams.get('from') === 'order-more' || urlParams.has('skipWelcome');

    // ONLY show if user explicitly scanned a QR code and is not returning from order-more
    if (!isExplicitScan || fromOrderMore) return;

    // Check if offer popup was already shown or dismissed in this session
    const alreadyShown = window.sessionStorage.getItem(`sd:offers_shown:${menupages}`);
    if (alreadyShown) return;

    if (activeOffers.length > 0) {
      hasAutoOpenedOffersRef.current = true;
      const timer = setTimeout(() => {
        setShowOfferPopup(true);
        try {
          window.sessionStorage.setItem(`sd:offers_shown:${menupages}`, 'true');
        } catch { }
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [showWelcomeIntro, activeOffers, menupages]);

  const handleCloseOfferPopup = () => {
    setShowOfferPopup(false);
    if (typeof window !== 'undefined') {
      try {
        window.sessionStorage.setItem(`sd:offers_shown:${menupages}`, 'true');
      } catch { }
    }
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
        window.sessionStorage.setItem(`sd:offers_shown:${menupages}`, 'true');
      } catch { }
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
      }
    } catch { }
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
    } catch { }
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
    } catch { }

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
          } catch { }
        }
      }

      // 2. Real-time Payment Received confirmation
      if (data.isPaymentCompleted || data.isPaymentReceived || data.paymentStatus === 'completed') {
        const matchesTable = tableNumber && String(data.tableNumber).trim() === String(tableNumber).trim();
        const matchesOrder = orderNumber && String(data.orderNumber) === String(orderNumber);

        if (matchesTable || matchesOrder || (!tableNumber && !orderNumber)) {
          try {
            const raw = window.localStorage.getItem(`sd:latestOrder:${menupages}`);
            if (raw) {
              const parsed = JSON.parse(raw);
              window.localStorage.setItem(`sd:latestOrder:${menupages}`, JSON.stringify({
                ...parsed,
                paymentStatus: 'completed',
              }));
            }
          } catch { }
        }
      }

      // 3. Order Prepared / Ready / Served alert (continuous siren until OK)
      if (data.orderStatus === 'ready' || data.orderStatus === 'served') {
        const matchesTable = tableNumber && String(data.tableNumber).trim() === String(tableNumber).trim();
        const matchesOrder = orderNumber && String(data.orderNumber) === String(orderNumber);

        if (matchesTable || matchesOrder || (!tableNumber && !orderNumber)) {
          try {
            const ack = window.sessionStorage.getItem(`sd:ackPrepared:${data.orderNumber || orderNumber}`);
            if (!ack) {
              setPreparedAlert({
                orderNumber: data.orderNumber || orderNumber || '',
                tableNumber: data.tableNumber || tableNumber || '',
              });
            }
          } catch { }
        }
      }
    };

    if (tableNumber) {
      const clean = tableNumber.trim();
      const safeChan = clean.replace(/[^a-zA-Z0-9_\-=@,.;]/g, '_');
      const tableChan = pusher.subscribe(`cafe-${menupages}-table-${safeChan}`);
      tableChan.bind('order-status-updated', handleStatusUpdate);
      tableChan.bind('payment-received', handleStatusUpdate);
      tableChan.bind('table-tab-updated', () => {
        mutateTab();
      });
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

    const handleOffersUpdate = () => {
      mutate(`/api/offers/${menupages}?activeOnly=true`);
    };
    cafeChan.bind('offers-updated', handleOffersUpdate);

    const handleThemeUpdate = (payload?: any) => {
      if (payload?.theme && typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', payload.theme);
      }
      mutate(`/api/cafes/${menupages}/public`);
      mutate(`/api/cafes/${menupages}/theme`);
    };
    cafeChan.bind('theme-updated', handleThemeUpdate);
    channels.push(cafeChan);

    return () => {
      channels.forEach(ch => {
        try {
          ch.unbind('order-status-updated', handleStatusUpdate);
          ch.unbind('payment-received', handleStatusUpdate);
          ch.unbind('offers-updated', handleOffersUpdate);
          ch.unbind('theme-updated', handleThemeUpdate);
        } catch { }
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
        modifierGroups: item.modifierGroups || [],
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
    } catch { }
  }, [menupages]);

  // Save active category
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && activeCategory) {
        window.sessionStorage.setItem(`sd:activeCat:${menupages}`, activeCategory);
      }
    } catch { }
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
    } catch { }
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

  const handleAddClick = (item: MenuItem) => {
    if (item.modifierGroups && item.modifierGroups.length > 0) {
      setCustomizingItem(item);
    } else {
      updateQuantity(item, 1);
    }
  };

  const handleCustomizationConfirm = (customized: {
    cartKey: string;
    baseId: string;
    name: string;
    price: number;
    image?: string;
    description?: string;
    selectedModifiers: Array<{ groupName: string; name: string; price: number }>;
  }) => {
    const key = customized.cartKey;
    setQuantities(prev => {
      const nextQty = (prev[key] || 0) + 1;
      const next = { ...prev, [key]: nextQty };

      // Update catalog and checkout lines
      try {
        const raw = window.sessionStorage.getItem(`sd:items:${menupages}`);
        const list: Array<any> = raw ? JSON.parse(raw) : [];
        const idx = list.findIndex(it => String(it.id) === key);
        const payload = {
          id: key,
          baseId: customized.baseId,
          name: customized.name,
          price: customized.price,
          image: customized.image || '',
          description: customized.description || '',
          selectedModifiers: customized.selectedModifiers,
        };
        if (idx === -1) list.push(payload);
        else list[idx] = payload;
        window.sessionStorage.setItem(`sd:items:${menupages}`, JSON.stringify(list));
        setCatalog(list);
      } catch {}

      return next;
    });
  };

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
        } catch { }
      }

      return next;
    });
  };

  const getQuantity = (id: string | number) => {
    const direct = quantities[id] || 0;
    if (direct > 0) return direct;
    
    // Also check composite keys for customized items (e.g. "baseId::modifier...")
    const idStr = String(id);
    let totalCustomized = 0;
    for (const [key, q] of Object.entries(quantities)) {
      if (q > 0 && typeof key === 'string' && key.startsWith(`${idStr}::`)) {
        totalCustomized += q;
      }
    }
    return totalCustomized;
  };

  // Calculate cart items from ALL categories
  const cartItems = useMemo(() => {
    const itemsWithQty = Object.entries(quantities)
      .map(([id, qty]) => {
        // First check catalog for customized or standard items
        const fromCatalog = catalog.find(c => String(c.id) === String(id));
        if (fromCatalog) {
          return {
            id: fromCatalog.id,
            baseId: (fromCatalog as any).baseId,
            name: fromCatalog.name,
            price: fromCatalog.price,
            category: '',
            image: fromCatalog.image,
            description: fromCatalog.description,
            selectedModifiers: (fromCatalog as any).selectedModifiers,
            qty
          } as MenuItem & { qty: number; baseId?: string; selectedModifiers?: any[] };
        }

        const inView = items.find(i => String(i.id) === String(id));
        if (inView) return { ...inView, qty };

        const fromFallback = fallbackLines.find(c => String(c.id) === String(id));
        if (fromFallback) {
          return {
            id: fromFallback.id,
            baseId: (fromFallback as any).baseId,
            name: fromFallback.name,
            price: fromFallback.price,
            category: '',
            image: fromFallback.image,
            description: fromFallback.description,
            selectedModifiers: (fromFallback as any).selectedModifiers,
            qty
          } as MenuItem & { qty: number; baseId?: string; selectedModifiers?: any[] };
        }

        return null;
      })
      .filter(Boolean) as Array<MenuItem & { qty: number; baseId?: string; selectedModifiers?: any[] }>;

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
          baseId: (item as any).baseId || (String(item.id).includes('::') ? String(item.id).split('::')[0] : String(item.id)),
          name: item.name,
          price: item.price,
          qty: item.qty,
          image: item.image,
          description: item.description,
          selectedModifiers: (item as any).selectedModifiers,
        }));
        window.sessionStorage.setItem(`sd:checkoutLines:${menupages}`, JSON.stringify(payload));
        window.localStorage.setItem(`sd:checkoutLines:${menupages}`, JSON.stringify(payload));
      }
    } catch { }
  }, [cartItems, menupages]);

  return (
    <div className="min-h-screen bg-background">
      {/* Elegant Namaste Welcome Screen (Shown on QR Scan, slides upside smoothly) */}
      <AnimatePresence>
        {showWelcomeIntro && (
          <motion.div
            key="namaste-welcome-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{
              opacity: 0,
              y: "-100%",
              transition: {
                duration: 0.65,
                ease: [0.32, 0.72, 0, 1],
              },
            }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#FBF8F3]/98 backdrop-blur-2xl px-6 text-center select-none cursor-pointer"
            onClick={handleDismissIntro}
          >
            {/* Ambient Honey Gold Radial Glow */}
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: [1, 1.15, 1], opacity: [0.18, 0.28, 0.18] }}
              transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary/20 rounded-full blur-3xl pointer-events-none"
            />

            {/* Pure Transparent Joined Palms (Namaste) - Zero background */}
            <motion.div
              initial={{ scale: 0.88, opacity: 0, y: 14 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              className="relative mb-4 flex items-center justify-center"
            >
              <img
                src="/images/namaste-transparent.png"
                alt="Namaste"
                className="w-36 h-44 sm:w-40 sm:h-48 object-contain drop-shadow-[0_8px_30px_rgba(184,134,11,0.35)] select-none pointer-events-none"
              />
            </motion.div>

            {/* Namaste Text */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
              className="space-y-1 relative z-10"
            >
              <h2 className="text-4xl sm:text-5xl font-extrabold gold-text tracking-wider font-serif">
                नमस्ते
              </h2>
              <p className="text-xs font-bold tracking-[0.4em] text-primary uppercase font-luxury">
                NAMASTE
              </p>
            </motion.div>

            {/* Welcome to Cafe Name */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25, ease: "easeOut" }}
              className="mt-5 space-y-1 relative z-10"
            >
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
                  <span>{tableNumber.toLowerCase().startsWith('table') ? tableNumber : `Table ${tableNumber}`}</span>
                </div>
              ) : (
                <p className="text-xs text-muted mt-2 font-medium">
                  Scan. Order. Enjoy.
                </p>
              )}
            </motion.div>

            {/* Tap to enter hint */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.45, 0.9, 0.45] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut", delay: 0.35 }}
              className="mt-8 relative z-10"
            >
              <span className="text-[11px] font-semibold tracking-widest text-muted uppercase">
                Tap anywhere to enter
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Container */}
      <div className="max-w-md mx-auto menu-container min-h-screen shadow-xl border-x menu-border relative flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-10 menu-header backdrop-blur-xl border-b menu-border px-4 py-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 menu-card rounded-xl border menu-border flex items-center justify-center flex-shrink-0 shadow-2xs">
                <Scan className="w-4 h-4 menu-primary-text" />
              </div>
              <div className="min-w-0">
                <h1 className="text-base font-extrabold menu-text tracking-tight font-heading truncate">
                  {effectiveCafeName}
                </h1>
                <p className="text-[9px] menu-muted uppercase tracking-[0.15em] font-semibold">Digital Menu</p>
              </div>
            </div>
            <Link href={`/${menupages}/menu/checkout`} className="relative group" aria-label="Go to checkout">
              <div className="w-8 h-8 rounded-xl menu-card border menu-border flex items-center justify-center group-hover:opacity-90 transition-all duration-300 shadow-2xs">
                <ShoppingCart className="w-4 h-4 menu-text group-hover:opacity-80 transition-colors" />
              </div>
              {uniqueItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 menu-primary-btn text-[9px] min-w-[18px] h-4 px-0.5 rounded-full flex items-center justify-center border-2 border-white font-extrabold shadow-sm font-price">
                  {uniqueItemsCount}
                </span>
              )}
            </Link>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto pb-28">
          {/* Active Table Tab Banner (Continuous Table Tab) */}
          {activeTabData && (
            <div className="mx-4 mt-2.5">
              <ActiveTableTabBanner 
                tabData={activeTabData} 
                onOpenDetails={() => setActiveTabDrawerOpen(true)} 
              />
            </div>
          )}

          {/* Minimal Inauguration Countdown Bar (Only for Ignite Aeros & Only for Today) */}
          <InaugurationCountdownBar cafeSlug={menupages} />

          {/* Active Offers Top Banner (Allows re-opening popup anytime) */}
          {activeOffers.length > 0 && (
            <div className="mx-4 mt-2.5">
              <button
                type="button"
                onClick={() => setShowOfferPopup(true)}
                className="w-full flex items-center justify-between py-2 px-3 rounded-xl bg-[var(--theme-surface)] border menu-border shadow-2xs hover:border-[var(--theme-primary)]/50 transition-all text-left group cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-[var(--theme-primary)]/10 border border-[var(--theme-primary)]/25 flex items-center justify-center menu-primary-text flex-shrink-0">
                    <TicketPercent className="w-3.5 h-3.5 menu-primary-text" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold menu-text flex items-center gap-1.5">
                      <span>{activeOffers.length} {activeOffers.length === 1 ? 'Special Deal' : 'Special Deals'} Active!</span>
                      <span className="text-[10px] px-1.5 py-0.2 bg-[var(--theme-primary)]/15 menu-primary-text font-bold rounded-md font-price">
                        {activeOffers[0].discountValue}
                      </span>
                    </div>
                    <p className="text-[10px] menu-muted truncate mt-0.5 font-medium">
                      {activeOffers[0].title}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold menu-primary-text group-hover:translate-x-0.5 transition-transform shrink-0 ml-1.5">
                  View →
                </span>
              </button>
            </div>
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
                    <div className={`w-14 h-14 rounded-2xl overflow-hidden transition-all duration-200 menu-card p-0.5 border shadow-2xs ${isActive
                      ? "border-[var(--theme-primary)] ring-2 ring-[var(--theme-primary)] ring-offset-2 ring-offset-[var(--theme-bg)] shadow-sm"
                      : "menu-border opacity-85 group-hover:opacity-100 group-hover:border-[var(--theme-primary)]/40"
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
                    <span className={`text-[11px] leading-tight text-center line-clamp-2 transition-colors duration-200 ${isActive ? "menu-text font-bold" : "menu-muted font-medium group-hover:opacity-100"
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
                <div className="w-1 h-4 menu-primary-btn rounded-full" />
                <h2 className="text-base font-extrabold menu-text tracking-tight font-heading">
                  {activeCategory || 'Menu'}
                </h2>
              </div>
              {!loadingCategory && (
                <span className="text-[10px] font-semibold menu-muted menu-card px-2 py-0.5 rounded-full border menu-border">
                  {items.filter(item => item.category === activeCategory).length} items
                </span>
              )}
            </div>
            <div className="space-y-2.5">
              {loadingCategory && (
                <div className="text-xs menu-muted py-6 text-center menu-card rounded-xl border menu-border">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto mb-1.5 menu-primary-text" />
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
                      className="group flex items-center justify-between menu-card border menu-border hover:border-[var(--theme-primary)]/60 rounded-2xl p-3 sm:p-3.5 transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-lg hover:-translate-y-0.5"
                    >
                      <div className="flex items-center gap-3.5 flex-1 min-w-0 pr-3">
                        <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-2xl overflow-hidden flex-shrink-0 shadow-xs border menu-border/80 bg-[var(--theme-surface)] p-0.5">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover rounded-[14px] transition-transform duration-500 group-hover:scale-108"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = fallbackCatImg;
                            }}
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold menu-text text-sm sm:text-base tracking-tight line-clamp-1 group-hover:text-[var(--theme-primary)] transition-colors">
                            {item.name}
                          </h3>
                          {item.description && (
                            <p className="text-[11px] menu-muted line-clamp-2 mt-0.5 leading-snug font-normal">
                              {item.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-sm sm:text-base font-black menu-text font-price tabular-nums">
                              ₹{item.price}
                            </p>
                            {menupages?.toLowerCase().includes("ignite-aeros") &&
                              (item.name.toLowerCase().includes("tea") || item.name.toLowerCase().includes("chai")) &&
                              (() => {
                                const now = new Date();
                                const startDay = new Date("2026-11-18T00:00:00+05:30");
                                const endDay = new Date("2026-11-18T23:59:59+05:30");
                                if (now < startDay || now > endDay) return null;
                                const startFree = new Date("2026-11-18T18:00:00+05:30");
                                const endFree = new Date("2026-11-18T20:00:00+05:30");
                                if (now >= startFree && now <= endFree) {
                                  return (
                                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                                      Free (6-8 PM)
                                    </span>
                                  );
                                }
                                return (
                                  <span className="text-[9px] font-bold text-amber-700 bg-amber-500/15 border border-amber-500/25 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                                    Free 6-8 PM Today
                                  </span>
                                );
                              })()
                            }
                          </div>
                          {item.modifierGroups && item.modifierGroups.length > 0 && (
                            <span className="inline-block mt-0.5 text-[9px] font-bold uppercase tracking-wider menu-primary-text bg-[var(--theme-primary)]/10 px-1.5 py-0.5 rounded">
                              Customizable
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex-shrink-0">
                        {qty === 0 ? (
                          <button
                            onClick={() => handleAddClick(item)}
                            className="px-3.5 py-2 menu-card menu-primary-text hover:menu-primary-btn border-2 menu-primary-border rounded-xl text-xs font-extrabold transition-all duration-200 shadow-2xs min-w-[70px] uppercase tracking-wider active:scale-95 cursor-pointer flex items-center justify-center gap-1"
                          >
                            <span>+ ADD</span>
                          </button>
                        ) : (
                          <div className="flex items-center bg-[var(--theme-surface)] border menu-border rounded-xl p-1 shadow-inner gap-1">
                            <button
                              onClick={() => {
                                if (item.modifierGroups && item.modifierGroups.length > 0) {
                                  // For customizable items, reduce the last added variant or direct id
                                  const idStr = String(item.id);
                                  const matchingKey = Object.keys(quantities).reverse().find(k => k === idStr || k.startsWith(`${idStr}::`));
                                  if (matchingKey) {
                                    setQuantities(prev => {
                                      const cur = prev[matchingKey] || 0;
                                      if (cur <= 1) {
                                        const { [matchingKey]: _, ...rest } = prev;
                                        return rest;
                                      }
                                      return { ...prev, [matchingKey]: cur - 1 };
                                    });
                                  }
                                } else {
                                  updateQuantity(item, -1);
                                }
                              }}
                              className="w-7 h-7 menu-card menu-text hover:menu-primary-text rounded-lg flex items-center justify-center transition-all duration-150 border menu-border shadow-2xs active:scale-90 cursor-pointer"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                            </button>
                            <span className="w-6 text-center font-black text-xs menu-text select-none font-price tabular-nums">
                              {qty}
                            </span>
                            <button
                              onClick={() => handleAddClick(item)}
                              className="w-7 h-7 menu-primary-btn rounded-lg flex items-center justify-center transition-all duration-150 shadow-2xs active:scale-90 cursor-pointer"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              {!loadingCategory && items.filter(item => item.category === activeCategory).length === 0 && (
                <div className="text-xs menu-muted py-8 text-center border border-dashed menu-border rounded-xl menu-card">
                  <UtensilsCrossed className="w-7 h-7 mx-auto mb-1.5 menu-muted" />
                  No items available in this category.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cart Bottom Bar */}
        <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-40 menu-card backdrop-blur-xl border-t menu-border shadow-[0_-8px_30px_rgba(0,0,0,0.08)]">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-2xl bg-[var(--theme-primary)]/15 border border-[var(--theme-primary)]/25 flex items-center justify-center shadow-xs">
                  <ShoppingCart className="w-5 h-5 menu-primary-text" />
                  {uniqueItemsCount > 0 && (
                    <span className="absolute -top-1 -right-1 menu-primary-btn text-[9px] min-w-[17px] h-4 px-1 rounded-full flex items-center justify-center font-black border-2 border-white">
                      {uniqueItemsCount}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-[10px] font-bold menu-muted uppercase tracking-widest">
                    Your Selection
                  </p>
                  <p className="text-base sm:text-lg font-black menu-text tracking-tight font-price tabular-nums leading-tight">
                    ₹{totalPrice}
                  </p>
                </div>
              </div>
              <Link
                href={`/${menupages}/menu/checkout`}
                aria-disabled={uniqueItemsCount === 0}
                className={`px-5 py-2.5 rounded-xl font-bold transition-all duration-300 text-xs flex items-center gap-2 ${uniqueItemsCount === 0
                  ? 'bg-[var(--theme-surface)] menu-muted cursor-not-allowed pointer-events-none border menu-border'
                  : 'menu-primary-btn hover:brightness-105 shadow-lg shadow-[var(--theme-primary)]/25 hover:scale-[1.02] active:scale-[0.98]'
                  }`}
              >
                <span>View Cart & Checkout</span>
                <span className="font-extrabold text-sm">→</span>
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

        {/* Floating Call Waiter & Service Bell */}
        <ServiceBellModal
          cafeSlug={menupages}
          tableNumber={tableNumber}
        />

        {/* Item Customization Modal */}
        <ItemCustomizationModal
          isOpen={Boolean(customizingItem)}
          onClose={() => setCustomizingItem(null)}
          item={customizingItem}
          onConfirm={handleCustomizationConfirm}
        />

        {/* Continuous Table Tab Drawer */}
        <TableTabDrawer
          isOpen={activeTabDrawerOpen}
          onClose={() => setActiveTabDrawerOpen(false)}
          tabData={activeTabData}
          onAddMoreItems={() => {
            setActiveTabDrawerOpen(false);
          }}
        />

        {/* Continuous Siren / Alarm Modal when Order is Prepared / Ready / Served */}
        <OrderPreparedModal
          isOpen={Boolean(preparedAlert)}
          orderNumber={preparedAlert?.orderNumber || ""}
          tableNumber={preparedAlert?.tableNumber || tableNumber || ""}
          onAcknowledge={() => {
            if (preparedAlert?.orderNumber) {
              try {
                window.sessionStorage.setItem(`sd:ackPrepared:${preparedAlert.orderNumber}`, "true");
              } catch {}
            }
            setPreparedAlert(null);
          }}
        />
      </div>
    </div>
  );
}