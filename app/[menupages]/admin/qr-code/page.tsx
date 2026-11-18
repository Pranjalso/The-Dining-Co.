"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  QrCode as QrIcon,
  Download,
  Printer,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  Layers,
  UtensilsCrossed,
  Smartphone,
  Eye,
  Plus,
  Trash2,
  Save,
  Grid,
  Maximize2,
  Sliders,
  CheckCircle2,
  Loader2,
  AlertCircle,
  FileText,
} from "lucide-react";
import useSWR, { mutate } from "swr";
import { QrCode, generateQrSvgPath, getQrPngDataUrl } from "@/lib/qrcode";
import {
  formatTableLabel,
  formatTableBadge,
  downloadStandeesPdf,
  printStandeesInIsolatedFrame,
  drawMiniStandeeToCanvas,
  downloadMiniStandeesPdf,
  printMiniStandeesInIsolatedFrame,
  canvasToJpegBytes,
  downloadBlob,
} from "@/lib/pdf-standee";
import { Button } from "@/components/ui/button";
import {
  useToast,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
} from "@/hooks/use-toast";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function CafeMenuQrPage() {
  const params = useParams();
  const menupages = (params?.menupages as string) || "";
  const { toast, toasts, dismiss } = useToast();

  // Fetch cafe details
  const { data: cafeData, isLoading } = useSWR(
    menupages ? `/api/cafes/${menupages}/self` : null,
    fetcher
  );

  const cafeName = cafeData?.data?.cafeName || menupages || "Cafe";

  const [origin, setOrigin] = useState("");
  const [activeTab, setActiveTab] = useState<"single" | "grid">("single");

  // Configured tables list
  const [tables, setTables] = useState<string[]>([]);
  const [newTableInput, setNewTableInput] = useState("");
  const [selectedTable, setSelectedTable] = useState<string>("1");
  const [copied, setCopied] = useState(false);
  const [isSavingTables, setIsSavingTables] = useState(false);
  const [isDownloadingBulk, setIsDownloadingBulk] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [printBulkMode, setPrintBulkMode] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);

  const currentTheme = cafeData?.data?.theme || "warm-beige";
  const themeAccentColor =
    currentTheme === "red-black"
      ? "#E50914"
      : currentTheme === "light-green-creme"
      ? "#15803D"
      : "#D97706";

  // Check if cafe is Ignite Aeros (custom easel standee)
  const isIgniteAeros =
    menupages.toLowerCase().includes("ignite-aeros") ||
    cafeData?.data?.slug?.toLowerCase()?.includes("ignite-aeros") ||
    cafeData?.data?.cafeName?.toLowerCase()?.includes("ignite aeros");

  // Standee physical format: mini-easel (57.5 x 88 mm) or standard (A4 poster)
  const [standeeFormat, setStandeeFormat] = useState<"mini-easel" | "standard">("mini-easel");
  const [miniOrientation, setMiniOrientation] = useState<"portrait" | "landscape">("portrait");

  useEffect(() => {
    if (isIgniteAeros) {
      setStandeeFormat("mini-easel");
    }
  }, [isIgniteAeros]);

  // Initialize tables from API data
  useEffect(() => {
    if (cafeData?.success && Array.isArray(cafeData?.data?.tables)) {
      if (cafeData.data.tables.length > 0) {
        setTables(cafeData.data.tables);
      } else {
        // Default tables if none configured yet
        setTables(["1", "2", "3", "4", "5"]);
      }
    }
  }, [cafeData]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  // Compute effective table label & final menu URL for single view
  const effectiveTable = selectedTable === "general" ? "" : selectedTable;

  const getMenuUrlForTable = (table: string) => {
    if (!origin) return `/${menupages}/menu?scan=1`;
    return table
      ? `${origin}/${menupages}/menu?table=${encodeURIComponent(table)}&scan=1`
      : `${origin}/${menupages}/menu?scan=1`;
  };

  const currentMenuUrl = getMenuUrlForTable(effectiveTable);

  // Generate SVG path for the selected QR Code
  let qrSvg: { path: string; viewBoxSize: number } | null = null;
  try {
    if (currentMenuUrl) {
      const qr = QrCode.encodeText(currentMenuUrl);
      qrSvg = generateQrSvgPath(qr, 3);
    }
  } catch (err) {
    console.error("QR Code Generation error:", err);
  }

  // Handle Save Tables to Database
  const handleSaveTables = async (tablesToSave: string[]) => {
    setIsSavingTables(true);
    try {
      const res = await fetch(`/api/cafes/${menupages}/self`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tables: tablesToSave }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to save tables");
      }
      mutate(`/api/cafes/${menupages}/self`);
      mutate(`/api/cafes/${menupages}/public`);
      toast({
        title: "Tables Saved",
        description: `Successfully saved ${tablesToSave.length} tables to your restaurant configuration.`,
      });
    } catch (e: any) {
      toast({
        title: "Failed to Save",
        description: e.message || "Could not save tables",
        variant: "destructive" as any,
      });
    } finally {
      setIsSavingTables(false);
    }
  };

  // Add a single custom table
  const handleAddTable = () => {
    const trimmed = newTableInput.trim();
    if (!trimmed) return;
    if (tables.includes(trimmed)) {
      toast({
        title: "Table Exists",
        description: `Table "${trimmed}" is already in your tables list.`,
        variant: "destructive" as any,
      });
      return;
    }
    const updated = [...tables, trimmed];
    setTables(updated);
    setNewTableInput("");
    setSelectedTable(trimmed);
    handleSaveTables(updated);
  };

  // Quick Bulk Generator: Add 1 to N tables
  const handleQuickAddPreset = (count: number) => {
    const newSet = new Set(tables);
    for (let i = 1; i <= count; i++) {
      newSet.add(String(i));
    }
    const updated = Array.from(newSet).sort((a, b) => {
      const numA = parseInt(a, 10);
      const numB = parseInt(b, 10);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return a.localeCompare(b);
    });
    setTables(updated);
    handleSaveTables(updated);
  };

  // Remove a table
  const handleRemoveTable = (tableToRemove: string) => {
    const updated = tables.filter((t) => t !== tableToRemove);
    setTables(updated);
    if (selectedTable === tableToRemove) {
      setSelectedTable(updated[0] || "general");
    }
    handleSaveTables(updated);
  };

  // Copy single menu link
  const handleCopy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(currentMenuUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Link Copied!",
        description: "Menu URL copied to clipboard.",
      });
    }
  };

  // Download single table PNG
  const handleDownloadSinglePng = (tableName?: string) => {
    const targetTable = tableName !== undefined ? tableName : effectiveTable;
    const targetUrl = getMenuUrlForTable(targetTable);
    try {
      const badge = formatTableBadge(targetTable);
      const safeBadge = badge.replace(/\s+/g, "-");
      const safeCafe = cafeName.replace(/\s+/g, "-");

      if (standeeFormat === "mini-easel") {
        const canvas = drawMiniStandeeToCanvas(cafeName, targetTable, targetUrl, {
          orientation: miniOrientation,
          accentColor: themeAccentColor,
          showGuides: true,
        });
        const dataUrl = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.download = `${safeCafe}-${safeBadge}-mini-standee.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }

      const dataUrl = getQrPngDataUrl(targetUrl, 1024, 4, "#000000", "#FFFFFF");
      if (!dataUrl) return;

      const link = document.createElement("a");
      const filename = `${safeCafe}-${safeBadge}-QR.png`;
      link.download = filename;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Failed to download PNG:", err);
    }
  };

  // Download single table standee as a real high-res PDF file
  const handleDownloadSinglePdf = async (tableName?: string) => {
    const targetTable = tableName !== undefined ? tableName : effectiveTable;
    const targetUrl = getMenuUrlForTable(targetTable);
    const badge = formatTableBadge(targetTable);
    const safeBadge = badge.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const safeCafe = cafeName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const filename = standeeFormat === "mini-easel"
      ? `${safeCafe}-${safeBadge}-mini-standee.pdf`
      : `${safeCafe}-${safeBadge}-standee.pdf`;

    setIsGeneratingPdf(true);
    toast({
      title: "Generating Standee PDF",
      description: standeeFormat === "mini-easel"
        ? `Creating exact scale mini easel PDF (57.5 × 88 mm) for ${badge}...`
        : `Creating high-resolution print PDF for ${badge}...`,
    });

    try {
      if (standeeFormat === "mini-easel") {
        await downloadMiniStandeesPdf(
          cafeName,
          [{ tableLabel: targetTable, url: targetUrl }],
          filename,
          { orientation: miniOrientation, accentColor: themeAccentColor }
        );
      } else {
        await downloadStandeesPdf(
          cafeName,
          [{ tableLabel: targetTable, url: targetUrl }],
          filename,
          themeAccentColor
        );
      }
      toast({
        title: "PDF Ready!",
        description: `${badge} standee PDF has been downloaded.`,
      });
    } catch (err: any) {
      toast({
        title: "PDF Generation Error",
        description: err.message || "Failed to generate PDF",
        variant: "destructive" as any,
      });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Bulk Download All Tables as a single, multi-page, high-res PDF
  const handleDownloadAllPdf = async () => {
    if (tables.length === 0) return;
    setIsDownloadingBulk(true);
    toast({
      title: "Generating All Tables PDF",
      description: standeeFormat === "mini-easel"
        ? `Building printable A4 cut-out sheets for all ${tables.length} tables (57.5 × 88 mm)...`
        : `Building a complete ${tables.length}-page high-resolution print PDF...`,
    });

    try {
      const items = tables.map((t) => ({
        tableLabel: t,
        url: getMenuUrlForTable(t),
      }));

      const safeCafe = cafeName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const filename = standeeFormat === "mini-easel"
        ? `${safeCafe}-all-tables-mini-standees-sheet.pdf`
        : `${safeCafe}-all-tables-standees.pdf`;

      if (standeeFormat === "mini-easel") {
        await downloadMiniStandeesPdf(
          cafeName,
          items,
          filename,
          { orientation: miniOrientation, accentColor: themeAccentColor }
        );
      } else {
        await downloadStandeesPdf(cafeName, items, filename, themeAccentColor);
      }

      toast({
        title: "All Tables PDF Downloaded!",
        description: standeeFormat === "mini-easel"
          ? `Complete ${tables.length}-table printable cut-out sheet is ready.`
          : `Complete ${tables.length}-page table standees PDF is ready.`,
      });
    } catch (err: any) {
      toast({
        title: "Failed to Generate PDF",
        description: err.message || "Could not generate multi-page PDF",
        variant: "destructive" as any,
      });
    } finally {
      setIsDownloadingBulk(false);
    }
  };

  // Bulk Download All QRs as PNGs sequentially
  const handleDownloadAllQrs = async () => {
    if (tables.length === 0) return;
    setIsDownloadingBulk(true);
    toast({
      title: "Downloading All QRs",
      description: `Generating high-res images for ${tables.length} tables...`,
    });

    try {
      // Also download General QR
      handleDownloadSinglePng("");
      await new Promise((r) => setTimeout(r, 200));

      for (const t of tables) {
        handleDownloadSinglePng(t);
        await new Promise((r) => setTimeout(r, 250));
      }

      toast({
        title: "Download Complete",
        description: `All table QR images have been downloaded.`,
      });
    } catch (e: any) {
      toast({
        title: "Download Error",
        description: e.message || "Failed to download some QR codes",
        variant: "destructive" as any,
      });
    } finally {
      setIsDownloadingBulk(false);
    }
  };

  // Single Print Standee (uses clean isolated iframe for 100% pixel-perfect print / Save as PDF)
  const handlePrintSingle = (tableName?: string) => {
    const targetTable = tableName !== undefined ? tableName : effectiveTable;
    const targetUrl = getMenuUrlForTable(targetTable);
    let qrSvgData: { path: string; viewBoxSize: number } = { path: "", viewBoxSize: 37 };
    try {
      const qr = QrCode.encodeText(targetUrl);
      qrSvgData = generateQrSvgPath(qr, 3);
    } catch {}

    if (standeeFormat === "mini-easel") {
      printMiniStandeesInIsolatedFrame(
        cafeName,
        [
          {
            tableLabel: targetTable,
            url: targetUrl,
            qrSvgPath: qrSvgData.path,
            qrViewBoxSize: qrSvgData.viewBoxSize,
          },
        ],
        { orientation: miniOrientation, accentColor: themeAccentColor }
      );
    } else {
      printStandeesInIsolatedFrame(
        cafeName,
        [
          {
            tableLabel: targetTable,
            url: targetUrl,
            qrSvgPath: qrSvgData.path,
            qrViewBoxSize: qrSvgData.viewBoxSize,
          },
        ],
        themeAccentColor
      );
    }
  };

  // Bulk Print All Standees (exactly 1 table per A4 page, zero URL headers/footers)
  const handlePrintBulk = () => {
    if (tables.length === 0) return;
    const items = tables.map((t) => {
      const url = getMenuUrlForTable(t);
      let qrSvgData: { path: string; viewBoxSize: number } = { path: "", viewBoxSize: 37 };
      try {
        const qr = QrCode.encodeText(url);
        qrSvgData = generateQrSvgPath(qr, 3);
      } catch {}
      return {
        tableLabel: t,
        url,
        qrSvgPath: qrSvgData.path,
        qrViewBoxSize: qrSvgData.viewBoxSize,
      };
    });

    if (standeeFormat === "mini-easel") {
      printMiniStandeesInIsolatedFrame(cafeName, items, {
        orientation: miniOrientation,
        accentColor: themeAccentColor,
      });
    } else {
      printStandeesInIsolatedFrame(cafeName, items, themeAccentColor);
    }
  };

  return (
    <ToastProvider>
      <div className="space-y-6 pb-12">
        {/* ─── Header ─── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-text tracking-tight flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <QrIcon className="w-5 h-5" />
              </div>
              Menu & Table QR Codes
            </h1>
            <p className="text-sm text-muted mt-1">
              Configure restaurant tables, generate individual QR codes, and print standees for any restaurant size.
            </p>
          </div>

          {/* Quick Menu Preview Link */}
          <a
            href={currentMenuUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-surface border border-border hover:border-primary text-text hover:text-primary transition-all text-sm font-semibold shadow-sm"
          >
            <Eye className="w-4 h-4 text-primary" />
            Preview Live Menu
            <ExternalLink className="w-3.5 h-3.5 opacity-60 ml-0.5" />
          </a>
        </div>

        {/* ─── Dynamic QR Notice Banner ─── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 sm:p-5 rounded-2xl menu-card border menu-border flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-sm"
        >
          <div className="w-10 h-10 rounded-xl bg-[var(--theme-primary)]/15 border border-[var(--theme-primary)]/30 flex items-center justify-center menu-primary-text flex-shrink-0">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold menu-text">Live Menu Sync</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold uppercase tracking-wider">
                Permanent QR Codes
              </span>
            </div>
            <p className="text-xs menu-muted leading-relaxed">
              When a customer scans any table QR code, their table number is automatically pre-filled at checkout,
              and any menu, price, or tax update you make in Manage Menu reflects in real-time. You never have to re-print your QR codes!
            </p>
          </div>
        </motion.div>

        {/* ─── Table Configuration & Management Card ─── */}
        <div className="menu-card border menu-border rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b menu-border">
            <div>
              <h2 className="text-base font-bold menu-text flex items-center gap-2">
                <Layers className="w-4 h-4 menu-primary-text" />
                Restaurant Tables Configuration
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[var(--theme-primary)]/15 menu-primary-text border border-[var(--theme-primary)]/30 font-semibold ml-2">
                  {tables.length} Tables
                </span>
              </h2>
              <p className="text-xs menu-muted mt-0.5">
                Add, remove, or bulk-generate tables for your restaurant.
              </p>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs menu-muted font-semibold mr-1">Quick Add:</span>
              {[10, 20, 30, 50].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleQuickAddPreset(num)}
                  disabled={isSavingTables}
                  className="px-2.5 py-1 rounded-lg bg-[var(--theme-surface)] hover:brightness-110 border menu-border text-xs menu-text transition-all font-medium"
                >
                  1 to {num}
                </button>
              ))}
            </div>
          </div>

          {/* Add Custom Table Input */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Enter Table Name (e.g. Table 25, VIP Lounge, Patio 3, Rooftop 1)..."
                value={newTableInput}
                onChange={(e) => setNewTableInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTable();
                  }
                }}
                className="w-full px-4 py-2.5 bg-[var(--theme-surface)] border menu-border focus:border-[var(--theme-primary)] rounded-xl menu-text text-sm outline-none transition-all placeholder:menu-muted"
              />
            </div>

            <Button
              onClick={handleAddTable}
              disabled={!newTableInput.trim() || isSavingTables}
              className="py-2.5 px-5 rounded-xl font-bold menu-primary-btn hover:brightness-110 text-white flex items-center justify-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Table
            </Button>
          </div>

          {/* Tables Chips / Badges */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted">
              <span>Configured Tables (Click any table to preview QR):</span>
              {tables.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowClearModal(true)}
                  className="text-rose-500 hover:text-rose-600 transition-colors text-[11px] font-semibold flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Clear All Tables
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1">
              <button
                type="button"
                onClick={() => setSelectedTable("general")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                  selectedTable === "general"
                    ? "bg-primary text-white border-primary shadow-sm"
                    : "bg-surface border border-border text-text hover:border-primary hover:bg-surface-hover"
                }`}
              >
                <span>General (No Table)</span>
              </button>

              {tables.map((t) => (
                <div
                  key={t}
                  className={`inline-flex items-center rounded-xl text-xs font-semibold border transition-all overflow-hidden ${
                    selectedTable === t
                      ? "bg-primary text-white border-primary shadow-sm"
                      : "bg-surface border border-border text-text hover:border-primary"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedTable(t)}
                    className="px-3 py-1.5 flex items-center gap-1 text-inherit"
                  >
                    <span>{formatTableLabel(t)}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveTable(t)}
                    className="px-2 py-1.5 hover:bg-black/10 text-inherit/70 hover:text-inherit transition-colors border-l border-inherit/20"
                    title={`Delete ${formatTableLabel(t)}`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── View Mode Switcher ─── */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 bg-surface p-1 rounded-xl border border-border">
            <button
              type="button"
              onClick={() => setActiveTab("single")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === "single"
                  ? "bg-primary text-white shadow-sm"
                  : "text-muted hover:text-text"
              }`}
            >
              <Maximize2 className="w-3.5 h-3.5" />
              Single Standee Preview
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("grid")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === "grid"
                  ? "bg-primary text-white shadow-sm"
                  : "text-muted hover:text-text"
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              All Tables Grid ({tables.length})
            </button>
          </div>

          {/* Bulk Action Buttons (Visible for Big Restaurants) */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              onClick={handleDownloadAllPdf}
              disabled={isDownloadingBulk || tables.length === 0}
              className="py-2.5 px-4 rounded-xl text-xs font-bold menu-primary-btn hover:brightness-110 text-white flex items-center gap-2 shadow-sm cursor-pointer"
            >
              {isDownloadingBulk ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Building PDF...
                </>
              ) : (
                <>
                  <FileText className="w-3.5 h-3.5" />
                  Download All Tables (PDF)
                </>
              )}
            </Button>

            <Button
              onClick={handlePrintBulk}
              variant="outline"
              className="py-2.5 px-4 rounded-xl text-xs font-bold border-border bg-white hover:bg-surface text-text hover:text-primary flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Print All Standees (PDF)
            </Button>

            <Button
              onClick={handleDownloadAllQrs}
              disabled={isDownloadingBulk || tables.length === 0}
              variant="outline"
              className="py-2.5 px-3 rounded-xl text-xs font-semibold border-border bg-surface text-muted hover:text-text flex items-center gap-1.5 cursor-pointer"
              title="Download all QR codes as individual PNG images"
            >
              <Download className="w-3.5 h-3.5" />
              PNGs
            </Button>
          </div>
        </div>

        {/* ─── TAB 1: SINGLE STANDEE & PREVIEW ─── */}
        {activeTab === "single" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Controls */}
            <div className="lg:col-span-5 space-y-6">
              <div className="menu-card border menu-border rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
                <div>
                  <h3 className="text-base font-bold menu-text flex items-center gap-2 tracking-tight">
                    <Sliders className="w-4 h-4 menu-primary-text" />
                    Selected Table QR Details
                  </h3>
                  <p className="text-xs menu-muted mt-1">
                    Custom table selected: <strong className="menu-primary-text">{effectiveTable ? formatTableBadge(effectiveTable) : "General (No Table)"}</strong>
                  </p>
                </div>

                {/* Standee Physical Format (Mini Easel vs Full Sheet) */}
                <div className="space-y-2.5 pt-2 border-t menu-border">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold menu-text flex items-center gap-1.5">
                      <span>Standee Physical Format</span>
                      {isIgniteAeros && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 font-extrabold uppercase border border-amber-500/30">
                          Ignite Custom Frame
                        </span>
                      )}
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setStandeeFormat("mini-easel")}
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all text-left flex flex-col gap-0.5 cursor-pointer ${
                        standeeFormat === "mini-easel"
                          ? "bg-amber-500/10 border-amber-500 text-amber-700 shadow-sm"
                          : "bg-surface border-border text-muted hover:text-text"
                      }`}
                    >
                      <span className="flex items-center gap-1">
                        <span>🖼️ Mini Easel Card</span>
                      </span>
                      <span className="text-[10px] opacity-75 font-normal">
                        57.5 × 88 mm (Outer)
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setStandeeFormat("standard")}
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all text-left flex flex-col gap-0.5 cursor-pointer ${
                        standeeFormat === "standard"
                          ? "bg-primary/10 border-primary text-primary shadow-sm"
                          : "bg-surface border-border text-muted hover:text-text"
                      }`}
                    >
                      <span className="flex items-center gap-1">
                        <span>📄 Full A4 Standee</span>
                      </span>
                      <span className="text-[10px] opacity-75 font-normal">
                        Standard Table Tent
                      </span>
                    </button>
                  </div>

                  {standeeFormat === "mini-easel" && (
                    <div className="pt-2 space-y-2">
                      <div className="flex items-center justify-between text-xs font-semibold menu-muted">
                        <span>Card Orientation:</span>
                        <div className="flex items-center gap-1 bg-surface p-0.5 rounded-lg border menu-border">
                          <button
                            type="button"
                            onClick={() => setMiniOrientation("portrait")}
                            className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
                              miniOrientation === "portrait"
                                ? "bg-amber-600 text-white shadow-xs"
                                : "text-muted hover:text-text"
                            }`}
                          >
                            Vertical (Portrait)
                          </button>
                          <button
                            type="button"
                            onClick={() => setMiniOrientation("landscape")}
                            className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
                              miniOrientation === "landscape"
                                ? "bg-amber-600 text-white shadow-xs"
                                : "text-muted hover:text-text"
                            }`}
                          >
                            Horizontal (Landscape)
                          </button>
                        </div>
                      </div>

                      <div className="text-[11px] bg-amber-500/10 border border-amber-500/20 rounded-xl p-2.5 space-y-1 text-amber-900 dark:text-amber-200">
                        <div className="font-bold flex items-center gap-1 text-amber-800 dark:text-amber-300">
                          <span>📐 Dimensions Calibrated:</span>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono">
                          <div>• Bahar (Outer): <strong>{miniOrientation === "portrait" ? "57.5 × 88 mm" : "88 × 57.5 mm"}</strong></div>
                          <div>• Andar (Inner): <strong>{miniOrientation === "portrait" ? "45 × 63 mm" : "63 × 45 mm"}</strong></div>
                        </div>
                        <p className="text-[10px] text-amber-700/80 pt-0.5 leading-tight">
                          Content is centered inside the 45×63mm opening so nothing is covered by the frame bezel.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Target URL */}
                <div className="space-y-1.5 pt-2 border-t menu-border">
                  <label className="text-xs font-semibold menu-muted flex items-center justify-between">
                    <span>QR Destination Link</span>
                    <span className="text-[11px] menu-primary-text font-mono">
                      {effectiveTable ? `Auto-fills ${formatTableBadge(effectiveTable)}` : "Opens General Menu"}
                    </span>
                  </label>

                  <div className="flex items-center gap-2 bg-[var(--theme-surface)] border menu-border rounded-xl p-2.5">
                    <input
                      type="text"
                      readOnly
                      value={currentMenuUrl}
                      className="bg-transparent text-xs menu-text font-mono flex-1 outline-none truncate selection:bg-primary/20"
                    />
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="px-2.5 py-1 rounded-lg menu-card hover:bg-[var(--theme-surface)] menu-text hover:menu-primary-text border menu-border transition-all text-xs flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
                      title="Copy Link"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400 font-semibold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3 pt-2 border-t menu-border">
                  <Button
                    onClick={() => handleDownloadSinglePdf()}
                    disabled={isGeneratingPdf}
                    className="w-full py-4 rounded-xl font-bold menu-primary-btn hover:brightness-110 text-white shadow-sm flex items-center justify-center gap-2 cursor-pointer text-sm"
                  >
                    {isGeneratingPdf ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating Standee PDF...
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4" />
                        {standeeFormat === "mini-easel" ? "Download Standee PDF (57.5 × 88 mm)" : "Download Standee (PDF)"}
                      </>
                    )}
                  </Button>

                  <div className="grid grid-cols-2 gap-2.5">
                    <Button
                      onClick={() => handlePrintSingle()}
                      variant="outline"
                      className="w-full py-3 rounded-xl font-semibold border-border bg-surface hover:bg-surface-hover text-text hover:text-primary flex items-center justify-center gap-1.5 text-xs cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Print / Save as PDF
                    </Button>

                    <Button
                      onClick={() => handleDownloadSinglePng()}
                      variant="outline"
                      className="w-full py-3 rounded-xl font-semibold border-border bg-surface hover:bg-surface-hover text-text hover:text-primary flex items-center justify-center gap-1.5 text-xs cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download PNG
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Standee Card Preview */}
            <div className="lg:col-span-7 flex flex-col items-center">
              <div className="w-full max-w-sm sm:max-w-md flex flex-col items-center">
                <div className="w-full text-xs font-semibold text-muted/60 mb-2 flex items-center justify-between">
                  <span>Single Standee Preview</span>
                  <span className="text-[11px] text-primary font-medium">
                    {standeeFormat === "mini-easel" ? "Mini Easel Standee" : "Ready to Print"}
                  </span>
                </div>

                {/* MINI EASEL CARD PREVIEW (Exact proportions: Outer 57.5 x 88 mm, Inner 45 x 63 mm) */}
                {standeeFormat === "mini-easel" ? (
                  <div className="w-full flex flex-col items-center space-y-3">
                    {miniOrientation === "portrait" ? (
                      /* PORTRAIT MINI EASEL CARD */
                      <div
                        id="single-printable-standee"
                        className="w-[280px] sm:w-[310px] bg-white text-zinc-900 rounded-2xl p-4 border-2 border-dashed border-zinc-400 shadow-2xl relative flex flex-col items-center justify-between select-none"
                        style={{ minHeight: "475px" }}
                      >
                        {/* Outer cut guide markers */}
                        <div className="absolute top-1 left-2 text-[9px] font-mono text-zinc-400 font-bold uppercase tracking-wider">
                          ✂ CUT: 57.5 × 88 mm
                        </div>
                        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-zinc-600"></div>
                        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-zinc-600"></div>
                        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-zinc-600"></div>
                        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-zinc-600"></div>

                        {/* INNER VISIBLE WINDOW (45 x 63 mm representation) */}
                        <div className="w-[230px] sm:w-[250px] min-h-[380px] sm:min-h-[400px] border border-dashed border-amber-400/80 bg-white rounded-xl p-3 flex flex-col items-center justify-start text-center relative mt-3 mb-1 shadow-inner">
                          {/* Inner window badge label */}
                          <div className="absolute -top-2.5 bg-amber-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                            Visible Window (45 × 63 mm)
                          </div>

                          {/* Table number on top in vertical */}
                          <div className="w-full pt-3 pb-2 text-center">
                            <span className="text-xl sm:text-2xl font-black text-zinc-900 uppercase tracking-widest block">
                              {effectiveTable ? formatTableBadge(effectiveTable) : "DINE-IN MENU"}
                            </span>
                          </div>

                          {/* QR Code occupying most of the space */}
                          <div className="w-full flex-1 flex items-center justify-center p-1 my-auto">
                            {qrSvg ? (
                              <svg
                                viewBox={`0 0 ${qrSvg.viewBoxSize} ${qrSvg.viewBoxSize}`}
                                className="w-48 h-48 sm:w-52 sm:h-52 max-w-full drop-shadow-xs"
                                fill="#000000"
                              >
                                <path d={qrSvg.path} />
                              </svg>
                            ) : (
                              <div className="w-48 h-48 flex items-center justify-center text-zinc-400 text-xs">
                                Generating QR...
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="text-[9px] text-zinc-400 font-medium">
                          Slide into mini easel frame after cutting
                        </div>
                      </div>
                    ) : (
                      /* LANDSCAPE MINI EASEL CARD */
                      <div
                        id="single-printable-standee"
                        className="w-[360px] sm:w-[410px] bg-white text-zinc-900 rounded-2xl p-4 border-2 border-dashed border-zinc-400 shadow-2xl relative flex flex-col items-center justify-between select-none"
                        style={{ minHeight: "270px" }}
                      >
                        <div className="absolute top-1 left-2 text-[9px] font-mono text-zinc-400 font-bold uppercase tracking-wider">
                          ✂ CUT: 88 × 57.5 mm
                        </div>
                        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-zinc-600"></div>
                        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-zinc-600"></div>
                        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-zinc-600"></div>
                        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-zinc-600"></div>

                        {/* INNER VISIBLE WINDOW (63 x 45 mm representation) */}
                        <div className="w-[320px] sm:w-[370px] min-h-[225px] border border-dashed border-amber-400/80 bg-white rounded-xl p-3 flex items-center justify-between text-left relative mt-3 mb-1 shadow-inner gap-3">
                          <div className="absolute -top-2.5 left-4 bg-amber-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                            Visible Window (63 × 45 mm)
                          </div>

                          {/* Left Column: Table Number */}
                          <div className="flex-1 text-center py-2">
                            <span className="text-2xl font-black text-zinc-900 uppercase tracking-widest block">
                              {effectiveTable ? formatTableBadge(effectiveTable) : "DINE-IN MENU"}
                            </span>
                          </div>

                          {/* Right Column: QR Box */}
                          <div className="bg-white p-1 rounded-xl flex-shrink-0">
                            {qrSvg ? (
                              <svg
                                viewBox={`0 0 ${qrSvg.viewBoxSize} ${qrSvg.viewBoxSize}`}
                                className="w-40 h-40"
                                fill="#000000"
                              >
                                <path d={qrSvg.path} />
                              </svg>
                            ) : (
                              <div className="w-40 h-40 flex items-center justify-center text-zinc-400 text-xs">
                                Generating QR...
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="text-[9px] text-zinc-400 font-medium">
                          Slide into mini easel frame after cutting
                        </div>
                      </div>
                    )}

                    {/* Frame Calibration Guide Callout */}
                    <div className="w-full text-xs bg-surface border border-border rounded-xl p-3.5 space-y-2">
                      <div className="font-bold menu-text flex items-center gap-2">
                        <span>🪚 Standee Calibration Specs (Ignite Aeros)</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px] menu-muted">
                        <div className="bg-white/60 dark:bg-zinc-800/60 p-2 rounded-lg border border-border">
                          <span className="font-semibold menu-text block">Bahar ki Border:</span>
                          <span className="font-mono text-amber-600 font-bold">57.5 mm × 88 mm</span>
                          <span className="text-[10px] block opacity-75">Card slot cut line</span>
                        </div>
                        <div className="bg-white/60 dark:bg-zinc-800/60 p-2 rounded-lg border border-border">
                          <span className="font-semibold menu-text block">Andar Wala:</span>
                          <span className="font-mono text-emerald-600 font-bold">45 mm × 63 mm</span>
                          <span className="text-[10px] block opacity-75">Visible display opening</span>
                        </div>
                      </div>
                      <p className="text-[10px] menu-muted leading-relaxed">
                        💡 <strong>Printing tip:</strong> Print on standard A4 paper at <strong>100% scale (no scaling)</strong>. Cut along the dashed line and the card will fit smoothly into your brown easel holder.
                      </p>
                    </div>
                  </div>
                ) : (
                  /* STANDARD A4 STANDEE CARD */
                  <div
                    id="single-printable-standee"
                    className="bg-white text-zinc-900 rounded-3xl p-7 sm:p-8 shadow-2xl border-4 border-amber-500/20 text-center flex flex-col items-center justify-center space-y-4 relative overflow-hidden"
                  >
                    {/* Table Number on Top */}
                    <div className="w-full text-center">
                      <span className="text-3xl sm:text-4xl font-black text-zinc-900 uppercase tracking-widest block">
                        {effectiveTable ? formatTableBadge(effectiveTable) : "DINE-IN MENU"}
                      </span>
                    </div>

                    {/* QR Code occupying most of the space */}
                    <div className="bg-white p-3 rounded-2xl border-2 border-zinc-200 shadow-inner inline-block my-2">
                      {qrSvg ? (
                        <svg
                          viewBox={`0 0 ${qrSvg.viewBoxSize} ${qrSvg.viewBoxSize}`}
                          className="w-72 h-72 sm:w-80 sm:h-80"
                          fill="#000000"
                        >
                          <path d={qrSvg.path} />
                        </svg>
                      ) : (
                        <div className="w-72 h-72 flex items-center justify-center text-zinc-400 text-sm">
                          Generating QR...
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 2: ALL TABLES GRID (BULK) ─── */}
        {activeTab === "grid" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {tables.map((tableNum) => {
                const tableUrl = getMenuUrlForTable(tableNum);
                let tableSvg: { path: string; viewBoxSize: number } | null = null;
                try {
                  const qr = QrCode.encodeText(tableUrl);
                  tableSvg = generateQrSvgPath(qr, 2);
                } catch {}

                return (
                  <div
                    key={tableNum}
                    className="bg-white border border-border hover:border-primary rounded-2xl p-4 shadow-sm hover:shadow-md flex flex-col items-center text-center space-y-3 transition-all duration-300 group"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                        {formatTableBadge(tableNum)}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTable(tableNum);
                          setActiveTab("single");
                        }}
                        className="text-xs text-muted hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
                        title="Preview Standee"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Preview
                      </button>
                    </div>

                    <div className="bg-white p-2.5 rounded-xl border border-zinc-200 shadow-sm inline-block">
                      {tableSvg ? (
                        <svg
                          viewBox={`0 0 ${tableSvg.viewBoxSize} ${tableSvg.viewBoxSize}`}
                          className="w-36 h-36"
                          fill="#000000"
                        >
                          <path d={tableSvg.path} />
                        </svg>
                      ) : (
                        <div className="w-36 h-36 flex items-center justify-center text-xs text-zinc-400">
                          QR Error
                        </div>
                      )}
                    </div>

                    <div className="w-full space-y-1">
                      <p className="text-[11px] font-mono text-muted truncate">
                        {tableUrl}
                      </p>
                    </div>

                    <div className="w-full pt-1 flex items-center gap-1.5">
                      <Button
                        size="sm"
                        onClick={() => handleDownloadSinglePdf(tableNum)}
                        className="flex-1 py-2 h-8 rounded-lg text-xs font-bold bg-primary hover:bg-primary-hover text-white flex items-center justify-center gap-1 shadow-none cursor-pointer"
                        title="Download Standee PDF"
                      >
                        <FileText className="w-3 h-3" />
                        PDF
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePrintSingle(tableNum)}
                        className="py-2 px-2.5 h-8 rounded-lg text-xs font-medium border-border bg-surface text-text hover:text-primary flex items-center justify-center shadow-none cursor-pointer"
                        title="Print Standee"
                      >
                        <Printer className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadSinglePng(tableNum)}
                        className="py-2 px-2.5 h-8 rounded-lg text-xs font-medium border-border bg-surface text-muted hover:text-text flex items-center justify-center shadow-none cursor-pointer"
                        title="Download PNG"
                      >
                        <Download className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── HIDDEN PRINT BULK CONTAINER (USED ONLY WHEN PRINTING ALL STANDEES) ─── */}
        <div id="bulk-printable-container" className="hidden print:block">
          <div className="bulk-grid space-y-8">
            {tables.map((tableNum) => {
              const tableUrl = getMenuUrlForTable(tableNum);
              let tableSvg: { path: string; viewBoxSize: number } | null = null;
              try {
                const qr = QrCode.encodeText(tableUrl);
                tableSvg = generateQrSvgPath(qr, 3);
              } catch {}

              return (
                <div
                  key={tableNum}
                  className="bulk-standee-card bg-white text-zinc-900 rounded-3xl p-8 border-2 border-zinc-300 text-center flex flex-col items-center space-y-4 page-break-after-always"
                  style={{ pageBreakInside: "avoid", pageBreakAfter: "always" }}
                >
                  <div className="w-24 h-1.5 bg-amber-600 rounded-full mb-1"></div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-center gap-1.5 text-amber-700 font-bold text-xs uppercase tracking-widest">
                      <span>The Dining Co.</span>
                    </div>
                    <h2 className="text-3xl font-extrabold text-zinc-900 tracking-tight">
                      {cafeName}
                    </h2>
                    <p className="text-xs font-semibold text-zinc-500 tracking-wide uppercase">
                      Digital Menu & Ordering
                    </p>
                  </div>

                  <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-50 text-amber-800 border-2 border-amber-400 font-extrabold text-sm shadow-sm">
                    <span>{formatTableBadge(tableNum)}</span>
                  </div>

                  <div className="bg-white p-3 rounded-2xl border-2 border-zinc-200 shadow-inner inline-block my-1">
                    {tableSvg && (
                      <svg
                        viewBox={`0 0 ${tableSvg.viewBoxSize} ${tableSvg.viewBoxSize}`}
                        className="w-60 h-60"
                        fill="#000000"
                      >
                        <path d={tableSvg.path} />
                      </svg>
                    )}
                  </div>

                  <div className="space-y-1 pt-1">
                    <p className="text-base font-extrabold text-zinc-900">
                      Scan to View Menu & Order
                    </p>
                    <p className="text-xs text-zinc-600 max-w-xs">
                      Open your camera or any QR scanner app to browse dishes and place your order.
                    </p>
                  </div>

                  <div className="pt-3 border-t border-zinc-200 w-full text-center">
                    <p className="text-[10px] font-mono text-zinc-500 truncate max-w-[280px] mx-auto">
                      {tableUrl}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── Global Print Styles ─── */}
        <style jsx global>{`
          @page {
            size: A4 portrait;
            margin: 8mm;
          }
          @media print {
            body {
              background: #ffffff !important;
              color: #111827 !important;
            }
            header, aside, nav, button, input {
              display: none !important;
            }
          }
        `}</style>

        {/* ─── Custom Themed Clear All Tables Modal ─── */}
        <AnimatePresence>
          {showClearModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowClearModal(false)}
                className="fixed inset-0 bg-background/80 backdrop-blur-md"
              />
              <motion.div
                initial={{ scale: 0.92, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 10 }}
                transition={{ type: "spring", duration: 0.3 }}
                className="relative bg-white border border-border rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4 z-10"
              >
                <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-500 flex items-center justify-center mx-auto shadow-sm">
                  <AlertCircle className="w-7 h-7" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold text-text tracking-tight">
                    Clear All Tables?
                  </h3>
                  <p className="text-xs text-muted leading-relaxed">
                    This will remove all <strong className="text-text font-semibold">{tables.length} configured tables</strong>. You can re-add them or use Quick Add anytime.
                  </p>
                </div>
                <div className="flex items-center gap-2.5 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowClearModal(false)}
                    className="flex-1 py-2.5 h-10 rounded-xl text-xs font-semibold border-border bg-surface hover:bg-surface-hover text-text"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      setTables([]);
                      setSelectedTable("general");
                      handleSaveTables([]);
                      setShowClearModal(false);
                    }}
                    className="flex-1 py-2.5 h-10 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/25"
                  >
                    Yes, Clear All
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Toast Viewport */}
        {toasts.map(function ({ id, title, description, ...props }) {
          return (
            <Toast key={id} {...props}>
              <div className="grid gap-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && <ToastDescription>{description}</ToastDescription>}
              </div>
              <ToastClose />
            </Toast>
          );
        })}
        <ToastViewport />
      </div>
    </ToastProvider>
  );
}
