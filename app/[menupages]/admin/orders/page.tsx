"use client";

import { useState, useEffect } from "react";
import { Package, Clock, Armchair, CheckCircle, Wallet, Smartphone, Loader2, ChevronDown, MessageSquare } from "lucide-react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import useSWR, { mutate } from "swr";

// ─── Types ───
type OrderItem = {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
};

type PaymentMethod = "cash" | "upi";
type OrderStatus = "pending" | "preparing" | "ready" | "served" | "cancelled";

type Order = {
  _id: string;
  orderNumber: number;
  createdAt: string;
  tableNumber: string;
  total: number;
  discount?: number;
  discountCode?: string;
  orderStatus: OrderStatus;
  paymentMethod: PaymentMethod;
  items: OrderItem[];
  specialInstructions?: string;
  notes?: string;
};

// Helper to get payment method badge styles
const getPaymentBadge = (method: PaymentMethod) => {
  if (method === "upi") {
    return {
      icon: Smartphone,
      bgColor: "bg-purple-100",
      textColor: "text-purple-700",
      borderColor: "border-purple-200",
      label: "UPI"
    };
  } else {
    return {
      icon: Wallet,
      bgColor: "bg-amber-100",
      textColor: "text-amber-800",
      borderColor: "border-amber-200",
      label: "Cash"
    };
  }
};

