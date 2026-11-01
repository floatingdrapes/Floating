import { motion } from 'motion/react';
import { Check, Award, Compass, Heart, Ruler, FileText, Wrench, Shield, Users, Edit } from 'lucide-react';

export default function PremiumFeaturesStrip() {
  const reasons = [
    {
      icon: Award,
      title: '12+ Years of Expertise',
      desc: 'Over a decade of industry-leading experience in premium interior solutions.'
    },
    {
      icon: Compass,
      title: 'Personalized Design Consultation',
      desc: 'Expert recommendations tailored to match your specific style and theme.'
    },
    {
      icon: Heart,
      title: 'Touch & Feel Product Experience',
      desc: 'Explore high-end fabrics, patterns, and wallpapers at our experience center.'
    },
    {
      icon: Ruler,
      title: 'On-Site Measurement',
      desc: 'We visit your space to take exact measurements for an absolute precision fit.'
    },
    {
      icon: FileText,
      title: 'Transparent Quotations',
      desc: 'Clear, honest pricing with absolutely zero hidden costs.'
    },
    {
      icon: Wrench,
      title: 'Professional Installation',
      desc: 'Highly trained in-house artisans handle perfect alignment and steaming.'
    },
    {
      icon: Shield,
      title: 'Premium Quality Materials',
      desc: 'Sourced from legendary weavers and certified high-durability manufacturers.'
    },
    {
      icon: Users,
      title: 'Dedicated Customer Support',
      desc: 'Attentive post-installation follow-ups and complete satisfaction checks.'
    },
    {
      icon: Edit,
      title: 'Customized Interior Solutions',
      desc: 'Bespoke tailoring, custom patterns, and modular motorization integrations.'
    }
  ];

  return (
    <section className="bg-luxury-sec py-20 lg:py-28 border-b border-white/5 relative" id="why-choose-us-section">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(200,165,106,0.04),transparent_50%)]" />
      
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 relative z-10">
        
        {/* Section Header */}
        <div className="mb-16 text-center">
          <span className="font-sans text-[10px] font-bold tracking-[0.4em] text-gold uppercase mb-2 block">
            UNCOMPROMISING STANDARDS
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-normal text-white uppercase tracking-wide">
            Why Choose Floating Drapes?
          </h2>
          <div className="mx-auto h-[2px] w-14 bg-gold mt-4" />
        </div>

        {/* 3x3 Bento Grid of Reasons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {reasons.map((el, i) => {
            const Icon = el.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                whileHover={{ y: -4 }}
                className="group relative p-8 bg-luxury-bg border border-white/5 hover:border-gold/30 hover:shadow-[0_12px_24px_rgba(200,165,106,0.04)] transition-all duration-300 flex flex-col justify-between"
                id={`why-choose-card-${i}`}
              >
                {/* Subtle Glow */}
                <div className="absolute inset-0 bg-gradient-to-b from-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                {/* Corner Accents */}
                <div className="absolute top-2 right-2 h-1 w-1 border-t border-r border-gold/20 group-hover:border-gold/40 transition-colors" />
                <div className="absolute bottom-2 left-2 h-1 w-1 border-b border-l border-gold/20 group-hover:border-gold/40 transition-colors" />

                <div>
                  {/* Top line header */}
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/20 bg-gold/5 text-gold group-hover:bg-gold group-hover:text-luxury-bg group-hover:border-gold transition-all duration-300 shrink-0">
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <h3 className="font-serif text-base font-normal tracking-wide text-white group-hover:text-gold transition-colors duration-300">
                      {el.title}
                    </h3>
                  </div>
                  
                  {/* description */}
                  <p className="font-sans text-xs font-light text-muted-text leading-relaxed">
                    {el.desc}
                  </p>
                </div>

                {/* Little tick sign in the corner */}
                <div className="mt-4 flex justify-end">
                  <span className="text-[10px] font-sans font-bold tracking-widest text-gold opacity-50 group-hover:opacity-100 transition-opacity">
                    ✓ PREMIUM
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
