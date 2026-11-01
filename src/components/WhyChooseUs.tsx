import { motion } from 'motion/react';
import { Check } from 'lucide-react';
import { SiteConfig, DEFAULT_SITE_CONFIG } from '../types';
import { normalizeGoogleDriveUrl } from '../utils/googleDrive';

interface WhyChooseUsProps {
  siteConfig?: SiteConfig;
}

export default function WhyChooseUs({ siteConfig }: WhyChooseUsProps) {
  const whyChooseUsImg = normalizeGoogleDriveUrl(
    siteConfig?.whyChooseUsImageUrl 
    || DEFAULT_SITE_CONFIG.whyChooseUsImageUrl 
    || "https://dailfrvzaqksxohurgrq.supabase.co/storage/v1/object/public/images/why_choose_us/1792151814330_Luxury_Drapery_Showroom_in_Sunlight.png"
  );
  const title = siteConfig?.whyChooseUsTitle || DEFAULT_SITE_CONFIG.whyChooseUsTitle;
  const subtitle = siteConfig?.whyChooseUsSubtitle || DEFAULT_SITE_CONFIG.whyChooseUsSubtitle;
  const desc = siteConfig?.whyChooseUsDesc || DEFAULT_SITE_CONFIG.whyChooseUsDesc;

  const checklist = [
    'Free Measurement',
    'Design Consultation',
    'Touch & Feel Experience',
    'Transparent Quotation',
    'Professional Installation',
    'Customized Solutions',
    'Premium Quality Materials',
    'Excellent After-Sales Support',
  ];

  return (
    <section className="bg-white py-10 lg:py-14 overflow-hidden border-b border-[#EAEAEA]" id="about-us-section">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* LEFT SIDE: Luxury Curtain Image & Dot Patterns */}
          <div className="lg:col-span-6 relative flex justify-center lg:justify-start" id="why-choose-us-image-container">
            
            {/* Blue dot pattern left */}
            <div className="absolute -left-6 top-10 pointer-events-none grid grid-cols-4 gap-2 opacity-35 z-0">
              {Array.from({ length: 16 }).map((_, i) => (
                <div key={i} className="h-1.5 w-1.5 rounded-full bg-[#029BFA]" />
              ))}
            </div>

            {/* Blue dot pattern bottom */}
            <div className="absolute -left-8 -bottom-8 pointer-events-none grid grid-cols-8 gap-2.5 opacity-35 z-0">
              {Array.from({ length: 24 }).map((_, i) => (
                <div key={i} className="h-1.5 w-1.5 rounded-full bg-[#029BFA]" />
              ))}
            </div>

            {/* Core Image card */}
            <div className="relative z-10 w-full max-w-lg aspect-[4/3] sm:aspect-video lg:aspect-[4/5] rounded-[24px] overflow-hidden shadow-[0_20px_40px_rgba(2,30,59,0.12)] border border-[#EAEAEA]">
              <img
                src={whyChooseUsImg}
                alt="Elite curated fabric curtains in a beautiful modern layout"
                className="w-full h-full object-cover transform hover:scale-102 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#021E3B]/20 to-transparent pointer-events-none" />
            </div>

          </div>

          {/* RIGHT SIDE: Content and Check Grid */}
          <div className="lg:col-span-6 flex flex-col space-y-6 text-left">
            <span className="font-sans text-[13px] font-semibold tracking-[0.25em] text-[#029BFA] uppercase">
              {subtitle}
            </span>
            
            <h2 className="font-serif text-[36px] sm:text-[42px] font-bold text-[#021E3B] leading-[1.2] uppercase">
              {title}
            </h2>
            
            <div className="h-[3px] w-12 bg-[#029BFA]" />

            <p className="font-sans text-[16px] font-light text-zinc-500 leading-[160%] pt-2">
              {desc}
            </p>

            {/* 2-Column Checklist Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 pt-6" id="why-choose-us-grid">
              {checklist.map((item, idx) => (
                <motion.div
                  initial={{ opacity: 0, x: -15 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  key={idx}
                  className="flex items-center space-x-3.5 group"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#029BFA] text-white shadow-[0_2px_8px_rgba(2,155,250,0.2)]">
                    <Check className="h-4.5 w-4.5 stroke-[3px]" />
                  </div>
                  <span className="font-sans text-[15px] font-semibold text-[#021E3B] group-hover:text-[#029BFA] transition-colors">
                    {item}
                  </span>
                </motion.div>
              ))}
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