// ─── Component for Individual Card ───
function OrderCard({ 
  order, 
  onMarkAsServed,
  onMoveToPayment,
  isUpdating
}: { 
  order: Order; 
  onMarkAsServed?: (orderId: string) => void;
  onMoveToPayment?: (orderId: string) => void;
  isUpdating?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const isPreparing = order.orderStatus === "preparing" || order.orderStatus === "ready";
  const paymentBadge = getPaymentBadge(order.paymentMethod);
  const PaymentIcon = paymentBadge.icon;
  
  const showExpandButton = order.items.length > 3;
  const visibleItems = showExpandButton && !expanded ? order.items.slice(0, 2) : order.items;
  const remainingCount = order.items.length - 2;

  const handleMarkAsServed = () => {
    if (onMarkAsServed) {
      onMarkAsServed(order._id);
    }
  };

  const handleMoveToPayment = () => {
    if (onMoveToPayment) {
      onMoveToPayment(order._id);
    }
  };

  // Format time
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`bg-[#FBF8F3] border border-[#E5DFD4] rounded-2xl p-4 mb-4 hover:border-primary/40 transition-all duration-300 shadow-sm ${isUpdating ? 'opacity-60 pointer-events-none' : ''}`}>
      {/* Header */}
      <div className="flex flex-col xs:flex-row items-start justify-between gap-3 mb-4">
        <div className="flex items-start gap-3 w-full xs:w-auto">
          {/* Icon Circle */}
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 border border-primary/20">
            <Package size={18} className="text-primary" strokeWidth={2} />
          </div>
          
          {/* Text Details */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-bold text-text text-sm sm:text-base tracking-tight truncate">
                Order #{order.orderNumber}
              </h4>
              
              {/* Payment Method Badge */}
              <div className={`flex items-center gap-1 px-2 py-0.5 rounded-lg ${paymentBadge.bgColor} ${paymentBadge.textColor} border ${paymentBadge.borderColor} text-[10px] font-bold whitespace-nowrap`}>
                <PaymentIcon size={10} strokeWidth={2.5} />
                <span>{paymentBadge.label}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-muted font-medium mt-0.5 flex-wrap">
              <div className="flex items-center gap-1">
                <Clock size={12} />
                <span>{formatTime(order.createdAt)}</span>
              </div>
              <span className="text-muted/60">•</span>
              <div className="flex items-center gap-1">
                <Armchair size={12} />
                <span>Table {order.tableNumber}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Price & Action Buttons */}
        <div className="flex items-center justify-between xs:justify-end gap-3 w-full xs:w-auto mt-2 xs:mt-0">
          <div className="flex flex-col items-start xs:items-end">
            <span className="font-extrabold text-text text-sm sm:text-base tracking-tight">
              ₹{order.total.toFixed(2)}
            </span>
            {order.discount && order.discount > 0 ? (
              <span className="text-[9px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.2 rounded-md mt-0.5">
                🏷️ {order.discountCode || 'Promo'} (-₹{order.discount})
              </span>
            ) : null}
          </div>
          
          {isPreparing ? (
            /* Mark as Served Button */
            <button
              onClick={handleMarkAsServed}
              disabled={isUpdating}
              className="flex items-center gap-1 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] sm:text-xs font-bold transition-all duration-300 shadow-md whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle size={12} />
              <span>Mark as Served</span>
            </button>
          ) : (
            /* Move to Payment Button */
            <button
              onClick={handleMoveToPayment}
              disabled={isUpdating}
              className="p-1.5 sm:p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all duration-300 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              title="Move to Payment Completed"
            >
              <CheckCircle size={16} strokeWidth={2} />
            </button>
          )}
        </div>
      </div>

      {/* Items List */}
      <div className="space-y-1.5 sm:space-y-2">
        {visibleItems.map((item, idx) => (
          <div
            key={`${order._id}-${idx}`}
            className="bg-white rounded-xl px-3 py-2 sm:py-2.5 flex items-center justify-between border border-[#E5DFD4] hover:border-primary/40 transition-all duration-300 shadow-sm"
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="w-5 h-5 rounded-lg bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center flex-shrink-0 border border-primary/20">
                {item.quantity}
              </span>
              <span className="text-xs sm:text-sm font-semibold text-text truncate">
                {item.name}
              </span>
            </div>
            <span className="text-xs sm:text-sm font-bold text-muted whitespace-nowrap ml-2">
              ₹{(item.price * item.quantity).toFixed(2)}
            </span>
          </div>
        ))}
        
        {showExpandButton && !expanded && remainingCount > 0 && (
          <div className="text-[10px] sm:text-xs text-muted/60 italic px-1 font-medium">
            +{remainingCount} more item{remainingCount > 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* ─── Customer Special Request / Note ─── */}
      {(order.specialInstructions || order.notes) && (
        <div className="mt-2.5 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 flex items-start gap-2.5">
          <MessageSquare size={14} className="mt-0.5 text-amber-700 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-amber-800">
                Customer Request / Note
              </span>
              <span className="text-[10px] text-amber-800 font-semibold bg-amber-100 px-1.5 py-0.2 rounded border border-amber-300">
                Table {order.tableNumber}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-text font-medium mt-1 whitespace-pre-wrap leading-relaxed">
              {order.specialInstructions || order.notes}
            </p>
          </div>
        </div>
      )}

      {/* Expand/Collapse Toggle */}
      {showExpandButton && (
        <div className="mt-3 pt-3 border-t border-[#E5DFD4]">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-center gap-1.5 py-1 text-[11px] sm:text-xs font-medium text-primary hover:text-primary-hover transition-colors duration-200 rounded-lg hover:bg-primary/5"
          >
            <span>{expanded ? 'Show Less' : 'View Details'}</span>
            <ChevronDown size={14} className={`transform transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Orders Skeleton Loader ───
const OrdersSkeleton = () => {
  return (
    <div className="animate-pulse space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-[#FBF8F3] border border-border rounded-2xl p-4 mb-4 h-40 shadow-sm">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-surface flex-shrink-0"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 w-24 bg-surface rounded"></div>
              <div className="h-3 w-32 bg-surface rounded"></div>
            </div>
            <div className="h-8 w-20 bg-surface rounded"></div>
          </div>
          <div className="space-y-2">
            <div className="h-10 w-full bg-surface rounded-xl"></div>
            <div className="h-10 w-full bg-surface rounded-xl"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── Main Page Component ───
export default function OrdersPage() {
  const params = useParams();
  const slug = params?.menupages as string;
  const { toast } = useToast();
  
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"pending" | "served">("pending");
  const [isMobile, setIsMobile] = useState(false);

  // Fetch both preparing/ready and served orders - only those that haven't paid yet
  const preparingUrl = slug ? `/api/orders/${slug}?status=preparing,ready&paymentStatus=pending` : null;
  const servedUrl = slug ? `/api/orders/${slug}?status=served&paymentStatus=pending` : null;

  const { data: preparingData, isLoading: preparingLoading } = useSWR(preparingUrl, {
    refreshInterval: 10000,
    revalidateOnFocus: true,
    keepPreviousData: true,
  });

  const { data: servedData, isLoading: servedLoading } = useSWR(servedUrl, {
    refreshInterval: 10000,
    revalidateOnFocus: true,
    keepPreviousData: true,
  });

  const pendingOrders = preparingData?.success ? (preparingData.data as Order[]) : [];
  const servedOrders = servedData?.success ? (servedData.data as Order[]) : [];
  const loading = preparingLoading || servedLoading;

  // Check if mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleMarkAsServed = async (orderId: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/orders/${slug}?id=${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderStatus: "served" }),
      });
      const data = await res.json();
      if (data.success) {
        toast({
          title: "Order Served",
          description: `Order #${pendingOrders.find(o => o._id === orderId)?.orderNumber} marked as served.`,
        });
        
        mutate(preparingUrl);
        mutate(servedUrl);
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to update order",
        variant: "destructive",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleMoveToPayment = async (orderId: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/orders/${slug}?id=${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus: "completed" }),
      });
      const data = await res.json();
      if (data.success) {
        toast({
          title: "Payment Completed",
          description: `Order #${servedOrders.find(o => o._id === orderId)?.orderNumber} moved to payment completed.`,
        });
        
        mutate(servedUrl);
      } else {
        throw new Error(data.message || "Failed to update payment status");
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to update order",
        variant: "destructive",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E5DFD4] p-4 sm:p-6 w-full min-h-[600px] shadow-sm overflow-x-hidden">
      
      {/* ─── Top Header ─── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 text-primary shadow-sm">
            <Package className="w-4 h-4" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-text tracking-tight">
            Orders Management
          </h2>
          {loading && <Loader2 size={16} className="animate-spin text-muted" />}
        </div>
        
        {/* Summary Badges */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => setMobileView("served")}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 ${
              mobileView === "served" && isMobile
                ? 'bg-emerald-600 text-white shadow-md' 
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <CheckCircle size={16} />
            <span>{servedOrders.length} Served</span>
          </button>
          <button
            onClick={() => setMobileView("pending")}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 ${
              mobileView === "pending" && isMobile
                ? 'bg-amber-500 text-white shadow-md' 
                : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            <Clock size={16} />
            <span>{pendingOrders.length} Preparing</span>
          </button>
        </div>
      </div>

      {/* ─── Mobile View ─── */}
      <div className="block lg:hidden">
        {loading && pendingOrders.length === 0 && servedOrders.length === 0 ? (
          <OrdersSkeleton />
        ) : mobileView === "pending" ? (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Clock size={18} className="text-amber-600" />
              <h3 className="font-bold text-base text-text">Preparing Orders</h3>
            </div>
            <div className="flex flex-col">
              {pendingOrders.map((order, index) => (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <OrderCard 
                    order={order} 
                    onMarkAsServed={handleMarkAsServed}
                    isUpdating={updatingId === order._id}
                  />
                </motion.div>
              ))}
              {pendingOrders.length === 0 && (
                <div className="text-center py-12 text-muted bg-[#FBF8F3] rounded-2xl border border-[#E5DFD4]">
                  <Package size={32} className="mx-auto mb-2 opacity-40 text-primary" />
                  <p className="text-sm font-medium">No orders in preparation</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle size={18} className="text-emerald-600" />
              <h3 className="font-bold text-base text-text">Served Orders</h3>
            </div>
            <div className="flex flex-col">
              {servedOrders.map((order, index) => (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <OrderCard 
                    order={order} 
                    onMoveToPayment={handleMoveToPayment}
                    isUpdating={updatingId === order._id}
                  />
                </motion.div>
              ))}
              {servedOrders.length === 0 && (
                <div className="text-center py-12 text-muted bg-[#FBF8F3] rounded-2xl border border-[#E5DFD4]">
                  <Package size={32} className="mx-auto mb-2 opacity-40 text-primary" />
                  <p className="text-sm font-medium">No served orders</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ─── Desktop View ─── */}
      <div className="hidden lg:grid lg:grid-cols-2 gap-6">
        {loading && pendingOrders.length === 0 && servedOrders.length === 0 ? (
          <>
            <OrdersSkeleton />
            <OrdersSkeleton />
          </>
        ) : (
          <>
            {/* Column 1: Pending */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Clock size={18} className="text-amber-600" />
                <h3 className="font-bold text-base text-text">Preparing Orders</h3>
              </div>
              <div className="flex flex-col">
                {pendingOrders.map((order, index) => (
                  <motion.div
                    key={order._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <OrderCard 
                      order={order} 
                      onMarkAsServed={handleMarkAsServed}
                      isUpdating={updatingId === order._id}
                    />
                  </motion.div>
                ))}
                {pendingOrders.length === 0 && (
                  <div className="text-center py-12 text-muted bg-[#FBF8F3] rounded-2xl border border-[#E5DFD4]">
                    <Package size={32} className="mx-auto mb-2 opacity-40 text-primary" />
                    <p className="text-sm font-medium">No orders in preparation</p>
                  </div>
                )}
              </div>
            </div>

            {/* Column 2: Served */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle size={18} className="text-emerald-600" />
                <h3 className="font-bold text-base text-text">Served Orders</h3>
              </div>
              <div className="flex flex-col">
                {servedOrders.map((order, index) => (
                  <motion.div
                    key={order._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <OrderCard 
                      order={order} 
                      onMoveToPayment={handleMoveToPayment}
                      isUpdating={updatingId === order._id}
                    />
                  </motion.div>
                ))}
                {servedOrders.length === 0 && (
                  <div className="text-center py-12 text-muted bg-[#FBF8F3] rounded-2xl border border-[#E5DFD4]">
                    <Package size={32} className="mx-auto mb-2 opacity-40 text-primary" />
                    <p className="text-sm font-medium">No served orders</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}