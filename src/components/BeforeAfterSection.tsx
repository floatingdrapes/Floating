import React, { useState, useRef, useEffect } from 'react';
import { Sliders, ChevronLeft, ChevronRight } from 'lucide-react';
import { getOptimizedImageUrl } from '../utils/imageUtils';
import { PortfolioItem, PORTFOLIO_DATA } from '../types';

interface CompareCardProps {
  key?: React.Key;
  beforeImage: string;
  afterImage: string;
  title: string;
  description: string;
}

function CompareCard({ beforeImage, afterImage, title, description }: CompareCardProps) {
  const [sliderPos, setSliderPos] = useState(50);
  const [containerWidth, setContainerWidth] = useState<number>(600);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    setContainerWidth(containerRef.current.getBoundingClientRect().width);

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(percentage);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches[0]) {
      handleMove(e.touches[0].clientX);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (e.buttons === 1) {
      handleMove(e.clientX);
    }
  };

  const handleRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSliderPos(Number(e.target.value));
  };

  return (
    <div className="flex flex-col bg-white rounded-[20px] overflow-hidden border border-[#EAEAEA] shadow-[0_10px_30px_rgba(2,30,59,0.04)] hover:shadow-[0_15px_40px_rgba(2,30,59,0.08)] transition-all duration-300 h-full">
      <div 
        ref={containerRef}
        className="relative aspect-[4/3] w-full overflow-hidden select-none cursor-ew-resize bg-zinc-100"
        onTouchMove={handleTouchMove}
        onMouseMove={handleMouseMove}
      >
        <img
          src={getOptimizedImageUrl(afterImage, 800, 75)}
          alt="After Transformation"
          className="absolute inset-0 h-full w-full object-cover pointer-events-none"
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
        />
        <div className="absolute right-4 bottom-4 z-10 bg-[#029BFA] text-white text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full shadow border border-white/20">
          AFTER
        </div>

        <div 
          className="absolute inset-y-0 left-0 overflow-hidden pointer-events-none"
          style={{ width: `${sliderPos}%` }}
        >
          <img
            src={getOptimizedImageUrl(beforeImage, 800, 75)}
            alt="Before Transformation"
            className="absolute inset-y-0 left-0 h-full object-cover max-w-none pointer-events-none"
            style={{ width: containerWidth, height: '100%' }}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
          />
          <div className="absolute left-4 bottom-4 z-10 bg-[#021E3B] text-white text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full shadow border border-white/15">
            BEFORE
          </div>
        </div>

        <div 
          className="absolute inset-y-0 w-[2px] bg-white cursor-ew-resize flex items-center justify-center pointer-events-none"
          style={{ left: `${sliderPos}%` }}
        >
          <div className="h-9 w-9 rounded-full bg-[#029BFA] text-white shadow-[0_0_15px_rgba(2,155,250,0.5)] flex items-center justify-center border-2 border-white transform -translate-x-1/2">
            <Sliders className="h-4 w-4 rotate-90" />
          </div>
        </div>

        <input 
          type="range" 
          min="0" 
          max="100" 
          value={sliderPos} 
          onChange={handleRangeChange} 
          className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
          aria-label="Before and after comparison slider"
        />
      </div>

      <div className="p-6 text-left space-y-2 flex-grow flex flex-col justify-between">
        <div>
          <h3 className="font-serif text-[20px] font-bold text-[#021E3B] leading-tight">
            {title}
          </h3>
          <p className="font-sans text-[14px] font-light text-zinc-500 leading-[150%] mt-2">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

interface BeforeAfterSectionProps {
  comparisons?: PortfolioItem[];
  subtitle?: string;
  title?: string;
}

export default function BeforeAfterSection({
  comparisons: propComparisons,
  subtitle = 'BEFORE & AFTER',
  title = 'See The Transformation'
}: BeforeAfterSectionProps) {
  const comparisons = (propComparisons && propComparisons.length > 0) 
    ? propComparisons 
    : PORTFOLIO_DATA;

  const [currentIndex, setCurrentIndex] = useState(0);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? comparisons.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % comparisons.length);
  };

  const getVisibleItems = () => {
    const items: PortfolioItem[] = [];
    for (let i = 0; i < comparisons.length; i++) {
      items.push(comparisons[(currentIndex + i) % comparisons.length]);
    }
    return items;
  };

  const visibleItems = getVisibleItems();

  return (
    <section className="bg-white py-10 lg:py-14 border-b border-[#EAEAEA]" id="before-after-section">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        
        {/* Header Block */}
        <div className="text-center max-w-2xl mx-auto">
          <span className="font-sans text-[13px] md:text-[14px] font-semibold tracking-[0.25em] text-[#029BFA] uppercase mb-3 block">
            {subtitle}
          </span>
          <h2 className="font-serif text-[36px] sm:text-[42px] font-bold text-[#021E3B] leading-[1.2] uppercase">
            {title}
          </h2>
          <div className="h-[3px] w-12 bg-[#029BFA] mx-auto mt-4" />
        </div>

        {/* Carousel Wrapper */}
        <div className="relative mt-12 max-w-6xl mx-auto" id="before-after-wrapper">
          {comparisons.length > 1 && (
            <>
              <div className="absolute top-1/2 -translate-y-1/2 -left-4 sm:-left-12 z-30 hidden sm:block">
                <button
                  onClick={prevSlide}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#021E3B] border border-[#EAEAEA] hover:border-[#029BFA] hover:text-[#029BFA] transition-all shadow-[0_4px_12px_rgba(0,0,0,0.05)] cursor-pointer"
                  aria-label="Previous transformation"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              </div>

              <div className="absolute top-1/2 -translate-y-1/2 -right-4 sm:-right-12 z-30 hidden sm:block">
                <button
                  onClick={nextSlide}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#021E3B] border border-[#EAEAEA] hover:border-[#029BFA] hover:text-[#029BFA] transition-all shadow-[0_4px_12px_rgba(0,0,0,0.05)] cursor-pointer"
                  aria-label="Next transformation"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </>
          )}

          {/* Desktop View: 3 items */}
          <div className="hidden lg:grid grid-cols-3 gap-8 items-stretch">
            {visibleItems.slice(0, 3).map((c) => (
              <CompareCard
                key={c.id}
                beforeImage={c.beforeImage}
                afterImage={c.afterImage}
                title={c.title}
                description={c.description}
              />
            ))}
          </div>

          {/* Tablet View: 2 items */}
          <div className="hidden md:grid lg:hidden grid-cols-2 gap-8 items-stretch">
            {visibleItems.slice(0, 2).map((c) => (
              <CompareCard
                key={c.id}
                beforeImage={c.beforeImage}
                afterImage={c.afterImage}
                title={c.title}
                description={c.description}
              />
            ))}
          </div>

          {/* Mobile View: 1 item */}
          <div className="md:hidden">
            {visibleItems[0] && (
              <CompareCard
                key={visibleItems[0].id}
                beforeImage={visibleItems[0].beforeImage}
                afterImage={visibleItems[0].afterImage}
                title={visibleItems[0].title}
                description={visibleItems[0].description}
              />
            )}
          </div>

          {/* Mobile Controls */}
          {comparisons.length > 1 && (
            <div className="flex justify-between items-center sm:hidden mt-6">
              <button
                onClick={prevSlide}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#021E3B] border border-[#EAEAEA] shadow-sm cursor-pointer"
                aria-label="Previous transformation"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <div className="flex items-center space-x-2">
                {comparisons.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                      currentIndex === idx ? 'w-6 bg-[#029BFA]' : 'w-2.5 bg-zinc-200'
                    }`}
                    aria-label={`Go to transformation ${idx + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={nextSlide}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#021E3B] border border-[#EAEAEA] shadow-sm cursor-pointer"
                aria-label="Next transformation"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}

          {/* Desktop/Tablet Dots */}
          {comparisons.length > 1 && (
            <div className="hidden sm:flex justify-center items-center space-x-2 mt-10">
              {comparisons.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                    currentIndex === idx ? 'w-6 bg-[#029BFA]' : 'w-2.5 bg-zinc-200 hover:bg-zinc-300'
                  }`}
                  aria-label={`Go to transformation ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
