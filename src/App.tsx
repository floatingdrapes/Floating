import { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import CurtainsWallpapersSection from './components/CurtainsWallpapersSection';
import SignatureCollections from './components/SignatureCollections';
import WhyChooseUs from './components/WhyChooseUs';
import ProcessSection from './components/ProcessSection';
import CustomizationSection from './components/CustomizationSection';
import BeforeAfterSection from './components/BeforeAfterSection';
import Testimonials from './components/Testimonials';
import CTASection from './components/CTASection';
import Footer from './components/Footer';
import BookingModal from './components/BookingModal';
import ContactForm from './components/ContactForm';
import WhatsAppButton, { openWhatsAppPopup } from './components/WhatsAppButton';
import BackToHomeButton from './components/BackToHomeButton';
import OptimizedImage from './components/OptimizedImage';

import { 
  SIGNATURE_COLLECTIONS, 
  CurtainItem, 
  WallpaperItem, 
  SiteConfig, 
  DEFAULT_SITE_CONFIG, 
  Testimonial, 
  TESTIMONIALS_DATA,
  PortfolioItem
} from './types';

import AdminPanel from './components/AdminPanel';
import ThemeInjector from './components/ThemeInjector';
import ProductImageModal, { ProductPreviewItem } from './components/ProductImageModal';

import {
  EXTENDED_CURTAINS_DATA,
  EXTENDED_WALLPAPERS_DATA,
  EXTENDED_BLINDS_DATA,
  BlindItem
} from './data/productsData';

import {
  isSupabaseConfigured,
  initUniversalSupabase,
  fetchUniversalSiteData,
  subscribeToUniversalChanges
} from './services/supabaseClient';

import { 
  Sparkles, 
  Layers, 
  Clock, 
  Award, 
  ShieldCheck, 
  ArrowRight, 
  Check, 
  Sliders, 
  HelpCircle,
  Gem,
  Wind,
  ZoomIn
} from 'lucide-react';

import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [activePage, setActivePage] = useState<string>(() => {   return sessionStorage.getItem('floatingdrapes_activePage') || 'home'; });  useEffect(() => {   sessionStorage.setItem('floatingdrapes_activePage', activePage); }, [activePage]);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedCurtainFilter, setSelectedCurtainFilter] = useState<string>('All');
  const [selectedWallpaperFilter, setSelectedWallpaperFilter] = useState<string>('All');
  const [selectedBlindFilter, setSelectedBlindFilter] = useState<string>('All');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Full-Screen Product Image Pop-up Lightbox State
  const [selectedProductPreview, setSelectedProductPreview] = useState<{
    product: ProductPreviewItem | null;
    productsList: ProductPreviewItem[];
    categoryName: string;
  }>({
    product: null,
    productsList: [],
    categoryName: 'Curtains'
  });

  const handleOpenProductPreview = (
    item: CurtainItem | WallpaperItem | BlindItem,
    itemsList: (CurtainItem | WallpaperItem | BlindItem)[],
    categoryName: string
  ) => {
    setSelectedProductPreview({
      product: {
        id: item.id,
        name: item.name,
        image: item.image,
        description: item.description,
        priceClass: (item as CurtainItem).priceClass,
        style: (item as WallpaperItem | BlindItem).style,
        materials: item.materials
      },
      productsList: itemsList.map(p => ({
        id: p.id,
        name: p.name,
        image: p.image,
        description: p.description,
        priceClass: (p as CurtainItem).priceClass,
        style: (p as WallpaperItem | BlindItem).style,
        materials: p.materials
      })),
      categoryName
    });
  };

  const handleCloseProductPreview = () => {
    setSelectedProductPreview(prev => ({ ...prev, product: null }));
  };

  // Dynamic Site Customizer Config & Database States
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(() => {
    const saved = localStorage.getItem('floatingdrapes_config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_SITE_CONFIG,
          ...parsed,
          categoryShowcase: {
            curtains: {
              ...DEFAULT_SITE_CONFIG.categoryShowcase!.curtains,
              ...(parsed.categoryShowcase?.curtains || {})
            },
            wallpapers: {
              ...DEFAULT_SITE_CONFIG.categoryShowcase!.wallpapers,
              ...(parsed.categoryShowcase?.wallpapers || {})
            },
            blinds: {
              ...DEFAULT_SITE_CONFIG.categoryShowcase!.blinds,
              ...(parsed.categoryShowcase?.blinds || {})
            }
          }
        };
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_SITE_CONFIG;
  });

  const [curtains, setCurtains] = useState<CurtainItem[]>(() => {
    const saved = localStorage.getItem('floatingdrapes_curtains');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return EXTENDED_CURTAINS_DATA;
  });

  const [wallpapers, setWallpapers] = useState<WallpaperItem[]>(() => {
    const saved = localStorage.getItem('floatingdrapes_wallpapers');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return EXTENDED_WALLPAPERS_DATA;
  });

  const [blinds, setBlinds] = useState<BlindItem[]>(() => {
    const saved = localStorage.getItem('floatingdrapes_blinds');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return EXTENDED_BLINDS_DATA;
  });

  const [testimonials, setTestimonials] = useState<Testimonial[]>(() => {
    const saved = localStorage.getItem('floatingdrapes_testimonials');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return TESTIMONIALS_DATA;
  });

  const [adminPanelOpen, setAdminPanelOpen] = useState(false);

  // Universal Supabase Initialization & Realtime Synchronizer
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    // 1. Initial Universal Fetch from Supabase (syncs with backend server so all devices connect)
    initUniversalSupabase().then((configured) => {
      if (configured) {
        fetchUniversalSiteData()
          .then((data) => {
            if (data.siteConfig || (data.transformations && data.transformations.length > 0)) {
              setSiteConfig(prev => {
                const incomingPortfolio = (data.transformations && data.transformations.length > 0)
                  ? data.transformations
                  : (data.siteConfig?.portfolioData && data.siteConfig.portfolioData.length > 0
                      ? data.siteConfig.portfolioData
                      : prev.portfolioData);

                const merged: SiteConfig = {
                  ...DEFAULT_SITE_CONFIG,
                  ...prev,
                  ...(data.siteConfig || {}),
                  portfolioData: incomingPortfolio,
                  categoryShowcase: {
                    curtains: {
                      ...DEFAULT_SITE_CONFIG.categoryShowcase!.curtains,
                      ...(prev.categoryShowcase?.curtains || {}),
                      ...(data.siteConfig?.categoryShowcase?.curtains || {})
                    },
                    wallpapers: {
                      ...DEFAULT_SITE_CONFIG.categoryShowcase!.wallpapers,
                      ...(prev.categoryShowcase?.wallpapers || {}),
                      ...(data.siteConfig?.categoryShowcase?.wallpapers || {})
                    },
                    blinds: {
                      ...DEFAULT_SITE_CONFIG.categoryShowcase!.blinds,
                      ...(prev.categoryShowcase?.blinds || {}),
                      ...(data.siteConfig?.categoryShowcase?.blinds || {})
                    }
                  }
                };
                localStorage.setItem('floatingdrapes_config', JSON.stringify(merged));
                return merged;
              });
            }
            if (data.curtains && data.curtains.length > 0) {
              setCurtains(data.curtains);
              localStorage.setItem('floatingdrapes_curtains', JSON.stringify(data.curtains));
            }
            if (data.wallpapers && data.wallpapers.length > 0) {
              setWallpapers(data.wallpapers);
              localStorage.setItem('floatingdrapes_wallpapers', JSON.stringify(data.wallpapers));
            }
            if (data.blinds && data.blinds.length > 0) {
              setBlinds(data.blinds);
              localStorage.setItem('floatingdrapes_blinds', JSON.stringify(data.blinds));
            }
            if (data.testimonials && data.testimonials.length > 0) {
              setTestimonials(data.testimonials);
              localStorage.setItem('floatingdrapes_testimonials', JSON.stringify(data.testimonials));
            }
          })
          .catch((err) => {
            console.warn('Initial Supabase fetch fallback to local storage:', err);
          });

        // 2. Subscribe to universal realtime changes across all tables
        unsubscribe = subscribeToUniversalChanges((table: string, payload: any) => {
          console.log(`[Supabase Realtime Event] Table: ${table}, Event: ${payload?.eventType}`, payload);
          const eventType = payload?.eventType;
          const newRecord = payload?.new;
          const oldRecord = payload?.old;

          if (table === 'site_config' && newRecord && (newRecord.config || newRecord.config_data)) {
            const configObj = newRecord.config || newRecord.config_data;
            const incomingPortfolio = configObj.portfolioData || configObj.portfolio_data;
            setSiteConfig(prev => {
              const merged: SiteConfig = {
                ...DEFAULT_SITE_CONFIG,
                ...prev,
                ...configObj,
                portfolioData: (incomingPortfolio && Array.isArray(incomingPortfolio) && incomingPortfolio.length > 0)
                  ? incomingPortfolio
                  : (prev.portfolioData && prev.portfolioData.length > 0 ? prev.portfolioData : DEFAULT_SITE_CONFIG.portfolioData),
                beforeAfterTitle: configObj.beforeAfterTitle || configObj.before_after_title || prev.beforeAfterTitle,
                beforeAfterSubtitle: configObj.beforeAfterSubtitle || configObj.before_after_subtitle || prev.beforeAfterSubtitle,
                categoryShowcase: {
                  curtains: {
                    ...DEFAULT_SITE_CONFIG.categoryShowcase!.curtains,
                    ...(prev.categoryShowcase?.curtains || {}),
                    ...(configObj?.categoryShowcase?.curtains || {})
                  },
                  wallpapers: {
                    ...DEFAULT_SITE_CONFIG.categoryShowcase!.wallpapers,
                    ...(prev.categoryShowcase?.wallpapers || {}),
                    ...(configObj?.categoryShowcase?.wallpapers || {})
                  },
                  blinds: {
                    ...DEFAULT_SITE_CONFIG.categoryShowcase!.blinds,
                    ...(prev.categoryShowcase?.blinds || {}),
                    ...(configObj?.categoryShowcase?.blinds || {})
                  }
                }
              };
              localStorage.setItem('floatingdrapes_config', JSON.stringify(merged));
              return merged;
            });
          } else if (table === 'transformations') {
            if (eventType === 'DELETE' && oldRecord) {
              setSiteConfig(prev => {
                const currentList = prev.portfolioData || [];
                const updatedList = currentList.filter(item => item.id !== oldRecord.id);
                const next = { ...prev, portfolioData: updatedList };
                localStorage.setItem('floatingdrapes_config', JSON.stringify(next));
                return next;
              });
            } else if (newRecord) {
              const formattedItem: PortfolioItem = {
                id: newRecord.id,
                title: newRecord.title,
                description: newRecord.description || '',
                beforeImage: newRecord.before_image || newRecord.beforeImage || newRecord.before || '',
                afterImage: newRecord.after_image || newRecord.afterImage || newRecord.after || '',
                category: newRecord.category || 'Living Room'
              };
              setSiteConfig(prev => {
                const currentList = prev.portfolioData || [];
                const exists = currentList.some(item => item.id === formattedItem.id);
                const updatedList = exists
                  ? currentList.map(item => item.id === formattedItem.id ? formattedItem : item)
                  : [formattedItem, ...currentList];
                const next = { ...prev, portfolioData: updatedList };
                localStorage.setItem('floatingdrapes_config', JSON.stringify(next));
                return next;
              });
            }
          } else if (table === 'uploaded_images' && newRecord && (newRecord.file_url || newRecord.base64_data)) {
            const fileUrl = newRecord.file_url || newRecord.base64_data;
            const cat = newRecord.category;
            // Only update siteConfig for hero, categories, and customization sections
            const sectionCategories = ['hero', 'curtains', 'wallpapers', 'blinds', 'why_choose_us', 'customization_curtains', 'customization_wallpaper'];
            if (sectionCategories.includes(cat)) {
              setSiteConfig(prev => {
                const next = { ...prev };
                if (cat === 'hero') {
                  next.heroImageUrl = fileUrl;
                } else if (cat === 'curtains') {
                  next.categoryShowcase = {
                    ...next.categoryShowcase!,
                    curtains: { ...next.categoryShowcase!.curtains, thumbnail: fileUrl }
                  };
                } else if (cat === 'wallpapers') {
                  next.categoryShowcase = {
                    ...next.categoryShowcase!,
                    wallpapers: { ...next.categoryShowcase!.wallpapers, thumbnail: fileUrl }
                  };
                } else if (cat === 'blinds') {
                  next.categoryShowcase = {
                    ...next.categoryShowcase!,
                    blinds: { ...next.categoryShowcase!.blinds, thumbnail: fileUrl }
                  };
                } else if (cat === 'why_choose_us') {
                  next.whyChooseUsImageUrl = fileUrl;
                } else if (cat === 'customization_curtains') {
                  next.customizationCurtainsImage = fileUrl;
                } else if (cat === 'customization_wallpaper') {
                  next.customizationWallpaperImage = fileUrl;
                }
                localStorage.setItem('floatingdrapes_config', JSON.stringify(next));
                return next;
              });
            }
          } else if (table === 'curtains') {
            if (eventType === 'DELETE' && oldRecord) {
              setCurtains((prev) => prev.filter((item) => item.id !== oldRecord.id));
            } else if (newRecord) {
              const formattedItem: CurtainItem = {
                id: newRecord.id,
                name: newRecord.name,
                description: newRecord.description,
                image: newRecord.image,
                priceClass: newRecord.price_class || newRecord.priceClass || 'Premium',
                materials: Array.isArray(newRecord.materials) ? newRecord.materials : []
              };
              setCurtains((prev) => {
                const exists = prev.some((p) => p.id === formattedItem.id);
                if (exists) {
                  return prev.map((p) => (p.id === formattedItem.id ? formattedItem : p));
                } else {
                  return [formattedItem, ...prev];
                }
              });
            }
          } else if (table === 'wallpapers') {
            if (eventType === 'DELETE' && oldRecord) {
              setWallpapers((prev) => prev.filter((item) => item.id !== oldRecord.id));
            } else if (newRecord) {
              const formattedItem: WallpaperItem = {
                id: newRecord.id,
                name: newRecord.name,
                description: newRecord.description,
                image: newRecord.image,
                style: newRecord.style || 'Classic',
                materials: Array.isArray(newRecord.materials) ? newRecord.materials : []
              };
              setWallpapers((prev) => {
                const exists = prev.some((p) => p.id === formattedItem.id);
                if (exists) {
                  return prev.map((p) => (p.id === formattedItem.id ? formattedItem : p));
                } else {
                  return [formattedItem, ...prev];
                }
              });
            }
          } else if (table === 'blinds') {
            if (eventType === 'DELETE' && oldRecord) {
              setBlinds((prev) => prev.filter((item) => item.id !== oldRecord.id));
            } else if (newRecord) {
              const formattedItem: BlindItem = {
                id: newRecord.id,
                name: newRecord.name,
                description: newRecord.description,
                image: newRecord.image,
                style: newRecord.style || 'Roman',
                materials: Array.isArray(newRecord.materials) ? newRecord.materials : []
              };
              setBlinds((prev) => {
                const exists = prev.some((p) => p.id === formattedItem.id);
                if (exists) {
                  return prev.map((p) => (p.id === formattedItem.id ? formattedItem : p));
                } else {
                  return [formattedItem, ...prev];
                }
              });
            }
          } else if (table === 'testimonials') {
            if (eventType === 'DELETE' && oldRecord) {
              setTestimonials((prev) => prev.filter((item) => item.id !== oldRecord.id));
            } else if (newRecord) {
              const formattedItem: Testimonial = {
                id: newRecord.id,
                name: newRecord.name,
                location: newRecord.location || '',
                role: newRecord.role || '',
                review: newRecord.review,
                rating: typeof newRecord.rating === 'number' ? newRecord.rating : 5,
                image: newRecord.image || ''
              };
              setTestimonials((prev) => {
                const exists = prev.some((p) => p.id === formattedItem.id);
                if (exists) {
                  return prev.map((p) => (p.id === formattedItem.id ? formattedItem : p));
                } else {
                  return [formattedItem, ...prev];
                }
              });
            }
          }
        });
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Keyboard shortcut listener for Ctrl + M / Cmd + M
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'm') {
        e.preventDefault();
        setAdminPanelOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleUpdateConfig = (newConfig: SiteConfig) => {
    setSiteConfig(newConfig);
    localStorage.setItem('floatingdrapes_config', JSON.stringify(newConfig));
  };

  // Scroll to top when changing pages
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [activePage]);

  const openWhatsAppDirect = () => {
    openWhatsAppPopup("Hi! I'm interested in your luxury curtain, wallpaper, and blinds services.");
  };

  const handleInquireWhatsApp = (productName: string, category: string) => {
    openWhatsAppPopup(`Hi! I am interested in inquiring about "${productName}" from your ${category} collection.`);
  };

  // Curtains Page filtered datasets
  const filteredCurtains = selectedCurtainFilter === 'All'
    ? curtains
    : curtains.filter(item => item.priceClass === selectedCurtainFilter);

  // Wallpapers Page filtered datasets
  const filteredWallpapers = selectedWallpaperFilter === 'All'
    ? wallpapers
    : wallpapers.filter(item => item.style === selectedWallpaperFilter);

  // Blinds Page filtered datasets
  const filteredBlinds = selectedBlindFilter === 'All'
    ? blinds
    : blinds.filter(item => item.style === selectedBlindFilter);

  return (
    <div className="min-h-screen bg-luxury-bg text-white selection:bg-gold/30 flex flex-col justify-between" id="floatingdrapes-main-container">
      
      {/* GLOBAL HEADER */}
      <Header 
        activePage={activePage} 
        setActivePage={setActivePage} 
        openBookingModal={() => setBookingModalOpen(true)} 
        brandLogoUrl={siteConfig.brandLogoUrl}
      />

      {/* RENDER PAGES BASED ON STATE */}
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          
          {/* 1. HOME PAGE */}
          {activePage === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Hero 
                onExplore={() => setActivePage('signature')} 
                openBookingModal={() => setBookingModalOpen(true)} 
                siteConfig={siteConfig}
              />
              <CurtainsWallpapersSection 
                onSelectCategory={(cat) => {
                  if (cat === 'curtains') setActivePage('curtains');
                  if (cat === 'wallpapers') setActivePage('wallpapers');
                  if (cat === 'blinds') setActivePage('blinds');
                }} 
                curtains={curtains}
                wallpapers={wallpapers}
                blinds={blinds}
                siteConfig={siteConfig}
              />
              <WhyChooseUs siteConfig={siteConfig} />
              <ProcessSection />
              <CustomizationSection 
                openBookingModal={() => setBookingModalOpen(true)} 
                siteConfig={siteConfig}
              />

              {/* DYNAMIC BEFORE & AFTER TRANSFORMATION SLIDER */}
              <BeforeAfterSection 
                comparisons={siteConfig.portfolioData}
                subtitle={siteConfig.beforeAfterSubtitle}
                title={siteConfig.beforeAfterTitle}
              />

              {/* DYNAMIC TESTIMONIALS SECTION */}
              <Testimonials 
                testimonials={testimonials} 
                subtitle={siteConfig.testimonialsSectionSubtitle}
                title={siteConfig.testimonialsSectionTitle}
              />

              <CTASection 
                openBookingModal={() => setBookingModalOpen(true)} 
                openWhatsApp={openWhatsAppDirect} 
              />
            </motion.div>
          )}

          {/* 2. CURTAINS COLLECTION PAGE */}
          {activePage === 'curtains' && (
            <motion.div
              key="curtains"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="py-12 lg:py-20 bg-[#041c35] min-h-screen text-white"
              id="curtains-page"
            >
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <BackToHomeButton onClick={() => setActivePage('home')} />
                
                {/* Intro Heading */}
                <div className="text-center mb-14 sm:mb-16">
                  <span className="font-sans text-[11px] font-bold tracking-[0.3em] text-[#0099ff] uppercase mb-2 block">✦ ELITE DRAPERIES ✦</span>
                  <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
                    The Curtains <span className="italic text-[#0099ff]">Collection</span>
                  </h1>
                  <p className="font-sans text-xs sm:text-sm font-normal text-[#b0d2ee] max-w-xl mx-auto mt-3 sm:mt-4 leading-relaxed">
                    Sourced from historic silk weavers in northern Italy and heavier velvet mills in Belgium. Laser-fit with sub-millimeter tolerances.
                  </p>
                  <div className="mx-auto h-0.5 w-16 bg-[#0099ff] mt-5 sm:mt-6" />
                </div>

                {/* Filter Controls */}
                <div className="flex flex-wrap justify-center items-center gap-2.5 sm:gap-3 mb-12 sm:mb-14">
                  {['All', 'Premium', 'Signature', 'Reserve'].map((tier) => {
                    const label = tier === 'All' ? 'ALL TIERS' : `${tier.toUpperCase()} TIER`;
                    const isActive = selectedCurtainFilter === tier;
                    return (
                      <button
                        key={tier}
                        onClick={() => setSelectedCurtainFilter(tier)}
                        className={`px-5 sm:px-6 py-2.5 text-xs font-bold tracking-[0.15em] uppercase transition-all duration-300 rounded-lg cursor-pointer ${
                          isActive
                            ? 'bg-[#0099ff] text-white shadow-lg shadow-[#0099ff]/35 border border-[#0099ff]'
                            : 'bg-[#051f38] border border-[#0066aa]/50 text-[#88ccff] hover:border-[#0099ff] hover:text-white hover:bg-[#07284a]'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>

                {/* Grid Displays */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 xl:gap-8 items-stretch" id="curtains-grid">
                  {filteredCurtains.map((item: CurtainItem) => (
                    <div 
                      key={item.id} 
                      className="group bg-[#F4F9FD] rounded-2xl border border-[#d2e5f5]/60 shadow-xl overflow-hidden flex flex-col sm:flex-row transition-all duration-500 hover:shadow-2xl hover:border-[#0099ff]/50 hover:-translate-y-1 h-full"
                      id={`curtain-item-${item.id}`}
                    >
                      {/* Product Image */}
                      <div className="w-full sm:w-[44%] lg:w-[44%] xl:w-[45%] flex-shrink-0 p-3 sm:p-3.5 pb-0 sm:pb-3.5 flex flex-col bg-[#F4F9FD]">
                        <div 
                          onClick={() => handleOpenProductPreview(item, filteredCurtains, 'Curtains')}
                          className="relative h-[240px] sm:h-full min-h-[250px] sm:min-h-[320px] rounded-xl overflow-hidden w-full cursor-pointer group/img"
                          title="Click to view full photo"
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleOpenProductPreview(item, filteredCurtains, 'Curtains');
                            }
                          }}
                        >
                          <OptimizedImage
                            src={item.image}
                            alt={item.name}
                            width={600}
                            className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-700 ease-out"
                          />
                          <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-md border border-[#a2d4f8] text-[10px] font-bold tracking-[0.18em] text-[#0099ff] px-3.5 py-1 rounded-md uppercase z-10 shadow-sm pointer-events-none">
                            {item.priceClass}
                          </span>
                          {/* Elegant hover expand badge */}
                          <div className="absolute inset-0 bg-black/25 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                            <span className="bg-black/75 backdrop-blur-sm text-white text-[11px] font-bold tracking-wider uppercase px-3.5 py-1.5 rounded-full border border-white/25 flex items-center space-x-1.5 shadow-xl">
                              <ZoomIn className="h-3.5 w-3.5 text-[#0099ff]" />
                              <span>View Full Photo</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Details Content */}
                      <div className="p-5 sm:p-6 xl:p-7 w-full sm:w-[56%] lg:w-[56%] xl:w-[55%] flex flex-col justify-between bg-[#F4F9FD] text-[#002b49]">
                        <div>
                          <div className="flex items-center space-x-1.5 text-[#0099ff] text-[11px] font-bold tracking-[0.2em] uppercase mb-1.5">
                            <span>✦</span>
                            <span>FINE FINISH</span>
                          </div>
                          <h3 className="font-serif text-xl sm:text-[22px] xl:text-2xl font-bold text-[#002b49] leading-snug line-clamp-2">
                            {item.name}
                          </h3>
                          <p className="font-sans text-xs sm:text-[13px] font-normal text-[#335577] mt-2.5 leading-relaxed line-clamp-3">
                            {item.description}
                          </p>
                        </div>

                        {/* List of Materials */}
                        <div className="mt-4 pt-3.5 border-t border-[#d2e5f5]">
                          <span className="text-[10px] font-bold tracking-[0.18em] text-[#52779a] uppercase block mb-2">
                            COMPOSED OF:
                          </span>
                          <div className="flex flex-wrap gap-1.5 items-center">
                            {item.materials.map((mat, i) => (
                              <span key={i} className="bg-white border border-[#b8ddf8] text-[#0077c2] font-semibold text-[10px] px-2.5 py-1 rounded-md uppercase tracking-wider whitespace-nowrap shadow-2xs">
                                {mat}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Action request */}
                        <div className="mt-5 pt-3.5 flex items-center justify-start border-t border-[#d2e5f5]">
                          <button
                            onClick={() => handleInquireWhatsApp(item.name, 'Curtains')}
                            className="bg-[#0099ff] hover:bg-[#0088ee] text-white px-5 py-2.5 text-[11px] sm:text-xs font-bold tracking-wider uppercase rounded-lg shadow-md shadow-[#0099ff]/20 flex items-center space-x-2 transition-all hover:scale-[1.02] cursor-pointer whitespace-nowrap flex-shrink-0"
                          >
                            <span>INQUIRE NOW</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            </motion.div>
          )}

          {/* 3. WALLPAPERS COLLECTION PAGE */}
          {activePage === 'wallpapers' && (
            <motion.div
              key="wallpapers"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="py-12 lg:py-20 bg-[#041c35] min-h-screen text-white"
              id="wallpapers-page"
            >
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <BackToHomeButton onClick={() => setActivePage('home')} />
                
                {/* Intro Heading */}
                <div className="text-center mb-14 sm:mb-16">
                  <span className="font-sans text-[11px] font-bold tracking-[0.3em] text-[#0099ff] uppercase mb-2 block">✦ GILDED WALLCOVERINGS ✦</span>
                  <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
                    Designer <span className="italic text-[#0099ff]">Wallpapers</span>
                  </h1>
                  <p className="font-sans text-xs sm:text-sm font-normal text-[#b0d2ee] max-w-xl mx-auto mt-3 sm:mt-4 leading-relaxed">
                    Intricate hand-painted silk murals, real brass-leaf geometry prints, and heavy flocked textured designs to create breathtaking visual feature walls.
                  </p>
                  <div className="mx-auto h-0.5 w-16 bg-[#0099ff] mt-5 sm:mt-6" />
                </div>

                {/* Filter Controls */}
                <div className="flex flex-wrap justify-center items-center gap-2.5 sm:gap-3 mb-12 sm:mb-14">
                  {['All', 'Classic', 'Modern', 'Botanical', 'Textured'].map((style) => {
                    const label = style === 'All' ? 'ALL STYLE' : `${style.toUpperCase()} STYLE`;
                    const isActive = selectedWallpaperFilter === style;
                    return (
                      <button
                        key={style}
                        onClick={() => setSelectedWallpaperFilter(style)}
                        className={`px-5 sm:px-6 py-2.5 text-xs font-bold tracking-[0.15em] uppercase transition-all duration-300 rounded-lg cursor-pointer ${
                          isActive
                            ? 'bg-[#0099ff] text-white shadow-lg shadow-[#0099ff]/35 border border-[#0099ff]'
                            : 'bg-[#051f38] border border-[#0066aa]/50 text-[#88ccff] hover:border-[#0099ff] hover:text-white hover:bg-[#07284a]'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>

                {/* Grid Displays */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 xl:gap-8 items-stretch" id="wallpapers-grid">
                  {filteredWallpapers.map((item: WallpaperItem) => (
                    <div 
                      key={item.id} 
                      className="group bg-[#F4F9FD] rounded-2xl border border-[#d2e5f5]/60 shadow-xl overflow-hidden flex flex-col sm:flex-row transition-all duration-500 hover:shadow-2xl hover:border-[#0099ff]/50 hover:-translate-y-1 h-full"
                      id={`wallpaper-item-${item.id}`}
                    >
                      {/* Product Image */}
                      <div className="w-full sm:w-[44%] lg:w-[44%] xl:w-[45%] flex-shrink-0 p-3 sm:p-3.5 pb-0 sm:pb-3.5 flex flex-col bg-[#F4F9FD]">
                        <div 
                          onClick={() => handleOpenProductPreview(item, filteredWallpapers, 'Wallpapers')}
                          className="relative h-[240px] sm:h-full min-h-[250px] sm:min-h-[320px] rounded-xl overflow-hidden w-full cursor-pointer group/img"
                          title="Click to view full photo"
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleOpenProductPreview(item, filteredWallpapers, 'Wallpapers');
                            }
                          }}
                        >
                          <OptimizedImage
                            src={item.image}
                            alt={item.name}
                            width={600}
                            className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-700 ease-out"
                          />
                          <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-md border border-[#a2d4f8] text-[10px] font-bold tracking-[0.18em] text-[#0099ff] px-3.5 py-1 rounded-md uppercase z-10 shadow-sm pointer-events-none">
                            {item.style}
                          </span>
                          {/* Elegant hover expand badge */}
                          <div className="absolute inset-0 bg-black/25 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                            <span className="bg-black/75 backdrop-blur-sm text-white text-[11px] font-bold tracking-wider uppercase px-3.5 py-1.5 rounded-full border border-white/25 flex items-center space-x-1.5 shadow-xl">
                              <ZoomIn className="h-3.5 w-3.5 text-[#0099ff]" />
                              <span>View Full Photo</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Details Content */}
                      <div className="p-5 sm:p-6 xl:p-7 w-full sm:w-[56%] lg:w-[56%] xl:w-[55%] flex flex-col justify-between bg-[#F4F9FD] text-[#002b49]">
                        <div>
                          <div className="flex items-center space-x-1.5 text-[#0099ff] text-[11px] font-bold tracking-[0.2em] uppercase mb-1.5">
                            <span>✦</span>
                            <span>FINE FINISH</span>
                          </div>
                          <h3 className="font-serif text-xl sm:text-[22px] xl:text-2xl font-bold text-[#002b49] leading-snug line-clamp-2">
                            {item.name}
                          </h3>
                          <p className="font-sans text-xs sm:text-[13px] font-normal text-[#335577] mt-2.5 leading-relaxed line-clamp-3">
                            {item.description}
                          </p>
                        </div>

                        {/* List of Materials */}
                        <div className="mt-4 pt-3.5 border-t border-[#d2e5f5]">
                          <span className="text-[10px] font-bold tracking-[0.18em] text-[#52779a] uppercase block mb-2">
                            COMPOSED OF:
                          </span>
                          <div className="flex flex-wrap gap-1.5 items-center">
                            {item.materials.map((mat, i) => (
                              <span key={i} className="bg-white border border-[#b8ddf8] text-[#0077c2] font-semibold text-[10px] px-2.5 py-1 rounded-md uppercase tracking-wider whitespace-nowrap shadow-2xs">
                                {mat}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Action request */}
                        <div className="mt-5 pt-3.5 flex items-center justify-start border-t border-[#d2e5f5]">
                          <button
                            onClick={() => handleInquireWhatsApp(item.name, 'Wallpapers')}
                            className="bg-[#0099ff] hover:bg-[#0088ee] text-white px-5 py-2.5 text-[11px] sm:text-xs font-bold tracking-wider uppercase rounded-lg shadow-md shadow-[#0099ff]/20 flex items-center space-x-2 transition-all hover:scale-[1.02] cursor-pointer whitespace-nowrap flex-shrink-0"
                          >
                            <span>INQUIRE NOW</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            </motion.div>
          )}

          {/* 3.5. BLINDS COLLECTION PAGE */}
          {activePage === 'blinds' && (
            <motion.div
              key="blinds"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="py-12 lg:py-20 bg-[#041c35] min-h-screen text-white"
              id="blinds-page"
            >
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <BackToHomeButton onClick={() => setActivePage('home')} />
                
                {/* Intro Heading */}
                <div className="text-center mb-14 sm:mb-16">
                  <span className="font-sans text-[11px] font-bold tracking-[0.3em] text-[#0099ff] uppercase mb-2 block">✦ ELITE WINDOW SHADING ✦</span>
                  <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
                    Premium <span className="italic text-[#0099ff]">Blinds</span>
                  </h1>
                  <p className="font-sans text-xs sm:text-sm font-normal text-[#b0d2ee] max-w-xl mx-auto mt-3 sm:mt-4 leading-relaxed">
                    Exquisite hand-woven bamboo, sleek cedar woods, and intelligent motorized roller panels tailored to balance solar glare and architectural geometry.
                  </p>
                  <div className="mx-auto h-0.5 w-16 bg-[#0099ff] mt-5 sm:mt-6" />
                </div>

                {/* Filter Controls */}
                <div className="flex flex-wrap justify-center items-center gap-2.5 sm:gap-3 mb-12 sm:mb-14">
                  {['All', 'Roman', 'Roller', 'Venetian', 'Motorized', 'Zebra'].map((style) => {
                    const label = style === 'All' ? 'ALL BLINDS' : `${style.toUpperCase()} STYLE`;
                    const isActive = selectedBlindFilter === style;
                    return (
                      <button
                        key={style}
                        onClick={() => setSelectedBlindFilter(style)}
                        className={`px-5 sm:px-6 py-2.5 text-xs font-bold tracking-[0.15em] uppercase transition-all duration-300 rounded-lg cursor-pointer ${
                          isActive
                            ? 'bg-[#0099ff] text-white shadow-lg shadow-[#0099ff]/35 border border-[#0099ff]'
                            : 'bg-[#051f38] border border-[#0066aa]/50 text-[#88ccff] hover:border-[#0099ff] hover:text-white hover:bg-[#07284a]'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>

                {/* Grid Displays */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 xl:gap-8 items-stretch" id="blinds-grid">
                  {filteredBlinds.map((item: BlindItem) => (
                    <div 
                      key={item.id} 
                      className="group bg-[#F4F9FD] rounded-2xl border border-[#d2e5f5]/60 shadow-xl overflow-hidden flex flex-col sm:flex-row transition-all duration-500 hover:shadow-2xl hover:border-[#0099ff]/50 hover:-translate-y-1 h-full"
                      id={`blind-item-${item.id}`}
                    >
                      {/* Product Image */}
                      <div className="w-full sm:w-[44%] lg:w-[44%] xl:w-[45%] flex-shrink-0 p-3 sm:p-3.5 pb-0 sm:pb-3.5 flex flex-col bg-[#F4F9FD]">
                        <div 
                          onClick={() => handleOpenProductPreview(item, filteredBlinds, 'Blinds')}
                          className="relative h-[240px] sm:h-full min-h-[250px] sm:min-h-[320px] rounded-xl overflow-hidden w-full cursor-pointer group/img"
                          title="Click to view full photo"
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleOpenProductPreview(item, filteredBlinds, 'Blinds');
                            }
                          }}
                        >
                          <OptimizedImage
                            src={item.image}
                            alt={item.name}
                            width={600}
                            className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-700 ease-out"
                          />
                          <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-md border border-[#a2d4f8] text-[10px] font-bold tracking-[0.18em] text-[#0099ff] px-3.5 py-1 rounded-md uppercase z-10 shadow-sm pointer-events-none">
                            {item.style}
                          </span>
                          {/* Elegant hover expand badge */}
                          <div className="absolute inset-0 bg-black/25 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                            <span className="bg-black/75 backdrop-blur-sm text-white text-[11px] font-bold tracking-wider uppercase px-3.5 py-1.5 rounded-full border border-white/25 flex items-center space-x-1.5 shadow-xl">
                              <ZoomIn className="h-3.5 w-3.5 text-[#0099ff]" />
                              <span>View Full Photo</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Details Content */}
                      <div className="p-5 sm:p-6 xl:p-7 w-full sm:w-[56%] lg:w-[56%] xl:w-[55%] flex flex-col justify-between bg-[#F4F9FD] text-[#002b49]">
                        <div>
                          <div className="flex items-center space-x-1.5 text-[#0099ff] text-[11px] font-bold tracking-[0.2em] uppercase mb-1.5">
                            <span>✦</span>
                            <span>FINE FINISH</span>
                          </div>
                          <h3 className="font-serif text-xl sm:text-[22px] xl:text-2xl font-bold text-[#002b49] leading-snug line-clamp-2">
                            {item.name}
                          </h3>
                          <p className="font-sans text-xs sm:text-[13px] font-normal text-[#335577] mt-2.5 leading-relaxed line-clamp-3">
                            {item.description}
                          </p>
                        </div>

                        {/* List of Materials */}
                        <div className="mt-4 pt-3.5 border-t border-[#d2e5f5]">
                          <span className="text-[10px] font-bold tracking-[0.18em] text-[#52779a] uppercase block mb-2">
                            COMPOSED OF:
                          </span>
                          <div className="flex flex-wrap gap-1.5 items-center">
                            {item.materials.map((mat, i) => (
                              <span key={i} className="bg-white border border-[#b8ddf8] text-[#0077c2] font-semibold text-[10px] px-2.5 py-1 rounded-md uppercase tracking-wider whitespace-nowrap shadow-2xs">
                                {mat}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Action request */}
                        <div className="mt-5 pt-3.5 flex items-center justify-start border-t border-[#d2e5f5]">
                          <button
                            onClick={() => handleInquireWhatsApp(item.name, 'Blinds')}
                            className="bg-[#0099ff] hover:bg-[#0088ee] text-white px-4 py-2.5 sm:px-5 sm:py-2.5 text-[11px] sm:text-xs font-bold tracking-wider uppercase rounded-lg shadow-md shadow-[#0099ff]/20 flex items-center space-x-2 transition-all hover:scale-[1.02] cursor-pointer whitespace-nowrap flex-shrink-0"
                          >
                            <span>INQUIRE NOW</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            </motion.div>
          )}

          {/* 4. SIGNATURE COLLECTIONS VIEW */}
          {activePage === 'signature' && (
            <motion.div
              key="signature"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="bg-luxury-sec pt-12 -mb-16 relative z-10">
                <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
                  <BackToHomeButton onClick={() => setActivePage('home')} className="mb-0" />
                </div>
              </div>
              <div className="pt-0">
                <SignatureCollections openBookingModal={() => setBookingModalOpen(true)} />
                
                {/* Extra premium Lookbook catalog */}
                <div className="bg-luxury-sec py-20 border-b border-white/5">
                  <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
                    <div className="text-center mb-16">
                      <span className="font-sans text-[10px] font-bold tracking-[0.4em] text-gold uppercase block mb-2">LIMITED LAUNCHES</span>
                      <h2 className="font-serif text-3xl font-light">The Master Lookbook</h2>
                      <div className="mx-auto h-[1px] w-12 bg-gold mt-4" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {/* Lookbook 1 */}
                      <div className="group border border-white/10 bg-luxury-bg p-6 relative flex flex-col justify-between">
                        <div>
                          <div className="aspect-[4/5] overflow-hidden mb-6">
                            <img 
                              src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80" 
                              alt="Lookbook" 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <span className="font-sans text-[8px] tracking-[0.25em] text-gold uppercase font-bold">EDITION V / VOL I</span>
                          <h4 className="font-serif text-lg text-cream mt-2 mb-3">Architectural Drapery Geometry</h4>
                          <p className="font-sans text-xs font-light text-muted-text leading-relaxed">
                            A study of harsh sunlight manipulation in modern glass-fronted desert villas.
                          </p>
                        </div>
                        <button onClick={() => setBookingModalOpen(true)} className="mt-6 text-gold text-[10px] font-bold tracking-widest uppercase hover:text-white transition-colors text-left">
                          REQUEST HARDCOPY CATALOGUE ✦
                        </button>
                      </div>

                      {/* Lookbook 2 */}
                      <div className="group border border-white/10 bg-luxury-bg p-6 relative flex flex-col justify-between">
                        <div>
                          <div className="aspect-[4/5] overflow-hidden mb-6">
                            <img 
                              src="https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=800&q=80" 
                              alt="Lookbook" 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <span className="font-sans text-[8px] tracking-[0.25em] text-gold uppercase font-bold">EDITION V / VOL II</span>
                          <h4 className="font-serif text-lg text-cream mt-2 mb-3">Biophilic Wallcoverings</h4>
                          <p className="font-sans text-xs font-light text-muted-text leading-relaxed">
                            Integrating organic, non-reflective misty forest textures into private library halls.
                          </p>
                        </div>
                        <button onClick={() => setBookingModalOpen(true)} className="mt-6 text-gold text-[10px] font-bold tracking-widest uppercase hover:text-white transition-colors text-left">
                          REQUEST HARDCOPY CATALOGUE ✦
                        </button>
                      </div>

                      {/* Lookbook 3 */}
                      <div className="group border border-white/10 bg-luxury-bg p-6 relative flex flex-col justify-between">
                        <div>
                          <div className="aspect-[4/5] overflow-hidden mb-6">
                            <img 
                              src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80" 
                              alt="Lookbook" 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <span className="font-sans text-[8px] tracking-[0.25em] text-gold uppercase font-bold">EDITION V / VOL III</span>
                          <h4 className="font-serif text-lg text-cream mt-2 mb-3">Heavy Acoustic Velvet Damping</h4>
                          <p className="font-sans text-xs font-light text-muted-text leading-relaxed">
                            Calibrating internal acoustics inside private cinemas and grand grand-piano drawing halls.
                          </p>
                        </div>
                        <button onClick={() => setBookingModalOpen(true)} className="mt-6 text-gold text-[10px] font-bold tracking-widest uppercase hover:text-white transition-colors text-left">
                          REQUEST HARDCOPY CATALOGUE ✦
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* 6. ABOUT PAGE */}
          {activePage === 'about' && (
            <motion.div
              key="about"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="py-12 lg:py-20 bg-luxury-bg"
              id="about-page"
            >
              <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
                <BackToHomeButton onClick={() => setActivePage('home')} />
                
                {/* Main Hero Header */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-20">
                  <div className="lg:col-span-6">
                    <span className="font-sans text-[10px] font-bold tracking-[0.4em] text-gold uppercase block mb-3">ABOUT FLOATING DRAPES</span>
                    <h1 className="font-serif text-4xl sm:text-5xl font-light text-white leading-tight">
                      {siteConfig.aboutTitle}
                    </h1>
                    <div className="h-0.5 w-16 bg-gold my-6" />
                    <p className="font-sans text-xs font-light text-muted-text leading-relaxed mb-6">
                      {siteConfig.aboutText1}
                    </p>
                    <p className="font-sans text-xs font-light text-muted-text leading-relaxed">
                      {siteConfig.aboutText2}
                    </p>
                  </div>
                  
                  <div className="lg:col-span-6 aspect-square max-h-[500px] overflow-hidden relative border border-gold/15 luxury-border-glow">
                    <img
                      src="https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=1000&q=80"
                      alt="Floating Drapes Studio Artisan Workshop"
                      className="w-full h-full object-cover brightness-90 animate-subtle-zoom"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  </div>
                </div>

                {/* Grid stats cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-16 border-t border-b border-gold/15 my-20">
                  <div className="text-center">
                    <span className="font-serif text-4xl text-gold block mb-2">250+</span>
                    <span className="font-sans text-[10px] font-bold tracking-widest text-cream uppercase">Premium Villas Styled</span>
                    <p className="text-[11px] text-muted-text font-light mt-2 max-w-xs mx-auto">From coastal resorts to high-density penthouse suites in Bangalore and Beverly Hills.</p>
                  </div>
                  <div className="text-center border-t md:border-t-0 md:border-l md:border-r border-gold/10 py-6 md:py-0">
                    <span className="font-serif text-4xl text-gold block mb-2">10+ Years</span>
                    <span className="font-sans text-[10px] font-bold tracking-widest text-cream uppercase">Weaving Mastery</span>
                    <p className="text-[11px] text-muted-text font-light mt-2 max-w-xs mx-auto">Our lead tailors spent decades mastering French heavy-pleating and velvet alignment mechanics.</p>
                  </div>
                  <div className="text-center">
                    <span className="font-serif text-4xl text-gold block mb-2">Sub-0.5mm</span>
                    <span className="font-sans text-[10px] font-bold tracking-widest text-cream uppercase">Laser Calibration</span>
                    <p className="text-[11px] text-muted-text font-light mt-2 max-w-xs mx-auto">Every window cavity is mapped digitally in 3D before fabric layouts are finalized.</p>
                  </div>
                </div>

                {/* Frequently Asked Questions FAQ block */}
                <div className="bg-luxury-sec border border-gold/15 p-8 sm:p-12">
                  <div className="text-center mb-10">
                    <span className="font-sans text-[10px] tracking-[0.3em] text-gold uppercase block mb-2">INFORMATION DECK</span>
                    <h3 className="font-serif text-2xl text-white">Client Questions & Protocols</h3>
                    <div className="mx-auto h-[1px] w-12 bg-gold mt-3" />
                  </div>

                  <div className="space-y-4 max-w-3xl mx-auto" id="faq-accordions">
                    {[
                      {
                        q: "What is your consultation protocol?",
                        a: "Our stylist brings full catalog binders and fabric swatches directly to your residence. We scan your window cavities using laser telemetry and sketch draping styles in real-time, free of any charge."
                      },
                      {
                        q: "Do you offer motorized drapery controls?",
                        a: "Yes. Every curtain we tailors is compatible with Lutron, Somfy, and Glydea motors, interfacing seamlessly with smart hubs like Apple HomeKit, Alexa, or Crestron home processors."
                      },
                      {
                        q: "How long does fabrication take?",
                        a: "Custom fabric weaving and laser-measured sewing takes approximately 14 to 21 business days in our flagship studio. Standard installation takes only a single morning depending on room volume."
                      },
                      {
                        q: "Is your wallpaper moisture-sealed?",
                        a: "Yes. Our Classic, Botanical, and Modern paper collections are backed by organic breathable fibers and treated with satin surface sealants to resist humidity discoloration, perfect for living spaces."
                      }
                    ].map((faq, idx) => {
                      const isOpen = activeFaq === idx;
                      return (
                        <div key={idx} className="border-b border-gold/10 pb-4" id={`faq-${idx}`}>
                          <button
                            onClick={() => setActiveFaq(isOpen ? null : idx)}
                            className="w-full flex justify-between items-center py-3 text-left font-serif text-sm font-medium text-cream hover:text-gold transition-colors focus:outline-none"
                          >
                            <span>{faq.q}</span>
                            <span className="text-gold text-lg">{isOpen ? '−' : '+'}</span>
                          </button>
                          <AnimatePresence>
                            {isOpen && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                              >
                                <p className="font-sans text-xs font-light text-muted-text leading-relaxed pt-2 pb-1">
                                  {faq.a}
                                </p>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* 7. CONTACT PAGE */}
          {activePage === 'contact' && (
            <motion.div
              key="contact"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="bg-luxury-bg pt-12">
                <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
                  <BackToHomeButton onClick={() => setActivePage('home')} className="mb-0" />
                </div>
              </div>
              {/* Reuse of contact form component */}
              <ContactForm />

              {/* Dynamic Flagship Studio details & Custom map mock */}
              <div className="bg-luxury-sec py-16 border-t border-b border-gold/15" id="flagship-map-section">
                <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div>
                      <span className="font-sans text-[10px] tracking-[0.3em] text-gold uppercase block mb-2">FLAGSHIP DESIGN SALON</span>
                      <h3 className="font-serif text-2xl text-white mb-6">Coordinate Your Studio Walk-In</h3>
                      <p className="font-sans text-xs font-light text-muted-text leading-relaxed mb-6">
                        Walk-ins are welcomed, but we recommend securing a reserved time block so that a Senior Textile Consultant can be fully dedicated to your floorplans and structural materials brief.
                      </p>

                      <div className="space-y-4 text-xs font-light text-muted-text">
                        <p><strong>Flagship Hour:</strong> Mon - Sat: 10am - 8pm | Sun: By Private Reserved Request Only</p>
                        <p><strong>Studio Address:</strong> 712, Niladhri Main Road, Begur Hobli, Chikkathoguru, Bengaluru, Karnataka 560100</p>
                        <p><strong>Valet Parking:</strong> Complimentary secure basement valet provided on-site.</p>
                      </div>

                      <button
                        onClick={() => setBookingModalOpen(true)}
                        className="bg-gold hover:bg-gold-soft text-luxury-bg px-8 py-3.5 text-xs font-bold tracking-widest uppercase transition-colors mt-8"
                      >
                        RESERVE TIME SLOT
                      </button>
                    </div>

                    {/* Styled Map Container */}
                    <div className="relative aspect-video bg-luxury-bg border border-gold/20 overflow-hidden flex flex-col justify-center items-center p-8 text-center select-none luxury-border-glow">
                      {/* Grid overlay to look like drafting blueprint map */}
                      <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-repeat" style={{ backgroundImage: "linear-gradient(rgba(200,165,106,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(200,165,106,0.3) 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
                      
                      <div className="relative z-10">
                        <span className="text-gold text-2xl">🗺</span>
                        <h4 className="font-serif text-lg text-cream mt-3 mb-2">Bengaluru Experience Studio</h4>
                        <p className="font-sans text-[11px] text-muted-text max-w-xs mx-auto leading-normal">
                          712, Niladhri Main Road, Begur Hobli, Chikkathoguru, Bengaluru, Karnataka 560100
                        </p>
                        
                        <div className="mt-4 inline-flex items-center space-x-2 text-[10px] text-gold tracking-widest uppercase font-bold">
                          <span>VIEW INTERACTIVE GPS ROUTING</span>
                          <ArrowRight className="h-3 w-3" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* WHATSAPP BUTTON (Floating) */}
      <WhatsAppButton />

      {/* FLOATING BACK TO HOME BUTTON */}
      {activePage !== 'home' && (
        <BackToHomeButton onClick={() => setActivePage('home')} variant="floating" />
      )}

      {/* BOOKING CONSULTATION MODAL */}
      <BookingModal 
        isOpen={bookingModalOpen} 
        onClose={() => setBookingModalOpen(false)} 
      />

      {/* FULL PRODUCT IMAGE POP-UP LIGHTBOX */}
      <ProductImageModal 
        isOpen={Boolean(selectedProductPreview.product)}
        onClose={handleCloseProductPreview}
        product={selectedProductPreview.product}
        productsList={selectedProductPreview.productsList}
        categoryName={selectedProductPreview.categoryName}
        onSelectProduct={(p) => setSelectedProductPreview(prev => ({ ...prev, product: p }))}
        onInquire={handleInquireWhatsApp}
      />

      {/* GLOBAL FOOTER */}
      <Footer 
        setActivePage={setActivePage} 
        openBookingModal={() => setBookingModalOpen(true)} 
        brandLogoUrl={siteConfig.brandLogoUrl}
        openAdminPanel={() => setAdminPanelOpen(true)}
      />

      {/* THEME STYLE DYNAMIC INJECTOR */}
      <ThemeInjector config={siteConfig} />

      {/* MASTER SYSTEM ADMIN CONTROL PANEL */}
      <AdminPanel 
        isOpen={adminPanelOpen}
        onClose={() => setAdminPanelOpen(false)}
        siteConfig={siteConfig}
        onUpdateConfig={handleUpdateConfig}
        curtains={curtains}
        setCurtains={setCurtains}
        wallpapers={wallpapers}
        setWallpapers={setWallpapers}
        blinds={blinds}
        setBlinds={setBlinds}
        testimonials={testimonials}
        setTestimonials={setTestimonials}
      />

    </div>
  );
}
