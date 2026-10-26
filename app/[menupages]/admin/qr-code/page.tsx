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
} from "lucide-react";
import useSWR, { mutate } from "swr";
import { QrCode, generateQrSvgPath, getQrPngDataUrl } from "@/lib/qrcode";
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
  const [selectedTable, setSelectedTable] = useState<string>("general");
  const [copied, setCopied] = useState(false);
  const [isSavingTables, setIsSavingTables] = useState(false);
  const [isDownloadingBulk, setIsDownloadingBulk] = useState(false);
  const [printBulkMode, setPrintBulkMode] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);

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
    if (!origin) return `/${menupages}/menu`;
    return table
      ? `${origin}/${menupages}/menu?table=${encodeURIComponent(table)}`
      : `${origin}/${menupages}/menu`;
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
      const dataUrl = getQrPngDataUrl(targetUrl, 1024, 4, "#000000", "#FFFFFF");
      if (!dataUrl) return;

      const link = document.createElement("a");
      const filename = targetTable
        ? `${cafeName.replace(/\s+/g, "-")}-Table-${targetTable}-Menu-QR.png`
        : `${cafeName.replace(/\s+/g, "-")}-General-Menu-QR.png`;
      link.download = filename;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Failed to download PNG:", err);
    }
  };

  // Bulk Download All QRs sequentially
  const handleDownloadAllQrs = async () => {
    if (tables.length === 0) return;
    setIsDownloadingBulk(true);
    toast({
      title: "Downloading All QRs",
      description: `Generating high-res QR images for ${tables.length} tables...`,
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

  // Single Print Standee
  const handlePrintSingle = () => {
    setPrintBulkMode(false);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  // Bulk Print All Standees
  const handlePrintBulk = () => {
    setPrintBulkMode(true);
    setTimeout(() => {
      window.print();
    }, 150);
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
          className="p-4 sm:p-5 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-sm"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary flex-shrink-0">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-text">Live Menu Sync</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold uppercase tracking-wider">
                Permanent QR Codes
              </span>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              When a customer scans any table QR code, their table number is automatically pre-filled at checkout,
              and any menu, price, or tax update you make in Manage Menu reflects in real-time. You never have to re-print your QR codes!
            </p>
          </div>
        </motion.div>

        {/* ─── Table Configuration & Management Card ─── */}
        <div className="bg-white border border-border rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-border">
            <div>
              <h2 className="text-base font-bold text-text flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" />
                Restaurant Tables Configuration
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-semibold ml-2">
                  {tables.length} Tables
                </span>
              </h2>
              <p className="text-xs text-muted mt-0.5">
                Add, remove, or bulk-generate tables for your restaurant.
              </p>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-muted font-semibold mr-1">Quick Add:</span>
              {[10, 20, 30, 50].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleQuickAddPreset(num)}
                  disabled={isSavingTables}
                  className="px-2.5 py-1 rounded-lg bg-surface hover:bg-surface-hover border border-border text-xs text-text hover:text-primary transition-all font-medium"
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
                className="w-full px-4 py-2.5 bg-[#FBF8F3] border border-border focus:border-primary rounded-xl text-text text-sm outline-none transition-all placeholder:text-muted/60"
              />
            </div>

            <Button
              onClick={handleAddTable}
              disabled={!newTableInput.trim() || isSavingTables}
              className="py-2.5 px-5 rounded-xl font-bold bg-primary hover:bg-primary-hover text-white flex items-center justify-center gap-2 shadow-sm"
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
                    <span>Table {t}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveTable(t)}
                    className="px-2 py-1.5 hover:bg-black/10 text-inherit/70 hover:text-inherit transition-colors border-l border-inherit/20"
                    title={`Delete Table ${t}`}
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
              onClick={handlePrintBulk}
              variant="outline"
              className="py-2.5 px-4 rounded-xl text-xs font-bold border-border bg-white hover:bg-surface text-text hover:text-primary flex items-center gap-2 shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              Print All Standees ({tables.length})
            </Button>

            <Button
              onClick={handleDownloadAllQrs}
              disabled={isDownloadingBulk || tables.length === 0}
              className="py-2.5 px-4 rounded-xl text-xs font-bold bg-primary hover:bg-primary-hover text-white flex items-center gap-2 shadow-sm"
            >
              {isDownloadingBulk ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  Download All QRs (PNG)
                </>
              )}
            </Button>
          </div>
        </div>

        {/* ─── TAB 1: SINGLE STANDEE & PREVIEW ─── */}
        {activeTab === "single" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Controls */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white border border-border rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
                <div>
                  <h3 className="text-base font-bold text-text flex items-center gap-2 tracking-tight">
                    <Sliders className="w-4 h-4 text-primary" />
                    Selected Table QR Details
                  </h3>
                  <p className="text-xs text-muted mt-1">
                    Custom table selected: <strong className="text-primary">{effectiveTable ? `Table ${effectiveTable}` : "General (No Table)"}</strong>
                  </p>
                </div>

                {/* Target URL */}
                <div className="space-y-1.5 pt-2 border-t border-border">
                  <label className="text-xs font-semibold text-muted flex items-center justify-between">
                    <span>QR Destination Link</span>
                    <span className="text-[11px] text-primary font-mono">
                      {effectiveTable ? `Auto-fills Table ${effectiveTable}` : "Opens General Menu"}
                    </span>
                  </label>

                  <div className="flex items-center gap-2 bg-[#FBF8F3] border border-border rounded-xl p-2.5">
                    <input
                      type="text"
                      readOnly
                      value={currentMenuUrl}
                      className="bg-transparent text-xs text-text font-mono flex-1 outline-none truncate selection:bg-primary/20"
                    />
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="px-2.5 py-1 rounded-lg bg-white hover:bg-surface text-text hover:text-primary border border-border transition-all text-xs flex items-center gap-1.5 flex-shrink-0"
                      title="Copy Link"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600 font-semibold">Copied!</span>
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
                <div className="space-y-3 pt-2 border-t border-border">
                  <Button
                    onClick={() => handleDownloadSinglePng()}
                    className="w-full py-4 rounded-xl font-bold bg-primary hover:bg-primary-hover text-white shadow-sm flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download Standee QR (PNG)
                  </Button>

                  <Button
                    onClick={handlePrintSingle}
                    variant="outline"
                    className="w-full py-4 rounded-xl font-bold border-border bg-surface hover:bg-surface-hover text-text hover:text-primary flex items-center justify-center gap-2"
                  >
                    <Printer className="w-4 h-4" />
                    Print Table Standee
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Standee Card Preview */}
            <div className="lg:col-span-7 flex flex-col items-center">
              <div className="w-full max-w-sm sm:max-w-md">
                <div className="text-xs font-semibold text-muted/60 mb-2 flex items-center justify-between">
                  <span>Single Standee Preview</span>
                  <span className="text-[11px] text-primary font-medium">Ready to Print</span>
                </div>

                {/* Printable Table Standee Card */}
                <div
                  id="single-printable-standee"
                  className="bg-white text-zinc-900 rounded-3xl p-7 sm:p-8 shadow-2xl border-4 border-amber-500/20 text-center flex flex-col items-center space-y-4 relative overflow-hidden"
                >
                  <div className="w-24 h-1.5 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full mb-1"></div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-center gap-1.5 text-amber-700">
                      <UtensilsCrossed className="w-4 h-4" />
                      <span className="text-xs font-black uppercase tracking-[0.2em]">The Dining Co.</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
                      {cafeName}
                    </h2>
                    <p className="text-xs font-semibold text-zinc-500 tracking-wide uppercase">
                      Digital Menu & Ordering
                    </p>
                  </div>

                  {effectiveTable && (
                    <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-50 text-amber-800 border-2 border-amber-400 font-extrabold text-sm shadow-sm">
                      <span>Table {effectiveTable}</span>
                    </div>
                  )}

                  <div className="bg-white p-3 rounded-2xl border-2 border-zinc-200 shadow-inner inline-block my-1">
                    {qrSvg ? (
                      <svg
                        viewBox={`0 0 ${qrSvg.viewBoxSize} ${qrSvg.viewBoxSize}`}
                        className="w-56 h-56 sm:w-64 sm:h-64"
                        fill="#000000"
                      >
                        <path d={qrSvg.path} />
                      </svg>
                    ) : (
                      <div className="w-56 h-56 flex items-center justify-center text-zinc-400 text-sm">
                        Generating QR...
                      </div>
                    )}
                  </div>

                  <div className="space-y-1 pt-1">
                    <p className="text-base font-extrabold text-zinc-900 flex items-center justify-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-amber-700" />
                      Scan to View Menu & Order
                    </p>
                    <p className="text-xs text-zinc-600 max-w-xs">
                      Open your camera or any QR scanner app to browse dishes and place your order.
                    </p>
                  </div>

                  <div className="pt-3 border-t border-zinc-200 w-full text-center">
                    <p className="text-[10px] font-mono text-zinc-500 truncate max-w-[280px] mx-auto">
                      {currentMenuUrl}
                    </p>
                  </div>
                </div>
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
                        Table {tableNum}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTable(tableNum);
                          setActiveTab("single");
                        }}
                        className="text-xs text-muted hover:text-primary transition-colors flex items-center gap-1"
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

                    <div className="w-full pt-1">
                      <Button
                        size="sm"
                        onClick={() => handleDownloadSinglePng(tableNum)}
                        className="w-full py-2 h-8 rounded-lg text-xs font-bold bg-[#FBF8F3] hover:bg-surface border border-border text-text hover:text-primary hover:border-primary transition-all flex items-center justify-center gap-1.5 shadow-none"
                      >
                        <Download className="w-3 h-3 text-primary" />
                        Download PNG
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
                    <span>Table {tableNum}</span>
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

        {/* ─── Print Styles ─── */}
        <style jsx global>{`
          @media print {
            body * {
              visibility: hidden;
            }
            ${printBulkMode
              ? `
              #bulk-printable-container,
              #bulk-printable-container * {
                visibility: visible;
              }
              #bulk-printable-container {
                display: block !important;
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
              }
              .bulk-standee-card {
                width: 100%;
                max-width: 450px;
                margin: 0 auto 40px auto;
                page-break-after: always;
                page-break-inside: avoid;
              }
            `
              : `
              #single-printable-standee,
              #single-printable-standee * {
                visibility: visible;
              }
              #single-printable-standee {
                position: absolute;
                left: 50%;
                top: 5%;
                transform: translateX(-50%);
                width: 100%;
                max-width: 450px;
                box-shadow: none !important;
                border: 2px solid #ddd !important;
                page-break-inside: avoid;
              }
            `}
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
