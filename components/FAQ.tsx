"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const faqs = [
  {
    question: "How much does The Dining Co. subscription cost?",
    answer: "We offer transparent, flat-rate pricing with 0% commission on your orders: ₹999 for 1 Month (billed monthly), or ₹9,999 for 1 Year (equivalent to ₹833/month, giving you 2 full months free!). There are no setup fees and no hidden percentage deductions on your sales."
  },
  {
    question: "How do table-specific QR codes work?",
    answer: "Our dashboard allows you to configure your tables (e.g. Table 1 to 50+) and generates a unique, scannable QR code for each table. When a customer scans a table QR with their phone camera, the menu instantly recognizes their table number, and any order placed arrives in your kitchen tagged with that exact table."
  },
  {
    question: "Do customers need to download an app to order?",
    answer: "No! Customers simply open their smartphone camera or scanner app. The digital menu opens instantly in any browser (Safari, Chrome, etc.) with zero app download or registration, ensuring a fast, frictionless ordering experience."
  },
  {
    question: "What is the Namaste Welcome Greeting?",
    answer: "Upon scanning the table QR code, your guests are greeted by an elegant, cultural Namaste welcome screen displaying your cafe's name and seated table number for 2 seconds before smoothly sliding into your digital menu."
  },
  {
    question: "How do promotional deals and discount codes work?",
    answer: "Cafe owners can activate custom discount promotions (e.g. 20% off, flat ₹100, combo deals) from their admin portal. When active, guests see an elegant privilege popup upon scanning that allows them to copy or apply the deal with one tap, auto-calculating their discount at checkout."
  },
  {
    question: "How do UPI payments and order notifications work?",
    answer: "You can accept payments via direct UPI QR codes (GPay, PhonePe, Paytm) or cash at the counter. When customers checkout, a dynamic QR code is generated prefilled with your cafe's UPI ID, order total, and table note. When staff marks the order as paid, the diner hears a harmonic celebration chime on their phone."
  },
  {
    question: "Can customers leave 5-star ratings and reviews?",
    answer: "Yes! After completing their meal, diners can rate their experience with 1-5 stars and select praise tags (like 'Delicious Food', 'Quick Service', 'Great Vibe'). All ratings sync in real-time to your Cafe Admin Ratings dashboard."
  },
  {
    question: "How long does it take to get our restaurant live?",
    answer: "You can be fully operational in less than 15 minutes! Simply register your cafe, add your categories and menu items, generate your table QR codes, and you're ready to serve."
  }
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="section-padding bg-section scroll-mt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center mb-16 animate-on-scroll">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-0.5 bg-primary"></div>
            <span className="text-sm font-medium tracking-wider text-primary uppercase font-display">Frequently Asked Questions</span>
            <div className="w-8 h-0.5 bg-primary"></div>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 font-heading">
            Everything You Need <span className="gold-text">To Know</span>
          </h2>
          <p className="text-lg text-muted max-w-2xl mx-auto leading-relaxed">
            Got questions about our QR digital menu software and ₹999/month subscription? Here are the verified facts.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4 animate-on-scroll">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="premium-card overflow-hidden transition-all duration-300 border border-border hover:border-primary/50 shadow-sm"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-surface/50 transition-colors cursor-pointer"
              >
                <span className="text-base sm:text-lg font-semibold text-text">{faq.question}</span>
                {openIndex === index ? (
                  <ChevronUp className="text-primary w-5 h-5 flex-shrink-0 ml-4" />
                ) : (
                  <ChevronDown className="text-primary w-5 h-5 flex-shrink-0 ml-4" />
                )}
              </button>
              <div
                className={`px-6 overflow-hidden transition-all duration-300 ${
                  openIndex === index ? 'max-h-96 pb-6 pt-1' : 'max-h-0'
                }`}
              >
                <p className="text-sm sm:text-base text-muted leading-relaxed">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;