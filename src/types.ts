export interface CurtainItem {
  id: string;
  name: string;
  description: string;
  image: string;
  priceClass: 'Premium' | 'Signature' | 'Reserve';
  materials: string[];
}

export interface WallpaperItem {
  id: string;
  name: string;
  description: string;
  image: string;
  style: 'Classic' | 'Botanical' | 'Textured' | 'Modern';
  materials: string[];
}

export interface SignatureCollection {
  id: string;
  name: string;
  category: string;
  description: string;
  image: string;
  overlayColor: string; // Tailwind tint/overlay class
  themeColor: string; // hex or text color
}

export interface PortfolioItem {
  id: string;
  category?: 'Living Room' | 'Bedroom' | 'Dining Room' | 'Kids Room' | string;
  title: string;
  description: string;
  beforeImage: string;
  afterImage: string;
}

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  role?: string;
  review: string;
  rating: number;
  image?: string;
}

export type CustomerFeedback = Testimonial;

export interface BookingSubmission {
  id: string;
  name: string;
  phone: string;
  email?: string;
  preferredDate?: string;
  projectType: string;
  budget?: string;
  location?: string;
  message?: string;
  timestamp: string;
}

export interface UploadedImage {
  id: string;
  filename: string;
  file_url: string;
  storage_path?: string;
  category?: 'curtains' | 'wallpapers' | 'blinds' | 'hero' | 'gallery' | 'general' | 'why_choose_us' | 'customization' | 'portfolio' | 'transformations';
  size_bytes?: number;
  mime_type?: string;
  title?: string;
  base64_data?: string;
  created_at: string;
}

// PREMIUM CURATED DATASETS
export const CURTAINS_DATA: CurtainItem[] = [
  {
    id: 'c1',
    name: 'Royal Velvet Pleats',
    description: 'Double-pleated French velvet drapes offering supreme sound isolation and an unparalleled heavy drape aesthetic.',
    image: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=1200&q=80',
    priceClass: 'Reserve',
    materials: ['Belgian Velvet', 'Thermal Sateen Lining', 'Gold Heavyweight Grommets']
  },
  {
    id: 'c2',
    name: 'Belgian Pure Linen',
    description: 'Subtly textured, organic linen that filters harsh light into a serene, ambient glow. Ideal for minimalist architecture.',
    image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80',
    priceClass: 'Signature',
    materials: ['Flax Linen', 'Organic Cotton Mesh', 'Invisible Soft Sinker']
  },
  {
    id: 'c3',
    name: 'Embossed Silk Brocade',
    description: 'Intricately hand-woven metallic jacquard detailing that reflects ambient light, creating a shimmering architectural border.',
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80',
    priceClass: 'Reserve',
    materials: ['Mulberry Silk', 'Metallic Thread', 'Blackout Satin Lining']
  },
  {
    id: 'c4',
    name: 'Whisper-Sheer Organza',
    description: 'Ethereal, flowing panels that dance with the slightest breeze. Perfect for layering beneath heavy velvet drapes.',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
    priceClass: 'Premium',
    materials: ['Italian Organza', 'Ethereal Matte Voile']
  }
];

export const WALLPAPERS_DATA: WallpaperItem[] = [
  {
    id: 'w1',
    name: 'Imperial Damascus Brocade',
    description: 'Embossed fabric wallpaper featuring classical Victorian patterns with a tactile matte finish and golden undertones.',
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
    style: 'Classic',
    materials: ['Tactile Embossed Vinyl', 'Satin-Weft Yarn']
  },
  {
    id: 'w2',
    name: 'Art Deco Gilded Geometrics',
    description: 'Bold architectural linework screen-printed with genuine brass leaf pigments for a high-contrast reflective feature wall.',
    image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80',
    style: 'Modern',
    materials: ['Foil Gilded Base', 'Velvet-Flocked Inlay']
  },
  {
    id: 'w3',
    name: 'Biophilic Forest Oasis',
    description: 'Hand-painted watercolour mural depicting a misty, emerald forest canopy. Evokes natural serenity in private study halls.',
    image: 'https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=1200&q=80',
    style: 'Botanical',
    materials: ['Breathable Non-Woven Paper', 'Eco-Parchment Inks']
  },
  {
    id: 'w4',
    name: 'Monolithic Slate Texture',
    description: 'Tactile stone-replica wallcoverings that introduce raw brutalist textures with a surprisingly warm and cozy ambient touch.',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
    style: 'Textured',
    materials: ['Micro-Cement Powder Layer', 'Acoustic Backing']
  }
];

