import { motion } from 'motion/react';
import { ArrowRight, Scissors, Sparkles } from 'lucide-react';
import { SiteConfig, DEFAULT_SITE_CONFIG } from '../types';
import { normalizeGoogleDriveUrl } from '../utils/googleDrive';

interface CustomizationSectionProps {
  openBookingModal: () => void;
  siteConfig?: SiteConfig;
}

export default function CustomizationSection({ openBookingModal, siteConfig }: CustomizationSectionProps) {
  const curtainsImg = normalizeGoogleDriveUrl(
    siteConfig?.customizationCurtainsImage 
    || DEFAULT_SITE_CONFIG.customizationCurtainsImage 
    || 'https://dailfrvzaqksxohurgrq.supabase.co/storage/v1/object/public/images/curtains/1792151517592_Modern_Luxury_Living_Room_with_Draped_Curtains.png'
  );
  const wallpaperImg = normalizeGoogleDriveUrl(
    siteConfig?.customizationWallpaperImage 
    || DEFAULT_SITE_CONFIG.customizationWallpaperImage 
    || 'https://dailfrvzaqksxohurgrq.supabase.co/storage/v1/object/public/images/wallpapers/1792151416732_Luxurious_Botanical_Wallpaper_Living_Room.png'
  );
  
  const sectionTitle = siteConfig?.customizationSectionTitle || DEFAULT_SITE_CONFIG.customizationSectionTitle || 'Tailor-Made Customization';
  const sectionSubtitle = siteConfig?.customizationSectionSubtitle || DEFAULT_SITE_CONFIG.customizationSectionSubtitle || 'BESPOKE STYLING';
  const curtainsTitle = siteConfig?.customizationCurtainsTitle || DEFAULT_SITE_CONFIG.customizationCurtainsTitle || 'Design Your Own Curtains';
  const curtainsDesc = siteConfig?.customizationCurtainsDesc || DEFAULT_SITE_CONFIG.customizationCurtainsDesc || 'Customize your curtains with your favorite fabric, color & style. Get precision fit.';
  const wallpaperTitle = siteConfig?.customizationWallpaperTitle || DEFAULT_SITE_CONFIG.customizationWallpaperTitle || 'Design Your Own Wallpaper';
  const wallpaperDesc = siteConfig?.customizationWallpaperDesc || DEFAULT_SITE_CONFIG.customizationWallpaperDesc || 'Create unique wallpaper designs that reflect your personality and style perfectly.';

  return (
    <section className="bg-white py-10 lg:py-14 border-b border-[#EAEAEA]" id="customization-section">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        
        {/* Header Block */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="font-sans text-[13px] font-semibold tracking-[0.25em] text-[#029BFA] uppercase mb-3 block">
            {sectionSubtitle}
          </span>
          <h2 className="font-serif text-[36px] sm:text-[42px] font-bold text-[#021E3B] leading-[1.2] uppercase">
            {sectionTitle}
          </h2>
          <div className="h-[3px] w-12 bg-[#029BFA] mx-auto mt-4" />
        </div>

        {/* Two Equal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 mt-12">
          
          {/* CARD 1: Design Your Own Curtains */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.7 }}
            className="group relative rounded-[24px] overflow-hidden bg-[#021E3B] text-white p-8 sm:p-10 lg:p-12 flex flex-col justify-between min-h-[420px] shadow-[0_15px_40px_rgba(2,30,59,0.18)] border border-white/5"
            id="customize-curtains-card"
          >
            {/* Visual background decor / split */}
            <div className="absolute right-0 top-0 bottom-0 w-[75%] opacity-100 transition-opacity duration-500 overflow-hidden rounded-r-[24px] pointer-events-none">
              <img
                src={curtainsImg}
                alt="Curtains fabric texture background"
                className="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-y-0 left-0 w-[40%] bg-gradient-to-r from-[#021E3B] via-[#021E3B]/80 to-transparent" />
            </div>

            {/* Icon and content */}
            <div className="relative z-10 space-y-6 max-w-[55%]">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#029BFA]/20 text-[#029BFA] border border-[#029BFA]/30">
                <Scissors className="h-5 w-5" />
              </div>
              <div className="space-y-3">
                <h3 className="font-serif text-[26px] sm:text-[28px] font-bold leading-tight">
                  {curtainsTitle.split(' ').length > 2 ? (
                    <>
                      {curtainsTitle.split(' ').slice(0, 2).join(' ')} <br />
                      {curtainsTitle.split(' ').slice(2).join(' ')}
                    </>
                  ) : (
                    curtainsTitle
                  )}
                </h3>
                <p className="font-sans text-[15px] font-light text-zinc-300 leading-[150%]">
                  {curtainsDesc}
                </p>
              </div>
            </div>

            {/* Action Button */}
            <div className="relative z-10 pt-8 text-left">
              <button
                onClick={openBookingModal}
                className="inline-flex items-center space-x-3 bg-white text-[#021E3B] hover:bg-[#029BFA] hover:text-white px-7 py-3.5 rounded-full text-[13px] font-bold uppercase tracking-wider transition-all duration-300 shadow-lg cursor-pointer"
              >
                <span>Start Designing</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

          </motion.div>

          {/* CARD 2: Design Your Own Wallpaper */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.7 }}
            className="group relative rounded-[24px] overflow-hidden bg-[#021E3B] text-white p-8 sm:p-10 lg:p-12 flex flex-col justify-between min-h-[420px] shadow-[0_15px_40px_rgba(2,30,59,0.18)] border border-white/5"
            id="customize-wallpaper-card"
          >
            {/* Visual background decor / split */}
            <div className="absolute right-0 top-0 bottom-0 w-[75%] opacity-100 transition-opacity duration-500 overflow-hidden rounded-r-[24px] pointer-events-none">
              <img
                src={wallpaperImg}
                alt="Wallpaper luxury design background"
                className="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-y-0 left-0 w-[40%] bg-gradient-to-r from-[#021E3B] via-[#021E3B]/80 to-transparent" />
            </div>

            {/* Icon and content */}
            <div className="relative z-10 space-y-6 max-w-[55%]">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#029BFA]/20 text-[#029BFA] border border-[#029BFA]/30">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="space-y-3">
                <h3 className="font-serif text-[26px] sm:text-[28px] font-bold leading-tight">
                  {wallpaperTitle.split(' ').length > 2 ? (
                    <>
                      {wallpaperTitle.split(' ').slice(0, 2).join(' ')} <br />
                      {wallpaperTitle.split(' ').slice(2).join(' ')}
                    </>
                  ) : (
                    wallpaperTitle
                  )}
                </h3>
                <p className="font-sans text-[15px] font-light text-zinc-300 leading-[150%]">
                  {wallpaperDesc}
                </p>
              </div>
            </div>

            {/* Action Button */}
            <div className="relative z-10 pt-8 text-left">
              <button
                onClick={openBookingModal}
                className="inline-flex items-center space-x-3 bg-white text-[#021E3B] hover:bg-[#029BFA] hover:text-white px-7 py-3.5 rounded-full text-[13px] font-bold uppercase tracking-wider transition-all duration-300 shadow-lg cursor-pointer"
              >
                <span>Start Designing</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

          </motion.div>

        </div>

      </div>
    </section>
  );
}
