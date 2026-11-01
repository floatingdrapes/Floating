import { ArrowRight } from 'lucide-react';
import OptimizedImage from './OptimizedImage';
import { CurtainItem, WallpaperItem, SiteConfig, DEFAULT_SITE_CONFIG } from '../types';
import { BlindItem } from '../data/productsData';

interface SectionProps {
  onSelectCategory: (category: 'curtains' | 'wallpapers' | 'blinds') => void;
  curtains?: CurtainItem[];
  wallpapers?: WallpaperItem[];
  blinds?: BlindItem[];
  siteConfig?: SiteConfig;
}

export default function CurtainsWallpapersSection({ 
  onSelectCategory,
  curtains = [],
  wallpapers = [],
  blinds = [],
  siteConfig
}: SectionProps) {
  // Dedicated thumbnails for the 3 showcase products ("Elegance In Every Detail").
  // Decoupled from catalog products so individual product edits don't overwrite these showcase thumbnails!
  const curtainThumb = siteConfig?.categoryShowcase?.curtains?.thumbnail
    || siteConfig?.categoryImages?.curtains 
    || DEFAULT_SITE_CONFIG.categoryShowcase!.curtains.thumbnail;

  const wallpaperThumb = siteConfig?.categoryShowcase?.wallpapers?.thumbnail
    || siteConfig?.categoryImages?.wallpapers 
    || DEFAULT_SITE_CONFIG.categoryShowcase!.wallpapers.thumbnail;

  const blindThumb = siteConfig?.categoryShowcase?.blinds?.thumbnail
    || siteConfig?.categoryImages?.blinds 
    || DEFAULT_SITE_CONFIG.categoryShowcase!.blinds.thumbnail;

  const products = [
    {
      id: 'curtains' as const,
      title: siteConfig?.categoryShowcase?.curtains?.title || 'Curtains',
      badge: siteConfig?.categoryShowcase?.curtains?.badge || (curtains.length > 0 ? `${curtains.length * 100}+` : '1000+'),
      description: siteConfig?.categoryShowcase?.curtains?.description || 'Premium quality fabrics in a wide range of colors, textures & patterns.',
      image: curtainThumb,
      actionLabel: siteConfig?.categoryShowcase?.curtains?.buttonText || 'Explore Curtains',
    },
    {
      id: 'wallpapers' as const,
      title: siteConfig?.categoryShowcase?.wallpapers?.title || 'Wallpapers',
      badge: siteConfig?.categoryShowcase?.wallpapers?.badge || (wallpapers.length > 0 ? `${wallpapers.length * 150}+` : '1500+'),
      description: siteConfig?.categoryShowcase?.wallpapers?.description || 'From modern textures to timeless patterns, find the perfect match.',
      image: wallpaperThumb,
      actionLabel: siteConfig?.categoryShowcase?.wallpapers?.buttonText || 'Explore Wallpapers',
    },
    {
      id: 'blinds' as const,
      title: siteConfig?.categoryShowcase?.blinds?.title || 'Blinds',
      badge: siteConfig?.categoryShowcase?.blinds?.badge || (blinds.length > 0 ? `${blinds.length * 80}+` : '600+'),
      description: siteConfig?.categoryShowcase?.blinds?.description || 'Stylish & functional blinds for light control and privacy.',
      image: blindThumb,
      actionLabel: siteConfig?.categoryShowcase?.blinds?.buttonText || 'Explore Blinds',
    }
  ];

  const sectionTitle = siteConfig?.showcaseSectionTitle || 'Elegance In Every Detail';
  const sectionSubtitle = siteConfig?.showcaseSectionSubtitle || 'OUR PRODUCTS';

  return (
    <section className="bg-white py-14 lg:py-20 border-b border-[#e2effa]" id="categories-overview-section">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        
        {/* Header Block */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="font-sans text-[13px] md:text-[14px] font-semibold tracking-[0.25em] text-[#0099ff] uppercase mb-3 block">
            {sectionSubtitle}
          </span>
          <h2 className="font-serif text-[36px] sm:text-[42px] font-bold text-[#002b49] leading-[1.2] uppercase">
            {sectionTitle}
          </h2>
          <div className="h-[3px] w-12 bg-[#0099ff] mx-auto mt-4" />
        </div>

        {/* 3-Column Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch mt-12">
          {products.map((p) => (
            <div
              key={p.id}
              onClick={() => onSelectCategory(p.id)}
              className="group cursor-pointer bg-white rounded-2xl overflow-hidden border border-[#e2effa] flex flex-col justify-between min-h-[480px] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,43,73,0.08)] hover:border-[#0099ff]/50 shadow-md"
              id={`${p.id}-overview-card`}
            >
              {/* Image with counter badge in top corner */}
              <div className="p-3 sm:p-3.5 pb-0 bg-white">
                <div className="relative h-[260px] w-full overflow-hidden rounded-xl bg-slate-100">
                  <OptimizedImage
                    src={p.image}
                    alt={p.title}
                    width={600}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  
                  {/* Blue circular badge in top right corner */}
                  <div className="absolute top-3 right-3 flex flex-col items-center justify-center h-14 w-14 rounded-full bg-[#0099ff] text-white border-2 border-white shadow-[0_4px_12px_rgba(0,153,255,0.35)]">
                    <span className="text-[13px] font-bold leading-none">{p.badge}</span>
                    <span className="text-[7px] font-medium uppercase tracking-wider mt-0.5 leading-none">DESIGNS</span>
                  </div>
                </div>
              </div>

              {/* Card Content block */}
              <div className="p-7 flex flex-col justify-between flex-grow text-[#002b49] bg-white">
                <div className="space-y-3">
                  <div className="flex items-center space-x-1.5 text-[#0099ff] text-[11px] font-bold tracking-[0.2em] uppercase">
                    <span>✦</span>
                    <span>FINE FINISH</span>
                  </div>
                  <h3 className="font-serif text-[24px] sm:text-[26px] font-bold text-[#002b49]">
                    {p.title}
                  </h3>
                  <p className="font-sans text-[14px] font-normal text-[#335577] leading-[155%]">
                    {p.description}
                  </p>
                </div>

                {/* Explore button links with dynamic interactive arrow */}
                <div className="pt-5 border-t border-[#e2effa] mt-6 text-left flex items-center justify-between">
                  <span className="inline-flex items-center space-x-2 text-[13px] font-bold text-white bg-[#0099ff] hover:bg-[#0088ee] px-5 py-2.5 rounded-lg transition-all shadow-md shadow-[#0099ff]/20">
                    <span>{p.actionLabel}</span>
                    <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
