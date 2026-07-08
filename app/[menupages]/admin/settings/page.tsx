"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";
import { 
  Crown, 
  User, 
  Mail, 
  MapPin, 
  Building2, 
  Percent, 
  Settings, 
  Sparkles, 
  Edit, 
  Save, 
  X, 
  Shield, 
  Award,
  Info,
  Loader2
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
};

export default function SettingsPage() {
  const params = useParams();
  const slug = (params?.menupages as string) || "";
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [originalForm, setOriginalForm] = useState<Omit<Cafe, "slug"> | null>(null);
  
  const cafeUrl = slug ? `/api/cafes/${slug}/self` : null;
  const { data, isLoading: swrLoading, error: swrError } = useSWR(cafeUrl);

  const [form, setForm] = useState<Omit<Cafe, "slug">>({
    cafeName: "",
    ownerName: "",
    email: "",
    city: "",
    location: "",
    taxRate: 5.0,
    showTax: true,
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

  // Loading skeleton
  if (loading) {
    return (
      <ToastProvider>
        <div className="bg-card/60 backdrop-blur-sm rounded-2xl border border-border/30 p-6 w-full shadow-2xl shadow-primary/5">
          <div className="h-8 bg-surface/40 rounded w-48 mb-2 animate-pulse"></div>
          <div className="h-4 bg-surface/40 rounded w-64 mb-6 animate-pulse"></div>
          
          <div className="space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i}>
                <div className="h-4 bg-surface/40 rounded w-24 mb-2 animate-pulse"></div>
                <div className="h-12 bg-surface/30 rounded-xl w-full animate-pulse"></div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 bg-surface/20 rounded-2xl border border-border/20 p-6">
            <div className="h-6 bg-surface/40 rounded w-40 mb-2 animate-pulse"></div>
            <div className="h-4 bg-surface/40 rounded w-56 mb-6 animate-pulse"></div>
            <div className="flex items-center justify-between">
              <div>
                <div className="h-4 bg-surface/40 rounded w-32 mb-1 animate-pulse"></div>
                <div className="h-3 bg-surface/40 rounded w-48 animate-pulse"></div>
              </div>
              <div className="h-6 w-11 bg-surface/40 rounded-full animate-pulse"></div>
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
        <div className="bg-card/60 backdrop-blur-sm rounded-2xl border border-border/30 p-6 shadow-2xl shadow-primary/5">
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
                className="rounded-xl border-border/40 bg-transparent text-muted hover:text-text hover:border-primary/30 transition-all duration-300 px-5 py-2.5 font-semibold shadow-sm group"
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
                  className="rounded-xl border-border/40 bg-transparent text-muted hover:text-text hover:border-primary/30 transition-all duration-300 px-5 py-2.5 font-semibold shadow-sm"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => onSave()}
                  disabled={saving}
                  className="rounded-xl bg-gradient-to-r from-primary to-primary/85 hover:from-primary/90 hover:to-primary/90 text-background font-semibold px-6 py-2.5 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
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
          <p className="text-sm text-muted/50 mb-6 font-medium border-b border-border/20 pb-4">Update your cafe information. Name is managed by superadmin.</p>

          <div className="space-y-5">
            <div className="group">
              <label className="text-sm mb-2 block font-semibold text-muted/70 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary/60" />
                Cafe Name
              </label>
              <Input 
                value={form.cafeName} 
                disabled 
                className="bg-surface/20 border-border/40 rounded-xl text-text/60 cursor-not-allowed h-12 text-sm font-medium" 
              />
              <p className="text-xs text-muted/40 mt-2 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-primary/50" />
                Contact superadmin to rename the cafe
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="group">
                <label className="text-sm mb-2 block font-semibold text-muted/70 flex items-center gap-2">
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
                      ? 'bg-surface/20 border-border/40 text-text/60 cursor-not-allowed' 
                      : 'bg-surface/30 border-border/40 text-text focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-primary/50'
                    } 
                    [&:-webkit-autofill]:!bg-[rgba(212,175,55,0.08)] 
                    [&:-webkit-autofill]:!text-[#F9FAFB] 
                    [&:-webkit-autofill]:!shadow-[inset_0_0_0px_1000px_rgba(212,175,55,0.08)]`}
                />
              </div>
              
              <div className="group">
                <label className="text-sm mb-2 block font-semibold text-muted/70 flex items-center gap-2">
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
                      ? 'bg-surface/20 border-border/40 text-text/60 cursor-not-allowed' 
                      : 'bg-surface/30 border-border/40 text-text focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-primary/50'
                    }
                    [&:-webkit-autofill]:!bg-[rgba(212,175,55,0.08)] 
                    [&:-webkit-autofill]:!text-[#F9FAFB] 
                    [&:-webkit-autofill]:!shadow-[inset_0_0_0px_1000px_rgba(212,175,55,0.08)]`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="group">
                <label className="text-sm mb-2 block font-semibold text-muted/70 flex items-center gap-2">
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
                      ? 'bg-surface/20 border-border/40 text-text/60 cursor-not-allowed' 
                      : 'bg-surface/30 border-border/40 text-text focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-primary/50'
                    }
                    [&:-webkit-autofill]:!bg-[rgba(212,175,55,0.08)] 
                    [&:-webkit-autofill]:!text-[#F9FAFB] 
                    [&:-webkit-autofill]:!shadow-[inset_0_0_0px_1000px_rgba(212,175,55,0.08)]`}
                />
              </div>
              
              <div className="group">
                <label className="text-sm mb-2 block font-semibold text-muted/70 flex items-center gap-2">
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
                      ? 'bg-surface/20 border-border/40 text-text/60 cursor-not-allowed' 
                      : 'bg-surface/30 border-border/40 text-text focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-primary/50'
                    }
                    [&:-webkit-autofill]:!bg-[rgba(212,175,55,0.08)] 
                    [&:-webkit-autofill]:!text-[#F9FAFB] 
                    [&:-webkit-autofill]:!shadow-[inset_0_0_0px_1000px_rgba(212,175,55,0.08)]`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ─── Tax Management Card ─── */}
        <div className="bg-card/60 backdrop-blur-sm rounded-2xl border border-border/30 p-6 shadow-2xl shadow-primary/5">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
              <Percent className="w-4 h-4 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-text tracking-tight">Tax Management</h2>
          </div>
          <p className="text-sm text-muted/50 mb-6 font-medium border-b border-border/20 pb-4">Manage how taxes are calculated for your orders.</p>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between p-5 bg-surface/20 rounded-xl border border-border/20">
              <div className="max-w-[70%]">
                <label className="text-base font-semibold text-text block">Enable Taxes</label>
                <p className="text-xs text-muted/50 mt-1 font-medium leading-relaxed">Automatically show/hide tax in user's menu and checkout screens.</p>
              </div>
              <button
                onClick={handleTaxToggle}
                disabled={saving}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                  form.showTax ? 'bg-primary' : 'bg-border/60'
                } ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-500 ${
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
                    <label className="text-sm mb-2 block font-semibold text-muted/70 flex items-center gap-2">
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
                        className="h-12 pr-12 rounded-xl border-border/40 bg-surface/30 text-text text-base font-semibold focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-primary/50 transition-all duration-300
                        [&:-webkit-autofill]:!bg-[rgba(212,175,55,0.08)] 
                        [&:-webkit-autofill]:!text-[#F9FAFB] 
                        [&:-webkit-autofill]:!shadow-[inset_0_0_0px_1000px_rgba(212,175,55,0.08)]"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-primary font-bold text-lg select-none">%</span>
                    </div>
                  </div>
                  <div className="bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-xl sm:max-w-[40%]">
                    <p className="text-xs text-emerald-400 font-medium leading-relaxed flex items-start gap-2">
                      <span className="text-lg">💡</span>
                      Changes are saved automatically. This rate applies to subtotals of all new orders.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
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