"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Receipt, CheckCircle2, Clock, Sparkles, Plus, AlertCircle } from "lucide-react";
import type { ActiveTableTabData } from "./ActiveTableTabBanner";

type TableTabDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  tabData: ActiveTableTabData | null;
  onAddMoreItems: () => void;
};

export default function TableTabDrawer({
  isOpen,
  onClose,
  tabData,
  onAddMoreItems,
}: TableTabDrawerProps) {
  if (!isOpen || !tabData) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: "spring", damping: 25, stiffness: 280 }}
          className="w-full max-w-md bg-[#FBF8F3] rounded-t-3xl sm:rounded-3xl border-t sm:border border-[#E5DFD4] shadow-2xl flex flex-col max-h-[88vh] overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 border-b border-[#E5DFD4] bg-white/70 backdrop-blur-md flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-800">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-text">Active Table Tab</h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-full">
                    Table {tabData.tableNumber}
                  </span>
                </div>
                <p className="text-xs text-muted">
                  {tabData.totalRounds} {tabData.totalRounds === 1 ? 'Round' : 'Rounds'} ordered on this tab
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-surface hover:bg-[#E5DFD4] flex items-center justify-center text-muted hover:text-text transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body / Items Breakdown */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Rounds Overview */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-muted uppercase tracking-wider">
                <span>Ordered Items</span>
                <span>Subtotal</span>
              </div>

              {tabData.rounds.map((round) => {
                const roundItems = tabData.items.filter(i => i.roundNumber === round.roundNumber);
                const statusColor = 
                  round.orderStatus === 'served' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                  round.orderStatus === 'ready' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                  round.orderStatus === 'preparing' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                  'bg-orange-100 text-orange-800 border-orange-300';

                return (
                  <div key={round.orderNumber} className="bg-white rounded-2xl border border-[#E5DFD4] p-3.5 shadow-sm space-y-2.5">
                    <div className="flex items-center justify-between pb-2 border-b border-[#F0EAE1]">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-text">
                          Round #{round.roundNumber}
                        </span>
                        <span className="text-[10px] font-mono text-muted">
                          (Order #{round.orderNumber})
                        </span>
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border capitalize ${statusColor}`}>
                        {round.orderStatus}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {roundItems.map((item, idx) => (
                        <div key={idx} className="flex items-start justify-between text-xs">
                          <div>
                            <span className="font-semibold text-text">
                              {item.quantity}× {item.name}
                            </span>
                            {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                              <div className="text-[11px] text-amber-800 mt-0.5 space-x-1">
                                {item.selectedModifiers.map((m, mIdx) => (
                                  <span key={mIdx} className="inline-block bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                    +{m.name} (₹{m.price})
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <span className="font-mono font-medium text-text">
                            ₹{item.price * item.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bill Summary */}
            <div className="bg-white rounded-2xl border border-[#E5DFD4] p-4 space-y-2 shadow-sm">
              <div className="flex justify-between text-xs text-muted">
                <span>Combined Subtotal</span>
                <span className="font-mono">₹{tabData.subtotal}</span>
              </div>
              {tabData.tax > 0 && (
                <div className="flex justify-between text-xs text-muted">
                  <span>Taxes & GST</span>
                  <span className="font-mono">₹{tabData.tax}</span>
                </div>
              )}
              <div className="pt-2 border-t border-[#E5DFD4] flex justify-between items-center text-sm font-bold text-text">
                <span>Total Active Bill</span>
                <span className="font-mono text-base text-primary">₹{tabData.total}</span>
              </div>
            </div>

            {/* Explanatory note */}
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-900 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Add more beverages, sides, or desserts anytime. All orders for <strong>Table {tabData.tableNumber}</strong> are consolidated into this single tab and settled together when you leave.
              </p>
            </div>
          </div>

          {/* Footer Action */}
          <div className="p-4 border-t border-[#E5DFD4] bg-white/70 backdrop-blur-md">
            <button
              onClick={() => {
                onClose();
                onAddMoreItems();
              }}
              className="w-full py-3.5 px-4 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-sm shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              Add More Items to Tab
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

