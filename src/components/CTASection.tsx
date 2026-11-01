import { Calendar, Phone, Mail } from 'lucide-react';

interface CTAProps {
  openBookingModal: () => void;
  openWhatsApp: () => void;
}

export default function CTASection({ openBookingModal, openWhatsApp }: CTAProps) {
  return (
    <section className="bg-[#029BFA] text-white py-12 lg:py-16 relative overflow-hidden" id="cta-banner-section">
      {/* Subtle overlay shading as requested (No gradients except subtle navy-to-blue overlays) */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#021E3B]/20 to-[#029BFA]/10 pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 relative z-10 text-center flex flex-col items-center space-y-8">
        
        {/* Core Message */}
        <div className="space-y-3 max-w-3xl">
          <h2 className="font-serif text-[38px] sm:text-[48px] font-bold leading-tight">
            Ready To Transform Your Space?
          </h2>
          <p className="font-sans text-[16px] sm:text-[18px] font-light opacity-95">
            Book your free consultation today and bring your vision to life.
          </p>
        </div>

        {/* Action Button & Contact Detail Cluster */}
        <div className="flex flex-col items-center space-y-6 w-full">
          
          {/* Main Booking Button */}
          <button
            onClick={openBookingModal}
            className="group relative bg-white text-[#021E3B] hover:bg-[#021E3B] hover:text-white px-10 py-4.5 rounded-full text-[14px] font-bold tracking-wider uppercase transition-all duration-300 shadow-[0_8px_25px_rgba(2,30,59,0.15)] flex items-center space-x-3 cursor-pointer"
            id="cta-booking-primary"
          >
            <Calendar className="h-4.5 w-4.5" />
            <span>Book Free Consultation</span>
          </button>

          {/* Contact numbers and emails row */}
          <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-10 pt-4 text-[14px] sm:text-[16px] font-medium border-t border-white/20 w-full max-w-2xl">
            
            {/* Phone */}
            <a 
              href="tel:+918884009398" 
              className="flex items-center space-x-2.5 hover:underline"
              id="cta-phone"
            >
              <Phone className="h-4 w-4 fill-current text-white" />
              <span>+91 88840 09398</span>
            </a>

            {/* Email */}
            <a 
              href="mailto:floatingdrapes@gmail.com" 
              className="flex items-center space-x-2.5 hover:underline"
              id="cta-email"
            >
              <Mail className="h-4 w-4" />
              <span>floatingdrapes@gmail.com</span>
            </a>

          </div>

        </div>

      </div>
    </section>
  );
}