export const SIGNATURE_COLLECTIONS: SignatureCollection[] = [
  {
    id: 's1',
    name: 'Luxe Drapes',
    category: 'Curtains',
    description: 'Exquisite deep velvet and brocade curtains with luxurious deep burgundy tones, designed for grand reception halls.',
    image: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=1200&q=80',
    overlayColor: 'from-amber-950/40 via-red-950/70 to-black/95',
    themeColor: '#7f1d1d'
  },
  {
    id: 's2',
    name: "Nature's Canvas",
    category: 'Wallpapers',
    description: 'Bespoke biophilic wallcoverings and natural fiber window drapes dressed in rich forest green and moss tones.',
    image: 'https://images.unsplash.com/photo-1617806118233-18e1db207faf?auto=format&fit=crop&w=1200&q=80',
    overlayColor: 'from-stone-900/40 via-emerald-950/70 to-black/95',
    themeColor: '#064e3b'
  },
  {
    id: 's3',
    name: 'Modern Muse',
    category: 'Styling',
    description: 'Flawless warm grey textures, micro-linens, and brushed metal rod arrays designed to suit contemporary penthouse villas.',
    image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80',
    overlayColor: 'from-zinc-900/40 via-stone-900/70 to-black/95',
    themeColor: '#292524'
  },
  {
    id: 's4',
    name: 'Royal Texture',
    category: 'Wallpapers',
    description: 'Stately dark navy and embossed indigo fabric wall structures reminiscent of luxury coastal estates.',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
    overlayColor: 'from-slate-900/40 via-blue-950/70 to-black/95',
    themeColor: '#172554'
  },
  {
    id: 's5',
    name: 'Minimal Chic',
    category: 'Curtains',
    description: 'Whisper-quiet cream tones, organic flax linen, and custom warm brass rails to instill structural zen.',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    overlayColor: 'from-amber-900/20 via-orange-950/50 to-black/95',
    themeColor: '#451a03'
  }
];

export const PORTFOLIO_DATA: PortfolioItem[] = [
  {
    id: 'p1',
    category: 'Living Room',
    title: 'Modern Living Room Makeover',
    description: 'Replaced outdated window drapes with custom luxury navy silk curtains, instantly elevating the room’s visual weight.',
    beforeImage: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=600&q=80',
    afterImage: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'p2',
    category: 'Bedroom',
    title: 'Exquisite Master Bedroom',
    description: 'Upgraded plain walls with custom-textured wallpaper and layered blackout curtains to maximize luxury and sleep comfort.',
    beforeImage: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=600&q=80',
    afterImage: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'p3',
    category: 'Dining Room',
    title: 'Grand Dining Room Styling',
    description: 'Integrated premium biophilic drapes paired with bespoke blinds to harness natural light control beautifully.',
    beforeImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80',
    afterImage: 'https://images.unsplash.com/photo-1617806118233-18e1db207faf?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'p4',
    category: 'Kids Room',
    title: 'Sunlit Villa Lounge',
    description: 'Transformed harsh direct sunlight into a soft ambient glow using custom sheer linen drapes with motorized tracking.',
    beforeImage: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=600&q=80',
    afterImage: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'p5',
    category: 'Living Room',
    title: 'Bespoke Royal Penthouse',
    description: 'Elevated a high-ceiling living space with floor-to-ceiling pleated velvet curtains and gold accent wall coverings.',
    beforeImage: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=600&q=80',
    afterImage: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'p6',
    category: 'Bedroom',
    title: 'Executive Office Suite',
    description: 'Replaced basic industrial blinds with rich acoustic textured drapes for refined corporate elegance and sound damping.',
    beforeImage: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=600&q=80',
    afterImage: 'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?auto=format&fit=crop&w=600&q=80'
  }
];

export const TESTIMONIALS_DATA: Testimonial[] = [
  {
    id: 't1',
    name: 'Priya S.',
    location: 'Bengaluru',
    role: 'Home Owner',
    review: 'Floating Drapes completely transformed our home. The quality, service and attention to detail were exceptional. The velvet curtains drape with effortless elegance.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 't2',
    name: 'Karthik R.',
    location: 'Bengaluru',
    role: 'Principal Architect',
    review: 'Excellent collection and very professional team. They helped us choose the perfect textures and patterns. The motorized blinds work like a dream.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 't3',
    name: 'Anita M.',
    location: 'Bengaluru',
    role: 'Interior Enthusiast',
    review: 'From measurement to installation, everything was smooth and hassle-free. The wallpaper finish is seamless. Highly recommended!',
    rating: 5,
    image: ''
  },
  {
    id: 't4',
    name: 'David Chen',
    location: 'Bengaluru',
    role: 'Design Consultant',
    review: 'The craftsmanship and fabric weight exceeded all expectations. Their concierge team walked us through every sheer swatch patiently.',
    rating: 5,
    image: ''
  }
];

export interface ShowcaseProductItem {
  title: string;
  badge: string;
  description: string;
  buttonText: string;
  thumbnail: string;
}

export interface SiteConfig {
  heroLabel: string;
  heroHeadline1: string;
  heroHeadlineItalic: string;
  heroHeadline2: string;
  heroSub1: string;
  heroSub2: string;
  heroDesc: string;
  heroImageUrl?: string;
  aboutTitle: string;
  aboutText1: string;
  aboutText2: string;
  aboutExperience: string;
  themePreset: 'sapphire' | 'amber' | 'emerald' | 'crimson' | 'obsidian';
  fontPreset: 'jakarta_playfair' | 'inter_cinzel' | 'outfit_bodoni';
  brandLogoUrl: string;

