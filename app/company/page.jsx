"use client";

import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import ScrollAnimations from "@/components/ScrollAnimations";
import { Button } from "@/components/ui/button";
import { Target, Zap, Coffee, Heart, Users, Globe, Shield, Award, ChevronRight, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { fadeIn, staggerContainer, textVariant } from "@/utils/motion";
import Head from "next/head";
import Link from "next/link";

const CompanyPage = () => {
  useEffect(() => {
    // Scroll animation initialization
  }, []);

  return (
    <div className="bg-background min-h-screen">
      <Head>
        <title>About The Dining Co. - Premium Restaurant Management Platform</title>
        <meta
          name="description"
          content="The Dining Co. is a premium restaurant management platform helping food businesses digitize their menus and operations. Learn about our mission and vision."
        />
      </Head>
      <ScrollAnimations />
      <Header />
      <main className="overflow-hidden pt-16">
        {/* Hero Section */}
        <section className="relative py-24 md:py-32 lg:py-40 overflow-hidden border-b border-border">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent"></div>
          <div className="absolute inset-0 bg-[url('/pattern.svg')] bg-[length:400px_400px] opacity-5"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              initial="hidden"
              animate="show"
              variants={staggerContainer}
              className="text-center max-w-4xl mx-auto"
            >
              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6">
                <Coffee className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">About Us</span>
              </div>
              <motion.h1
                variants={textVariant(0.1)}
                className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-text"
              >
                The Story Behind
                <span className="text-gradient-gold block">The Dining Co.</span>
              </motion.h1>
              <motion.p
                variants={textVariant(0.2)}
                className="text-lg md:text-xl text-muted mt-6 max-w-2xl mx-auto"
              >
                Premium digital menu management for modern restaurants, cafés, and food businesses.
              </motion.p>
              <motion.div variants={textVariant(0.3)} className="mt-8">
                <Link href="/#pricing">
                  <Button size="lg" className="btn-primary group text-base">
                    Start Free Trial
                    <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Mission & Vision Section */}
        <section className="py-20 md:py-28 bg-surface border-y border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true, margin: "-100px" }}
              className="text-center max-w-3xl mx-auto mb-16"
            >
              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-4">
                <Target className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">Our Purpose</span>
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-text">
                Our Mission & <span className="text-gradient-gold">Vision</span>
              </h2>
              <p className="text-lg text-muted mt-4">
                Driving the future of restaurant technology with clear goals and purpose.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true, margin: "-100px" }}
                className="card-glass p-8 text-center hover:border-primary/30 transition-all duration-300"
              >
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Target className="text-primary h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold text-text mb-4">Our Mission</h3>
                <p className="text-muted">
                  To empower restaurant owners with intuitive technology that simplifies operations, 
                  enhances customer experiences, and drives business growth through innovation.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true, margin: "-100px" }}
                className="card-glass p-8 text-center hover:border-primary/30 transition-all duration-300 border-primary/20"
              >
                <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Zap className="text-secondary h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold text-text mb-4">Our Vision</h3>
                <p className="text-muted">
                  To become the leading technology partner for restaurants worldwide, 
                  creating seamless digital experiences that connect businesses with their customers.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true, margin: "-100px" }}
                className="card-glass p-8 text-center hover:border-primary/30 transition-all duration-300"
              >
                <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Heart className="text-accent h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold text-text mb-4">Our Approach</h3>
                <p className="text-muted">
                  We combine deep industry knowledge with technical expertise to create solutions 
                  that are powerful, easy to use, and built for scale.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 md:py-28 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true, margin: "-100px" }}
              className="text-center max-w-3xl mx-auto mb-16"
            >
              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-4">
                <Award className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">Our Values</span>
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-text">
                What Guides <span className="text-gradient-gold">Our Work</span>
              </h2>
              <p className="text-lg text-muted mt-4">
                Our core principles shape everything we do at The Dining Co.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true, margin: "-100px" }}
                className="card-glass p-8 hover:border-primary/30 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-text mb-3">Innovation First</h3>
                <p className="text-sm text-muted">
                  We constantly push boundaries to create solutions that transform 
                  the restaurant industry, making operations smoother and customer experiences better.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true, margin: "-100px" }}
                className="card-glass p-8 hover:border-primary/30 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="text-xl font-bold text-text mb-3">Customer-Centric</h3>
                <p className="text-sm text-muted">
                  Every feature starts with understanding our customers' needs. 
                  We listen, learn, and build solutions that truly matter.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true, margin: "-100px" }}
                className="card-glass p-8 hover:border-primary/30 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-xl font-bold text-text mb-3">Reliability & Trust</h3>
                <p className="text-sm text-muted">
                  We build secure, reliable products that restaurants can depend on 
                  to run their business every single day.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Technology Section */}
        <section className="py-20 md:py-28 bg-surface border-y border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true, margin: "-100px" }}
              >
                <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-4">
                  <Globe className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-primary">Technology</span>
                </div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-text">
                  Powered by <span className="text-gradient-gold">Innovation</span>
                </h2>
                <p className="text-lg text-muted mt-4 mb-6">
                  We leverage cutting-edge technology to create seamless experiences for 
                  both restaurant owners and their customers.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-secondary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle className="h-3 w-3 text-secondary" />
                    </div>
                    <span className="text-muted">Advanced QR code technology for instant menu access</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-secondary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle className="h-3 w-3 text-secondary" />
                    </div>
                    <span className="text-muted">Real-time order management and analytics</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-secondary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle className="h-3 w-3 text-secondary" />
                    </div>
                    <span className="text-muted">Cloud-based infrastructure for reliability and scale</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-secondary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle className="h-3 w-3 text-secondary" />
                    </div>
                    <span className="text-muted">Enterprise-grade security and data protection</span>
                  </div>
                </div>
                <div className="mt-8">
                  <Link href="/#features">
                    <Button size="lg" className="btn-primary group">
                      Explore Our Technology
                      <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true, margin: "-100px" }}
                className="relative"
              >
                <div className="card-glass p-8 border border-primary/20">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                      <span className="text-3xl">🚀</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-text">Built for Scale</h3>
                      <p className="text-sm text-muted">Modern architecture for growing businesses</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-background/50 rounded-lg p-4 text-center border border-border">
                      <div className="text-2xl font-bold text-primary">99.9%</div>
                      <div className="text-xs text-muted">Uptime Guarantee</div>
                    </div>
                    <div className="bg-background/50 rounded-lg p-4 text-center border border-border">
                      <div className="text-2xl font-bold text-secondary">500+</div>
                      <div className="text-xs text-muted">Restaurants</div>
                    </div>
                    <div className="bg-background/50 rounded-lg p-4 text-center border border-border">
                      <div className="text-2xl font-bold text-accent">50K+</div>
                      <div className="text-xs text-muted">Orders Processed</div>
                    </div>
                    <div className="bg-background/50 rounded-lg p-4 text-center border border-border">
                      <div className="text-2xl font-bold text-primary">25+</div>
                      <div className="text-xs text-muted">Countries</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-28 bg-gradient-to-br from-primary/10 via-background to-background border-t border-border">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true, margin: "-100px" }}
              className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-text"
            >
              Ready to Transform Your <span className="text-gradient-gold">Restaurant</span>?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true, margin: "-100px" }}
              className="text-lg text-muted mt-4 max-w-2xl mx-auto"
            >
              Join hundreds of restaurants already using The Dining Co. to digitize their menus 
              and grow their business.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true, margin: "-100px" }}
              className="mt-8 flex flex-wrap gap-4 justify-center"
            >
              <Link href="/#pricing">
                <Button size="lg" className="btn-primary group text-base">
                  Start Free Trial
                  <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/#contact">
                <Button size="lg" variant="outline" className="text-base">
                  Book a Demo
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default CompanyPage;