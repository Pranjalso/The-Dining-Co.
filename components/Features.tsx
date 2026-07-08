"use client";

import { 
  QrCode, 
  LayoutDashboard, 
  RefreshCw, 
  Smartphone, 
  Shield, 
  Users,
  BarChart3,
  Globe,
  Clock,
  Award,
  Sparkles,
  Zap
} from "lucide-react";

const features = [
  {
    icon: QrCode,
    title: "Digital QR Menus",
    description: "Create beautiful, interactive digital menus that customers can access instantly with a simple QR scan.",
    color: "gold"
  },
  {
    icon: RefreshCw,
    title: "Real-Time Updates",
    description: "Update your menu instantly across all devices. Change prices, add items, or remove dishes in seconds.",
    color: "gold"
  },
  {
    icon: LayoutDashboard,
    title: "Restaurant Dashboard",
    description: "Manage your entire restaurant from a single, elegant dashboard. View analytics, orders, and more.",
    color: "gold"
  },
  {
    icon: Users,
    title: "Multi-Restaurant Management",
    description: "Manage multiple restaurant locations from one central platform with role-based access control.",
    color: "gold"
  },
  {
    icon: Smartphone,
    title: "Mobile-First Design",
    description: "Every menu is optimized for mobile devices, ensuring a premium experience for every customer.",
    color: "gold"
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Bank-grade encryption and security protocols to protect your restaurant data and customer information.",
    color: "gold"
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Get deep insights into customer preferences, popular items, and revenue trends to grow your business.",
    color: "gold"
  },
  {
    icon: Globe,
    title: "Global Reach",
    description: "Serve international customers with multi-language support and currency conversion built-in.",
    color: "gold"
  },
  {
    icon: Clock,
    title: "24/7 Support",
    description: "Our dedicated support team is always available to help you with any questions or issues.",
    color: "gold"
  },
];

const Features = () => {
  return (
    <section id="features" className="section-padding bg-[#0F0F0F] scroll-mt-20">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 animate-on-scroll">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-0.5 bg-primary"></div>
            <span className="text-sm font-medium tracking-wider text-primary uppercase">Features</span>
            <div className="w-8 h-0.5 bg-primary"></div>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Everything You Need for <span className="gold-text">Digital Excellence</span>
          </h2>
          <p className="text-lg text-muted max-w-3xl mx-auto leading-relaxed">
            A comprehensive platform designed to transform your restaurant's digital presence 
            and streamline your operations.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group premium-card p-6 md:p-8 animate-on-scroll"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-all duration-300 group-hover:scale-110">
                  <Icon className="text-primary w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted leading-relaxed">
                  {feature.description}
                </p>
                <div className="mt-4 flex items-center text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-sm font-medium">Learn More</span>
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center animate-on-scroll">
          <div className="premium-card p-8 md:p-12 max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-left">
                <h3 className="text-2xl font-bold text-white mb-2">Ready to Get Started?</h3>
                <p className="text-muted">Join 500+ restaurants using The Dining Co.</p>
              </div>
              <button className="btn-primary-gold whitespace-nowrap flex items-center gap-2">
                <Zap size={18} />
                Start Free Trial
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;