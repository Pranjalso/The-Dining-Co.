"use client";

import { useState } from "react";
import { X, Send, Calendar, MapPin, Building, User, Mail, Phone, CheckCircle } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type DemoRequestPopupProps = {
  onClose: () => void;
};

const demoRequestSchema = z.object({
  cafeName: z.string().min(1, "Restaurant name is required"),
  ownerName: z.string().min(1, "Owner name is required"),
  email: z.string().email("Invalid email address"),
  city: z.string().min(1, "City is required"),
  location: z.string().min(1, "Location is required"),
  startDate: z.string().min(1, "Start date is required"),
  contactNumber: z.string().min(10, "Contact number must be at least 10 digits"),
});

export default function DemoRequestPopup({ onClose }: DemoRequestPopupProps) {
  const [formData, setFormData] = useState({
    cafeName: "",
    ownerName: "",
    email: "",
    city: "",
    location: "",
    startDate: "",
    contactNumber: "",
  });
  const [errors, setErrors] = useState<z.ZodError | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const getError = (path: string) => {
    return errors?.issues.find((i) => i.path[0] === path)?.message;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = demoRequestSchema.safeParse(formData);
    if (!result.success) {
      setErrors(result.error);
      return;
    }
    setErrors(null);
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch("/api/demo-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitStatus("success");
        setTimeout(() => onClose(), 20000);
      } else {
        const data = await response.json().catch(() => null);
        console.error('Demo request failed response:', data);
        setSubmitStatus("error");
      }
    } catch (error) {
      console.error('Demo request submit error:', error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-md flex items-center justify-center z-[100] p-4">
      <div className="bg-card rounded-2xl shadow-2xl shadow-primary/5 w-full max-w-lg overflow-hidden border border-border animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-border p-6 relative">
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 p-2.5 rounded-xl border border-primary/30">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-text">Request a Demo</h2>
              <p className="text-muted text-sm">Fill details for a personalized walkthrough</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-muted hover:text-text transition-colors p-1.5 hover:bg-surface/50 rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5 max-h-[80vh] overflow-y-auto scrollbar-hide">
          {submitStatus === "success" ? (
            <div className="text-center py-12 animate-in fade-in slide-in-from-bottom-4">
              <div className="w-20 h-20 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-secondary/30">
                <CheckCircle className="h-10 w-10 text-secondary" />
              </div>
              <h3 className="text-2xl font-bold text-text mb-2">Demo Request Sent!</h3>
              <p className="text-muted text-sm max-w-xs mx-auto">
                Thank you for your interest! We'll get back to you within 24 hours to schedule your personalized demo.
              </p>
              <div className="mt-6 flex justify-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <div className="w-2 h-2 bg-primary/40 rounded-full"></div>
                <div className="w-2 h-2 bg-primary/20 rounded-full"></div>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Restaurant Name */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-muted flex items-center gap-2">
                    <Building className="h-4 w-4 text-primary" /> Restaurant Name *
                  </label>
                  <Input
                    name="cafeName"
                    placeholder="E.g. The Grand Dining"
                    value={formData.cafeName}
                    onChange={handleChange}
                    className={`bg-surface border-border text-stone-900 placeholder:text-stone-400 focus:border-primary focus:ring-primary/20 ${getError("cafeName") ? "border-destructive focus-visible:ring-destructive/20" : ""}`}
                  />
                  {getError("cafeName") && <p className="text-destructive text-xs">{getError("cafeName")}</p>}
                </div>

                {/* Owner Name */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-muted flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" /> Owner Name *
                  </label>
                  <Input
                    name="ownerName"
                    placeholder="Your Full Name"
                    value={formData.ownerName}
                    onChange={handleChange}
                    className={`bg-surface border-border text-stone-900 placeholder:text-stone-400 focus:border-primary focus:ring-primary/20 ${getError("ownerName") ? "border-destructive focus-visible:ring-destructive/20" : ""}`}
                  />
                  {getError("ownerName") && <p className="text-destructive text-xs">{getError("ownerName")}</p>}
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-muted flex items-center gap-2">
                    <Mail className="h-4 w-4 text-primary" /> Email Address *
                  </label>
                  <Input
                    type="email"
                    name="email"
                    placeholder="you@restaurant.com"
                    value={formData.email}
                    onChange={handleChange}
                    className={`bg-surface border-border text-stone-900 placeholder:text-stone-400 focus:border-primary focus:ring-primary/20 ${getError("email") ? "border-destructive focus-visible:ring-destructive/20" : ""}`}
                  />
                  {getError("email") && <p className="text-destructive text-xs">{getError("email")}</p>}
                </div>

                {/* Contact Number */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-muted flex items-center gap-2">
                    <Phone className="h-4 w-4 text-primary" /> Contact Number *
                  </label>
                  <Input
                    name="contactNumber"
                    placeholder="10 digit number"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    className={`bg-surface border-border text-stone-900 placeholder:text-stone-400 focus:border-primary focus:ring-primary/20 ${getError("contactNumber") ? "border-destructive focus-visible:ring-destructive/20" : ""}`}
                  />
                  {getError("contactNumber") && <p className="text-destructive text-xs">{getError("contactNumber")}</p>}
                </div>

                {/* City */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-muted flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" /> City *
                  </label>
                  <Input
                    name="city"
                    placeholder="Your City"
                    value={formData.city}
                    onChange={handleChange}
                    className={`bg-surface border-border text-stone-900 placeholder:text-stone-400 focus:border-primary focus:ring-primary/20 ${getError("city") ? "border-destructive focus-visible:ring-destructive/20" : ""}`}
                  />
                  {getError("city") && <p className="text-destructive text-xs">{getError("city")}</p>}
                </div>

                {/* Location */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-muted flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" /> Location *
                  </label>
                  <Input
                    name="location"
                    placeholder="Area/Street"
                    value={formData.location}
                    onChange={handleChange}
                    className={`bg-surface border-border text-stone-900 placeholder:text-stone-400 focus:border-primary focus:ring-primary/20 ${getError("location") ? "border-destructive focus-visible:ring-destructive/20" : ""}`}
                  />
                  {getError("location") && <p className="text-destructive text-xs">{getError("location")}</p>}
                </div>

                {/* Start Date */}
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-sm font-medium text-muted flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" /> Preferred Start Date *
                  </label>
                  <Input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className={`bg-surface border-border text-text focus:border-primary focus:ring-primary/20 ${getError("startDate") ? "border-destructive focus-visible:ring-destructive/20" : ""}`}
                  />
                  {getError("startDate") && <p className="text-destructive text-xs">{getError("startDate")}</p>}
                </div>
              </div>

              {submitStatus === "error" && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
                  Failed to send demo request. Please try again later.
                </div>
              )}

              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full btn-primary h-12 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Send className="h-5 w-5" />
                      Book My Demo
                    </span>
                  )}
                </Button>
                <p className="text-center text-xs text-muted mt-4">
                  By clicking "Book My Demo", you agree to our terms of service and privacy policy.
                </p>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}