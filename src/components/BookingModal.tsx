import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, CheckCircle, Calendar, PenTool, Check, MessageSquare } from 'lucide-react';
import { BookingSubmission } from '../types';
import { insertBookingToSupabase } from '../services/supabaseClient';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BookingModal({ isOpen, onClose }: BookingModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    preferredDate: '',
    projectType: 'Curtains Installation',
    budget: '', // Kept for type compatibility but removed from UI
    preferredCommunication: 'Call',
    whatsappNumber: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Calculate today's date in local time for the date picker minimum restriction
  const getLocalToday = () => {
    const today = new Date();
    return new Date(today.getTime() - (today.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      alert('Please provide your name and contact phone number.');
      return;
    }

    if (formData.preferredCommunication === 'WhatsApp' && !formData.whatsappNumber) {
      alert('Please provide your WhatsApp number for chat communication.');
      return;
    }

    setIsSubmitting(true);

    const contactMethodStr = formData.preferredCommunication === 'WhatsApp' 
      ? `WhatsApp Chat (Number: ${formData.whatsappNumber})` 
      : 'Phone Call';

    const finalMessage = `Preferred Contact Method: ${contactMethodStr}`;

    try {
      // Dispatch server-side SMTP email notification
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formType: 'Private Consultation Booking Form',
          formData: formData,
          result: `Preferred Date: ${formData.preferredDate || 'Flexible'}, Project Type: ${formData.projectType}, Contact Via: ${contactMethodStr}`
        })
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const responseData = await res.json();
      console.log('Server dispatched lead details:', responseData);

      const newSubmission: BookingSubmission = {
        id: 'b-' + Date.now(),
        name: formData.name,
        phone: formData.phone,
        preferredDate: formData.preferredDate,
        projectType: formData.projectType,
        budget: '', // Deprecated in UI
        message: finalMessage,
        timestamp: new Date().toISOString()
      };
      
      // Save to Supabase universally (if configured)
      await insertBookingToSupabase(newSubmission);

      const submissions: BookingSubmission[] = JSON.parse(localStorage.getItem('floatingdrapes_bookings') || '[]');
      submissions.push(newSubmission);
      localStorage.setItem('floatingdrapes_bookings', JSON.stringify(submissions));

      setIsSuccess(true);
      
      // Clean up fields
      setFormData({
        name: '',
        phone: '',
        preferredDate: '',
        projectType: 'Curtains Installation',
        budget: '',
        preferredCommunication: 'Call',
        whatsappNumber: '',
      });
    } catch (err) {
      console.error('Failed to dispatch notification:', err);
      // Fail gracefully so that network interruptions or unconfigured systems still allow local UI completion
      const fallbackSubmission: BookingSubmission = {
        id: 'b-' + Date.now(),
        name: formData.name,
        phone: formData.phone,
        preferredDate: formData.preferredDate,
        projectType: formData.projectType,
        budget: '',
        message: finalMessage,
        timestamp: new Date().toISOString()
      };
      insertBookingToSupabase(fallbackSubmission).catch(console.error);

      const submissions: BookingSubmission[] = JSON.parse(localStorage.getItem('floatingdrapes_bookings') || '[]');
      submissions.push(fallbackSubmission);
      localStorage.setItem('floatingdrapes_bookings', JSON.stringify(submissions));
      setIsSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const projectTypes = [
    'Curtains Installation',
    'Wallpaper Covering',
    'Complete Villa Styling',
    'Commercial Showcase',
    'Bespoke Automation Request'
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" id="booking-modal-overlay">
          {/* Dark blur backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/85 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Form Card */}
          <motion.div
            initial={{ scale: 0.95, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 30, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gold/25 bg-luxury-sec p-6 sm:p-10 shadow-[0_0_50px_rgba(200,165,106,0.25)] rounded-none text-white scrollbar-thin scrollbar-thumb-gold/20"
            id="booking-modal-card"
          >
            {/* Top Close Button - touch target optimized for mobile */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 sm:top-6 sm:right-6 p-2 text-muted-text hover:text-gold hover:bg-white/5 transition-all rounded-full z-20"
              aria-label="Close"
              id="close-booking-modal"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Success Layout */}
            {isSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center text-center py-8"
                id="booking-success-anim"
              >
                <div className="h-16 w-16 rounded-full bg-gold/10 border border-gold flex items-center justify-center text-gold mb-6 animate-bounce">
                  <CheckCircle className="h-8 w-8" />
                </div>
                <span className="font-sans text-[10px] tracking-[0.3em] text-gold uppercase mb-2">APPOINTMENT SECURED</span>
                <h3 className="font-serif text-2xl text-white mb-4">Your Private Consultation is Scheduled</h3>
                <p className="font-sans text-xs text-muted-text max-w-sm leading-relaxed mb-8">
                  Thank you. An interior concierge from Floating Drapes will contact you directly within 2 business hours to verify details and bring your material sample deck.
                </p>
                <button
                  onClick={() => {
                    setIsSuccess(false);
                    onClose();
                  }}
                  className="bg-gold hover:bg-gold-soft text-luxury-bg px-8 py-3.5 text-xs font-bold tracking-widest uppercase transition-colors"
                >
                  RETURN TO GALLERY
                </button>
              </motion.div>
            ) : (
              /* Regular Input Form */
              <div className="flex flex-col">
                <div className="mb-6 flex items-center space-x-2 text-gold">
                  <Sparkles className="h-4 w-4" />
                  <span className="font-sans text-[10px] font-bold tracking-[0.3em] uppercase">PRIVATE CONSULTATION</span>
                </div>

                <h3 className="font-serif text-2xl font-light text-white mb-2">
                  Begin Your <span className="italic text-gold">Bespoke Fitting</span>
                </h3>
                <p className="font-sans text-xs font-light text-muted-text mb-8 leading-relaxed">
                  Enter your details below. We bring a custom swatch palette directly to your location.
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Name field */}
                  <div>
                    <label className="block text-[9px] font-bold tracking-[0.2em] text-gold uppercase mb-2">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Countess Sterling"
                      className="w-full bg-white/5 border border-gold/15 px-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-gold transition-colors rounded-none"
                    />
                  </div>

                  {/* Phone field */}
                  <div>
                    <label className="block text-[9px] font-bold tracking-[0.2em] text-gold uppercase mb-2">Contact Phone *</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="e.g. +1 (555) 019-2831"
                      className="w-full bg-white/5 border border-gold/15 px-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-gold transition-colors rounded-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Preferred Date */}
                    <div>
                      <label className="block text-[9px] font-bold tracking-[0.2em] text-gold uppercase mb-2">
                        <span className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>Preferred Date</span>
                        </span>
                      </label>
                      <input
                        type="date"
                        min={getLocalToday()}
                        value={formData.preferredDate}
                        onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                        className="w-full bg-white/5 border border-gold/15 px-4 py-3 text-xs text-white focus:outline-none focus:border-gold transition-colors rounded-none [&::-webkit-calendar-picker-indicator]:invert"
                      />
                    </div>

                    {/* Project Type */}
                    <div>
                      <label className="block text-[9px] font-bold tracking-[0.2em] text-gold uppercase mb-2">
                        <span className="flex items-center space-x-1">
                          <PenTool className="h-3 w-3" />
                          <span>Project Type</span>
                        </span>
                      </label>
                      <select
                        value={formData.projectType}
                        onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                        className="w-full bg-luxury-sec border border-gold/15 px-3 py-3 text-xs text-white focus:outline-none focus:border-gold transition-colors rounded-none"
                      >
                        {projectTypes.map((type) => (
                          <option key={type} value={type} className="bg-luxury-sec text-white">{type}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Communication Preference */}
                  <div className="pt-2">
                    <label className="block text-[9px] font-bold tracking-[0.2em] text-gold uppercase mb-3">
                      Preferred Communication Method
                    </label>
                    <div className="flex items-center space-x-6">
                      <label className="flex items-center space-x-2.5 cursor-pointer group">
                        <div className={`h-4 w-4 border flex items-center justify-center transition-colors ${formData.preferredCommunication === 'Call' ? 'border-gold bg-gold/20' : 'border-gold/30 bg-transparent group-hover:border-gold/60'}`}>
                          {formData.preferredCommunication === 'Call' && <Check className="h-3 w-3 text-gold" />}
                        </div>
                        <span className="text-xs text-white">Phone Call</span>
                        <input 
                          type="radio" 
                          name="contactMethod"
                          value="Call" 
                          checked={formData.preferredCommunication === 'Call'}
                          onChange={(e) => setFormData({ ...formData, preferredCommunication: e.target.value })}
                          className="hidden" 
                        />
                      </label>
                      
                      <label className="flex items-center space-x-2.5 cursor-pointer group">
                        <div className={`h-4 w-4 border flex items-center justify-center transition-colors ${formData.preferredCommunication === 'WhatsApp' ? 'border-gold bg-gold/20' : 'border-gold/30 bg-transparent group-hover:border-gold/60'}`}>
                          {formData.preferredCommunication === 'WhatsApp' && <Check className="h-3 w-3 text-gold" />}
                        </div>
                        <span className="text-xs text-white">WhatsApp Chat</span>
                        <input 
                          type="radio" 
                          name="contactMethod"
                          value="WhatsApp" 
                          checked={formData.preferredCommunication === 'WhatsApp'}
                          onChange={(e) => setFormData({ ...formData, preferredCommunication: e.target.value })}
                          className="hidden" 
                        />
                      </label>
                    </div>
                  </div>

                  {/* WhatsApp Number Conditional Input */}
                  <AnimatePresence>
                    {formData.preferredCommunication === 'WhatsApp' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-1">
                          <label className="block text-[9px] font-bold tracking-[0.2em] text-gold uppercase mb-2">
                            <span className="flex items-center space-x-1">
                              <MessageSquare className="h-3 w-3" />
                              <span>WhatsApp Number *</span>
                            </span>
                          </label>
                          <input
                            type="tel"
                            required
                            value={formData.whatsappNumber}
                            onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                            placeholder="e.g. +1 (555) 019-2831"
                            className="w-full bg-white/5 border border-gold/15 px-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-gold transition-colors rounded-none"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gold hover:bg-gold-soft text-luxury-bg py-4 text-xs font-bold tracking-[0.2em] uppercase transition-colors flex items-center justify-center space-x-2 rounded-none disabled:opacity-50"
                      id="submit-booking-modal-btn"
                    >
                      {isSubmitting ? (
                        <span>TRANSMITTING SECURELY...</span>
                      ) : (
                        <span>CONFIRM BOOKING SESSION</span>
                      )}
                    </button>
                  </div>

                </form>
              </div>
            )}
            
            {/* Subtle floating particle glow */}
            <div className="absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-gold/5 blur-2xl pointer-events-none" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
