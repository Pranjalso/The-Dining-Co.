import React, { useState, useEffect } from 'react';
import { X, Plus, Check } from 'lucide-react';
import Image from 'next/image';

export interface ModifierOption {
  name: string;
  price: number;
}

export interface ModifierGroup {
  name: string;
  minSelect?: number;
  maxSelect?: number;
  options: ModifierOption[];
}

export interface SelectedModifier {
  groupName: string;
  name: string;
  price: number;
}

export interface CustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: {
    id: string | number;
    name: string;
    price: number;
    image?: string;
    description?: string;
    modifierGroups?: ModifierGroup[];
  } | null;
  onConfirm: (customizedItem: {
    cartKey: string;
    baseId: string;
    name: string;
    price: number;
    image?: string;
    description?: string;
    selectedModifiers: SelectedModifier[];
  }) => void;
}

export default function ItemCustomizationModal({
  isOpen,
  onClose,
  item,
  onConfirm,
}: CustomizationModalProps) {
  const [selectedMap, setSelectedMap] = useState<Record<string, SelectedModifier[]>>({});

  useEffect(() => {
    if (!item || !item.modifierGroups || item.modifierGroups.length === 0) {
      setSelectedMap({});
      return;
    }

    // Initialize defaults: for single-select groups with minSelect >= 1, pick first option
    const initial: Record<string, SelectedModifier[]> = {};
    item.modifierGroups.forEach((group) => {
      const isSingleSelect = (group.maxSelect ?? 1) === 1;
      const isRequired = (group.minSelect ?? 0) >= 1;
      if (isSingleSelect && isRequired && group.options.length > 0) {
        const first = group.options[0];
        initial[group.name] = [{
          groupName: group.name,
          name: first.name,
          price: first.price,
        }];
      } else {
        initial[group.name] = [];
      }
    });
    setSelectedMap(initial);
  }, [item]);

  if (!isOpen || !item) return null;

  const groups = item.modifierGroups || [];

  const handleOptionToggle = (group: ModifierGroup, opt: ModifierOption) => {
    const isSingle = (group.maxSelect ?? 1) === 1;
    const current = selectedMap[group.name] || [];

    if (isSingle) {
      // Radio mode: replace selection
      setSelectedMap((prev) => ({
        ...prev,
        [group.name]: [{ groupName: group.name, name: opt.name, price: opt.price }],
      }));
    } else {
      // Checkbox mode
      const exists = current.some((s) => s.name === opt.name);
      if (exists) {
        setSelectedMap((prev) => ({
          ...prev,
          [group.name]: current.filter((s) => s.name !== opt.name),
        }));
      } else {
        const max = group.maxSelect ?? 999;
        if (current.length >= max) {
          // If max reached, replace or ignore
          return;
        }
        setSelectedMap((prev) => ({
          ...prev,
          [group.name]: [...current, { groupName: group.name, name: opt.name, price: opt.price }],
        }));
      }
    }
  };

  // Check validation: each required group must have at least minSelect
  const isValid = groups.every((group) => {
    const min = group.minSelect ?? 0;
    if (min === 0) return true;
    const count = (selectedMap[group.name] || []).length;
    return count >= min;
  });

  // Calculate total extra modifier price
  const allSelected: SelectedModifier[] = Object.values(selectedMap).flat();
  const modifiersExtra = allSelected.reduce((sum, m) => sum + m.price, 0);
  const finalUnitPrice = item.price + modifiersExtra;

  const handleAdd = () => {
    if (!isValid) return;

    // Generate deterministic cartKey for grouping
    // Format: id::GroupName:Option,Option|GroupName:Option
    const sorted = [...allSelected].sort((a, b) => {
      const gComp = a.groupName.localeCompare(b.groupName);
      if (gComp !== 0) return gComp;
      return a.name.localeCompare(b.name);
    });

    const modSignature = sorted.map((m) => `${m.groupName}:${m.name}`).join('|');
    const cartKey = modSignature ? `${item.id}::${modSignature}` : String(item.id);

    onConfirm({
      cartKey,
      baseId: String(item.id),
      name: item.name,
      price: finalUnitPrice,
      image: item.image,
      description: item.description,
      selectedModifiers: allSelected,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-900/60 backdrop-blur-sm transition-opacity">
      <div
        className="w-full max-w-lg bg-[#FAF8F5] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-[#E5DFD4] overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in slide-in-from-bottom-6 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="relative p-4 sm:p-5 border-b border-[#E5DFD4] bg-white flex items-start gap-3.5">
          {item.image && (
            <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-stone-100 flex-shrink-0 border border-[#E5DFD4]">
              <Image
                src={item.image}
                alt={item.name}
                fill
                sizes="64px"
                className="object-cover"
              />
            </div>
          )}
          <div className="min-w-0 flex-1 pr-6">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#B8860B]/10 text-[#9C7006] text-[10px] font-bold uppercase tracking-wider mb-1">
              Customize Dish
            </div>
            <h3 className="text-base sm:text-lg font-black text-stone-900 leading-snug truncate">
              {item.name}
            </h3>
            <p className="text-xs font-black text-[#B8860B] font-price">
              Base: ₹{item.price}
            </p>
          </div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-900 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Modifier Groups */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 divide-y divide-[#E5DFD4]/60">
          {groups.map((group, gIdx) => {
            const isSingle = (group.maxSelect ?? 1) === 1;
            const isRequired = (group.minSelect ?? 0) >= 1;
            const currentSelected = selectedMap[group.name] || [];

            return (
              <div key={gIdx} className={gIdx === 0 ? '' : 'pt-5'}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                      <span>{group.name}</span>
                      {isRequired ? (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                          Required
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-stone-500">
                          Optional
                        </span>
                      )}
                    </h4>
                    <p className="text-[11px] text-stone-500">
                      {isSingle
                        ? 'Select 1 option'
                        : `Choose up to ${group.maxSelect ?? group.options.length} options`}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {group.options.map((opt, oIdx) => {
                    const isSelected = currentSelected.some((s) => s.name === opt.name);

                    return (
                      <button
                        key={oIdx}
                        type="button"
                        onClick={() => handleOptionToggle(group, opt)}
                        className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all duration-150 cursor-pointer ${
                          isSelected
                            ? 'bg-[#B8860B]/10 border-[#B8860B] text-stone-900 shadow-2xs'
                            : 'bg-white border-[#E5DFD4] hover:border-stone-400 text-stone-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                          <div
                            className={`w-4 h-4 rounded-${
                              isSingle ? 'full' : 'md'
                            } flex items-center justify-center border transition-colors ${
                              isSelected
                                ? 'bg-[#B8860B] border-[#B8860B] text-white'
                                : 'border-stone-300 bg-white'
                            }`}
                          >
                            {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          </div>
                          <span className="text-xs font-semibold truncate">
                            {opt.name}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-[#B8860B] whitespace-nowrap font-price">
                          {opt.price > 0 ? `+₹${opt.price}` : 'Free'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Summary & Add to Cart */}
        <div className="p-4 sm:p-5 bg-white border-t border-[#E5DFD4] flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
              Total Item Price
            </p>
            <p className="text-lg font-black text-stone-900 font-price tabular-nums">
              ₹{finalUnitPrice}
            </p>
          </div>
          <button
            onClick={handleAdd}
            disabled={!isValid}
            className={`px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-md cursor-pointer ${
              isValid
                ? 'bg-gradient-to-r from-[#B8860B] to-[#9C7006] text-white hover:brightness-105 active:scale-95'
                : 'bg-stone-200 text-stone-400 cursor-not-allowed'
            }`}
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            Add to Order • ₹{finalUnitPrice}
          </button>
        </div>
      </div>
    </div>
  );
}

