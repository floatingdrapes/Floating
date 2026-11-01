import { Instagram } from 'lucide-react';
import { WhatsAppIcon, openWhatsAppPopup } from './WhatsAppButton';

interface FooterProps {
  setActivePage: (page: string) => void;
  openBookingModal: () => void;
  brandLogoUrl?: string;
  openAdminPanel?: () => void;
}

export default function Footer({ setActivePage, openBookingModal, brandLogoUrl = '/logo.svg', openAdminPanel }: FooterProps) {
  
  const handlePageClick = (pageId: string, targetId?: string) => {
    setActivePage('home');
    if (targetId) {
      setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-white border-t border-[#EAEAEA] text-[#111111] pt-20 pb-8 relative z-10" id="floatingdrapes-premium-footer">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        
        {/* Five Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-12 gap-10 pb-16 border-b border-[#EAEAEA]">
          
          {/* Column 1: Brand Logo & Description (4 columns wide) */}
          <div className="lg:col-span-4 flex flex-col space-y-5 text-left">
            {/* Logo */}
            <div className="flex items-center cursor-pointer py-1" onClick={() => handlePageClick('home')}>
              <img 
                src={brandLogoUrl} 
                alt="Floating Drapes" 
                draggable={false}
                className="h-[34px] sm:h-[38px] md:h-[40px] w-auto max-h-[44px] object-contain select-none"
                id="footer-logo-img"
              />
            </div>

            <p className="font-sans text-[14px] font-light text-zinc-500 leading-[160%] max-w-sm">
              Transforming spaces with premium curtains, wallpapers, and blinds that perfectly blend style, comfort, and functionality.
            </p>

            {/* Social Icons: WhatsApp & Instagram only, matching identical design style */}
            <div className="flex items-center space-x-3.5 pt-2">
              <button 
                type="button"
                onClick={() => {
                  openWhatsAppPopup("Hi! I'm visiting Floating Drapes and would like to inquire about your luxury curtains, wallpapers, and blinds.");
                }}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#EAEAEA] text-zinc-600 hover:text-[#25D366] hover:border-[#25D366] transition-all bg-white shadow-sm cursor-pointer"
                aria-label="WhatsApp"
                title="WhatsApp (+91 88840 09398)"
              >
                <WhatsAppIcon className="h-4.5 w-4.5 fill-current" />
              </button>
              <button 
                type="button"
                onClick={() => {
                  window.open("https://www.instagram.com/official_floatingdrapes", "InstagramPopup", "width=600,height=750,resizable=yes,scrollbars=yes");
                }}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#EAEAEA] text-zinc-600 hover:text-[#029BFA] hover:border-[#029BFA] transition-all bg-white shadow-sm cursor-pointer"
                aria-label="Instagram"
                title="Instagram"
              >
                <Instagram className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>

          {/* Column 2: Quick Links (2 columns wide) */}
          <div className="lg:col-span-2 flex flex-col space-y-4 text-left">
            <h5 className="font-sans text-[13px] font-bold text-[#021E3B] uppercase tracking-widest border-b border-[#F5F5F5] pb-2">
              Quick Links
            </h5>
            <ul className="space-y-3 font-sans text-[14px] font-light text-zinc-500">
              <li>
                <button onClick={() => handlePageClick('home', 'home-hero')} className="text-left w-full hover:text-[#029BFA] transition-colors cursor-pointer block">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => handlePageClick('home', 'about-us-section')} className="text-left w-full hover:text-[#029BFA] transition-colors cursor-pointer block">
                  About Us
                </button>
              </li>
              <li>
                <button onClick={() => handlePageClick('home', 'categories-overview-section')} className="text-left w-full hover:text-[#029BFA] transition-colors cursor-pointer block">
                  Products
                </button>
              </li>
              <li>
                <button onClick={() => handlePageClick('home', 'before-after-section')} className="text-left w-full hover:text-[#029BFA] transition-colors cursor-pointer block">
                  Transformations
                </button>
              </li>
              <li>
                <button onClick={() => handlePageClick('home', 'process-section')} className="text-left w-full hover:text-[#029BFA] transition-colors cursor-pointer block">
                  Services
                </button>
              </li>
              <li>
                <button onClick={() => handlePageClick('home', 'testimonials-section')} className="text-left w-full hover:text-[#029BFA] transition-colors cursor-pointer block">
                  Testimonials
                </button>
              </li>
              <li>
                <button onClick={() => handlePageClick('home', 'cta-banner-section')} className="text-left w-full hover:text-[#029BFA] transition-colors cursor-pointer block">
                  Contact Us
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Our Products (2 columns wide) */}
          <div className="lg:col-span-2 flex flex-col space-y-4 text-left">
            <h5 className="font-sans text-[13px] font-bold text-[#021E3B] uppercase tracking-widest border-b border-[#F5F5F5] pb-2">
              Our Products
            </h5>
            <ul className="space-y-3 font-sans text-[14px] font-light text-zinc-500">
              <li>
                <button onClick={() => { setActivePage('curtains'); window.scrollTo({ top: 0, behavior: 'instant' }); }} className="text-left w-full hover:text-[#029BFA] transition-colors cursor-pointer block">
                  Curtains
                </button>
              </li>
              <li>
                <button onClick={() => { setActivePage('wallpapers'); window.scrollTo({ top: 0, behavior: 'instant' }); }} className="text-left w-full hover:text-[#029BFA] transition-colors cursor-pointer block">
                  Wallpapers
                </button>
              </li>
              <li>
                <button onClick={() => { setActivePage('blinds'); window.scrollTo({ top: 0, behavior: 'instant' }); }} className="text-left w-full hover:text-[#029BFA] transition-colors cursor-pointer block">
                  Blinds
                </button>
              </li>
              <li>
                <button onClick={() => handlePageClick('home', 'customization-section')} className="text-left w-full hover:text-[#029BFA] transition-colors cursor-pointer block leading-snug">
                  Design Your Own Curtains
                </button>
              </li>
              <li>
                <button onClick={() => handlePageClick('home', 'customization-section')} className="text-left w-full hover:text-[#029BFA] transition-colors cursor-pointer block leading-snug">
                  Design Your Own Wallpaper
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact Info (2 columns wide) */}
          <div className="lg:col-span-2 flex flex-col space-y-4 text-left">
            <h5 className="font-sans text-[13px] font-bold text-[#021E3B] uppercase tracking-widest border-b border-[#F5F5F5] pb-2">
              Contact Us
            </h5>
            <ul className="space-y-3 font-sans text-[14px] font-light text-zinc-500">
              <li>
                <a href="tel:+918884009398" className="hover:text-[#029BFA] transition-colors block">
                  +91 88840 09398
                </a>
              </li>
              <li>
                <a href="mailto:floatingdrapes@gmail.com" className="hover:text-[#029BFA] transition-colors block break-all">
                  floatingdrapes@gmail.com
                </a>
              </li>
              <li className="leading-relaxed text-zinc-500">
                <span className="font-bold text-[#021E3B]">Experience Center:</span><br />
                Floating Drapes, 712, Niladhri Main Road, Begur Hobli, Chikkathoguru, Bengaluru, Karnataka 560100
              </li>
            </ul>
          </div>

          {/* Column 5: Business Hours (2 columns wide) */}
          <div className="lg:col-span-2 flex flex-col space-y-4 text-left">
            <h5 className="font-sans text-[13px] font-bold text-[#021E3B] uppercase tracking-widest border-b border-[#F5F5F5] pb-2">
              Business Hours
            </h5>
            <ul className="space-y-3 font-sans text-[14px] font-light text-zinc-500 leading-relaxed">
              <li>
                <span className="font-semibold text-[#021E3B] block">Mon - Sat:</span>
                10:00 AM - 8:00 PM
              </li>
              <li>
                <span className="font-semibold text-[#021E3B] block">Sunday:</span>
                By Appointment
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Legal Links & Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-8 text-[13px] font-light text-zinc-500">
          <p>© {new Date().getFullYear()} Floating Drapes. All Rights Reserved.</p>
          <div className="flex items-center space-x-6 mt-4 sm:mt-0 font-medium">
            <a href="#privacy" className="hover:text-[#029BFA] transition-colors">Privacy Policy</a>
            <a href="#terms" className="hover:text-[#029BFA] transition-colors">Terms & Conditions</a>
            {openAdminPanel && (
              <button
                type="button"
                onClick={openAdminPanel}
                className="hover:text-[#029BFA] text-zinc-400 transition-colors flex items-center space-x-1 cursor-pointer"
                title="Admin Control Panel (or press Ctrl + M)"
              >
                <span>Admin Portal</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </footer>
  );
}
