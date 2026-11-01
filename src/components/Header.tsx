import React, { useState, useEffect } from 'react';
import { Menu, X, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HeaderProps {
  activePage: string;
  setActivePage: (page: string) => void;
  openBookingModal: () => void;
  brandLogoUrl?: string;
}

export default function Header({ activePage, setActivePage, openBookingModal, brandLogoUrl = '/logo.svg' }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Track scrolling to apply sticky effects if desired, though the background is always solid white as requested
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Home', id: 'home', targetId: 'home-hero' },
    { label: 'About Us', id: 'about', targetId: 'about-us-section' },
    { label: 'Products', id: 'products', targetId: 'categories-overview-section' },
    { label: 'Transformations', id: 'gallery', targetId: 'before-after-section' },
    { label: 'Services', id: 'services', targetId: 'process-section' },
    { label: 'Testimonials', id: 'testimonials', targetId: 'testimonials-section' },
    { label: 'Contact Us', id: 'contact', targetId: 'cta-banner-section' },
  ];

  const handleNavClick = (id: string, targetId: string) => {
    setIsOpen(false);
    if (activePage !== 'home') {
      setActivePage('home');
      setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 100);
    } else {
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleCallSupport = (e: React.MouseEvent) => {
    e.preventDefault();
    // On mobile devices, initiate call directly in current context
    if (/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)) {
      window.location.href = 'tel:+918884009398';
    }
    // Navigate smoothly to the contact and direct support section on single page
    handleNavClick('contact', 'cta-banner-section');
  };

  return (
    <header 
      className="sticky top-0 left-0 w-full z-50 bg-[#FFFFFF] transition-all duration-200"
      style={{ 
        boxShadow: isScrolled ? '0px 4px 20px rgba(0,0,0,0.06)' : '0px 2px 10px rgba(0,0,0,0.04)',
        borderBottom: '1px solid #EAEAEA'
      }}
      id="main-sticky-header"
    >
      <div className="mx-auto flex h-[74px] sm:h-[78px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* LOGO LEFT - balanced proportion, static, no scale animation on hover/drag */}
        <div 
          onClick={() => {
            setActivePage('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }} 
          className="flex cursor-pointer items-center py-1 flex-shrink-0"
          id="brand-logo-container"
        >
          <img 
            src={brandLogoUrl} 
            alt="Floating Drapes" 
            draggable={false}
            className="h-[40px] sm:h-[44px] md:h-[48px] w-auto max-h-[50px] object-contain select-none"
            id="brand-logo-img"
          />
        </div>

        {/* MENU CENTER - clean spacing, no wrapping, elegant typography */}
        <nav className="hidden lg:flex items-center gap-3 lg:gap-4 xl:gap-6 2xl:gap-7 flex-shrink-0">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id, item.targetId)}
              className="relative py-1.5 text-[13px] xl:text-[14px] font-medium tracking-normal text-[#1a2e40] hover:text-[#029BFA] transition-colors duration-200 font-sans cursor-pointer whitespace-nowrap"
              id={`nav-link-${item.id}`}
            >
              {item.label}
              {activePage === 'home' && (
                <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-[#029BFA] transition-all duration-200 hover:w-full" />
              )}
            </button>
          ))}
        </nav>

        {/* PHONE CTA & ESTIMATE RIGHT */}
        <div className="flex items-center space-x-3 sm:space-x-4 flex-shrink-0">
          <button
            type="button"
            onClick={handleCallSupport}
            className="hidden md:flex items-center space-x-2.5 text-left bg-transparent border-0 p-1 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer group"
            id="header-phone-cta"
            title="Call Us Now (+91 88840 09398)"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#029BFA] text-white shadow-sm flex-shrink-0">
              <Phone className="h-4 w-4 fill-current text-white" />
            </div>
            <div className="flex flex-col text-left whitespace-nowrap">
              <span className="font-serif text-[13px] font-bold text-[#021E3B] leading-none tracking-normal">
                Call Us Now
              </span>
              <span className="font-sans text-[9px] font-semibold text-[#029BFA] uppercase mt-1 leading-none tracking-wider">
                Direct Support
              </span>
            </div>
          </button>

          {/* Booking / Estimate Button */}
          <button
            onClick={openBookingModal}
            className="bg-[#029BFA] hover:bg-[#0082db] text-white text-[12px] font-bold px-4 py-2 rounded-full transition-all tracking-wide shadow-sm hover:shadow-md cursor-pointer whitespace-nowrap flex-shrink-0"
          >
            Estimate
          </button>

          {/* Drawer Trigger on Mobile/Tablet */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex lg:hidden h-9 w-9 items-center justify-center rounded-full border border-[#EAEAEA] hover:border-[#029BFA] text-[#021E3B] hover:text-[#029BFA] transition-all duration-200 cursor-pointer"
            aria-label="Toggle Menu"
            id="menu-drawer-trigger"
          >
            {isOpen ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
          </button>
        </div>
      </div>

      {/* MOBILE NAV OVERLAY */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 top-[72px] sm:top-[76px] z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            />

            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="fixed top-[72px] sm:top-[76px] left-0 right-0 z-50 bg-[#FFFFFF] border-b border-[#EAEAEA] px-6 py-6 shadow-[0_10px_25px_rgba(0,0,0,0.1)] lg:hidden flex flex-col space-y-3"
              id="mobile-nav-panel"
            >
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id, item.targetId)}
                  className="w-full text-left py-2 text-[15px] font-medium text-[#111111] hover:text-[#029BFA] transition-colors font-sans border-b border-[#F5F5F5] last:border-0 cursor-pointer"
                >
                  {item.label}
                </button>
              ))}

              <div className="pt-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={(e) => {
                    setIsOpen(false);
                    handleCallSupport(e);
                  }}
                  className="flex items-center space-x-2.5 group cursor-pointer text-left bg-transparent border-0 p-0"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#029BFA] text-white">
                    <Phone className="h-4 w-4 fill-current" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="font-serif text-[13px] font-bold text-[#021E3B] leading-none">
                      Call Us Now
                    </span>
                    <span className="font-sans text-[9px] font-semibold text-[#029BFA] uppercase mt-1 leading-none">
                      Direct Support
                    </span>
                  </div>
                </button>
                
                <button
                  onClick={() => {
                    setIsOpen(false);
                    openBookingModal();
                  }}
                  className="bg-[#029BFA] text-white font-sans text-xs font-bold px-4 py-2 rounded-full"
                >
                  Estimate
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
