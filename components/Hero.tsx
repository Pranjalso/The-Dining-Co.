"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Crown, Star, Users, Coffee } from "lucide-react";
import Link from "next/link";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-[#0F0F0F] pt-20">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-gradient-to-t from-secondary/10 to-transparent"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl"></div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 right-20 text-primary/10 hidden xl:block">
        <Crown size={120} />
      </div>
      <div className="absolute bottom-20 left-20 text-primary/10 hidden xl:block">
        <Coffee size={100} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Hero Content */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
              <span className="text-primary text-sm font-medium tracking-wider">PREMIUM RESTAURANT SaaS</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                Digitize Your{" "}
                <span className="gold-text">Restaurant</span>
                <br />
                Experience
              </h1>
              <p className="text-lg md:text-xl text-muted leading-relaxed max-w-lg">
                Transform every menu into a premium digital experience. 
                Manage your restaurant's digital presence with elegance and ease.
              </p>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-6 md:gap-10 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Users className="text-primary w-5 h-5" />
                </div>
                <div>
                  <div className="text-xl font-bold text-white">500+</div>
                  <div className="text-sm text-muted">Restaurants</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Star className="text-primary w-5 h-5" />
                </div>
                <div>
                  <div className="text-xl font-bold text-white">4.9/5</div>
                  <div className="text-sm text-muted">Rating</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Coffee className="text-primary w-5 h-5" />
                </div>
                <div>
                  <div className="text-xl font-bold text-white">2M+</div>
                  <div className="text-sm text-muted">Orders</div>
                </div>
              </div>
            </div>

            {/* CTA Buttons - FIXED: Added proper button text */}
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <Link href="/#pricing" className="w-full sm:w-auto">
                <button className="btn-primary-gold w-full justify-center group flex items-center gap-2 text-base px-8 py-4">
                  <span>Start Free Trial</span>
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                </button>
              </Link>
              <Link href="/#features" className="w-full sm:w-auto">
                <button className="btn-outline-gold w-full justify-center flex items-center gap-2 text-base px-8 py-4">
                  <Play size={20} />
                  <span>View Demo</span>
                </button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted">
              <span>No credit card required</span>
              <span className="w-1 h-1 bg-muted rounded-full hidden sm:block"></span>
              <span>14-day free trial</span>
              <span className="w-1 h-1 bg-muted rounded-full hidden sm:block"></span>
              <span>Cancel anytime</span>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-[#2F2F2F]">
              <div className="aspect-[4/3] bg-gradient-to-br from-primary/10 via-[#1C1C1C] to-secondary/10 flex items-center justify-center relative">
                <div className="absolute inset-0 bg-[url('/hero-restaurant.jpg')] bg-cover bg-center opacity-30"></div>
                <div className="relative z-10 p-8 text-center">
                  <div className="bg-[#0F0F0F]/80 backdrop-blur-sm rounded-xl p-6 border border-primary/20 max-w-sm mx-auto">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-primary text-sm font-medium">DIGITAL MENU</span>
                      <span className="text-xs text-muted">Scan to order</span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-[#1C1C1C] rounded-lg border border-[#2F2F2F]">
                        <div>
                          <p className="text-white font-medium">Truffle Risotto</p>
                          <p className="text-xs text-muted">Premium • Chef's Special</p>
                        </div>
                        <span className="text-primary font-bold">$28</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-[#1C1C1C] rounded-lg border border-[#2F2F2F]">
                        <div>
                          <p className="text-white font-medium">Wagyu Steak</p>
                          <p className="text-xs text-muted">Grilled to perfection</p>
                        </div>
                        <span className="text-primary font-bold">$45</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-[#1C1C1C] rounded-lg border border-[#2F2F2F]">
                        <div>
                          <p className="text-white font-medium">Lobster Tail</p>
                          <p className="text-xs text-muted">Butter poached</p>
                        </div>
                        <span className="text-primary font-bold">$52</span>
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted">Subtotal</span>
                        <span className="text-white font-bold">$125</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-6 -right-6 bg-[#1C1C1C] rounded-xl p-4 shadow-xl border border-primary/20 animate-float">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📱</span>
                </div>
                <div>
                  <div className="text-sm font-bold text-white">QR Menu</div>
                  <div className="text-xs text-muted">Scan & Order</div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-6 -left-6 bg-[#1C1C1C] rounded-xl p-4 shadow-xl border border-primary/20 animate-float" style={{ animationDelay: '1s' }}>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">⚡</span>
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Real-Time</div>
                  <div className="text-xs text-muted">Instant Updates</div>
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