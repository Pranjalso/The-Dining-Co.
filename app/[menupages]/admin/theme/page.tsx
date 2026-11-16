"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Palette, 
  Check, 
  Sparkles, 
  Eye, 
  Save, 
  RotateCcw, 
  Store, 
  Smartphone,
  ChevronRight,
  ShieldCheck,
  ShoppingBag,
  Sliders,
  Utensils
} from "lucide-react";
import useSWR, { mutate } from "swr";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type ThemeId = "warm-beige" | "red-black" | "light-green-creme";

interface ThemeOption {
  id: ThemeId;
  name: string;
  tagline: string;
  description: string;
  badge: string;
  colors: {
    primary: string;
    background: string;
    surface: string;
    text: string;
    accent: string;
    border: string;
  };
  preview: {
    navbar: string;
    cardBg: string;
    btnBg: string;
    btnText: string;
    activeTab: string;
  };
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    id: "warm-beige",
    name: "1) Warm Beige & Gold (Current)",
    tagline: "Classic Luxury Dining",
    description: "The signature aesthetic with warm cream tones, rich Tuscan gold accents, and deep charcoal typography. Perfect for fine dining and boutique cafes.",
    badge: "Default Heritage",
    colors: {
      primary: "#B8860B",
      background: "#FBF8F3",
      surface: "#F3EFE6",
      text: "#1C1917",
      accent: "#8B3A2B",
      border: "#E5DFD4",
    },
    preview: {
      navbar: "bg-[#FBF8F3] border-[#E5DFD4]",
      cardBg: "bg-white border-[#E5DFD4] text-[#1C1917]",
      btnBg: "bg-[#B8860B] text-white",
      btnText: "text-[#B8860B]",
      activeTab: "bg-[#B8860B] text-white border-[#B8860B]",
    }
  },
  {
    id: "red-black",
    name: "2) Red + Black",
    tagline: "Bold Gourmet & High-Energy Bistro",
    description: "Deep obsidian black surfaces with high-energy crimson red highlights and sharp modern contrast. Ideal for grills, pubs, burger lounges, and nightlife dining.",
    badge: "High Energy",
    colors: {
      primary: "#E50914",
      background: "#0E0E10",
      surface: "#18181D",
      text: "#FFFFFF",
      accent: "#FF4D4D",
      border: "#2E2E38",
    },
    preview: {
      navbar: "bg-[#0E0E10] border-[#2E2E38]",
      cardBg: "bg-[#18181D] border-[#2E2E38] text-white",
      btnBg: "bg-[#E50914] text-white",
      btnText: "text-[#E50914]",
      activeTab: "bg-[#E50914] text-white border-[#E50914]",
    }
  },
  {
    id: "light-green-creme",
    name: "3) Light Green & Creme",
    tagline: "Fresh Organic & Botanical Cafe",
    description: "Crisp botanical sage green paired with soothing creme and soft pistachio hues. Elevates health cafes, smoothie bars, bakeries, and organic bistros.",
    badge: "Fresh & Organic",
    colors: {
      primary: "#2D6A4F",
      background: "#F7FAF6",
      surface: "#EEF5ED",
      text: "#1B2E24",
      accent: "#52B788",
      border: "#D3E4D1",
    },
    preview: {
      navbar: "bg-[#F7FAF6] border-[#D3E4D1]",
      cardBg: "bg-white border-[#D3E4D1] text-[#1B2E24]",
      btnBg: "bg-[#2D6A4F] text-white",
      btnText: "text-[#2D6A4F]",
      activeTab: "bg-[#2D6A4F] text-white border-[#2D6A4F]",
    }
  }
];

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function ThemeCustomizationPage() {
  const params = useParams();
  const slug = (params?.menupages as string) || "";
  const { toast } = useToast();

  const cafeUrl = slug ? `/api/cafes/${slug}/self` : null;
  const { data: cafeData, isLoading } = useSWR(cafeUrl, fetcher);

  const [selectedTheme, setSelectedTheme] = useState<ThemeId>("warm-beige");
  const [activeSavedTheme, setActiveSavedTheme] = useState<ThemeId>("warm-beige");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (cafeData?.success && cafeData.data?.theme) {
      setSelectedTheme(cafeData.data.theme);
      setActiveSavedTheme(cafeData.data.theme);
    }
  }, [cafeData]);

  // Apply preview theme directly to the root element for instant live preview
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', selectedTheme);
    }
    return () => {
      // Revert to active saved theme on unmount
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', activeSavedTheme);
      }
    };
  }, [selectedTheme, activeSavedTheme]);

  const handleSaveTheme = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/cafes/${slug}/self`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: selectedTheme }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to update theme");
      }

      setActiveSavedTheme(selectedTheme);
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', selectedTheme);
        window.localStorage.setItem(`sd:theme:${slug}`, selectedTheme);
      }

      // Revalidate SWR caches for both admin and customer public endpoint
      if (cafeUrl) mutate(cafeUrl);
      mutate(`/api/cafes/${slug}/public`);

      toast({
        title: "Theme Applied Successfully!",
        description: `Your cafe menu and admin theme has been updated to "${THEME_OPTIONS.find(t => t.id === selectedTheme)?.name}". Customers will now see this new theme immediately.`,
      });
    } catch (e: any) {
      toast({
        title: "Error saving theme",
        description: e.message || "Please check your network and try again",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const currentThemeObj = THEME_OPTIONS.find(t => t.id === selectedTheme) || THEME_OPTIONS[0];

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20 mb-2">
            <Palette className="w-3.5 h-3.5" />
            <span>Theme & Visual Branding</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight">
            Cafe Theme Customization
          </h1>
          <p className="text-sm text-muted mt-1 max-w-xl">
            Choose the visual palette for your cafe. The selected theme reflects seamlessly across both your customer digital menu and manager dashboards.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => setSelectedTheme(activeSavedTheme)}
            variant="outline"
            disabled={saving || selectedTheme === activeSavedTheme}
            className="rounded-xl border-border hover:bg-surface text-text font-semibold flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>

          <Button
            onClick={handleSaveTheme}
            disabled={saving || isLoading}
            className="rounded-xl bg-primary hover:bg-primary-hover text-white font-bold px-6 py-2.5 shadow-md shadow-primary/20 flex items-center gap-2 transition-all hover:scale-[1.02]"
          >
            <Save className="w-4 h-4" />
            {saving ? "Applying Theme..." : "Save & Publish Theme"}
          </Button>
        </div>
      </div>

      {/* Main Grid: Theme Cards + Live Interactive Mockup */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Theme Selectors */}
        <div className="lg:col-span-7 space-y-4">
          <h2 className="text-base font-bold text-text flex items-center gap-2">
            <Sliders className="w-4 h-4 text-primary" />
            Available Theme Palettes
          </h2>

          <div className="space-y-4">
            {THEME_OPTIONS.map((theme) => {
              const isSelected = selectedTheme === theme.id;
              const isCurrentlyActive = activeSavedTheme === theme.id;

              return (
                <motion.div
                  key={theme.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setSelectedTheme(theme.id)}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 relative overflow-hidden bg-card shadow-sm ${
                    isSelected
                      ? "border-primary ring-2 ring-primary/20 shadow-md"
                      : "border-border hover:border-border/80"
                  }`}
                >
                  {/* Active Published Badge */}
                  {isCurrentlyActive && (
                    <div className="absolute top-4 right-4 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      Live in Cafe
                    </div>
                  )}

                  <div className="flex items-start gap-4">
                    {/* Color Swatch Stack */}
                    <div className="flex flex-col gap-1.5 pt-1">
                      <div className="flex items-center gap-1.5">
                        <div 
                          className="w-6 h-6 rounded-lg shadow-xs border border-black/10" 
                          style={{ backgroundColor: theme.colors.primary }}
                          title="Primary Brand Color"
                        />
                        <div 
                          className="w-6 h-6 rounded-lg shadow-xs border border-black/10" 
                          style={{ backgroundColor: theme.colors.background }}
                          title="Background Canvas"
                        />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div 
                          className="w-6 h-6 rounded-lg shadow-xs border border-black/10" 
                          style={{ backgroundColor: theme.colors.surface }}
                          title="Surface / Cards"
                        />
                        <div 
                          className="w-6 h-6 rounded-lg shadow-xs border border-black/10" 
                          style={{ backgroundColor: theme.colors.text }}
                          title="Typography Color"
                        />
                      </div>
                    </div>

                    {/* Theme Details */}
                    <div className="flex-1 min-w-0 pr-16">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-extrabold text-base text-text">
                          {theme.name}
                        </h3>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-surface text-muted border border-border">
                          {theme.badge}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-primary mt-0.5">
                        {theme.tagline}
                      </p>
                      <p className="text-xs text-muted mt-1.5 leading-relaxed">
                        {theme.description}
                      </p>

                      {/* Color Palette Pill Preview */}
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/60 text-[11px]">
                        <span className="text-muted text-[10px] uppercase font-bold tracking-wider">Accent:</span>
                        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-surface border border-border text-text">
                          {theme.colors.primary}
                        </span>
                        <span className="text-muted text-[10px] uppercase font-bold tracking-wider ml-2">Canvas:</span>
                        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-surface border border-border text-text">
                          {theme.colors.background}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Radio Indicator */}
                  <div className="absolute bottom-5 right-5">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                      isSelected 
                        ? "bg-primary text-white border-primary shadow-xs" 
                        : "border-border bg-surface/50 text-transparent"
                    }`}>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Live Mobile Mockup Preview */}
        <div className="lg:col-span-5 sticky top-6">
          <div className="bg-card border border-border rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold text-text uppercase tracking-wider">
                  Live Customer Menu Preview
                </span>
              </div>
              <span className="text-[11px] font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
                {currentThemeObj.badge}
              </span>
            </div>

            {/* Mobile Viewport Simulation */}
            <div 
              className="w-full max-w-[320px] mx-auto rounded-[2.5rem] p-3 shadow-xl border-4 transition-colors duration-500 overflow-hidden"
              style={{
                backgroundColor: currentThemeObj.colors.background,
                borderColor: currentThemeObj.colors.border,
                color: currentThemeObj.colors.text
              }}
            >
              {/* Speaker Notch */}
              <div className="w-24 h-4 bg-black/20 rounded-full mx-auto mb-3" />

              {/* Cafe Mini Nav */}
              <div 
                className="rounded-2xl p-3 flex items-center justify-between border transition-colors duration-500 mb-3"
                style={{
                  backgroundColor: currentThemeObj.colors.surface,
                  borderColor: currentThemeObj.colors.border,
                }}
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider block opacity-70">
                    Digital Menu
                  </span>
                  <strong className="text-xs font-black">
                    Ignite Aeros Cafe
                  </strong>
                </div>
                <div 
                  className="w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs"
                  style={{
                    backgroundColor: currentThemeObj.colors.primary,
                    color: '#FFFFFF'
                  }}
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Table Tab Active Pill */}
              <div 
                className="rounded-xl p-2.5 text-center text-xs font-bold mb-3 border transition-colors duration-500 flex items-center justify-between"
                style={{
                  backgroundColor: currentThemeObj.colors.surface,
                  borderColor: currentThemeObj.colors.border
                }}
              >
                <div className="flex items-center gap-1.5 text-[11px]">
                  <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: currentThemeObj.colors.primary }} />
                  <span>Table 04 Active Tab</span>
                </div>
                <span className="text-[10px] font-extrabold" style={{ color: currentThemeObj.colors.primary }}>
                  ₹630 &gt;
                </span>
              </div>

              {/* Sample Dish Card */}
              <div 
                className="rounded-2xl p-3 border shadow-xs transition-colors duration-500 mb-3"
                style={{
                  backgroundColor: currentThemeObj.id === 'red-black' ? '#18181D' : '#FFFFFF',
                  borderColor: currentThemeObj.colors.border
                }}
              >
                <div className="flex items-center gap-2.5">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: currentThemeObj.colors.surface }}
                  >
                    <Utensils className="w-5 h-5 opacity-70" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <strong className="text-xs font-bold block truncate">
                      Truffle Parmesan Hand-Cut Fries
                    </strong>
                    <span className="text-[11px] font-extrabold mt-0.5 block">
                      ₹220
                    </span>
                  </div>
                  <button
                    type="button"
                    className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition-all shadow-xs"
                    style={{
                      backgroundColor: currentThemeObj.colors.primary,
                      color: '#FFFFFF'
                    }}
                  >
                    + Add
                  </button>
                </div>
              </div>

              {/* Second Sample Dish Card */}
              <div 
                className="rounded-2xl p-3 border shadow-xs transition-colors duration-500"
                style={{
                  backgroundColor: currentThemeObj.id === 'red-black' ? '#18181D' : '#FFFFFF',
                  borderColor: currentThemeObj.colors.border
                }}
              >
                <div className="flex items-center gap-2.5">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: currentThemeObj.colors.surface }}
                  >
                    <Sparkles className="w-5 h-5 opacity-70" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <strong className="text-xs font-bold block truncate">
                      Blue Aero Ocean Sparkler
                    </strong>
                    <span className="text-[11px] font-extrabold mt-0.5 block">
                      ₹180
                    </span>
                  </div>
                  <button
                    type="button"
                    className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition-all shadow-xs"
                    style={{
                      backgroundColor: currentThemeObj.colors.primary,
                      color: '#FFFFFF'
                    }}
                  >
                    + Add
                  </button>
                </div>
              </div>

              {/* Bottom Sticky Action Bar */}
              <div 
                className="mt-4 pt-3 border-t flex items-center justify-between"
                style={{ borderColor: currentThemeObj.colors.border }}
              >
                <span className="text-[10px] font-bold opacity-75">1 Item Selected</span>
                <span 
                  className="px-3 py-1.5 rounded-xl text-[10px] font-extrabold shadow-sm"
                  style={{
                    backgroundColor: currentThemeObj.colors.primary,
                    color: '#FFFFFF'
                  }}
                >
                  View Tab & Checkout →
                </span>
              </div>
            </div>

            <p className="text-[11px] text-muted text-center pt-2">
              Preview updates live as you click between options. Hit &ldquo;Save & Publish Theme&rdquo; to push it live to all customers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

