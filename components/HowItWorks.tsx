"use client";

import { QrCode, ShoppingCart, CreditCard, Bell, Zap, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const steps = [
  {
    icon: QrCode,
    title: "Scan QR Code",
    description: "Customers scan your QR code to instantly access your digital menu from their smartphone.",
    number: "01"
  },
  {
    icon: ShoppingCart,
    title: "Browse & Order",
    description: "Customers browse your menu, customize items, and place orders directly from their device.",
    number: "02"
  },
  {
    icon: CreditCard,
    title: "Secure Payment",
    description: "Integrated payment gateways handle transactions quickly and securely.",
    number: "03"
  },
  {
    icon: Bell,
    title: "Order Ready",
    description: "Get real-time notifications and updates when orders are placed and ready for pickup.",
    number: "04"
  }
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="section-padding bg-card border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 animate-on-scroll">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-4">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">How It Works</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-text">
            From Scan to Serve
            <span className="text-gradient-gold block">in Seconds</span>
          </h2>
          <p className="text-lg text-muted mt-4">
            The Dining Co. makes digital menu management simple and seamless for your restaurant.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting line */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/20 via-primary/40 to-primary/20 -translate-x-1/2"></div>

          <div className="space-y-12 lg:space-y-0">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex flex-col lg:flex-row items-center gap-8 lg:gap-12 animate-on-scroll ${
                  index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Number */}
                <div className="flex-shrink-0 w-20 h-20 lg:w-28 lg:h-28 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center text-4xl lg:text-5xl font-bold text-primary">
                  {step.number}
                </div>

                {/* Content */}
                <div className="flex-1 text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start gap-4 mb-2">
                    <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                      <step.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-text">{step.title}</h3>
                  </div>
                  <p className="text-muted max-w-md mx-auto lg:mx-0">
                    {step.description}
                  </p>
                </div>

                {/* Arrow indicator */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block text-muted/30">
                    <ChevronRight className="h-6 w-6" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16 animate-on-scroll">
          <div className="card-glass p-8 max-w-3xl mx-auto border border-border/50">
            <h3 className="text-2xl font-bold text-text mb-3">Ready to Get Started?</h3>
            <p className="text-muted mb-6">
              Transform your cafe or restaurant with The Dining Co. table QR technology.
            </p>
            <Link href="/#pricing">
              <Button size="lg" className="btn-primary group">
                Start Free Trial
                <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;