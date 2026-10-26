"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  Search,
  MessageSquare,
  TrendingUp,
  Award,
  Users,
  Table as TableIcon,
  Receipt,
  Clock,
  ThumbsUp,
  RefreshCw,
  SlidersHorizontal,
  ChevronDown,
  ArrowUpDown,
  CheckCircle,
  AlertCircle,
  Heart,
  Quote,
} from "lucide-react";
import useSWR, { mutate } from "swr";
import { getPusherClient } from "@/lib/pusher-client";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type RatingItem = {
  _id: string;
  cafeSlug: string;
  orderNumber?: number;
  tableNumber?: string;
  customerName?: string;
  rating: number;
  feedback?: string;
  tags?: string[];
  createdAt: string;
};

type RatingStats = {
  total: number;
  average: number;
  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  withFeedbackCount: number;
  topTags: Array<{ tag: string; count: number }>;
};

export default function CafeRatingsPage() {
  const params = useParams();
  const menupages = (params?.menupages as string) || "";

  const [starFilter, setStarFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"newest" | "highest" | "lowest">("newest");
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [recentLiveRatingId, setRecentLiveRatingId] = useState<string | null>(null);

  // Construct dynamic API URL
  const queryParams = new URLSearchParams();
  if (starFilter !== "all") queryParams.append("filter", starFilter);
  if (searchQuery.trim()) queryParams.append("search", searchQuery.trim());
  queryParams.append("limit", "100");

  const apiUrl = menupages ? `/api/ratings/${menupages}?${queryParams.toString()}` : null;

  const { data, isLoading, isValidating } = useSWR(apiUrl, fetcher, {
    revalidateOnFocus: true,
    refreshInterval: 15000,
    keepPreviousData: true,
  });

  const ratings: RatingItem[] = data?.success && Array.isArray(data.data) ? data.data : [];
  const stats: RatingStats = data?.stats || {
    total: 0,
    average: 5.0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    withFeedbackCount: 0,
    topTags: [],
  };

  // Real-time Pusher listener for incoming customer ratings
  useEffect(() => {
    if (!menupages) return;
    const pusher = getPusherClient();
    if (!pusher) return;

    const channel = pusher.subscribe(`cafe-${menupages.toLowerCase()}`);

    const handleNewRating = (newRatingData: any) => {
      console.log("Real-time rating received:", newRatingData);
      if (newRatingData?.id) {
        setRecentLiveRatingId(String(newRatingData.id));
        setTimeout(() => setRecentLiveRatingId(null), 5000);
      }
      if (apiUrl) {
        mutate(apiUrl);
      }
    };

    channel.bind("new-rating", handleNewRating);

    return () => {
      try {
        channel.unbind("new-rating", handleNewRating);
        pusher.unsubscribe(`cafe-${menupages.toLowerCase()}`);
      } catch {}
    };
  }, [menupages, apiUrl]);

  // Client-side sorting
  const sortedRatings = useMemo(() => {
    const list = [...ratings];
    if (sortBy === "highest") {
      return list.sort((a, b) => b.rating - a.rating || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    if (sortBy === "lowest") {
      return list.sort((a, b) => a.rating - b.rating || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [ratings, sortBy]);

  const handleManualRefresh = async () => {
    if (!apiUrl) return;
    setIsRefreshing(true);
    await mutate(apiUrl);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Calculate percentage of 4 & 5 stars (customer satisfaction rate)
  const positiveRatingPercent = useMemo(() => {
    if (!stats.total || stats.total === 0) return 100;
    const positiveCount = (stats.distribution[5] || 0) + (stats.distribution[4] || 0);
    return Math.round((positiveCount / stats.total) * 100);
  }, [stats]);

  // Format date helper
  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);

      if (diffMins < 2) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;

      return d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* ─── Top Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold text-text tracking-tight flex items-center gap-2.5">
              <span>Customer Ratings & Reviews</span>
            </h1>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Sync
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted/60 mt-1">
            Real-time dining feedback, ratings, and customer compliments submitted after checkout
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing || isValidating}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-card border border-border/40 text-xs font-medium text-muted hover:text-text hover:border-primary/40 transition-all duration-200 shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing || isValidating ? "animate-spin text-primary" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* ─── Statistics Overview Grid ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
        {/* Card 1: Overall Average Rating */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-[#E5DFD4] rounded-2xl p-6 shadow-sm relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-28 h-28 bg-primary/5 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted uppercase tracking-wider">Average Rating</span>
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Award className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-4xl sm:text-5xl font-black text-text font-mono tracking-tight">
              {stats.average.toFixed(1)}
            </span>
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.round(stats.average)
                        ? "text-primary fill-primary drop-shadow-[0_2px_6px_rgba(184,134,11,0.35)]"
                        : "text-[#E5DFD4] fill-[#E5DFD4]"
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-muted">Out of 5.0 Stars</p>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-[#E5DFD4] flex items-center justify-between text-xs text-muted">
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-primary" />
              <strong className="text-text font-semibold">{stats.total}</strong> total ratings
            </span>
            <span className="flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <ThumbsUp className="w-3 h-3" />
              {positiveRatingPercent}% Positive
            </span>
          </div>
        </motion.div>

        {/* Card 2: Star Distribution Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white border border-[#E5DFD4] rounded-2xl p-6 shadow-sm space-y-2"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-muted uppercase tracking-wider">Star Distribution</span>
            <span className="text-[11px] text-muted font-mono">
              {stats.withFeedbackCount} reviews with comments
            </span>
          </div>

          {[5, 4, 3, 2, 1].map((starKey) => {
            const count = (stats.distribution as any)[starKey] || 0;
            const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
            return (
              <div key={starKey} className="flex items-center gap-2.5 text-xs">
                <span className="w-8 font-mono font-medium text-muted flex items-center gap-1">
                  {starKey} <Star className="w-3 h-3 text-primary fill-primary inline" />
                </span>
                <div className="flex-1 h-2 bg-[#F3EFE6] rounded-full overflow-hidden border border-[#E5DFD4]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className={`h-full rounded-full ${
                      starKey >= 4
                        ? "bg-primary"
                        : starKey === 3
                        ? "bg-amber-400"
                        : "bg-rose-400"
                    }`}
                  />
                </div>
                <span className="w-10 text-right font-mono text-[11px] text-muted">
                  {count} <span className="text-[10px]">({pct}%)</span>
                </span>
              </div>
            );
          })}
        </motion.div>

        {/* Card 3: Top Customer Compliments */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white border border-[#E5DFD4] rounded-2xl p-6 shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-muted uppercase tracking-wider">Customer Compliments</span>
              <Heart className="w-4 h-4 text-rose-500 fill-rose-100" />
            </div>

            {stats.topTags && stats.topTags.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {stats.topTags.map((item) => (
                  <span
                    key={item.tag}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-medium"
                  >
                    <span>{item.tag}</span>
                    <span className="text-[10px] font-bold opacity-80 font-mono">({item.count})</span>
                  </span>
                ))}
              </div>
            ) : (
              <div className="py-4 text-center text-xs text-muted">
                <Heart className="w-8 h-8 text-muted/30 mx-auto mb-2" />
                Customer compliments and praise tags will appear here as orders are rated.
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-[#E5DFD4] mt-4 flex items-center justify-between text-xs text-muted">
            <span>Direct guest feedback</span>
            <span className="text-primary font-bold">Customer-first dining</span>
          </div>
        </motion.div>
      </div>

      {/* ─── Search & Filters Bar ─── */}
      <div className="bg-white border border-[#E5DFD4] rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by customer name, table no., order # or review text..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#FBF8F3] border border-[#E5DFD4] rounded-xl text-xs text-text placeholder:text-muted/60 focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all"
          />
        </div>

        {/* Star Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {[
            { id: "all", label: "All Reviews" },
            { id: "5", label: "5 Stars ★" },
            { id: "4", label: "4 Stars ★" },
            { id: "3", label: "3 Stars ★" },
            { id: "2", label: "2 Stars ★" },
            { id: "1", label: "1 Star ★" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStarFilter(tab.id)}
              className={`text-xs px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all duration-200 ${
                starFilter === tab.id
                  ? "bg-primary text-white font-bold shadow-sm"
                  : "bg-[#FBF8F3] text-muted hover:text-text hover:bg-[#F3EFE6] border border-[#E5DFD4]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2 border-t md:border-t-0 md:border-l border-[#E5DFD4] pt-2 md:pt-0 md:pl-3">
          <ArrowUpDown className="w-3.5 h-3.5 text-muted" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-[#FBF8F3] border border-[#E5DFD4] rounded-xl px-2.5 py-1.5 text-xs text-text outline-none focus:border-primary cursor-pointer font-medium"
          >
            <option value="newest" className="bg-white text-text">Newest First</option>
            <option value="highest" className="bg-white text-text">Highest Rating</option>
            <option value="lowest" className="bg-white text-text">Lowest Rating</option>
          </select>
        </div>
      </div>

      {/* ─── Reviews List ─── */}
      <div className="space-y-3">
        {isLoading && ratings.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-[#E5DFD4]">
            <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-muted">Loading customer ratings...</p>
          </div>
        ) : sortedRatings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 bg-white rounded-2xl border border-[#E5DFD4] p-6 shadow-sm"
          >
            <div className="w-16 h-16 bg-primary/10 border border-primary/20 rounded-2xl mx-auto flex items-center justify-center text-primary mb-3">
              <Star className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-text">No Customer Ratings Found</h3>
            <p className="text-xs text-muted mt-1 max-w-sm mx-auto">
              {searchQuery || starFilter !== "all"
                ? "No ratings match your current search or star filter criteria. Try resetting filters."
                : "Customers will be able to rate their food and service right after completing their payment. Their reviews will appear here live!"}
            </p>
            {(searchQuery || starFilter !== "all") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setStarFilter("all");
                }}
                className="mt-4 text-xs font-bold text-primary hover:underline inline-flex items-center gap-1"
              >
                Clear all filters
              </button>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {sortedRatings.map((item, index) => {
                const isJustReceived = recentLiveRatingId === item._id;
                const initials = (item.customerName || "G")
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2);

                return (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25, delay: Math.min(index * 0.04, 0.4) }}
                    className={`bg-white border rounded-2xl p-5 shadow-sm transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
                      isJustReceived
                        ? "border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/30"
                        : "border-[#E5DFD4] hover:border-primary/50"
                    }`}
                  >
                    {isJustReceived && (
                      <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[10px] font-bold px-3 py-0.5 rounded-bl-xl shadow-sm">
                        NEW LIVE RATING
                      </div>
                    )}

                    <div>
                      {/* Customer Info & Star Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary text-xs shadow-inner flex-shrink-0">
                            {initials}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-text leading-tight">
                              {item.customerName || "Guest Diner"}
                            </h4>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              {item.tableNumber && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-amber-100 border border-amber-300 text-amber-800">
                                  <TableIcon className="w-3 h-3" />
                                  Table {item.tableNumber}
                                </span>
                              )}
                              {item.orderNumber && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-lg bg-primary/10 border border-primary/20 text-primary font-semibold">
                                  <Receipt className="w-3 h-3" />
                                  Order #{item.orderNumber}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Star Rating Display */}
                        <div className="text-right flex-shrink-0">
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-3.5 h-3.5 ${
                                  star <= item.rating
                                    ? "text-primary fill-primary"
                                    : "text-[#E5DFD4] fill-[#E5DFD4]"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-[10px] font-mono font-bold text-primary block mt-0.5">
                            {item.rating}.0 / 5.0
                          </span>
                        </div>
                      </div>

                      {/* Compliment Tags */}
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-[#E5DFD4]">
                          {item.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-[11px] px-2 py-0.5 rounded-lg bg-primary/10 border border-primary/20 text-primary font-medium"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Feedback Comment */}
                      {item.feedback ? (
                        <div className="mt-3 bg-[#FBF8F3] border border-[#E5DFD4] rounded-xl p-3 relative">
                          <Quote className="w-3.5 h-3.5 text-primary/30 absolute top-2.5 left-2.5 pointer-events-none" />
                          <p className="text-xs text-text/85 italic pl-4 leading-relaxed">
                            &ldquo;{item.feedback}&rdquo;
                          </p>
                        </div>
                      ) : null}
                    </div>

                    {/* Timestamp Footer */}
                    <div className="mt-4 pt-3 border-t border-[#E5DFD4] flex items-center justify-between text-[11px] text-muted">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(item.createdAt)}
                      </span>
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Verified Dine-in
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
