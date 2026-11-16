"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Trash2, Sliders, Check, AlertCircle } from "lucide-react";

export type ModifierOption = {
  name: string;
  price: number;
};

export type ModifierGroup = {
  name: string;
  minSelect: number;
  maxSelect: number;
  options: ModifierOption[];
};

type ItemModifiersModalProps = {
  isOpen: boolean;
  onClose: () => void;
  itemName: string;
  initialGroups?: ModifierGroup[];
  onSave: (groups: ModifierGroup[]) => Promise<void>;
};

export default function ItemModifiersModal({
  isOpen,
  onClose,
  itemName,
  initialGroups = [],
  onSave,
}: ItemModifiersModalProps) {
  const [groups, setGroups] = useState<ModifierGroup[]>(
    initialGroups.length > 0
      ? JSON.parse(JSON.stringify(initialGroups))
      : [
          {
            name: "Add-ons & Variations",
            minSelect: 0,
            maxSelect: 3,
            options: [
              { name: "Extra Cheese", price: 30 },
              { name: "Extra Dip", price: 20 },
            ],
          },
        ]
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Add new group
  const addGroup = () => {
    setGroups((prev) => [
      ...prev,
      {
        name: "New Customization Group",
        minSelect: 0,
        maxSelect: 1,
        options: [{ name: "Option 1", price: 0 }],
      },
    ]);
  };

  // Remove group
  const removeGroup = (index: number) => {
    setGroups((prev) => prev.filter((_, i) => i !== index));
  };

  // Update group field
  const updateGroup = (index: number, field: keyof ModifierGroup, value: any) => {
    setGroups((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  // Add option to group
  const addOption = (groupIndex: number) => {
    setGroups((prev) => {
      const copy = [...prev];
      copy[groupIndex].options.push({ name: "", price: 0 });
      return copy;
    });
  };

  // Remove option from group
  const removeOption = (groupIndex: number, optIndex: number) => {
    setGroups((prev) => {
      const copy = [...prev];
      copy[groupIndex].options = copy[groupIndex].options.filter((_, i) => i !== optIndex);
      return copy;
    });
  };

  // Update option
  const updateOption = (
    groupIndex: number,
    optIndex: number,
    field: keyof ModifierOption,
    value: any
  ) => {
    setGroups((prev) => {
      const copy = [...prev];
      copy[groupIndex].options[optIndex] = {
        ...copy[groupIndex].options[optIndex],
        [field]: value,
      };
      return copy;
    });
  };

  const handleSave = async () => {
    setError(null);
    // Validate
    for (const g of groups) {
      if (!g.name.trim()) {
        setError("Every customization group must have a name");
        return;
      }
      if (g.options.length === 0) {
        setError(`Group "${g.name}" must have at least 1 option`);
        return;
      }
      for (const opt of g.options) {
        if (!opt.name.trim()) {
          setError(`All options in "${g.name}" must have a name`);
          return;
        }
        if (opt.price < 0 || isNaN(opt.price)) {
          setError(`Price for "${opt.name}" cannot be negative`);
          return;
        }
      }
    }

    try {
      setSaving(true);
      await onSave(groups);
      onClose();
    } catch (e: any) {
      setError(e.message || "Failed to save modifiers");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-2xl bg-[#FBF8F3] border border-[#E5DFD4] rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-[#E5DFD4] bg-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-center text-primary">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base sm:text-lg text-text tracking-tight">
                  Item Customizations & Add-ons
                </h3>
                <p className="text-xs text-muted truncate max-w-xs sm:max-w-md">
                  {itemName}
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

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {groups.length === 0 ? (
              <div className="text-center py-10 border-2 border-dashed border-[#E5DFD4] rounded-2xl bg-white/50 p-6">
                <Sliders className="w-10 h-10 text-muted/40 mx-auto mb-2" />
                <h4 className="font-bold text-sm text-text">No Customizations Yet</h4>
                <p className="text-xs text-muted max-w-sm mx-auto mt-1 mb-4">
                  Add milk choices, extra cheese, sizes, or spice levels so customers can personalize this dish.
                </p>
                <button
                  type="button"
                  onClick={addGroup}
                  className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold shadow-md shadow-primary/20 inline-flex items-center gap-1.5 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Add First Group
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                {groups.map((group, gIdx) => (
                  <div
                    key={gIdx}
                    className="bg-white border border-[#E5DFD4] rounded-2xl p-4 sm:p-5 shadow-sm space-y-4"
                  >
                    {/* Group Title and Controls */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F0EAE1]">
                      <div className="flex-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted block mb-1">
                          Group Name
                        </label>
                        <input
                          type="text"
                          value={group.name}
                          onChange={(e) => updateGroup(gIdx, "name", e.target.value)}
                          placeholder="e.g. Milk Choice, Extra Dips, Size"
                          className="w-full text-sm font-bold text-text bg-[#FBF8F3] border border-[#E5DFD4] rounded-xl px-3 py-1.5 focus:border-primary focus:outline-none"
                        />
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Single vs Multiple choice */}
                        <div>
                          <label className="text-[10px] font-bold uppercase tracking-wider text-muted block mb-1">
                            Selection Type
                          </label>
                          <select
                            value={group.maxSelect === 1 ? "single" : "multiple"}
                            onChange={(e) => {
                              const isSingle = e.target.value === "single";
                              updateGroup(gIdx, "maxSelect", isSingle ? 1 : 3);
                            }}
                            className="text-xs font-semibold bg-[#FBF8F3] border border-[#E5DFD4] rounded-xl px-3 py-1.5 focus:border-primary focus:outline-none text-text"
                          >
                            <option value="single">Single Choice (Radio)</option>
                            <option value="multiple">Multiple Choice (Checkboxes)</option>
                          </select>
                        </div>

                        {/* Optional vs Required */}
                        <div>
                          <label className="text-[10px] font-bold uppercase tracking-wider text-muted block mb-1">
                            Requirement
                          </label>
                          <select
                            value={group.minSelect > 0 ? "required" : "optional"}
                            onChange={(e) => {
                              updateGroup(gIdx, "minSelect", e.target.value === "required" ? 1 : 0);
                            }}
                            className="text-xs font-semibold bg-[#FBF8F3] border border-[#E5DFD4] rounded-xl px-3 py-1.5 focus:border-primary focus:outline-none text-text"
                          >
                            <option value="optional">Optional</option>
                            <option value="required">Required (Min 1)</option>
                          </select>
                        </div>

                        {/* Delete group */}
                        <div className="pt-4">
                          <button
                            type="button"
                            onClick={() => removeGroup(gIdx)}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                            title="Delete Group"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Options list */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-muted px-1">
                        <span>Option Name</span>
                        <span className="w-24 text-right pr-8">Extra Price (₹)</span>
                      </div>

                      {group.options.map((opt, optIdx) => (
                        <div key={optIdx} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={opt.name}
                            onChange={(e) => updateOption(gIdx, optIdx, "name", e.target.value)}
                            placeholder="e.g. Almond Milk, Truffle Oil, Cheddar Melt"
                            className="flex-1 text-xs font-medium text-text bg-[#FBF8F3] border border-[#E5DFD4] rounded-xl px-3 py-2 focus:border-primary focus:outline-none"
                          />
                          <div className="relative w-24">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted font-bold">
                              +₹
                            </span>
                            <input
                              type="number"
                              min="0"
                              value={opt.price}
                              onChange={(e) =>
                                updateOption(
                                  gIdx,
                                  optIdx,
                                  "price",
                                  Math.max(0, parseInt(e.target.value, 10) || 0)
                                )
                              }
                              placeholder="0"
                              className="w-full text-xs font-bold text-text bg-[#FBF8F3] border border-[#E5DFD4] rounded-xl pl-8 pr-2.5 py-2 focus:border-primary focus:outline-none text-right font-price"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeOption(gIdx, optIdx)}
                            className="p-2 text-stone-400 hover:text-rose-500 transition-colors"
                            title="Remove Option"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => addOption(gIdx)}
                        className="mt-1 text-xs font-bold text-primary hover:text-primary-hover inline-flex items-center gap-1 py-1 px-2 rounded-lg hover:bg-primary/5 transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Option to &ldquo;{group.name || "Group"}&rdquo;
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addGroup}
                  className="w-full py-3 bg-white hover:bg-surface border-2 border-dashed border-primary/30 hover:border-primary/60 text-primary rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
                >
                  <Plus className="w-4 h-4" />
                  Add Another Customization Group
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 sm:p-5 border-t border-[#E5DFD4] bg-white flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#E5DFD4] text-xs font-bold text-stone-600 hover:bg-[#FBF8F3] transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary-hover text-white text-xs font-bold shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              {saving ? "Saving..." : "Save Customizations"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

