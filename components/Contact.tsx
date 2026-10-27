"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, Clock, Send, MapPin, Check, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FormErrors {
  name?: string;
  phone?: string;
  email?: string;
  restaurant?: string;
  message?: string;
}

interface SubmittedData {
  name: string;
  phone: string;
  email: string;
  restaurant: string;
  message: string;
  submittedAt: string;
}

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    restaurant: "",
    message: ""
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState<SubmittedData | null>(null);
  const { toast } = useToast();

  // Validation function
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    } else if (formData.name.trim().length > 50) {
      newErrors.name = "Name must be less than 50 characters";
    }
    
    // Phone validation
    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (!formData.phone.trim()) {
      newErrors.phone = "Contact number is required";
    } else if (phoneDigits.length < 10) {
      newErrors.phone = "Please enter a valid 10-digit number";
    } else if (phoneDigits.length > 15) {
      newErrors.phone = "Contact number is too long";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address (e.g., name@domain.com)";
    }
    
    // Restaurant validation (optional but if provided, validate)
    if (formData.restaurant.trim() && formData.restaurant.trim().length < 2) {
      newErrors.restaurant = "Restaurant name must be at least 2 characters";
    } else if (formData.restaurant.trim() && formData.restaurant.trim().length > 100) {
      newErrors.restaurant = "Restaurant name must be less than 100 characters";
    }
    
    // Message validation
    if (!formData.message.trim()) {
      newErrors.message = "Please describe your needs";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Please provide at least 10 characters";
    } else if (formData.message.trim().length > 1000) {
      newErrors.message = "Message must be less than 1000 characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate single field on blur
  const validateField = (field: string, value: string) => {
    const newErrors: FormErrors = { ...errors };
    
    switch (field) {
      case 'name':
        if (!value.trim()) {
          newErrors.name = "Full name is required";
        } else if (value.trim().length < 2) {
          newErrors.name = "Name must be at least 2 characters";
        } else if (value.trim().length > 50) {
          newErrors.name = "Name must be less than 50 characters";
        } else {
          delete newErrors.name;
        }
        break;

      case 'phone':
        const phoneDigits = value.replace(/\D/g, '');
        if (!value.trim()) {
          newErrors.phone = "Contact number is required";
        } else if (phoneDigits.length < 10) {
          newErrors.phone = "Please enter a valid 10-digit number";
        } else if (phoneDigits.length > 15) {
          newErrors.phone = "Contact number is too long";
        } else {
          delete newErrors.phone;
        }
        break;
        
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value.trim()) {
          newErrors.email = "Email address is required";
        } else if (!emailRegex.test(value.trim())) {
          newErrors.email = "Please enter a valid email address";
        } else {
          delete newErrors.email;
        }
        break;
        
      case 'restaurant':
        if (value.trim() && value.trim().length < 2) {
          newErrors.restaurant = "Restaurant name must be at least 2 characters";
        } else if (value.trim() && value.trim().length > 100) {
          newErrors.restaurant = "Restaurant name must be less than 100 characters";
        } else {
          delete newErrors.restaurant;
        }
        break;
        
      case 'message':
        if (!value.trim()) {
          newErrors.message = "Please describe your needs";
        } else if (value.trim().length < 10) {
          newErrors.message = "Please provide at least 10 characters";
        } else if (value.trim().length > 1000) {
          newErrors.message = "Message must be less than 1000 characters";
        } else {
          delete newErrors.message;
        }
        break;
    }
    
    setErrors(newErrors);
  };

  // Handle field blur for validation
  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const value = formData[field as keyof typeof formData];
    validateField(field, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allTouched: Record<string, boolean> = {};
    Object.keys(formData).forEach(key => {
      allTouched[key] = true;
    });
    setTouched(allTouched);
    
    // Validate all fields
    if (!validateForm()) {
      // Scroll to first error
      const firstError = document.querySelector('[data-error="true"]');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      toast({
        title: "Please fix the errors",
        description: "Check all fields and try again.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.name.trim(),
          contactNumber: formData.phone.trim(),
          email: formData.email.trim(),
          cafeRestaurantName: formData.restaurant.trim() || 'Not specified',
          city: 'Bhopal',
          needs: formData.message.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to send request');
      }

      const submission: SubmittedData = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        restaurant: formData.restaurant.trim(),
        message: formData.message.trim(),
        submittedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setSubmittedData(submission);
      setIsSubmitted(true);

      toast({
        title: "✅ Request Sent Successfully!",
        description: `Thank you, ${submission.name}. Your demo request has been dispatched to thediningco.contact@gmail.com.`,
      });

      // Reset form
      setFormData({ name: '', phone: '', email: '', restaurant: '', message: '' });
      setErrors({});
      setTouched({});
      
    } catch (error: any) {
      toast({
        title: "❌ Request Failed",
        description: error?.message || 'Unable to send your request right now.',
        variant: "destructive",
      });
      console.error('Contact request submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setSubmittedData(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const getContactFieldClasses = (field: keyof typeof formData) => {
    const isFilled = formData[field].trim().length > 0;
    const hasError = !!errors[field as keyof FormErrors] && touched[field];

    return `bg-background text-text placeholder:text-muted/60 border ${
      hasError
        ? 'border-red-500 focus:border-red-500 focus:ring-destructive/20'
        : isFilled
        ? 'border-primary focus:border-primary focus:ring-primary/20'
        : 'border-border focus:border-primary focus:ring-primary/20'
    }`;
  };

  return (
    <section id="contact" className="section-padding bg-background scroll-mt-20 overflow-hidden w-full max-w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 animate-on-scroll">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-0.5 bg-primary"></div>
            <span className="text-sm font-medium tracking-wider text-primary uppercase">Contact</span>
            <div className="w-8 h-0.5 bg-primary"></div>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Get in <span className="gold-text">Touch</span>
          </h2>
          <p className="text-lg text-muted max-w-3xl mx-auto leading-relaxed">
            Ready to transform your restaurant? Contact us to schedule a personalized 
            demo and see how The Dining Co. can revolutionize your operations.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Contact Form / Dynamic Confirmation */}
          <div className="animate-on-scroll">
            <div className="premium-card p-6 md:p-8">
              {isSubmitted && submittedData ? (
                /* Dynamic Confirmation State */
                <div className="text-center py-2 animate-in fade-in zoom-in-95 duration-300">
                  <div className="w-16 h-16 bg-emerald-500/10 border-2 border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-emerald-600 shadow-lg shadow-emerald-500/10">
                    <CheckCircle className="w-9 h-9" />
                  </div>

                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 mb-3">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Request Sent to Executive Team
                  </span>

                  <h3 className="text-2xl font-bold text-text mb-2">Your Request Has Been Sent!</h3>
                  <p className="text-muted text-sm max-w-md mx-auto leading-relaxed">
                    Thank you, <strong className="text-text">{submittedData.name}</strong>! We've received your request
                    {submittedData.restaurant ? <> for <strong className="text-text">{submittedData.restaurant}</strong></> : ""}.
                    Our team in Bhopal has been notified at <strong className="text-text break-all">thediningco.contact@gmail.com</strong>.
                  </p>

                  {/* Submission Summary Card */}
                  <div className="bg-[#FBF8F3] border border-border rounded-2xl p-4 sm:p-5 my-6 text-left space-y-3 shadow-sm">
                    <div className="text-xs font-bold text-muted uppercase tracking-wider border-b border-border/60 pb-2 flex justify-between items-center">
                      <span>Submission Details</span>
                      <span className="text-primary font-medium lowercase">Logged at {submittedData.submittedAt}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div className="bg-white p-3 rounded-xl border border-border/50">
                        <span className="text-[11px] text-muted block uppercase tracking-wider font-semibold">Contact Person</span>
                        <span className="font-semibold text-text">{submittedData.name}</span>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-border/50">
                        <span className="text-[11px] text-muted block uppercase tracking-wider font-semibold">Contact Number</span>
                        <span className="font-semibold text-text flex items-center gap-1.5 text-primary">
                          <Phone className="w-3.5 h-3.5" />
                          {submittedData.phone}
                        </span>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-border/50">
                        <span className="text-[11px] text-muted block uppercase tracking-wider font-semibold">Email Address</span>
                        <span className="font-medium text-text break-all flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                          {submittedData.email}
                        </span>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-border/50">
                        <span className="text-[11px] text-muted block uppercase tracking-wider font-semibold">Restaurant Name</span>
                        <span className="font-medium text-text">{submittedData.restaurant || "Not specified"}</span>
                      </div>
                    </div>

                    {submittedData.message && (
                      <div className="bg-white p-3 rounded-xl border border-border/50">
                        <span className="text-[11px] text-muted block uppercase tracking-wider font-semibold mb-1">Your Requirements</span>
                        <p className="text-xs text-muted leading-relaxed line-clamp-3 italic">
                          "{submittedData.message}"
                        </p>
                      </div>
                    )}
                  </div>

                  {/* What happens next */}
                  <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 text-left space-y-2 mb-6">
                    <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-700" /> What Happens Next?
                    </h4>
                    <ul className="text-xs text-amber-800 space-y-1.5">
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 flex-shrink-0"></span>
                        <span>Our product specialist will call you at <strong className="text-amber-950 font-semibold">{submittedData.phone}</strong> within 24 hours.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 flex-shrink-0"></span>
                        <span>We will schedule a personalized 30-minute demo tailored to your floor setup.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 flex-shrink-0"></span>
                        <span>Urgent inquiry? You can reach us right away at <a href="tel:+918085444188" className="font-bold underline text-amber-950 hover:text-primary">+91 80854 44188</a>.</span>
                      </li>
                    </ul>
                  </div>

                  {/* Reset action */}
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    className="w-full btn-outline-gold font-semibold py-3"
                  >
                    Send Another Request
                  </Button>
                </div>
              ) : (
                /* Form State */
                <>
                  <h3 className="text-2xl font-bold text-text mb-6">Request a Demo</h3>
                  
                  <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-muted mb-1.5">
                          Full Name <span className="text-primary">*</span>
                        </label>
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          value={formData.name}
                          onChange={handleChange}
                          onBlur={() => handleBlur('name')}
                          placeholder="Your full name"
                          className={getContactFieldClasses('name')}
                          data-error={!!errors.name && touched.name}
                        />
                        {errors.name && touched.name && (
                          <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.name}
                          </p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-muted mb-1.5">
                          Email Address <span className="text-primary">*</span>
                        </label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          onBlur={() => handleBlur('email')}
                          placeholder="you@restaurant.com"
                          className={getContactFieldClasses('email')}
                          data-error={!!errors.email && touched.email}
                        />
                        {errors.email && touched.email && (
                          <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.email}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-muted mb-1.5">
                          Contact Number <span className="text-primary">*</span>
                        </label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleChange}
                          onBlur={() => handleBlur('phone')}
                          placeholder="10-digit number (e.g. 8085444188)"
                          className={getContactFieldClasses('phone')}
                          data-error={!!errors.phone && touched.phone}
                        />
                        {errors.phone && touched.phone && (
                          <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.phone}
                          </p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="restaurant" className="block text-sm font-medium text-muted mb-1.5">
                          Restaurant Name
                        </label>
                        <Input
                          id="restaurant"
                          name="restaurant"
                          type="text"
                          value={formData.restaurant}
                          onChange={handleChange}
                          onBlur={() => handleBlur('restaurant')}
                          placeholder="Your business name"
                          className={getContactFieldClasses('restaurant')}
                          data-error={!!errors.restaurant && touched.restaurant}
                        />
                        {errors.restaurant && touched.restaurant && (
                          <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.restaurant}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-muted mb-1.5">
                        Tell us about your needs <span className="text-primary">*</span>
                      </label>
                      <Textarea
                        id="message"
                        name="message"
                        rows={4}
                        value={formData.message}
                        onChange={handleChange}
                        onBlur={() => handleBlur('message')}
                        placeholder="Describe your current setup, number of tables, main challenges, or any specific requirements..."
                        className={`${getContactFieldClasses('message')} resize-none`}
                        data-error={!!errors.message && touched.message}
                      />
                      <div className="flex justify-between mt-1">
                        {errors.message && touched.message ? (
                          <p className="text-red-500 text-xs flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.message}
                          </p>
                        ) : (
                          <p className="text-xs text-muted/50">
                            {formData.message.length}/10 characters minimum
                          </p>
                        )}
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full btn-primary-gold text-base py-3.5"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="w-5 h-5 border-2 border-background/30 border-t-background rounded-full animate-spin mr-2"></span>
                          Sending Request...
                        </>
                      ) : (
                        <>
                          <Send className="h-5 w-5 mr-2" />
                          Send Request
                        </>
                      )}
                    </Button>
                  </form>

                  {/* Quick benefits */}
                  <div className="mt-8 pt-6 border-t border-border">
                    <h4 className="font-semibold text-text mb-4">What happens next?</h4>
                    <div className="space-y-3">
                      {[
                        "We'll contact you within 24 hours",
                        "Schedule a personalized 30-minute demo",
                        "Get a custom quote based on your needs"
                      ].map((step, index) => (
                        <div key={index} className="flex items-center gap-3 text-sm">
                          <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center shrink-0 border border-primary/30">
                            <span className="text-primary text-xs font-bold">{index + 1}</span>
                          </div>
                          <span className="text-muted">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-6 animate-on-scroll" style={{ animationDelay: "0.2s" }}>
            <div className="premium-card p-6 md:p-8">
              <h3 className="text-2xl font-bold text-text mb-6">Get in Touch</h3>
              
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 border border-primary/20">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-text">Email Us</h4>
                    <a href="mailto:thediningco.contact@gmail.com" className="text-muted hover:text-primary transition-colors text-sm break-all">
                      thediningco.contact@gmail.com
                    </a>
                    <p className="text-xs text-muted/70">We respond within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 border border-primary/20">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-text">Call Us</h4>
                    <a href="tel:+918085444188" className="text-muted hover:text-primary transition-colors text-sm">
                      +91 80854 44188
                    </a>
                    <p className="text-xs text-muted/70">Mon-Sat, 9 AM - 9 PM IST</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 border border-primary/20">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-text">24/7 Support</h4>
                    <p className="text-muted text-sm">Always available</p>
                    <p className="text-xs text-muted/70">Quick response time</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 border border-primary/20">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-text">Location</h4>
                    <p className="text-muted text-sm">Bhopal, Madhya Pradesh</p>
                    <p className="text-xs text-muted/70">India</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-4">
              <div className="premium-card p-4 text-center border border-border bg-white shadow-sm">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Check className="text-primary h-5 w-5" />
                </div>
                <p className="text-xs text-text font-medium">100% Satisfaction</p>
                <p className="text-xs text-muted">Guaranteed</p>
              </div>
              <div className="premium-card p-4 text-center border border-border bg-white shadow-sm">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-xl">📱</span>
                </div>
                <p className="text-xs text-text font-medium">Live Demo</p>
                <p className="text-xs text-muted">Available 24/7</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;