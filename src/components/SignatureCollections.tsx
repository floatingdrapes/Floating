import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SIGNATURE_COLLECTIONS, SignatureCollection } from '../types';
import { ArrowRight, Sparkles } from 'lucide-react';
import OptimizedImage from './OptimizedImage';

interface SignatureProps {
  openBookingModal: () => void;
}

export default function SignatureCollections({ openBookingModal }: SignatureProps) {
  const [selectedCol, setSelectedCol] = useState<SignatureCollection | null>(null);

  // Map to apply the customized deep colored overlays specifying their color identity
  const overlayMap: Record<string, string> = {
    's1': 'bg-gradient-to-t from-red-950/90 via-red-950/45 to-black/20', // Luxe Drapes Burgundy Overlay
    's2': 'bg-gradient-to-t from-emerald-950/95 via-emerald-950/45 to-black/20', // Nature's Canvas Forest Green Overlay
    's3': 'bg-gradient-to-t from-stone-900/90 via-stone-800/45 to-black/20', // Modern Muse Warm Grey Overlay
    's4': 'bg-gradient-to-t from-blue-950/90 via-blue-900/45 to-black/20', // Royal Texture Dark Navy Overlay
    's5': 'bg-gradient-to-t from-amber-950/90 via-amber-900/45 to-black/20', // Minimal Chic Cream/Warm Gold Overlay
  };

  const getOverlayClass = (id: string) => {
    return overlayMap[id] || 'bg-black/60';
  };

  return (
    <section className="bg-luxury-sec py-20 lg:py-28 border-b border-white/5 text-white" id="signature-collections-section">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        
        {/* Header Block */}
        <div className="mb-14 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="font-sans text-[10px] font-bold tracking-[0.45em] text-gold uppercase mb-3 block">
              HANDPICKED. CURATED. TIMELESS.
            </span>
            <h2 className="font-serif text-3xl sm:text-4.5xl font-normal text-white">
              Signature Collections
            </h2>
            <div className="h-[2px] w-14 bg-gold mt-5" />
          </div>
          
          <button 
            onClick={openBookingModal}
            className="text-[10.5px] font-bold tracking-[0.25em] text-gold uppercase hover:text-white transition-colors duration-300 flex items-center space-x-2.5 self-start md:self-auto"
          >
            <span>VIEW ALL COLLECTIONS →</span>
          </button>
        </div>

        {/* 5 Collections Grid/Layout */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {SIGNATURE_COLLECTIONS.map((col, idx) => (
            <motion.div
              key={col.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: idx * 0.1, ease: 'easeOut' }}
              whileHover={{ y: -8 }}
              onClick={() => setSelectedCol(col)}
              className="group relative cursor-pointer overflow-hidden bg-zinc-900 border border-gold/15 aspect-[3/4.2] sm:aspect-[2/3] lg:aspect-[9/16.5] flex flex-col justify-between p-6.5 transition-all duration-500 hover:border-gold/50 hover:shadow-[0_15px_30px_rgba(0,0,0,0.4)]"
              id={`signature-card-${col.id}`}
            >
              {/* Image with zoom on hover */}
              <div className="absolute inset-0 z-0 overflow-hidden">
                <OptimizedImage
                  src={col.image}
                  alt={col.name}
                  width={600}
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-1000 ease-out brightness-[0.85]"
                />
                
                {/* Specific overlay for color identity specified in the requirements */}
                <div className={`absolute inset-0 transition-opacity duration-500 opacity-90 group-hover:opacity-100 ${getOverlayClass(col.id)}`} />
              </div>

              {/* Decorative Number Tag (01, 02, etc.) */}
              <div className="relative z-10 font-serif text-[38px] font-light tracking-normal text-gold/60 group-hover:text-gold group-hover:scale-105 transition-all duration-500 select-none leading-none">
                {String(idx + 1).padStart(2, '0')}
              </div>

              {/* Bottom Content Area */}
              <div className="relative z-10 flex items-end justify-between w-full">
                <div className="flex flex-col text-left">
                  <span className="font-sans text-[8.5px] font-bold tracking-widest text-gold uppercase mb-1">
                    {col.category} COLLECTION
                  </span>
                  <h3 className="font-serif text-xl font-normal leading-tight text-white group-hover:text-gold transition-colors duration-300">
                    {col.name}
                  </h3>
                </div>

                {/* Arrow Circle */}
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gold/30 bg-black/40 text-gold group-hover:bg-gold group-hover:text-luxury-bg group-hover:border-gold transition-all duration-500">
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>

              {/* Inner subtle decorative luxury frame border */}
              <div className="absolute inset-3 border border-gold/0 group-hover:border-gold/20 pointer-events-none transition-all duration-500" />
            </motion.div>
          ))}
        </div>
      </div>

      {/* QUICK EXPAND OVERLAY MODAL */}
      <AnimatePresence>
        {selectedCol && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
            onClick={() => setSelectedCol(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 30 }}
              transition={{ type: 'spring', duration: 0.6 }}
              className="relative w-full max-w-2xl rounded-2xl border border-[#d2e5f5] bg-[#F4F9FD] p-6 sm:p-10 text-[#002b49] overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
              id="signature-expanded-modal"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedCol(null)}
                className="absolute top-6 right-6 font-sans text-xs tracking-widest text-[#52779a] hover:text-[#0099ff] uppercase cursor-pointer"
              >
                CLOSE ✕
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                {/* Left image */}
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl border border-[#c5def2]">
                  <OptimizedImage
                    src={selectedCol.image}
                    alt={selectedCol.name}
                    width={800}
                    className="w-full h-full object-cover"
                  />
                  <div className={`absolute inset-0 ${getOverlayClass(selectedCol.id)} opacity-40`} />
                </div>

                {/* Right text contents */}
                <div className="flex flex-col space-y-4">
                  <div className="inline-flex items-center space-x-2">
                    <Sparkles className="h-4 w-4 text-[#0099ff]" />
                    <span className="font-sans text-[10px] font-bold tracking-[0.25em] text-[#0099ff] uppercase">{selectedCol.category} / EXCLUSIVE</span>
                  </div>
                  
                  <h3 className="font-serif text-3xl font-bold text-[#002b49]">
                    {selectedCol.name}
                  </h3>
                  
                  <p className="font-sans text-xs font-normal leading-relaxed text-[#335577]">
                    {selectedCol.description}
                  </p>

                  <div className="space-y-2 py-4 border-t border-b border-[#d8eaf7]">
                    <span className="font-serif text-xs italic text-[#006699] block">Bespoke Specifications:</span>
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-[#e3f2fd] border border-[#90cdf4] text-[9px] px-2.5 py-1 text-[#0077c2] font-semibold uppercase tracking-wider rounded-md">Premium Lining</span>
                      <span className="bg-[#e3f2fd] border border-[#90cdf4] text-[9px] px-2.5 py-1 text-[#0077c2] font-semibold uppercase tracking-wider rounded-md">Sound Shielding</span>
                      <span className="bg-[#e3f2fd] border border-[#90cdf4] text-[9px] px-2.5 py-1 text-[#0077c2] font-semibold uppercase tracking-wider rounded-md">Custom Fittings</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedCol(null);
                      openBookingModal();
                    }}
                    className="w-full bg-[#0099ff] hover:bg-[#0088ee] text-white py-3.5 text-xs font-bold tracking-widest uppercase rounded-lg shadow-md shadow-[#0099ff]/25 transition-all cursor-pointer"
                  >
                    BOOK TRIAL & CONSULTATION
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
