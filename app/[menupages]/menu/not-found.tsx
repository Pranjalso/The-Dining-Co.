"use client";
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, AlertCircle, Coffee, Crown, Scan, QrCode, Sparkles, ArrowRight } from 'lucide-react';

export default function CafeNotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-slow delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/3 rounded-full blur-3xl" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-lg w-full text-center relative z-10"
      >
        {/* Logo */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          className="flex items-center justify-center gap-2 mb-8"
        >
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
            <Crown className="w-5 h-5 text-primary" />
          </div>
          <span className="text-xl font-bold text-text tracking-tight">
            The <span className="text-primary">Dining</span> Co.
          </span>
        </motion.div>

        {/* Illustration */}
        <motion.div 
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 20 }}
          className="mb-6"
        >
          <div className="inline-block p-6 bg-rose-500/10 rounded-2xl border border-rose-500/20 shadow-lg shadow-rose-500/5">
            <AlertCircle className="w-20 h-20 text-rose-400" />
          </div>
        </motion.div>

        {/* Error Message */}
        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold text-text tracking-tight mb-3"
        >
          Cafe Not Found
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="text-muted/60 mb-6 text-lg"
        >
          The cafe you're looking for doesn't exist on The Dining Co.
        </motion.p>
        
        {/* Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary/85 hover:from-primary/90 hover:to-primary/90 text-background font-bold rounded-xl transition-all duration-300 shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Home className="w-4 h-4" />
            Go to Home
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* QR Code Scan Info */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="mt-8 p-4 bg-surface/20 border border-border/20 rounded-xl shadow-lg shadow-primary/5"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 flex-shrink-0">
              <QrCode className="w-5 h-5 text-primary" />
            </div>
            <p className="text-xs text-muted/60 text-left">
              <span className="font-semibold text-text">Scanning a QR code?</span><br />
              Make sure you're using the official The Dining Co. QR code from the cafe.
            </p>
          </div>
        </motion.div>

        {/* Help Text */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-[10px] text-muted/30 mt-6 flex items-center justify-center gap-2"
        >
          <span className="w-1 h-1 bg-primary/30 rounded-full"></span>
          Need help? Contact support@thediningco.com
          <span className="w-1 h-1 bg-primary/30 rounded-full"></span>
        </motion.p>
      </motion.div>

      <style jsx global>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        .delay-1000 {
          animation-delay: 1000ms;
        }
      `}</style>
    </div>
  );
}