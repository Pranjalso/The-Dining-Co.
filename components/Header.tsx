"use client";

import { useLayoutEffect, useState, useEffect, useCallback, useRef } from "react";
import { Menu, X, Crown } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const pathname = usePathname();
  const router = useRouter();
  const hasUserNavigatedRef = useRef(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    document.body.style.overflow = !isMenuOpen ? 'hidden' : '';
  };

  const scrollToSection = useCallback((id: string) => {
    const element = document.getElementById(id);
    if (!element) return false;

    const headerHeight = 80;
    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = Math.max(0, elementPosition - headerHeight);

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth',
    });

    return true;
  }, []);

  const handleNavClick = (href: string) => {
    setIsMenuOpen(false);
    document.body.style.overflow = '';
    hasUserNavigatedRef.current = true;

    if (href === "/") {
      const isHomePage = pathname === "/";
      if (isHomePage) {
        window.history.pushState(null, '', '/');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setActiveSection('home');
      } else {
        router.push('/');
      }
      return;
    }

    if (href.startsWith('/#')) {
      const targetId = href.replace('/#', '');
      const validSections = ['about', 'features', 'services', 'pricing', 'faq', 'contact'];

      if (validSections.includes(targetId)) {
        setActiveSection(targetId);

        if (pathname === '/') {
          const didScroll = scrollToSection(targetId);
          if (didScroll) {
            window.history.pushState(null, '', href);
            return;
          }
        }

        router.push(href);
      }
    }
  };

  // Track active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      // Determine active section based on scroll position
      const sections = ['home', 'about', 'features', 'services', 'pricing', 'faq', 'contact'];
      const scrollPosition = window.scrollY + 100; // Offset for header

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetBottom = offsetTop + element.offsetHeight;
          
          if (scrollPosition >= offsetTop && scrollPosition < offsetBottom) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMenuOpen(false);
        document.body.style.overflow = '';
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useLayoutEffect(() => {
    if (pathname !== '/') return;

    const hash = window.location.hash.replace('#', '');
    const validSections = ['about', 'features', 'services', 'pricing', 'faq', 'contact'];

    if (!hasUserNavigatedRef.current) {
      setActiveSection('home');
      if (hash && validSections.includes(hash)) {
        window.history.replaceState(null, '', '/');
      }
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      return;
    }

    if (hash && validSections.includes(hash)) {
      setActiveSection(hash);
      requestAnimationFrame(() => scrollToSection(hash));
    } else {
      setActiveSection('home');
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }
  }, [pathname, scrollToSection]);

  const navLinks = [
    { href: "/", label: "Home", id: "home" },
    { href: "/#about", label: "About", id: "about" },
    { href: "/#features", label: "Features", id: "features" },
    { href: "/#services", label: "Services", id: "services" },
    { href: "/#pricing", label: "Pricing", id: "pricing" },
    { href: "/#faq", label: "FAQ", id: "faq" },
  ];

  // Check if a link is active
  const isLinkActive = (linkId: string) => {
    if (linkId === "home") {
      return activeSection === "home" && pathname === "/";
    }
    return activeSection === linkId && pathname === "/";
  };

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled || isMenuOpen ? 'bg-[#0F0F0F]/95 backdrop-blur-lg border-b border-[#2F2F2F]' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            {/* Logo */}
            <Link 
              href="/" 
              className="flex items-center gap-2 z-50 flex-shrink-0"
              onClick={() => setActiveSection("home")}
            >
              <Crown className="text-primary w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-base sm:text-xl lg:text-2xl font-bold text-white tracking-wide whitespace-nowrap">
                The <span className="gold-text">Dining</span> Co.
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center justify-center flex-1 px-4">
              <div className="flex items-center space-x-1 xl:space-x-2">
                {navLinks.map((link) => (
                  <button
                    key={link.href}
                    onClick={() => handleNavClick(link.href)}
                    className={`px-3 xl:px-4 py-2 text-sm xl:text-base font-medium transition-all duration-300 relative cursor-pointer group ${
                      isLinkActive(link.id)
                        ? 'text-primary'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    {link.label}
                    {/* Active indicator - underline */}
                    <span className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-primary rounded-full transition-all duration-300 ${
                      isLinkActive(link.id) 
                        ? 'w-6 xl:w-8 opacity-100' 
                        : 'w-0 opacity-0 group-hover:w-6 xl:group-hover:w-8 group-hover:opacity-100'
                    }`}></span>
                  </button>
                ))}
              </div>
            </nav>

            {/* Desktop CTA Buttons */}
            <div className="hidden lg:flex items-center gap-3 flex-shrink-0">
              <button
                onClick={() => handleNavClick("/#contact")}
                className="border border-primary text-primary hover:bg-primary hover:text-[#0F0F0F] transition-all duration-300 rounded-lg px-4 py-2 text-sm font-medium cursor-pointer"
              >
                Contact
              </button>
              <button
                onClick={() => handleNavClick("/#pricing")}
                className="bg-primary hover:bg-primary/90 text-[#0F0F0F] font-semibold rounded-lg px-5 py-2 text-sm transition-all duration-300 cursor-pointer"
              >
                Get Started
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="lg:hidden z-50 text-white p-2 hover:bg-[#1C1C1C] rounded-lg transition-colors flex-shrink-0 cursor-pointer"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <div 
        className={`lg:hidden fixed inset-0 bg-[#0F0F0F] z-40 transition-all duration-500 ease-in-out ${
          isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        }`}
        style={{ top: 0 }}
      >
        <div className="flex flex-col items-center justify-center h-full px-6 space-y-6">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => {
                handleNavClick(link.href);
              }}
              className={`text-2xl font-medium transition-colors relative group cursor-pointer ${
                isLinkActive(link.id)
                  ? 'text-primary'
                  : 'text-white hover:text-primary'
              }`}
            >
              {link.label}
              {/* Active indicator for mobile */}
              {isLinkActive(link.id) && (
                <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full"></span>
              )}
            </button>
          ))}
          
          <div className="pt-6 w-full max-w-xs space-y-3">
            <button
              onClick={() => handleNavClick("/#contact")}
              className="w-full border border-primary text-primary hover:bg-primary hover:text-[#0F0F0F] transition-all duration-300 rounded-lg py-3 text-base bg-transparent cursor-pointer"
            >
              Contact Us
            </button>
            <button
              onClick={() => handleNavClick("/#pricing")}
              className="w-full bg-primary hover:bg-primary/90 text-[#0F0F0F] font-semibold rounded-lg py-3 text-base cursor-pointer"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;