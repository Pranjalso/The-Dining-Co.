"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, CheckCircle2, MessageSquare, Send, Heart, User } from "lucide-react";

interface CustomerRatingCardProps {
  cafeSlug: string;
  orderNumber?: string | number | null;
  tableNumber?: string | null;
  onRatingSubmitted?: (ratingData: any) => void;
  className?: string;
}

const RATING_LABELS: Record<number, { text: string; emoji: string }> = {
  1: { text: "Needs Improvement", emoji: "😞" },
  2: { text: "Fair Experience", emoji: "😐" },
  3: { text: "Good", emoji: "👍" },
  4: { text: "Very Good!", emoji: "😊" },
  5: { text: "Exceptional!", emoji: "🌟" },
};

const COMPLIMENT_TAGS = [
  "Delicious Food 🍲",
  "Super Fast Service ⚡",
  "Polite Staff 🤝",
  "Clean & Hygienic 🧼",
  "Great Ambience 🎵",
  "Value for Money 💰",
];

export default function CustomerRatingCard({
  cafeSlug,
  orderNumber,
  tableNumber,
  onRatingSubmitted,
  className = "",
}: CustomerRatingCardProps) {
  const [rating, setRating] = useState<number>(5);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string>("");
  const [customerName, setCustomerName] = useState<string>("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const storageKey = `sd:rating:${cafeSlug}:${orderNumber || tableNumber || "general"}`;

  // Check if previously rated from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.rating) {
          setRating(parsed.rating);
          setFeedback(parsed.feedback || "");
          setCustomerName(parsed.customerName || "");
          setSelectedTags(parsed.tags || []);
          setSubmitted(true);
        }
      }
    } catch {}
  }, [storageKey]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!cafeSlug) return;
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const payload = {
        rating,
        feedback: feedback.trim(),
        customerName: customerName.trim() || "Guest",
        tableNumber: tableNumber ? String(tableNumber) : undefined,
        orderNumber: orderNumber ? Number(orderNumber) : undefined,
        tags: selectedTags,
      };

      const res = await fetch(`/api/ratings/${cafeSlug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json?.success) {
        throw new Error(json?.message || "Failed to submit rating");
      }

      setSubmitted(true);
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(payload));
      } catch {}

      if (onRatingSubmitted) {
        onRatingSubmitted(json.data);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeRating = hoveredRating || rating;
  const activeLabel = RATING_LABELS[activeRating] || RATING_LABELS[5];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={`w-full bg-white border border-[#E5DFD4] rounded-2xl p-5 sm:p-6 shadow-sm relative overflow-hidden ${className}`}
    >
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />

      {submitted ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-4 space-y-3"
        >
          <div className="w-14 h-14 bg-emerald-50 border border-emerald-200 rounded-2xl mx-auto flex items-center justify-center text-emerald-600 shadow-sm">
            <CheckCircle2 className="w-7 h-7" />
          </div>

          <div>
            <h3 className="text-lg font-bold text-text">Thank You for Your Feedback!</h3>
            <p className="text-xs text-muted mt-1 max-w-xs mx-auto">
              Your rating of{" "}
              <span className="font-bold text-primary font-mono">{rating} / 5</span> has been
              sent directly to the cafe team.
            </p>
          </div>

          <div className="flex items-center justify-center gap-1.5 py-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-5 h-5 ${
                  star <= rating
                    ? "text-primary fill-primary"
                    : "text-[#E5DFD4] fill-[#E5DFD4]"
                }`}
              />
            ))}
          </div>

          {selectedTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 justify-center pt-1">
              {selectedTags.map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {feedback && (
            <p className="text-xs text-text/80 italic bg-[#FBF8F3] border border-[#E5DFD4] rounded-xl p-3 max-w-sm mx-auto text-left">
              &ldquo;{feedback}&rdquo;
            </p>
          )}

          <button
            onClick={() => setSubmitted(false)}
            className="text-xs text-muted hover:text-primary transition-colors underline pt-2 inline-block font-medium"
          >
            Edit your rating
          </button>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Header */}
          <div className="text-center space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-semibold tracking-wide uppercase">
              <Heart className="w-3.5 h-3.5 fill-primary text-primary" />
              <span>Customer Feedback</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-text tracking-tight">
              How was your dining experience?
            </h3>
            <p className="text-xs text-muted">
              Your feedback helps us continuously improve our food & service
            </p>
          </div>

          {/* Star Rating Selector */}
          <div className="flex flex-col items-center py-2 space-y-2">
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(null)}
                  className="p-1 sm:p-1.5 transition-transform hover:scale-125 active:scale-95 focus:outline-none"
                  aria-label={`Rate ${star} stars`}
                >
                  <Star
                    className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors duration-200 ${
                      star <= activeRating
                        ? "text-primary fill-primary drop-shadow-[0_2px_8px_rgba(184,134,11,0.35)]"
                        : "text-[#E5DFD4] fill-[#E5DFD4] hover:text-primary/50"
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Dynamic Feeling Label */}
            <motion.div
              key={activeRating}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs font-semibold text-primary flex items-center gap-1 bg-primary/10 border border-primary/20 px-3 py-1 rounded-full"
            >
              <span>{activeLabel.emoji}</span>
              <span>{activeLabel.text}</span>
            </motion.div>
          </div>

          {/* Quick Compliment Chips */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted block">
              What went great? (Select all that apply)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {COMPLIMENT_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`text-xs px-2.5 py-1.5 rounded-xl border transition-all duration-200 font-medium flex items-center gap-1 ${
                      isSelected
                        ? "bg-primary text-white border-primary shadow-sm font-semibold"
                        : "bg-[#FBF8F3] border-[#E5DFD4] text-muted hover:border-primary/40 hover:text-text"
                    }`}
                  >
                    <span>{tag}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Customer Name (Optional) */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-primary" />
              Your Name <span className="text-[10px] text-muted/60 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Rahul Sharma"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-3 py-2 bg-[#FBF8F3] border border-[#E5DFD4] rounded-xl text-xs text-text placeholder:text-muted/60 focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all"
              maxLength={60}
            />
          </div>

          {/* Detailed Feedback Textarea */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-primary" />
              Write a Review <span className="text-[10px] text-muted/60 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={2}
              placeholder="Tell us what you loved or how we can make your next visit even better..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full px-3 py-2 bg-[#FBF8F3] border border-[#E5DFD4] rounded-xl text-xs text-text placeholder:text-muted/60 focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all resize-none"
              maxLength={1000}
            />
          </div>

          {errorMessage && (
            <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl p-2.5 font-medium">
              ⚠️ {errorMessage}
            </p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary hover:bg-primary-hover text-white py-3 rounded-xl text-xs font-bold transition-all duration-300 shadow-lg shadow-primary/25 flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Submitting Rating...
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5" />
                Submit Rating
              </span>
            )}
          </button>
        </form>
      )}
    </motion.div>
  );
}
