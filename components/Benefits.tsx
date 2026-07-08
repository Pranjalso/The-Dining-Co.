"use client";

import {
  Zap,
  Users,
  TrendingUp,
  Globe,
  Shield,
  Smartphone,
  Sparkles,
  CheckCircle
} from "lucide-react";

const benefits = [
  {
    icon: Zap,
    title: "Faster Ordering",
    description: "QR scanning reduces wait times by up to 40% and eliminates order errors.",
    stat: "40% faster",
    color: "primary"
  },
  {
    icon: Users,
    title: "Staff Efficiency",
    description: "Reduce manual order taking and focus staff on food preparation and customer service.",
    stat: "50% less workload",
    color: "secondary"
  },
  {
    icon: TrendingUp,
    title: "Real-time Analytics",
    description: "Monitor orders, inventory, and customer preferences with live dashboard insights.",
    stat: "Live insights",
    color: "accent"
  },
  {
    icon: Globe,
    title: "Multi-language Support",
    description: "Serve international customers with automatic language detection and translation.",
    stat: "15+ languages",
    color: "primary"
  },
  {
    icon: Shield,
    title: "Secure Platform",
    description: "Enterprise-grade security with role-based access and data protection.",
    stat: "Bank-level security",
    color: "secondary"
  },
  {
    icon: Smartphone,
    title: "Mobile Optimized",
    description: "Perfectly responsive menus that work on any device, anywhere.",
    stat: "100% responsive",
    color: "accent"
  }
];

const Benefits = () => {
  return (
    <section id="benefits" className="section-padding bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 animate-on-scroll">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-4">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Benefits</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-text">
            Transform Your
            <span className="text-gradient-gold block">Restaurant Experience</span>
          </h2>
          <p className="text-lg text-muted mt-4">
            The Dining Co. delivers measurable improvements to your operations, customer satisfaction, and bottom line.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            const colorMap = {
              primary: "bg-primary/20 text-primary",
              secondary: "bg-secondary/20 text-secondary",
              accent: "bg-accent/20 text-accent"
            };
            const borderMap = {
              primary: "border-primary/30",
              secondary: "border-secondary/30",
              accent: "border-accent/30"
            };

            return (
              <div
                key={index}
                className="card-glass p-6 hover:border-primary/30 transition-all duration-300 group animate-on-scroll"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${colorMap[benefit.color as keyof typeof colorMap]}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-text">{benefit.title}</h3>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${borderMap[benefit.color as keyof typeof borderMap]} ${colorMap[benefit.color as keyof typeof colorMap]}`}>
                        {benefit.stat}
                      </span>
                    </div>
                    <p className="text-sm text-muted leading-relaxed">{benefit.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom section */}
        <div className="mt-16 animate-on-scroll">
          <div className="card-glass p-8 md:p-12 max-w-4xl mx-auto border border-border/50 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <CheckCircle className="h-6 w-6 text-secondary" />
              <h3 className="text-2xl font-bold text-text">Why Restaurants Choose The Dining Co.</h3>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 mt-6 text-left">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-secondary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle className="h-3 w-3 text-secondary" />
                </div>
                <span className="text-sm text-muted">No installation or hardware required</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-secondary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle className="h-3 w-3 text-secondary" />
                </div>
                <span className="text-sm text-muted">Works on any smartphone or tablet</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-secondary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle className="h-3 w-3 text-secondary" />
                </div>
                <span className="text-sm text-muted">Real-time analytics and reporting</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-secondary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle className="h-3 w-3 text-secondary" />
                </div>
                <span className="text-sm text-muted">24/7 dedicated support</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Benefits;