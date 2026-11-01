import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Sparkles } from 'lucide-react';

// Official SVG Path for WhatsApp
export function WhatsAppIcon({ className = "h-5 w-5 fill-current" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      className={className} 
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
    </svg>
  );
}

// Global utility to open WhatsApp in a small focused popup window (never full new tab, never navigating current page)
export function openWhatsAppPopup(customMessage?: string) {
  const text = encodeURIComponent(
    customMessage || "Hi! I'm visiting Floating Drapes and would like to inquire about your luxury curtains, wallpapers, and blinds."
  );
  const whatsappUrl = `https://wa.me/918884009398?text=${text}`;
  
  const width = 520;
  const height = 680;
  const left = Math.max(0, Math.round(window.screenX + (window.outerWidth - width) / 2));
  const top = Math.max(0, Math.round(window.screenY + (window.outerHeight - height) / 2));

  // Small popup window attributes
  const popup = window.open(
    whatsappUrl,
    'WhatsAppDirectPopup',
    `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,resizable=yes,status=no,toolbar=no,menubar=no,location=no`
  );

  if (popup && !popup.closed) {
    popup.focus();
    return true;
  }
  return false;
}

export default function WhatsAppButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [messageText, setMessageText] = useState("Hi! I'm interested in your luxury curtains & wallpapers.");
  const popupRef = useRef<HTMLDivElement>(null);

  // Close on Escape or click outside
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        const floatingBtn = document.getElementById('whatsapp-floating-btn');
        if (floatingBtn && !floatingBtn.contains(e.target as Node)) {
          setIsOpen(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleStartChat = (customText?: string) => {
    openWhatsAppPopup(customText || messageText);
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 font-sans" id="floating-whatsapp-widget">
      
      {/* SMALL POPUP CARD (Appears smoothly above the button) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={popupRef}
            initial={{ opacity: 0, y: 15, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.94 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute bottom-16 right-0 w-80 sm:w-88 rounded-2xl overflow-hidden shadow-[0_12px_45px_rgba(0,0,0,0.28)] border border-emerald-500/20 bg-white text-zinc-800 z-50"
            id="whatsapp-small-popup"
          >
            {/* Header: WhatsApp signature style */}
            <div className="bg-[#075E54] text-white p-4 relative flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-white border border-white/20">
                    <WhatsAppIcon className="h-6 w-6 fill-white" />
                  </div>
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-[#25D366] border-2 border-[#075E54]" />
                </div>
                <div>
                  <h4 className="font-serif font-semibold text-sm leading-tight text-white flex items-center gap-1">
                    Floating Drapes
                    <Sparkles className="h-3 w-3 text-amber-300" />
                  </h4>
                  <p className="text-[11px] text-emerald-100/90 font-light">+91 88840 09398</p>
                </div>
              </div>

              {/* Close Button */}
              <button 
                type="button"
                onClick={() => setIsOpen(false)}
                className="h-7 w-7 rounded-full bg-black/15 hover:bg-black/30 flex items-center justify-center text-white/90 hover:text-white transition-colors cursor-pointer"
                title="Close popup"
                aria-label="Close"
              >
                <X className="h-4 w-4 stroke-[2.5]" />
              </button>
            </div>

            {/* Content Area */}
            <div className="p-4 bg-[#ECE5DD]/30 space-y-3">
              {/* Chat Bubble Message */}
              <div className="bg-white p-3 rounded-xl rounded-tl-none border border-black/5 shadow-xs text-xs text-zinc-700 leading-relaxed relative">
                <p className="font-normal">
                  Hello! 👋 Thank you for visiting <strong>Floating Drapes</strong>.
                </p>
                <p className="mt-1 text-[11px] text-zinc-500 font-light">
                  How can we help you today with your curtains, wallpapers, or blinds?
                </p>
                <span className="block text-[9px] text-zinc-400 text-right mt-1.5 font-mono">Just now</span>
              </div>

              {/* Quick Prompt Chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => handleStartChat("Hi! I would like to request fabric samples for curtains.")}
                  className="bg-white hover:bg-emerald-50 border border-zinc-200 hover:border-emerald-300 text-zinc-700 hover:text-emerald-700 text-[10px] px-2.5 py-1 rounded-full transition-colors cursor-pointer"
                >
                  Curtain Samples
                </button>
                <button
                  type="button"
                  onClick={() => handleStartChat("Hi! I would like to book a free home consultation.")}
                  className="bg-white hover:bg-emerald-50 border border-zinc-200 hover:border-emerald-300 text-zinc-700 hover:text-emerald-700 text-[10px] px-2.5 py-1 rounded-full transition-colors cursor-pointer"
                >
                  Home Consultation
                </button>
                <button
                  type="button"
                  onClick={() => handleStartChat("Hi! Please share pricing and catalog for wallpapers.")}
                  className="bg-white hover:bg-emerald-50 border border-zinc-200 hover:border-emerald-300 text-zinc-700 hover:text-emerald-700 text-[10px] px-2.5 py-1 rounded-full transition-colors cursor-pointer"
                >
                  Wallpaper Catalog
                </button>
              </div>

              {/* Editable Quick Message Input */}
              <div className="pt-1">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type your message..."
                  className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Primary Action Button: Takes user to WhatsApp via small popup window */}
              <button
                type="button"
                onClick={() => handleStartChat()}
                className="w-full flex items-center justify-center space-x-2 bg-[#25D366] hover:bg-[#20bd5a] text-white py-2.5 px-4 rounded-xl font-medium text-xs shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <WhatsAppIcon className="h-4.5 w-4.5 fill-white" />
                <span>Open WhatsApp Chat</span>
                <Send className="h-3.5 w-3.5 ml-1" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TRIGGER FLOATING WHATSAPP BUTTON */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-[0_4px_25px_rgba(37,211,102,0.45)] cursor-pointer relative transition-colors duration-200"
        title="WhatsApp (+91 88840 09398)"
        id="whatsapp-floating-btn"
        aria-label="Open WhatsApp Chat"
      >
        {!isOpen && (
          <span className="absolute inset-0 rounded-full border-2 border-[#25D366] animate-ping opacity-30 pointer-events-none" />
        )}
        {isOpen ? (
          <X className="h-6 w-6 stroke-[2.5]" />
        ) : (
          <WhatsAppIcon className="h-7 w-7 fill-white" />
        )}
      </motion.button>
    </div>
  );
}
