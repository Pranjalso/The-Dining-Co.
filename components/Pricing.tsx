"use client";

import { Check, Crown, Sparkles, Zap, TrendingUp, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const plans = [
  {
    name: "Starter",
    price: "$29",
    period: "/month",
    description: "Perfect for small restaurants and cafés",
    features: [
      { name: "Digital QR Menu", included: true },
      { name: "Unlimited Menu Items", included: true },
      { name: "Category Management", included: true },
      { name: "Basic Analytics", included: true },
      { name: "Email Support", included: true },
      { name: "Custom Branding", included: false },
      { name: "Multi-Language", included: false },
      { name: "API Access", included: false },
    ],
    cta: "Start Free Trial",
    popular: false,
  },
  {
    name: "Professional",
    price: "$79",
    period: "/month",
    description: "Complete solution for growing restaurants",
    features: [
      { name: "Digital QR Menu", included: true },
      { name: "Unlimited Menu Items", included: true },
      { name: "Category Management", included: true },
      { name: "Advanced Analytics", included: true },
      { name: "Priority Support", included: true },
      { name: "Custom Branding", included: true },
      { name: "Multi-Language", included: true },
      { name: "API Access", included: false },
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For restaurant chains and large businesses",
    features: [
      { name: "Digital QR Menu", included: true },
      { name: "Unlimited Menu Items", included: true },
      { name: "Category Management", included: true },
      { name: "Enterprise Analytics", included: true },
      { name: "24/7 Priority Support", included: true },
      { name: "Custom Branding", included: true },
      { name: "Multi-Language", included: true },
      { name: "Full API Access", included: true },
    ],
    cta: "Contact Sales",
    popular: false,
  }
];

const Pricing = () => {
  return (
    <section id="pricing" className="section-padding bg-[#0F0F0F] scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 animate-on-scroll">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-0.5 bg-primary"></div>
            <span className="text-sm font-medium tracking-wider text-primary uppercase">Pricing</span>
            <div className="w-8 h-0.5 bg-primary"></div>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Choose Your <span className="gold-text">Perfect Plan</span>
          </h2>
          <p className="text-lg text-muted max-w-3xl mx-auto leading-relaxed">
            Start with a free trial and upgrade as you grow. No hidden fees, cancel anytime.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative premium-card p-8 transition-all duration-300 animate-on-scroll ${
                plan.popular
                  ? "border-primary/50 shadow-xl shadow-primary/10 scale-105 lg:scale-110"
                  : "hover:border-primary/30 hover:shadow-lg"
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-primary text-[#0F0F0F] px-4 py-1.5 rounded-full flex items-center gap-2 text-xs font-semibold shadow-lg shadow-primary/25">
                    <Crown className="h-3.5 w-3.5" />
                    Most Popular
                  </div>
                </div>
              )}

              {/* Plan header */}
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                <p className="text-sm text-muted mt-1">{plan.description}</p>
                <div className="mt-4">
                  <span className="text-4xl font-bold gold-text">{plan.price}</span>
                  {plan.period && (
                    <span className="text-muted ml-1">{plan.period}</span>
                  )}
                </div>
              </div>

              {/* Features */}
              <div className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      feature.included ? 'bg-primary/20 text-primary' : 'bg-muted/10 text-muted'
                    }`}>
                      <Check className={`h-3 w-3 ${!feature.included && 'opacity-30'}`} />
                    </div>
                    <span className={`text-sm ${feature.included ? 'text-white' : 'text-muted'}`}>
                      {feature.name}
                    </span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <Link href="/#contact">
                <Button
                  className={`w-full text-base font-semibold ${
                    plan.popular
                      ? "btn-primary-gold"
                      : "border border-primary text-primary hover:bg-primary hover:text-[#0F0F0F]"
                  }`}
                  variant={plan.popular ? "default" : "outline"}
                >
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>

        {/* Additional info */}
        <div className="text-center mt-12 animate-on-scroll">
          <div className="premium-card p-6 max-w-3xl mx-auto border border-[#2F2F2F]">
            <div className="flex flex-wrap gap-6 justify-center items-center text-sm text-muted">
              <span className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                Free trial available
              </span>
              <span className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                No setup fees
              </span>
              <span className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-primary" />
                24/7 support
              </span>
            </div>
            <p className="mt-3 text-sm text-muted">
              Need a custom solution?{" "}
              <Link href="/#contact" className="text-primary hover:underline font-medium">
                Contact our team
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;