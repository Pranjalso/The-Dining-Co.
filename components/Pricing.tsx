"use client";

import { Check, Crown, Zap, ArrowRight, ShieldCheck, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type Plan = {
  name: string;
  badge?: string;
  price: string;
  period: string;
  description: string;
  subtext?: string;
  features: Array<{ name: string; included: boolean }>;
  cta: string;
  popular: boolean;
};

const plans: Plan[] = [
  {
    name: "Free Demo Trial",
    badge: "Try Risk-Free",
    price: "₹0",
    period: "/ 7 days",
    description: "Experience all dining & kitchen features before subscribing",
    subtext: "No credit card required",
    features: [
      { name: "Full Digital QR Menu Access", included: true },
      { name: "Namaste Welcome Greeting Animation", included: true },
      { name: "Table QR Code Generator", included: true },
      { name: "Live Kitchen Order Display & Audio Chimes", included: true },
      { name: "Direct UPI & Cash Payment Flow", included: true },
      { name: "Promotional Deals & Coupon Engine", included: true },
      { name: "Customer 5-Star Ratings & Reviews", included: true },
      { name: "0% Commission on All Orders", included: true },
      { name: "Custom Domain & Enterprise Support", included: false },
    ],
    cta: "Request Free Demo",
    popular: false,
  },
  {
    name: "Monthly Subscription",
    badge: "Most Flexible",
    price: "₹999",
    period: "/ 1 month",
    description: "Ideal for growing cafes, rooftop lounges & restaurants",
    subtext: "Pay month-to-month, cancel anytime",
    features: [
      { name: "Unlimited Digital QR Menu Items", included: true },
      { name: "Luxury Namaste Welcome Animation", included: true },
      { name: "Unlimited Table-Specific QR Codes", included: true },
      { name: "Promotional Deals & Discount Engine", included: true },
      { name: "Live Kitchen Display System (KDS)", included: true },
      { name: "Instant Audio Chime on New Orders", included: true },
      { name: "Direct UPI (GPay/PhonePe) & Cash Billing", included: true },
      { name: "Real-time Diner Payment Received Chime", included: true },
      { name: "Customer 5-Star Rating Intelligence", included: true },
      { name: "0% Commission on All Orders", included: true },
      { name: "Direct Phone & WhatsApp Support", included: true },
    ],
    cta: "Get Started (₹999/mo)",
    popular: false,
  },
  {
    name: "Annual Subscription",
    badge: "BEST VALUE • 2 MONTHS FREE",
    price: "₹9,999",
    period: "/ 1 year",
    description: "Complete digital dining transformation with maximum savings",
    subtext: "Just ₹833/month • Save ₹1,989 every year",
    features: [
      { name: "Everything in Monthly Plan", included: true },
      { name: "Unlimited Table-Wise QR Code Generation", included: true },
      { name: "High-Resolution Printable Table Standee Sheets", included: true },
      { name: "Promotional Deals with 1-Tap Auto-Apply", included: true },
      { name: "Instant Dish Stock Availability Toggle", included: true },
      { name: "Customer Feedback & Praise Tag Analytics", included: true },
      { name: "Real-time Order Audio Alerts", included: true },
      { name: "0% Commission Forever", included: true },
      { name: "2 Full Months Free Included", included: true },
      { name: "Free Menu Setup & Digital Onboarding", included: true },
    ],
    cta: "Subscribe for 1 Year (₹9,999)",
    popular: true,
  },
];

const Pricing = () => {
  return (
    <section id="pricing" className="section-padding bg-background scroll-mt-20 relative">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-primary/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 animate-on-scroll">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-0.5 bg-primary"></div>
            <span className="text-sm font-medium tracking-wider text-primary uppercase font-display">Transparent Pricing</span>
            <div className="w-8 h-0.5 bg-primary"></div>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 font-heading">
            Simple, Transparent <span className="gold-text">Subscription Plans</span>
          </h2>
          <p className="text-lg text-muted max-w-3xl mx-auto leading-relaxed">
            Zero commission. Zero hidden deductions. Choose ₹999 for 1 month or ₹9,999 for 1 year with 2 months free!
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-2xl p-7 sm:p-8 flex flex-col justify-between transition-all duration-300 animate-on-scroll ${
                plan.popular
                  ? "bg-white border-2 border-primary shadow-xl shadow-primary/10 scale-100 lg:scale-105 z-20"
                  : "bg-white border border-border hover:border-primary/50 hover:shadow-lg shadow-sm"
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Popular badge */}
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                  <div className={`px-4 py-1 rounded-full flex items-center gap-1.5 text-xs font-bold shadow-md ${
                    plan.popular
                      ? "bg-primary text-white shadow-primary/20"
                      : "bg-surface text-primary border border-primary/30"
                  }`}>
                    {plan.popular && <Crown className="h-3.5 w-3.5 text-white" />}
                    {plan.badge}
                  </div>
                </div>
              )}

              <div>
                {/* Plan header */}
                <div className="text-center mb-6 pt-2">
                  <h3 className="text-xl font-bold text-text tracking-tight font-heading">{plan.name}</h3>
                  <p className="text-xs text-muted mt-1 min-h-[32px] flex items-center justify-center">
                    {plan.description}
                  </p>
                  <div className="mt-4 flex items-baseline justify-center">
                    <span className="text-4xl sm:text-5xl font-extrabold gold-text font-price tabular-nums">{plan.price}</span>
                    <span className="text-muted text-sm ml-1.5 font-medium">{plan.period}</span>
                  </div>
                  {plan.subtext && (
                    <p className="text-[11px] text-primary font-medium mt-1">
                      {plan.subtext}
                    </p>
                  )}
                </div>

                {/* Features List */}
                <div className="space-y-3 mb-8 pt-4 border-t border-border">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        feature.included 
                          ? 'bg-primary/10 text-primary border border-primary/20' 
                          : 'bg-muted/10 text-muted/30 border border-muted/20'
                      }`}>
                        <Check className={`h-3 w-3 ${!feature.included && 'opacity-20'}`} />
                      </div>
                      <span className={`text-xs sm:text-sm leading-snug ${feature.included ? 'text-text font-medium' : 'text-muted/40 line-through'}`}>
                        {feature.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA Button */}
              <div>
                <Link href="/#contact" className="w-full block">
                  <Button
                    className={`w-full py-6 text-sm sm:text-base font-bold rounded-xl transition-all shadow-md cursor-pointer ${
                      plan.popular
                        ? "btn-primary-gold hover:shadow-primary/30 text-white"
                        : "border border-primary text-primary hover:bg-primary hover:text-white bg-transparent"
                    }`}
                  >
                    <span>{plan.cta}</span>
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Guarantee & Trust Badges */}
        <div className="text-center mt-12 animate-on-scroll">
          <div className="premium-card p-6 max-w-3xl mx-auto border border-border bg-white shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center text-xs sm:text-sm text-muted">
              <div className="flex items-center justify-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span>Zero Commission on Orders</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                <span>Instant Setup within 15 Minutes</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <QrCode className="h-4 w-4 text-primary" />
                <span>Unlimited Table QR Codes</span>
              </div>
            </div>
            <p className="mt-4 pt-3 border-t border-border text-xs text-muted">
              Ready to onboard your cafe or restaurant?{" "}
              <Link href="/#contact" className="text-primary hover:underline font-bold">
                Contact our onboarding team →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;