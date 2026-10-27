"use client";

import { 
  Smartphone, 
  RefreshCw, 
  Tag, 
  Armchair,
  Receipt,
  Star
} from "lucide-react";
import Link from "next/link";

const services = [
  {
    icon: Smartphone,
    title: "Table-Wise Digital QR Menus",
    description: "Luxury digital menus with Devanagari Namaste welcome, dietary veg/non-veg tags, and instant mobile ordering without app downloads.",
    link: "/#features"
  },
  {
    icon: Armchair,
    title: "Table QR Code Generator",
    description: "Easily configure tables and print customized high-resolution QR standees and table tents for tables 1 through 50+.",
    link: "/#features"
  },
  {
    icon: RefreshCw,
    title: "Kitchen Display System (KDS)",
    description: "Real-time kitchen order tracking with split statuses (Pending, Preparing, Completed, Rejected) and audio chime notifications.",
    link: "/#features"
  },
  {
    icon: Receipt,
    title: "Direct UPI & Cash Payments",
    description: "Collect payments directly to your bank account via dynamic UPI QR codes (GPay, PhonePe, Paytm) or cash with 0% commission.",
    link: "/#features"
  },
  {
    icon: Tag,
    title: "Promotional Offers & Discount Engine",
    description: "Create percentage or flat discount deals that automatically present as luxury privilege passes upon scanning and auto-apply at checkout.",
    link: "/#features"
  },
  {
    icon: Star,
    title: "Customer Review Intelligence",
    description: "Gather authentic 5-star post-meal customer ratings and praise tags to monitor food quality and service performance.",
    link: "/#features"
  },
];

const Services = () => {
  return (
    <section id="services" className="section-padding bg-section scroll-mt-20 overflow-hidden w-full max-w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 animate-on-scroll">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-0.5 bg-primary"></div>
            <span className="text-sm font-medium tracking-wider text-primary uppercase font-display">Core Solutions</span>
            <div className="w-8 h-0.5 bg-primary"></div>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 font-heading">
            Everything Built for <span className="gold-text">Modern Hospitality</span>
          </h2>
          <p className="text-lg text-muted max-w-3xl mx-auto leading-relaxed">
            From table ordering to kitchen dispatch, UPI billing, active promotions, and customer feedback — explore what The Dining Co. delivers for ₹999/month.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div
                key={index}
                className="group premium-card p-6 md:p-8 animate-on-scroll hover:border-primary/50 transition-all duration-300 flex flex-col justify-between"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div>
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-all duration-300 group-hover:scale-110 border border-primary/20">
                    <Icon className="text-primary w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-text mb-3 group-hover:text-primary transition-colors font-heading">
                    {service.title}
                  </h3>
                  <p className="text-sm text-muted leading-relaxed">
                    {service.description}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-border">
                  <Link href={service.link} className="inline-flex items-center text-primary text-sm font-semibold group-hover:underline">
                    <span>Explore details</span>
                    <span className="ml-1.5 transition-transform group-hover:translate-x-1">→</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Services;