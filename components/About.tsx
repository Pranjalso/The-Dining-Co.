"use client";

import { ShieldCheck, QrCode, ArrowRight, Zap, Clock, Smartphone, HeartHandshake } from "lucide-react";
import Link from "next/link";

const About = () => {
  const pillars = [
    { label: "Commission Free", value: "0%", subtext: "Keep 100% of sales", icon: ShieldCheck },
    { label: "Direct Settlement", value: "Instant", subtext: "UPI straight to bank", icon: Zap },
    { label: "Table Setup", value: "15 Min", subtext: "Fast onboarding", icon: Clock },
    { label: "Transparent Price", value: "₹999", subtext: "Per month flat", icon: QrCode },
  ];

  return (
    <section id="about" className="section-padding bg-section overflow-hidden w-full max-w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="animate-on-scroll">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-0.5 bg-primary"></div>
              <span className="text-sm font-medium tracking-wider text-primary uppercase font-display">About The Dining Co.</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight font-heading">
              Redefining <span className="gold-text">Table Dining</span> for Modern Restaurants
            </h2>
            <p className="text-base sm:text-lg text-muted leading-relaxed mb-6">
              The Dining Co. was created to solve a real restaurant problem: eliminate expensive 25-30% aggregator commissions 
              and costly printed menu reprint cycles with a lightning-fast, luxury digital dining operating platform.
            </p>
            <p className="text-base sm:text-lg text-muted leading-relaxed mb-8">
              From our signature <span className="text-text font-semibold">Namaste welcome greeting</span> and live table-specific 
              ordering to direct UPI billing, kitchen order chime notifications, and authentic post-meal 5-star reviews, we give 
              owners complete control over their guest experience starting at just <span className="text-primary font-bold">₹999/month</span>.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Link href="/#pricing">
                <button className="btn-primary-gold flex items-center gap-2 font-bold shadow-lg shadow-primary/20 cursor-pointer">
                  <span>View Subscription Plans</span>
                  <ArrowRight size={18} />
                </button>
              </Link>
              <Link href="/suman/menu?table=4&scan=true" target="_blank">
                <button className="btn-outline-gold flex items-center gap-2 font-medium cursor-pointer">
                  <span>Experience Live Menu</span>
                </button>
              </Link>
            </div>
          </div>

          {/* Right Content - Pillars */}
          <div className="animate-on-scroll" style={{ animationDelay: "0.2s" }}>
            <div className="grid grid-cols-2 gap-4 sm:gap-6">
              {pillars.map((pillar, index) => {
                const Icon = pillar.icon;
                return (
                  <div 
                    key={index}
                    className="premium-card p-6 text-center group hover:border-primary/50 transition-all duration-300"
                  >
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/20 transition-colors border border-primary/20">
                      <Icon className="text-primary w-6 h-6" />
                    </div>
                    <div className="text-3xl font-extrabold gold-text font-price">{pillar.value}</div>
                    <div className="text-xs sm:text-sm font-bold text-text mt-1">{pillar.label}</div>
                    <div className="text-[11px] text-muted mt-0.5">{pillar.subtext}</div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-6 sm:mt-8 premium-card p-6 border border-border bg-white shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0 border border-primary/20">
                  <HeartHandshake className="text-primary w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-text font-bold text-base">Direct Customer Connection</h4>
                  <p className="text-xs sm:text-sm text-muted">
                    No middlemen holding your customer database or payout funds. Orders go straight from your guest&apos;s phone to your kitchen screen, and payment goes straight to your UPI ID.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;