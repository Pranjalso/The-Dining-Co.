"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Package, Clock, Armchair, Check, X, Wallet, Smartphone, Loader2, ChevronDown, Sparkles, Crown } from "lucide-react";
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
type PaymentStatus = "pending" | "completed" | "failed";

type Order = {
  _id: string;
  orderNumber: number;
  createdAt: string;
  tableNumber: string;
  total: number;
  items: OrderItem[];
  paymentMethod: PaymentMethod;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  upiId?: string;
};

// New Orders Skeleton Loader
const NewOrdersSkeleton = () => {
  return (
    <div className="bg-card/60 backdrop-blur-sm rounded-2xl border border-border/30 p-4 sm:p-6 w-full min-h-[600px] shadow-2xl shadow-primary/5 overflow-x-hidden">
      <div className="flex items-center justify-between mb-6">
        <div className="h-6 w-32 bg-surface/40 rounded animate-pulse"></div>
        <div className="h-6 w-16 bg-surface/40 rounded-full animate-pulse"></div>
      </div>
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-surface/20 rounded-2xl p-4 sm:p-5 border border-border/20">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-5">
              <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-surface/40 animate-pulse"></div>
                <div className="space-y-2">
                  <div className="h-4 w-40 bg-surface/40 rounded animate-pulse"></div>
                  <div className="h-3 w-32 bg-surface/40 rounded animate-pulse"></div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-6 w-16 bg-surface/40 rounded animate-pulse"></div>
                <div className="h-8 w-20 bg-surface/40 rounded-md animate-pulse"></div>
                <div className="h-8 w-20 bg-surface/40 rounded-md animate-pulse"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-12 bg-surface/30 rounded-xl animate-pulse"></div>
              <div className="h-12 bg-surface/30 rounded-xl animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function NewOrdersPage() {
  const params = useParams();
  const slug = params?.menupages as string;
  const { toast } = useToast();

  const [updating, setUpdating] = useState<string | null>(null);
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});

  const ordersUrl = slug ? `/api/orders/${slug}?status=pending` : null;
  const { data, isLoading: swrLoading } = useSWR(ordersUrl, {
    refreshInterval: 10000,
    revalidateOnFocus: true,
  });

  const orders = data?.success ? (data.data as Order[]) : [];
  const loading = swrLoading;

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    setUpdating(orderId);
    try {
      const res = await fetch(`/api/orders/${slug}?id=${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderStatus: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        toast({
          title: `Order ${newStatus === 'preparing' ? 'Accepted' : 'Rejected'}`,
          description: `Order #${orders.find(o => o._id === orderId)?.orderNumber} has been ${newStatus === 'preparing' ? 'accepted and moved to preparing' : 'cancelled'}.`,
        });
        
        mutate(ordersUrl);
        window.dispatchEvent(new Event('refresh-admin-stats'));
      } else {
        throw new Error(data.message || "Failed to update order");
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  // Helper to format time
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} mins ago`;
    const hours = Math.floor(diffMins / 60);
    if (hours < 24) return `${hours} hours ago`;
    return date.toLocaleDateString();
  };

  // Helper to get payment method badge styles
  const getPaymentBadge = (method: PaymentMethod) => {
    if (method === "upi") {
      return {
        icon: Smartphone,
        bgColor: "bg-purple-500/10",
        textColor: "text-purple-400",
        borderColor: "border-purple-500/20",
        label: "UPI"
      };
    } else {
      return {
        icon: Wallet,
        bgColor: "bg-amber-500/10",
        textColor: "text-amber-400",
        borderColor: "border-amber-500/20",
        label: "Cash"
      };
    }
  };

  if (loading && orders.length === 0) {
    return <NewOrdersSkeleton />;
  }

  return (
    <div className="bg-card/60 backdrop-blur-sm rounded-2xl border border-border/30 p-4 sm:p-6 w-full min-h-[600px] shadow-2xl shadow-primary/5 overflow-x-hidden">
      {/* ─── Page Title ─── */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
            <Package className="w-4 h-4 text-primary" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-text tracking-tight">
            New Orders
          </h2>
          {loading && <Loader2 size={16} className="animate-spin text-muted/60" />}
        </div>
        <span className="text-xs sm:text-sm bg-primary/10 text-primary border border-primary/20 px-3 py-1.5 rounded-lg font-semibold">
          {orders.length} New
        </span>
      </div>

      {/* ─── Orders List ─── */}
      <div className="flex flex-col gap-4 sm:gap-6">
        {orders.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="w-20 h-20 bg-surface/20 rounded-2xl flex items-center justify-center border border-border/30 mb-4">
              <Package size={40} className="text-muted/30" />
            </div>
            <p className="text-sm font-medium text-muted/60">No new orders at the moment</p>
            <p className="text-xs text-muted/40 mt-1">New orders will appear here automatically</p>
          </motion.div>
        )}

        {orders.map((order, index) => {
          const paymentBadge = getPaymentBadge(order.paymentMethod);
          const PaymentIcon = paymentBadge.icon;
          const isUpdating = updating === order._id;
          
          const isExpanded = !!expandedOrders[order._id];
          const showExpandButton = order.items.length > 3;
          const visibleItems = showExpandButton && !isExpanded ? order.items.slice(0, 2) : order.items;
          const remainingCount = order.items.length - 2;

          return (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={`bg-surface/20 border border-border/20 rounded-2xl p-4 sm:p-5 hover:border-primary/30 transition-all duration-300 ${isUpdating ? 'opacity-60 pointer-events-none' : ''}`}
            >
              {/* ─── Order Header ─── */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-5">
                
                {/* Left: Icon & Meta */}
                <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                  {/* Icon Circle */}
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 border border-primary/20">
                    <Package size={18} className="text-primary" strokeWidth={2} />
                  </div>
                  
                  {/* Text Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
                      <h3 className="text-text font-bold text-sm sm:text-lg tracking-tight">
                        Order #{order.orderNumber}
                      </h3>
                      
                      {/* Payment Method Badge */}
                      <div className={`flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg ${paymentBadge.bgColor} ${paymentBadge.textColor} border ${paymentBadge.borderColor} text-[10px] sm:text-xs font-bold whitespace-nowrap`}>
                        <PaymentIcon size={10} strokeWidth={2.5} />
                        <span>{paymentBadge.label}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-[10px] sm:text-sm text-muted/60 font-medium mt-0.5 sm:mt-1">
                      <div className="flex items-center gap-1">
                        <Clock size={12} />
                        <span>{formatTime(order.createdAt)}</span>
                      </div>
                      <span className="text-border/60">•</span>
                      <div className="flex items-center gap-1">
                        <Armchair size={12} />
                        <span>Table {order.tableNumber}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center justify-between lg:justify-end gap-3 w-full lg:w-auto mt-2 lg:mt-0 border-t lg:border-t-0 border-border/30 pt-3 lg:pt-0">
                  <span className="text-lg sm:text-xl font-extrabold text-text tracking-tight">
                    ₹{order.total.toFixed(2)}
                  </span>
                  
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    {/* Accept Button */}
                    <button
                      onClick={() => handleUpdateStatus(order._id, "preparing")}
                      disabled={isUpdating}
                      className="flex items-center gap-0.5 sm:gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-[10px] sm:text-sm font-bold transition-all duration-300 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Check size={12} strokeWidth={3} />
                      <span className="sm:inline">Accept</span>
                    </button>

                    {/* Reject Button */}
                    <button
                      onClick={() => handleUpdateStatus(order._id, "cancelled")}
                      disabled={isUpdating}
                      className="flex items-center gap-0.5 sm:gap-1.5 bg-transparent border border-rose-500/50 text-rose-400 hover:bg-rose-500/10 hover:border-rose-500 px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-[10px] sm:text-sm font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <X size={12} strokeWidth={3} />
                      <span className="sm:inline">Reject</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* ─── Order Items ─── */}
              <div className="space-y-1.5 sm:space-y-2">
                {visibleItems.map((item, itemIndex) => (
                  <div
                    key={`${order._id}-${item.menuItemId}-${itemIndex}`}
                    className="bg-surface/30 rounded-xl px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between border border-border/20 hover:border-primary/30 transition-all duration-300"
                  >
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                      {/* Quantity Badge */}
                      <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-primary/10 text-primary text-[10px] sm:text-xs font-bold flex items-center justify-center flex-shrink-0 border border-primary/20">
                        {item.quantity}
                      </span>
                      <span className="text-xs sm:text-sm font-semibold text-text truncate">
                        {item.name}
                      </span>
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-muted/80 whitespace-nowrap ml-2">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
                
                {showExpandButton && !isExpanded && remainingCount > 0 && (
                  <div className="text-[10px] sm:text-xs text-muted/40 italic px-1">
                    +{remainingCount} more item{remainingCount > 1 ? 's' : ''}
                  </div>
                )}
              </div>

              {/* ─── Expand/Collapse Toggle ─── */}
              {showExpandButton && (
                <div className="mt-4 pt-3 border-t border-border/20">
                  <button
                    onClick={() => setExpandedOrders(prev => ({ ...prev, [order._id]: !isExpanded }))}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 text-[11px] sm:text-xs font-medium text-primary/70 hover:text-primary transition-colors duration-200 rounded-lg hover:bg-primary/5"
                  >
                    <span>{isExpanded ? 'Show Less' : 'View Details'}</span>
                    <ChevronDown size={14} className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}