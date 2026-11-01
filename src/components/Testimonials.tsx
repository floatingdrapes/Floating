import { useState } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Testimonial, TESTIMONIALS_DATA } from '../types';
import CustomerAvatar from './CustomerAvatar';

interface TestimonialsProps {
  testimonials?: Testimonial[];
  subtitle?: string;
  title?: string;
}

export default function Testimonials({ 
  testimonials: propTestimonials,
  subtitle = 'CLIENT FEEDBACK',
  title = 'What Our Clients Say'
}: TestimonialsProps) {
  const testimonials = (propTestimonials && propTestimonials.length > 0) 
    ? propTestimonials 
    : TESTIMONIALS_DATA;

  const [currentIndex, setCurrentIndex] = useState(0);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  // Safe index for current item
  const currentItem = testimonials[currentIndex % testimonials.length] || testimonials[0];

  // Window of 3 for desktop if more than 3
  const getDesktopItems = () => {
    if (testimonials.length <= 3) return testimonials;
    const items: Testimonial[] = [];
    for (let i = 0; i < 3; i++) {
      items.push(testimonials[(currentIndex + i) % testimonials.length]);
    }
    return items;
  };

  const desktopTestimonials = getDesktopItems();

  return (
    <section className="bg-zinc-50 py-10 lg:py-14 border-b border-[#EAEAEA]" id="testimonials-section">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        
        {/* Header Block (Dynamically controlled via Admin Panel & Supabase) */}
        <div className="text-center max-w-2xl mx-auto mb-16 relative">
          <span className="font-sans text-[13px] font-semibold tracking-[0.25em] text-[#029BFA] uppercase mb-3 block">
            {subtitle}
          </span>
          <h2 className="font-serif text-[36px] sm:text-[42px] font-bold text-[#021E3B] leading-[1.2] uppercase">
            {title}
          </h2>
          <div className="h-[3px] w-12 bg-[#029BFA] mx-auto mt-4" />
        </div>

        {/* Carousel Container */}
        <div className="relative mt-12 max-w-6xl mx-auto" id="testimonials-wrapper">
          
          {/* NAVIGATION ARROWS */}
          {testimonials.length > 1 && (
            <>
              <div className="absolute top-1/2 -translate-y-1/2 -left-4 sm:-left-12 z-10 hidden sm:block">
                <button
                  onClick={prevSlide}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#021E3B] border border-[#EAEAEA] hover:border-[#029BFA] hover:text-[#029BFA] transition-all shadow-[0_4px_12px_rgba(0,0,0,0.05)] cursor-pointer"
                  aria-label="Previous feedback"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              </div>

              <div className="absolute top-1/2 -translate-y-1/2 -right-4 sm:-right-12 z-10 hidden sm:block">
                <button
                  onClick={nextSlide}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#021E3B] border border-[#EAEAEA] hover:border-[#029BFA] hover:text-[#029BFA] transition-all shadow-[0_4px_12px_rgba(0,0,0,0.05)] cursor-pointer"
                  aria-label="Next feedback"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </>
          )}

          {/* Desktop View: Grid of 3 (or fewer) */}
          <div className={`hidden lg:grid ${desktopTestimonials.length === 1 ? 'grid-cols-1 max-w-xl mx-auto' : desktopTestimonials.length === 2 ? 'grid-cols-2 max-w-4xl mx-auto' : 'grid-cols-3'} gap-8`}>
            {desktopTestimonials.map((item) => (
              <motion.div
                key={item.id}
                whileHover={{ y: -6 }}
                className="relative bg-white rounded-[20px] p-8 border border-[#EAEAEA] flex flex-col justify-between text-left transition-all duration-300"
                style={{ boxShadow: '0px 10px 30px rgba(2,30,59,0.04)' }}
              >
                {/* Decorative Quote Icon */}
                <div className="absolute top-6 right-6 text-zinc-100 pointer-events-none">
                  <Quote className="h-10 w-10 fill-current text-[#029BFA]/10" />
                </div>

                <div className="space-y-6">
                  {/* Rating stars */}
                  <div className="flex items-center space-x-1">
                    {[...Array(Math.max(1, Math.min(5, item.rating || 5)))].map((_, i) => (
                      <Star key={i} className="h-4.5 w-4.5 fill-[#029BFA] text-[#029BFA]" />
                    ))}
                  </div>

                  {/* Review Text */}
                  <p className="font-sans text-[15px] font-light text-zinc-600 leading-[160%] italic">
                    "{item.review}"
                  </p>
                </div>

                {/* Profile Details Block with Avatar Fallback */}
                <div className="mt-8 pt-6 border-t border-[#F5F5F5] flex items-center space-x-4">
                  <CustomerAvatar 
                    name={item.name} 
                    image={item.image} 
                    size="md" 
                  />
                  <div>
                    <h4 className="font-serif text-[16px] font-bold text-[#021E3B]">
                      {item.name}
                    </h4>
                    <p className="font-sans text-[11px] font-medium text-[#029BFA] uppercase tracking-wide mt-0.5">
                      {item.role ? `${item.role} • ${item.location}` : item.location}
                    </p>
                  </div>
                </div>

              </motion.div>
            ))}
          </div>

          {/* Tablet & Mobile View: Carousel Card */}
          <div className="lg:hidden" id="testimonials-carousel-mobile">
            <AnimatePresence mode="wait">
              {currentItem && (
                <motion.div 
                  key={currentItem.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  className="bg-white rounded-[20px] p-8 border border-[#EAEAEA] flex flex-col justify-between text-left shadow-[0_10px_30px_rgba(2,30,59,0.04)] relative min-h-[280px]"
                >
                  <div className="absolute top-6 right-6 text-zinc-100 pointer-events-none">
                    <Quote className="h-10 w-10 fill-current text-[#029BFA]/10" />
                  </div>

                  <div className="space-y-4">
                    {/* Rating stars */}
                    <div className="flex items-center space-x-1">
                      {[...Array(Math.max(1, Math.min(5, currentItem.rating || 5)))].map((_, i) => (
                        <Star key={i} className="h-4.5 w-4.5 fill-[#029BFA] text-[#029BFA]" />
                      ))}
                    </div>

                    <p className="font-sans text-[15px] font-light text-zinc-600 leading-[160%] italic">
                      "{currentItem.review}"
                    </p>
                  </div>

                  <div className="mt-8 pt-6 border-t border-[#F5F5F5] flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <CustomerAvatar 
                        name={currentItem.name} 
                        image={currentItem.image} 
                        size="md" 
                      />
                      <div>
                        <h4 className="font-serif text-[16px] font-bold text-[#021E3B]">
                          {currentItem.name}
                        </h4>
                        <p className="font-sans text-[11px] font-medium text-[#029BFA] uppercase tracking-wide mt-0.5">
                          {currentItem.role ? `${currentItem.role} • ${currentItem.location}` : currentItem.location}
                        </p>
                      </div>
                    </div>

                    {/* Mobile controls inside card */}
                    {testimonials.length > 1 && (
                      <div className="flex items-center space-x-2 sm:hidden">
                        <button
                          onClick={prevSlide}
                          className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FFFFFF] border border-[#EAEAEA] text-[#021E3B] cursor-pointer"
                          aria-label="Previous"
                        >
                          <ChevronLeft className="h-4.5 w-4.5" />
                        </button>
                        <button
                          onClick={nextSlide}
                          className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FFFFFF] border border-[#EAEAEA] text-[#021E3B] cursor-pointer"
                          aria-label="Next"
                        >
                          <ChevronRight className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    )}
                  </div>

                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Dots Indicator */}
          {testimonials.length > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-8 lg:hidden">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                    currentIndex % testimonials.length === idx ? 'w-6 bg-[#029BFA]' : 'w-2.5 bg-zinc-200'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          )}

        </div>

      </div>
    </section>
  );
}
