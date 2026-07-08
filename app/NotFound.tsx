"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Crown, ArrowRight } from "lucide-react";

const NotFound = () => {
  const pathname = usePathname();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      pathname
    );
  }, [pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F0F0F] p-4">
      <div className="text-center max-w-lg">
        <div className="flex justify-center mb-6">
          <Crown className="text-primary w-20 h-20" />
        </div>
        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <p className="text-2xl font-bold text-white mb-2">Page Not Found</p>
        <p className="text-muted mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link 
          href="/" 
          className="btn-primary-gold inline-flex items-center gap-2"
        >
          Return to Home
          <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
};

export default NotFound;