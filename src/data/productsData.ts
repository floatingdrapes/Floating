import { CurtainItem, WallpaperItem } from '../types';

export interface BlindItem {
  id: string;
  name: string;
  description: string;
  image: string;
  style: 'Roman' | 'Roller' | 'Venetian' | 'Motorized' | 'Zebra';
  materials: string[];
}

export const EXTENDED_CURTAINS_DATA: CurtainItem[] = [
  {
    id: 'c1',
    name: 'Royal Velvet Pleats',
    description: 'Double-pleated French velvet drapes offering supreme sound isolation and an unparalleled heavy drape aesthetic.',
    image: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=600&q=80',
    priceClass: 'Reserve',
    materials: ['Belgian Velvet', 'Thermal Sateen Lining', 'Gold Heavyweight Grommets']
  },
  {
    id: 'c2',
    name: 'Belgian Pure Linen',
    description: 'Subtly textured, organic linen that filters harsh light into a serene, ambient glow. Ideal for minimalist architecture.',
    image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=600&q=80',
    priceClass: 'Signature',
    materials: ['Flax Linen', 'Organic Cotton Mesh', 'Invisible Soft Sinker']
  },
  {
    id: 'c3',
    name: 'Embossed Silk Brocade',
    description: 'Intricately hand-woven metallic jacquard detailing that reflects ambient light, creating a shimmering architectural border.',
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80',
    priceClass: 'Reserve',
    materials: ['Mulberry Silk', 'Metallic Thread', 'Blackout Satin Lining']
  },
  {
    id: 'c4',
    name: 'Whisper-Sheer Organza',
    description: 'Ethereal, flowing panels that dance with the slightest breeze. Perfect for layering beneath heavy velvet drapes.',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80',
    priceClass: 'Premium',
    materials: ['Italian Organza', 'Ethereal Matte Voile']
  },
  {
    id: 'c5',
    name: 'Monarch Damask Weave',
    description: 'Stately and dense damask weave incorporating royal gold threads that capture ambient light with stately elegance.',
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80',
    priceClass: 'Reserve',
    materials: ['Premium Damask Silk', 'Satin Backing', 'Brass Eyelets']
  },
  {
    id: 'c6',
    name: 'Tuscan Linen Sheer',
    description: 'Bespoke open-weave linen panels handcrafted in Florence, letting in soft natural light while preserving private outlines.',
    image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=600&q=80',
    priceClass: 'Premium',
    materials: ['Florentine Flax', 'Organic Cotton Blend']
  },
  {
    id: 'c7',
    name: 'Classic Herringbone Wool',
    description: 'Heavy architectural wool drapes woven in traditional herringbone layouts, providing elite warmth and cold isolation.',
    image: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=600&q=80',
    priceClass: 'Signature',
    materials: ['Pure Merino Wool', 'Heavy Interlining', 'Satin-Backing']
  },
  {
    id: 'c8',
    name: 'Minimalist Sand Crepe',
    description: 'Understated sandy-toned crepe fabric curtains that cascade down gracefully, leaving smooth non-crease folds.',
    image: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=600&q=80',
    priceClass: 'Premium',
    materials: ['Sand Crepe Yarn', 'Micro-Sateen Underlay']
  },
  {
    id: 'c9',
    name: 'Imperial Crimson Sateen',
    description: 'A deep crimson sateen weave that falls with heavy majesty, designed to grace high-ceiling reception rooms.',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=600&q=80',
    priceClass: 'Reserve',
    materials: ['Rich Imperial Silk', 'Burgundy Velvet Trim', 'Sound-proofing lining']
  },
  {
    id: 'c10',
    name: 'Nordic Snow Velvet',
    description: 'Pure, crisp white velvet curtains that combine pristine architectural clean lines with a soft, cozy luxury look.',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
    priceClass: 'Signature',
    materials: ['Snow Cotton Velvet', 'Lustron Blackout Panel']
  },
  {
    id: 'c11',
    name: 'Sage Meadow Linen',
    description: 'A soft, sage-green open-weave drapery that matches organic wooden frames and biophilic interior setups.',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80',
    priceClass: 'Premium',
    materials: ['Organic Sage Flax', 'Soft Hemp Threads']
  },
  {
    id: 'c12',
    name: 'Acoustic Theatre Drape',
    description: 'Extra-weight theater-grade curtains designed to completely absorb mid-to-high frequency decibels with majestic grace.',
    image: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=600&q=80',
    priceClass: 'Reserve',
    materials: ['Heavy-Gauge Velour', 'Triple Acoustic Layers', 'Weighted Floor Hem']
  },
  {
    id: 'c13',
    name: 'Verona Silk Sheer',
    description: 'Ultra-thin shimmering silk voile panels designed to float dreamily, casting ambient shadows across the lounge.',
    image: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=600&q=80',
    priceClass: 'Premium',
    materials: ['Veronese Voile', 'Raw Organza Silk']
  },
  {
    id: 'c14',
    name: 'Gilded Brocade Trim',
    description: 'Luxurious heavy sateen curtains bordered with hand-embroidered golden scrolls, bringing old-world charm to bedrooms.',
    image: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=600&q=80',
    priceClass: 'Reserve',
    materials: ['Gilded Silk Thread', 'Belgian Sateen Base', 'Tassel Fringe']
  },
  {
    id: 'c15',
    name: 'Warm Ochre Weave',
    description: 'Earth-toned warm ochre curtains that introduce comfortable, welcoming energy to contemporary family spaces.',
    image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=600&q=80',
    priceClass: 'Premium',
    materials: ['Coarse Linen', 'Ochre Cotton Blend']
  },
  {
    id: 'c16',
    name: 'Venetian Gold Damask',
    description: 'An elite, heavy curtain material weaving golden floral motifs over a rich ivory canvas for unmatched classical style.',
    image: 'https://images.unsplash.com/photo-1585412727339-54e4bae3bbf9?auto=format&fit=crop&w=600&q=80',
    priceClass: 'Reserve',
    materials: ['Venetian Silk', 'Metallic Brocade Trim', 'Gold Plated Rings']
  },
  {
    id: 'c17',
    name: 'Graphite Luxury Blockout',
    description: 'A sleek, professional graphite-grey double-sided curtain that blocks 100% of morning light, perfect for bedrooms.',
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=600&q=80',
    priceClass: 'Signature',
    materials: ['Triple-Weave Polyester', 'Black Carbon Inner Layer']
  },
  {
    id: 'c18',
    name: 'Elysian Pearl Satin',
    description: 'Pristine pearl-white satin curtains that shimmer elegantly under dim lighting, bringing high-end hotel vibes home.',
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
    priceClass: 'Signature',
    materials: ['Polished Satin Silk', 'Elysian Soft Lining']
  },
  {
    id: 'c19',
    name: 'Dusk Bronze Velvet',
    description: 'A deep metallic bronze-brown velvet curtain that gives cozy warmth and blocks intense southern sun reflections.',
    image: 'https://images.unsplash.com/photo-1578894381163-e72c17f2d45f?auto=format&fit=crop&w=600&q=80',
    priceClass: 'Reserve',
    materials: ['Italian Mohair Velvet', 'Thermal Heat Shield Liner']
  },
  {
    id: 'c20',
    name: 'Coastal Mist Linen',
    description: 'Light, breezy mist-blue linen drapes that billow gently, giving beachfront estates a clean, maritime atmosphere.',
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80',
    priceClass: 'Signature',
    materials: ['Flemish Blue Flax', 'Air-Spun Soft Cotton']
  }
];

