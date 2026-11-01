import React, { useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, MessageSquare, ZoomIn } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { normalizeGoogleDriveUrl } from '../utils/googleDrive';

export interface ProductPreviewItem {
  id: string;
  name: string;
  image: string;
  description?: string;
  priceClass?: string;
  style?: string;
  materials?: string[];
}

interface ProductImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductPreviewItem | null;
  productsList: ProductPreviewItem[];
  onSelectProduct: (product: ProductPreviewItem) => void;
  categoryName: string;
  onInquire?: (productName: string, category: string) => void;
}

export const ProductImageModal: React.FC<ProductImageModalProps> = ({
  isOpen,
  onClose,
  product,
  productsList,
  onSelectProduct,
  categoryName,
  onInquire
}) => {
  const currentIndex = product ? productsList.findIndex(p => p.id === product.id) : -1;
  const hasMultiple = productsList.length > 1;

  const handleNext = useCallback(() => {
    if (!hasMultiple || currentIndex === -1) return;
    const nextIdx = (currentIndex + 1) % productsList.length;
    onSelectProduct(productsList[nextIdx]);
  }, [currentIndex, hasMultiple, onSelectProduct, productsList]);

  const handlePrev = useCallback(() => {
    if (!hasMultiple || currentIndex === -1) return;
    const prevIdx = (currentIndex - 1 + productsList.length) % productsList.length;
    onSelectProduct(productsList[prevIdx]);
  }, [currentIndex, hasMultiple, onSelectProduct, productsList]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    // Prevent background scrolling while modal is open
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, handleNext, handlePrev]);

  if (!isOpen || !product) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="product-image-modal"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 z-[90] flex flex-col items-center justify-between p-3 sm:p-6 bg-black/92 backdrop-blur-md select-none"
        onClick={onClose}
        id="product-image-popup-overlay"
      >
        {/* TOP TOOLBAR: Category & Counter + Small Cross Close Icon */}
        <div 
          className="w-full max-w-6xl flex items-center justify-between py-2 px-1 text-white z-20"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center space-x-3">
            <span className="font-sans text-[11px] font-bold tracking-[0.25em] text-[#0099ff] uppercase bg-[#0099ff]/15 px-3 py-1 rounded-md border border-[#0099ff]/30">
              {categoryName.toUpperCase()} FULL VIEW
            </span>
            {currentIndex !== -1 && (
              <span className="font-sans text-xs text-white/60 font-medium">
                {currentIndex + 1} of {productsList.length}
              </span>
            )}
          </div>

          {/* SMALL CROSS ICON FOR CLOSING */}
          <button
            onClick={onClose}
            className="group flex items-center justify-center p-2 sm:p-2.5 rounded-full bg-white/10 hover:bg-red-600/80 text-white/90 hover:text-white transition-all cursor-pointer border border-white/20 hover:border-red-500 shadow-lg"
            title="Close image pop-up (Esc)"
            aria-label="Close image popup"
            id="close-product-popup-button"
          >
            <X className="h-5 w-5 group-hover:scale-110 transition-transform" />
          </button>
        </div>

        {/* CENTER STAGE: Image + Prev/Next Controls */}
        <div 
          className="relative w-full max-w-6xl flex-grow flex items-center justify-center my-auto min-h-0 py-2"
          onClick={(e) => e.stopPropagation()}
        >
          {/* PREVIOUS BUTTON */}
          {hasMultiple && (
            <button
              onClick={handlePrev}
              className="absolute left-2 sm:left-4 z-20 flex h-11 w-11 sm:h-13 sm:w-13 items-center justify-center rounded-full bg-black/60 hover:bg-[#0099ff] text-white border border-white/20 hover:border-[#0099ff] transition-all shadow-xl cursor-pointer hover:scale-110 active:scale-95"
              title="Previous product (Left arrow)"
              aria-label="Previous product"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          {/* THE WHOLE POP-UP IMAGE CONTAINER */}
          <motion.div 
            key={product.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="relative flex items-center justify-center max-h-[72vh] sm:max-h-[78vh] max-w-full overflow-hidden rounded-2xl shadow-[0_25px_70px_rgba(0,0,0,0.9)] border border-white/10 bg-[#021326]"
          >
            <img
              src={normalizeGoogleDriveUrl(product.image)}
              alt={product.name}
              className="w-auto h-auto max-h-[72vh] sm:max-h-[78vh] max-w-full object-contain pointer-events-none"
              loading="eager"
              referrerPolicy="no-referrer"
            />
          </motion.div>

          {/* NEXT BUTTON */}
          {hasMultiple && (
            <button
              onClick={handleNext}
              className="absolute right-2 sm:right-4 z-20 flex h-11 w-11 sm:h-13 sm:w-13 items-center justify-center rounded-full bg-black/60 hover:bg-[#0099ff] text-white border border-white/20 hover:border-[#0099ff] transition-all shadow-xl cursor-pointer hover:scale-110 active:scale-95"
              title="Next product (Right arrow)"
              aria-label="Next product"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}
        </div>

        {/* BOTTOM DETAILS BAR */}
        <div 
          className="w-full max-w-4xl bg-[#031d38]/90 border border-white/15 rounded-2xl p-4 sm:p-5 text-white shadow-2xl backdrop-blur-md z-20 flex flex-col sm:flex-row items-center justify-between gap-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-center sm:text-left space-y-1">
            <div className="flex items-center justify-center sm:justify-start space-x-2">
              <h3 className="font-serif text-lg sm:text-xl font-bold text-white">
                {product.name}
              </h3>
              {(product.priceClass || product.style) && (
                <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-[#0099ff]/20 text-[#66ccff] border border-[#0099ff]/40">
                  {product.priceClass || product.style}
                </span>
              )}
            </div>
            {product.description && (
              <p className="font-sans text-xs text-white/70 max-w-xl line-clamp-1 sm:line-clamp-2">
                {product.description}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            {onInquire && (
              <button
                onClick={() => onInquire(product.name, categoryName)}
                className="bg-[#0099ff] hover:bg-[#0088ee] text-white px-4 py-2 sm:py-2.5 text-xs font-bold tracking-wider uppercase rounded-lg shadow-md shadow-[#0099ff]/30 flex items-center space-x-2 transition-all hover:scale-105 cursor-pointer"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span>Inquire on WhatsApp</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="bg-white/10 hover:bg-white/20 text-white px-3.5 py-2 sm:py-2.5 text-xs font-bold tracking-wider uppercase rounded-lg border border-white/20 transition-colors cursor-pointer"
              title="Close image pop-up"
            >
              Close (✕)
            </button>
          </div>
        </div>

      </motion.div>
    </AnimatePresence>
  );
};

export default ProductImageModal;
