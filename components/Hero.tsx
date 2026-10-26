"use client";

import { ArrowRight, Play, Crown, Star, UtensilsCrossed, QrCode, ShieldCheck, Smartphone, Zap } from "lucide-react";
import Link from "next/link";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-[#FBF8F3] pt-20">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-gradient-to-t from-[#E5DFD4]/30 to-transparent"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Decorative Luxury Accents */}
      <div className="absolute top-24 right-20 text-primary/15 hidden xl:block pointer-events-none">
        <Crown size={120} />
      </div>
      <div className="absolute bottom-20 left-20 text-primary/15 hidden xl:block pointer-events-none">
        <UtensilsCrossed size={100} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Hero Content */}
          <div className="space-y-8">
            {/* Authentic Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 border border-primary/25 rounded-full">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
              <span className="text-primary text-xs sm:text-sm font-bold tracking-wider uppercase font-display">
                PREMIUM DIGITAL DINING & KITCHEN OS
              </span>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight text-[#1C1917] font-heading">
                Digitize Your{" "}
                <span className="gold-text">Dining</span>
                <br />
                Experience
              </h1>
              <p className="text-lg md:text-xl text-[#78716C] leading-relaxed max-w-lg">
                Equip your restaurant or cafe with luxury table QR menus, instant direct UPI payments, 
                promotional deal engines, live kitchen audio alerts, and authentic diner feedback. 
                Just <span className="text-primary font-bold">₹999/month</span> with <span className="text-[#1C1917] font-bold">0% commission</span>.
              </p>
            </div>

            {/* Authentic Core Pillars (No fake numbers) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 py-2">
              <div className="flex items-center gap-3 p-3 bg-white/70 rounded-2xl border border-[#E5DFD4]">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 shrink-0">
                  <ShieldCheck className="text-primary w-5 h-5" />
                </div>
                <div>
                  <div className="text-base font-extrabold text-[#1C1917]">0% Cut</div>
                  <div className="text-[11px] text-[#78716C]">Zero Commission</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white/70 rounded-2xl border border-[#E5DFD4]">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20 shrink-0">
                  <Zap className="text-emerald-600 w-5 h-5" />
                </div>
                <div>
                  <div className="text-base font-extrabold text-[#1C1917]">Direct UPI</div>
                  <div className="text-[11px] text-[#78716C]">Instant Bank Pay</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white/70 rounded-2xl border border-[#E5DFD4] col-span-2 sm:col-span-1">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 shrink-0">
                  <Smartphone className="text-primary w-5 h-5" />
                </div>
                <div>
                  <div className="text-base font-extrabold text-[#1C1917]">Zero App</div>
                  <div className="text-[11px] text-[#78716C]">Instant Browser Scan</div>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <Link href="/#pricing" className="w-full sm:w-auto">
                <button className="btn-primary-gold w-full justify-center group flex items-center gap-2 text-base px-8 py-4 font-bold shadow-lg shadow-primary/20 cursor-pointer">
                  <span>Start for ₹999/mo</span>
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                </button>
              </Link>
              <Link href="/suman/menu?table=4&scan=true" target="_blank" className="w-full sm:w-auto">
                <button className="btn-outline-gold w-full justify-center flex items-center gap-2 text-base px-8 py-4 font-semibold cursor-pointer">
                  <Play size={18} />
                  <span>View Live Demo</span>
                </button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-[#78716C]">
              <span>Zero setup fees</span>
              <span className="w-1.5 h-1.5 bg-[#E5DFD4] rounded-full hidden sm:block"></span>
              <span>Unlimited Table QR codes</span>
              <span className="w-1.5 h-1.5 bg-[#E5DFD4] rounded-full hidden sm:block"></span>
              <span>7-Day risk-free trial</span>
            </div>
          </div>

          {/* Hero Digital Menu Mockup with Real Suman Cafe Flow */}
          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-[#E5DFD4] bg-white p-6 sm:p-7">
              {/* Mockup Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#E5DFD4]">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-extrabold text-xs">
                    SC
                  </div>
                  <div>
                    <h4 className="text-[#1C1917] font-bold text-sm">Suman Cafe</h4>
                    <p className="text-[10px] text-[#78716C]">Live Digital Table Menu</p>
                  </div>
                </div>
                <div className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[11px] font-mono font-bold text-emerald-700 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Table 04
                </div>
              </div>

              {/* Active Special Deal Banner */}
              <div className="mt-3.5 p-2.5 bg-[#FBF8F3] rounded-xl border border-primary/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs">🏷️</span>
                  <div>
                    <span className="text-xs font-bold text-stone-900 block leading-tight">20% Off Mega Deal Active!</span>
                    <span className="text-[10px] text-stone-500">Auto-applies code TASTY20</span>
                  </div>
                </div>
                <span className="text-[10px] bg-primary text-white font-bold px-2 py-0.5 rounded-full">
                  APPLIED
                </span>
              </div>

              {/* Real Mockup Dishes */}
              <div className="space-y-2.5 py-3">
                <div className="flex items-center justify-between p-3 bg-[#FBF8F3] rounded-xl border border-[#E5DFD4] hover:border-primary/40 transition-all">
                  <div className="min-w-0 pr-3">
                    <p className="text-[#1C1917] font-bold text-xs sm:text-sm truncate">Biscoff Cheesecake Slice</p>
                    <p className="text-[11px] text-[#78716C] truncate">Baked NY style cream cheesecake, spiced Biscoff</p>
                  </div>
                  <span className="text-primary font-black text-sm whitespace-nowrap">₹290</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-[#FBF8F3] rounded-xl border border-[#E5DFD4] hover:border-primary/40 transition-all">
                  <div className="min-w-0 pr-3">
                    <p className="text-[#1C1917] font-bold text-xs sm:text-sm truncate">Warm Molten Choco Lava</p>
                    <p className="text-[11px] text-[#78716C] truncate">Belgian dark chocolate cake with warm fudge core</p>
                  </div>
                  <span className="text-primary font-black text-sm whitespace-nowrap">₹250</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-[#FBF8F3] rounded-xl border border-[#E5DFD4] hover:border-primary/40 transition-all">
                  <div className="min-w-0 pr-3">
                    <p className="text-[#1C1917] font-bold text-xs sm:text-sm truncate">Artisanal Pesto Penne Pasta</p>
                    <p className="text-[11px] text-[#78716C] truncate">Fresh basil, roasted pine nuts, parmesan cream</p>
                  </div>
                  <span className="text-primary font-black text-sm whitespace-nowrap">₹380</span>
                </div>
              </div>

              {/* Mockup Total & Checkout with Applied Discount */}
              <div className="mt-1 p-3 bg-[#FAF6EE] rounded-xl border border-primary/25 flex items-center justify-between">
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xs text-stone-400 line-through">₹920</span>
                    <span className="text-[#1C1917] font-black text-lg">₹736</span>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-bold block">
                    ✓ Saved ₹184 (20% Off)
                  </span>
                </div>
                <div className="px-3.5 py-2 bg-gradient-to-r from-primary to-primary-hover text-white rounded-xl font-bold text-xs shadow-md shadow-primary/20 flex items-center gap-1.5">
                  <span>Pay via UPI</span>
                  <span>→</span>
                </div>
              </div>
            </div>

            {/* Floating Badges */}
            <div className="absolute -top-3 -right-3 sm:-top-5 sm:-right-5 bg-white rounded-2xl p-3 shadow-xl border border-[#E5DFD4] animate-float">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                  <QrCode className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#1C1917]">Table 04 QR</div>
                  <div className="text-[10px] text-[#78716C]">Scan • Order • Pay</div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-3 -left-3 sm:-bottom-5 sm:-left-5 bg-white rounded-2xl p-3 shadow-xl border border-[#E5DFD4] animate-float" style={{ animationDelay: '1.5s' }}>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-600">
                  <Star className="w-4 h-4 fill-emerald-500 text-emerald-500" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#1C1917]">Guest Reviews</div>
                  <div className="text-[10px] text-[#78716C]">Live 5-Star Ratings</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;