export const EXTENDED_WALLPAPERS_DATA: WallpaperItem[] = [
  {
    id: 'w1',
    name: 'Imperial Damascus Brocade',
    description: 'Embossed fabric wallpaper featuring classical Victorian patterns with a tactile matte finish and golden undertones.',
    image: 'https://images.unsplash.com/photo-1526245989434-d022fc5730dd?auto=format&fit=crop&w=600&q=80',
    style: 'Classic',
    materials: ['Tactile Embossed Vinyl', 'Satin-Weft Yarn']
  },
  {
    id: 'w2',
    name: 'Art Deco Gilded Geometrics',
    description: 'Bold architectural linework screen-printed with genuine brass leaf pigments for a high-contrast reflective feature wall.',
    image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=600&q=80',
    style: 'Modern',
    materials: ['Foil Gilded Base', 'Velvet-Flocked Inlay']
  },
  {
    id: 'w3',
    name: 'Biophilic Forest Oasis',
    description: 'Hand-painted watercolour mural depicting a misty, emerald forest canopy. Evokes natural serenity in private study halls.',
    image: 'https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=600&q=80',
    style: 'Botanical',
    materials: ['Breathable Non-Woven Paper', 'Eco-Parchment Inks']
  },
  {
    id: 'w4',
    name: 'Monolithic Slate Texture',
    description: 'Tactile stone-replica wallcoverings that introduce raw brutalist textures with a surprisingly warm and cozy ambient touch.',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=600&q=80',
    style: 'Textured',
    materials: ['Micro-Cement Powder Layer', 'Acoustic Backing']
  },
  {
    id: 'w5',
    name: 'Tapestry Gilded Scroll',
    description: 'Stately gold motifs repeated over a deep navy canvas, creating a breathtaking, regal atmosphere in classic dining rooms.',
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80',
    style: 'Classic',
    materials: ['Gilded Leaf Stamp', 'Textured Heavy Pulp']
  },
  {
    id: 'w6',
    name: 'Sylvan Fern Canopy',
    description: 'Lush wild fern silhouettes overlapping across a soft cream backdrop. Designed to inspire biophilic, natural calm.',
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80',
    style: 'Botanical',
    materials: ['Recycled Spruce Pulp', 'Organic Vegetable Inks']
  },
  {
    id: 'w7',
    name: 'Minimal Grid Lines',
    description: 'Clean, thin graphite linework crossing perfectly over a pearl-white textured background. For premium contemporary offices.',
    image: 'https://images.unsplash.com/photo-1617806118233-18e1db207faf?auto=format&fit=crop&w=600&q=80',
    style: 'Modern',
    materials: ['Mineral-Infused Fiber', 'Ultra-Fine Embossing']
  },
  {
    id: 'w8',
    name: 'Desert Dunes Plaster',
    description: 'Deeply textured plaster-like wallpaper with undulating waves that shift visually as light angles move throughout the day.',
    image: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=600&q=80',
    style: 'Textured',
    materials: ['Mineral Plaster Layer', 'Breathable Backing']
  },
  {
    id: 'w9',
    name: 'Versailles Fleur-de-Lis',
    description: 'The definitive royal French motif embossed with real platinum leaf onto a stately, soft grey canvas background.',
    image: 'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=600&q=80',
    style: 'Classic',
    materials: ['Platinum Foil Stamp', 'Heavy Non-Woven Textile']
  },
  {
    id: 'w10',
    name: 'Lotus Zen Watercolor',
    description: 'Graceful, bleeding watercolor paintings of floating lotus leaves that bring peaceful, spiritual zen into bathrooms.',
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=600&q=80',
    style: 'Botanical',
    materials: ['Moisture-Resistant Canvas', 'Pigmented Water-Based Inks']
  },
  {
    id: 'w11',
    name: 'Stardust Abstract Foil',
    description: 'Sprinkled gold-foil stars floating on deep space-blue textured sheets, perfect for feature walls and kids bedroom skies.',
    image: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=600&q=80',
    style: 'Modern',
    materials: ['Metallic Micro-Flakes', 'Deep Dye Canvas']
  },
  {
    id: 'w12',
    name: 'Sisal Wave Weave',
    description: 'Hand-woven natural sisal fibers arranged in subtle waves, offering rich visual depth and high acoustic damping properties.',
    image: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?auto=format&fit=crop&w=600&q=80',
    style: 'Textured',
    materials: ['100% Organic Sisal', 'Natural Backing Canvas']
  },
  {
    id: 'w13',
    name: 'Victorian Rose Garden',
    description: 'Intricately illustrated vintage English rose patterns that bring timeless, romantic country charm to cozy spaces.',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80',
    style: 'Classic',
    materials: ['Heavy-weight Matte Pulp', 'Resilient Finish Coating']
  },
  {
    id: 'w14',
    name: 'Monstera Jungle Canopy',
    description: 'Bold, deep-green Monstera leaf prints that cover walls with immersive jungle foliage, ideal for creative modern spaces.',
    image: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=600&q=80',
    style: 'Botanical',
    materials: ['Washable Matte Vinyl', 'Vibrant UV-Safe Inks']
  },
  {
    id: 'w15',
    name: 'Retro Brass Arcs',
    description: 'Repeating mid-century circular arcs printed in shimmering metallic bronze over a charcoal gray paper surface.',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    style: 'Modern',
    materials: ['Metallic Bronze Overlay', 'Fibers-blend Pulp']
  },
  {
    id: 'w16',
    name: 'Rough Raw Concrete',
    description: 'An incredibly realistic concrete texture wallpaper that mimics distressed, industrial raw concrete blocks perfectly.',
    image: 'https://images.unsplash.com/photo-1501183007986-d0d080b147f9?auto=format&fit=crop&w=600&q=80',
    style: 'Textured',
    materials: ['Acoustic Foam Core', 'Textured Vinyl Emboss']
  },
  {
    id: 'w17',
    name: 'Gilded Cranes Mural',
    description: 'Traditional East Asian hand-painted white cranes flying through golden clouds. Perfect for regal bed headboards.',
    image: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=600&q=80',
    style: 'Classic',
    materials: ['Mulberry Silk Paper backing', 'Rich Pearl Powder Pigment']
  },
  {
    id: 'w18',
    name: 'Eucalyptus Whispers',
    description: 'A light and calming botanical pattern featuring delicate sage-green eucalyptus leaves painted in soft watercolors.',
    image: 'https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?auto=format&fit=crop&w=600&q=80',
    style: 'Botanical',
    materials: ['Eco-Parchment Base', 'Non-Toxic Watercolor Inks']
  },
  {
    id: 'w19',
    name: 'Linear Brushed Copper',
    description: 'A beautiful modern wallpaper reflecting warm coppery light, adding deep comfort and high-end elegance to modern rooms.',
    image: 'https://images.unsplash.com/photo-1627163430591-16309852f82c?auto=format&fit=crop&w=600&q=80',
    style: 'Modern',
    materials: ['Brushed Copper Foil', 'Mineral Fibers Weave']
  },
  {
    id: 'w20',
    name: 'Heavy Tweed Fiber',
    description: 'Tactile woven-tweed fabric wallcoverings that insulate heat and noise, presenting soft woolen elegance in libraries.',
    image: 'https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=600&q=80',
    style: 'Textured',
    materials: ['Wool Tweed Blends', 'Acoustic Sound Barrier Lining']
  }
];