  // 3 Products Showcase ("Elegance In Every Detail") Section
  showcaseSectionTitle?: string;
  showcaseSectionSubtitle?: string;
  categoryShowcase?: {
    curtains: ShowcaseProductItem;
    wallpapers: ShowcaseProductItem;
    blinds: ShowcaseProductItem;
  };

  // Backward-compat fallback
  categoryImages?: {
    curtains?: string;
    wallpapers?: string;
    blinds?: string;
  };

  // Tailor-Made Customization Section Images and Strings
  customizationSectionTitle?: string;
  customizationSectionSubtitle?: string;
  customizationCurtainsTitle?: string;
  customizationCurtainsDesc?: string;
  customizationCurtainsImage?: string;
  customizationWallpaperTitle?: string;
  customizationWallpaperDesc?: string;
  customizationWallpaperImage?: string;

  // Why Choose Us Section
  whyChooseUsImageUrl?: string;
  whyChooseUsTitle?: string;
  whyChooseUsSubtitle?: string;
  whyChooseUsDesc?: string;

  // Testimonials Section Header Controls
  testimonialsSectionTitle?: string;
  testimonialsSectionSubtitle?: string;

  // Before & After Transformation Section Controls
  beforeAfterTitle?: string;
  beforeAfterSubtitle?: string;
  portfolioData?: PortfolioItem[];
}

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  heroLabel: 'PREMIUM CURTAINS, WALLPAPERS & BLINDS',
  heroHeadline1: 'Transforming Your',
  heroHeadlineItalic: 'Vision',
  heroHeadline2: 'Into Beautiful Living Spaces',
  heroSub1: 'Your Vision. Our Craftsmanship.',
  heroSub2: 'Perfectly Delivered.',
  heroDesc: 'We help homeowners and businesses elevate their interiors with premium curtains, wallpapers, and blinds that perfectly blend style, comfort, and functionality. Come with a vision. Leave with complete satisfaction.',
  heroImageUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80',
  aboutTitle: 'YOUR COMPANION IN ARTFUL FITTINGS',
  aboutText1: 'At Floating Drapes, we believe every space tells a story. With over 12 years of expertise in interior furnishing solutions, we help our clients create elegant and personalized spaces through carefully selected curtains, wallpapers, and blinds.',
  aboutText2: 'Our team of experienced design consultants and skilled installation artisans work in perfect harmony to deliver a seamless, stress-free transformation. From residential estates to commercial showrooms, we bring absolute precision and premium design.',
  aboutExperience: '12+',
  themePreset: 'sapphire',
  fontPreset: 'jakarta_playfair',
  brandLogoUrl: '/logo.svg',

  showcaseSectionTitle: 'Elegance In Every Detail',
  showcaseSectionSubtitle: 'OUR PRODUCTS',
  categoryShowcase: {
    curtains: {
      title: 'Curtains',
      badge: '1000+',
      description: 'Premium quality fabrics in a wide range of colors, textures & patterns.',
      buttonText: 'Explore Curtains',
      thumbnail: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=600&q=80',
    },
    wallpapers: {
      title: 'Wallpapers',
      badge: '1500+',
      description: 'From modern textures to timeless patterns, find the perfect match.',
      buttonText: 'Explore Wallpapers',
      thumbnail: 'https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=600&q=80',
    },
    blinds: {
      title: 'Blinds',
      badge: '600+',
      description: 'Stylish & functional blinds for light control and privacy.',
      buttonText: 'Explore Blinds',
      thumbnail: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80',
    },
  },
  categoryImages: {
    curtains: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=600&q=80',
    wallpapers: 'https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=600&q=80',
    blinds: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80',
  },

  customizationSectionTitle: 'Tailor-Made Customization',
  customizationSectionSubtitle: 'BESPOKE STYLING',
  customizationCurtainsTitle: 'Design Your Own Curtains',
  customizationCurtainsDesc: 'Customize your curtains with your favorite fabric, color & style. Get precision fit.',
  customizationCurtainsImage: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=600&q=80',
  customizationWallpaperTitle: 'Design Your Own Wallpaper',
  customizationWallpaperDesc: 'Create unique wallpaper designs that reflect your personality and style perfectly.',
  customizationWallpaperImage: 'https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=600&q=80',

  whyChooseUsImageUrl: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=800&q=80',
  whyChooseUsSubtitle: 'WHY CHOOSE US',
  whyChooseUsTitle: 'Quality, Service & Satisfaction You Can Trust',
  whyChooseUsDesc: 'At Floating Drapes, we are dedicated to bringing your design dreams to fruition. With premium fabrics, exquisite craftsmanship, and our highly customized approach, we ensure that every client experiences absolute comfort and class.',

  testimonialsSectionTitle: 'What Our Clients Say',
  testimonialsSectionSubtitle: 'CLIENT FEEDBACK',

  beforeAfterTitle: 'See The Transformation',
  beforeAfterSubtitle: 'BEFORE & AFTER',
  portfolioData: PORTFOLIO_DATA
};
