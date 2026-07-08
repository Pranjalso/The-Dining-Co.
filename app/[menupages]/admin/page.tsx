"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { ClipboardList, Clock, CheckCircle, ChevronDown, Calendar, Loader2, Bell, Crown, TrendingUp, Users, Coffee, Sparkles } from "lucide-react";
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
    <div className="bg-card/60 backdrop-blur-sm rounded-2xl border border-border/30 p-4 sm:p-6 w-full shadow-2xl shadow-primary/5">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
        <div className="h-8 w-48 bg-surface/40 rounded animate-pulse"></div>
        <div className="flex items-center gap-2">
          <div className="h-10 w-32 bg-surface/40 rounded-md animate-pulse"></div>
          <div className="h-10 w-32 bg-surface/40 rounded-md animate-pulse"></div>
        </div>
      </div>

      {/* Metrics Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-surface/20 rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-border/20">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 w-24 bg-surface/40 rounded animate-pulse"></div>
                <div className="h-8 w-16 bg-surface/40 rounded animate-pulse"></div>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-surface/40 animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart Skeleton */}
      <div className="bg-surface/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-border/20">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 w-40 bg-surface/40 rounded animate-pulse"></div>
          <div className="h-6 w-24 bg-surface/40 rounded-full animate-pulse"></div>
        </div>
        <div className="h-[300px] bg-surface/30 rounded-md animate-pulse relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer"></div>
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
    <div className="bg-card/60 backdrop-blur-sm rounded-2xl border border-border/30 p-4 sm:p-6 w-full min-h-[600px] shadow-2xl shadow-primary/5">
      
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
              className="w-full sm:w-[140px] pl-9 pr-2 py-2.5 bg-surface/30 border border-border/40 rounded-xl text-xs font-medium text-text focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300 hover:border-primary/50
              [&:-webkit-autofill]:!bg-[rgba(212,175,55,0.08)] 
              [&:-webkit-autofill]:!text-[#F9FAFB] 
              [&:-webkit-autofill]:!shadow-[inset_0_0_0px_1000px_rgba(212,175,55,0.08)]"
              max={new Date().toISOString().split('T')[0]}
            />
            <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted/60 pointer-events-none flex-shrink-0" />
          </div>

          {/* Period Dropdown */}
          <div className="relative min-w-0 flex-1 sm:flex-none" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-full sm:w-[140px] flex items-center gap-1.5 bg-gradient-to-r from-primary/10 to-primary/5 text-primary border border-primary/20 px-3 py-2.5 rounded-xl text-xs font-medium hover:from-primary/20 hover:to-primary/10 transition-all duration-300 justify-between shadow-lg shadow-primary/5"
            >
              <span className="truncate flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" />
                {getPeriodDisplay()}
              </span>
              <ChevronDown size={14} strokeWidth={2.5} className={`flex-shrink-0 transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            {showDropdown && (
              <div className="absolute right-0 top-full mt-2 bg-card/95 backdrop-blur-sm border border-border/30 rounded-xl shadow-2xl shadow-primary/10 py-1 z-50 min-w-[140px] w-full overflow-hidden">
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
                    className={`w-full text-left px-3 py-2.5 text-xs hover:bg-surface/30 transition-colors duration-200 ${
                      period === option.value ? 'bg-primary/10 text-primary font-medium' : 'text-text/70'
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

      {/* ─── Metrics Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-6 sm:mb-8">
        {metricsConfig.map((item, index) => {
          const Icon = item.icon;
          const colors = {
            total: { bg: 'bg-gradient-to-br from-primary/20 to-primary/10', text: 'text-primary', border: 'border-primary/20' },
            pending: { bg: 'bg-gradient-to-br from-amber-500/20 to-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
            completed: { bg: 'bg-gradient-to-br from-emerald-500/20 to-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
          };
          const color = colors[item.key as keyof typeof colors] || colors.total;
          
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-surface/20 border border-border/20 rounded-xl sm:rounded-2xl p-4 sm:p-5 flex items-center justify-between min-h-[110px] hover:border-primary/30 transition-all duration-300 group shadow-lg shadow-primary/5"
            >
              <div className="flex flex-col gap-0.5 sm:gap-1 min-w-0 flex-1">
                <span className="text-xs sm:text-sm font-medium text-muted/70 truncate pr-2 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/40"></span>
                  {item.label}
                </span>
                {loading ? (
                  <div className="h-8 w-12 bg-surface/40 animate-pulse rounded mt-1"></div>
                ) : (
                  <span className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight">
                    {stats[item.key as keyof DashboardStats] || 0}
                  </span>
                )}
              </div>
              
              {/* Icon in Circle */}
              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl ${color.bg} flex items-center justify-center flex-shrink-0 border ${color.border} group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-primary/5`}>
                <Icon className={color.text} size={20} strokeWidth={2.5} />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ─── Orders Chart ─── */}
      <div className="bg-gradient-to-br from-surface/20 to-surface/10 border border-border/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 min-h-[350px] hover:border-primary/30 transition-all duration-300 shadow-lg shadow-primary/5">
        <div className="flex flex-row items-center justify-between gap-2 mb-4 sm:mb-6">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-6 bg-primary rounded-full"></div>
            <h3 className="text-base sm:text-lg font-bold text-text tracking-tight">
              Orders Overview
            </h3>
          </div>
          <span className="text-xs sm:text-sm text-muted/60 bg-surface/30 px-3 py-1.5 rounded-lg border border-border/20 whitespace-nowrap flex items-center gap-1.5">
            <Calendar className="w-3 h-3" />
            {getPeriodDisplay()}
          </span>
        </div>
        
        <div className="w-full h-[250px] sm:h-[300px] md:h-[350px] overflow-x-auto overflow-y-hidden scrollbar-hide">
          {loading ? (
            <div className="w-full h-full bg-surface/30 animate-pulse rounded-lg"></div>
          ) : (
            <div className="min-w-[700px] sm:min-w-full h-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartDataWithGrowth}
                  margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                >
                  <CartesianGrid
                    vertical={false}
                    stroke="#374151" 
                    strokeDasharray="0"
                    opacity={0.2}
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#9CA3AF", fontSize: 10, fontWeight: 500 }}
                    tickMargin={10}
                    interval={period === "30d" ? 6 : (period === "7d" ? 1 : 0)}
                    padding={{ left: 15, right: 15 }}
                  >
                    <Label 
                      value={getXAxisLabel()} 
                      offset={-25} 
                      position="insideBottom" 
                      style={{ fill: '#9CA3AF', fontSize: '10px', fontWeight: 'bold' }}
                    />
                  </XAxis>
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#9CA3AF", fontSize: 10, fontWeight: 500 }}
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
                      style={{ fill: '#9CA3AF', fontSize: '10px', fontWeight: 'bold', textAnchor: 'middle' }}
                    />
                  </YAxis>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1E293B",
                      borderRadius: "12px",
                      border: "1px solid #374151",
                      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3)",
                      fontSize: "10px",
                      padding: "8px 12px",
                    }}
                    itemStyle={{ color: "#D4AF37", fontWeight: "bold", fontSize: "10px" }}
                    labelStyle={{ color: "#F9FAFB", fontWeight: "600", fontSize: "10px", marginBottom: "2px" }}
                    cursor={{ stroke: "#D4AF37", strokeWidth: 1, strokeDasharray: "4 4" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="growth"
                    stroke="#D4AF37"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 5, fill: "#D4AF37", stroke: "#0F172A", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
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