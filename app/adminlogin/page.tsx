"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Eye, EyeOff, Crown, Lock, User } from "lucide-react";

export default function SuperAdminLogin() {
  const [show, setShow] = useState(false);
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    (async () => {
      try {
        const res = await fetch("/api/auth/admin/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ username: user, password: pass }),
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          setError(json.message || "Invalid credentials");
          setLoading(false);
          return;
        }
        try {
          if (typeof window !== 'undefined') {
            window.localStorage.removeItem('token');
            window.localStorage.removeItem('refreshToken');
            document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
          }
        } catch {}
        window.location.href = "/admin";
      } catch {
        setError("Network error. Please try again.");
        setLoading(false);
      }
    })();
  };

  return (
    <div className="min-h-screen lg:min-h-[100dvh] bg-background flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 -right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/3 rounded-full blur-3xl"></div>
      </div>

      <form
        onSubmit={onLogin}
        className="w-full max-w-md md:max-w-lg bg-white rounded-2xl md:rounded-3xl border border-border p-6 md:p-8 shadow-xl relative z-10"
      >
        {/* Logo Section */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
              <Crown className="text-primary w-5 h-5 md:w-6 md:h-6" />
            </div>
            <span className="text-2xl md:text-3xl font-bold text-text tracking-tight">
              The <span className="gold-text">Dining</span> Co.
            </span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <div className="w-8 h-0.5 bg-primary/30"></div>
            <span className="text-[10px] md:text-xs tracking-[0.15em] text-muted font-medium uppercase">
              Super Admin Portal
            </span>
            <div className="w-8 h-0.5 bg-primary/30"></div>
          </div>
        </div>

        <div className="space-y-5">
          {/* Username Field */}
          <div>
            <label className="text-sm font-medium text-text block mb-1.5 flex items-center gap-2">
              <User className="w-4 h-4 text-primary/60" />
              Username
            </label>
            <input 
              type="text"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border text-text placeholder:text-muted/60 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300 h-11" 
              placeholder="Enter admin username"
              required
            />
          </div>

          {/* Password Field */}
          <div>
            <label className="text-sm font-medium text-text block mb-1.5 flex items-center gap-2">
              <Lock className="w-4 h-4 text-primary/60" />
              Password
            </label>
            <div className="relative">
              <input 
                type={show ? "text" : "password"}
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border text-text placeholder:text-muted/60 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300 h-11 pr-12" 
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted/60 hover:text-text transition-colors duration-200"
                aria-label="Toggle password"
              >
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            disabled={loading}
            className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary-hover text-white rounded-xl transition-all duration-300 shadow-md shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:hover:scale-100"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 border-2 border-background/30 border-t-background rounded-full animate-spin"></span>
                Logging in...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Access Dashboard
              </span>
            )}
          </Button>

          {/* Error Message */}
          {error && (
            <div className="text-sm text-red-400 font-medium mt-2 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-red-400 rounded-full flex-shrink-0"></span>
              {error}
            </div>
          )}

          {/* Forgot Password */}
          <div className="text-xs text-right">
            <a className="text-primary/70 hover:text-primary font-medium transition-colors duration-200 cursor-pointer hover:underline" href="#">
              Forgot Password?
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="text-[10px] text-center text-muted/50 border-t border-border pt-4 mt-6">
          © {new Date().getFullYear()} The Dining Co. All rights reserved.
        </div>
      </form>
    </div>
  );
}