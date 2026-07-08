"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Sparkles } from "lucide-react";

const faqs = [
  {
    question: "What is The Dining Co.?",
    answer: "The Dining Co. is a premium SaaS platform that helps restaurants, cafés, hotels, and food businesses digitize their menu systems through elegant, subscription-based solutions. We provide digital QR menus, real-time updates, analytics, and multi-restaurant management."
  },
  {
    question: "How does the QR menu work?",
    answer: "Each restaurant gets a unique QR code that customers can scan with their smartphone. This instantly opens your digital menu, allowing customers to browse, customize, and place orders directly from their device."
  },
  {
    question: "Can I update my menu in real-time?",
    answer: "Yes! You can update your menu instantly from your dashboard. Changes like price updates, new items, or availability changes are reflected immediately on all devices without any delay."
  },
  {
    question: "Is there a free trial available?",
    answer: "Yes, we offer a free trial so you can experience the full power of The Dining Co. platform before committing to a subscription."
  },
  {
    question: "What kind of support do you offer?",
    answer: "We provide 24/7 dedicated support for all our customers. Our team is always available to help you with any questions, issues, or guidance you might need."
  },
  {
    question: "Can I manage multiple restaurant locations?",
    answer: "Absolutely! Our multi-restaurant management feature allows you to control all your locations from a single, centralized dashboard with role-based access control."
  }
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="section-padding bg-[#1C1C1C] scroll-mt-20">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 animate-on-scroll">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-0.5 bg-primary"></div>
            <span className="text-sm font-medium tracking-wider text-primary uppercase">FAQ</span>
            <div className="w-8 h-0.5 bg-primary"></div>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Frequently Asked <span className="gold-text">Questions</span>
          </h2>
          <p className="text-lg text-muted max-w-2xl mx-auto leading-relaxed">
            Find answers to common questions about The Dining Co. platform.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4 animate-on-scroll">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="premium-card overflow-hidden transition-all duration-300"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-[#2F2F2F]/20 transition-colors"
              >
                <span className="text-lg font-semibold text-white">{faq.question}</span>
                {openIndex === index ? (
                  <ChevronUp className="text-primary w-5 h-5 flex-shrink-0" />
                ) : (
                  <ChevronDown className="text-primary w-5 h-5 flex-shrink-0" />
                )}
              </button>
              <div
                className={`px-6 overflow-hidden transition-all duration-300 ${
                  openIndex === index ? 'max-h-96 pb-6' : 'max-h-0'
                }`}
              >
                <p className="text-muted leading-relaxed">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;