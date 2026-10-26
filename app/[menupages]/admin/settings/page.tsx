"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";
import { 
  User, 
  Mail, 
  MapPin, 
  Building2, 
  Percent, 
  Settings, 
  Edit, 
  Save, 
  X, 
  Info,
  Loader2,
  QrCode,
  Upload,
  Trash2,
  Smartphone
} from "lucide-react";
import { useToast, ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription, ToastClose } from "@/hooks/use-toast";
import useSWR, { mutate } from "swr";

type Cafe = {
  cafeName: string;
  ownerName: string;
  email: string;
  city: string;
  location: string;
  slug: string;
  taxRate: number;
  showTax: boolean;
  upiQrCode?: string;
  upiId?: string;
};

export default function SettingsPage() {
  const params = useParams();
  const slug = (params?.menupages as string) || "";
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingQr, setUploadingQr] = useState(false);
  const [originalForm, setOriginalForm] = useState<Omit<Cafe, "slug"> | null>(null);
  
  const cafeUrl = slug ? `/api/cafes/${slug}/self` : null;
  const { data, isLoading: swrLoading } = useSWR(cafeUrl);

  const [form, setForm] = useState<Omit<Cafe, "slug">>({
    cafeName: "",
    ownerName: "",
    email: "",
    city: "",
    location: "",
    taxRate: 5.0,
    showTax: true,
    upiQrCode: "",
    upiId: "",
  });
  
  const { toast, toasts, dismiss } = useToast();

  useEffect(() => {
    if (data?.success) {
      const cafeData = data.data as Cafe;
      const initialForm = {
        cafeName: cafeData.cafeName,
        ownerName: cafeData.ownerName,
        email: cafeData.email,
        city: cafeData.city,
        location: cafeData.location,
        taxRate: cafeData.taxRate || 5.0,
        showTax: cafeData.showTax !== undefined ? cafeData.showTax : true,
        upiQrCode: cafeData.upiQrCode || "",
        upiId: cafeData.upiId || "",
      };
      setForm(initialForm);
      setOriginalForm(initialForm);
    }
  }, [data]);

  const loading = swrLoading && !data;

  const onChange = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [key]: e.target.value }));
  };

  const onSave = async (updatedForm = form) => {
    if (!data?.success) return;

    if (isEditing && originalForm) {
      const hasChanged = 
        updatedForm.ownerName !== originalForm.ownerName ||
        updatedForm.email !== originalForm.email ||
        updatedForm.city !== originalForm.city ||
        updatedForm.location !== originalForm.location;
        
      if (!hasChanged) {
        toast({ title: "No changes made", description: "You haven't modified any details." });
        setIsEditing(false);
        return;
      }
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/cafes/${slug}/self`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ownerName: updatedForm.ownerName,
          email: updatedForm.email,
          city: updatedForm.city,
          location: updatedForm.location,
          taxRate: Number(updatedForm.taxRate),
          showTax: Boolean(updatedForm.showTax),
          upiQrCode: updatedForm.upiQrCode || "",
          upiId: updatedForm.upiId || "",
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || "Failed to save");
      
      mutate(cafeUrl);
      setOriginalForm(updatedForm);
      setIsEditing(false);
      
      toast({ title: "Saved", description: "Changes have been saved" });
    } catch (e: any) {
      toast({ title: "Failed to save", description: e.message || "Error", variant: "destructive" as any });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (originalForm) {
      setForm(originalForm);
    }
    setIsEditing(false);
  };

  const handleTaxToggle = async () => {
    const newShowTax = !form.showTax;
    const updatedForm = { ...form, showTax: newShowTax };
    setForm(updatedForm);
    await onSave(updatedForm);
  };

  const onTaxRateBlur = async () => {
    if (originalForm && form.taxRate !== originalForm.taxRate) {
      await onSave(form);
    }
  };

  const onUpiIdBlur = async () => {
    if (originalForm && form.upiId !== originalForm.upiId) {
      await onSave(form);
    }
  };

  const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast({ title: "Invalid File", description: "Please upload an image file (PNG, JPG, etc.)", variant: "destructive" as any });
      return;
    }
    setUploadingQr(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        credentials: "include",
        body: fd,
      });
      const json = await res.json();
      if (!res.ok || !json?.success) {
        throw new Error(json?.message || "Upload failed");
      }
      const qrUrl = json.data.url as string;
      const updatedForm = { ...form, upiQrCode: qrUrl };
      setForm(updatedForm);
      await onSave(updatedForm);
      toast({ title: "QR Code Uploaded", description: "Your UPI QR Code has been updated." });
    } catch (err: any) {
      toast({ title: "Upload Failed", description: err.message || "Failed to upload QR Code", variant: "destructive" as any });
    } finally {
      setUploadingQr(false);
    }
  };

  const handleRemoveQr = async () => {
    const updatedForm = { ...form, upiQrCode: "" };
    setForm(updatedForm);
    await onSave(updatedForm);
    toast({ title: "QR Code Removed", description: "Your UPI QR Code has been removed." });
  };

  // Loading skeleton
  if (loading) {
    return (
      <ToastProvider>
        <div className="bg-white rounded-2xl border border-border p-6 w-full shadow-sm">
          <div className="h-8 bg-surface rounded w-48 mb-2 animate-pulse"></div>
          <div className="h-4 bg-surface rounded w-64 mb-6 animate-pulse"></div>
          
          <div className="space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i}>
                <div className="h-4 bg-surface rounded w-24 mb-2 animate-pulse"></div>
                <div className="h-12 bg-surface rounded-xl w-full animate-pulse"></div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 bg-surface rounded-2xl border border-border p-6">
            <div className="h-6 bg-surface rounded w-40 mb-2 animate-pulse"></div>
            <div className="h-4 bg-surface rounded w-56 mb-6 animate-pulse"></div>
            <div className="flex items-center justify-between">
              <div>
                <div className="h-4 bg-surface rounded w-32 mb-1 animate-pulse"></div>
                <div className="h-3 bg-surface rounded w-48 animate-pulse"></div>
              </div>
              <div className="h-6 w-11 bg-surface rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
        <ToastViewport />
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
      <div className="max-w-2xl mx-auto space-y-6 pb-12">
        {/* ─── Basic Details Card ─── */}
        <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
                <Settings className="w-4 h-4 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-text tracking-tight">Basic Details</h2>
            </div>
            {!isEditing ? (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsEditing(true)}
                className="rounded-xl border-border bg-surface hover:bg-surface-hover text-text hover:border-primary transition-all duration-300 px-5 py-2.5 font-semibold shadow-sm group"
              >
                <Edit className="w-4 h-4 mr-2 group-hover:text-primary transition-colors" />
                Edit Details
              </Button>
            ) : (
              <div className="flex gap-2.5">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleCancel}
                  className="rounded-xl border-border bg-surface hover:bg-surface-hover text-text hover:border-primary transition-all duration-300 px-5 py-2.5 font-semibold shadow-sm"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => onSave()}
                  disabled={saving}
                  className="rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold px-6 py-2.5 shadow-md shadow-primary/20 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
          <p className="text-sm text-muted mb-6 font-medium border-b border-border pb-4">Update your cafe information. Name is managed by superadmin.</p>

          <div className="space-y-5">
            <div className="group">
              <label className="text-sm mb-2 block font-semibold text-muted flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary/60" />
                Cafe Name
              </label>
              <Input 
                value={form.cafeName} 
                disabled 
                className="bg-[#FBF8F3] border-border rounded-xl text-muted cursor-not-allowed h-12 text-sm font-medium" 
              />
              <p className="text-xs text-muted/60 mt-2 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-primary/60" />
                Contact superadmin to rename the cafe
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="group">
                <label className="text-sm mb-2 block font-semibold text-muted flex items-center gap-2">
                  <User className="w-4 h-4 text-primary/60" />
                  Owner Name
                </label>
                <Input 
                  value={form.ownerName} 
                  onChange={onChange('ownerName')} 
                  disabled={!isEditing}
                  placeholder="Enter owner name"
                  className={`h-12 rounded-xl text-sm font-medium transition-all duration-300
                    ${!isEditing 
                      ? 'bg-[#FBF8F3] border-border text-muted cursor-not-allowed' 
                      : 'bg-white border-border text-text focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-primary'
                    }`}
                />
              </div>
              
              <div className="group">
                <label className="text-sm mb-2 block font-semibold text-muted flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary/60" />
                  Email Address
                </label>
                <Input 
                  type="email" 
                  value={form.email} 
                  onChange={onChange('email')} 
                  disabled={!isEditing}
                  placeholder="Enter email address"
                  className={`h-12 rounded-xl text-sm font-medium transition-all duration-300
                    ${!isEditing 
                      ? 'bg-[#FBF8F3] border-border text-muted cursor-not-allowed' 
                      : 'bg-white border-border text-text focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-primary'
                    }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="group">
                <label className="text-sm mb-2 block font-semibold text-muted flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary/60" />
                  City
                </label>
                <Input 
                  value={form.city} 
                  onChange={onChange('city')} 
                  disabled={!isEditing}
                  placeholder="Enter city"
                  className={`h-12 rounded-xl text-sm font-medium transition-all duration-300
                    ${!isEditing 
                      ? 'bg-[#FBF8F3] border-border text-muted cursor-not-allowed' 
                      : 'bg-white border-border text-text focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-primary'
                    }`}
                />
              </div>
              
              <div className="group">
                <label className="text-sm mb-2 block font-semibold text-muted flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary/60" />
                  Location
                </label>
                <Input 
                  value={form.location} 
                  onChange={onChange('location')} 
                  disabled={!isEditing}
                  placeholder="Enter specific location"
                  className={`h-12 rounded-xl text-sm font-medium transition-all duration-300
                    ${!isEditing 
                      ? 'bg-[#FBF8F3] border-border text-muted cursor-not-allowed' 
                      : 'bg-white border-border text-text focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-primary'
                    }`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ─── Tax Management Card ─── */}
        <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
              <Percent className="w-4 h-4 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-text tracking-tight">Tax Management</h2>
          </div>
          <p className="text-sm text-muted mb-6 font-medium border-b border-border pb-4">Manage how taxes are calculated for your orders.</p>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between p-5 bg-[#FBF8F3] rounded-xl border border-border">
              <div className="max-w-[70%]">
                <label className="text-base font-semibold text-text block">Enable Taxes</label>
                <p className="text-xs text-muted mt-1 font-medium leading-relaxed">Automatically show/hide tax in user's menu and checkout screens.</p>
              </div>
              <button
                onClick={handleTaxToggle}
                disabled={saving}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                  form.showTax ? 'bg-primary' : 'bg-border'
                } ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-500 ${
                    form.showTax ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Tax Row - Only shown when showTax is true */}
            {form.showTax && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.4 }}
                className="overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <label className="text-sm mb-2 block font-semibold text-muted flex items-center gap-2">
                      <Percent className="w-4 h-4 text-primary/60" />
                      GST / Tax Percentage (%)
                    </label>
                    <div className="relative group max-w-xs">
                      <Input 
                        type="number" 
                        value={form.taxRate} 
                        onChange={(e) => setForm(prev => ({ ...prev, taxRate: parseFloat(e.target.value) || 0 }))}
                        onBlur={onTaxRateBlur}
                        min="0"
                        max="100"
                        step="0.1"
                        className="h-12 pr-12 rounded-xl border-border bg-white text-text text-base font-semibold focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-primary transition-all duration-300"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-primary font-bold text-lg select-none">%</span>
                    </div>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl sm:max-w-[40%]">
                    <p className="text-xs text-emerald-800 font-medium leading-relaxed flex items-start gap-2">
                      <span className="text-lg">💡</span>
                      Changes are saved automatically. This rate applies to subtotals of all new orders.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* ─── UPI Payment & QR Code Card ─── */}
        <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
                <QrCode className="w-4 h-4 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-text tracking-tight">UPI Payment & QR Code</h2>
            </div>
          </div>
          <p className="text-sm text-muted mb-6 font-medium border-b border-border pb-4">
            Upload your cafe&apos;s UPI QR code and enter your UPI ID so customers can scan and pay dynamically during checkout.
          </p>

          <div className="space-y-6">
            {/* UPI ID (VPA) Field */}
            <div className="group">
              <label className="text-sm mb-2 block font-semibold text-muted flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-primary/60" />
                Cafe UPI ID (VPA)
              </label>
              <div className="relative group max-w-lg">
                <Input 
                  type="text" 
                  value={form.upiId} 
                  onChange={(e) => setForm(prev => ({ ...prev, upiId: e.target.value }))}
                  onBlur={onUpiIdBlur}
                  placeholder="e.g. cafe@okhdfcbank or merchant@paytm"
                  className="h-12 pl-4 pr-24 rounded-xl border-border bg-[#FBF8F3] text-text text-sm font-medium focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-primary transition-all duration-300"
                />
                <Button
                  size="sm"
                  onClick={() => onSave()}
                  disabled={saving}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 h-9 px-3.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-all shadow-sm"
                >
                  Save
                </Button>
              </div>
              <p className="text-xs text-muted/60 mt-2 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-primary/60" />
                Entering your UPI ID enables dynamic QR codes and direct one-tap mobile payments with the exact bill amount for customers.
              </p>
            </div>

            {/* UPI QR Code Image Upload */}
            <div className="pt-2 border-t border-border">
              <label className="text-sm mb-2 block font-semibold text-muted flex items-center gap-2">
                <QrCode className="w-4 h-4 text-primary/60" />
                Upload UPI QR Code Standee / Screenshot
              </label>

              {form.upiQrCode ? (
                <div className="flex flex-col sm:flex-row items-center gap-5 p-4 bg-[#FBF8F3] border border-border rounded-2xl">
                  <div className="relative w-36 h-36 rounded-xl overflow-hidden border border-border bg-white flex items-center justify-center p-2 shadow-sm flex-shrink-0">
                    <img 
                      src={form.upiQrCode} 
                      alt="UPI QR Code" 
                      className="w-full h-full object-contain rounded-lg"
                    />
                  </div>
                  <div className="space-y-3 flex-1 text-center sm:text-left">
                    <div>
                      <div className="flex items-center gap-2 justify-center sm:justify-start">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <h4 className="text-sm font-bold text-text">QR Code Active</h4>
                      </div>
                      <p className="text-xs text-muted mt-1">
                        This QR code will be displayed to customers when choosing UPI payment at checkout.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 justify-center sm:justify-start">
                      <label className="cursor-pointer">
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleQrUpload} 
                          className="hidden" 
                          disabled={uploadingQr}
                        />
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-surface border border-border text-text hover:border-primary transition-all shadow-sm">
                          <Upload className="w-3.5 h-3.5 text-primary" />
                          {uploadingQr ? "Uploading..." : "Replace QR"}
                        </span>
                      </label>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleRemoveQr}
                        disabled={saving}
                        className="h-8 px-3 rounded-lg border-rose-300 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-border hover:border-primary bg-[#FBF8F3] hover:bg-surface rounded-2xl p-8 cursor-pointer transition-all duration-300 group">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleQrUpload} 
                    className="hidden" 
                    disabled={uploadingQr}
                  />
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    {uploadingQr ? (
                      <Loader2 className="w-6 h-6 text-primary animate-spin" />
                    ) : (
                      <Upload className="w-6 h-6 text-primary" />
                    )}
                  </div>
                  <p className="text-sm font-semibold text-text group-hover:text-primary transition-colors">
                    {uploadingQr ? "Uploading QR code..." : "Click or drag to upload UPI QR image"}
                  </p>
                  <p className="text-xs text-muted/60 mt-1">
                    PNG, JPG, or WEBP (PhonePe, Google Pay, Paytm, BharatPe screenshot or photo)
                  </p>
                </label>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* ─── Toast Container ─── */}
      {toasts.map(function ({ id, title, description, ...props }) {
        return (
          <Toast key={id} {...(props as any)}>
            {title ? <ToastTitle>{title}</ToastTitle> : null}
            {description ? <ToastDescription>{description}</ToastDescription> : null}
            <ToastClose onClick={() => dismiss(id)} />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  );
}