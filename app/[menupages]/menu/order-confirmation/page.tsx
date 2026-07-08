"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { 
  CheckCircle, 
  ShoppingBag, 
  Clock, 
  Crown, 
  Sparkles, 
  UtensilsCrossed,
  PartyPopper,
  ArrowRight
} from "lucide-react";
import { Suspense } from "react";

// For Next.js 15, we need to handle params as a Promise
type PageProps = {
  params: { menupages: string }
}

function OrderConfirmationContent({ menupages }: { menupages: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('orderNumber');

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto bg-card/60 backdrop-blur-sm min-h-screen shadow-2xl shadow-primary/5 border border-border/30">
        <div className="p-8 flex flex-col items-center justify-center min-h-screen">
          {/* Success Icon */}
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="w-24 h-24 bg-emerald-500/10 rounded-2xl mb-6 flex items-center justify-center border border-emerald-500/20 shadow-lg shadow-emerald-500/10"
          >
            <CheckCircle className="w-12 h-12 text-emerald-400" />
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
          
          {/* Order Number */}
          {orderNumber && (
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-sm text-primary font-mono bg-primary/5 border border-primary/20 rounded-xl px-4 py-2 mt-2"
            >
              Order #{orderNumber}
            </motion.p>
          )}
          
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm text-muted/60 text-center mt-3 max-w-xs"
          >
            Your order has been placed successfully. We'll notify you when it's ready.
          </motion.p>

          {/* Estimated Time */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="w-full bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 mt-6"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 flex-shrink-0">
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <h3 className="font-semibold text-amber-400 mb-1">Estimated Time</h3>
                <p className="text-xs text-amber-400/70">
                  Your order will be ready in approximately 15-20 minutes.
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
              className="block w-full bg-gradient-to-r from-primary to-primary/85 hover:from-primary/90 hover:to-primary/90 text-background text-center py-3.5 rounded-xl font-bold transition-all duration-300 shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.01] active:scale-[0.98]"
            >
              <ShoppingBag className="w-5 h-5 inline mr-2" />
              Order More
            </Link>
            
            <Link
              href={`/${menupages}`}
              className="block w-full bg-surface/30 border border-border/30 hover:border-primary/30 text-text hover:text-primary text-center py-3.5 rounded-xl font-medium transition-all duration-300"
            >
              <span className="flex items-center justify-center gap-2">
                Back to Home
                <ArrowRight className="w-4 h-4" />
              </span>
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
        <div className="max-w-md mx-auto bg-card/60 backdrop-blur-sm min-h-screen flex items-center justify-center border border-border/30">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm text-muted/50">Loading confirmation...</p>
          </div>
        </div>
      </div>
    }>
      <OrderConfirmationContent menupages={menupages} />
    </Suspense>
  );
}