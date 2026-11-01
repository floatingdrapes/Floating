import { ArrowRight } from 'lucide-react';
import { SiteConfig, DEFAULT_SITE_CONFIG } from '../types';
import OptimizedImage from './OptimizedImage';

interface HeroProps {
  onExplore: () => void;
  openBookingModal: () => void;
  siteConfig: SiteConfig;
}

export default function Hero({ onExplore, openBookingModal, siteConfig }: HeroProps) {
  return (
    <section 
      className="relative bg-white text-[#111111] overflow-visible pb-6 md:pb-10" 
      id="home-hero"
    >
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 pt-12 md:pt-16 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* LEFT COLUMN (50%) */}
          <div className="lg:col-span-6 flex flex-col items-start text-left space-y-6">
            
            {/* Small label */}
            <span 
              className="font-sans text-[13px] md:text-[14px] font-semibold tracking-[0.25em] text-[#029BFA] uppercase"
              id="hero-top-label"
            >
              {siteConfig.heroLabel}
            </span>

            {/* Large headline */}
            <h1 
              className="font-serif text-[42px] sm:text-[54px] lg:text-[64px] font-bold leading-[1.1] text-[#021E3B] tracking-tight uppercase"
              id="hero-headline"
            >
              {siteConfig.heroHeadline1} <br />
              <span className="italic text-[#029BFA] font-serif lowercase tracking-normal font-normal">{siteConfig.heroHeadlineItalic}</span> <br />
              {siteConfig.heroHeadline2}
            </h1>

            {/* Subtitle description */}
            <div className="space-y-2 max-w-xl">
              <p className="font-sans text-[18px] font-medium text-[#021E3B] leading-[150%]">
                {siteConfig.heroSub1} <br />
                <span className="text-[#029BFA]">{siteConfig.heroSub2}</span>
              </p>
              <p className="font-sans text-[15px] font-light text-zinc-600 leading-[150%]">
                {siteConfig.heroDesc}
              </p>
            </div>

            {/* CTA button */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full pt-2">
              
              {/* Button: Book Free Consultation */}
              <button
                onClick={openBookingModal}
                className="group relative bg-[#029BFA] hover:bg-[#0082db] text-white text-[14px] font-bold tracking-wider px-8 py-4.5 rounded-none transition-all duration-300 shadow-[0_4px_18px_rgba(2,155,250,0.3)] hover:shadow-[0_6px_24px_rgba(2,155,250,0.4)] flex items-center justify-center space-x-3 cursor-pointer"
                id="hero-book-btn"
              >
                <span>Book Free Consultation</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Statistics Row beneath CTA */}
            <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t border-zinc-100" id="hero-mini-stats">
              <div className="flex flex-col text-left">
                <span className="font-serif text-[28px] font-bold text-[#021E3B] leading-none">{siteConfig.aboutExperience}</span>
                <span className="font-sans text-[12px] font-light text-zinc-500 mt-1 uppercase tracking-wider leading-tight">Years Experience</span>
              </div>
              <div className="flex flex-col text-left">
                <span className="font-serif text-[28px] font-bold text-[#021E3B] leading-none">10,000+</span>
                <span className="font-sans text-[12px] font-light text-zinc-500 mt-1 uppercase tracking-wider leading-tight">Satisfied Clients</span>
              </div>
              <div className="flex flex-col text-left">
                <span className="font-serif text-[28px] font-bold text-[#021E3B] leading-none">1</span>
                <span className="font-sans text-[12px] font-light text-zinc-500 mt-1 uppercase tracking-wider leading-tight">Branch</span>
              </div>
              <div className="flex flex-col text-left">
                <span className="font-serif text-[28px] font-bold text-[#021E3B] leading-none">3100+</span>
                <span className="font-sans text-[12px] font-light text-zinc-500 mt-1 uppercase tracking-wider leading-tight">Designs Available</span>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN (50%) */}
          <div className="lg:col-span-6 relative flex justify-center lg:justify-end items-center mt-6 lg:mt-0" id="hero-image-column">
            {/* Background design elements */}
            <div className="absolute -top-6 -left-6 w-24 h-24 bg-[#029BFA]/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 -right-4 w-48 h-48 bg-[#021E3B]/5 rounded-full blur-3xl pointer-events-none" />

            {/* Main Luxury Living room with beautiful blue curtains */}
            <div className="relative w-full aspect-[4/3] sm:aspect-video lg:aspect-[4/3] overflow-hidden rounded-[24px] shadow-[0_20px_50px_rgba(2,30,59,0.15)] border border-zinc-100">
              <OptimizedImage
                src={siteConfig.heroImageUrl || DEFAULT_SITE_CONFIG.heroImageUrl || "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80"}
                alt="Luxury living room styling with elite custom drapes"
                priority={true}
                width={1200}
                className="w-full h-full object-cover transform hover:scale-102 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#021E3B]/30 to-transparent pointer-events-none" />
            </div>

            {/* Fine decorative layout elements matching the reference image dots */}
            <div className="absolute -bottom-8 -left-8 pointer-events-none hidden sm:grid grid-cols-5 gap-2.5 p-3 opacity-30">
              {Array.from({ length: 15 }).map((_, i) => (
                <div key={i} className="h-1.5 w-1.5 rounded-full bg-[#029BFA]" />
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
