"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ClipboardList, CheckCircle, ChevronDown, Calendar, Loader2, Bell, TrendingUp, CalendarDays, QrCode, Star, MessageSquare, ArrowRight, Quote, Award } from "lucide-react";
import useSWR from "swr";
import { motion } from "framer-motion";  
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Label,
} from "recharts";

// ─── Types ───
type DashboardStats = {
  total: number;
  pending: number;
  completed: number;
  preparing: number;
  served: number;
  cancelled: number;
};

type ChartDataPoint = {
  name: string;
  orders: number;
};

const metricsConfig = [
  {
    label: "Total Orders",
    icon: ClipboardList,
    key: "total",
  },
  {
    label: "New Orders",
    icon: Bell,
    key: "pending",
  },
  {
    label: "Completed Orders",
    icon: CheckCircle,
    key: "completed",
  },
];

// Dashboard Skeleton Loader
const DashboardSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl border border-border p-4 sm:p-6 w-full shadow-sm">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
        <div className="h-8 w-48 bg-surface rounded animate-pulse"></div>
        <div className="flex items-center gap-2">
          <div className="h-10 w-32 bg-surface rounded-md animate-pulse"></div>
          <div className="h-10 w-32 bg-surface rounded-md animate-pulse"></div>
        </div>
      </div>

      {/* Metrics Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-[#FBF8F3] rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-border">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 w-24 bg-surface rounded animate-pulse"></div>
                <div className="h-8 w-16 bg-surface rounded animate-pulse"></div>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-surface animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart Skeleton */}
      <div className="bg-[#FBF8F3] rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 w-40 bg-surface rounded animate-pulse"></div>
          <div className="h-6 w-24 bg-surface rounded-full animate-pulse"></div>
        </div>
        <div className="h-[300px] bg-surface/50 rounded-md animate-pulse relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
};

// ─── Helpers ───
function getTodayDateString() {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

function getYesterdayDateString() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
}

