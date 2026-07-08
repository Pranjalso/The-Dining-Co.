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
    <footer className="bg-[#0F0F0F] border-t border-[#2F2F2F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="py-12 md:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 lg:gap-12">
            {/* Company Info */}
            <div className="space-y-4">
              <Link href="/" className="flex items-center gap-2">
                <Crown className="text-primary w-6 h-6" />
                <span className="text-xl font-bold text-white">
                  The <span className="gold-text">Dining</span> Co.
                </span>
              </Link>
              <p className="text-muted text-sm leading-relaxed max-w-sm">
                Premium digital menu management for modern restaurants. 
                Empowering restaurants worldwide to deliver exceptional digital dining experiences.
              </p>
              <div className="flex flex-wrap gap-2">
                <a href="#" className="w-10 h-10 bg-[#1C1C1C] rounded-lg flex items-center justify-center hover:bg-primary/20 transition-colors border border-[#2F2F2F] hover:border-primary/30">
                  <Facebook className="h-4 w-4 text-muted hover:text-primary transition-colors" />
                </a>
                <a href="#" className="w-10 h-10 bg-[#1C1C1C] rounded-lg flex items-center justify-center hover:bg-primary/20 transition-colors border border-[#2F2F2F] hover:border-primary/30">
                  <Twitter className="h-4 w-4 text-muted hover:text-primary transition-colors" />
                </a>
                <a href="#" className="w-10 h-10 bg-[#1C1C1C] rounded-lg flex items-center justify-center hover:bg-primary/20 transition-colors border border-[#2F2F2F] hover:border-primary/30">
                  <Instagram className="h-4 w-4 text-muted hover:text-primary transition-colors" />
                </a>
                <a href="#" className="w-10 h-10 bg-[#1C1C1C] rounded-lg flex items-center justify-center hover:bg-primary/20 transition-colors border border-[#2F2F2F] hover:border-primary/30">
                  <Linkedin className="h-4 w-4 text-muted hover:text-primary transition-colors" />
                </a>
                <a href="#" className="w-10 h-10 bg-[#1C1C1C] rounded-lg flex items-center justify-center hover:bg-primary/20 transition-colors border border-[#2F2F2F] hover:border-primary/30">
                  <Youtube className="h-4 w-4 text-muted hover:text-primary transition-colors" />
                </a>
              </div>
            </div>

            {/* Product Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/#features" className="text-muted text-sm hover:text-primary transition-colors">
                    Digital QR Menus
                  </Link>
                </li>
                <li>
                  <Link href="/#features" className="text-muted text-sm hover:text-primary transition-colors">
                    Restaurant Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/#features" className="text-muted text-sm hover:text-primary transition-colors">
                    Analytics Suite
                  </Link>
                </li>
                <li>
                  <Link href="/#pricing" className="text-muted text-sm hover:text-primary transition-colors">
                    Pricing Plans
                  </Link>
                </li>
                <li>
                  <Link href="/#features" className="text-muted text-sm hover:text-primary transition-colors">
                    Integrations
                  </Link>
                </li>
              </ul>
            </div>

            {/* Solutions */}
            <div>
              <h4 className="text-white font-semibold mb-4">Solutions</h4>
              <ul className="space-y-3">
                <li>
                  <Link href="#" className="text-muted text-sm hover:text-primary transition-colors">
                    For Restaurants
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted text-sm hover:text-primary transition-colors">
                    For Cafés
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted text-sm hover:text-primary transition-colors">
                    For Hotels
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted text-sm hover:text-primary transition-colors">
                    For Chains
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted text-sm hover:text-primary transition-colors">
                    Enterprise
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="text-primary h-4 w-4 flex-shrink-0" />
                  <span className="text-muted break-all">hello@thediningco.com</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="text-primary h-4 w-4 flex-shrink-0" />
                  <span className="text-muted">+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="text-primary h-4 w-4 flex-shrink-0" />
                  <span className="text-muted">New York, NY</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#2F2F2F] py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-muted text-sm text-center md:text-left">
              © {new Date().getFullYear()} The Dining Co. All rights reserved.
            </div>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-sm">
              <Link href="/privacy-policy" className="text-muted hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms-and-conditions" className="text-muted hover:text-primary transition-colors">
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