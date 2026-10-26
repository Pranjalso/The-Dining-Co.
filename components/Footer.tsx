"use client";

import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Mail, 
  Phone, 
  Crown, 
  MapPin, 
  Youtube 
} from "lucide-react";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-[#F3EFE6] border-t border-[#E5DFD4]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="py-12 md:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 lg:gap-12">
            {/* Company Info */}
            <div className="space-y-4">
              <Link href="/" className="flex items-center gap-2">
                <Crown className="text-primary w-6 h-6" />
                <span className="text-xl font-bold text-[#1C1917]">
                  The <span className="gold-text">Dining</span> Co.
                </span>
              </Link>
              <p className="text-[#78716C] text-sm leading-relaxed max-w-sm">
                India's premier digital dining menu software. 
                Empowering restaurants & cafes to deliver exceptional, zero-commission dining experiences.
              </p>
              <div className="flex flex-wrap gap-2">
                <a href="#" className="w-10 h-10 bg-white rounded-xl flex items-center justify-center hover:bg-primary/10 transition-colors border border-[#E5DFD4] hover:border-primary/40 shadow-sm">
                  <Facebook className="h-4 w-4 text-[#78716C] hover:text-primary transition-colors" />
                </a>
                <a href="#" className="w-10 h-10 bg-white rounded-xl flex items-center justify-center hover:bg-primary/10 transition-colors border border-[#E5DFD4] hover:border-primary/40 shadow-sm">
                  <Twitter className="h-4 w-4 text-[#78716C] hover:text-primary transition-colors" />
                </a>
                <a href="#" className="w-10 h-10 bg-white rounded-xl flex items-center justify-center hover:bg-primary/10 transition-colors border border-[#E5DFD4] hover:border-primary/40 shadow-sm">
                  <Instagram className="h-4 w-4 text-[#78716C] hover:text-primary transition-colors" />
                </a>
                <a href="#" className="w-10 h-10 bg-white rounded-xl flex items-center justify-center hover:bg-primary/10 transition-colors border border-[#E5DFD4] hover:border-primary/40 shadow-sm">
                  <Linkedin className="h-4 w-4 text-[#78716C] hover:text-primary transition-colors" />
                </a>
                <a href="#" className="w-10 h-10 bg-white rounded-xl flex items-center justify-center hover:bg-primary/10 transition-colors border border-[#E5DFD4] hover:border-primary/40 shadow-sm">
                  <Youtube className="h-4 w-4 text-[#78716C] hover:text-primary transition-colors" />
                </a>
              </div>
            </div>

            {/* Product Links */}
            <div>
              <h4 className="text-[#1C1917] font-bold mb-4 font-heading">Product</h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/suman/menu?table=4&scan=true" target="_blank" className="text-primary font-semibold text-sm hover:underline flex items-center gap-1">
                    <span>Live Menu Demo</span>
                    <span>↗</span>
                  </Link>
                </li>
                <li>
                  <Link href="/adminlogin" className="text-[#78716C] text-sm hover:text-primary transition-colors">
                    Cafe Partner Login
                  </Link>
                </li>
                <li>
                  <Link href="/#features" className="text-[#78716C] text-sm hover:text-primary transition-colors">
                    Table QR Generator
                  </Link>
                </li>
                <li>
                  <Link href="/#features" className="text-[#78716C] text-sm hover:text-primary transition-colors">
                    Kitchen Display System
                  </Link>
                </li>
                <li>
                  <Link href="/#features" className="text-[#78716C] text-sm hover:text-primary transition-colors">
                    Direct UPI Billing
                  </Link>
                </li>
                <li>
                  <Link href="/#pricing" className="text-[#78716C] text-sm hover:text-primary transition-colors">
                    ₹999/mo Subscription
                  </Link>
                </li>
              </ul>
            </div>

            {/* Solutions */}
            <div>
              <h4 className="text-[#1C1917] font-bold mb-4">Solutions</h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/#pricing" className="text-[#78716C] text-sm hover:text-primary transition-colors">
                    For Cafes & Bakeries
                  </Link>
                </li>
                <li>
                  <Link href="/#pricing" className="text-[#78716C] text-sm hover:text-primary transition-colors">
                    For Fine Dining Restaurants
                  </Link>
                </li>
                <li>
                  <Link href="/#pricing" className="text-[#78716C] text-sm hover:text-primary transition-colors">
                    For Rooftop Lounges & Bars
                  </Link>
                </li>
                <li>
                  <Link href="/#pricing" className="text-[#78716C] text-sm hover:text-primary transition-colors">
                    For Cloud Kitchens & QSR
                  </Link>
                </li>
                <li>
                  <Link href="/#contact" className="text-[#78716C] text-sm hover:text-primary transition-colors">
                    Custom Restaurant Chains
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-[#1C1917] font-bold mb-4">Contact</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="text-primary h-4 w-4 flex-shrink-0" />
                  <a href="mailto:thediningco.contact@gmail.com" className="text-[#78716C] break-all hover:text-primary transition-colors">
                    thediningco.contact@gmail.com
                  </a>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="text-primary h-4 w-4 flex-shrink-0" />
                  <a href="tel:+918085444188" className="text-[#78716C] hover:text-primary transition-colors">
                    +91 80854 44188
                  </a>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="text-primary h-4 w-4 flex-shrink-0" />
                  <span className="text-[#78716C]">Bhopal, India</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#E5DFD4] py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-[#78716C] text-sm text-center md:text-left">
              © {new Date().getFullYear()} The Dining Co. All rights reserved.
            </div>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-sm">
              <Link href="/privacy-policy" className="text-[#78716C] hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms-and-conditions" className="text-[#78716C] hover:text-primary transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;