export default function DashboardPage() {
  const params = useParams();
  const slug = params?.menupages as string;
  
  const [period, setPeriod] = useState("today");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Define dynamic cache key based on filters
  const statsUrl = slug ? `/api/orders/${slug}/stats?period=${period}${period === "custom" || period === "today" || period === "yesterday" ? `&date=${selectedDate}` : ""}` : null;

  // Use SWR for memory caching and fast data fetching
  const { data, isLoading: swrLoading, isValidating } = useSWR(statsUrl, {
    revalidateOnFocus: true,
    refreshInterval: 30000,
    dedupingInterval: 10000,
    keepPreviousData: true,
  });

  const stats = data?.success ? data.stats : {
    total: 0,
    pending: 0,
    completed: 0,
    preparing: 0,
    served: 0,
    cancelled: 0
  };
  
  const chartData = data?.success && data.chartData ? data.chartData : [];
  const loading = swrLoading && !data;

  // Dynamic Customer Ratings Fetch
  const ratingsUrl = slug ? `/api/ratings/${slug}?limit=3` : null;
  const { data: ratingsData } = useSWR(ratingsUrl, (url: string) => fetch(url).then(r => r.json()), {
    revalidateOnFocus: true,
    refreshInterval: 20000,
  });
  const ratingStats = ratingsData?.stats || { average: 5.0, total: 0, distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } };
  const recentRatings: any[] = ratingsData?.data || [];

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

  const handlePeriodSelect = (value: string) => {
    setPeriod(value);
    setShowDropdown(false);
    
    if (value === "today") {
      setSelectedDate(getTodayDateString());
    } else if (value === "yesterday") {
      setSelectedDate(getYesterdayDateString());
    } else if (value === "7d" || value === "30d" || value === "overall") {
      setSelectedDate(getTodayDateString());
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    if (newDate) {
      setSelectedDate(newDate);
      
      if (newDate === getTodayDateString()) {
        setPeriod("today");
      } else if (newDate === getYesterdayDateString()) {
        setPeriod("yesterday");
      } else {
        setPeriod("custom");
      }
    }
  };

  const getPeriodDisplay = () => {
    if (period === "today") return "Today";
    if (period === "yesterday") return "Yesterday";
    if (period === "7d") return "Last 7 Days";
    if (period === "30d") return "Last 30 Days";
    if (period === "overall") return "Overall";
    if (period === "custom") {
      const date = new Date(selectedDate);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    return "Today";
  };

  const getXAxisLabel = () => {
    if (period === "today" || period === "yesterday" || period === "custom") {
      return "time from 12.00 am to 12.00 pm";
    }
    return `date from ${chartData[0]?.name || ''} to ${chartData[chartData.length - 1]?.name || ''}`;
  };

  const chartDataWithGrowth = chartData && chartData.length > 0
    ? chartData.map((point: ChartDataPoint) => ({
        ...point,
        growth: Math.min(100, Math.max(10, (point.orders / (stats.total || 1)) * 100))
      }))
    : [];

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="bg-white rounded-2xl border border-border p-4 sm:p-6 w-full min-h-[600px] shadow-sm">
      
      {/* ─── Dashboard Header ─── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center border border-primary/30 shadow-lg shadow-primary/20">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-text tracking-tight">
              Dashboard Overview
            </h2>
            <p className="text-xs text-muted/50 hidden sm:block">Real-time analytics for your restaurant</p>
          </div>
          {(loading || isValidating) && <Loader2 size={16} className="animate-spin text-muted/60 ml-2" />}
        </div>
        
        {/* Date Filter Section */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Date Input */}
          <div className="relative min-w-0 flex-1 sm:flex-none">
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="w-full sm:w-[140px] pl-9 pr-2 py-2.5 bg-white border border-[#E5DFD4] rounded-xl text-xs font-medium text-text focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300 hover:border-primary/50 shadow-sm"
              max={new Date().toISOString().split('T')[0]}
            />
            <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none flex-shrink-0" />
          </div>

          {/* Period Dropdown */}
          <div className="relative min-w-0 flex-1 sm:flex-none" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-full sm:w-[140px] flex items-center gap-1.5 bg-white text-text border border-[#E5DFD4] px-3 py-2.5 rounded-xl text-xs font-medium hover:border-primary/50 transition-all duration-300 justify-between shadow-sm"
            >
              <span className="truncate flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5 text-primary" />
                {getPeriodDisplay()}
              </span>
              <ChevronDown size={14} strokeWidth={2.5} className={`flex-shrink-0 text-muted transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            {showDropdown && (
              <div className="absolute right-0 top-full mt-2 bg-white border border-[#E5DFD4] rounded-xl shadow-xl py-1 z-50 min-w-[140px] w-full overflow-hidden">
                {[
                  { value: "today", label: "Today" },
                  { value: "yesterday", label: "Yesterday" },
                  { value: "7d", label: "Last 7 Days" },
                  { value: "30d", label: "Last 30 Days" },
                  { value: "overall", label: "Overall" },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handlePeriodSelect(option.value)}
                    className={`w-full text-left px-3 py-2.5 text-xs hover:bg-[#F3EFE6] transition-colors duration-200 ${
                      period === option.value ? 'bg-primary/10 text-primary font-bold' : 'text-text'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Menu QR Code Quick Banner ─── */}
      <div className="bg-[#F3EFE6] border border-[#E5DFD4] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm mb-6">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-white border border-[#E5DFD4] flex items-center justify-center text-primary flex-shrink-0 shadow-sm">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm sm:text-base font-bold text-text">Live Menu QR Code</h4>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold uppercase tracking-wider">
                Active
              </span>
            </div>
            <p className="text-xs text-muted mt-0.5">
              Customers scan this to view your live menu & order. Changes made to menu items reflect instantly.
            </p>
          </div>
        </div>
        <Link
          href={`/${slug}/admin/qr-code`}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs shadow-md shadow-primary/20 transition-all flex-shrink-0"
        >
          <QrCode className="w-3.5 h-3.5" />
          View & Print QR
        </Link>
      </div>

      {/* ─── Metrics Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-6 sm:mb-8">
        {metricsConfig.map((item, index) => {
          const Icon = item.icon;
          const colors = {
            total: { bg: 'bg-primary/10', text: 'text-primary', border: 'border-primary/20' },
            pending: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
            completed: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
          };
          const color = colors[item.key as keyof typeof colors] || colors.total;
          
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-white border border-[#E5DFD4] rounded-2xl p-5 flex items-center justify-between min-h-[110px] hover:border-primary/40 transition-all duration-300 group shadow-sm hover:shadow-md"
            >
              <div className="flex flex-col gap-0.5 sm:gap-1 min-w-0 flex-1">
                <span className="text-xs sm:text-sm font-medium text-muted truncate pr-2 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  {item.label}
                </span>
                {loading ? (
                  <div className="h-8 w-12 bg-[#F3EFE6] animate-pulse rounded mt-1"></div>
                ) : (
                  <span className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight">
                    {stats[item.key as keyof DashboardStats] || 0}
                  </span>
                )}
              </div>
              
              {/* Icon in Circle */}
              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl ${color.bg} flex items-center justify-center flex-shrink-0 border ${color.border} group-hover:scale-105 transition-transform duration-300 shadow-sm`}>
                <Icon className={color.text} size={22} strokeWidth={2.5} />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ─── Orders Chart ─── */}
      <div className="bg-white border border-[#E5DFD4] rounded-2xl p-5 sm:p-6 min-h-[350px] shadow-sm">
        <div className="flex flex-row items-center justify-between gap-2 mb-4 sm:mb-6">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-6 bg-primary rounded-full"></div>
            <h3 className="text-base sm:text-lg font-bold text-text tracking-tight">
              Orders Overview
            </h3>
          </div>
          <span className="text-xs sm:text-sm text-muted bg-[#F3EFE6] px-3 py-1.5 rounded-xl border border-[#E5DFD4] whitespace-nowrap flex items-center gap-1.5 font-medium">
            <Calendar className="w-3.5 h-3.5 text-primary" />
            {getPeriodDisplay()}
          </span>
        </div>
        
        <div className="w-full h-[250px] sm:h-[300px] md:h-[350px] overflow-x-auto overflow-y-hidden scrollbar-hide">
          {loading ? (
            <div className="w-full h-full bg-[#F3EFE6] animate-pulse rounded-xl"></div>
          ) : (
            <div className="min-w-[700px] sm:min-w-full h-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartDataWithGrowth}
                  margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                >
                  <CartesianGrid
                    vertical={false}
                    stroke="#E5DFD4" 
                    strokeDasharray="3 3"
                    opacity={0.8}
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#78716C", fontSize: 11, fontWeight: 500 }}
                    tickMargin={10}
                    interval={period === "30d" ? 6 : (period === "7d" ? 1 : 0)}
                    padding={{ left: 15, right: 15 }}
                  >
                    <Label 
                      value={getXAxisLabel()} 
                      offset={-25} 
                      position="insideBottom" 
                      style={{ fill: '#78716C', fontSize: '11px', fontWeight: 'bold' }}
                    />
                  </XAxis>
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#78716C", fontSize: 11, fontWeight: 500 }}
                    tickMargin={10}
                    domain={[10, 100]}
                    ticks={[10, 20, 30, 40, 50, 60, 70, 80, 90, 100]}
                    unit="%"
                  >
                    <Label 
                      value="growth in %" 
                      angle={-90} 
                      position="insideLeft" 
                      offset={-5}
                      style={{ fill: '#78716C', fontSize: '11px', fontWeight: 'bold', textAnchor: 'middle' }}
                    />
                  </YAxis>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#FFFFFF",
                      borderRadius: "14px",
                      border: "1px solid #E5DFD4",
                      boxShadow: "0 10px 25px -5px rgba(60, 45, 30, 0.08)",
                      fontSize: "11px",
                      padding: "8px 14px",
                    }}
                    itemStyle={{ color: "#B8860B", fontWeight: "bold", fontSize: "11px" }}
                    labelStyle={{ color: "#1C1917", fontWeight: "600", fontSize: "11px", marginBottom: "2px" }}
                    cursor={{ stroke: "#B8860B", strokeWidth: 1, strokeDasharray: "4 4" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="growth"
                    stroke="#B8860B"
                    strokeWidth={3}
                    dot={{ fill: "#B8860B", r: 3 }}
                    activeDot={{ r: 6, fill: "#B8860B", stroke: "#FFFFFF", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* ─── Customer Ratings & Feedback Spotlight ─── */}
      <div className="bg-white border border-[#E5DFD4] rounded-2xl p-5 sm:p-6 shadow-sm mt-6 sm:mt-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E5DFD4]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary flex-shrink-0 shadow-sm">
              <Star className="w-5 h-5 fill-primary text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-text">Customer Ratings & Reviews</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-bold">
                  {ratingStats.average.toFixed(1)} ★ ({ratingStats.total} reviews)
                </span>
              </div>
              <p className="text-xs text-muted mt-0.5">
                Real-time feedback submitted by customers after payment
              </p>
            </div>
          </div>

          <Link
            href={`/${slug}/admin/ratings`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F3EFE6] hover:bg-primary hover:text-white text-text border border-[#E5DFD4] text-xs font-bold transition-all self-start sm:self-auto shadow-sm"
          >
            <span>View All Reviews</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentRatings.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted">
            <Star className="w-8 h-8 text-muted/30 mx-auto mb-2" />
            <p>No customer reviews yet. Ratings submitted on the checkout confirmation screen will appear here!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-5">
            {recentRatings.map((item: any) => (
              <div
                key={item._id}
                className="bg-[#FBF8F3] border border-[#E5DFD4] rounded-xl p-3.5 flex flex-col justify-between hover:border-primary/50 transition-colors shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-bold text-text truncate">
                      {item.customerName || "Guest"}
                    </span>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3 h-3 ${
                            s <= item.rating ? "text-primary fill-primary" : "text-[#E5DFD4] fill-[#E5DFD4]"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {item.tableNumber && (
                    <span className="text-[10px] text-amber-800 font-medium px-2 py-0.5 bg-amber-100 rounded-md border border-amber-300 inline-block mb-2">
                      Table {item.tableNumber}
                    </span>
                  )}

                  {item.feedback ? (
                    <p className="text-xs text-text/80 italic line-clamp-2 leading-relaxed">
                      &ldquo;{item.feedback}&rdquo;
                    </p>
                  ) : (
                    <p className="text-xs text-muted italic">Rated {item.rating} stars</p>
                  )}
                </div>

                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2.5 pt-2 border-t border-[#E5DFD4]">
                    {item.tags.slice(0, 2).map((t: string) => (
                      <span
                        key={t}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 font-medium"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}