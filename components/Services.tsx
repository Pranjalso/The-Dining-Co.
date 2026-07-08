"use client";

import { 
  Smartphone, 
  RefreshCw, 
  BarChart3, 
  Users,
  Globe,
  ShieldCheck,
  Zap
} from "lucide-react";
import Link from "next/link";

const services = [
  {
    icon: Smartphone,
    title: "Digital QR Menu",
    description: "Create stunning digital menus accessible via QR code. Update instantly without reprinting.",
    link: "/services/digital-qr-menu"
  },
  {
    icon: RefreshCw,
    title: "Instant Menu Updates",
    description: "Update pricing, availability, and items in real-time across all devices and locations.",
    link: "/services/instant-updates"
  },
  {
    icon: BarChart3,
    title: "Analytics & Insights",
    description: "Track customer behavior, popular items, and revenue trends with powerful analytics.",
    link: "/services/analytics"
  },
  {
    icon: Users,
    title: "Multi-Restaurant Management",
    description: "Manage multiple locations from a single dashboard with centralized control.",
    link: "/services/multi-restaurant"
  },
  {
    icon: Globe,
    title: "Global Reach",
    description: "Serve international customers with multi-language support and localization.",
    link: "/services/global-reach"
  },
  {
    icon: ShieldCheck,
    title: "Enterprise Security",
    description: "Bank-grade security with role-based access control and data protection.",
    link: "/services/security"
  },
];

const Services = () => {
  return (
    <section id="services" className="section-padding bg-[#1C1C1C] scroll-mt-20">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 animate-on-scroll">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-0.5 bg-primary"></div>
            <span className="text-sm font-medium tracking-wider text-primary uppercase">Services</span>
            <div className="w-8 h-0.5 bg-primary"></div>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Premium <span className="gold-text">Services</span> for Your Restaurant
          </h2>
          <p className="text-lg text-muted max-w-3xl mx-auto leading-relaxed">
            Comprehensive solutions designed to elevate your restaurant's digital presence 
            and streamline your operations.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {services.map((service, index) => {
            const Icon = service.icon;
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
                  {service.title}
                </h3>
                <p className="text-muted leading-relaxed">
                  {service.description}
                </p>
                <Link href={service.link} className="mt-4 inline-flex items-center text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-sm font-medium">Learn More</span>
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Services;