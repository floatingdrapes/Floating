import { motion } from 'motion/react';
import { Ruler, Palette, FileText, CheckSquare } from 'lucide-react';

export default function ProcessSection() {
  const steps = [
    {
      step: '01',
      title: 'Measurement',
      description: 'We visit your space and take precise measurements.',
      icon: Ruler,
    },
    {
      step: '02',
      title: 'Design & Selection',
      description: 'Explore designs, materials & get expert suggestions.',
      icon: Palette,
    },
    {
      step: '03',
      title: 'Quotation',
      description: 'Receive a transparent & competitive quotation.',
      icon: FileText,
    },
    {
      step: '04',
      title: 'Installation',
      description: 'Professional installation with perfect finishing.',
      icon: CheckSquare,
    },
  ];

  return (
    <section className="bg-white py-10 lg:py-14 border-b border-[#EAEAEA]" id="process-section">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        
        {/* Header Block */}
        <div className="text-center max-w-2xl mx-auto mb-20">
          <span className="font-sans text-[13px] font-semibold tracking-[0.25em] text-[#029BFA] uppercase mb-3 block">
            OUR PROCESS
          </span>
          <h2 className="font-serif text-[36px] sm:text-[42px] font-bold text-[#021E3B] leading-[1.2] uppercase">
            Simple Steps, Beautiful Results
          </h2>
          <div className="h-[3px] w-12 bg-[#029BFA] mx-auto mt-4" />
        </div>

        {/* Timeline Horizontal / Vertical */}
        <div className="relative mt-12" id="process-timeline">
          
          {/* Connecting Line (Desktop Only) */}
          <div className="hidden lg:block absolute top-[45px] left-[12%] right-[12%] h-[2px] bg-[#EAEAEA] z-0">
            <div className="absolute top-0 left-0 h-full bg-[#029BFA] w-[100%] transition-all" />
          </div>

          {/* Grid Layout for Steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 relative z-10">
            {steps.map((item, idx) => {
              const IconComponent = item.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  className="flex flex-col items-center text-center group"
                >
                  {/* Circular Icon Container */}
                  <div className="relative flex h-[90px] w-[90px] items-center justify-center rounded-full bg-[#FFFFFF] border-2 border-[#029BFA] text-[#029BFA] shadow-[0_10px_25px_rgba(2,155,250,0.1)] group-hover:bg-[#029BFA] group-hover:text-white transition-all duration-300">
                    <IconComponent className="h-8 w-8 stroke-[1.5]" />
                    
                    {/* Number tag below/beside */}
                    <div className="absolute -bottom-2 bg-[#021E3B] text-[#FFFFFF] text-[11px] font-bold px-3 py-0.5 rounded-full border border-white">
                      {item.step}
                    </div>
                  </div>

                  {/* Title and description */}
                  <div className="mt-8 space-y-2">
                    <h3 className="font-serif text-[20px] font-bold text-[#021E3B] group-hover:text-[#029BFA] transition-colors">
                      {item.title}
                    </h3>
                    <p className="font-sans text-[15px] font-light text-zinc-500 leading-[150%] max-w-[240px] mx-auto">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}