export const EXTENDED_BLINDS_DATA: BlindItem[] = [
  {
    id: 'b1',
    name: 'Signature Bamboo Roman',
    description: 'Hand-woven natural bamboo slats that stack into soft horizontal folds, introducing a cozy, organic feel.',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80',
    style: 'Roman',
    materials: ['100% Organic Bamboo', 'Polished Jute Cord']
  },
  {
    id: 'b2',
    name: 'Bespoke Walnut Venetian',
    description: 'Premium North American walnut wood slats finished with deep bronze accents for timeless, classy study halls.',
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80',
    style: 'Venetian',
    materials: ['Premium Walnut Wood', 'Braided Cotton Ladder Tape']
  },
  {
    id: 'b3',
    name: 'Minimal Charcoal Roller',
    description: 'Sleek, black-out roller shades designed with clean lines to block glare perfectly and isolate modern offices.',
    image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=600&q=80',
    style: 'Roller',
    materials: ['Blackout Poly-Vinyl', 'Sleek Aluminum Bottom Bar']
  },
  {
    id: 'b4',
    name: 'Whisper Smart Motorized',
    description: 'Ultra-quiet Lutron motorized roller blinds operated via mobile app, schedules, or voice control integrations.',
    image: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=600&q=80',
    style: 'Motorized',
    materials: ['Lutron Silent Drive', 'Solar-reflective Fabric']
  },
  {
    id: 'b5',
    name: 'Dual Shade Zebra Blinds',
    description: 'Overlapping clear sheer and solid privacy fabric bands that offer dynamic control over light levels effortlessly.',
    image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=600&q=80',
    style: 'Zebra',
    materials: ['Alternating sheer bands', 'UV-Stable Woven Polyester']
  },
  {
    id: 'b6',
    name: 'Linen Pleated Roman',
    description: 'Beautifully pleated organic linen Roman shades that bring soft, relaxed coastal farmhouse elegance to kitchens.',
    image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80',
    style: 'Roman',
    materials: ['Belgian Pure Flax Linen', 'Internal Roman Ribs']
  },
  {
    id: 'b7',
    name: 'Silver Solar Screen Roller',
    description: 'High-performance solar screen roller blinds that reduce 95% of incoming heat without blocking your views outside.',
    image: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=600&q=80',
    style: 'Roller',
    materials: ['Heat-Reflective Silver Fiber', 'Stainless Steel Chain']
  },
  {
    id: 'b8',
    name: 'Bespoke Alabaster Venetian',
    description: 'Glistening alabaster-white faux wood venetian blinds that resist water, ideal for luxury bathrooms and spas.',
    image: 'https://images.unsplash.com/photo-1449034446853-66c86144b0ad?auto=format&fit=crop&w=600&q=80',
    style: 'Venetian',
    materials: ['Faux-Wood Composite', 'Moisture-Safe Tape']
  },
  {
    id: 'b9',
    name: 'Somfy Motorized Smart Roman',
    description: 'Somfy battery-powered, cordless motorized Roman shades providing clean luxury styling and zero child hazards.',
    image: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=600&q=80',
    style: 'Motorized',
    materials: ['Somfy Cordless Motor', 'Natural Cotton Blend Fabric']
  },
  {
    id: 'b10',
    name: 'Textured Tweed Zebra Shade',
    description: 'Alternating sheer bands paired with warm grey textured tweed bands for an upscale corporate or loft aesthetic.',
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=600&q=80',
    style: 'Zebra',
    materials: ['Polyester Tweed Banding', 'Fine Sheer Netting']
  },
  {
    id: 'b11',
    name: 'Embossed Silk Roman Shade',
    description: 'Luxury pleated raw silk Roman shades that rise in perfect cascades, adding stately classical grace to dining rooms.',
    image: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=600&q=80',
    style: 'Roman',
    materials: ['Mulberry Silk Blend', 'Heavy-Weight Cotton Interlining']
  },
  {
    id: 'b12',
    name: 'Pure Basswood Venetian',
    description: 'Lightweight basswood venetian blinds stained in beautiful natural amber tones, offering exquisite rustic style.',
    image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=600&q=80',
    style: 'Venetian',
    materials: ['North American Basswood', 'High-Strength Cord']
  },
  {
    id: 'b13',
    name: 'Acoustic Suede Roller',
    description: 'Innovative roller shades backed with sound-damping suede lining to absorb high-frequency street noise completely.',
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80',
    style: 'Roller',
    materials: ['Acoustic Micro-Suede', 'Heavy Metal Weighted Bottom Bar']
  },
  {
    id: 'b14',
    name: 'Crestron-Linked Venetian',
    description: 'Precision motorized wooden blinds that integrate natively with Crestron smart panels to adjust slats based on sun angles.',
    image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=600&q=80',
    style: 'Motorized',
    materials: ['Crestron Smart Interface Motor', 'Premium Cedar Wood Slats']
  },
  {
    id: 'b15',
    name: 'Chic Linen Zebra Blinds',
    description: 'An eco-friendly zebra shade combining natural organic linen bands with sheer mesh for soft, warm filtered light.',
    image: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=600&q=80',
    style: 'Zebra',
    materials: ['Organic Flax Linen Bands', 'White Mesh Stripes']
  },
  {
    id: 'b16',
    name: 'Woven Woods Roman Blind',
    description: 'Bespoke Roman shades weaving together bamboo, reed, and organic grasses to cast textured organic shadow lines.',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=600&q=80',
    style: 'Roman',
    materials: ['Woven Bamboo & Reed Grasses', 'Unbleached Cotton Cord']
  },
  {
    id: 'b17',
    name: 'Brushed Charcoal Venetian',
    description: 'Ultra-thin, elegant aluminum slats brushed in charcoal color, perfect for minimalist, high-end design workspaces.',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80',
    style: 'Venetian',
    materials: ['Brushed Anodized Aluminum', 'Nylon-Reinforced Strings']
  },
  {
    id: 'b18',
    name: 'Soft Gray Roller Screen',
    description: 'A beautiful, clean grey roller blind that offers excellent daytime privacy while blocking 99% of dangerous UV rays.',
    image: 'https://images.unsplash.com/photo-1585412727339-54e4bae3bbf9?auto=format&fit=crop&w=600&q=80',
    style: 'Roller',
    materials: ['Fiberglass Core Screen', 'Sleek Chain System']
  },
  {
    id: 'b19',
    name: 'Intelligent Remote Roller',
    description: 'A quiet, battery-operated smart shade with high-speed charging, operable via handy wireless remote controllers.',
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
    style: 'Motorized',
    materials: ['Rechargeable Li-Ion Smart Motor', 'Anti-Glare Charcoal Cloth']
  },
  {
    id: 'b20',
    name: 'Modern Geometric Zebra',
    description: 'Zebra shades with sleek geometric printed stripes, adding a unique, highly artistic feature element to living spaces.',
    image: 'https://images.unsplash.com/photo-1578894381163-e72c17f2d45f?auto=format&fit=crop&w=600&q=80',
    style: 'Zebra',
    materials: ['Printed Woven Polyester', 'Slim Profile Frame']
  }
];
