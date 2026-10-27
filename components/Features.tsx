"use client";

import { 
  QrCode, 
  Sparkles, 
  Smartphone, 
  ShieldCheck, 
  Bell,
  Star,
  Receipt,
  UtensilsCrossed,
  Tag
} from "lucide-react";

const features = [
  {
    icon: QrCode,
    title: "Table-Wise QR Generator",
    description: "Generate customized, high-resolution QR codes for each table (Table 1 to 50+) with instant printable standee sheets.",
  },
  {
    icon: UtensilsCrossed,
    title: "Traditional Namaste Welcome",
    description: "Delight your guests upon scanning with an elegant 2-second cultural Namaste greeting showing your cafe name and seated table number.",
  },
  {
    icon: Smartphone,
    title: "Zero-App Mobile Menu",
    description: "Customers browse full digital menus, add special cooking instructions, and place orders directly in their mobile browser without downloading any app.",
  },
  {
    icon: Tag,
    title: "Promotional Deals & Coupon Engine",
    description: "Create and manage active discount offers (20% off, flat ₹100, combo specials) that appear to guests upon scan and auto-apply at checkout.",
  },
  {
    icon: Bell,
    title: "Live Kitchen Display & Chimes",
    description: "Kitchen staff receive instant audio notifications and real-time order status tracking (Pending ➔ Preparing ➔ Completed / Rejected).",
  },
  {
    icon: Receipt,
    title: "Dynamic UPI QR & Cash Payments",
    description: "Generates real-time UPI QR codes with exact order total and table notes pre-filled for instant GPay, PhonePe, Paytm, and cash at counter.",
  },
  {
    icon: Sparkles,
    title: "Payment Received Confirmation",
    description: "When staff marks an order as paid, diners instantly hear a pleasant harmonic chime and a real-time confirmation banner on their phone.",
  },
  {
    icon: Star,
    title: "5-Star Rating & Praise Tags",
    description: "Collect authentic customer ratings and praise tags (Delicious Food, Quick Service, Great Vibe) after every meal, synced to your dashboard.",
  },
  {
    icon: ShieldCheck,
    title: "0% Commission Forever",
    description: "Never pay 20-30% commissions to third-party delivery aggregators. Keep 100% of your restaurant earnings with our flat ₹999/month subscription.",
  },
];

const Features = () => {
  return (
    <section id="features" className="section-padding bg-background scroll-mt-20 relative overflow-hidden w-full max-w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 animate-on-scroll">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-0.5 bg-primary"></div>
            <span className="text-sm font-medium tracking-wider text-primary uppercase font-display">Engineered for Dining Excellence</span>
            <div className="w-8 h-0.5 bg-primary"></div>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 font-heading">
            Everything Your Restaurant Needs, <span className="gold-text">Built Right In</span>
          </h2>
          <p className="text-lg text-muted max-w-3xl mx-auto leading-relaxed">
            From table QR scanning to kitchen dispatch, promotional coupons, UPI billing, and customer feedback — explore the complete operating system.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group premium-card p-6 md:p-8 animate-on-scroll hover:border-primary/50 transition-all duration-300"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-all duration-300 group-hover:scale-110 border border-primary/20">
                  <Icon className="text-primary w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-text mb-2.5 group-hover:text-primary transition-colors font-heading">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;