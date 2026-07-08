"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Scan, 
  QrCode, 
  Crown, 
  Sparkles,
  Star,
  UtensilsCrossed,
  Coffee,
  Pizza,
  Loader2
} from "lucide-react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

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
  initialItems: MenuItem[];
  initialCategories: Array<{ name: string; image: string }>;
};

export default function MenuClient({ menupages, initialItems, initialCategories }: MenuClientProps) {
  const router = useRouter();
  const [quantities, setQuantities] = useState<Record<string | number, number>>({});
  const [activeCategory, setActiveCategory] = useState<string>(initialCategories[0]?.name || "");
  const [uniqueItemsCount, setUniqueItemsCount] = useState(0);
  const [items, setItems] = useState<MenuItem[]>(initialItems);
  const [categories, setCategories] = useState<Array<{ name: string; image: string }>>(initialCategories);
  
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

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Container */}
      <div className="max-w-md mx-auto bg-card/60 backdrop-blur-sm min-h-screen shadow-2xl shadow-primary/5 border border-border/30 relative flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-card/80 backdrop-blur-xl border-b border-border/30 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative p-2.5 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl border border-primary/30">
                <div className="absolute inset-0 border border-primary/30 rounded-xl"></div>
                <Scan className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-text tracking-tight">
                  The <span className="text-primary">Dining</span> Co.
                </h1>
                <p className="text-[10px] text-muted/50 uppercase tracking-[0.15em]">Digital Menu</p>
              </div>
            </div>
            <Link href={`/${menupages}/menu/checkout`} className="relative group">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/20 transition-all duration-300">
                <ShoppingCart className="w-5 h-5 text-primary" />
              </div>
              {uniqueItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-background text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-card font-bold shadow-lg shadow-primary/20">
                  {uniqueItemsCount}
                </span>
              )}
            </Link>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto pb-32">
          {/* Hero Banner */}
          <div className="px-4 py-3">
            <div className="bg-gradient-to-r from-primary/20 via-primary/10 to-primary/5 rounded-2xl p-4 border border-primary/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <QrCode className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="font-bold text-text text-lg tracking-tight">
                    Scan. Order. <span className="text-primary">Enjoy.</span>
                  </h2>
                  <p className="text-xs text-muted/50 font-medium">Where Menus Go Digital.</p>
                </div>
                <div className="ml-auto">
                  <Sparkles className="w-5 h-5 text-primary/50" />
                </div>
              </div>
            </div>
          </div>

          {/* Categories Scroll */}
          <div className="py-2">
            <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide">
              {categories.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => setActiveCategory(cat.name)}
                  className={`flex flex-col items-center gap-1.5 min-w-[64px] transition-all duration-300 group ${
                    activeCategory === cat.name ? "opacity-100" : "opacity-70 hover:opacity-100"
                  }`}
                >
                  <div className={`w-14 h-14 rounded-xl overflow-hidden border transition-all duration-300 bg-surface/30 shadow-lg shadow-primary/5 ${
                    activeCategory === cat.name ? "border-primary shadow-lg shadow-primary/20" : "border-border/30 group-hover:border-primary/50"
                  }`}>
                    <img 
                      src={cat.image} 
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = fallbackCatImg;
                      }}
                    />
                  </div>
                  <span className={`text-[11px] font-medium text-center transition-colors duration-300 ${
                    activeCategory === cat.name ? "text-primary font-bold" : "text-muted/60"
                  }`}>
                    {cat.name}
                  </span>
                </button>
              ))}
              {categories.length === 0 && (
                <div className="text-sm text-muted/50 py-6 px-4">No categories available.</div>
              )}
            </div>
          </div>

          {/* Menu Items */}
          <div className="px-4 pt-2 pb-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-5 bg-primary rounded-full"></div>
              <h2 className="text-lg font-bold text-text tracking-tight">{activeCategory || 'Menu'}</h2>
            </div>
            <div className="space-y-2.5">
              {loadingCategory && (
                <div className="text-sm text-muted/50 py-8 text-center">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                  Loading {activeCategory}…
                </div>
              )}
              {!loadingCategory && items
                .filter(item => item.category === activeCategory)
                .map((item, index) => {
                  const qty = getQuantity(item.id);
                  
                  return (
                    <div
                      key={String(item.id)}
                      className="flex items-center justify-between bg-surface/20 border border-border/20 rounded-xl p-3 hover:border-primary/30 transition-all duration-300 shadow-lg shadow-primary/5 group"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 shadow-lg shadow-primary/5 border border-border/20">
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = fallbackCatImg;
                            }}
                          />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-text text-sm line-clamp-1 group-hover:text-primary transition-colors duration-300">
                            {item.name}
                          </h3>
                          <p className="text-xs font-bold text-primary mt-0.5">₹{item.price}</p>
                        </div>
                      </div>

                      <div className="flex-shrink-0 ml-2">
                        {qty === 0 ? (
                          <button
                            onClick={() => updateQuantity(item, 1)}
                            className="px-5 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-xl text-xs font-bold hover:bg-primary hover:text-background transition-all duration-300 shadow-lg shadow-primary/5 hover:shadow-primary/20 min-w-[64px]"
                          >
                            ADD
                          </button>
                        ) : (
                          <div className="flex items-center gap-1.5 bg-surface/30 border border-primary/20 rounded-xl p-1 shadow-lg shadow-primary/5">
                            <button
                              onClick={() => updateQuantity(item, -1)}
                              className="w-7 h-7 bg-primary/10 text-primary rounded-lg flex items-center justify-center hover:bg-primary hover:text-background transition-all duration-300"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-6 text-center font-bold text-sm text-text">{qty}</span>
                            <button
                              onClick={() => updateQuantity(item, 1)}
                              className="w-7 h-7 bg-primary/10 text-primary rounded-lg flex items-center justify-center hover:bg-primary hover:text-background transition-all duration-300"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              {!loadingCategory && items.filter(item => item.category === activeCategory).length === 0 && (
                <div className="text-sm text-muted/50 py-8 text-center border border-dashed border-border/30 rounded-xl">
                  <UtensilsCrossed className="w-8 h-8 mx-auto mb-2 text-muted/30" />
                  No items available in this category.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cart Bottom Bar */}
        <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-50 bg-card/95 backdrop-blur-xl border-t border-border/30 shadow-2xl shadow-primary/5">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text">
                    {uniqueItemsCount} {uniqueItemsCount === 1 ? 'Item' : 'Items'}
                  </p>
                  <p className="text-lg font-bold text-text tracking-tight">
                    ₹{totalPrice}
                  </p>
                </div>
              </div>
              <Link
                href={`/${menupages}/menu/checkout`}
                aria-disabled={uniqueItemsCount === 0}
                className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 shadow-lg text-base flex items-center gap-2 ${
                  uniqueItemsCount === 0
                    ? 'bg-surface/50 text-muted/40 cursor-not-allowed pointer-events-none border border-border/30'
                    : 'bg-gradient-to-r from-primary to-primary/85 hover:from-primary/90 hover:to-primary/90 text-background shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98]'
                }`}
              >
                Checkout <span className="font-normal">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}