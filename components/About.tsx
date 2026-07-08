"use client";

import { Crown, Users, Coffee, Award, ArrowRight } from "lucide-react";
import Link from "next/link";

// ===== Define Globe FIRST =====
const Globe = (props: any) => {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
};
// ============================

const About = () => {
  const stats = [
    { label: "Restaurants", value: "500+", icon: Users },
    { label: "Orders Processed", value: "2M+", icon: Coffee },
    { label: "Countries", value: "15+", icon: Globe },
    { label: "Rating", value: "4.9/5", icon: Award },
  ];

  return (
    <section id="about" className="section-padding bg-[#1C1C1C]">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="animate-on-scroll">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-0.5 bg-primary"></div>
              <span className="text-sm font-medium tracking-wider text-primary uppercase">About Us</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              Redefining <span className="gold-text">Digital Dining</span> for Modern Restaurants
            </h2>
            <p className="text-lg text-muted leading-relaxed mb-6">
              The Dining Co. is a premium SaaS platform that helps restaurants, cafés, 
              hotels, and food businesses digitize their menu systems through elegant, 
              subscription-based solutions.
            </p>
            <p className="text-lg text-muted leading-relaxed mb-8">
              We believe that every restaurant deserves a digital presence that matches 
              the quality of its food and service. That's why we've created a platform 
              that combines luxury design with powerful functionality.
            </p>
            
            <Link href="/company">
              <button className="btn-primary-gold flex items-center gap-2">
                Learn More About Us
                <ArrowRight size={18} />
              </button>
            </Link>
          </div>

          {/* Right Content - Stats */}
          <div className="animate-on-scroll" style={{ animationDelay: "0.2s" }}>
            <div className="grid grid-cols-2 gap-6">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div 
                    key={index}
                    className="premium-card p-6 text-center group hover:border-primary/50 transition-all duration-300"
                  >
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/20 transition-colors">
                      <Icon className="text-primary w-6 h-6" />
                    </div>
                    <div className="text-3xl font-bold gold-text">{stat.value}</div>
                    <div className="text-sm text-muted">{stat.label}</div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-8 premium-card p-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Crown className="text-primary w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-white font-bold">Trusted by Industry Leaders</h4>
                  <p className="text-sm text-muted">Join the growing community of premium restaurants</p>
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