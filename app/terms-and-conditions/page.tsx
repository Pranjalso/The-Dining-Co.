"use client";

import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { 
  FileText, 
  Shield, 
  User, 
  CreditCard, 
  PenTool, 
  Scale, 
  Mail, 
  Crown, 
  CheckCircle, 
  ArrowRight,
  Lock,
  AlertCircle
} from "lucide-react";
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

export default function TermsAndConditions() {
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
                <FileText className="w-6 h-6 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-text tracking-tight mb-3">
              Terms & <span className="text-primary">Conditions</span>
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
                Welcome to <span className="text-primary font-semibold">The Dining Co.</span> These Terms and Conditions 
                govern your use of our website and our digital menu management platform. By accessing or using 
                our services, you agree to be bound by these terms.
              </motion.p>

              {/* Section 1 */}
              <motion.div variants={fadeInUp} className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 flex-shrink-0">
                    <Shield className="w-4 h-4 text-primary" />
                  </div>
                  <h2 className="text-xl font-semibold text-text">1. Use of Services</h2>
                </div>
                <p className="pl-11">
                  <span className="text-primary font-medium">The Dining Co.</span> provides a platform for restaurants 
                  to manage their digital menus and for customers to place orders via QR codes. You agree to use 
                  the services only for lawful purposes and in accordance with these Terms.
                </p>
              </motion.div>

              {/* Section 2 */}
              <motion.div variants={fadeInUp} className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 flex-shrink-0">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <h2 className="text-xl font-semibold text-text">2. Account Registration</h2>
                </div>
                <p className="pl-11">
                  To access certain features of the services, you may be required to register for an account. 
                  You must provide accurate and complete information and keep your account information updated. 
                  You are responsible for maintaining the confidentiality of your account credentials.
                </p>
              </motion.div>

              {/* Section 3 */}
              <motion.div variants={fadeInUp} className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 flex-shrink-0">
                    <CreditCard className="w-4 h-4 text-primary" />
                  </div>
                  <h2 className="text-xl font-semibold text-text">3. Fees and Payment</h2>
                </div>
                <p className="pl-11">
                  Certain services may be subject to fees. You agree to pay all fees associated with your use 
                  of the services. All payments are non-refundable unless otherwise stated in writing. We reserve 
                  the right to change our fees at any time upon notice to you.
                </p>
              </motion.div>

              {/* Section 4 */}
              <motion.div variants={fadeInUp} className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 flex-shrink-0">
                    <PenTool className="w-4 h-4 text-primary" />
                  </div>
                  <h2 className="text-xl font-semibold text-text">4. Intellectual Property</h2>
                </div>
                <p className="pl-11">
                  All content and materials available on <span className="text-primary font-medium">The Dining Co.</span>, 
                  including but not limited to text, graphics, logos, and software, are the property of 
                  <span className="text-primary font-medium"> The Dining Co.</span> or its licensors and are protected 
                  by applicable intellectual property laws.
                </p>
              </motion.div>

              {/* Section 5 */}
              <motion.div variants={fadeInUp} className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 flex-shrink-0">
                    <Scale className="w-4 h-4 text-primary" />
                  </div>
                  <h2 className="text-xl font-semibold text-text">5. Limitation of Liability</h2>
                </div>
                <p className="pl-11">
                  To the maximum extent permitted by law, <span className="text-primary font-medium">The Dining Co.</span> 
                  shall not be liable for any indirect, incidental, special, or consequential damages arising out 
                  of or in connection with your use of the services.
                </p>
              </motion.div>

              {/* Section 6 */}
              <motion.div variants={fadeInUp} className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 flex-shrink-0">
                    <Lock className="w-4 h-4 text-primary" />
                  </div>
                  <h2 className="text-xl font-semibold text-text">6. Governing Law</h2>
                </div>
                <p className="pl-11">
                  These Terms shall be governed by and construed in accordance with the laws of the jurisdiction 
                  in which <span className="text-primary font-medium">The Dining Co.</span> operates, without regard 
                  to its conflict of law principles.
                </p>
              </motion.div>

              {/* Section 7 */}
              <motion.div variants={fadeInUp} className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 flex-shrink-0">
                    <Mail className="w-4 h-4 text-primary" />
                  </div>
                  <h2 className="text-xl font-semibold text-text">7. Contact Us</h2>
                </div>
                <div className="pl-11 space-y-2">
                  <p className="text-sm">
                    If you have any questions about these Terms, please contact us at:
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

              {/* Important Notice */}
              <motion.div 
                variants={fadeInUp}
                className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-amber-800 mb-1">Important Notice</h4>
                  <p className="text-xs text-amber-700">
                    By using The Dining Co. platform, you acknowledge that you have read, understood, 
                    and agree to be bound by these Terms and Conditions.
                  </p>
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