"use client";

import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, X, Mail, Lock, CheckCircle, Loader2, Crown, User, Key } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function CafeAdminLogin({ params }: { params: { menupages: string } }) {
  const { menupages } = params;
  const [show, setShow] = useState(false);
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const { toast } = useToast();
  
  // Forgot password modal states
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [currentStep, setCurrentStep] = useState<'email' | 'otp' | 'newPassword'>('email');
  
  // Form states
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // UI states
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [cooldown, setCooldown] = useState(0);
  const [cooldownTimer, setCooldownTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (cooldownTimer) clearInterval(cooldownTimer);
    };
  }, [cooldownTimer]);

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/cafe/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username: user, password: pass }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Invalid credentials');
      }
      if (data.user.role === 'superadmin') {
        try { if (typeof window !== 'undefined') { window.localStorage.removeItem('token'); window.localStorage.removeItem('refreshToken'); document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'; document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'; } } catch {}
        window.location.href = '/admin';
        return;
      }

      try { if (typeof window !== 'undefined') { window.localStorage.removeItem('token'); window.localStorage.removeItem('refreshToken'); document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'; document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'; } } catch {}
      const targetSlug = data.user.cafeSlug || menupages;
      window.location.href = `/${targetSlug}/admin`;
    } catch (err: any) {
      setErrors({ login: err.message || 'Login failed' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowForgotModal(true);
    setCurrentStep('email');
    setEmail("");
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setErrors({});
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cooldown > 0) {
      setErrors({ email: `Please wait ${cooldown}s before requesting a new code.` });
      return;
    }
    if (!email) {
      setErrors({ email: "Email is required" });
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setErrors({ email: "Please enter a valid email" });
      return;
    }
    
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/cafe/forgot/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: menupages, email }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to send code');
      }
      if (data.sent) {
        setCurrentStep('otp');
        setErrors({});
        toast({
          title: "Verification code sent",
          description: `We sent a code to ${email}`,
        });
        setCooldown(60);
        const t = setInterval(() => {
          setCooldown((prev) => {
            if (prev <= 1) {
              clearInterval(t);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        setCooldownTimer(t);
      } else {
        setErrors({ email: 'Email not found for this cafe' });
      }
    } catch (err: any) {
      setErrors({ email: err.message || 'Failed to send code' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      setErrors({ otp: "OTP is required" });
      return;
    }
    if (otp.length !== 6) {
      setErrors({ otp: "OTP must be 6 digits" });
      return;
    }
    
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/cafe/forgot/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: menupages, email, otp }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Invalid code');
      }
      setCurrentStep('newPassword');
      setErrors({});
      toast({
        title: "Code verified",
        description: "Enter your new password",
      });
    } catch (err: any) {
      setErrors({ otp: err.message || 'Invalid code' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: {[key: string]: string} = {};
    
    if (!newPassword) {
      newErrors.newPassword = "New password is required";
    } else {
      const strong = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
      if (!strong.test(newPassword)) {
        newErrors.newPassword = "Password must be 8+ chars, include uppercase, number, special char";
      }
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/cafe/forgot/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: menupages, email, otp, newPassword }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        if (data?.field === 'newPassword' && data?.message) {
          setErrors({ newPassword: data.message });
          return;
        }
        throw new Error(data.message || 'Failed to reset password');
      }
      setShowSuccess(true);
      setTimeout(() => {
        setShowForgotModal(false);
        setShowSuccess(false);
        setCurrentStep('email');
        setEmail("");
        setOtp("");
        setNewPassword("");
        setConfirmPassword("");
      }, 1600);
      toast({
        title: "Password updated",
        description: "You can now log in with the new password",
      });
    } catch (err: any) {
      setErrors({ newPassword: err.message || 'Failed to reset password' });
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setShowForgotModal(false);
    setCurrentStep('email');
    setEmail("");
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setErrors({});
    setShowSuccess(false);
    setCooldown(0);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-slow delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/3 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md md:max-w-lg">
        <form
          onSubmit={onLogin}
          className="bg-white border border-border rounded-2xl md:rounded-3xl p-6 md:p-8 space-y-6 shadow-xl"
        >
          {/* Logo */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
                <Crown className="w-5 h-5 text-primary" />
              </div>
              <span className="text-2xl md:text-3xl font-bold text-text tracking-tight">
                The <span className="text-primary">Dining</span> Co.
              </span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="w-8 h-px bg-primary/30"></div>
              <span className="text-xs text-muted uppercase tracking-[0.15em] font-medium">Cafe Admin Portal</span>
              <div className="w-8 h-px bg-primary/30"></div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Username */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-muted mb-1.5">
                <User className="w-3.5 h-3.5 text-primary/60" />
                Username
              </label>
              <Input
                required
                type="text"
                value={user}
                onChange={(e) => setUser(e.target.value)}
                placeholder="Enter username / store id"
                autoComplete="username"
                className="h-[52px] bg-[#FBF8F3] border border-border rounded-xl text-sm text-text placeholder:text-muted/60 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 hover:border-primary"
              />
            </div>

            {/* Password */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-muted mb-1.5">
                <Key className="w-3.5 h-3.5 text-primary/60" />
                Password
              </label>
              <div className="relative">
                <Input
                  required
                  type={show ? "text" : "password"}
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  placeholder="Enter password"
                  autoComplete="current-password"
                  className="h-[52px] bg-[#FBF8F3] border border-border rounded-xl text-sm text-text placeholder:text-muted/60 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 hover:border-primary pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted/50 hover:text-text transition-colors"
                  aria-label="Toggle password"
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {errors.login && (
              <div className="text-xs text-rose-500 bg-rose-50 border border-rose-200 rounded-xl px-4 py-2.5 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-rose-500 rounded-full flex-shrink-0"></span>
                {errors.login}
              </div>
            )}

            {/* Login Button */}
            <Button 
              type="submit" 
              disabled={isLoading} 
              className="w-full h-[54px] bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl transition-all duration-300 shadow-md shadow-primary/20 hover:shadow-primary/30 disabled:opacity-60 disabled:cursor-not-allowed text-base"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Log In to Dashboard
                </span>
              )}
            </Button>
            
            {/* Forgot Password */}
            <div className="text-xs text-right">
              <button 
                onClick={handleForgotClick}
                className="text-primary hover:text-primary-hover font-medium transition-colors duration-300 bg-transparent border-none cursor-pointer hover:underline"
              >
                Forgot Password?
              </button>
            </div>
          </div>
          
          {/* Footer */}
          <div className="text-[10px] text-center text-muted/40 border-t border-border/30 pt-4">
            © {new Date().getFullYear()} The Dining Co. All rights reserved.
          </div>
        </form>
      </div>
      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white border border-border rounded-2xl w-full max-w-md relative shadow-2xl animate-scale-in">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-text">
                <Lock className="w-5 h-5 text-primary" />
                Reset Password
              </h3>
              <button
                onClick={closeModal}
                className="text-muted hover:text-text transition-colors p-1 rounded-lg hover:bg-surface"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {showSuccess ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-6"
                >
                  <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-200">
                    <CheckCircle className="h-8 w-8 text-emerald-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-text mb-2">Password Changed!</h4>
                  <p className="text-sm text-muted">
                    Your password has been successfully updated.
                  </p>
                </motion.div>
              ) : (
                <>
                  {/* Step 1: Email */}
                  {currentStep === 'email' && (
                    <form onSubmit={handleSendOtp} className="space-y-4">
                      <p className="text-sm text-muted">
                        Enter your email address to receive a verification code.
                      </p>
                      <div>
                        <label className="text-xs font-medium text-muted block mb-1.5">
                           Email Address
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted/60" />
                          <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@cafe.com"
                            className={`pl-9 h-[52px] bg-[#FBF8F3] border ${errors.email ? 'border-rose-300' : 'border-border'} rounded-xl text-sm text-text placeholder:text-muted/60 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 hover:border-primary`}
                          />
                        </div>
                        {errors.email && (
                          <p className="text-xs text-rose-500 mt-1">{errors.email}</p>
                        )}
                      </div>
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-[52px] bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl transition-all duration-300 shadow-md shadow-primary/20 hover:shadow-primary/30 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {isLoading ? (
                          <span className="flex items-center justify-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Sending...
                          </span>
                        ) : (
                          'Send Verification Code'
                        )}
                      </Button>
                    </form>
                  )}

                  {/* Step 2: OTP */}
                  {currentStep === 'otp' && (
                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                      <p className="text-sm text-muted">
                        We've sent a 6-digit verification code to <strong className="text-text">{email}</strong>
                      </p>
                      <div>
                        <label className="text-xs font-medium text-muted block mb-1.5">
                          Verification Code
                        </label>
                        <Input
                          type="text"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="123456"
                          maxLength={6}
                          className={`h-[52px] text-center text-lg tracking-widest font-mono bg-[#FBF8F3] border ${errors.otp ? 'border-rose-300' : 'border-border'} rounded-xl text-text focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 hover:border-primary`}
                        />
                        {errors.otp && (
                          <p className="text-xs text-rose-500 mt-1">{errors.otp}</p>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <button
                          type="button"
                          onClick={() => setCurrentStep('email')}
                          className="text-primary hover:text-primary-hover transition-colors font-medium"
                        >
                          ← Back
                        </button>
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          className="text-primary hover:text-primary-hover transition-colors font-medium disabled:text-muted/40 disabled:cursor-not-allowed"
                          disabled={cooldown > 0}
                        >
                          {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Code'}
                        </button>
                      </div>
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-[52px] bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl transition-all duration-300 shadow-md shadow-primary/20 hover:shadow-primary/30 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {isLoading ? (
                          <span className="flex items-center justify-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Verifying...
                          </span>
                        ) : (
                          'Verify Code'
                        )}
                      </Button>
                    </form>
                  )}

                  {/* Step 3: New Password */}
                  {currentStep === 'newPassword' && (
                    <form onSubmit={handleResetPassword} className="space-y-4">
                      <p className="text-sm text-muted">
                        Enter your new password below.
                      </p>
                      
                      <div>
                        <label className="text-xs font-medium text-muted block mb-1.5">
                          New Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted/60" />
                          <Input
                            type={showNewPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter new password"
                            className={`pl-9 pr-9 h-[52px] bg-[#FBF8F3] border ${errors.newPassword ? 'border-rose-300' : 'border-border'} rounded-xl text-sm text-text placeholder:text-muted/60 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 hover:border-primary`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted/50 hover:text-text transition-colors"
                          >
                            {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        {errors.newPassword && (
                          <p className="text-xs text-rose-500 mt-1">{errors.newPassword}</p>
                        )}
                      </div>

                      <div>
                        <label className="text-xs font-medium text-muted block mb-1.5">
                          Confirm Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted/60" />
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                            className={`pl-9 pr-9 h-[52px] bg-[#FBF8F3] border ${errors.confirmPassword ? 'border-rose-300' : 'border-border'} rounded-xl text-sm text-text placeholder:text-muted/60 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 hover:border-primary`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted/50 hover:text-text transition-colors"
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        {errors.confirmPassword && (
                          <p className="text-xs text-rose-500 mt-1">{errors.confirmPassword}</p>
                        )}
                      </div>

                      <div className="text-xs text-muted bg-[#FBF8F3] border border-border rounded-xl p-3">
                        <p className="font-semibold text-text mb-1">Password must:</p>
                        <ul className="list-disc list-inside space-y-0.5">
                          <li>Be at least 8 characters long</li>
                          <li>Include at least one uppercase letter</li>
                          <li>Include at least one number</li>
                          <li>Include at least one special character</li>
                        </ul>
                      </div>

                      <div className="flex gap-3 pt-2">
                        <Button
                          type="button"
                          onClick={closeModal}
                          className="flex-1 h-[52px] bg-surface border border-border hover:bg-surface-hover text-text rounded-xl font-medium transition-all duration-300"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={isLoading}
                          className="flex-1 h-[52px] bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl transition-all duration-300 shadow-md shadow-primary/20 hover:shadow-primary/30 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {isLoading ? (
                            <span className="flex items-center justify-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Saving...
                            </span>
                          ) : (
                            'Save Password'
                          )}
                        </Button>
                      </div>
                    </form>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

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
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-in {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}