"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle, 
  CheckCircle2, 
  ShoppingBag, 
  Clock, 
  PartyPopper,
  XCircle,
  AlertCircle,
  X,
  MessageSquare
} from "lucide-react";
import { Suspense, useEffect, useState, useRef } from "react";
import useSWR from "swr";
import { getPusherClient } from "@/lib/pusher-client";
import CustomerRatingCard from "@/components/CustomerRatingCard";

// Pleasant 2-tone harmonic confirmation chime
function playPaymentSuccessChime() {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    
    // Tone 1: E5 (659.25 Hz)
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

    // Tone 2: A5 (880 Hz)
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

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// For Next.js 15, we need to handle params as a Promise
type PageProps = {
  params: { menupages: string }
}

function OrderConfirmationContent({ menupages }: { menupages: string }) {
  const searchParams = useSearchParams();
  const orderNumberParam = searchParams.get('orderNumber');
  const tableParam = searchParams.get('table');

  const [orderNumber, setOrderNumber] = useState<string | null>(orderNumberParam);
  const [tableNumber, setTableNumber] = useState<string | null>(tableParam);
  const [specialInstructions, setSpecialInstructions] = useState<string>('');
  const [orderStatus, setOrderStatus] = useState<string>('pending');
  const [paymentStatus, setPaymentStatus] = useState<string>('pending');
  const [orderTotal, setOrderTotal] = useState<number>(0);
  const [isRejected, setIsRejected] = useState<boolean>(false);
  const [rejectionMessage, setRejectionMessage] = useState<string>('');
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const hasNotifiedPayment = useRef<boolean>(false);

  // Hydrate orderNumber and tableNumber from storage if missing
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const rawLatest = window.localStorage.getItem(`sd:latestOrder:${menupages}`);
      if (rawLatest) {
        const parsed = JSON.parse(rawLatest);
        if (parsed.orderNumber && !orderNumber) setOrderNumber(String(parsed.orderNumber));
        if (parsed.tableNumber && !tableNumber) setTableNumber(String(parsed.tableNumber));
        if (parsed.specialInstructions) setSpecialInstructions(String(parsed.specialInstructions));
        if (parsed.status === 'cancelled') {
          setIsRejected(true);
          setOrderStatus('cancelled');
        }
      }
      const rawCheckout = window.sessionStorage.getItem(`sd:checkout:${menupages}`);
      if (rawCheckout) {
        const parsed = JSON.parse(rawCheckout);
        if (parsed.tableNumber && !tableNumber) setTableNumber(String(parsed.tableNumber));
        if (parsed.specialInstructions && !specialInstructions) setSpecialInstructions(String(parsed.specialInstructions));
      }
    } catch {}
  }, [menupages, orderNumber, tableNumber, specialInstructions]);

  // Status check with SWR (polling every 3 seconds as a reliable backup)
  const { data: statusData } = useSWR(
    menupages && orderNumber ? `/api/orders/${menupages}/status?orderNumber=${orderNumber}` : null,
    fetcher,
    {
      refreshInterval: isRejected ? 0 : 3000,
      revalidateOnFocus: true,
    }
  );

  // Sync status updates from API
  useEffect(() => {
    if (statusData?.success && statusData.data) {
      const data = statusData.data;
      if (data.tableNumber && !tableNumber) {
        setTableNumber(String(data.tableNumber));
      }
      if (data.orderStatus) {
        setOrderStatus(data.orderStatus);
      }
      if (data.total) {
        setOrderTotal(Number(data.total));
      }
      if (data.specialInstructions || data.notes) {
        setSpecialInstructions(data.specialInstructions || data.notes);
      }
      if (data.paymentStatus) {
        setPaymentStatus(data.paymentStatus);
        if (data.paymentStatus === 'completed' && !hasNotifiedPayment.current) {
          hasNotifiedPayment.current = true;
          setShowPaymentModal(true);
          playPaymentSuccessChime();
        }
      }
      if (data.isRejected || data.orderStatus === 'cancelled') {
        setIsRejected(true);
        if (data.message) {
          setRejectionMessage(data.message);
        }
        try {
          const raw = window.localStorage.getItem(`sd:latestOrder:${menupages}`);
          if (raw) {
            const parsed = JSON.parse(raw);
            window.localStorage.setItem(`sd:latestOrder:${menupages}`, JSON.stringify({ ...parsed, status: 'cancelled' }));
          }
        } catch {}
      }
    }
  }, [statusData, menupages, tableNumber]);

  // Real-time listener via Pusher for table and order channels
  useEffect(() => {
    if (!menupages) return;
    const pusher = getPusherClient();
    if (!pusher) return;

    const channels: any[] = [];

    const handleUpdate = (data: any) => {
      if (data.orderNumber && orderNumber && String(data.orderNumber) !== String(orderNumber)) {
        return;
      }
      if (data.orderStatus) {
        setOrderStatus(data.orderStatus);
      }
      if (data.tableNumber && !tableNumber) {
        setTableNumber(String(data.tableNumber));
      }
      if (data.total) {
        setOrderTotal(Number(data.total));
      }
      if (data.paymentStatus) {
        setPaymentStatus(data.paymentStatus);
      }
      if (data.isPaymentCompleted || data.isPaymentReceived || data.paymentStatus === 'completed') {
        setPaymentStatus('completed');
        if (!hasNotifiedPayment.current) {
          hasNotifiedPayment.current = true;
          setShowPaymentModal(true);
          playPaymentSuccessChime();
        }
        try {
          const raw = window.localStorage.getItem(`sd:latestOrder:${menupages}`);
          if (raw) {
            const parsed = JSON.parse(raw);
            window.localStorage.setItem(`sd:latestOrder:${menupages}`, JSON.stringify({ ...parsed, paymentStatus: 'completed' }));
          }
        } catch {}
      }
      if (data.isRejected || data.orderStatus === 'cancelled') {
        setIsRejected(true);
        setOrderStatus('cancelled');
        if (data.message) {
          setRejectionMessage(data.message);
        }
        try {
          const raw = window.localStorage.getItem(`sd:latestOrder:${menupages}`);
          if (raw) {
            const parsed = JSON.parse(raw);
            window.localStorage.setItem(`sd:latestOrder:${menupages}`, JSON.stringify({ ...parsed, status: 'cancelled' }));
          }
        } catch {}
      }
    };

    // 1. Order channel
    if (orderNumber) {
      const orderChannel = pusher.subscribe(`order-${orderNumber}`);
      orderChannel.bind('order-status-updated', handleUpdate);
      orderChannel.bind('payment-received', handleUpdate);
      channels.push(orderChannel);
    }

    // 2. Table channel
    if (tableNumber) {
      const cleanTable = String(tableNumber).trim();
      const tableChannel = pusher.subscribe(`cafe-${menupages}-table-${cleanTable}`);
      tableChannel.bind('order-status-updated', handleUpdate);
      tableChannel.bind('payment-received', handleUpdate);
      channels.push(tableChannel);
    }

    // 3. Cafe-level channel as fallback
    const cafeChannel = pusher.subscribe(`cafe-${menupages}`);
    cafeChannel.bind('order-status-updated', handleUpdate);
    cafeChannel.bind('payment-received', handleUpdate);
    channels.push(cafeChannel);

    return () => {
      channels.forEach(ch => {
        try {
          ch.unbind('order-status-updated', handleUpdate);
        } catch {}
      });
    };
  }, [menupages, orderNumber, tableNumber]);

  if (isRejected) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-md mx-auto bg-[#FBF8F3] min-h-screen shadow-xl border-x border-[#E5DFD4]">
          <div className="p-8 flex flex-col items-center justify-center min-h-screen">
            {/* Rejected Icon */}
            <motion.div 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="w-24 h-24 bg-rose-500/10 rounded-2xl mb-6 flex items-center justify-center border border-rose-500/20 shadow-lg shadow-rose-500/10"
            >
              <XCircle className="w-12 h-12 text-rose-500" />
            </motion.div>
            
            {/* Title */}
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-2xl font-bold text-rose-400 tracking-tight text-center"
            >
              Your Order is Rejected
            </motion.h1>
            
            {/* Order & Table Badges */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="flex items-center gap-2 mt-2 flex-wrap justify-center"
            >
              {orderNumber && (
                <span className="text-sm text-rose-300 font-mono bg-rose-500/10 border border-rose-500/20 rounded-xl px-3.5 py-1.5">
                  Order #{orderNumber}
                </span>
              )}
              {tableNumber && (
                <span className="text-sm text-amber-300 font-medium bg-amber-500/10 border border-amber-500/20 rounded-xl px-3.5 py-1.5">
                  Table {tableNumber}
                </span>
              )}
            </motion.div>
            
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-sm text-muted/70 text-center mt-3 max-w-xs"
            >
              {rejectionMessage || `Your order for Table ${tableNumber || ''} has been rejected by the restaurant.`}
            </motion.p>

            {/* Rejection Notice Box */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="w-full bg-rose-500/5 border border-rose-500/20 rounded-xl p-4 mt-6"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20 flex-shrink-0">
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-rose-400 mb-1">Order Status</h3>
                  <p className="text-xs text-rose-300/80 leading-relaxed">
                    This order could not be accepted by the kitchen. If you need assistance, please speak with the staff at <span className="font-bold text-rose-200">Table {tableNumber || ''}</span> or place a new order below.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Actions */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="w-full space-y-3 mt-6"
            >
              <Link
                href={`/${menupages}/menu`}
                className="block w-full bg-primary hover:bg-primary-hover text-white text-center py-3.5 rounded-xl font-bold transition-all duration-300 shadow-md shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98]"
              >
                <ShoppingBag className="w-5 h-5 inline mr-2" />
                Place a New Order
              </Link>
            </motion.div>

            {/* Footer */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-8 text-center"
            >
              <div className="flex items-center justify-center gap-2 text-xs text-muted/40">
                <span className="w-1 h-1 bg-primary/30 rounded-full"></span>
                <span>The Dining Co.</span>
                <span className="w-1 h-1 bg-primary/30 rounded-full"></span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto bg-[#FBF8F3] min-h-screen shadow-xl border-x border-[#E5DFD4]">
        <div className="p-8 flex flex-col items-center justify-center min-h-screen">
          {/* Success Icon */}
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="w-24 h-24 bg-emerald-100 rounded-3xl mb-6 flex items-center justify-center border border-emerald-200 shadow-md text-emerald-600"
          >
            <CheckCircle className="w-12 h-12" />
          </motion.div>
          
          {/* Title */}
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-2xl font-bold text-text tracking-tight text-center"
          >
            Order Confirmed!
          </motion.h1>
          
          {/* Order & Table Badges */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex items-center gap-2 mt-2 flex-wrap justify-center"
          >
            {orderNumber && (
              <span className="text-sm text-primary font-mono bg-primary/10 border border-primary/25 rounded-xl px-4 py-2 font-bold">
                Order #{orderNumber}
              </span>
            )}
            {tableNumber && (
              <span className="text-sm text-amber-800 font-semibold bg-amber-100 border border-amber-300 rounded-xl px-3.5 py-2">
                Table {tableNumber}
              </span>
            )}
            {paymentStatus === 'completed' ? (
              <motion.span 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-sm text-emerald-700 font-bold bg-emerald-100 border border-emerald-300 rounded-xl px-3.5 py-2 flex items-center gap-1.5 shadow-sm"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Payment Received
              </motion.span>
            ) : (
              <span className="text-sm text-amber-800 font-medium bg-amber-100 border border-amber-300 rounded-xl px-3 py-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                Payment Pending
              </span>
            )}
          </motion.div>

          {/* Payment Received Confirmation Banner */}
          {paymentStatus === 'completed' && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="w-full bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mt-4 text-left flex items-start gap-3 shadow-sm"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 flex-shrink-0 mt-0.5">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-bold text-emerald-800">Payment Confirmed by Cafe</h4>
                  {orderTotal > 0 && (
                    <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200">
                      ₹{orderTotal}
                    </span>
                  )}
                </div>
                <p className="text-xs text-emerald-700 mt-0.5 leading-relaxed">
                  Your payment has been received and confirmed by the counter. Thank you!
                </p>
              </div>
            </motion.div>
          )}
          
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm text-muted text-center mt-3 max-w-xs"
          >
            Your order has been placed successfully. We'll notify you when it's ready.
          </motion.p>

          {/* Estimated Time */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="w-full bg-white border border-[#E5DFD4] rounded-2xl p-4 mt-6 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 flex-shrink-0 text-primary">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-text mb-1">Estimated Time</h3>
                <p className="text-xs text-muted">
                  Your order will be ready in approximately 15-20 minutes.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Kitchen Request / Special Instructions Note */}
          {specialInstructions && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28 }}
              className="w-full bg-amber-500/10 border border-amber-500/25 rounded-2xl p-4 mt-3 text-left shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-800 flex-shrink-0 mt-0.5">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[11px] font-bold tracking-wider uppercase text-amber-800/80">Kitchen Request Sent</span>
                  <p className="text-sm font-semibold text-amber-950 mt-0.5 break-words italic">
                    &ldquo;{specialInstructions}&rdquo;
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Customer Rating & Feedback Card */}
          <div id="customer-rating-section" className="w-full">
            <CustomerRatingCard 
              cafeSlug={menupages} 
              orderNumber={orderNumber} 
              tableNumber={tableNumber} 
              className="mt-6"
            />
          </div>

          {/* Real-time Payment Received Pop-up Modal */}
          <AnimatePresence>
            {showPaymentModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="w-full max-w-sm bg-white border border-[#E5DFD4] rounded-3xl p-6 text-center space-y-4 shadow-2xl relative overflow-hidden"
                >
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="absolute top-4 right-4 text-muted hover:text-text p-1 rounded-lg"
                    aria-label="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  {/* Animated Shield/Check Icon */}
                  <div className="w-16 h-16 bg-emerald-100 border border-emerald-200 rounded-2xl mx-auto flex items-center justify-center text-emerald-600 shadow-sm">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 border border-emerald-200 px-3 py-1 rounded-full inline-block">
                      Payment Confirmed
                    </span>
                    <h3 className="text-2xl font-black text-text tracking-tight">Payment Received! 🎉</h3>
                    <p className="text-xs text-muted max-w-xs mx-auto pt-1 leading-relaxed">
                      The restaurant has confirmed receipt of your payment. Thank you for dining with us!
                    </p>
                  </div>

                  <div className="bg-[#FBF8F3] border border-[#E5DFD4] rounded-2xl p-3 flex items-center justify-around text-xs">
                    <div>
                      <span className="text-[10px] text-muted uppercase block font-medium">Order</span>
                      <strong className="font-mono text-text text-sm">#{orderNumber}</strong>
                    </div>
                    <div className="w-px h-7 bg-[#E5DFD4]" />
                    <div>
                      <span className="text-[10px] text-muted uppercase block font-medium">Table</span>
                      <strong className="text-amber-800 text-sm">Table {tableNumber}</strong>
                    </div>
                    {orderTotal > 0 && (
                      <>
                        <div className="w-px h-7 bg-[#E5DFD4]" />
                        <div>
                          <span className="text-[10px] text-muted uppercase block font-medium">Amount</span>
                          <strong className="text-emerald-700 text-sm font-mono">₹{orderTotal}</strong>
                        </div>
                      </>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setShowPaymentModal(false);
                      const ratingEl = document.getElementById('customer-rating-section');
                      if (ratingEl) ratingEl.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="w-full py-3 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs shadow-lg shadow-primary/20 transition-all"
                  >
                    Rate Your Experience ⭐
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="w-full space-y-3 mt-6"
          >
            <Link
              href={`/${menupages}/menu`}
              className="block w-full bg-primary hover:bg-primary-hover text-white text-center py-3.5 rounded-xl font-bold transition-all duration-300 shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.98]"
            >
              <ShoppingBag className="w-5 h-5 inline mr-2" />
              Order More
            </Link>
          </motion.div>

          {/* Footer */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 text-center"
          >
            <div className="flex items-center justify-center gap-2 text-xs text-muted/40">
              <span className="w-1 h-1 bg-primary/30 rounded-full"></span>
              <span>Thank you for choosing The Dining Co.!</span>
              <span className="w-1 h-1 bg-primary/30 rounded-full"></span>
            </div>
            <div className="flex items-center justify-center gap-1 mt-2 text-[10px] text-muted/30">
              <PartyPopper className="w-3 h-3" />
              <span>Enjoy your meal!</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage({ params }: PageProps) {
  const { menupages } = params;
  
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background">
        <div className="max-w-md mx-auto bg-[#FBF8F3] min-h-screen flex items-center justify-center border-x border-[#E5DFD4]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm text-muted">Loading confirmation...</p>
          </div>
        </div>
      </div>
    }>
      <OrderConfirmationContent menupages={menupages} />
    </Suspense>
  );
}