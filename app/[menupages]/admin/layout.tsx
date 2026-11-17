"use client";

import Link from "next/link";
import { usePathname, useParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useRef } from "react";
import useSWR, { mutate } from "swr";
import { motion } from "framer-motion";  
import {
  LayoutDashboard,
  Bell,
  ClipboardList,
  UtensilsCrossed,
  Menu,
  X,
  User,
  CheckCircle,
  Settings,
  QrCode,
  LogOut,
  Loader2,
  Volume2,
  VolumeX,
  Crown,
  Store,
  Star,
  TicketPercent,
  Palette,
} from "lucide-react";

import useLocalStorage from "@/hooks/use-local-storage";
import AdminServiceAlerts, { unlockDeskBellAudio } from "@/components/AdminServiceAlerts";
import { getPusherClient } from "@/lib/pusher-client";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const params = useParams();
  const menupages = params?.menupages as string; 
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const [shouldPulse, setShouldPulse] = useState(false);
  const [soundEnabled, setSoundEnabled] = useLocalStorage('admin-sound-enabled', true);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [subscriptionExpired, setSubscriptionExpired] = useState(false);
  const [cafeDeactivated, setCafeDeactivated] = useState(false);
  const isFirstLoad = useRef(true);
  const lastCountRef = useRef(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const broadcastRef = useRef<BroadcastChannel | null>(null);

  // Initialize audio system and set up aggressive unlocking
  useEffect(() => {
    const unlockAudio = async () => {
      if (audioRef.current && !audioUnlocked) {
        try {
          audioRef.current.volume = 0.9;
          await audioRef.current.play();
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          setAudioUnlocked(true);
          unlockDeskBellAudio();
          if (broadcastRef.current) {
            broadcastRef.current.postMessage({ type: 'AUDIO_UNLOCKED' });
          }
          window.removeEventListener('click', unlockAudio);
          window.removeEventListener('keydown', unlockAudio);
          window.removeEventListener('touchstart', unlockAudio);
          console.log("Audio system unlocked via user interaction");
        } catch (error) {
          // Still blocked
        }
      }
    };

    window.addEventListener('click', unlockAudio);
    window.addEventListener('keydown', unlockAudio);
    window.addEventListener('touchstart', unlockAudio);

    return () => {
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };
  }, [audioUnlocked]);

  // Handle Visibility Change to re-trigger audio if tab comes to foreground
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !audioUnlocked) {
        console.log("Tab became visible, checking audio unlock status...");
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [audioUnlocked]);

  // Play notification sound helper
  const playNotificationSound = useCallback(async () => {
    if (!soundEnabled || !audioRef.current) return;

    try {
      audioRef.current.currentTime = 0;
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        await playPromise;
        setAudioUnlocked(true);
        setShouldPulse(true);
        setTimeout(() => setShouldPulse(false), 5000);
      }
    } catch (err) {
      console.warn("Audio playback blocked by browser policies. Interaction needed.", err);
      setAudioUnlocked(false);
    }
  }, [soundEnabled]);

  // BroadcastChannel to prevent duplicate sound/orders across tabs/pages
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!broadcastRef.current) {
      broadcastRef.current = new BroadcastChannel('admin-orders');
    }
    const channel = broadcastRef.current;
    const onMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'NEW_ORDER' && event.data.count > lastCountRef.current) {
        lastCountRef.current = event.data.count;
        playNotificationSound();
      } else if (event.data && event.data.type === 'AUDIO_UNLOCKED') {
        setAudioUnlocked(true);
      }
    };
    channel.addEventListener('message', onMessage);
    return () => channel.removeEventListener('message', onMessage);
  }, [playNotificationSound]);

  // Toggle sound preference (Mute/Unmute)
  const toggleSoundPreference = async () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    
    if (newState && audioRef.current) {
      try {
        audioRef.current.currentTime = 0;
        audioRef.current.volume = 0.5;
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          await playPromise;
          setAudioUnlocked(true);
          unlockDeskBellAudio();
          console.log("Audio system explicitly unlocked via icon click");
          audioRef.current.volume = 0.9;
        }
      } catch (e) {
        console.warn("Browser still blocking audio. User needs to interact more.", e);
        setAudioUnlocked(false);
      }
    }
  };

  // Fetch stats and check subscription using SWR
  const statsUrl = menupages ? `/api/orders/${menupages}?status=pending` : null;
  const { data: statsData } = useSWR(statsUrl, {
    refreshInterval: 5000,
    onSuccess: (data) => {
      if (data.success && data.stats) {
        const count = data.stats.pending || 0;
        
        if (!isFirstLoad.current && count > lastCountRef.current) {
          playNotificationSound();
          if (broadcastRef.current) {
            broadcastRef.current.postMessage({ type: 'NEW_ORDER', count: count });
          }
        }
        
        lastCountRef.current = count;
        setNewOrdersCount(count);
        isFirstLoad.current = false;
      }
    }
  });

  // Sidebar badge count
  const currentBadgeCount = Math.max(0, statsData?.stats?.pending ?? newOrdersCount);

  const statusUrl = menupages ? `/api/cafes/${menupages}/public` : null;
  const { data: statusData } = useSWR(statusUrl, {
    refreshInterval: 30000,
    onSuccess: (data) => {
      if (data.success && data.data) {
        setSubscriptionExpired(!!data.data.isExpired);
        setCafeDeactivated(!!data.data.isManuallyDeactivated);
        // Sync theme attribute to HTML root
        if (data.data.theme && typeof document !== 'undefined') {
          document.documentElement.setAttribute('data-theme', data.data.theme);
        }
      }
    }
  });

  // Dedicated Theme SWR fetcher to keep admin theme in sync with /api/cafes/[slug]/theme
  const themeUrl = menupages ? `/api/cafes/${menupages}/theme` : null;
  useSWR(themeUrl, {
    revalidateOnFocus: true,
    dedupingInterval: 5000,
    onSuccess: (res: any) => {
      if (res?.success && res.data?.theme && typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', res.data.theme);
      }
    }
  });

  useEffect(() => {
    const handleRefresh = (e?: any) => {
      if (e?.detail?.decrement) {
        setNewOrdersCount(prev => Math.max(0, prev - 1));
      } else if (typeof e?.detail?.pendingCount === 'number') {
        setNewOrdersCount(e.detail.pendingCount);
      }
      if (statsUrl) {
        mutate(
          statsUrl,
          (current: any) => {
            if (!current?.stats) return current;
            const newPending = e?.detail?.decrement
              ? Math.max(0, (current.stats.pending || 1) - 1)
              : typeof e?.detail?.pendingCount === 'number'
              ? e.detail.pendingCount
              : current.stats.pending;
            return {
              ...current,
              stats: {
                ...current.stats,
                pending: newPending,
              },
            };
          },
          true // revalidate with server in background
        );
      }
      if (statusUrl) mutate(statusUrl);
    };

    window.addEventListener('refresh-admin-stats', handleRefresh);
    return () => window.removeEventListener('refresh-admin-stats', handleRefresh);
  }, [statsUrl, statusUrl]);

  // Real-time Pusher listener to revalidate badge counts instantly across all admin tabs/pages
  useEffect(() => {
    if (!menupages) return;
    const pusher = getPusherClient();
    if (!pusher) return;

    const channelName = `cafe-${String(menupages).toLowerCase()}`;
    const channel = pusher.subscribe(channelName);

    const handleRealtimeOrder = (payload?: any) => {
      if (payload?.orderStatus && payload.orderStatus !== 'pending') {
        setNewOrdersCount(prev => Math.max(0, prev - 1));
        if (statsUrl) {
          mutate(
            statsUrl,
            (current: any) => {
              if (!current?.stats) return current;
              return {
                ...current,
                stats: {
                  ...current.stats,
                  pending: Math.max(0, (current.stats.pending || 1) - 1),
                },
              };
            },
            true
          );
        }
      } else {
        if (statsUrl) mutate(statsUrl);
      }
    };

    channel.bind('new-order', handleRealtimeOrder);
    channel.bind('order-status-updated', handleRealtimeOrder);

    const handleThemeUpdate = (data?: any) => {
      if (data?.theme && typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', data.theme);
      }
      if (themeUrl) mutate(themeUrl);
      if (statusUrl) mutate(statusUrl);
    };
    channel.bind('theme-updated', handleThemeUpdate);

    return () => {
      channel.unbind('new-order', handleRealtimeOrder);
      channel.unbind('order-status-updated', handleRealtimeOrder);
      channel.unbind('theme-updated', handleThemeUpdate);
      pusher.unsubscribe(channelName);
    };
  }, [menupages, statsUrl, themeUrl, statusUrl]);

  const base = menupages ? `/${menupages}/admin` : "/admin";
  const isNewOrdersPage = pathname === `${base}/new-orders`;

  const navItems = [
    { label: "Dashboard", href: base, icon: LayoutDashboard },
    { label: "New Orders", href: `${base}/new-orders`, icon: Bell, badge: currentBadgeCount },
    { label: "Orders", href: `${base}/orders`, icon: ClipboardList },
    { label: "Payment Completed", href: `${base}/payment-completed`, icon: CheckCircle },
    { label: "Manage Menu", href: `${base}/manage-menu`, icon: UtensilsCrossed },
    { label: "Menu QR Code", href: `${base}/qr-code`, icon: QrCode },
    { label: "Theme Customization", href: `${base}/theme`, icon: Palette },
    { label: "Customer Ratings", href: `${base}/ratings`, icon: Star },
    { label: "Special Offers", href: `${base}/offers`, icon: TicketPercent },
    { label: "Settings", href: `${base}/settings`, icon: Settings }, 
  ];

  // Brand Colors - The Dining Co. Theme
  const brandGold = "text-primary"; // Primary Text
  const brandGoldHover = "hover:text-primary";
  const activeBg = "menu-card border menu-border"; // Dynamic active card styling
  const activeText = "menu-primary-text font-bold"; // Dynamic active text
  const activeBorder = "border-r-2 menu-primary-border";

  // Logout handler
  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ role: 'cafeadmin' }),
      });
    } catch (_) {
      // ignore
    } finally {
      const slug = typeof menupages === 'string' ? menupages : Array.isArray(menupages) ? menupages[0] : '';
      router.replace(slug ? `/${slug}/adminlogin` : '/adminlogin');
      setLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen menu-container font-sans antialiased">
      {/* Hidden Audio Element for Notifications */}
      <audio 
        ref={audioRef}
        src="https://image2url.com/r2/default/audio/1773926314850-ea784a83-c3fd-40d8-88ae-b4edaafa0980.mp3" 
        preload="auto"
        className="hidden"
        onCanPlayThrough={() => console.log("Audio loaded and ready")}
        onError={(e) => console.error("Audio failed to load:", e)}
      />
      
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex h-screen overflow-hidden">
        {/* ─── Sidebar ─── */}
        <aside
          className={`
            fixed lg:static top-0 left-0 h-full z-50 w-[280px] bg-[var(--theme-surface)] border-r menu-border shadow-sm flex flex-col transition-transform duration-300 ease-in-out
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          `}
        >
          {/* Logo Area */}
          <div className="px-6 py-6 flex items-center justify-between border-b menu-border">
            <Link href={base} className="flex items-center gap-2.5">
              <div className="w-9 h-9 menu-card rounded-xl flex items-center justify-center border menu-border shadow-sm">
                <Crown className="w-5 h-5 menu-primary-text" />
              </div>
              <div>
                <h1 className="text-lg font-bold menu-text tracking-tight">
                  The <span className="menu-primary-text">Dining</span> Co.
                </h1>
                <p className="text-[10px] menu-muted uppercase tracking-[0.15em] font-medium">Admin Panel</p>
              </div>
            </Link>
            <button
              className="lg:hidden menu-muted hover:menu-text transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={22} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
            {navItems.map(({ label, href, icon: Icon, badge }: any) => {
              const isActive = href === base ? pathname === base : pathname.startsWith(href);
              
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    relative flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
                    ${isActive 
                      ? `${activeBg} ${activeText} shadow-sm` 
                      : "menu-muted hover:bg-[var(--theme-card)] hover:menu-text"}
                  `}
                >
                  {/* Active indicator bar */}
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 menu-primary-btn rounded-r-full"></span>
                  )}
                  
                  <Icon 
                    size={18} 
                    strokeWidth={isActive ? 2.5 : 2} 
                    className={`${isActive ? 'menu-primary-text' : 'menu-muted group-hover:menu-text'} transition-colors`}
                  />
                  <span className="flex-1">{label}</span>

                  {/* Sidebar Badge */}
                  {badge > 0 && (
                    <span className={`menu-primary-btn text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center shadow-sm ${shouldPulse ? 'animate-pulse' : ''}`}>
                      {badge > 99 ? "99+" : badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t menu-border">
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium menu-muted hover:text-rose-600 hover:bg-rose-500/10 transition-all duration-200 group disabled:opacity-60"
            >
              <LogOut 
                size={18} 
                strokeWidth={2} 
                className="menu-muted group-hover:text-rose-600 transition-colors"
              />
              <span>{loggingOut ? 'Logging out…' : 'Logout'}</span>
            </button>
          </div>
        </aside>

        {/* ─── Main Content Wrapper ─── */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden menu-container">
          
          {/* Top Header */}
          <header className="menu-header backdrop-blur-xl border-b menu-border px-6 py-4 flex items-center gap-4 shadow-sm shrink-0 z-30">
            <button
              className="lg:hidden menu-muted hover:menu-text transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={22} />
            </button>

            <div className="flex items-center gap-3 flex-1">
              {/* Audio Control */}
              <div className="relative group">
                <button
                  onClick={toggleSoundPreference}
                  className={`w-9 h-9 rounded-xl menu-card border menu-border hover:border-[var(--theme-primary)]/40 flex items-center justify-center transition-all duration-300 shadow-sm
                    ${soundEnabled && !audioUnlocked ? 'animate-pulse ring-2 ring-primary/30 ring-offset-2 ring-offset-background' : ''}`}
                  title={!audioUnlocked && soundEnabled ? "Click anywhere on the page to enable sound" : (soundEnabled ? "Mute notifications" : "Unmute notifications")}
                >
                  {soundEnabled ? (
                    <Volume2 size={18} className={`menu-primary-text ${!audioUnlocked ? 'opacity-50' : 'opacity-100'}`} />
                  ) : (
                    <VolumeX size={18} className="menu-muted" />
                  )}
                </button>
                
                {/* Audio Blocked Tooltip */}
                {soundEnabled && !audioUnlocked && (
                  <div className="fixed top-16 left-auto right-4 sm:right-auto sm:left-[calc(50%+120px)] -translate-x-1/2 w-64 bg-card/95 backdrop-blur-xl border border-border/50 text-text text-xs p-4 rounded-2xl shadow-2xl shadow-primary/10 z-[99999] pointer-events-none text-center">
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-card rotate-45 border-l border-t border-border/50"></div>
                    
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <div className="w-2.5 h-2.5 bg-primary rounded-full animate-ping"></div>
                      <span className="font-bold text-primary text-sm">Sound is Blocked</span>
                    </div>
                    <p className="text-muted/70 leading-tight">
                      Browser prevents auto-play. 
                      <span className="block font-bold text-primary/80 mt-2 text-xs uppercase tracking-widest">Click anywhere to enable</span>
                    </p>
                  </div>
                )}
              </div>

              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border border-primary/20 shadow-lg shadow-primary/10">
                <Store size={18} className="text-primary" strokeWidth={2.5} />
              </div>
              <span className="text-text font-bold text-base tracking-tight">
                {typeof menupages === 'string' ? `${menupages.charAt(0).toUpperCase() + menupages.slice(1)} Admin` : 'Admin Dashboard'}
              </span>
              
              <div className="flex-1"></div>
              
              {/* Table Service Assistance Alerts */}
              {menupages && (
                <AdminServiceAlerts
                  cafeSlug={menupages}
                  soundEnabled={soundEnabled}
                />
              )}

              {/* Cafe Status Indicator */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                <span className="text-xs font-medium text-emerald-400">Active</span>
              </div>
            </div>
          </header>

          {/* Scrollable Page Content */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 relative menu-container">
            {cafeDeactivated ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-6 max-w-2xl mx-auto">
                <div className="w-20 h-20 bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-500/20 shadow-lg shadow-amber-500/5">
                  <Settings size={40} className="text-amber-400 animate-spin-slow" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-extrabold text-text tracking-tight">Cafe Deactivated</h2>
                  <p className="text-muted text-lg leading-relaxed">
                    Your cafe account has been temporarily deactivated by the system administrator. 
                  </p>
                </div>
                <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl text-amber-400 font-semibold">
                  Please reach out to our support team to reactivate your account and resume services.
                </div>
                <div className="flex gap-4 flex-wrap justify-center">
                  <button 
                    onClick={() => window.location.href = 'mailto:thediningco.contact@gmail.com'}
                    className="px-8 py-3 bg-gradient-to-r from-primary to-primary/85 hover:from-primary/90 hover:to-primary/90 text-background font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300"
                  >
                    Contact Support
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="px-8 py-3 bg-surface/30 border border-border/40 text-muted hover:text-text font-bold rounded-xl hover:border-primary/30 transition-all duration-300"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : subscriptionExpired ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-6 max-w-2xl mx-auto">
                <div className="w-20 h-20 bg-rose-500/10 rounded-2xl flex items-center justify-center border border-rose-500/20 shadow-lg shadow-rose-500/5">
                  <X size={40} className="text-rose-400" strokeWidth={2.5} />
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-extrabold text-text tracking-tight">Subscription Expired</h2>
                  <p className="text-muted text-lg leading-relaxed">
                    Your subscription plan has ended. To continue managing your cafe and receiving orders, please contact support to renew your plan.
                  </p>
                </div>
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl text-primary font-semibold">
                  Access to your digital menu and admin features is currently restricted.
                </div>
                <button 
                  onClick={() => window.location.href = 'mailto:thediningco.contact@gmail.com'}
                  className="px-8 py-3 bg-gradient-to-r from-primary to-primary/85 hover:from-primary/90 hover:to-primary/90 text-background font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300"
                >
                  Renew Subscription
                </button>
              </div>
            ) : children}
          </main>
        </div>
      </div>
      <style jsx global>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes bounce-subtle {
          0%, 100% { transform: translate(-50%, 0); }
          50% { transform: translate(-50%, -5px); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}