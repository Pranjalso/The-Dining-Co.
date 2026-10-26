"use client";

import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Shield, Lock, Eye, Database, Mail, Crown, CheckCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <Header />
      <main className="relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-slow delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/3 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
                <Shield className="w-6 h-6 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-text tracking-tight mb-3">
              Privacy <span className="text-primary">Policy</span>
            </h1>
            <p className="text-muted/60 text-sm flex items-center justify-center gap-2">
              <span className="w-1 h-1 bg-primary/30 rounded-full"></span>
              Last Updated: March 20, 2026
              <span className="w-1 h-1 bg-primary/30 rounded-full"></span>
            </p>
          </motion.div>

          {/* Content */}
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="bg-white border border-border rounded-2xl p-6 md:p-8 shadow-sm"
          >
            <div className="space-y-8 text-muted/80 leading-relaxed">
              {/* Introduction */}
              <motion.p variants={fadeInUp} className="text-base">
                At <span className="text-primary font-semibold">The Dining Co.</span>, we take your privacy seriously. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information 
                when you visit our website and use our digital menu management platform.
              </motion.p>

              {/* Section 1 */}
              <motion.div variants={fadeInUp} className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 flex-shrink-0">
                    <Database className="w-4 h-4 text-primary" />
                  </div>
                  <h2 className="text-xl font-semibold text-text">1. Information We Collect</h2>
                </div>
                <p className="pl-11">
                  We collect information that you provide directly to us, such as when you create an account, 
                  place an order, or contact customer support. This may include:
                </p>
                <ul className="pl-11 space-y-2">
                  {[
                    "Contact information (name, email address, phone number)",
                    "Business information (restaurant name, address, menu details)",
                    "Payment information (processed securely through our payment partners)",
                    "Usage data (how you interact with our platform)"
                  ].map((item, index) => (
                    <motion.li 
                      key={index}
                      variants={fadeInUp}
                      className="flex items-start gap-2 text-sm"
                    >
                      <CheckCircle className="w-4 h-4 text-primary/60 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>

              {/* Section 2 */}
              <motion.div variants={fadeInUp} className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 flex-shrink-0">
                    <Eye className="w-4 h-4 text-primary" />
                  </div>
                  <h2 className="text-xl font-semibold text-text">2. How We Use Your Information</h2>
                </div>
                <p className="pl-11">
                  We use the information we collect to:
                </p>
                <ul className="pl-11 space-y-2">
                  {[
                    "Provide, maintain, and improve our services",
                    "Process transactions and send related information",
                    "Send technical notices, updates, and security alerts",
                    "Respond to your comments and questions"
                  ].map((item, index) => (
                    <motion.li 
                      key={index}
                      variants={fadeInUp}
                      className="flex items-start gap-2 text-sm"
                    >
                      <CheckCircle className="w-4 h-4 text-primary/60 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>

              {/* Section 3 */}
              <motion.div variants={fadeInUp} className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 flex-shrink-0">
                    <Lock className="w-4 h-4 text-primary" />
                  </div>
                  <h2 className="text-xl font-semibold text-text">3. Sharing of Information</h2>
                </div>
                <p className="pl-11">
                  We do not share your personal information with third parties except as described in this policy:
                </p>
                <ul className="pl-11 space-y-2">
                  {[
                    "With vendors and service providers who need access to perform work on our behalf",
                    "In response to a request for information if we believe disclosure is in accordance with applicable law",
                    "If we believe your actions are inconsistent with our user agreements or policies"
                  ].map((item, index) => (
                    <motion.li 
                      key={index}
                      variants={fadeInUp}
                      className="flex items-start gap-2 text-sm"
                    >
                      <CheckCircle className="w-4 h-4 text-primary/60 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>

              {/* Section 4 */}
              <motion.div variants={fadeInUp} className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 flex-shrink-0">
                    <Shield className="w-4 h-4 text-primary" />
                  </div>
                  <h2 className="text-xl font-semibold text-text">4. Security</h2>
                </div>
                <p className="pl-11">
                  We use administrative, technical, and physical security measures to help protect your 
                  personal information. While we have taken reasonable steps to secure the personal information 
                  you provide to us, please be aware that despite our efforts, no security measures are 
                  perfect or impenetrable.
                </p>
              </motion.div>

              {/* Section 5 */}
              <motion.div variants={fadeInUp} className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 flex-shrink-0">
                    <Mail className="w-4 h-4 text-primary" />
                  </div>
                  <h2 className="text-xl font-semibold text-text">5. Contact Us</h2>
                </div>
                <div className="pl-11 space-y-2">
                  <p className="text-sm">
                    If you have questions or comments about this Privacy Policy, please contact us at:
                  </p>
                  <div className="bg-[#FBF8F3] border border-border rounded-xl p-4">
                    <p className="text-sm">
                      <span className="text-muted">Email:</span>{' '}
                      <a 
                        href="mailto:thediningco.contact@gmail.com" 
                        className="text-primary hover:underline transition-colors font-medium"
                      >
                        thediningco.contact@gmail.com
                      </a>
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Back to Home */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 text-center"
          >
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-muted/60 hover:text-primary transition-colors duration-300 text-sm group"
            >
              <span className="w-1 h-1 bg-primary/30 rounded-full"></span>
              Back to Home
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </main>
      <Footer />

      <style jsx global>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        .delay-1000 {
          animation-delay: 1000ms;
        }
      `}</style>
    </div>
  );
}