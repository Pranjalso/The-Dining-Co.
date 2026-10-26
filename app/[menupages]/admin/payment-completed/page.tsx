"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Package, 
  Clock, 
  Armchair, 
  Wallet, 
  CreditCard, 
  IndianRupee, 
  ChevronDown, 
  Search, 
  Calendar, 
  Loader2, 
  CalendarDays, 
  MessageSquare,
  Star
} from "lucide-react";
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

type Order = {
  _id: string;
  orderNumber: number;
  createdAt: string;
  tableNumber: string;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: "pending" | "completed" | "failed" | "refunded";
  items: OrderItem[];
  specialInstructions?: string;
  notes?: string;
};

// ─── Get today's date in YYYY-MM-DD format ───
function getTodayDateString() {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

function getYesterdayDateString() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
}

// Date filter options
type DateFilterOption = "today" | "yesterday" | "7d" | "30d" | "overall";

// ─── Component for Individual Order Card ───
function OrderCard({ order, rating }: { order: Order; rating?: any }) {
  const [expanded, setExpanded] = useState(false);

  const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const showExpandButton = order.items.length > 3;
  const remainingItems = order.items.length - 2;

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-[#FBF8F3] border border-border rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-3 sm:mb-4 hover:border-primary transition-all duration-300 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-3 mb-2 sm:mb-3">
        <div className="flex items-start gap-2 sm:gap-3 w-full">
          {/* Icon Circle */}
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 border border-primary/20">
            <Package size={14} className="text-primary" strokeWidth={2} />
          </div>
          
          {/* Order Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <h4 className="font-bold text-text text-xs sm:text-base tracking-tight truncate max-w-[120px] sm:max-w-full">
                Order #{order.orderNumber}
              </h4>
              <span className="px-1.5 sm:px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[8px] sm:text-[10px] font-bold whitespace-nowrap">
                {order.paymentStatus}
              </span>
              {rating && (
                <span className="px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded-full text-[8px] sm:text-[10px] font-bold flex items-center gap-1">
                  <Star size={10} className="fill-primary" />
                  <span>{rating.rating}.0</span>
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-1 text-[9px] sm:text-xs text-muted font-medium mt-0.5 sm:mt-1 whitespace-nowrap">
              <Clock size={10} className="flex-shrink-0" />
              <span className="flex-shrink-0">{formatTime(order.createdAt)}</span>
              <span className="text-border flex-shrink-0">•</span>
              <span className="flex-shrink-0">{formatDate(order.createdAt)}</span>
              <span className="text-border flex-shrink-0">•</span>
              <Armchair size={10} className="flex-shrink-0" />
              <span className="flex-shrink-0 truncate max-w-[70px] sm:max-w-full">Table {order.tableNumber}</span>
            </div>
          </div>

          {/* Payment Method Badge & Total */}
          <div className="flex flex-col items-end gap-0.5 sm:gap-1 flex-shrink-0">
            <div className={`
              flex items-center gap-1 px-2 sm:px-3 py-0.5 sm:py-1.5 rounded-lg text-[8px] sm:text-xs font-bold whitespace-nowrap border
              ${order.paymentMethod === 'upi'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                : 'bg-amber-50 text-amber-700 border-amber-200'}
            `}>
              {order.paymentMethod === 'upi' ? (
                <CreditCard size={10} />
              ) : (
                <Wallet size={10} />
              )}
              {order.paymentMethod === 'upi' ? 'UPI' : 'Cash'}
            </div>
            <span className="font-extrabold text-text text-xs sm:text-lg tracking-tight">
              ₹{order.total.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Customer Rating Feedback Snippet */}
      {rating?.feedback && (
        <div className="bg-white rounded-md sm:rounded-xl p-2 sm:p-2.5 mb-1 sm:mb-2 border border-border text-[9px] sm:text-xs text-text italic flex items-center gap-1.5 shadow-sm">
          <Star size={11} className="text-primary fill-primary flex-shrink-0" />
          <span className="truncate">&ldquo;{rating.feedback}&rdquo;</span>
        </div>
      )}

      {/* Items Summary */}
      <div className="bg-white rounded-md sm:rounded-xl p-2 sm:p-3 mb-1 sm:mb-2 border border-border shadow-sm">
        <div className="flex items-center justify-between mb-1 sm:mb-2">
          <span className="text-[9px] sm:text-xs font-semibold text-muted">
            {order.items.length} items · {totalQuantity} quantity
          </span>
          {showExpandButton && (
            <button 
              onClick={() => setExpanded(!expanded)}
              className="text-[9px] sm:text-xs font-medium text-primary hover:text-primary-hover transition-colors flex items-center gap-0.5 sm:gap-1"
            >
              {expanded ? 'Show less' : 'View details'}
              <ChevronDown size={10} className={`transform transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>
        
        <div className={`space-y-1 overflow-hidden transition-all duration-300 ${(!showExpandButton || expanded) ? 'max-h-96' : 'max-h-12 sm:max-h-14'}`}>
          {(!showExpandButton || expanded) ? (
            order.items.map((item: any, idx) => (
              <div key={idx} className="flex items-center justify-between text-[9px] sm:text-xs py-0.5 sm:py-1 border-b border-border/50 last:border-0">
                <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-1">
                  <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-lg bg-primary/10 text-primary text-[7px] sm:text-[10px] font-bold flex items-center justify-center flex-shrink-0 border border-primary/20">
                    {item.quantity}
                  </span>
                  <span className="font-medium text-text truncate">{item.name}</span>
                </div>
                <span className="font-semibold text-muted whitespace-nowrap ml-1 sm:ml-2">₹{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))
          ) : (
            <>
              {order.items.slice(0, 2).map((item: any, idx) => (
                <div key={idx} className="flex items-center justify-between text-[8px] sm:text-xs">
                  <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-1">
                    <span className="w-3 h-3 sm:w-4 sm:h-4 rounded-lg bg-primary/10 text-primary text-[6px] sm:text-[8px] font-bold flex items-center justify-center flex-shrink-0 border border-primary/20">
                      {item.quantity}
                    </span>
                    <span className="text-text truncate">{item.name}</span>
                  </div>
                  <span className="text-muted whitespace-nowrap ml-1">₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              {remainingItems > 0 && (
                <div className="text-[9px] sm:text-xs text-muted italic mt-0.5">
                  +{remainingItems} more item{remainingItems > 1 ? 's' : ''}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ─── Customer Special Request / Note ─── */}
      {(order.specialInstructions || order.notes) && (
        <div className="bg-amber-50 border border-amber-200 rounded-md sm:rounded-xl p-2 sm:p-2.5 mb-1 sm:mb-2 flex items-start gap-2">
          <MessageSquare size={12} className="mt-0.5 text-amber-600 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-amber-700 block">
              Customer Note (Table {order.tableNumber}):
            </span>
            <p className="text-[10px] sm:text-xs text-text font-medium mt-0.5 whitespace-pre-wrap">
              {order.specialInstructions || order.notes}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Orders Skeleton Loader ───
const OrdersSkeleton = () => {
  return (
    <div className="animate-pulse space-y-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-[#FBF8F3] border border-border rounded-2xl p-4 mb-4 h-32 shadow-sm">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-surface flex-shrink-0"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 w-24 bg-surface rounded"></div>
              <div className="h-3 w-32 bg-surface rounded"></div>
            </div>
            <div className="h-8 w-20 bg-surface rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── Main Page Component ───
export default function PaymentCompletedPage() {
  const params = useParams();
  const slug = params?.menupages as string;
  const searchParams = useSearchParams();
  const orderIdParam = searchParams.get('orderId');
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState<DateFilterOption>("today");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Generate the URL based on filters
  const getOrdersUrl = () => {
    if (!slug) return null;

    let url = `/api/orders/${slug}?paymentStatus=completed`;
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    if (dateFilter === "yesterday") {
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      url += `&date=${yesterday.toISOString().split('T')[0]}`;
    } else if (dateFilter === "7d") {
      const endDate = new Date(today);
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - 6);
      url += `&startDate=${startDate.toISOString().split('T')[0]}&endDate=${endDate.toISOString().split('T')[0]}`;
    } else if (dateFilter === "30d") {
      const endDate = new Date(today);
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - 29);
      url += `&startDate=${startDate.toISOString().split('T')[0]}&endDate=${endDate.toISOString().split('T')[0]}`;
    } else if (dateFilter === "overall") {
      // No date filters
    } else if (dateFilter === "today") {
      url += `&date=${todayStr}`;
    } else {
      url += `&date=${selectedDate}`;
    }

    return url;
  };

  const ordersUrl = getOrdersUrl();
  const { data, isLoading: swrLoading } = useSWR(ordersUrl, (url: string) => fetch(url).then(res => res.json()), {
    refreshInterval: 60000,
    revalidateOnFocus: true,
  });

  const orders = data?.success ? (data.data as Order[]) : [];
  const loading = swrLoading;

  // Fetch ratings to link to completed orders
  const ratingsUrl = slug ? `/api/ratings/${slug}?limit=100` : null;
  const { data: ratingsData } = useSWR(ratingsUrl, (url: string) => fetch(url).then(res => res.json()), {
    refreshInterval: 30000,
  });

  const ratingMap = useMemo(() => {
    const map: Record<number, any> = {};
    if (ratingsData?.success && Array.isArray(ratingsData.data)) {
      ratingsData.data.forEach((r: any) => {
        if (r.orderNumber) map[r.orderNumber] = r;
      });
    }
    return map;
  }, [ratingsData]);

  // Handle order transition if orderIdParam is present
  useEffect(() => {
    const markAsPaid = async () => {
      if (orderIdParam && slug) {
        try {
          const res = await fetch(`/api/orders/${slug}?id=${orderIdParam}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paymentStatus: "completed" }),
          });
          const data = await res.json();
          if (data.success) {
            toast({
              title: "Payment Confirmed",
              description: `Order #${data.data.orderNumber} marked as completed.`,
            });
            mutate(ordersUrl);
          }
        } catch (err) {
          console.error("Failed to mark order as paid:", err);
        }
      }
    };
    markAsPaid();
  }, [orderIdParam, slug, ordersUrl, toast]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle date picker change
  const handleDatePickerChange = (date: string) => {
    if (date) {
      setSelectedDate(date);
      
      if (date === getTodayDateString()) {
        setDateFilter("today");
      } else if (date === getYesterdayDateString()) {
        setDateFilter("yesterday");
      } else {
        setDateFilter("today");
      }
    }
  };

  // Filter orders based on search
  const filteredOrders = orders.filter(order => {
    return searchTerm === "" || 
      order.orderNumber.toString().includes(searchTerm) ||
      order.tableNumber.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Calculate revenue statistics
  const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total, 0);
  const cashPayments = filteredOrders
    .filter(order => order.paymentMethod === 'cash')
    .reduce((sum, order) => sum + order.total, 0);
  const upiPayments = filteredOrders
    .filter(order => order.paymentMethod === 'upi')
    .reduce((sum, order) => sum + order.total, 0);

  // Get display text for date filter
  const getDateFilterDisplay = () => {
    const today = getTodayDateString();
    const yesterday = getYesterdayDateString();
    
    if (selectedDate === today && dateFilter === "today") return "Today";
    if (selectedDate === yesterday && dateFilter === "yesterday") return "Yesterday";
    if (dateFilter === "7d") return "Last 7 Days";
    if (dateFilter === "30d") return "Last 30 Days";
    if (dateFilter === "overall") return "Overall";
    
    return new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleDateFilterSelect = (option: DateFilterOption) => {
    setDateFilter(option);
    setShowDropdown(false);

    if (option === "today") {
      setSelectedDate(getTodayDateString());
    } else if (option === "yesterday") {
      setSelectedDate(getYesterdayDateString());
    } else if (option === "7d" || option === "30d" || option === "overall") {
      setSelectedDate(getTodayDateString());
    }
  };

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-border min-h-[600px] w-full overflow-x-hidden shadow-sm">
      
      {/* ─── Page Header ─── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
            <Package className="w-4 h-4 text-primary" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-text tracking-tight">
            Payment Completed
          </h2>
          {loading && <Loader2 size={16} className="animate-spin text-muted/60" />}
        </div>
        
        {/* Filter Section */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Date Picker */}
          <div className="relative flex-1 sm:flex-none">
            <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
              <Calendar size={14} className="text-muted/50" />
            </div>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => handleDatePickerChange(e.target.value)}
              max={getTodayDateString()}
              className="w-full sm:w-[150px] lg:w-[160px] pl-8 sm:pl-10 pr-2 py-2 bg-[#FBF8F3] border border-border rounded-xl text-xs text-text focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300 hover:border-primary"
            />
          </div>

          {/* Date Filter Dropdown */}
          <div className="relative flex-1 sm:flex-none" ref={dropdownRef}>
            <button 
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-full sm:w-[140px] lg:w-[150px] flex items-center gap-1.5 bg-primary/10 text-primary border border-primary/20 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-primary/15 transition-all duration-300 justify-between shadow-sm"
            >
              <span className="truncate flex items-center gap-1.5">
                <CalendarDays className="w-3 h-3" />
                {getDateFilterDisplay()}
              </span>
              <ChevronDown size={12} strokeWidth={3} className={`flex-shrink-0 transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-36 sm:w-40 lg:w-48 bg-white border border-border rounded-xl shadow-lg z-50 overflow-hidden">
                <div className="py-0.5 sm:py-1">
                  {[
                    { value: "today", label: "Today" },
                    { value: "yesterday", label: "Yesterday" },
                    { value: "7d", label: "Last 7 Days" },
                    { value: "30d", label: "Last 30 Days" },
                    { value: "overall", label: "Overall" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleDateFilterSelect(option.value as DateFilterOption)}
                      className={`w-full text-left px-3 py-1.5 sm:py-2 text-xs hover:bg-surface transition-colors duration-200 ${
                        dateFilter === option.value ? 'bg-primary/10 text-primary font-semibold' : 'text-text'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Revenue Stats Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {/* Total Revenue */}
        <div className="bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20 rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between mb-1 sm:mb-2">
            <span className="text-xs sm:text-sm font-medium text-text">Total Revenue</span>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
              <IndianRupee size={16} className="text-primary" strokeWidth={2.5} />
            </div>
          </div>
          <p className="text-xl sm:text-3xl font-extrabold text-text tracking-tight">₹{totalRevenue.toFixed(2)}</p>
          <p className="text-[10px] sm:text-xs text-muted mt-0.5 sm:mt-1">from {filteredOrders.length} completed orders</p>
        </div>

        {/* Cash Payments */}
        <div className="bg-[#FBF8F3] border border-border rounded-xl sm:rounded-2xl p-4 sm:p-5 hover:border-primary transition-all duration-300 shadow-sm">
          <div className="flex items-center justify-between mb-1 sm:mb-2">
            <span className="text-xs sm:text-sm font-medium text-muted">Cash Payment</span>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-50 flex items-center justify-center border border-amber-200">
              <Wallet size={16} className="text-amber-700" strokeWidth={2.5} />
            </div>
          </div>
          <p className="text-xl sm:text-3xl font-extrabold text-text tracking-tight">₹{cashPayments.toFixed(2)}</p>
          <p className="text-[10px] sm:text-xs text-muted mt-0.5 sm:mt-1">
            {filteredOrders.filter(o => o.paymentMethod === 'cash').length} cash orders
          </p>
        </div>

        {/* UPI Payments */}
        <div className="bg-[#FBF8F3] border border-border rounded-xl sm:rounded-2xl p-4 sm:p-5 hover:border-primary transition-all duration-300 shadow-sm">
          <div className="flex items-center justify-between mb-1 sm:mb-2">
            <span className="text-xs sm:text-sm font-medium text-muted">UPI Payment</span>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-200">
              <CreditCard size={16} className="text-emerald-700" strokeWidth={2.5} />
            </div>
          </div>
          <p className="text-xl sm:text-3xl font-extrabold text-text tracking-tight">₹{upiPayments.toFixed(2)}</p>
          <p className="text-[10px] sm:text-xs text-muted mt-0.5 sm:mt-1">
            {filteredOrders.filter(o => o.paymentMethod === 'upi').length} UPI orders
          </p>
        </div>
      </div>

      {/* ─── Search Bar ─── */}
      <div className="mb-4 sm:mb-6">
        <div className="relative group">
          <Search size={14} className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-muted group-hover:text-text transition-colors duration-300" />
          <input
            type="text"
            placeholder="Search by order # or table..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 sm:pl-11 pr-3 sm:pr-4 py-2 sm:py-3 bg-[#FBF8F3] border border-border rounded-xl text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300 hover:border-primary"
          />
        </div>
      </div>

      {/* ─── Orders List ─── */}
      <div>
        <div className="flex items-center justify-between mb-2 sm:mb-4">
          <h3 className="font-bold text-base sm:text-lg text-text tracking-tight">
            Successful Orders
          </h3>
          <span className="text-[10px] sm:text-xs text-muted">
            {filteredOrders.length} orders
          </span>
        </div>

        {loading && filteredOrders.length === 0 ? (
          <OrdersSkeleton />
        ) : filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 sm:py-20 text-muted bg-[#FBF8F3] rounded-xl sm:rounded-2xl border border-border">
            <div className="w-16 h-16 bg-surface rounded-2xl flex items-center justify-center border border-border mb-4">
              <Package size={32} className="text-muted/40" />
            </div>
            <p className="text-xs sm:text-sm font-medium text-text">No completed orders found</p>
            <p className="text-xs text-muted mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {filteredOrders.map((order, index) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.03 }}
              >
                <OrderCard order={order} rating={ratingMap[order.orderNumber]} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}